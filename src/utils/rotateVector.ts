export function rotateVector(rotation: number, vec = new Phaser.Math.Vector2(1, 0)) {
  // Convert angle to radians
  const angleRadians = (rotation * Math.PI) / 180;

  // Calculate new coordinates after rotation
  const newX = vec.x * Math.cos(angleRadians) - vec.y * Math.sin(angleRadians);
  const newY = vec.x * Math.sin(angleRadians) + vec.y * Math.cos(angleRadians);

  // Return the new coordinates as an object
  return new Phaser.Math.Vector2(newX, newY);
}
