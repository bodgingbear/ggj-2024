import { SickChild } from "../objects/SickChild/SickChild";

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

  preload() {
    this.load.image("kuba", "/assets/images/credits/kuba.png");
  }

  public create(): void {
    this.physics.world.setBounds(0, 0, 1280, 720);

    // Setup keys
    const keys = this.input.keyboard!.createCursorKeys();
    this.shiftKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    // Create SickChild instances
    Array(CHILDREN_COUNT)
      .fill("")
      .forEach((_, childIdx) => {
        const sickChild = new SickChild(this, new Phaser.Math.Vector2(1270 / 2, 720 / 2), keys, childIdx);
        this.sickChildren.push(sickChild);
      });

    // Set up children key events
    this.input.keyboard!.on("keydown", this.handleChildrenMovementKeyDown, this);
    this.input.keyboard!.on("keyup", this.handleChildrenMovementKeyUp, this);
  }

  update() {
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
