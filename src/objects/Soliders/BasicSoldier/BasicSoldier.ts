import { SCALE } from "../../../constants";
import { rotateVector } from "../../../utils/rotateVector";
import { Bullet } from "../Bullet";

export type BasicSoldierOpts = {
  rotationRange: [number, number];
  shootInterval: number;
  shootIntervalJitter: number;
  bulletsInSeries: number;
  rotationSpeed: number;
  stopOnShoot: boolean;
};

export type SoldierAnimationName = "basic-soldier";
const SOLDIER_BASE_SPRITE_NAME: Record<SoldierAnimationName, string> = {
  "basic-soldier": "BasicSoldier/BasicSoldier-1",
};

export class BasicSoldier {
  body: Phaser.Physics.Arcade.Body;
  sprite: Phaser.GameObjects.Sprite;

  shootingEvent: Phaser.Time.TimerEvent | undefined;

  rotationDirection = 1;

  rotationEnabled = true;

  constructor(
    private scene: Phaser.Scene,
    position: Phaser.Math.Vector2,
    private bullets: Phaser.GameObjects.Group,
    private opts: BasicSoldierOpts,
    animationName: SoldierAnimationName,
  ) {
    this.sprite = this.scene.add.sprite(position.x, position.y, "master", SOLDIER_BASE_SPRITE_NAME[animationName]);
    this.sprite.anims.play(animationName);
    this.sprite.setScale(SCALE);

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
    if (!this.rotationEnabled) return;

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
    const interval = 50;

    this.scene.time.addEvent({
      delay: interval,
      callback: () => {
        this.bullets.add(
          new Bullet(this.scene, new Phaser.Math.Vector2(this.sprite.x, this.sprite.y), direction).sprite,
        );
      },
      repeat: this.opts.bulletsInSeries! - 1,
    });

    if (this.opts.stopOnShoot) {
      this.rotationEnabled = false;
      this.scene.time.addEvent({
        delay: (this.opts.bulletsInSeries! + 2) * interval,
        callback: () => {
          this.rotationEnabled = true;
        },
      });
    }
  };
}
