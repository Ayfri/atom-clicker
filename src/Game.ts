import {BigFloat} from 'bigfloat.js';
import * as PIXI from 'pixi.js';
import {app} from './app.js';
import buildings from './assets/buildings.json';
import upgrades from './assets/upgrades.json';
import Building, {BuildingOptions} from './buyables/Building.js';
import Upgrade, {ConditionType, UpgradeType} from './buyables/Upgrade.js';
import Clickable from './Clickable.js';
import GUI from './GUI.js';

export default class Game {
	public atomsCount: BigFloat = new BigFloat(0);
	public atomsPerClicks: BigFloat = new BigFloat(1);
	public atomsPerClicksAPSBoost: number = 0;
	public atomsPerSecond: BigFloat = new BigFloat(0);
	public atomsPerSecondBoost: BigFloat = new BigFloat(0);
	public buildings: Building[] = [];
	public buildingsGlobalBoost: number = 1;
	public mainAtom: Clickable;
	public totalAtomsProduced: BigFloat = new BigFloat(0);
	public totalClicks: number = 0;
	public upgrades: Upgrade<UpgradeType, ConditionType>[] = [];
	public gui: GUI;
	
	public constructor() {
		this.gui = new GUI();
		app.stage.addChild(this.gui.container);
		
		this.mainAtom = new Clickable(PIXI.Texture.WHITE);
		this.mainAtom.sprite.height = 400;
		this.mainAtom.sprite.width = 400;
		this.mainAtom.sprite.zIndex = -100;
		this.mainAtom.sprite.position.set(window.innerWidth / 2 - this.mainAtom.sprite.width / 2, 150);
		app.stage.addChild(this.mainAtom.sprite);
		
		this.mainAtom.on('click', async (_, position) => {
			this.atomsCount = this.atomsCount.add(this.totalAtomsPerClicks);
			this.totalAtomsProduced = this.totalAtomsProduced.add(this.totalAtomsPerClicks);
			this.totalClicks++;
			this.gui.click(position);
		});
		
		buildings.forEach((building: BuildingOptions) => this.buildings.push(new Building(building)));
		
		upgrades.forEach((upgrade: any) =>
			this.upgrades.push(
				new Upgrade(
					{
						name: upgrade.name,
						description: upgrade.description,
						price: upgrade.price
					},
					upgrade.effect,
					upgrade.condition
				)
			)
		);
		
		this.buildings.forEach((building) => {
			const levels = [15, 25, 50, 100, 200, 300, 400, 500, 750, 1000, 1500, 2000];
			
			for (let level of levels) {
				this.upgrades.push(new Upgrade({
					name: `${level} ${building.name}.`,
					description: `Buy ${level} ${building.name}.`,
					price: Math.round(building.startingPrice * building.priceMultiplier ** level * Math.log(level * 10))
				}, {
					kind: 'building',
					building: building.name,
					multiplier: level / 10
				}, {
					kind: 'building',
					building: building.name,
					count: level
				}));
			}
		});
		
		for (let level = 100; level < 10e7; level *= 10) {
			this.upgrades.push(new Upgrade({
				name: `${level} clicks !`,
				description: `You have clicked ${level} times.`,
				price: level * 10
			}, {
				kind: 'click',
				multiplier: Math.log10(level)
			}, {
				kind: 'click',
				count: level
			}));
		}
		
		for(let level = 1000; level < 10e20; level *= 10) {
				this.upgrades.push(new Upgrade({
					name: `${level} atoms generated.`,
					description: `You have generated ${level} total atoms.`,
					price: level * 10
				}, {
					kind: 'aps',
					multiplier: Math.log10(level)
				}, {
					kind: 'atoms',
					count: level
				}));
		}
		
		this.buildings.forEach(buildings => app.stage.addChild(buildings.container));
		this.upgrades.forEach(upgrade => app.stage.addChild(upgrade.container));
	}
	
	get totalAtomsPerClicks(): BigFloat {
		return this.atomsPerClicks.add(this.atomsPerSecond.mul(this.atomsPerClicksAPSBoost)).mul(100).ceil().div(100);
	}
	
	public update() {
		app.stage.sortChildren();
		this.gui.update();
		this.mainAtom.sprite.position.x = window.innerWidth / 2 - this.mainAtom.sprite.width / 2;
		
		this.buildings.forEach((building, index) => {
			building.update();
			building.container.x = window.innerWidth - building.container.width;
			building.container.y = index * (building.container.height + 5) + window.innerHeight / 4;
		});
		
		for (const upgrade of this.upgrades.sort((u1, u2) => u1.price - u2.price)) {
			const index = this.upgrades.filter(upgrade => upgrade.unlocked && !upgrade.owned).indexOf(upgrade);
			upgrade.update();
			upgrade.container.y = index * (upgrade.container.height + 5) + window.innerHeight / 4;
			upgrade.container.visible = upgrade.unlocked && !upgrade.owned;
		}
		
		this.atomsCount = this.atomsCount.add(this.atomsPerSecond.dividedBy(PIXI.Ticker.shared.FPS));
		this.totalAtomsProduced = this.totalAtomsProduced.add(this.atomsPerSecond.dividedBy(PIXI.Ticker.shared.FPS));
	}
	
	public calculateAPS() {
		this.atomsPerSecond = new BigFloat(
			this.buildings.map(building => building.totalAtomPerSecond * this.buildingsGlobalBoost).reduce((previous, current) => previous + current)
		).add(this.atomsPerSecondBoost);
	}
}
