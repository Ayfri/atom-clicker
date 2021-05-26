import TWEEN from '@tweenjs/tween.js';
import {BigFloat} from 'bigfloat.js';
import * as PIXI from 'pixi.js';
import {app} from '../app.js';
import boosts from '../assets/boosts.json';
import buildings from '../assets/buildings.json';
import upgrades from '../assets/upgrades.json';
import Clickable from '../components/Clickable.js';
import MainGUI from '../gui/MainGUI.js';
import {JSONable, JSONObject} from '../types.js';
import {random, tween} from '../utils/utils';
import Boost from './Boost';
import Building, {BuildingOptions} from './Building';
import {Buyable} from './Buyable';
import Upgrade, {ConditionType, UpgradeType} from './Upgrade';

export default class Game implements JSONable {
	private static defaultBuyables: [buildings: Building[], upgrades: Upgrade<UpgradeType, ConditionType>[]] = [[], []];
	public atomsCount: BigFloat = new BigFloat(0);
	public atomsPerClicks: number = 1;
	public atomsPerClicksAPSBoost: number = 0;
	public atomsPerSecond: BigFloat = new BigFloat(0);
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
		this.mainAtom.sprite.zIndex = -100;
		this.mainAtom.sprite.anchor.set(0.5);
		this.mainAtom.sprite.position.set(window.innerWidth / 2, window.innerHeight / 2.8);
		this.mainAtom.on('hover', async () => {
			await tween({
				from: window.innerWidth / 3.5,
				to: window.innerWidth / 3.3,
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
				from: window.innerWidth / 3.3,
				to: window.innerWidth / 3.5,
				easing: TWEEN.Easing.Circular.Out,
				duration: 150,
				onUpdate: (value: number) => {
					this.mainAtom.sprite.width = value;
					this.mainAtom.sprite.height = value;
				},
			});
		});

		this.mainAtom.on('click', async (_, position) => {
			const atomsPerClicks: BigFloat = this.totalAtomsPerClicks;
			this.atomsCount = this.atomsCount.add(atomsPerClicks);
			this.totalAtomsProduced = this.totalAtomsProduced.add(atomsPerClicks);
			this.totalClicks++;
			this.gui.click(position);

			await tween({
				from: this.mainAtom.hover ? window.innerWidth / 3.5 : window.innerWidth / 3.7,
				to: this.mainAtom.hover ? window.innerWidth / 3.3 : window.innerWidth / 3.5,
				easing: TWEEN.Easing.Bounce.Out,
				duration: 500,
				onUpdate: (value: number) => {
					this.mainAtom.sprite.width = value;
					this.mainAtom.sprite.height = value;
				},
				onEnd: async (value: number) => {
					if (this.mainAtom.hover) return;
					await tween({
						from: value,
						to: window.innerWidth / 3.5,
						easing: TWEEN.Easing.Circular.Out,
						duration: 100,
						onUpdate: (value: number) => {
							this.mainAtom.sprite.width = value;
							this.mainAtom.sprite.height = value;
						},
					});
				},
				endIf: () => !this.mainAtom.hover,
			});
		});

		Boost.savedBoosts = boosts.map((b: any) => {
			return new Boost({
				effect: b.effect,
				condition: b.condition,
				duration: b.duration,
			});
		});

		if (save) {
			this.atomsCount = new BigFloat((save.c as string) ?? 0);
			this.totalAtomsProduced = new BigFloat((save.ta as string) ?? 0);
			this.atomsPerClicks = Number(save.bb ?? 1);
			this.atomsPerClicksAPSBoost = Number(save.acb ?? 0);
			this.totalClicks = Number(save.t ?? 0);
			this.buildingsGlobalBoost = Number(save.bb ?? 1);

			(save.b as any[]).forEach(b => {
				const building: Building = Game.getBuyableFromName(b.i) as Building;
				building.ownedCount = b.o ?? 0;
				building.boost = b.b ?? 1;
				this.addBuilding(building);
			});

			(save.cb as any[])?.forEach(cb => {
				const building = new Building({
					name: cb.n,
					description: cb.d ?? '',
					atomsPerSecond: cb.a,
					startingPrice: cb.s,
					priceMultiplier: cb.p ?? 1.2,
				});

				building.ownedCount = cb.o ?? 0;
				building.boost = cb.b ?? 1;
				this.addBuilding(building);
			});

			(save.u as any[]).forEach(u => {
				const upgrade = Game.getBuyableFromName(u.i) as Upgrade<UpgradeType, ConditionType>;

				upgrade.unlocked = u.hasOwnProperty('u') ? !!u.u : true;
				upgrade.owned = u.hasOwnProperty('o') ? !!u.o : false;
				this.addUpgrade(upgrade);
			});

			(save.cu as any[])?.forEach(u => {
				const upgrade = new Upgrade<UpgradeType, ConditionType>(
					{
						name: u.i,
						description: u.d ?? '',
						price: u.p,
					},
					u.e,
					u.c
				);
				upgrade.unlocked = u.hasOwnProperty('u') ? !!u.u : true;
				upgrade.owned = u.hasOwnProperty('o') ? !!u.o : false;
				this.addUpgrade(upgrade);
			});
		} else {
			Game.defaultBuyables[0].forEach(b => this.addBuilding(b));
			Game.defaultBuyables[1].forEach(u => this.addUpgrade(u));
		}

		app.stage.addChild(this.mainAtom.sprite, this.gui.container);
		setInterval(() => this.updateVisibleBuildings(), 200);
	}

	public static getBuyableFromIndex(index: number, type: 'building' | 'upgrade'): Buyable {
		return Game.defaultBuyables[Number(type === 'upgrade')][index];
	}

	public static getBuyableFromName(name: string): Buyable {
		return Game.defaultBuyables.flat().find(b => b.name === name);
	}

	public static getBuyableIndex(buyable: Buyable, type: 'building' | 'upgrade'): number {
		return Game.defaultBuyables[Number(type === 'upgrade')].indexOf(buyable as any);
	}

	public static isDefaultBuyable(buyable: Buyable): boolean {
		return !!Game.getBuyableFromName(buyable.name);
	}

	get totalAtomsPerClicks(): BigFloat {
		return new BigFloat(this.atomsPerClicks).add(this.atomsPerSecond.mul(this.atomsPerClicksAPSBoost)).mul(100).floor().div(100);
	}

	get totalAtomsPerSecond(): BigFloat {
		return this.atomsPerSecond.add(this.atomsPerClicks * this.gui.clicksPerSeconds);
	}

	public static setDefaultBuyables(): void {
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
							price: Math.round(building.startingPrice * building.priceMultiplier ** level * Math.log(level * 8)),
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
						kind: 'buildingGlobal',
						multiplier: Math.ceil(Math.log10(level) / 3),
					},
					{
						kind: 'atoms',
						count: level,
					}
				)
			);
		}

		for (let level = 1; level < 100; level++) {
			Game.defaultBuyables[1].push(
				new Upgrade(
					{
						name: `Rare Atom ${level} !`,
						description: `You can now buy a new rare atom.`,
						price: 10 ** level,
					},
					{
						kind: 'clickAPS',
						multiplier: 0.01,
					},
					{
						kind: 'atoms',
						count: 10 ** level / 10,
					}
				)
			);
		}

		console.log(Game.defaultBuyables.map(a => a.length));
	}

	public addBuilding(building: Building) {
		this.buildings.push(building);
		app.stage.addChild(building.container);
	}

	public addUpgrade(upgrade: Upgrade<UpgradeType, ConditionType>) {
		this.upgrades.push(upgrade);
		app.stage.addChild(upgrade.container);
	}

	public static resetDefaultBuyables(): void {
		Game.defaultBuyables = [[], []];
	}

	public resize() {
		this.updateVisibleBuildings();
		this.gui.resize();
		[this.gui, ...this.buildings, ...this.upgrades].forEach(b => b.resize());
		this.mainAtom.sprite.height = window.innerWidth / 3.5;
		this.mainAtom.sprite.width = window.innerWidth / 3.5;
	}

	public toJSON(): JSONObject {
		const content: JSONObject = {
			b: this.buildings.filter(b => Game.isDefaultBuyable(b)).map(building => building.toJSON()),
			u: this.upgrades.filter(u => Game.isDefaultBuyable(u)).map(u => u.toJSON()),
		};

		if ((content.u as any[]).length < this.upgrades.length) content.cu = this.upgrades.filter(u => !Game.isDefaultBuyable(u)).map(u => u.toJSON());

		if ((content.b as any[]).length < this.buildings.length) content.cb = this.buildings.filter(b => !Game.isDefaultBuyable(b)).map(b => b.toJSON());

		if (this.atomsCount.greaterThan(0)) content.c = this.atomsCount.floor().toString();
		if (this.totalClicks > 0) content.t = this.totalClicks;
		if (this.atomsPerClicks > 1) content.ac = this.atomsPerClicks.toString();
		if (this.atomsPerClicksAPSBoost > 0) content.acb = this.atomsPerClicksAPSBoost.toPrecision(5);
		if (this.totalAtomsProduced.greaterThan(0)) content.ta = this.totalAtomsProduced.toString();
		if (this.buildingsGlobalBoost > 1) content.bb = this.buildingsGlobalBoost;

		return content;
	}

	public async update() {
		app.stage.sortChildren();
		this.gui.update();
		this.mainAtom.sprite.position.x = window.innerWidth / 2;

		this.atomsPerSecond = this.buildings.map(building => building.totalAtomPerSecond).reduce((previous, current) => previous.add(current));
		this.atomsCount = this.atomsCount.add(this.atomsPerSecond.dividedBy(PIXI.Ticker.shared.FPS));
		this.totalAtomsProduced = this.totalAtomsProduced.add(this.atomsPerSecond.dividedBy(PIXI.Ticker.shared.FPS));

		if (Math.floor(Math.random() * 300) === 42) await random(Boost.savedBoosts.filter(b => !b.spawned))?.spawn();
	}

	public updateVisibleBuildings() {
		this.buildings.forEach((building, index) => {
			building.container.x = window.innerWidth - building.container.width;
			building.container.y = index * (building.container.height + 5) + window.innerHeight / 4;
		});

		[...this.buildings, ...this.upgrades].forEach(b => b.update());

		const upgrades = this.upgrades.filter(u => u.container.visible).sort((u1, u2) => u1.price - u2.price);
		upgrades.forEach((u, index) => {
			const upgrade = upgrades[index];
			upgrade.resize();
			upgrade.container.y = index * (upgrade.container.height + 5) + window.innerHeight / 4;
		});
	}
}

(window as any).Game = Game;
