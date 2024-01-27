import { AVAILABLE_LEVELS, AvailableLevels, SCALE } from "../constants";
import { ExitManager } from "../objects/ExitManager/ExitManager";
import { HUDController } from "../objects/HUDController";
import { KillZone } from "../objects/KillZone/KillZone";
import { ChildMovementController } from "../objects/SickChild/ChildMovementController";
import { SickChild } from "../objects/SickChild/SickChild";
import { BasicSoldier } from "../objects/Soliders/BasicSoldier/BasicSoldier";
import { Sniper } from "../objects/Soliders/Sniper";
import { TilemapObjectsManager } from "../objects/TilemapObjectsManager/TilemapObjectsManager";
import { GameOverScene } from "./GameOverScene";
import { assertExistence } from "../utils/assertExistence/assertExistence";
import { TombStonesManager } from "../objects/TombStonesManager/TombStonesManager";

interface MapLayers {
  ground: Phaser.Tilemaps.TilemapLayer;
  barriers: Phaser.Tilemaps.TilemapLayer;
  collisionUnder: Phaser.Tilemaps.TilemapLayer;
  collisionAbove: Phaser.Tilemaps.TilemapLayer;
}

export class GameScene extends Phaser.Scene {
  public static start(scene: Phaser.Scene, level: AvailableLevels) {
    scene.scene.start("GameScene", { level });
  }

  private keys!: Phaser.Types.Input.Keyboard.CursorKeys;
  private map!: Phaser.Tilemaps.Tilemap;
  private tilemapObjectsManager!: TilemapObjectsManager;
  private tombStonesManager!: TombStonesManager;

  private mapLayers!: MapLayers;

  public constructor() {
    super({
      key: "GameScene",
    });
  }

  private bullets!: Phaser.GameObjects.Group;
  private soldiers!: Phaser.GameObjects.Group;
  private sickChildren!: Phaser.GameObjects.Group;
  private killZones!: Phaser.GameObjects.Group;
  private hud!: HUDController;
  private level!: AvailableLevels;

  private exitManager!: ExitManager;

  private mapCollidersGroup!: Phaser.Physics.Arcade.Group;

  private canChildLaugh = true;

  private createMap(level: AvailableLevels) {
    this.map = this.make.tilemap({ key: level });
    this.tilemapObjectsManager = new TilemapObjectsManager(this.map);

    // The first parameter is the name of the tileset in Tiled and the second parameter is the key
    // of the tileset image used when loading the file in preload.
    const tiles = this.map.addTilesetImage("tilemap", "tilemap")!;

    this.mapLayers = {} as MapLayers;

    this.mapLayers.ground = this.map.createLayer("Ground", tiles, 0, 0)!;
    this.mapLayers.ground.setScale(SCALE);
    this.mapLayers.ground.setDepth(-10);

    this.mapLayers.barriers = this.map.createLayer("Barriers", tiles, 0, 0)!;
    this.mapLayers.barriers.setScale(SCALE);
    this.mapLayers.barriers.setDepth(-8);

    this.mapLayers.collisionUnder = this.map.createLayer("No Collision Under Player", tiles, 0, 0)!;
    this.mapLayers.collisionUnder.setScale(SCALE);
    this.mapLayers.collisionUnder.setDepth(-9);

    this.mapLayers.collisionAbove = this.map.createLayer("No Collision Above Player", tiles, 0, 0)!;
    this.mapLayers.collisionAbove.setScale(SCALE);
    this.mapLayers.collisionAbove.setDepth(1);

    this.physics.world.setBounds(0, 0, this.map.widthInPixels * SCALE, this.map.heightInPixels * SCALE);
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels * SCALE, this.map.heightInPixels * SCALE);
  }

  public create({ level }: { level: AvailableLevels }): void {
    assertExistence(level);
    this.level = level;
    this.createMap(level);

    // Setup keys
    this.keys = this.input.keyboard!.createCursorKeys();

    this.tombStonesManager = new TombStonesManager(this);
    this.sickChildren = this.physics.add.group({});

    this.mapCollidersGroup = this.physics.add.group();
    this.tilemapObjectsManager.objects.colliders.forEach((colliderData) => {
      const width = colliderData.width * SCALE;
      const height = colliderData.height * SCALE;
      const x = colliderData.x * SCALE;
      const y = colliderData.y * SCALE;

      const collider = this.mapCollidersGroup.create(0, 0) as Phaser.Physics.Arcade.Sprite;
      const colliderBody = collider.body as Phaser.Physics.Arcade.Body;

      collider.setOrigin(0, 0);
      collider.setSize(width, height);
      collider.setOffset(x, y);
      collider.setVisible(false);
      colliderBody.setImmovable(true);
    });

    // Create SickChild instances
    this.tilemapObjectsManager.objects.players.forEach((playerPosition, childIdx) => {
      const sickChild = new SickChild(
        this,
        new Phaser.Math.Vector2(playerPosition.x * SCALE, playerPosition.y * SCALE),
        this.keys,
        childIdx,
        playerPosition.sprite,
        playerPosition.initialDirection,
      );

      sickChild.on("death", this.handleChildDeath(sickChild));
      this.sickChildren.add(sickChild.sprite);

      this.physics.add.collider(sickChild.sprite, this.mapCollidersGroup);
    });
    this.hud = new HUDController(this, this.sickChildren);

    this.cameras.main.startFollow(this.sickChildren.getChildren()[0]);
    this.cameras.main.stopFollow();

    // Manage exit
    this.exitManager = new ExitManager(this, this.tilemapObjectsManager.objects.exitTriggers);

    this.bullets = this.physics.add.group({});
    this.soldiers = this.physics.add.group({});
    this.killZones = this.physics.add.group({});

    // CREATE BASIC SOLDIERS
    this.tilemapObjectsManager.objects.basicSoldiers.forEach((soldierData) => {
      const soldierKillZone = new KillZone();
      const soldier = new BasicSoldier(
        this,
        new Phaser.Math.Vector2(soldierData.x * SCALE, soldierData.y * SCALE),
        this.bullets,
        soldierData.options,
        soldierData.sprite,
        soldierKillZone,
      );

      this.killZones.add(soldierKillZone.zone);
      this.soldiers.add(soldier.sprite);
    });

    // CREATE SNIPERS
    this.tilemapObjectsManager.objects.snipers.forEach((sniperData) => {
      const sniperKillZone = new KillZone();
      const sniper = new Sniper(
        this,
        new Phaser.Math.Vector2(sniperData.x * SCALE, sniperData.y * SCALE),
        this.bullets,
        sniperData.options,
        sniperData.sprite,
        sniperKillZone,
      );

      sniper.trackTargetGroup(this.sickChildren);
      sniper.trackBarriers(this.mapCollidersGroup);

      this.killZones.add(sniperKillZone.zone);
      this.soldiers.add(sniper.sprite);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.physics.add.collider(this.sickChildren, this.bullets, (sickChildObj: any, bulletObj: any) => {
      sickChildObj.getData("ref")?.onHit(bulletObj.getData("ref"));
      if (!bulletObj.getData("hp") || bulletObj.getData("hp") <= 1) {
        bulletObj.getData("ref")?.destroy();
      } else {
        bulletObj.setData("hp", bulletObj.getData("hp") - 1);
      }
    });
    this.physics.add.collider(
      this.mapCollidersGroup,
      this.bullets,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (_mapCollidersGroupElement: any, bulletObj: any) => {
        bulletObj.getData("ref")?.destroy();
      },
    );

    new ChildMovementController(this, this.sickChildren, this.hud);

    this.sickChildren.getChildren().forEach((childObj) => {
      const child: SickChild = childObj.getData("ref");

      this.physics.add.overlap(child.sprite, this.exitManager.getExitGroup(), () => {
        this.hud.setState("saved", parseInt(child.getControlKey()) - 1);
        child.winLevel();

        if (this.sickChildren.getLength() === 0) {
          this.handleLevelWin();
        }
      });
    });
  }

  update(_time: number, delta: number) {
    this.bullets?.getChildren().forEach((b) => b.getData("ref").update());
    this.soldiers?.getChildren().forEach((b) => b.getData("ref").update(delta));

    this.sickChildren.getChildren().forEach((childObj) => {
      const child: SickChild = childObj.getData("ref");
      child.update();

      // Check for children in kill zones
      this.killZones.getChildren().forEach((killZoneObj) => {
        const killZone: KillZone = killZoneObj.getData("ref");

        this.sickChildren.getChildren().forEach((childObj) => {
          const child: SickChild = childObj.getData("ref");

          if (!child.controlled) {
            return;
          }

          const isChildInKillZone = this.physics.overlap(killZone.zone, child.sprite);

          if (isChildInKillZone) {
            const isNotActiveZone = !killZone.zone.getData("isActive");

            if (isNotActiveZone) {
              killZone.zone.setData("isActive", true);
              killZone.healthBar.show();
            }
          } else {
            const isActiveZone = killZone.zone.getData("isActive");

            if (isActiveZone) {
              killZone.zone.setData("isActive", false);
              killZone.healthBar.hide();
            }
          }
        });
      });
    });

    this.cameras.main.setZoom(0.6);

    if (this.keys.space.isDown) {
      console.log("SPACE");
      if (!this.canChildLaugh) return;
      this.canChildLaugh = false;
      this.time.addEvent({
        delay: 1000,
        callback: () => {
          this.canChildLaugh = true;
        },
      });

      this.soldiers.getChildren().forEach((soldierObj) => {
        const soldier = soldierObj.getData("ref") as BasicSoldier | Sniper;
        if (soldier.killZone.zone.getData("isActive")) {
          soldier?.onHit?.();
        }
      });
    }
  }

  handleChildDeath = (child: SickChild) => () => {
    this.tombStonesManager.addTombStone(child.sprite.x, child.sprite.y + child.sprite.displayHeight * (1 / 3));

    if (this.sickChildren.getLength() > 0) {
      this.hud.setState("dead", parseInt(child.getControlKey()) - 1);
    } else {
      GameOverScene.run(this, this.level);
    }
  };

  handleLevelWin = () => {
    const currentLevelIndex = AVAILABLE_LEVELS.indexOf(this.level);
    const nextLevel = AVAILABLE_LEVELS[currentLevelIndex + 1];
    GameScene.start(this, nextLevel);
  };
}
