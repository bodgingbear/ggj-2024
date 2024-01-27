import { EventEmitter } from "../../utils/EventEmitter/EventEmitter";
import { Bullet } from "../Soliders/Bullet";
import { Blood } from "./Blood";
import { CHANGE_PLAYER_VIEW_TIME, SCALE } from "../../constants";
import { HUDController } from "../HUDController";
import { ExitManager } from "../ExitManager/ExitManager";

const PLAYER_VELOCITY = 600;
const DOWN_ANIMATION_SUFFIX = "-down";
const UP_ANIMATION_SUFFIX = "-up";
const LEFT_ANIMATION_SUFFIX = "-left";
const RIGHT_ANIMATION_SUFFIX = "-right";

type Events = {
  death: () => void;
};

export type SickChildAnimationName = "fat-kid" | "poor-kid" | "small-kid";
const SICK_CHILD_BASE_SPRITE_NAME: Record<SickChildAnimationName, string> = {
  "fat-kid": "FatKid/FatKid-1",
  "poor-kid": "PoorKid/PoorKid-1",
  "small-kid": "SmallKid/SmallKid-1",
};

/** Player
 */
export class SickChild extends EventEmitter<Events> {
  body: Phaser.Physics.Arcade.Body;

  sprite: Phaser.GameObjects.Sprite;

  private controlled: boolean = false;
  private controlKey: string;
  hp: number = 1;

  destroyed: boolean = false;

  private hud!: HUDController;

  constructor(
    private scene: Phaser.Scene,
    startingPosition: Phaser.Math.Vector2,
    private keys: Phaser.Types.Input.Keyboard.CursorKeys,
    controlIndex: number,
    private animationName: SickChildAnimationName,
    hud: HUDController,
  ) {
    super();

    this.hud = hud;

    this.sprite = this.scene.add.sprite(
      startingPosition.x,
      startingPosition.y,
      "master",
      SICK_CHILD_BASE_SPRITE_NAME[animationName],
    );
    this.sprite.anims.play(animationName + DOWN_ANIMATION_SUFFIX);
    this.sprite.setScale(SCALE);

    this.scene.physics.world.enable(this.sprite);

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
    if (value === this.controlled) {
      return;
    }

    if (value) {
      this.scene.cameras.main.pan(
        this.sprite.x,
        this.sprite.y,
        CHANGE_PLAYER_VIEW_TIME,
        "Sine.easeInOut",
        false,
        (camera, animationProgress) => {
          if (animationProgress === 1) {
            camera.startFollow(this.sprite);
          }
        },
      );
    }

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

    new Blood(this.scene, this.body.position, 100, 50, 50);
    if (this.hp <= 0) {
      this.destroy();
    }
  }

  winLevel(exitManager: ExitManager, currentChildCount: number) {
    this.sprite.destroy();
    if (currentChildCount === 1) {
      exitManager.emit("level_win");
    }
  }

  public destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.scene.time.addEvent({
      delay: 1000,
      callback: () => {
        this.sprite.destroy();
        this.body.destroy();
        this.emit("death");

        this.hud.setState("dead", parseInt(this.controlKey) - 1);
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

    if (this.body.velocity.x > 0) {
      this.sprite.play(this.animationName + RIGHT_ANIMATION_SUFFIX, true);
    } else if (this.body.velocity.x < 0) {
      this.sprite.play(this.animationName + LEFT_ANIMATION_SUFFIX, true);
    } else if (this.body.velocity.y > 0) {
      this.sprite.play(this.animationName + DOWN_ANIMATION_SUFFIX, true);
    } else if (this.body.velocity.y < 0) {
      this.sprite.play(this.animationName + UP_ANIMATION_SUFFIX, true);
    }
  }
}
