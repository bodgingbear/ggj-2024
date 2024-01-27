import { HUDController } from "../HUDController";
import { SickChild } from "./SickChild";

export class ChildMovementController {
  private sickChildren!: Phaser.GameObjects.Group;

  private startingChildCount!: number;

  private hud!: HUDController;

  private pressedNumbers: number[] = [];

  private currentlyFollowed: number = -1;

  constructor(
    scene: Phaser.Scene,
    sickChildren: Phaser.GameObjects.Group,
    startingChildCount: number,
    hud: HUDController,
  ) {
    this.sickChildren = sickChildren;
    // Set up children key events
    scene.input.keyboard!.on("keydown", this.handleChildMovementKeyDown, this);
    scene.input.keyboard!.on("keyup", this.handleChildMovementKeyUp, this);

    this.hud = hud;

    this.startingChildCount = startingChildCount;
  }

  handleChildMovementKeyDown = (event: KeyboardEvent) => {
    const key = event.key;

    // Activate all children with Shift
    if (key === "Shift") {
      this.sickChildren.getChildren().forEach((childObj) => {
        const child: SickChild = childObj.getData("ref");
        child.setControlled(true);
        this.hud.setState("active", parseInt(child.getControlKey()) - 1);
      });
    }

    // Check if the key released is a correct number key
    const keyNumber = parseInt(key);
    const isExpectedKeyNumber = !isNaN(keyNumber) && keyNumber >= 1 && keyNumber <= this.startingChildCount;

    if (isExpectedKeyNumber) {
      if (!this.pressedNumbers.includes(keyNumber)) {
        this.pressedNumbers.push(keyNumber);
      }
      this.sickChildren.getChildren().forEach((childObj) => {
        const child: SickChild = childObj.getData("ref");
        const childKey = child.getControlKey();
        if (childKey === key) {
          child.setControlled(true);
          this.currentlyFollowed = keyNumber;
          this.hud.setState("active", parseInt(childKey) - 1);
        }
        if (!this.pressedNumbers.includes(parseInt(childKey))) {
          child.setControlled(false);
          this.hud.setState("inactive", parseInt(childKey) - 1);
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
        this.hud.setState("inactive", parseInt(child.getControlKey()) - 1);
      });
    }

    // Check if the key released is a correct number key
    const keyNumber = parseInt(key);
    const isExpectedKeyNumber = !isNaN(keyNumber) && keyNumber >= 1 && keyNumber <= this.startingChildCount;
    if (isExpectedKeyNumber) {
      this.sickChildren.getChildren().forEach((childObj) => {
        const child: SickChild = childObj.getData("ref");
        const childKey = child.getControlKey();
        if (childKey === key && this.pressedNumbers.length > 1) {
          child.setControlled(false);
          this.hud.setState("inactive", parseInt(childKey) - 1);
          if (this.currentlyFollowed === keyNumber) {
            this.sickChildren.getChildren().forEach((childObj) => {
              const child2: SickChild = childObj.getData("ref");
              const childKey = child.getControlKey();
              if (this.pressedNumbers.includes(parseInt(childKey)) && childKey !== key) {
                child2.setControlled(true);
              }
            });
          }
        }
      });
    }
    this.pressedNumbers = this.pressedNumbers.filter((n) => n !== keyNumber);
  };
}
