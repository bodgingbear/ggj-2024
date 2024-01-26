export const BULLET_VELOCITY = -900;

export class Bullet {
  body: Phaser.Physics.Arcade.Body;
  sprite: Phaser.GameObjects.GameObject;

  constructor(
    private scene: Phaser.Scene,
    position: Phaser.Math.Vector2,
    xVelocity: number = BULLET_VELOCITY,
    yVelocity: number = BULLET_VELOCITY,
    public damage = 1,
  ) {
    this.sprite = this.scene.add.circle(position.x, position.y, 2, 0xd9c078);

    this.scene.physics.world.enable(this.sprite);

    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;

    this.sprite.setData("ref", this);

    this.body.velocity.x = xVelocity;
    this.body.velocity.y = yVelocity;
  }

  destroy() {
    this.sprite.destroy();
  }

  update() {
    // TODO: Check collisions with objects, and if in bounds of the map.
  }
}
