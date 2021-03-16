import * as PIXI from 'pixi.js';
import {game} from '../app';
import ClickableContainer from '../components/ClickableContainer';
import Overlay from '../gui/Overlay.js';
import {JSONObject} from '../types.js';

export abstract class Buyable extends ClickableContainer {
	public container: PIXI.Container;
	public description: string;
	public readonly name: string;
	public nameText: PIXI.Text;
	public overlay: Overlay;
	public priceText?: PIXI.Text;

	protected constructor(texture: PIXI.Texture | string, name: string) {
		super(texture);
		this.name = name;
		this.nameText = new PIXI.Text(this.name);
		this.nameText.anchor.set(0.5);
		this.priceText = new PIXI.Text('');
		this.priceText.anchor.set(0.5);

		this.on('click', () => this.buy());
		this.on('hover', position => {
			this.overlay.resize(position);
			this.overlay.show();
			this.overlay.resize(position);
			this.updateOverlayValues();
		});
		this.on('hoverMove', position => this.overlay.move(position));
		this.on('hoverEnd', () => this.overlay.hide());

		this.container.addChild(this.nameText, this.priceText);
	}

	get canBeBought(): boolean {
		return game.atomsCount.greaterThan(this.price - 1);
	}

	public abstract get price(): number;

	public abstract updateOverlayValues?(): void;

	public abstract buy(): void;

	public abstract resize(): void;

	public abstract toJSON(): JSONObject | number;
}
