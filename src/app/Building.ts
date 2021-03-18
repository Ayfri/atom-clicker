import {BigFloat} from 'bigfloat.js';
import * as PIXI from 'pixi.js';
import {app, game} from '../app.js';
import Overlay, {StatsType} from '../gui/Overlay.js';
import {JSONObject} from '../types.js';
import * as KeyboardManager from '../utils/KeyboardManager.js';
import {Buyable} from './Buyable';
import Game from './Game';

export interface BuildingOptions {
	readonly atomsPerSecond: number;
	readonly description: string;
	readonly name: string;
	priceMultiplier?: number;
	readonly startingPrice: number;
}

export default class Building extends Buyable implements BuildingOptions {
	public readonly atomsPerSecond: number;
	public priceMultiplier: number = 1.2;
	public readonly startingPrice: number;
	public boost: number = 1;
	public ownedCount: number = 0;
	public ownerCountText: PIXI.Text;

	public constructor(options: BuildingOptions) {
		super(PIXI.Texture.WHITE, options.name);
		this.description = options.description;
		this.startingPrice = options.startingPrice;
		this.atomsPerSecond = options.atomsPerSecond;
		this.priceMultiplier = options.priceMultiplier ?? 1.2;

		this.ownerCountText = new PIXI.Text(this.ownedCount.toString(), {fontSize: 40});
		this.ownerCountText.anchor.set(0.5);
		this.ownerCountText.position.set(this.sprite.width - this.sprite.width / 5, this.sprite.height / 2);

		this.priceText.style.fontSize = 16;
		this.priceText.position.set(this.sprite.width / 3, this.sprite.height - this.sprite.height / 4);

		this.nameText.style.fontSize = 25;
		this.nameText.position.set(this.sprite.width / 3, this.sprite.height / 4);

		this.overlay = new Overlay({
			title: this.name,
			description: this.description,
			stats: {
				PRICE: new PIXI.Text(''),
				EFFICIENCY_TOTAL: new PIXI.Text(''),
				EFFICIENCY_EACH: new PIXI.Text(''),
				EFFICIENCY_TOTAL_PERCENTAGE: new PIXI.Text(''),
				APS_WAIT_TIME: new PIXI.Text(''),
			},
		});

		this.container.addChild(this.ownerCountText);
		app.stage.addChild(this.overlay.container);
	}

	get totalAtomPerSecond(): BigFloat {
		return new BigFloat(this.atomsPerSecond).mul(game.buildingsGlobalBoost).mul(this.ownedCount).mul(this.boost).mul(1000).floor().div(1000);
	}

	public buy() {
		if (!this.canBeBought) return;
		this.update();
		do {
			game.atomsCount = game.atomsCount.sub(this.price);
			this.ownedCount++;
		} while (this.canBeBought && KeyboardManager.isPressed('Shift'));
	}

	get price(): number {
		return Math.round(this.startingPrice * this.priceMultiplier ** this.ownedCount);
	}

	public priceText: PIXI.Text;

	public resize() {
		this.sprite.height = window.innerHeight / 15;
		this.sprite.width = 100 + window.innerWidth / 8;
		this.ownerCountText.position.set(this.sprite.width - this.sprite.width / 5, this.sprite.height / 2);
		this.priceText.position.set(this.sprite.width / 3, this.sprite.height - this.sprite.height / 4);
		this.nameText.position.set(this.sprite.width / 3, this.sprite.height / 4);
	}

	public toJSON(): JSONObject | number {
		let content: JSONObject = {};

		if (this.boost > 1) content.b = this.boost;
		if (this.ownedCount > 0) content.o = this.ownedCount;

		if (!Game.isDefaultBuyable(this)) {
			content = {
				n: this.name,
				a: this.atomsPerSecond,
				s: this.startingPrice,
			};

			if (this.priceMultiplier !== 1.2) content.p = this.priceMultiplier;

			if (this.description) content.d = this.description;
		}

		return !Object.keys(content).length ? Game.getBuyableIndex(this, 'building') : content;
	}

	public updateOverlayValues(): void {
		this.overlay.setAPSWaitFromPrice(this.price);
		this.overlay.stats.get(StatsType.PRICE).text = `Price: ${this.price}`;
		this.overlay.stats.get(StatsType.EFFICIENCY_TOTAL).text = `Atoms per second in total : ${this.totalAtomPerSecond.mul(10).floor().div(10)}`;
		this.overlay.stats.get(StatsType.EFFICIENCY_EACH).text = `Atoms per second for each building : ${Math.floor(this.atomsPerSecond * this.boost * 10) / 10}`;
		this.overlay.stats.get(StatsType.EFFICIENCY_TOTAL_PERCENTAGE).text = `Atoms per second in total : ${this.totalAtomPerSecond
			.div(game.atomsPerSecond)
			.mul(10000)
			.floor()
			.div(100)}%`;
	}

	public update() {
		super.update();
		this.sprite.tint = this.canBeBought ? 0xffffff : this.color;

		this.ownerCountText.text = this.ownedCount.toString();
		this.priceText.text = `${this.price.toString()} atoms`;

		if (this.overlay.container.visible) {
			this.updateOverlayValues();
		}
	}
}

(window as any).Building = Building;
