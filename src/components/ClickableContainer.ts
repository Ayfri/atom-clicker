import PIXI from 'pixi.js';
import Clickable from './Clickable.js';

export default class ClickableContainer extends Clickable {
	public container: PIXI.Container;

	public constructor(texture: PIXI.Texture | string) {
		super(texture);
		this.container = new PIXI.Container();
		this.container.addChild(this.sprite);
	}
}
