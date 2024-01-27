import { HUDController } from "../objects/HUDController";

export class HUDScene extends Phaser.Scene {
  public constructor() {
    super({
      key: "HUDScene",
    });
  }

  public create(opts: { controller: HUDController }) {
    opts.controller.create(this);
  }
}
