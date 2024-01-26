import { Bullet } from "../Soliders/Bullet";
import { Blood } from "./Blood";

const PLAYER_VELOCITY = 600;

/** Player
 */
export class SickChild {
  body: Phaser.Physics.Arcade.Body;

  sprite: Phaser.GameObjects.Sprite;

  private controlled: boolean = false;
  private controlKey: string;
  hp: number = 5;

  constructor(
    private scene: Phaser.Scene,
    position: Phaser.Math.Vector2,
    private keys: Phaser.Types.Input.Keyboard.CursorKeys,
    controlIndex: number,
  ) {
    this.sprite = this.scene.add.sprite(position.x, position.y, "kuba");
    scene.physics.world.enable(this.sprite);

    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;

    this.body.collideWorldBounds = true;
    this.body.setCollideWorldBounds(true);

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
    this.sprite.setTint(0xff0000);
    this.scene.time.addEvent({
      delay: 100,
      callback: () => {
        this.sprite.setTint(0xffffff);
      },
    });
    this.hp -= bullet.damage;

    if (this.hp > 0) {
      new Blood(this.scene, this.body.position, 20, 50, 50);
    } else {
      this.destroy();
    }

    //   new FlyingCorpse(this.scene, this.body.position);
    //   new Reward(this.scene, this.body.position, this.reward);
    //   this.inventory.increaseAccountBalance(this.reward);

    //   deathCb();
    // }
  }

  public destroy() {
    this.sprite.destroy();
    this.body.destroy();
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
}
