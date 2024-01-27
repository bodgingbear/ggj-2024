import { SCALE } from "../../constants";
import { rotateVector } from "../../utils/rotateVector";
import { Bullet } from "./Bullet";

export type SniperOpts = {
  rotationRange: [number, number];
  rotationSpeed: number;
  timeToShoot: number;
};

export type SniperAnimationName = "basic-soldier";
const SNIPER_BASE_SPRITE_NAME: Record<SniperAnimationName, string> = {
  "basic-soldier": "BasicSoldier/BasicSoldier-1",
};

export class Sniper {
  body: Phaser.Physics.Arcade.Body;
  sprite: Phaser.GameObjects.Sprite;

  shootingEvent: Phaser.Time.TimerEvent | undefined;

  rotationDirection = 1;

  rotationEnabled = true;

  targetGroup?: Phaser.GameObjects.Group;

  container: Phaser.GameObjects.Container;

  opts: SniperOpts;

  line: Phaser.GameObjects.Line;

  barriers!: Phaser.Tilemaps.TilemapLayer;

  lineDebug!: Phaser.GameObjects.Line;

  constructor(
    private scene: Phaser.Scene,
    position: Phaser.Math.Vector2,
    private bullets: Phaser.GameObjects.Group,
    opts: Partial<SniperOpts> = {},
    animationName: SniperAnimationName = "basic-soldier",
  ) {
    this.opts = {
      rotationRange: [180, 270],
      rotationSpeed: 0.03,
      timeToShoot: 1000,
      ...opts,
    };
    this.container = this.scene.add.container(position.x, position.y).setScale(SCALE);

    this.sprite = new Phaser.GameObjects.Sprite(this.scene, 0, 0, "master", SNIPER_BASE_SPRITE_NAME[animationName]);

    this.line = new Phaser.GameObjects.Line(this.scene, 0, 0, 0, 0, 100, 0, 0xff2222, 1).setOrigin(0, 0.5);

    this.container.add([this.sprite, this.line]);
    this.sprite.anims.play(animationName);

    scene.physics.world.enable(this.sprite);

    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.immovable = true;
    this.body.setCollideWorldBounds(true);

    this.sprite.setData("ref", this);
  }

  trackTargetGroup(group: Phaser.GameObjects.Group) {
    this.targetGroup = group;
  }

  trackBarriers(barriers: Phaser.Tilemaps.TilemapLayer) {
    this.barriers = barriers;
    // console.log(barriers);
    // this.barriers.forEachTile((tile) => {
    //   //   console.log(tile);
    // });

    // const containerPos = new Phaser.Math.Vector2(this.container.x, this.container.y);
    // const startPos = new Phaser.Math.Vector2(this.line.x, this.line.y).add(containerPos);

    // const endPos = new Phaser.Math.Vector2(
    //   this.line.x + this.line.width * SCALE,
    //   this.line.y + this.line.height * SCALE,
    // ).add(containerPos);

    // const line = new Phaser.Geom.Line(startPos.x, startPos.y, endPos.x, endPos.y);
    // this.lineDebug = this.scene.add.line(0, 0, line.x1, line.y1, line.x2, line.y2, 0xff00ff, 1).setOrigin(0);

    // this.barriers.forEachTile((tile) => {
    //   if (!tile.tileset) return;

    //   const rect = new Phaser.Geom.Rectangle(
    //     tile.pixelX * SCALE,
    //     tile.pixelY * SCALE,
    //     tile.width * SCALE,
    //     tile.height * SCALE,
    //   );
    //   //   console.log(tile, rect);
    //   setTimeout(() => {
    //     this.scene.add.rectangle(rect.x + 5, rect.y + 5, rect.width - 10, rect.height - 10, 0x00ff00, 0.1).setOrigin(0);
    //   }, 100);
    //   //   const out = Phaser.Geom.Intersects.GetLineToRectangle(line, rect);
    //   //   if (out.length > 0) console.log(out);
    // });
  }

  update(delta: number) {
    this.drawLaser();

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

    // this.targetGroup?.getChildren().forEach((child) => {});
  }

  drawLaser() {
    const containerPos = new Phaser.Math.Vector2(this.container.x, this.container.y);
    const startPos = new Phaser.Math.Vector2(this.line.x, this.line.y).add(containerPos);

    const endPos = rotateVector(
      this.container.angle,
      new Phaser.Math.Vector2(this.line.width * SCALE, this.line.height * SCALE),
    ).add(startPos);

    const line = new Phaser.Geom.Line(startPos.x, startPos.y, endPos.x, endPos.y);

    // this.lineDebug.setTo(line.x1, line.y1, line.x2, line.y2);

    let minDistance = Infinity;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let closestIntersection: any = null;

    this.barriers.forEachTile((tile) => {
      if (!tile.tileset) return;

      const rect = new Phaser.Geom.Rectangle(
        tile.pixelX * SCALE,
        tile.pixelY * SCALE,
        tile.width * SCALE,
        tile.height * SCALE,
      );

      const out = Phaser.Geom.Intersects.GetLineToRectangle(line, rect);
      if (out.length > 0) {
        // calculate distance to each intersecting point
        for (const p of out) {
          const d = Phaser.Math.Distance.BetweenPoints(startPos, p);
          if (d < minDistance) {
            minDistance = d;
            closestIntersection = p;
          }
        }
      }
    });

    if (closestIntersection) {
      const vec = new Phaser.Math.Vector2(closestIntersection.x, closestIntersection.y).subtract(
        new Phaser.Math.Vector2(this.container.x, this.container.y),
      );
      const final = rotateVector(-this.container.angle, vec).scale(1 / SCALE);

      this.line.setTo(this.line.x, this.line.y, final.x, final.y);
    }
  }

  shoot = (direction: Phaser.Math.Vector2) => {
    this.bullets.add(new Bullet(this.scene, new Phaser.Math.Vector2(this.sprite.x, this.sprite.y), direction).sprite);
  };
}
