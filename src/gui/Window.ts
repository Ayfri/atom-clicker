import * as PIXI from 'pixi.js';

interface WindowOptions {
	width?: number;
	height?: number;
	texture?: PIXI.Texture;
}

export default class Window {
	public container: PIXI.Container;
	public background: PIXI.Sprite;

	public constructor(options?: WindowOptions) {
		this.container = new PIXI.Container();

		this.background = PIXI.Sprite.from(options?.texture ?? PIXI.Texture.WHITE);
		this.background.width = options?.width ?? window.innerWidth;
		this.background.height = options?.width ?? window.innerWidth;

		this.container.addChild(this.background);
	}
}
