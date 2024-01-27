import { EventEmitter } from "../../utils/EventEmitter/EventEmitter";

type Events = {
  level_win: () => void;
};

export class ExitManager extends EventEmitter<Events> {
  private exit!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    super();
    this.exit = scene.add.text(2200, 2000, "EXIT").setScale(4);
  }

  getExit() {
    return this.exit;
  }
}
