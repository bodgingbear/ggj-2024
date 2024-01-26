export const BULLET_VELOCITY = 1000;

export class Bullet {
  body: Phaser.Physics.Arcade.Body;
  sprite: Phaser.GameObjects.GameObject;

  constructor(
    private scene: Phaser.Scene,
    position: Phaser.Math.Vector2,
    private direction: Phaser.Math.Vector2,
    public damage = 1,
  ) {
    this.sprite = this.scene.add.circle(position.x, position.y, 8, 0xd9c078);

    this.scene.physics.world.enable(this.sprite);

    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;

    this.sprite.setData("ref", this);
  }

  destroy() {
    this.sprite.destroy();
  }

  update() {
    this.body.setVelocity(this.direction.x * BULLET_VELOCITY, this.direction.y * BULLET_VELOCITY);
    // TODO: Check collisions with objects, and if in bounds of the map.
  }
}
