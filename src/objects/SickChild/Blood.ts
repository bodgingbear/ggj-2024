export class Blood {
  constructor(
    private scene: Phaser.Scene,
    position: Phaser.Math.Vector2,
    count: number = 100,
    spreadX: number = 100,
    spreadY: number = 100,
  ) {
    const bloodParticles = Array.from(Array(count)).map(() => {
      const sprite = this.scene.add.sprite(
        position.x - spreadX / 2 + Math.random() * spreadY,
        position.y - spreadY / 2 + Math.random() * spreadY,
        "blood",
        "blood/blood",
      );
      // .setPipeline("Light2D");

      sprite.setScale(0.1 + Math.random() * 2);

      this.scene.physics.world.enable(sprite);

      sprite.body.velocity.x = -200 - Math.random() * 200;
      sprite.body.velocity.y = -200 + Math.random() * 400;

      return sprite;
    });

    const bloodFlightTimeMs = 200;

    this.scene.time.addEvent({
      delay: bloodFlightTimeMs,
      callback: () => {
        bloodParticles.forEach((sprite) => {
          sprite.body.velocity.x = 0;
          sprite.body.velocity.y = 0;
        });
      },
    });
    bloodParticles.forEach((sprite) => {
      this.scene.tweens.addCounter({
        from: 1,
        to: 0,
        duration: bloodFlightTimeMs + Math.random() * 1000,
        onUpdate: (tween) => {
          sprite.setAlpha(tween.getValue());
        },
        onComplete: () => {
          sprite.destroy();
        },
      });
    });
  }
}
