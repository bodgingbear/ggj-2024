import { CHANGE_PLAYER_VIEW_TIME, SCALE } from "../constants";
import { SickChild } from "../objects/SickChild/SickChild";
import { BasicSoldier } from "../objects/Soliders/BasicSoldier/BasicSoldier";
import { Counter } from "../objects/Counter/Counter";
import { TilemapObjectsManager } from "../objects/TilemapObjectsManager/TilemapObjectsManager";
import { ChildMovementController } from "../objects/SickChild/ChildMovementController";

interface MapLayers {
  ground: Phaser.Tilemaps.TilemapLayer;
  barriers: Phaser.Tilemaps.TilemapLayer;
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

  private pressedKeys: Set<string> = new Set();
  private bullets!: Phaser.GameObjects.Group;
  private soldiers!: Phaser.GameObjects.Group;
  private sickChildren!: Phaser.GameObjects.Group;
  private counter!: Counter;

  private createMap() {
    this.map = this.make.tilemap({ key: "tilemap" });
    this.tilemapObjectsManager = new TilemapObjectsManager(this.map);

    // The first parameter is the name of the tileset in Tiled and the second parameter is the key
    // of the tileset image used when loading the file in preload.
    const tiles = this.map.addTilesetImage("tilemap", "base_tiles")!;

    this.mapLayers = {} as MapLayers;

    this.mapLayers.ground = this.map.createLayer("Ground", tiles, 0, 0)!;
    this.mapLayers.ground.setScale(SCALE);

    this.mapLayers.barriers = this.map.createLayer("Barriers", tiles, 0, 0)!;
    this.mapLayers.barriers.setScale(SCALE);

    this.mapLayers.barriers.setCollisionByExclusion([-1]);

    this.physics.world.setBounds(0, 0, this.map.widthInPixels * SCALE, this.map.heightInPixels * SCALE);
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels * SCALE, this.map.heightInPixels * SCALE);
  }

  public create(): void {
    this.createMap();

    // Setup keys
    this.keys = this.input.keyboard!.createCursorKeys();

    this.sickChildren = this.physics.add.group({});

    // Create SickChild instances
    players.forEach((playerPosition, childIdx) => {
      const sickChild = new SickChild(
        this,
        new Phaser.Math.Vector2(playerPosition.x * SCALE, playerPosition.y * SCALE),
        this.keys,
        childIdx,
        playerPosition.sprite,
      ).on("death", this.handleChildDeath);
      this.sickChildren.add(sickChild.sprite);

      this.physics.add.collider(sickChild.sprite, this.mapLayers.barriers);
    });

    this.cameras.main.startFollow(this.sickChildren.getChildren()[0]);
    this.cameras.main.stopFollow();

    this.bullets = this.physics.add.group({});
    this.soldiers = this.physics.add.group({});

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.physics.add.collider(this.mapLayers.barriers, this.bullets, (bulletObj: any) => {
      bulletObj.getData("ref")?.destroy();
    });

    this.counter = new Counter(this);
    this.counter.onCounterChange(this.sickChildren.getLength());
  }

  update(_time: number, delta: number) {
    this.bullets?.getChildren().forEach((b) => b.getData("ref").update());
    this.soldiers?.getChildren().forEach((b) => b.getData("ref").update(delta));

    new ChildMovementController(this, this.sickChildren, this.pressedKeys);

    this.sickChildren.getChildren().forEach((childObj) => {
      const child: SickChild = childObj.getData("ref");
      child.update();
    });
  }

  handleChildDeath = () => {
    this.counter.decreaseCounter();
    if (this.sickChildren.getLength() > 0) {
      const child: SickChild = this.sickChildren.getChildren()[0].getData("ref");
      // Animate view change
      this.cameras.main.pan(child.sprite.x, child.sprite.y, CHANGE_PLAYER_VIEW_TIME, "Sine.easeInOut", undefined);
    }
  };
}
