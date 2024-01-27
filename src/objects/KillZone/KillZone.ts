import { EventEmitter } from "../../utils/EventEmitter/EventEmitter";
import { KillZoneHealthBar } from "./KillZoneHealthBar";

type Events = {
  child_in_kill_zone: () => void;
  child_off_kill_zone: () => void;
};

const KILLZONE_RADIUS = 200;
const KILLZONE_RADIUS_ALPHA = 0.1;

const SINGLE_ATTACK_DAMAGE = 25;

export class KillZone extends EventEmitter<Events> {
  zone!: Phaser.GameObjects.Arc;

  healthBar!: KillZoneHealthBar;

  constructor() {
    super();
  }

  activateKillZoneOnSprite(gameObject: Phaser.GameObjects.Sprite | Phaser.GameObjects.Container, scene: Phaser.Scene) {
    this.zone = scene.add.circle(gameObject.x, gameObject.y, KILLZONE_RADIUS, 0x2fffff, KILLZONE_RADIUS_ALPHA);
    scene.physics.world.enable(this.zone);

    this.healthBar = new KillZoneHealthBar(gameObject, scene);
    this.healthBar.on("HAHAHA_attack", this.handleHaHaHaAttack);

    this.zone.setData("ref", this);
  }

  handleHaHaHaAttack = () => {
    console.log("HAHAHA ATTACK!");

    // const isChildInTheZone = this.zone.getData("isActive");
    // if (isChildInTheZone) {
    this.healthBar.decreaseHealthBy(SINGLE_ATTACK_DAMAGE);
    // }
  };

  getKillZone() {
    return this.zone;
  }
}
