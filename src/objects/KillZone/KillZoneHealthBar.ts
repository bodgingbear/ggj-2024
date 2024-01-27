import { EventEmitter } from "../../utils/EventEmitter/EventEmitter";

const BAR_WIDTH = 100;
const BAR_HEIGHT = 10;
const BAR_Y_OFFSET = 90;

const STARTING_HEALTH_LVL = 100;

type Events = {
  HAHAHA_attack: () => void;
};

export class KillZoneHealthBar extends EventEmitter<Events> {
  bar: Phaser.GameObjects.Rectangle;
  healthLvl!: number;

  constructor(
    gameObject: Phaser.GameObjects.Sprite | Phaser.GameObjects.Container,
    private scene: Phaser.Scene,
  ) {
    super();

    this.bar = this.scene.add.rectangle(gameObject.x, gameObject.y - BAR_Y_OFFSET, BAR_WIDTH, BAR_HEIGHT, 0xc20c0c);
    this.hide();
    this.setHealth(STARTING_HEALTH_LVL);
  }

  show() {
    this.bar.setAlpha(1);
  }

  hide() {
    this.bar.setAlpha(0);
  }

  setBarWidth(width: number) {
    this.bar.displayWidth = width;
  }

  setHealth(health: number) {
    this.healthLvl = health;
    this.setBarWidth(this.healthLvl);
  }

  decreaseHealthBy(amount: number) {
    if (this.healthLvl <= 0) {
      return;
    }

    this.healthLvl = this.healthLvl - amount;
    this.setHealth(this.healthLvl);
    console.log(this.healthLvl);
  }
}
