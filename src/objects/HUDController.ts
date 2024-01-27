export type ChildState = "active" | "inactive" | "dead";

// CURRENT STATE MAPPING:
// kuba - active
// kacper - inactive
// bartek - dead

export class HUDController {
  private childSprites!: Phaser.GameObjects.Sprite[];

  constructor(private playerCount: number) {}

  create(scene: Phaser.Scene) {
    this.childSprites = Array(this.playerCount)
      .fill(0xdeadbeef)
      .map((_, i) => {
        return scene.add.sprite(40 + i * 60, 40, "kacper");
      });
  }

  public setState(state: ChildState, childIdx: number) {
    switch (state) {
      case "active":
        this.childSprites[childIdx].setTexture("kuba");
        break;
      case "inactive":
        this.childSprites[childIdx].setTexture("kacper");
        break;
      case "dead":
        this.childSprites[childIdx].setTexture("bartek");
        break;
    }
  }
}
