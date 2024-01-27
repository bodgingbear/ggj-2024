import { HUDController } from "../HUDController";
import { SickChild } from "./SickChild";

export class ChildMovementController {
  private sickChildren!: Phaser.GameObjects.Group;

  private heldDownChildrenKeys: Set<string> = new Set();

  private hud!: HUDController;

  constructor(scene: Phaser.Scene, sickChildren: Phaser.GameObjects.Group, hud: HUDController) {
    this.sickChildren = sickChildren;
    // Set up children key events
    scene.input.keyboard!.on("keydown", this.handleChildMovementKeyDown, this);
    scene.input.keyboard!.on("keyup", this.handleChildMovementKeyUp, this);

    this.hud = hud;

    this.sickChildren.getChildren().forEach((childObject) => {
      const child = childObject.getData("ref") as SickChild;
      child.on("death", () => {
        if (this.heldDownChildrenKeys.size === 0) {
          const firstNonDeadChildObject = this.sickChildren.getFirstAlive();
          const firstNonDeadChild = firstNonDeadChildObject?.getData("ref") as SickChild | undefined;
          if (firstNonDeadChild == null) {
            return;
          }

          this.handleChildMovementKeyDown({ key: firstNonDeadChild.getControlKey() } as KeyboardEvent);
          this.handleChildMovementKeyUp({ key: firstNonDeadChild.getControlKey() } as KeyboardEvent);
        } else {
          this.updateChildren(this.heldDownChildrenKeys, this.heldDownChildrenKeys);
        }
      });
    });
  }

  handleChildMovementKeyDown = (event: KeyboardEvent) => {
    const previouslyHeldDownChildren = structuredClone(this.heldDownChildrenKeys);

    const pressedChild = this.sickChildren
      .getChildren()
      .find((child) => (child.getData("ref") as SickChild).getControlKey() === event.key);

    if (pressedChild == null) {
      return;
    }

    this.heldDownChildrenKeys.add((pressedChild.getData("ref") as SickChild).getControlKey());
    this.updateChildren(previouslyHeldDownChildren, this.heldDownChildrenKeys);
  };

  handleChildMovementKeyUp = (event: KeyboardEvent) => {
    const previouslyHeldDownChildren = structuredClone(this.heldDownChildrenKeys);

    const releasedChild = this.sickChildren
      .getChildren()
      .find((child) => (child.getData("ref") as SickChild).getControlKey() === event.key);

    if (releasedChild == null) {
      return;
    }

    const releasedControlKey = (releasedChild.getData("ref") as SickChild).getControlKey();
    this.heldDownChildrenKeys.delete(releasedControlKey);

    this.updateChildren(previouslyHeldDownChildren, this.heldDownChildrenKeys);
  };

  private updateChildren(previouslyHeldDownChildrenKeys: Set<string>, heldDownChildrenKeys: Set<string>) {
    this.sickChildren.getChildren().forEach((childObject) => {
      const child = childObject?.getData("ref") as SickChild | undefined;
      if (child == null) {
        return;
      }

      child.setControlled(false);
      this.hud.setState("inactive", parseInt(child.getControlKey()) - 1);
    });

    const heldDownChildrenKeysArray = Array.from(heldDownChildrenKeys);
    for (let i = heldDownChildrenKeysArray.length - 1; i >= 0; i--) {
      const key = heldDownChildrenKeysArray[i];
      const child = this.findChildByKey(key);

      if (child == null) {
        continue;
      }

      child.setControlled(true);
      this.hud.setState("active", parseInt(child.getControlKey()) - 1);
    }

    if (heldDownChildrenKeys.size === 0) {
      const lastPreviouslyPressedKey = Array.from(previouslyHeldDownChildrenKeys.values())[0];
      const previousChild = this.findChildByKey(lastPreviouslyPressedKey);
      if (previousChild != null) {
        this.hud.setState("active", parseInt(previousChild.getControlKey()) - 1);
        previousChild?.setControlled(true);
      }
    }
  }

  private findChildByKey(key: string): SickChild | undefined {
    return this.sickChildren
      .getChildren()
      .find((child) => (child.getData("ref") as SickChild).getControlKey() === key)
      ?.getData("ref") as SickChild | undefined;
  }
}
