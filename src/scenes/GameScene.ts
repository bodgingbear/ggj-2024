import { SCALE } from "../constants";
import { SickChild } from "../objects/SickChild/SickChild";
import { BasicSoldier } from "../objects/Soliders/BasicSoldier/BasicSoldier";
import { HUD } from "../objects/HUD/HUD";

const CHILDREN_COUNT = 5;
interface MapLayers {
  ground: Phaser.Tilemaps.TilemapLayer;
  barriers: Phaser.Tilemaps.TilemapLayer;
}

export class GameScene extends Phaser.Scene {
  private keys!: Phaser.Types.Input.Keyboard.CursorKeys;
  private map!: Phaser.Tilemaps.Tilemap;

  private mapLayers!: MapLayers;

  public constructor() {
    super({
      key: "GameScene",
    });
  }

  private pressedKeys: Set<string> = new Set();
  private shiftKey!: Phaser.Input.Keyboard.Key;
  private bullets!: Phaser.GameObjects.Group;
  private soldiers!: Phaser.GameObjects.Group;
  private sickChildren!: Phaser.GameObjects.Group;
  private hud!: HUD;

  preload() {
    this.load.image("kuba", "/assets/images/credits/kuba.png");
  }

  private createMap() {
    this.map = this.make.tilemap({ key: "tilemap" });

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
    Array(CHILDREN_COUNT)
      .fill(0xdeadbeef)
      .forEach((_, childIdx) => {
        const sickChild = new SickChild(
          this,
          new Phaser.Math.Vector2(1270 / 2, 720 / 2 - childIdx * 56),
          this.keys,
          childIdx,
        ).on("death", this.handleChildDeath);
        this.sickChildren.add(sickChild.sprite);

        this.physics.add.collider(sickChild.sprite, this.mapLayers.barriers);
      });

    this.shiftKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    this.bullets = this.physics.add.group({});
    this.soldiers = this.physics.add.group({});

    this.soldiers.add(new BasicSoldier(this, new Phaser.Math.Vector2(1280 / 2 - 300, 720 / 2), this.bullets).sprite);
    this.soldiers.add(
      new BasicSoldier(this, new Phaser.Math.Vector2(1280 / 2 + 300, 720 / 2), this.bullets, {
        rotationRange: [-20, 20],
        rotationSpeed: 0.1,
        shootInterval: 500,
      }).sprite,
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.physics.add.collider(this.sickChildren, this.bullets, (sickChildObj: any, bulletObj: any) => {
      sickChildObj.getData("ref")?.onHit(bulletObj.getData("ref"));
      bulletObj.getData("ref").destroy();
    });
    this.hud = new HUD(this);
    this.hud.onCounterChange(this.sickChildren.getLength());
  }

  update(_time: number, delta: number) {
    this.bullets?.getChildren().forEach((b) => b.getData("ref").update());
    this.soldiers?.getChildren().forEach((b) => b.getData("ref").update(delta));

    // Set up children key events
    this.input.keyboard!.on("keydown", this.handleChildrenMovementKeyDown, this);
    this.input.keyboard!.on("keyup", this.handleChildrenMovementKeyUp, this);

    this.sickChildren.getChildren().forEach((childObj) => {
      const child: SickChild = childObj.getData("ref");
      const pressedKeys = Array.from(this.pressedKeys);

      const shouldControlChild = this.shiftKey.isDown || pressedKeys.some((key) => key === child.getControlKey());

      if (shouldControlChild) {
        child.setControlled(true);
        child.update();
        this.cameras.main.startFollow(child.sprite);
      } else {
        child.setControlled(false);
      }
    });
  }

  handleChildrenMovementKeyDown(event: KeyboardEvent) {
    const key = event.key;

    // Activate all children with Shift
    if (key === "Shift") {
      this.sickChildren.getChildren().forEach((childObj) => {
        const child: SickChild = childObj.getData("ref");
        child.setControlled(true);
      });
    }

    // Check if the key released is a correct number key
    const index = parseInt(key);
    const isExpectedNumber = !isNaN(index) && index >= 1 && index <= CHILDREN_COUNT;
    if (isExpectedNumber) {
      this.pressedKeys.add(key);
    }
  }

  handleChildrenMovementKeyUp(event: KeyboardEvent) {
    const key = event.key;

    // Activate all children with Shift
    if (key === "Shift") {
      this.sickChildren.getChildren().forEach((childObj) => {
        const child: SickChild = childObj.getData("ref");
        child.setControlled(false);
      });
    }

    // Check if the key released is a correct number key
    const index = parseInt(key);
    const isExpectedNumber = !isNaN(index) && index >= 1 && index <= CHILDREN_COUNT;
    if (isExpectedNumber) {
      this.pressedKeys.delete(key);
    }
  }

  handleChildDeath = () => {
    this.hud.decreaseCounter();
    if (this.sickChildren.getLength() > 0) {
      this.cameras.main.startFollow(this.sickChildren.getChildren()[0]);
    }
  };
}
