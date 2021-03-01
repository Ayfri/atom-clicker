import * as PIXI from 'pixi.js';

interface WindowOptions {
	height?: number;
	texture?: PIXI.Texture;
	width?: number;
}

export default class GUI {
	public background: PIXI.Sprite;
	public container: PIXI.Container;

	public constructor(options?: WindowOptions) {
		this.container = new PIXI.Container();

		this.background = PIXI.Sprite.from(options?.texture ?? PIXI.Texture.WHITE);
		this.background.width = options?.width ?? window.innerWidth;
		this.background.height = options?.width ?? window.innerWidth;

		this.container.addChild(this.background);
	}
}
