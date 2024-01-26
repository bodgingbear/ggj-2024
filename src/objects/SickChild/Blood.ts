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
        "master",
        "blood",
      );

      sprite.setScale(0.1 + Math.random() * 3);

      this.scene.physics.world.enable(sprite);

      if (sprite.body) {
        sprite.body!.velocity.x = -250 - Math.random() * 200;
        sprite.body!.velocity.y = -250 + Math.random() * 400;
      }
      return sprite;
    });

    const bloodFlightTimeMs = 1000;

    this.scene.time.addEvent({
      delay: bloodFlightTimeMs,
      callback: () => {
        bloodParticles.forEach((sprite) => {
          if (sprite.body) {
            sprite.body!.velocity.x = 0;
            sprite.body!.velocity.y = 0;
          }
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
