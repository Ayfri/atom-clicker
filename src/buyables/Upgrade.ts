import { BigFloat } from 'bigfloat.js';
import * as PIXI from 'pixi.js';
import { game } from '../app.js';
import Clickable from '../Clickable.js';
import { Buyable } from './Buyable.js';

interface UpgradeOptions {
	readonly name: string;
	readonly description?: string;
	price: number;
}

interface NumberedUpgrade {
	multiplier?: number;
	addition?: number;
}

interface BuildingUpgrade extends NumberedUpgrade {
	building: string;
	kind: 'building';
}

interface ClickAPSUpgrade extends NumberedUpgrade {
	kind: 'clickAPS'
}

interface ClickUpgrade extends NumberedUpgrade {
	kind: 'click';
}

interface BuildingGlobalUpgrade extends NumberedUpgrade {
	kind: 'buildingGlobal';
}

export type UpgradeType = BuildingUpgrade | ClickUpgrade | BuildingGlobalUpgrade | ClickAPSUpgrade;

export default class Upgrade<T extends UpgradeType> extends Clickable implements UpgradeOptions, Buyable {
	public readonly name: string;
	public readonly description: string;
	public price: number;
	
	public get canBeBought(): boolean {
		return game.atomsCount.greaterThanOrEqualTo(this.price);
	}
	
	public container: PIXI.Container;
	public effectText: PIXI.Text;
	public nameText: PIXI.Text;
	public priceText: PIXI.Text;
	public owned: boolean = false;
	public effect: T;
	
	public constructor(options: UpgradeOptions, effect: T) {
		super(PIXI.Texture.WHITE);
		this.name = options.name;
		this.description = options.description ?? '';
		this.price = options.price;
		this.effect = effect;
		
		this.sprite.width = 20 + window.innerWidth / 10;
		this.sprite.height = window.innerHeight / 12;
		this.nameText = new PIXI.Text(this.name, { fontSize: 18 });
		this.effectText = new PIXI.Text(this.getEffectAsString, { fontSize: 12 });
		this.priceText = new PIXI.Text(this.price.toString(), { fontSize: 12 });
		
		this.container = new PIXI.Container();
		this.container.addChild(this.sprite, this.nameText, this.effectText, this.priceText);
		
		this.on('click', () => this.buy());
	}
	
	public get getEffectAsString(): string {
		let result = '';
		switch (this.effect.kind) {
			case 'building':
				result += this.effect.multiplier
				          ? `Multiply by ${this.effect.multiplier * 100}% ${(this.effect as BuildingUpgrade).building}s.`
				          : `Add ${this.effect.addition} to ${(this.effect as BuildingUpgrade).building}s.`;
				break;
			case 'click':
				result += this.effect.multiplier
				          ? `Multiply clicks by ${this.effect.multiplier * 100}%.`
				          : `Add ${this.effect.addition * 100}% to clicks.`;
				break;
			case 'buildingGlobal':
				result += this.effect.multiplier
				          ? `Multiply buildings by ${this.effect.multiplier * 100}%.`
				          : `Add ${this.effect.addition * 100}% to buildings.`;
				break;
			case 'clickAPS':
				result += this.effect.multiplier
						? `Multiply by ${this.effect.multiplier * 100}% boost of APS to clicks.`
						: `Add ${this.effect.addition * 100}% of APS to clicks.`;
				break;
		}
		
		return result;
	}
	
	public update() {
		this.nameText.position.set(5, this.container.height / 10);
		this.effectText.position.set(5, this.container.height / 2.5);
		this.priceText.position.set(5, this.container.height - (this.container.height / 3.5));
		this.sprite.width = 20 + window.innerWidth / 10;
		this.sprite.height = window.innerHeight / 12;
		
		this.sprite.tint = this.owned ? 0x9dff9d : this.canBeBought ? 0xffffff : 0xdddddd;
	}
	
	public buy() {
		if (this.canBeBought && !this.owned) {
			this.owned = true;
			game.atomsCount = game.atomsCount.sub(this.price);
			
			switch (this.effect.kind) {
				case 'building':
					const building = game.buildings.find(building => building.name === (this.effect as BuildingUpgrade).building);
					if (!building) throw new Error(`Building '${(this.effect as BuildingUpgrade).building}' not found.`);
					building.boost = this.applyNumberedUpgrade(building.boost);
					break;
				
				case 'click':
					game.atomsPerClicks = this.applyNumberedUpgrade(game.atomsPerClicks);
					break;
				
				case 'buildingGlobal':
					game.buildingsGlobalBoost = this.applyNumberedUpgrade(game.buildingsGlobalBoost);
					break;
					
				case 'clickAPS':
					game.atomsPerClicksAPSBoost = this.applyNumberedUpgrade(game.atomsPerClicksAPSBoost);
					break;
			}
		}
	}
	
	private applyNumberedUpgrade(value: number): number;
	private applyNumberedUpgrade(value: BigFloat): BigFloat;
	private applyNumberedUpgrade(value: number | BigFloat) {
		if (typeof value === 'number') {
			return this.effect.multiplier
			       ? value * this.effect.multiplier
			       : value + this.effect.addition;
		} else {
			return this.effect.multiplier
			       ? value.mul(this.effect.multiplier)
			       : value.add(this.effect.addition);
		}
	}
}
