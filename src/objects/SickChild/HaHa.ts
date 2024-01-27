import { SickChild } from "./SickChild";

export class HaHa {
  private blood!: Phaser.GameObjects.Particles.ParticleEmitter;
  private timer!: Phaser.Time.TimerEvent;

  constructor(
    private scene: Phaser.Scene,
    private child: SickChild,
  ) {
    this.blood = this.scene.add.particles(0, 0, "master", {
      frame: "UI/Ha",
      speed: 100,
      lifespan: 1000,
      // gravityY: 200,
      alpha: { start: 0.8, end: 0 },
      scale: 1,
    });

    this.timer = this.scene.time.addEvent({
      delay: 800,
      callback: () => {
        this.blood.emitParticleAt(this.child.sprite.x, this.child.sprite.y, 2);
      },
      repeat: -1,
    });
  }

  public destroy() {
    this.timer.destroy();
    this.blood.destroy();
  }
}
