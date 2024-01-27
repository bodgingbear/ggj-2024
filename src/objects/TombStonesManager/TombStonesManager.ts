import { SCALE } from "../../constants";

export class TombStonesManager {
  private group!: Phaser.GameObjects.Group;

  constructor(private scene: Phaser.Scene) {
    this.group = this.scene.add.group();
  }

  public addTombStone(x: number, y: number) {
    const sprite = this.scene.add.sprite(0, 0, "master", "Tombstone");
    sprite.setScale(SCALE - 1);
    sprite.setPosition(x, y);
    sprite.setOrigin(0.5, 1);
    sprite.setDepth(-1);

    this.scene.tweens.add({
      targets: sprite,
      scale: SCALE,
      ease: Phaser.Math.Easing.Expo.Out,
      duration: 75,
    });

    this.group.add(sprite);
  }
}
