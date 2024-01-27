import { SCALE } from "../../constants";
import { EventEmitter } from "../../utils/EventEmitter/EventEmitter";

type Events = {
  level_win: () => void;
};

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class ExitManager extends EventEmitter<Events> {
  private exitGroup!: Phaser.Physics.Arcade.Group;

  constructor(scene: Phaser.Scene, rects: Rect[]) {
    super();

    this.exitGroup = scene.physics.add.group();
    rects.forEach((rectData) => {
      const rect = scene.add.rectangle(0, 0, 0, 0, 0x00ff00);
      // rect.setVisible(false);

      rect.setOrigin(0, 0);
      rect.setSize(rectData.width * SCALE, rectData.height * SCALE);
      rect.setPosition(rectData.x * SCALE, rectData.y * SCALE);

      this.exitGroup.add(rect);
    });
  }

  getExitGroup() {
    return this.exitGroup;
  }
}
