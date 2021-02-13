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
	
	get price(): number {
		return this.startingPrice + this.priceMultiplier * this.ownedCount;
	}
	
	public constructor(options: UpgradeOptions) {
		super(PIXI.Texture.WHITE);
		this.name = options.name;
		this.startingPrice = options.startingPrice;
		this.atomsPerSecond = options.atomsPerSecond
		this.priceMultiplier = options.priceMultiplier ?? 1.2;
		
		this.sprite.height = window.innerHeight / 10;
		this.sprite.width = 50 + window.innerWidth / 10;
		
		const style = {
			fontSize: 20
		}
		this.ownerCountText = new PIXI.Text(this.ownedCount.toString(), style);
		this.ownerCountText.anchor.set(0.5);
		this.sprite.addChild(this.ownerCountText);
		
		this.priceText = new PIXI.Text(this.price.toString(), style);
		this.priceText.anchor.set(0.5);
		this.sprite.addChild(this.priceText);
		
		this.nameText = new PIXI.Text(this.name, style);
		this.nameText.anchor.set(0.5);
//		this.nameText.width = 10;
		this.sprite.addChild(this.nameText);
	}
	
	public update() {
		this.ownerCountText.text = this.ownedCount.toString();
		this.priceText.text = this.price.toString();
		
		this.sprite.height = window.innerHeight / 10;
		this.sprite.width = 50 + window.innerWidth / 10;
	}
}
