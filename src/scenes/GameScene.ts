import { SickChild } from "../objects/SickChild/SickChild";

export class GameScene extends Phaser.Scene {
  public constructor() {
    super({
      key: "GameScene",
    });
  }

  private sickChild!: SickChild;

  preload() {
    this.load.image("kuba", "/assets/images/credits/kuba.png");
  }

  public create(): void {
    this.physics.world.setBounds(0, 0, 1280, 720);

    const keys = this.input.keyboard!.createCursorKeys();

    this.sickChild = new SickChild(this, new Phaser.Math.Vector2(1270 / 2, 720 / 2), keys);
  }

  update() {
    this.sickChild.update();
  }
}
