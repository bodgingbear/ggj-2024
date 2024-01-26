import { SickChild } from "../objects/SickChild/SickChild";
import { BasicSoldier } from "../objects/Soliders/BasicSoldier/BasicSoldier";

export class GameScene extends Phaser.Scene {
  public constructor() {
    super({
      key: "GameScene",
    });
  }

  private sickChild!: SickChild;

  private bullets!: Phaser.GameObjects.Group;
  private soldiers!: Phaser.GameObjects.Group;
  private basicSoldier!: BasicSoldier;

  preload() {
    this.load.image("kuba", "/assets/images/credits/kuba.png");
  }

  public create(): void {
    this.physics.world.setBounds(0, 0, 1280, 720);

    const keys = this.input.keyboard!.createCursorKeys();

    this.sickChild = new SickChild(this, new Phaser.Math.Vector2(1270 / 2, 720 / 2), keys);

    this.bullets = this.physics.add.group({});
    this.soldiers = this.physics.add.group({});

    this.soldiers.add(new BasicSoldier(this, new Phaser.Math.Vector2(1280 / 2 - 300, 720 / 2), this.bullets).sprite);
    this.soldiers.add(
      new BasicSoldier(this, new Phaser.Math.Vector2(1280 / 2 + 300, 720 / 2), this.bullets, {
        rotationRange: [-20, 20],
        rotationSpeed: 0.1,
        shootInterval: 500,
      }).sprite,
    );
  }

  update(_time: number, delta: number) {
    this.sickChild.update();
    this.bullets?.getChildren().forEach((b) => b.getData("ref").update());
    this.soldiers?.getChildren().forEach((b) => b.getData("ref").update(delta));
  }
}
