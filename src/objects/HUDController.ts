import { SCALE } from "../constants";
import { assertNever } from "../utils/assertNever/assertNever";
import { SICK_CHILD_BASE_SPRITE_NAME, SickChild, SickChildAnimationName } from "./SickChild/SickChild";

export type ChildState = "active" | "inactive" | "dead" | "saved";

const GAP = 4 * SCALE;
const TILE_WIDTH = 15 * SCALE;
const FRAME_TOP_OFFSET = 3 * SCALE;
const TEXT_GAP = 2 * SCALE;

class PlayerTile {
  public state!: ChildState;

  private frameSprite: Phaser.GameObjects.Sprite;
  private avatarSprite: Phaser.GameObjects.Sprite;
  private maskSprite: Phaser.GameObjects.Sprite;
  private backgroundSprite: Phaser.GameObjects.Sprite;
  private controlKeyText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, animationName: SickChildAnimationName, controlKey: string) {
    this.backgroundSprite = scene.add.sprite(0, 0, "master", "UI/Frame/ActiveBackground");
    this.backgroundSprite.setScale(SCALE);
    this.backgroundSprite.setOrigin(0, 0);
    this.backgroundSprite.setPosition(x, y);

    this.maskSprite = scene.add.sprite(0, 0, "master", "UI/Frame/Mask");
    this.maskSprite.setScale(SCALE);
    this.maskSprite.setOrigin(0, 0);
    this.maskSprite.setPosition(x, y);
    this.maskSprite.setVisible(false);

    this.avatarSprite = scene.add.sprite(0, 0, "master", SICK_CHILD_BASE_SPRITE_NAME[animationName] + "5");
    this.avatarSprite.setScale(SCALE);
    this.avatarSprite.setOrigin(0.5, 0);
    this.avatarSprite.setPosition(x + this.backgroundSprite.displayWidth / 2, y + FRAME_TOP_OFFSET);

    this.frameSprite = scene.add.sprite(0, 0, "master", "UI/Frame/Active");
    this.frameSprite.setScale(SCALE);
    this.frameSprite.setOrigin(0, 0);
    this.frameSprite.setPosition(x, y);

    this.controlKeyText = scene.add.text(0, 0, controlKey);
    this.controlKeyText.setOrigin(0.5, 0);
    this.controlKeyText.setPosition(x + this.backgroundSprite.displayWidth / 2, y + TILE_WIDTH + TEXT_GAP);

    const mask = this.maskSprite.createBitmapMask();
    this.avatarSprite.setMask(mask);

    this.setState("inactive");
  }

  public setState(state: ChildState) {
    this.state = state;

    switch (state) {
      case "active":
        this.frameSprite.setTexture("master", "UI/Frame/Active");
        this.backgroundSprite.setTexture("master", "UI/Frame/ActiveBackground");
        this.avatarSprite.setAlpha(1);
        this.frameSprite.setAlpha(1);
        this.backgroundSprite.setAlpha(1);
        this.controlKeyText.setColor("#ffd506");

        break;
      case "inactive":
        this.frameSprite.setTexture("master", "UI/Frame/Inactive");
        this.backgroundSprite.setTexture("master", "UI/Frame/InactiveBackground");
        this.avatarSprite.setAlpha(1);
        this.frameSprite.setAlpha(0);
        this.backgroundSprite.setAlpha(0.5);
        this.controlKeyText.setColor("#ffffff");

        break;
      case "dead":
        this.frameSprite.setTexture("master", "UI/Frame/Dead");
        this.backgroundSprite.setTexture("master", "UI/Frame/DeadBackground");
        this.avatarSprite.setAlpha(0.5);
        this.frameSprite.setAlpha(1);
        this.backgroundSprite.setAlpha(1);
        this.controlKeyText.setAlpha(0.5);
        this.controlKeyText.setColor("#ffffff");

        break;
      case "saved":
        this.frameSprite.setTexture("master", "UI/Frame/Saved");
        this.backgroundSprite.setTexture("master", "UI/Frame/SavedBackground");
        this.avatarSprite.setAlpha(0.5);
        this.frameSprite.setAlpha(1);
        this.backgroundSprite.setAlpha(1);
        this.controlKeyText.setColor("#37ba12");

        break;
      default:
        assertNever(state);
    }
  }
}

export class HUDController {
  private playerTiles: PlayerTile[] = [];

  constructor(
    private scene: Phaser.Scene,
    private players: Phaser.GameObjects.Group,
  ) {
    this.scene.scene.run("HUDScene", { controller: this });
  }

  create(scene: Phaser.Scene) {
    const playersList = this.players.getChildren();

    for (let i = 0; i < playersList.length; i++) {
      const player = playersList[i].getData("ref") as SickChild;

      this.playerTiles.push(
        new PlayerTile(scene, GAP + i * (TILE_WIDTH + GAP), GAP, player.getAnimationName(), player.getControlKey()),
      );
    }
  }

  public setState(state: ChildState, childIdx: number) {
    this.playerTiles[childIdx].setState(state);
  }

  // public getChildState(childIdx: number): ChildState {
  //   return this.playerTiles[childIdx].state;
  // }
}
