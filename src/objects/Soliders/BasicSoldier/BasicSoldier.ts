import { Bullet } from "../Bullet";

type Opts = {
  rotationRange?: [number, number];
  shootInterval?: number;
  shootIntervalJitter?: number;
  bulletsInSeries?: number;
  rotationSpeed?: number;
};

function rotateVector(rotation: number) {
  const vec: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 0);

  // Convert angle to radians
  const angleRadians = (rotation * Math.PI) / 180;

  // Calculate new coordinates after rotation
  const newX = vec.x * Math.cos(angleRadians) - vec.y * Math.sin(angleRadians);
  const newY = vec.x * Math.sin(angleRadians) + vec.y * Math.cos(angleRadians);

  // Return the new coordinates as an object
  return new Phaser.Math.Vector2(newX, newY);
}

export class BasicSoldier {
  body: Phaser.Physics.Arcade.Body;
  sprite: Phaser.GameObjects.Sprite;

  shootingEvent: Phaser.Time.TimerEvent | undefined;

  opts: Opts;

  rotationDirection = 1;

  constructor(
    private scene: Phaser.Scene,
    position: Phaser.Math.Vector2,
    private bullets: Phaser.GameObjects.Group,
    opts: Partial<Opts> = {},
  ) {
    this.opts = {
      rotationRange: [0, 90],
      shootInterval: 1000,
      shootIntervalJitter: 0,
      bulletsInSeries: 1,
      rotationSpeed: 0.02,
      ...opts,
    };
    this.sprite = this.scene.add.sprite(position.x, position.y, "kuba").setScale(2);

    scene.physics.world.enable(this.sprite);

    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.immovable = true;
    this.body.setCollideWorldBounds(true);

    this.sprite.setData("ref", this);

    const scheduleShoot = () => {
      this.scene.time.addEvent({
        delay: this.opts.shootInterval! + Math.random() * this.opts.shootIntervalJitter!,
        callback: () => {
          this.shoot(rotateVector(this.body.rotation));
          scheduleShoot();
        },
      });
    };

    scheduleShoot();
  }

  update(delta: number) {
    this.body.rotation += this.rotationDirection * this.opts.rotationSpeed! * delta;

    if (this.rotationDirection > 0) {
      if (this.body.rotation > this.opts.rotationRange![1]) {
        this.rotationDirection *= -1;
      }
    }

    if (this.rotationDirection < 0) {
      if (this.body.rotation < this.opts.rotationRange![0]) {
        this.rotationDirection *= -1;
      }
    }
  }

  shoot = (direction: Phaser.Math.Vector2) => {
    this.bullets.add(new Bullet(this.scene, new Phaser.Math.Vector2(this.sprite.x, this.sprite.y), direction).sprite);
  };
}
