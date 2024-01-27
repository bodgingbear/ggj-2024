export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameOverScene" });
  }
  public create() {
    this.add.rectangle(0, 0, 1280 * 4, 720 * 4, 0x000000, 0.7);
    this.add.text(1280 / 2, 720 / 2 - 32, "Game Over", { fontSize: 48, color: "#FFFFFF" }).setOrigin(0.5);
    this.add.text(1280 / 2, 720 / 2 + 32, "Press (R) to restart", { fontSize: 48, color: "#FFFFFF" }).setOrigin(0.5);
    this.input.keyboard!.addKey("R").on("down", (): void => {
      this.scene.start("GameScene");
    });
  }
}
