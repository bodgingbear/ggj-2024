export interface Solider {
  foundEnemy(targetPosition: Phaser.Math.Vector2): void;
  finishShooting(): void;
}
