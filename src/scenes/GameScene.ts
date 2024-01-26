import { SickChild } from "../objects/SickChild/SickChild";
import { BasicSoldier } from "../objects/Soliders/BasicSoldier/BasicSoldier";
import { HUD } from "../objects/HUD/HUD";

const CHILDREN_COUNT = 5;

export class GameScene extends Phaser.Scene {
  public constructor() {
    super({
      key: "GameScene",
    });
  }

  private sickChildren: SickChild[] = [];
  private pressedKeys: Set<string> = new Set();
  private shiftKey!: Phaser.Input.Keyboard.Key;
  private bullets!: Phaser.GameObjects.Group;
  private soldiers!: Phaser.GameObjects.Group;
  private keys!: Phaser.Types.Input.Keyboard.CursorKeys;
  private hud!: HUD;

  public create(): void {
    this.physics.world.setBounds(0, 0, 1280, 720);

    // Setup keys
    this.keys = this.input.keyboard!.createCursorKeys();
    // Create SickChild instances
    Array(CHILDREN_COUNT)
      .fill("")
      .forEach((_, childIdx) => {
        const sickChild = new SickChild(this, new Phaser.Math.Vector2(1270 / 2, 720 / 2), this.keys, childIdx);
        this.sickChildren.push(sickChild);
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
    this.hud = new HUD(this);
  }

  update(_time: number, delta: number) {
    this.bullets?.getChildren().forEach((b) => b.getData("ref").update());
    this.soldiers?.getChildren().forEach((b) => b.getData("ref").update(delta));

    // Set up children key events
    this.input.keyboard!.on("keydown", this.handleChildrenMovementKeyDown, this);
    this.input.keyboard!.on("keyup", this.handleChildrenMovementKeyUp, this);

    this.sickChildren.forEach((child) => {
      const pressedKeys = Array.from(this.pressedKeys);

      const shouldControlChild = this.shiftKey.isDown || pressedKeys.some((key) => key === child.getControlKey());

      if (shouldControlChild) {
        child.setControlled(true);
        child.update();
      } else {
        child.setControlled(false);
      }
    });
  }

  handleChildrenMovementKeyDown(event: KeyboardEvent) {
    const key = event.key;

    // Activate all children with Shift
    if (key === "Shift") {
      this.sickChildren.forEach((sickChild) => sickChild.setControlled(true));
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
      this.sickChildren.forEach((sickChild) => sickChild.setControlled(false));
    }

    // Check if the key released is a correct number key
    const index = parseInt(key);
    const isExpectedNumber = !isNaN(index) && index >= 1 && index <= CHILDREN_COUNT;
    if (isExpectedNumber) {
      this.pressedKeys.delete(key);
    }
  }
}
