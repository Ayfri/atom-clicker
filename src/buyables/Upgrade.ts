import * as PIXI from 'pixi.js';
import { game } from '../app.js';
import Clickable from '../Clickable.js';
import { Buyable } from './Buyable.js';

interface UpgradeOptions {
	readonly name: string;
	readonly description?: string;
	price: number;
}

interface BuildingUpgrade {
	building: string;
	multiplier: number;
	addition?: number;
	kind: 'building';
}

interface ClickUpgrade {
	multiplier?: number;
	addition?: number;
	kind: 'click';
}

interface BuildingGlobalUpgrade {
	multiplier?: number;
	addition?: number;
	kind: 'buildingGlobal';
}

export type UpgradeType = BuildingUpgrade | ClickUpgrade | BuildingGlobalUpgrade;

export default class Upgrade<T extends UpgradeType> extends Clickable implements UpgradeOptions, Buyable {
	public readonly name: string;
	public readonly description: string;
	public price: number;
	
	public get canBeBought(): boolean {
		return game.atomsCount.greaterThanOrEqualTo(this.price);
	}
	
	public container: PIXI.Container;
	public nameText: PIXI.Text;
	public effectText: PIXI.Text;
	public owned: boolean = false;
	public effect: T;
	
	public constructor(options: UpgradeOptions, effect: T) {
		super(PIXI.Texture.WHITE);
		this.name = options.name;
		this.description = options.description ?? '';
		this.price = options.price;
		this.effect = effect;
		
		this.nameText = new PIXI.Text(this.name, { fontSize: 15 });
		this.effectText = new PIXI.Text(this.getEffectAsString);
	}
	
	public get getEffectAsString(): string {
		let result = '';
		switch (this.effect.kind) {
			case 'building':
				result += this.effect.multiplier
				          ? `Multiply by ${this.effect.multiplier}% ${(this.effect as BuildingUpgrade).building}s.`
				          : `Add ${this.effect.addition} to ${(this.effect as BuildingUpgrade).building}s.`;
				break;
			case 'click':
				result += this.effect.multiplier ? `Multiply by ${this.effect.multiplier} clicks.` : `Add ${this.effect.addition} to clicks.`;
				break;
			case 'buildingGlobal':
				result += this.effect.multiplier ? `Multiply by ${this.effect.multiplier} buildings.` : `Add ${this.effect.addition} to buildings.`;
				break;
		}
		
		return result;
	}
	
	public buy() {
		if (this.canBeBought) {
			this.owned = true;
			
			switch (this.effect.kind) {
				case 'building':
					const building = game.buildings.find(building => building.name === (this.effect as BuildingUpgrade).building);
					if (!building) throw new Error(`Building '${(this.effect as BuildingUpgrade).building}' not found.`);
					building.boost = this.effect.multiplier
					                 ? building.boost * this.effect.multiplier
					                 : building.boost + this.effect.addition;
					break;
				
				case 'click':
					game.cookiesPerClicks = this.effect.multiplier
					                        ? game.cookiesPerClicks.mul(this.effect.multiplier)
					                        : game.cookiesPerClicks.add(this.effect.addition);
					break;
				
				case 'buildingGlobal':
					game.buildingsGlobalBoost = this.effect.multiplier
					                            ? game.buildingsGlobalBoost * this.effect.multiplier
					                            : game.buildingsGlobalBoost + this.effect.addition;
					break;
			}
		}
	}
}
