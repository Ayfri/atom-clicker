import * as PIXI from 'pixi.js';

export interface GUIOptions {
	height?: number;
	texture?: PIXI.Texture;
	width?: number;
}

export default class GUI {
	public background: PIXI.Sprite;
	public container: PIXI.Container;

	public constructor(options?: GUIOptions) {
		this.container = new PIXI.Container();

		this.background = PIXI.Sprite.from(options?.texture ?? PIXI.Texture.WHITE);
		this.background.width = options?.width ?? window.innerWidth;
		this.background.height = options?.height ?? window.innerHeight;

		this.container.addChild(this.background);
	}
}
