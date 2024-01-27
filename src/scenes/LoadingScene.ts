import { TEAM } from "../constants";
import { FontFile } from "../components/FontFile/FontFile";
import { loadAsset } from "../utils/loadAsset/loadAsset";
import { shouldSkipIntro } from "../utils/shouldSkipIntro/shouldSkipIntro";
import { shouldSkipMenu } from "../utils/shouldSkipMenu/shouldSkipMenu";

export class LoadingScene extends Phaser.Scene {
  private introImage!: Phaser.GameObjects.Sprite;

  private timesLooped = 0;

  private animStopped = false;

  public constructor() {
    super({
      key: "LoadingScene",
    });
  }

  private loadAssets() {
    // Assets go here
    this.load.video("demo", loadAsset("videos/demo.mp4"), true);

    this.load.image("kacper", loadAsset("images/credits/kacper.png"));
    this.load.image("kuba", loadAsset("images/credits/kuba.png"));
    this.load.image("bartek", loadAsset("images/credits/bartek.png"));
    this.load.image("rafal", loadAsset("images/credits/rafal.png"));

    this.load.multiatlas("master", "atlas/atlas.json", "atlas");
    this.load.image("base_tiles", loadAsset("maps/tilemap.png"));
    this.load.tilemapTiledJSON("tilemap", loadAsset("maps/tilemap.tmj"));

    this.load.addFile(
      new FontFile(this.load, "Press Start 2P", {
        custom: ["Courier", "Press Start 2P"],
      }),
    );
  }

  public preload(): void {
    if (!shouldSkipIntro()) {
      this.showLoadingAnimation();
    }

    this.loadAssets();
    this.loadCreditsAssets();
  }

  private setupAnimations() {
    this.anims.create({
      key: "fat-kid-left",
      frames: this.anims.generateFrameNames("master", {
        start: 1,
        end: 2,
        prefix: "FatKid/FatKid-",
      }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: "fat-kid-right",
      frames: this.anims.generateFrameNames("master", {
        start: 3,
        end: 4,
        prefix: "FatKid/FatKid-",
      }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: "fat-kid-down",
      frames: this.anims.generateFrameNames("master", {
        start: 5,
        end: 6,
        prefix: "FatKid/FatKid-",
      }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: "fat-kid-up",
      frames: this.anims.generateFrameNames("master", {
        start: 7,
        end: 8,
        prefix: "FatKid/FatKid-",
      }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: "poor-kid-left",
      frames: this.anims.generateFrameNames("master", {
        start: 1,
        end: 2,
        prefix: "PoorKid/PoorKid-",
      }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: "poor-kid-right",
      frames: this.anims.generateFrameNames("master", {
        start: 3,
        end: 4,
        prefix: "PoorKid/PoorKid-",
      }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: "poor-kid-down",
      frames: this.anims.generateFrameNames("master", {
        start: 5,
        end: 6,
        prefix: "PoorKid/PoorKid-",
      }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: "poor-kid-up",
      frames: this.anims.generateFrameNames("master", {
        start: 7,
        end: 8,
        prefix: "PoorKid/PoorKid-",
      }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: "small-kid-left",
      frames: this.anims.generateFrameNames("master", {
        start: 1,
        end: 2,
        prefix: "SmallKid/SmallKid-",
      }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: "small-kid-right",
      frames: this.anims.generateFrameNames("master", {
        start: 3,
        end: 4,
        prefix: "SmallKid/SmallKid-",
      }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: "small-kid-down",
      frames: this.anims.generateFrameNames("master", {
        start: 5,
        end: 6,
        prefix: "SmallKid/SmallKid-",
      }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: "small-kid-up",
      frames: this.anims.generateFrameNames("master", {
        start: 7,
        end: 8,
        prefix: "SmallKid/SmallKid-",
      }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: "girl-left",
      frames: this.anims.generateFrameNames("master", {
        start: 1,
        end: 2,
        prefix: "Girl/Girl-",
      }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: "girl-right",
      frames: this.anims.generateFrameNames("master", {
        start: 3,
        end: 4,
        prefix: "Girl/Girl-",
      }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: "girl-down",
      frames: this.anims.generateFrameNames("master", {
        start: 5,
        end: 6,
        prefix: "Girl/Girl-",
      }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: "girl-up",
      frames: this.anims.generateFrameNames("master", {
        start: 7,
        end: 8,
        prefix: "Girl/Girl-",
      }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: "basic-soldier",
      frames: this.anims.generateFrameNames("master", {
        start: 1,
        end: 2,
        prefix: "BasicSoldier/BasicSoldier-",
      }),
      frameRate: 6,
      repeat: -1,
    });
  }

  public create(): void {
    this.setupAnimations();
  }

  public update(): void {
    if (shouldSkipIntro()) {
      this.changeScene();
      return;
    }

    if (!this.animStopped && this.timesLooped > 2) {
      this.playEndingAnimation();
    }
  }

  private showLoadingAnimation = () => {
    this.introImage = this.add.sprite(0, 0, "intro", 11);
    this.introImage.setOrigin(0, 0);
    this.introImage.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

    this.introImage.anims.play("intro-start");
    this.introImage.anims.chain("intro-loop");

    this.introImage.on("animationrepeat", (animation: Phaser.Animations.Animation): void => {
      if (animation.key === "intro-loop") {
        this.timesLooped += 1;
      }
    });
  };

  private playEndingAnimation = () => {
    this.animStopped = true;
    this.introImage.anims.stop();
    this.introImage.anims.playReverse("intro-start");
    this.introImage.on("animationcomplete", this.changeScene);
  };

  private loadCreditsAssets = () => {
    this.load.image("credits_logo", loadAsset("images/credits/logo.png"));
    this.load.image("credits_logo_hover", loadAsset("images/credits/logo_outline.png"));
    this.load.image("credits_background", loadAsset("images/credits/gradient.png"));
    for (const { imageKey, imagePath } of TEAM) {
      this.load.image(imageKey, loadAsset(imagePath));
    }
  };

  private changeScene = () => {
    if (shouldSkipMenu()) {
      this.scene.start("GameScene");
    } else {
      this.scene.start("MainMenuScene");
    }
  };
}
