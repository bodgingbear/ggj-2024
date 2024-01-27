import { SCALE } from "../../constants";
import { rotateVector } from "../../utils/rotateVector";
import { Bullet } from "./Bullet";

export type SniperOpts = {
  rotationRange: [number, number];
  startingRotation: number;
  rotationSpeed: number;
  timeToShoot: number;
  cooldown: number;
};

export type SniperAnimationName = "basic-soldier";
const SNIPER_BASE_SPRITE_NAME: Record<SniperAnimationName, string> = {
  "basic-soldier": "BasicSoldier/BasicSoldier-1",
};

const RAY_LENGTH = 1000;

const SHOOTING_RANGE = Infinity;

export class Sniper {
  body: Phaser.Physics.Arcade.Body;
  sprite: Phaser.GameObjects.Sprite;

  shootingEvent: Phaser.Time.TimerEvent | undefined;

  rotationDirection = 1;

  rotationEnabled = true;

  shootingEnabled = true;

  targetGroup!: Phaser.GameObjects.Group;

  container: Phaser.GameObjects.Container;

  line: Phaser.GameObjects.Line;

  barriers!: Phaser.GameObjects.Group;

  lineDebug!: Phaser.GameObjects.Line;

  constructor(
    private scene: Phaser.Scene,
    position: Phaser.Math.Vector2,
    private bullets: Phaser.GameObjects.Group,
    public opts: SniperOpts,
    private animationName: SniperAnimationName,
  ) {
    this.container = this.scene.add.container(position.x, position.y).setScale(SCALE);

    this.container.angle = opts.startingRotation;

    this.sprite = this.scene.add
      .sprite(position.x, position.y, "master", SNIPER_BASE_SPRITE_NAME[animationName])
      .setScale(SCALE)
      .setTint(0x555555);

    this.line = new Phaser.GameObjects.Line(this.scene, 0, 0, 0, 0, RAY_LENGTH, 0)
      .setOrigin(0, 0.5)
      .setLineWidth(1)
      .setStrokeStyle(0.5, 0xff2222, 1);

    this.container.add([this.line]);
    this.sprite.anims.play(animationName + "-" + "right");

    scene.physics.world.enable(this.sprite);

    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.immovable = true;
    this.body.setCollideWorldBounds(true);

    this.sprite.setData("ref", this);
  }

  trackTargetGroup(group: Phaser.GameObjects.Group) {
    this.targetGroup = group;
  }

  trackBarriers(barriers: Phaser.GameObjects.Group) {
    this.barriers = barriers;
  }

  update(delta: number) {
    this.drawLaser();

    if (this.rotationEnabled) {
      this.container.angle += this.rotationDirection * this.opts.rotationSpeed! * delta;
      if (this.rotationDirection > 0) {
        if (this.container.angle > this.opts.rotationRange![1]) {
          this.rotationDirection *= -1;
        }
      }

      if (this.rotationDirection < 0) {
        if (this.container.angle < this.opts.rotationRange![0]) {
          this.rotationDirection *= -1;
        }
      }
    }

    if (this.container.angle > 45 && this.container.angle < 135) {
      this.container.setDepth(1);
      this.sprite.play(this.animationName + "-down", true);
    } else if (this.container.angle >= 135 || this.container.angle < -135) {
      this.container.setDepth(1);
      this.sprite.play(this.animationName + "-left", true);
    } else if (this.container.angle >= -135 && this.container.angle < -45) {
      this.container.setDepth(-1);
      this.sprite.play(this.animationName + "-up", true);
    } else {
      this.container.setDepth(1);
      this.sprite.play(this.animationName + "-right", true);
    }
  }

  drawLaser() {
    const containerPos = new Phaser.Math.Vector2(this.container.x, this.container.y);
    const startPos = new Phaser.Math.Vector2(this.line.x, this.line.y).add(containerPos);

    const endPos = rotateVector(
      this.container.angle,
      new Phaser.Math.Vector2(this.line.width * SCALE, this.line.height * SCALE),
    ).add(startPos);

    const line = new Phaser.Geom.Line(startPos.x, startPos.y, endPos.x, endPos.y);

    const barriersHit = {
      minDistance: Infinity,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      closestIntersection: null as any,
    };

    this.barriers.getChildren().forEach((tile) => {
      const body = tile.body as Phaser.Physics.Arcade.Body;
      const rect = new Phaser.Geom.Rectangle(body.x, body.y, body.width, body.height);

      const out = Phaser.Geom.Intersects.GetLineToRectangle(line, rect);
      if (out.length > 0) {
        // calculate distance to each intersecting point
        for (const p of out) {
          const d = Phaser.Math.Distance.BetweenPoints(startPos, p);
          if (d < barriersHit.minDistance) {
            barriersHit.minDistance = d;
            barriersHit.closestIntersection = p;
          }
        }
      }
    });

    const targetHit = {
      minDistance: Infinity,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      closestIntersection: null as any,
    };
    this.targetGroup.getChildren().forEach((tile) => {
      const body = tile.body as Phaser.Physics.Arcade.Body;
      const rect = new Phaser.Geom.Rectangle(body.x, body.y, body.width, body.height);

      const out = Phaser.Geom.Intersects.GetLineToRectangle(line, rect);
      if (out.length > 0) {
        // calculate distance to each intersecting point
        for (const p of out) {
          const d = Phaser.Math.Distance.BetweenPoints(startPos, p);
          if (d < targetHit.minDistance) {
            targetHit.minDistance = d;
            targetHit.closestIntersection = p;
          }
        }
      }
    });

    const closest = barriersHit.minDistance < targetHit.minDistance ? barriersHit : targetHit;
    if (closest.closestIntersection) {
      const vec = new Phaser.Math.Vector2(closest.closestIntersection.x, closest.closestIntersection.y).subtract(
        new Phaser.Math.Vector2(this.container.x, this.container.y),
      );
      const final = rotateVector(-this.container.angle, vec).scale(1 / SCALE);

      this.line.setTo(this.line.x, this.line.y, final.x, final.y);
    }

    if (!this.shootingEnabled) return;

    if (targetHit.minDistance < SHOOTING_RANGE && closest === targetHit) {
      this.shootingEnabled = false;

      this.scene.time.addEvent({
        delay: 20,
        callback: () => {
          this.shoot(rotateVector(this.container.angle));
        },
      });
    }
  }

  shoot = (direction: Phaser.Math.Vector2) => {
    this.rotationEnabled = false;

    this.scene.time.addEvent({
      delay: this.opts.timeToShoot!,
      callback: () => {
        this.bullets.add(
          new Bullet(
            this.scene,
            new Phaser.Math.Vector2(this.container.x, this.container.y),
            direction,
            10,
            1500,
          ).sprite.setData("hp", 2),
        );
        this.line.setAlpha(0);
        this.scene.time.addEvent({
          delay: this.opts.cooldown!,
          callback: () => {
            this.line.setAlpha(1);
            this.shootingEnabled = true;
            this.rotationEnabled = true;
          },
        });
      },
    });
  };
}
