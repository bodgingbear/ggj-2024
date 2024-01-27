const BOTTOM_LINE_Y = 650;
const COUNTER_X = 100;

export class Counter {
  counterText: Phaser.GameObjects.Text;
  counter: number = 1;

  constructor(private scene: Phaser.Scene) {
    this.counterText = this.scene.add.text(COUNTER_X, BOTTOM_LINE_Y, String(this.counter), {
      fontSize: 24,
    });
  }

  increaseCounter = () => {
    this.counter++;
    this.counterText.text = String(this.counter);
  };

  decreaseCounter = () => {
    this.counter--;
    this.counterText.text = String(this.counter);
  };

  onCounterChange = (amount: number) => {
    this.counter = amount;
    this.counterText.text = String(this.counter);
  };
}
