import * as PIXI from 'pixi.js';
import { Button } from '../client/MouseManager.js';
import EventEmitter from '../utils/EventEmitter.js';
import { getTextureByName } from '../utils/utils.js';

export type ClickableEvents = {
	click: [button: Button, position: PIXI.Point];
	update: [];
};

export default class Clickable extends EventEmitter<ClickableEvents> {
	sprite: PIXI.Sprite;

	public constructor(textureName: string);
	public constructor(texture: PIXI.Texture);
	public constructor(texture: PIXI.Texture | string) {
		super();

		if (typeof texture === 'string') {
			const textureName = texture;
			texture = getTextureByName(textureName);
			if (!texture) throw new Error(`Texture '${textureName}' not found.`);
		}

		this.sprite = PIXI.Sprite.from(texture);
		this.sprite.interactive = true;
		this.sprite.buttonMode = true;
		this.sprite.on('click', (event: PIXI.InteractionEvent) => {
			this.emit('click', new Button(event.data.button), event.data.global);
		});
	}
}
