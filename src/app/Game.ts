import TWEEN from '@tweenjs/tween.js';
import {BigFloat} from 'bigfloat.js';
import * as PIXI from 'pixi.js';
import {app} from '../app.js';
import buildings from '../assets/buildings.json';
import upgrades from '../assets/upgrades.json';
import Clickable from '../components/Clickable.js';
import MainGUI from '../gui/MainGUI.js';
import {JSONable, JSONObject} from '../types.js';
import {tween} from '../utils/utils';
import Building, {BuildingOptions} from './Building';
import {Buyable} from './Buyable';
import Upgrade, {ConditionType, UpgradeType} from './Upgrade';

export default class Game implements JSONable {
	private static defaultBuyables: [buildings: Building[], upgrades: Upgrade<UpgradeType, ConditionType>[]] = [[], []];
	public atomsCount: BigFloat = new BigFloat(0);
	public atomsPerClicks: BigFloat = new BigFloat(1);
	public atomsPerClicksAPSBoost: number = 0;
	public atomsPerSecond: BigFloat = new BigFloat(0);
	public atomsPerSecondBoost: BigFloat = new BigFloat(0);
	public buildings: Building[] = [];
	public buildingsGlobalBoost: number = 1;
	public gui: MainGUI;
	public mainAtom: Clickable;
	public totalAtomsProduced: BigFloat = new BigFloat(0);
	public totalClicks: number = 0;
	public upgrades: Upgrade<UpgradeType, ConditionType>[] = [];

	public constructor(save?: JSONObject) {
		this.gui = new MainGUI();

		this.mainAtom = new Clickable(PIXI.Texture.WHITE);
		this.mainAtom.sprite.height = 400;
		this.mainAtom.sprite.width = 400;
		this.mainAtom.sprite.zIndex = -100;
		this.mainAtom.sprite.anchor.set(0.5);
		this.mainAtom.sprite.position.set(window.innerWidth / 2, window.innerHeight / 2.8);
		this.mainAtom.on('hover', async () => {
			tween({
				from: 400,
				to: 430,
				easing: TWEEN.Easing.Exponential.Out,
				duration: 200,
				onUpdate: (value: number) => {
					this.mainAtom.sprite.width = value;
					this.mainAtom.sprite.height = value;
				},
			});
		});

		this.mainAtom.on('hoverEnd', async () => {
			await tween({
				from: 430,
				to: 400,
				easing: TWEEN.Easing.Circular.Out,
				duration: 150,
				onUpdate: (value: number) => {
					this.mainAtom.sprite.width = value;
					this.mainAtom.sprite.height = value;
				},
			});
		});

		this.mainAtom.on('click', async (_, position) => {
			this.atomsCount = this.atomsCount.add(this.totalAtomsPerClicks);
			this.totalAtomsProduced = this.totalAtomsProduced.add(this.totalAtomsPerClicks);
			this.totalClicks++;
			this.gui.click(position);

			await tween({
				from: this.mainAtom.hover ? 400 : 370,
				to: this.mainAtom.hover ? 430 : 400,
				easing: TWEEN.Easing.Bounce.Out,
				duration: 500,
				onUpdate: (value: number) => {
					this.mainAtom.sprite.width = value;
					this.mainAtom.sprite.height = value;
				},
				onEnd: async (value: number) => {
					if(this.mainAtom.hover) return;
					await tween({
						from: value,
						to: 400,
						easing: TWEEN.Easing.Circular.Out,
						duration: 100,
						onUpdate: (value: number) => {
							this.mainAtom.sprite.width = value;
							this.mainAtom.sprite.height = value;
						},
					});
				},
				endIf: () => !this.mainAtom.hover
			});
		});

		this.setDefaultBuyables();
		if (save) {
			(save.b as any[]).forEach(b => {
				let building: Building;
				if (Game.getBuyableFromName(b.i) instanceof Building) {
					building = Game.getBuyableFromName(b.i) as Building;
					app.stage.addChild(building.overlay.container);
				} else {
					building = new Building({
						name: b.n,
						description: b.d ?? '',
						atomsPerSecond: b.a,
						startingPrice: b.s,
						priceMultiplier: b.p ?? 1.2,
					});
				}
				building.ownedCount = b.o ?? 0;
				building.boost = b.b ?? 1;
				this.addBuilding(building);
			});

			(save.u as any[]).forEach(u => {
				let upgrade: Upgrade<UpgradeType, ConditionType>;
				if (Game.getBuyableFromName(u.i) instanceof Upgrade) {
					upgrade = Game.getBuyableFromName(u.i) as Upgrade<UpgradeType, ConditionType>;
					app.stage.addChild(upgrade.overlay.container);
				} else {
					upgrade = new Upgrade<UpgradeType, ConditionType>(
						{
							name: u.i,
							description: u.d ?? '',
							price: u.p,
						},
						u.e,
						u.c
					);
				}

				upgrade.unlocked = u.hasOwnProperty('u') ? !!u.u : true;
				upgrade.owned = u.hasOwnProperty('o') ? !!u.o : false;
				this.addUpgrade(upgrade);
			});

			this.atomsCount = new BigFloat((save.c as string) ?? 0);
			this.totalAtomsProduced = new BigFloat((save.ta as string) ?? 0);
			this.atomsPerClicks = new BigFloat((save.ac as string) ?? 1);
			this.atomsPerClicksAPSBoost = Number(save.acb ?? 0);
			this.atomsPerSecondBoost = new BigFloat((save.asb as string) ?? 0);
			this.totalClicks = Number(save.t ?? 0);
			this.buildingsGlobalBoost = Number(save.bb ?? 1);
		} else {
			Game.defaultBuyables[0].forEach(b => this.addBuilding(b));
			Game.defaultBuyables[1].forEach(u => this.addUpgrade(u));
		}

		app.stage.addChild(this.mainAtom.sprite, this.gui.container);
		setInterval(() => this.updateVisibleBuildings(), 200);
	}

	get totalAtomsPerClicks(): BigFloat {
		return this.atomsPerClicks.add(this.atomsPerSecond.mul(this.atomsPerClicksAPSBoost)).mul(100).floor().div(100);
	}

	get totalAtomsPerSecond(): BigFloat {
		return this.atomsPerSecond.add(this.atomsPerClicks.mul(this.gui.clicksPerSeconds));
	}

	public static getBuyableFromIndex(index: number, type: 'building' | 'upgrade'): Buyable {
		switch (type) {
			case 'building':
				return Game.defaultBuyables[0][index];
			case 'upgrade':
				return Game.defaultBuyables[1][index];
		}
	}

	public static getBuyableFromName(name: string): Buyable {
		return Game.defaultBuyables.flat().find(b => b.name === name);
	}

	public static isDefaultBuyable(buyable: Buyable): boolean {
		return !!Game.getBuyableFromName(buyable.name);
	}

	public addBuilding(building: Building) {
		this.buildings.push(building);
		app.stage.addChild(building.container);
	}

	public addUpgrade(upgrade: Upgrade<UpgradeType, ConditionType>) {
		this.upgrades.push(upgrade);
		app.stage.addChild(upgrade.container);
	}

	public calculateAPS() {
		this.atomsPerSecond = this.buildings
			.map(building => building.totalAtomPerSecond.mul(this.buildingsGlobalBoost))
			.reduce((previous, current) => previous.add(current))
			.add(this.atomsPerSecondBoost);
	}

	public resetDefaultBuyables(): void {
		Game.defaultBuyables = [[], []];
	}

	public resize() {
		this.updateVisibleBuildings();
		this.gui.resize();
		this.buildings?.forEach(building => building.resize());
		this.upgrades?.forEach(upgrade => upgrade.resize());
	}

	public toJSON(): JSONObject {
		const content: JSONObject = {
			b: this.buildings.map(building => building.toJSON()),
			u: this.upgrades.map(upgrade => upgrade.toJSON()),
		};
		if (this.atomsCount.greaterThan(0)) content.c = this.atomsCount.floor().toString();
		if (this.totalClicks > 0) content.t = this.totalClicks;
		if (this.atomsPerClicks.greaterThan(1)) content.ac = this.atomsPerClicks.toString();
		if (this.atomsPerClicksAPSBoost > 0) content.acb = this.atomsPerClicksAPSBoost;
		if (this.atomsPerSecondBoost.greaterThan(0)) content.asb = this.atomsPerSecondBoost.toString();
		if (this.totalAtomsProduced.greaterThan(0)) content.ta = this.totalAtomsProduced.toString();
		if (this.buildingsGlobalBoost > 1) content.bb = this.buildingsGlobalBoost;

		return content;
	}

	public update() {
		app.stage.sortChildren();
		this.gui.update();
		this.mainAtom.sprite.position.x = window.innerWidth / 2;

		this.atomsCount = this.atomsCount.add(this.atomsPerSecond.dividedBy(PIXI.Ticker.shared.FPS));
		this.totalAtomsProduced = this.totalAtomsProduced.add(this.atomsPerSecond.dividedBy(PIXI.Ticker.shared.FPS));
		this.calculateAPS();
	}

	public updateVisibleBuildings() {
		this.buildings.forEach((building, index) => {
			building.resize();
			building.update();
			building.container.x = window.innerWidth - building.container.width;
			building.container.y = index * (building.container.height + 5) + window.innerHeight / 4;
		});

		for (const upgrade of this.upgrades.sort((u1, u2) => u1.price - u2.price)) {
			const index = this.upgrades.filter(upgrade => upgrade.unlocked && !upgrade.owned).indexOf(upgrade);
			upgrade.resize();
			upgrade.update();
			upgrade.container.y = index * (upgrade.container.height + 5) + window.innerHeight / 4;
			upgrade.container.visible = upgrade.unlocked && !upgrade.owned;
			if (upgrade.unlocked) upgrade.container.alpha = 1;
		}
	}

	private setDefaultBuyables(): void {
		buildings.forEach((building: BuildingOptions) => Game.defaultBuyables[0].push(new Building(building)));

		upgrades.forEach((upgrade: any) =>
			Game.defaultBuyables[1].push(
				new Upgrade(
					{
						name: upgrade.name,
						description: upgrade.description,
						price: upgrade.price,
					},
					upgrade.effect,
					upgrade.condition
				)
			)
		);

		Game.defaultBuyables[0].forEach(building => {
			const levels = [15, 25, 50, 100, 200, 300, 400, 500, 750, 1000, 1500, 2000];

			for (let level of levels) {
				Game.defaultBuyables[1].push(
					new Upgrade(
						{
							name: `${level} ${building.name}.`,
							description: `Buy ${level} ${building.name}.`,
							price: Math.round(building.startingPrice * building.priceMultiplier ** level * Math.log(level * 10)),
						},
						{
							kind: 'building',
							building: building.name,
							multiplier: level / 10,
						},
						{
							kind: 'building',
							building: building.name,
							count: level,
						}
					)
				);
			}
		});

		for (let level = 100; level < 10e7; level *= 10) {
			Game.defaultBuyables[1].push(
				new Upgrade(
					{
						name: `${level} clicks !`,
						description: `You have clicked ${level} times.`,
						price: level * 10,
					},
					{
						kind: 'clicks',
						multiplier: Math.log10(level),
					},
					{
						kind: 'clicks',
						count: level,
					}
				)
			);
		}

		for (let level = 1000; level < 10e20; level *= 100) {
			Game.defaultBuyables[1].push(
				new Upgrade(
					{
						name: `${level} atoms generated.`,
						description: `You have generated ${level} total atoms.`,
						price: level * 10,
					},
					{
						kind: 'aps',
						multiplier: Math.ceil(Math.log10(level) / 2),
					},
					{
						kind: 'atoms',
						count: level,
					}
				)
			);
		}
	}
}
