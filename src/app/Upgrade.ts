import {BigFloat} from 'bigfloat.js';
import * as PIXI from 'pixi.js';
import {app, game} from '../app.js';
import Overlay from '../gui/Overlay.js';
import {JSONObject} from '../types.js';
import {Buyable} from './Buyable';
import Game from './Game';

interface UpgradeOptions {
	readonly description?: string;
	readonly name: string;
	price: number;
}

type NumberedUpgrade = {
	multiplier?: number;
	addition?: number;
};

type ConditionCount = {
	count: number;
};

type BuildingUpgrade = {
	building: string;
	kind: 'building';
};

type ClickAPSUpgrade = {
	kind: 'clickAPS';
};

type ClickUpgrade = {
	kind: 'clicks';
};

type BuildingGlobalUpgrade = {
	kind: 'buildingGlobal';
};

type AtomsUpgrade = {
	kind: 'atoms';
};

type Upgrades = BuildingUpgrade | ClickUpgrade | BuildingGlobalUpgrade | ClickAPSUpgrade | AtomsUpgrade;

export type ConditionType = ConditionCount & Upgrades;
export type UpgradeType = NumberedUpgrade & Upgrades;

export default class Upgrade<T extends UpgradeType, L extends ConditionType> extends Buyable implements UpgradeOptions {
	public condition?: L;
	public effect: T;
	public effectText: PIXI.Text;
	public owned: boolean = false;
	public unlocked: boolean;

	public constructor(options: UpgradeOptions, effect: T, condition?: L) {
		super(PIXI.Texture.WHITE, options.name);
		this.description = options.description ?? '';
		this.price = options.price;
		this.effect = effect;
		this.unlocked = !condition;
		this.condition = condition;

		this.effectText = new PIXI.Text(Upgrade.getEffectAsString(this.effect), {fontSize: 12});
		this.effectText.anchor.set(0.5);
		this.nameText.style.fontSize = 20;
		this.priceText.style.fontSize = 13;
		this.priceText.text = this.price.toString();

		this.overlay = new Overlay({
			title: this.name,
			description: this.description,
			stats: {
				PRICE: new PIXI.Text(`Price: ${this.price}`),
				APS_WAIT_TIME: new PIXI.Text(''),
			},
		});

		this.container.addChild(this.effectText);
		app.stage.addChild(this.overlay.container);
	}

	public static applyEffect(effect: UpgradeType): void {
		switch (effect.kind) {
			case 'building':
				const building = game.buildings.find(building => building.name === (effect as BuildingUpgrade).building);
				if (!building) throw new Error(`Building '${(effect as BuildingUpgrade).building}' not found.`);
				building.boost = Upgrade.applyNumberedUpgrade(building.boost, effect);
				break;

			case 'clicks':
				game.atomsPerClicks = Upgrade.applyNumberedUpgrade(game.atomsPerClicks, effect);
				break;

			case 'buildingGlobal':
				game.buildingsGlobalBoost = Upgrade.applyNumberedUpgrade(game.buildingsGlobalBoost, effect);
				break;

			case 'clickAPS':
				game.atomsPerClicksAPSBoost = Upgrade.applyNumberedUpgrade(game.atomsPerClicksAPSBoost, effect);
				break;

			case 'atoms':
				game.atomsCount = Upgrade.applyNumberedUpgrade(game.atomsCount, effect);
				break;
		}
	}

	public static getEffectAsString(effect: UpgradeType): string {
		let result = '';
		switch (effect.kind) {
			case 'building':
				result += effect.multiplier
					? `Multiply by ${effect.multiplier * 100}% ${(effect as BuildingUpgrade).building}.`
					: `Add ${effect.addition} to ${(effect as BuildingUpgrade).building}.`;
				break;

			case 'clicks':
				result += effect.multiplier ? `Multiply clicks by ${effect.multiplier * 100}%.` : `Add ${effect.addition * 100}% to clicks.`;
				break;

			case 'buildingGlobal':
				result += effect.multiplier ? `Multiply buildings by ${effect.multiplier * 100}%.` : `Add ${effect.addition * 100}% to buildings.`;
				break;

			case 'clickAPS':
				result += effect.multiplier ? `Multiply the boost of APS to clicks by ${effect.multiplier * 100}%.` : `Add ${effect.addition * 100}% of APS to clicks.`;
				break;

			case 'atoms':
				result += effect.multiplier ? `Multiply atoms by ${effect.multiplier * 100}%.` : `Add ${effect.addition} atoms.`;
				break;
		}

		return result;
	}

	private static applyNumberedUpgrade(value: number, effect: UpgradeType): number;

	private static applyNumberedUpgrade(value: BigFloat, effect: UpgradeType): BigFloat;

	private static applyNumberedUpgrade(value: number | BigFloat, effect: UpgradeType) {
		return typeof value === 'number'
			? effect.multiplier
				? value * effect.multiplier
				: value + effect.addition
			: effect.multiplier
			? value.mul(effect.multiplier)
			: value.add(effect.addition);
	}

	public buy() {
		if (this.canBeBought && !this.owned) {
			this.owned = true;
			app.stage.removeChild(this.overlay.container);
			game.atomsCount = game.atomsCount.sub(this.price);

			Upgrade.applyEffect(this.effect);
		}
	}

	public price: number;

	public resize() {
		this.nameText.position.set(this.nameText.width / 2 + 5, this.container.height / 5);
		this.effectText.position.set(this.effectText.width / 2 + 5, this.container.height / 2.2);
		this.priceText.position.set(this.priceText.width / 2 + 5, this.container.height - this.container.height / 5);
		this.sprite.width = 50 + window.innerWidth / 10;
		this.sprite.height = window.innerHeight / 12;
	}

	public toJSON(): JSONObject | number {
		let content: JSONObject = {};

		if (this.owned) content.o = this.owned;
		else {
			switch (this.condition?.kind) {
				case 'building':
				case 'buildingGlobal':
				case 'clickAPS':
					content.u = this.unlocked;
					break;
			}
		}

		if (!Game.isDefaultBuyable(this)) {
			content = {
				n: this.name,
				p: this.price,
				e: this.effect,
				c: this.condition,
			};

			if (this.description) content.d = this.description;
		}

		return !Object.keys(content).length ? Game.getBuyableIndex(this, 'upgrade') : content;
	}

	public updateOverlayValues(): void {
		this.overlay.setAPSWaitFromPrice(this.price);
	}

	public checkUnlock(): void {
		if (!this.condition) this.unlocked = true;
		switch (this.condition?.kind) {
			case 'building':
				this.unlocked = game.buildings?.find(building => building.name === (this.condition as BuildingUpgrade).building)?.ownedCount >= this.condition.count;
				break;

			case 'clicks':
				this.unlocked = game.totalClicks >= this.condition.count;
				break;

			case 'buildingGlobal':
				this.unlocked = game.buildings.map(building => building.ownedCount).reduce((previousValue, currentValue) => previousValue + currentValue) >= this.condition.count;
				break;

			case 'clickAPS':
				this.unlocked = game.atomsPerClicks.greaterThanOrEqualTo(this.condition.count);
				break;

			case 'atoms':
				this.unlocked = game.totalAtomsProduced.greaterThanOrEqualTo(this.condition.count);
				break;
		}
	}

	public update() {
		super.update();

		this.checkUnlock();
		this.container.visible = this.unlocked && !this.owned;
		if (this.container.visible) {
			this.sprite.tint = this.canBeBought ? 0xffffff : this.color;
			if (this.overlay.container.visible) this.updateOverlayValues();
		}
	}
}

(window as any).Upgrade = Upgrade;
