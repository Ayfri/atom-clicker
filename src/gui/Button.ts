import * as PIXI from 'pixi.js';
import ClickableContainer from '../components/ClickableContainer.js';

export default class Button extends ClickableContainer {
	public label: PIXI.Text;
	public container: PIXI.Container;

	public constructor(texture: PIXI.Texture | string, text: string = '') {
		super(texture);

		this.container = new PIXI.Container();
		this.label = new PIXI.Text(text);
		this.label.anchor.set(1);

		this.container.addChild(this.sprite, this.label);

		this.sprite.height = this.container.height;
		this.sprite.width = this.container.width;
		this.update();
	}

	public update() {
		this.label.position.x = this.container.width / 2;
		this.label.position.y = this.container.height / 2;
	}
}
