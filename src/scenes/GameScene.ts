import { CHANGE_PLAYER_VIEW_TIME, SCALE } from "../constants";
import { SickChild } from "../objects/SickChild/SickChild";
import { BasicSoldier } from "../objects/Soliders/BasicSoldier/BasicSoldier";
import { TilemapObjectsManager } from "../objects/TilemapObjectsManager/TilemapObjectsManager";
import { ChildMovementController } from "../objects/SickChild/ChildMovementController";
import { Sniper } from "../objects/Soliders/Sniper";
import { HUDController } from "../objects/HUDController";
import { intersects } from "../utils/intersects/intersects";
import { ExitManager } from "../objects/ExitManager/ExitManager";

interface MapLayers {
  ground: Phaser.Tilemaps.TilemapLayer;
  barriers: Phaser.Tilemaps.TilemapLayer;
  collisionUnder: Phaser.Tilemaps.TilemapLayer;
  collisionAbove: Phaser.Tilemaps.TilemapLayer;
}

export class GameScene extends Phaser.Scene {
  private keys!: Phaser.Types.Input.Keyboard.CursorKeys;
  private map!: Phaser.Tilemaps.Tilemap;
  private tilemapObjectsManager!: TilemapObjectsManager;

  private mapLayers!: MapLayers;

  public constructor() {
    super({
      key: "GameScene",
    });
  }

  private bullets!: Phaser.GameObjects.Group;
  private soldiers!: Phaser.GameObjects.Group;
  private sickChildren!: Phaser.GameObjects.Group;
  private hud!: HUDController;

  private exitManager!: ExitManager;
  private exit!: Phaser.GameObjects.Text;

  private startingChildCount!: number;
  private mapCollidersGroup!: Phaser.Physics.Arcade.Group;

  private createMap() {
    this.map = this.make.tilemap({ key: "tilemap" });
    this.tilemapObjectsManager = new TilemapObjectsManager(this.map);

    // The first parameter is the name of the tileset in Tiled and the second parameter is the key
    // of the tileset image used when loading the file in preload.
    const tiles = this.map.addTilesetImage("tilemap", "base_tiles")!;

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

  public create(): void {
    this.createMap();

    // Setup keys
    this.keys = this.input.keyboard!.createCursorKeys();

    this.sickChildren = this.physics.add.group({});

    this.startingChildCount = this.tilemapObjectsManager.players.length;

    this.hud = new HUDController(this.startingChildCount);
    this.scene.run("HUDScene", { controller: this.hud });
    this.mapCollidersGroup = this.physics.add.group();
    this.tilemapObjectsManager.colliders.forEach((colliderData) => {
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
    this.tilemapObjectsManager.players.forEach((playerPosition, childIdx) => {
      const sickChild = new SickChild(
        this,
        new Phaser.Math.Vector2(playerPosition.x * SCALE, playerPosition.y * SCALE),
        this.keys,
        childIdx,
        playerPosition.sprite,
        this.hud,
      ).on("death", this.handleChildDeath);
      this.sickChildren.add(sickChild.sprite);

      this.physics.add.collider(sickChild.sprite, this.mapCollidersGroup);
    });

    this.cameras.main.startFollow(this.sickChildren.getChildren()[0]);
    this.cameras.main.stopFollow();

    // Manage exit
    this.exitManager = new ExitManager(this);
    this.exit = this.exitManager.getExit();
    this.exitManager.on("level_win", this.handleLevelWin);

    this.bullets = this.physics.add.group({});
    this.soldiers = this.physics.add.group({});

    const sniper = new Sniper(this, new Phaser.Math.Vector2(37, 65).scale(SCALE), this.bullets);
    sniper.trackTargetGroup(this.sickChildren);
    sniper.trackBarriers(this.mapCollidersGroup);
    this.soldiers.add(sniper.sprite);

    this.tilemapObjectsManager.basicSoldiers.forEach((soldierData) => {
      const soldier = new BasicSoldier(
        this,
        new Phaser.Math.Vector2(soldierData.x * SCALE, soldierData.y * SCALE),
        this.bullets,
        soldierData.options,
        soldierData.sprite,
      );

      this.soldiers.add(soldier.sprite);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.physics.add.collider(this.sickChildren, this.bullets, (sickChildObj: any, bulletObj: any) => {
      sickChildObj.getData("ref")?.onHit(bulletObj.getData("ref"));
      bulletObj.getData("ref")?.destroy();
    });
    this.physics.add.collider(
      this.mapCollidersGroup,
      this.bullets,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (_mapCollidersGroupElement: any, bulletObj: any) => {
        bulletObj.getData("ref")?.destroy();
      },
    );
  }

  update(_time: number, delta: number) {
    this.bullets?.getChildren().forEach((b) => b.getData("ref").update());
    this.soldiers?.getChildren().forEach((b) => b.getData("ref").update(delta));

    new ChildMovementController(this, this.sickChildren, this.startingChildCount, this.hud);

    this.sickChildren.getChildren().forEach((childObj) => {
      const child: SickChild = childObj.getData("ref");
      child.update();

      if (intersects(child.sprite, this.exit)) {
        this.hud.setState("saved", parseInt(child.getControlKey()) - 1);
        child.winLevel(this.exitManager, this.sickChildren.getLength());
      }
    });
  }

  handleChildDeath = () => {
    if (this.sickChildren.getLength() > 0) {
      const child: SickChild = this.sickChildren.getChildren()[0].getData("ref");
      // Animate view change
      this.cameras.main.pan(child.sprite.x, child.sprite.y, CHANGE_PLAYER_VIEW_TIME, "Sine.easeInOut", undefined);
    } else {
      this.scene.run("GameOverScene");
    }
  };

  handleLevelWin = () => {
    console.log("ALL SAVED! YEEEEEAH!");
  };
}
