import "phaser";

import "./analytics";
import "./index.css";

import { BootScene } from "./scenes/BootScene";
import { LoadingScene } from "./scenes/LoadingScene";
import { MainMenuScene } from "./scenes/MainMenuScene";
import { GameScene } from "./scenes/GameScene";
import { HowToPlayScene } from "./scenes/HowToPlayScene";
import { CreditsScene } from "./scenes/CreditsScene";
import { HUDScene } from "./scenes/HUDScene";
import { GameOverScene } from "./scenes/GameOverScene";

const game = new Phaser.Game({
  type: Phaser.AUTO,
  banner: true,
  width: 1920,
  height: 1080,
  scene: [BootScene, LoadingScene, MainMenuScene, GameScene, HowToPlayScene, CreditsScene, HUDScene, GameOverScene],
  scale: {
    parent: "app",
    mode: Phaser.Scale.FIT,
    width: 1280,
    height: 720,
  },
  physics: {
    default: "arcade",
    arcade:
      import.meta.env.VITE_DEBUG_MODE === "true"
        ? {
            debug: true,
            debugShowBody: true,
            debugShowStaticBody: true,
            debugShowVelocity: true,
            debugVelocityColor: 0xffff00,
            debugBodyColor: 0x0000ff,
            debugStaticBodyColor: 0xffffff,
          }
        : {},
  },
  pixelArt: true,
});

window.addEventListener("load", (): Phaser.Game => game);
