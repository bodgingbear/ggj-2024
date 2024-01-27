export type ChildState = "active" | "inactive" | "dead";

// CURRENT STATE MAPPING:
// kuba - active
// kacper - inactive
// bartek - dead

export class HUDController {
  private sprites!: Phaser.GameObjects.Sprite[];

  constructor(private playerCount: number) {}

  create(scene: Phaser.Scene) {
    this.sprites = Array(this.playerCount)
      .fill(0xdeadbeef)
      .map((_, i) => {
        return scene.add.sprite(20 + i * 50, 20, "kacper");
      });
  }

  public setState(state: ChildState, childIdx: number) {
    switch (state) {
      case "active":
        this.sprites[childIdx].setTexture("kuba");
        break;
      case "inactive":
        this.sprites[childIdx].setTexture("kacper");
        break;
      case "dead":
        this.sprites[childIdx].setTexture("bartek");
        break;
    }
  }
}
