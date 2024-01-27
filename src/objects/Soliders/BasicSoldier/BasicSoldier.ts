import { SCALE } from "../../../constants";
import { rotateVector } from "../../../utils/rotateVector";
import { KillZone } from "../../KillZone/KillZone";
import { Bullet } from "../Bullet";

export type BasicSoldierOpts = {
  startingRotation: number;
  rotationRange: [number, number];
  shootInterval: number;
  shootIntervalJitter: number;
  bulletsInSeries: number;
  rotationSpeed: number;
  stopOnShoot: boolean;
};

export type SoldierAnimationName = "basic-soldier";
const SOLDIER_BASE_SPRITE_NAME: Record<SoldierAnimationName, string> = {
  "basic-soldier": "ArmyMan/ArmyMan-1",
};

export class BasicSoldier {
  body: Phaser.Physics.Arcade.Body;
  sprite: Phaser.GameObjects.Sprite;
  rotatingRect: Phaser.GameObjects.Rectangle;

  killZone!: KillZone;

  shootingEvent: Phaser.Time.TimerEvent | undefined;

  rotationDirection = 1;

  rotationEnabled = true;

  constructor(
    private scene: Phaser.Scene,
    position: Phaser.Math.Vector2,
    private bullets: Phaser.GameObjects.Group,
    private opts: BasicSoldierOpts,
    private animationName: SoldierAnimationName,
    killZone: KillZone,
  ) {
    this.sprite = this.scene.add.sprite(position.x, position.y, "master", SOLDIER_BASE_SPRITE_NAME[animationName]);
    this.sprite.play(animationName + "-right");
    this.sprite.setScale(SCALE).setDepth(1);

    this.rotatingRect = this.scene.add.rectangle(position.x, position.y, 100, 100, 0xff0000, 0);
    const startingRotationInRadians = (opts.startingRotation * Math.PI) / 180;
    this.rotatingRect.setRotation(startingRotationInRadians);

    scene.physics.world.enable(this.sprite);

    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.immovable = true;
    this.body.setCollideWorldBounds(true);

    this.sprite.setData("ref", this);

    const scheduleShoot = () => {
      this.scene.time.addEvent({
        delay: this.opts.shootInterval! + Math.random() * this.opts.shootIntervalJitter!,
        callback: () => {
          this.shoot(rotateVector(this.rotatingRect.angle));
          scheduleShoot();
        },
      });
    };

    scheduleShoot();

    this.killZone = killZone;
    this.killZone.activateKillZoneOnSprite(this.sprite, this.scene);
    this.killZone.on("child_in_kill_zone", () => console.log("SOLDIER IN DANGER"));
    this.killZone.on("child_off_kill_zone", () => console.log("NOT ANYMORE"));
  }

  update(delta: number) {
    if (!this.rotationEnabled) return;

    this.rotatingRect.angle += this.rotationDirection * this.opts.rotationSpeed! * delta;

    if (this.rotationDirection > 0) {
      if (this.rotatingRect.angle > this.opts.rotationRange![1]) {
        this.rotationDirection *= -1;
      }
    }

    if (this.rotationDirection < 0) {
      if (this.rotatingRect.angle < this.opts.rotationRange![0]) {
        this.rotationDirection *= -1;
      }
    }

    if (this.rotatingRect.angle > 45 && this.rotatingRect.angle < 135) {
      this.sprite.play(this.animationName + "-down", true);
    } else if (this.rotatingRect.angle >= 135 || this.rotatingRect.angle < -135) {
      this.sprite.play(this.animationName + "-left", true);
    } else if (this.rotatingRect.angle >= -135 && this.rotatingRect.angle < -45) {
      this.sprite.play(this.animationName + "-up", true);
    } else {
      this.sprite.play(this.animationName + "-right", true);
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
