import { SickChild } from "./SickChild";

export class ChildMovementController {
  private sickChildren!: Phaser.GameObjects.Group;
  private pressedKeys!: Set<string>;

  private startingChildCount!: number;

  constructor(
    scene: Phaser.Scene,
    sickChildren: Phaser.GameObjects.Group,
    pressedKeys: Set<string>,
    startingChildCount: number,
  ) {
    this.sickChildren = sickChildren;
    this.pressedKeys = pressedKeys;
    // Set up children key events
    scene.input.keyboard!.on("keydown", this.handleChildMovementKeyDown, this);
    scene.input.keyboard!.on("keyup", this.handleChildMovementKeyUp, this);

    this.startingChildCount = startingChildCount;
  }

  handleChildMovementKeyDown = (event: KeyboardEvent) => {
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
    const isExpectedNumber = !isNaN(index) && index >= 1 && index <= this.startingChildCount;
    if (isExpectedNumber) {
      this.pressedKeys.add(key);

      this.sickChildren.getChildren().forEach((childObj) => {
        const child: SickChild = childObj.getData("ref");

        if (child.getControlKey() === key) {
          child.setControlled(true);
        }
      });
    }
  };

  handleChildMovementKeyUp = (event: KeyboardEvent) => {
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
    const isExpectedNumber = !isNaN(index) && index >= 1 && index <= this.startingChildCount;
    if (isExpectedNumber) {
      this.pressedKeys.delete(key);

      this.sickChildren.getChildren().forEach((childObj) => {
        const child: SickChild = childObj.getData("ref");

        if (child.getControlKey() === key) {
          child.setControlled(false);
        }
      });
    }
  };
}
