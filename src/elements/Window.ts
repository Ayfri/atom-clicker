import * as PIXI from 'pixi.js';
import * as PUXI from '@puxi/core';

interface WindowOptions {
	width?: number;
	height?: number;
}

export default class Window {
	public container: PIXI.Container;
	public puxiStage: PUXI.Stage;

	public constructor(options?: WindowOptions) {
		this.container = new PIXI.Container();
		this.puxiStage = new PUXI.Stage(options.width ?? window.innerWidth, options.height ?? window.innerHeight);
		this.container.addChild(this.puxiStage);
	}

	public addElement(...elements: Array<PIXI.DisplayObject | PUXI.Widget>) {
		elements.forEach((element: PIXI.DisplayObject | PUXI.Widget) => {
			if (element instanceof PIXI.DisplayObject) this.container.addChild(element);
			else this.puxiStage.addChild(element);
		})
	}
}
