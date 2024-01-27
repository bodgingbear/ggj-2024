import { KillZoneHealthBar } from "./KillZoneHealthBar";

const KILLZONE_RADIUS = 200;
const KILLZONE_RADIUS_ALPHA = 0.1;

export class KillZone {
  zone!: Phaser.GameObjects.Arc;

  healthBar!: KillZoneHealthBar;

  constructor() {}

  activateKillZoneOnSprite(gameObject: Phaser.GameObjects.Sprite | Phaser.GameObjects.Container, scene: Phaser.Scene) {
    this.zone = scene.add.circle(gameObject.x, gameObject.y, KILLZONE_RADIUS, 0x2fffff, KILLZONE_RADIUS_ALPHA);
    scene.physics.world.enable(this.zone);

    this.healthBar = new KillZoneHealthBar(gameObject, scene);

    this.zone.setData("ref", this);
  }

  getKillZone() {
    return this.zone;
  }
}
