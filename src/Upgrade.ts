import Clickable from './Clickable.js';

interface UpgradeOptions {
	readonly name: string;
	readonly startingPrice: number;
	readonly atomsPerSecond: number;
	priceMultiplier?: number;
}

export default class Upgrade extends Clickable implements UpgradeOptions {
	public readonly name: string;
	public readonly startingPrice: number;
	public readonly atomsPerSecond: number;
	public ownedCount: number = 0;
	public priceMultiplier: number = 1.2;
	public ownerCountText: PIXI.Text;
	public priceText: PIXI.Text;
	public nameText: PIXI.Text;
	public container: PIXI.Container = new PIXI.Container();
	
	get price(): number {
		return this.startingPrice + this.priceMultiplier * this.ownedCount;
	}
	
	public constructor(options: UpgradeOptions) {
		super(PIXI.Texture.WHITE);
		this.name = options.name;
		this.startingPrice = options.startingPrice;
		this.atomsPerSecond = options.atomsPerSecond
		this.priceMultiplier = options.priceMultiplier ?? 1.2;
		
		this.sprite.height = window.innerHeight / 15;
		this.sprite.width = 50 + window.innerWidth / 10;
		
		this.ownerCountText = new PIXI.Text(this.ownedCount.toString(), {
			fontSize: 40
		});
		this.ownerCountText.anchor.set(0.5);
		this.ownerCountText.position.set(this.sprite.width - this.sprite.width / 4, this.sprite.height / 2);
		
		this.priceText = new PIXI.Text(this.price.toString(), {
			fontSize: 15
		});
		this.priceText.anchor.set(0.5);
		this.priceText.position.set(this.sprite.width / 3, this.sprite.height - this.sprite.height / 5);
		
		this.nameText = new PIXI.Text(this.name, {
			fontSize: 30
		});
		this.nameText.anchor.set(0.5);
		this.nameText.position.set(this.sprite.width / 3, this.sprite.height / 4);
		
		this.container.addChild(this.sprite, this.ownerCountText, this.priceText, this.nameText);
	}
	
	public update() {
		this.ownerCountText.text = this.ownedCount.toString();
		this.priceText.text = `${this.price.toString()} atoms`;
		
		this.sprite.height = window.innerHeight / 15;
		this.sprite.width = 50 + window.innerWidth / 10;
	}
}
