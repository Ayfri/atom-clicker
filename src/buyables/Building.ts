import { game } from '../app.js';
import Clickable from '../Clickable.js';
import { Buyable } from './Buyable.js';

interface UpgradeOptions {
	readonly name: string;
	readonly startingPrice: number;
	readonly atomsPerSecond: number;
	priceMultiplier?: number;
}

export default class Building extends Clickable implements UpgradeOptions, Buyable {
	public readonly name: string;
	public readonly startingPrice: number;
	public readonly atomsPerSecond: number;
	public priceMultiplier: number = 1.2;
	public ownedCount: number = 0;
	public ownerCountText: PIXI.Text;
	public priceText: PIXI.Text;
	public nameText: PIXI.Text;
	public container: PIXI.Container = new PIXI.Container();
	public boost: number = 1;

	public constructor(options: UpgradeOptions) {
		super(PIXI.Texture.WHITE);
		this.name = options.name;
		this.startingPrice = options.startingPrice;
		this.atomsPerSecond = options.atomsPerSecond;
		this.priceMultiplier = options.priceMultiplier ?? 1.2;

		this.sprite.height = window.innerHeight / 15;
		this.sprite.width = 100 + window.innerWidth / 8;

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

		this.container.addChild(this.sprite, this.ownerCountText, this.priceText, this.nameText);

		this.on('click', () => {
			if (this.canBeBought) {
				game.atomsCount = game.atomsCount.sub(this.price);
				this.ownedCount++;
			}
		});
	}

	get price(): number {
		return Math.round(this.startingPrice * this.priceMultiplier ** this.ownedCount * 100) / 100;
	}

	get canBeBought(): boolean {
		return game.atomsCount.greaterThanOrEqualTo(this.price);
	}

	get totalAtomPerSecond(): number {
		return this.atomsPerSecond * this.ownedCount * this.boost;
	}

	public update() {
		this.sprite.tint = this.canBeBought ? 0xffffff : 0xdddddd;

		this.ownerCountText.text = this.ownedCount.toString();
		this.priceText.text = `${this.price.toString()} atoms`;

		this.sprite.height = window.innerHeight / 15;
		this.sprite.width = 100 + window.innerWidth / 8;
		this.ownerCountText.position.set(this.sprite.width - this.sprite.width / 5, this.sprite.height / 2);
		this.priceText.position.set(this.sprite.width / 3, this.sprite.height - this.sprite.height / 4);
		this.nameText.position.set(this.sprite.width / 3, this.sprite.height / 4);
	}
}
