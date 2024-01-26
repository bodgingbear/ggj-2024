import { EventEmitter } from "../../utils/EventEmitter/EventEmitter";
import { Bullet } from "../Soliders/Bullet";
import { Blood } from "./Blood";
import { SCALE } from "../../constants";

const PLAYER_VELOCITY = 600;

type Events = {
  death: () => void;
};

type AnimationName = "fat-kid" | "poor-kid" | "small-kid";

/** Player
 */
export class SickChild extends EventEmitter<Events> {
  body: Phaser.Physics.Arcade.Body;

  sprite: Phaser.GameObjects.Sprite;

  private controlled: boolean = false;
  private controlKey: string;
  hp: number = 1;

  constructor(
    private scene: Phaser.Scene,
    startingPosition: Phaser.Math.Vector2,
    private keys: Phaser.Types.Input.Keyboard.CursorKeys,
    controlIndex: number,
    animationName: AnimationName,
  ) {
    super();
    const baseSpriteName: Record<AnimationName, string> = {
      "fat-kid": "FatKid/FatKid-1",
      "poor-kid": "PoorKid/PoorKid-1",
      "small-kid": "SmallKid/SmallKid-1",
    };
    this.sprite = this.scene.add.sprite(
      startingPosition.x,
      startingPosition.y,
      "master",
      baseSpriteName[animationName],
    );
    this.sprite.setScale(SCALE);

    this.scene.physics.world.enable(this.sprite);

    this.sprite.anims.play(animationName);

    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;

    this.body.collideWorldBounds = true;
    this.body.setCollideWorldBounds(true);
    this.body.immovable = true;
    this.body.setBounce(0);

    this.sprite.setData("ref", this);

    // Set key to control the child
    this.controlKey = (controlIndex + 1).toString();
  }

  setControlled(value: boolean): void {
    this.body.setVelocity(0, 0);
    this.controlled = value;
  }

  getControlKey(): string {
    return this.controlKey;
  }

  onHit(bullet: Bullet): void {
    if (this.hp <= 0) return;
    this.sprite.setTint(0xff0000);
    this.scene.time.addEvent({
      delay: 100,
      callback: () => {
        this.sprite.setTint(0xffffff);
      },
    });
    this.hp -= bullet.damage;

    new Blood(this.scene, this.body.position, 30, 50, 50);
    if (this.hp <= 0) {
      this.destroy();
    }
  }

  public destroy() {
    this.scene.time.addEvent({
      delay: 1000,
      callback: () => {
        this.sprite.destroy();
        this.body.destroy();
        this.emit("death");
      },
    });
  }

  update() {
    if (!this.controlled) {
      return;
    }

    let velocity = new Phaser.Math.Vector2(0, 0);

    if (this.keys.up?.isDown) {
      velocity.subtract(new Phaser.Math.Vector2(0, PLAYER_VELOCITY * 1.5));
    }

    if (this.keys.down?.isDown) {
      velocity.add(new Phaser.Math.Vector2(0, PLAYER_VELOCITY * 1.5));
    }

    if (this.keys.left?.isDown) {
      velocity.subtract(new Phaser.Math.Vector2(PLAYER_VELOCITY, 0));
    }

    if (this.keys.right?.isDown) {
      velocity.add(new Phaser.Math.Vector2(PLAYER_VELOCITY, 0));
    }

    if (velocity.x !== 0 && velocity.y !== 0) {
      velocity = velocity.normalize().scale(PLAYER_VELOCITY);
    }

    this.body.setVelocity(velocity.x, velocity.y);
  }

  //   private handleCollision(bodyA: Phaser.Physics.Arcade.Body, bodyB: Phaser.Physics.Arcade.Body) {
  //     if (bodyA && bodyB) {
  //       // Adjust the bounce to control the behavior of the collision
  //       const bounce = 0.01;
  //       // Adjust velocity for bodyA
  //       if (bodyA.velocity) {
  //         bodyA.setVelocity(bodyA.velocity.x * bounce, bodyA.velocity.y * bounce);
  //       }

  //       // Adjust velocity for bodyB
  //       if (bodyB.velocity) {
  //         bodyB.setVelocity(bodyB.velocity.x * bounce, bodyB.velocity.y * bounce);
  //       }
  //     }
  //   }
}
