import * as PIXI from 'pixi.js';
import Clickable from './Clickable';

export default class ClickableContainer extends Clickable {
	public color: number = 0xd0d0d0;
	public container: PIXI.Container;
	public hoverColor: number = 0xeeeeee;

	public constructor(texture: PIXI.Texture | string) {
		super(texture);
		this.container = new PIXI.Container();
		this.container.addChild(this.sprite);
	}

	public update() {
		this.sprite.tint = this.hover ? this.hoverColor : this.color;
	}
}
