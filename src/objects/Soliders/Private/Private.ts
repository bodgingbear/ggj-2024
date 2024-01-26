import { Bullet } from "../Bullet";
import { Solider } from "../Solider";

const SHOOTING_DELAY = 4000;

export class Private implements Solider {
  body: Phaser.Physics.Arcade.Body;
  sprite: Phaser.GameObjects.Sprite;

  shootingEvent: Phaser.Time.TimerEvent | undefined;

  constructor(
    private scene: Phaser.Scene,
    position: Phaser.Math.Vector2,
    private bullets: Phaser.GameObjects.Group,
    private state: "searching" | "shooting" = "searching",
  ) {
    this.sprite = this.scene.add.sprite(position.x, position.y, "master", "private/private0000").setScale(5);

    scene.physics.world.enable(this.sprite);

    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(true);

    this.sprite.setData("ref", this);
  }

  foundEnemy(targetPosition: Phaser.Math.Vector2): void {
    if (this.state === "shooting") {
      return;
    }

    this.state = "shooting";
    this.shoot(targetPosition);
    this.shootingEvent = this.scene.time.addEvent({
      delay: SHOOTING_DELAY,
      loop: true,
      callback: () => this.shoot(targetPosition),
    });
  }

  finishShooting(): void {}

  shoot = (targetPosition: Phaser.Math.Vector2) => {
    this.bullets.add(new Bullet(this.scene, targetPosition, undefined, undefined, 2).sprite);
  };
}
