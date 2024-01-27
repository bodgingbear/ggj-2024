import { AvailableLevels } from "../constants";
import { GameScene } from "./GameScene";

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameOverScene" });
  }

  public static start(scene: Phaser.Scene, level: AvailableLevels) {
    scene.scene.start("GameOverScene", { level });
  }

  public static run(scene: Phaser.Scene, level: AvailableLevels) {
    scene.scene.run("GameOverScene", { level });
  }

  public create({ level }: { level: AvailableLevels }) {
    this.add.rectangle(0, 0, 1280 * 4, 720 * 4, 0x000000, 0.7);
    this.add.text(1280 / 2, 720 / 2 - 32, "Game Over", { fontSize: 48, color: "#FFFFFF" }).setOrigin(0.5);
    this.add.text(1280 / 2, 720 / 2 + 32, "Press (R) to restart", { fontSize: 48, color: "#FFFFFF" }).setOrigin(0.5);
    this.input.keyboard!.addKey("R").on("down", (): void => {
      GameScene.start(this, level);
    });
  }
}
