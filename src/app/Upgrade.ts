import {BigFloat} from 'bigfloat.js';
import * as PIXI from 'pixi.js';
import {app, game} from '../app.js';
import ClickableContainer from '../components/ClickableContainer.js';
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

type APSUpgrade = {
	kind: 'aps';
};

type Upgrades = BuildingUpgrade | ClickUpgrade | BuildingGlobalUpgrade | ClickAPSUpgrade | APSUpgrade | AtomsUpgrade;

export type ConditionType = ConditionCount & Upgrades;
export type UpgradeType = NumberedUpgrade & Upgrades;

export default class Upgrade<T extends UpgradeType, L extends ConditionType> extends ClickableContainer implements UpgradeOptions, Buyable {
	public condition?: L;
	public readonly description: string;
	public effect: T;
	public effectText: PIXI.Text;
	public owned: boolean = false;
	public unlocked: boolean;

	public constructor(options: UpgradeOptions, effect: T, condition?: L) {
		super(PIXI.Texture.WHITE);
		this.name = options.name;
		this.description = options.description ?? '';
		this.price = options.price;
		this.effect = effect;
		this.unlocked = !condition;
		this.condition = condition;

		this.nameText = new PIXI.Text(this.name, {fontSize: 18});
		this.effectText = new PIXI.Text(this.getEffectAsString, {fontSize: 12});
		this.priceText = new PIXI.Text(this.price.toString(), {fontSize: 12});

		this.overlay = new Overlay({
			title: this.name,
			description: this.description,
			stats: {
				PRICE: new PIXI.Text(`Price: ${this.price}`),
				APS_WAIT_TIME: new PIXI.Text(''),
			},
		});

		this.container.addChild(this.nameText, this.effectText, this.priceText);
		app.stage.addChild(this.overlay.container);

		this.on('click', () => this.buy());

		this.on('hover', position => {
			this.overlay.show();
			this.overlay.resize(position);
		});
		this.on('hoverMove', position => this.overlay.move(position));
		this.on('hoverEnd', () => this.overlay.hide());
	}

	public get canBeBought(): boolean {
		return game.atomsCount.greaterThan(this.price - 1);
	}

	public readonly name: string;
	public nameText: PIXI.Text;
	public overlay: Overlay;
	public price: number;
	public priceText: PIXI.Text;

	public get getEffectAsString(): string {
		let result = '';
		switch (this.effect.kind) {
			case 'building':
				result += this.effect.multiplier
					? `Multiply by ${this.effect.multiplier * 100}% ${(this.effect as BuildingUpgrade).building}.`
					: `Add ${this.effect.addition} to ${(this.effect as BuildingUpgrade).building}.`;
				break;

			case 'clicks':
				result += this.effect.multiplier ? `Multiply clicks by ${this.effect.multiplier * 100}%.` : `Add ${this.effect.addition * 100}% to clicks.`;
				break;

			case 'buildingGlobal':
				result += this.effect.multiplier ? `Multiply buildings by ${this.effect.multiplier * 100}%.` : `Add ${this.effect.addition * 100}% to buildings.`;
				break;

			case 'clickAPS':
				result += this.effect.multiplier
					? `Multiply the boost of APS to clicks by ${this.effect.multiplier * 100}%.`
					: `Add ${this.effect.addition * 100}% of APS to clicks.`;
				break;

			case 'aps':
				result += this.effect.multiplier ? `Multiply atoms per second by ${this.effect.multiplier * 100}% .` : `Add ${this.effect.addition} atoms per seconds.`;
				break;

			case 'atoms':
				result += this.effect.multiplier ? `Multiply atoms by ${this.effect.multiplier * 100}%.` : `Add ${this.effect.addition * 100} atoms.`;
				break;
		}

		return result;
	}

	public buy() {
		if (this.canBeBought && !this.owned) {
			this.owned = true;
			app.stage.removeChild(this.overlay.container);
			game.atomsCount = game.atomsCount.sub(this.price);

			switch (this.effect.kind) {
				case 'building':
					const building = game.buildings.find(building => building.name === (this.effect as BuildingUpgrade).building);
					if (!building) throw new Error(`Building '${(this.effect as BuildingUpgrade).building}' not found.`);
					building.boost = this.applyNumberedUpgrade(building.boost);
					break;

				case 'clicks':
					game.atomsPerClicks = this.applyNumberedUpgrade(game.atomsPerClicks);
					break;

				case 'buildingGlobal':
					game.buildingsGlobalBoost = this.applyNumberedUpgrade(game.buildingsGlobalBoost);
					break;

				case 'clickAPS':
					game.atomsPerClicksAPSBoost = this.applyNumberedUpgrade(game.atomsPerClicksAPSBoost);
					break;

				case 'aps':
					game.atomsPerSecondBoost = this.effect.multiplier
						? game.atomsPerSecondBoost.add(game.atomsPerSecond.mul(this.effect.multiplier - 1))
						: game.atomsPerSecond.add(this.effect.addition);
					break;
				case 'atoms':
					game.atomsCount = this.applyNumberedUpgrade(game.atomsCount);
					break;
			}
		}
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

			case 'aps':
				this.unlocked = game.atomsPerSecond.greaterThanOrEqualTo(this.condition.count);
				break;
		}
	}

	public resize() {
		this.nameText.position.set(5, this.container.height / 10);
		this.effectText.position.set(5, this.container.height / 2.5);
		this.priceText.position.set(5, this.container.height - this.container.height / 3.5);
		this.sprite.width = 50 + window.innerWidth / 10;
		this.sprite.height = window.innerHeight / 12;
	}

	public toJSON(): JSONObject | number {
		let content: JSONObject = {
			i: game.upgrades.indexOf(this),
		};

		if (this.owned) content.o = this.owned;
		else {
			switch (this.condition?.kind) {
				case 'aps':
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

		if (Object.keys(content).join('') === 'i') return game.upgrades.indexOf(this);

		return content;
	}

	public update() {
		super.update();

		if (this.overlay.container.visible) this.overlay.setAPSWaitFromPrice(this.price);
		this.sprite.tint = this.canBeBought ? 0xffffff : this.color;
		this.checkUnlock();
	}

	private applyNumberedUpgrade(value: number): number;
	private applyNumberedUpgrade(value: BigFloat): BigFloat;
	private applyNumberedUpgrade(value: number | BigFloat) {
		if (typeof value === 'number') {
			return this.effect.multiplier ? value * this.effect.multiplier : value + this.effect.addition;
		} else {
			return this.effect.multiplier ? value.mul(this.effect.multiplier) : value.add(this.effect.addition);
		}
	}
}

(window as any).Upgrade = Upgrade;
