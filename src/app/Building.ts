import {BigFloat} from 'bigfloat.js';
import {app, game} from '../app.js';
import ClickableContainer from '../components/ClickableContainer.js';
import Overlay, {StatsType} from '../gui/Overlay.js';
import {JSONObject} from '../types.js';
import * as KeyboardManager from '../utils/KeyboardManager.js';
import {Buyable} from './Buyable';
import Game from './Game';

export interface BuildingOptions {
	readonly name: string;
	readonly description: string;
	readonly startingPrice: number;
	readonly atomsPerSecond: number;
	priceMultiplier?: number;
}

export default class Building extends ClickableContainer implements BuildingOptions, Buyable {
	public readonly name: string;

	get price(): number {
		return Math.round(this.startingPrice * this.priceMultiplier ** this.ownedCount * 100) / 100;
	}

	get canBeBought(): boolean {
		return game.atomsCount.greaterThanOrEqualTo(this.price);
	}

	public overlay: Overlay;
	public priceText: PIXI.Text;
	public nameText: PIXI.Text;
	public readonly description: string;
	public readonly startingPrice: number;
	public readonly atomsPerSecond: number;
	public priceMultiplier: number = 1.2;
	public ownedCount: number = 0;
	public ownerCountText: PIXI.Text;
	public boost: number = 1;

	public constructor(options: BuildingOptions) {
		super(PIXI.Texture.WHITE);
		this.name = options.name;
		this.description = options.description;
		this.startingPrice = options.startingPrice;
		this.atomsPerSecond = options.atomsPerSecond;
		this.priceMultiplier = options.priceMultiplier ?? 1.2;

		this.ownerCountText = new PIXI.Text(this.ownedCount.toString(), {
			fontSize: 40,
		});
		this.ownerCountText.anchor.set(0.5);
		this.ownerCountText.position.set(this.sprite.width - this.sprite.width / 5, this.sprite.height / 2);

		this.priceText = new PIXI.Text(this.price.toString(), {
			fontSize: 16,
		});
		this.priceText.anchor.set(0.5);
		this.priceText.position.set(this.sprite.width / 3, this.sprite.height - this.sprite.height / 4);

		this.nameText = new PIXI.Text(this.name, {
			fontSize: 25,
		});
		this.nameText.anchor.set(0.5);
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

		this.container.addChild(this.ownerCountText, this.priceText, this.nameText);
		app.stage.addChild(this.overlay.container);

		this.on('click', () => {
			if (this.canBeBought) {
				do {
					game.atomsCount = game.atomsCount.sub(this.price);
					this.ownedCount++;
				} while (this.canBeBought && KeyboardManager.isPressed('Shift'));
			}
		});

		this.on('hover', position => {
			this.overlay.show();
			this.overlay.update(position);
		});
		this.on('hoverMove', position => this.overlay.update(position));
		this.on('hoverEnd', () => this.overlay.hide());
	}

	get totalAtomPerSecond(): BigFloat {
		return new BigFloat(this.atomsPerSecond).mul(this.ownedCount).mul(this.boost);
	}

	public update() {
		this.sprite.tint = this.canBeBought ? 0xffffff : this.color;

		this.ownerCountText.text = this.ownedCount.toString();
		this.priceText.text = `${this.price.toString()} atoms`;

		this.sprite.height = window.innerHeight / 15;
		this.sprite.width = 100 + window.innerWidth / 8;
		this.ownerCountText.position.set(this.sprite.width - this.sprite.width / 5, this.sprite.height / 2);
		this.priceText.position.set(this.sprite.width / 3, this.sprite.height - this.sprite.height / 4);
		this.nameText.position.set(this.sprite.width / 3, this.sprite.height / 4);

		this.overlay.setAPSWaitFromPrice(this.price);
		this.overlay.stats.get(StatsType.PRICE).text = `Price: ${this.price}`;
		this.overlay.stats.get(StatsType.EFFICIENCY_TOTAL).text = `Atoms per second in total : ${this.totalAtomPerSecond.mul(10).floor().div(10)}`;
		this.overlay.stats.get(StatsType.EFFICIENCY_EACH).text = `Atoms per second for each building : ${this.atomsPerSecond * this.boost}`;
		this.overlay.stats.get(StatsType.EFFICIENCY_TOTAL_PERCENTAGE).text = `Atoms per second in total : ${new BigFloat(this.totalAtomPerSecond)
			.div(game.atomsPerSecond)
			.mul(10000)
			.floor()
			.div(100)}%`;
	}

	public toJSON() {
		let content: JSONObject = {
			i: game.buildings.indexOf(this),
		};

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

		if (Object.keys(content).join('') === 'i') return game.buildings.indexOf(this);

		return content;
	}
}

(window as any).Building = Building;