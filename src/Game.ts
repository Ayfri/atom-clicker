import { BigFloat } from 'bigfloat.js';
import * as PIXI from 'pixi.js';
import { app } from './app.js';
import buildings from './assets/buildings.json';
import upgrades from './assets/upgrades.json';
import Building, { BuildingOptions } from './buyables/Building.js';
import Upgrade, {UpgradeLockedOptions, UpgradeType} from './buyables/Upgrade.js';
import Clickable from './Clickable.js';
import { sleep } from './utils/utils.js';

export default class Game {
	public atomsCount: BigFloat = new BigFloat(0);
	public atomsPerClicks: BigFloat = new BigFloat(1);
	public atomsPerClicksAPSBoost: number = 0;
	public atomsPerClicksText: PIXI.Text;
	public atomsPerSecond: BigFloat = new BigFloat(0);
	public buildings: Building[] = [];
	public buildingsGlobalBoost: number = 1;
	public mainAtom: Clickable;
	public showedAPS: PIXI.Text;
	public showedCount: PIXI.Text;
	public totalClicks: number = 0;
	public upgrades: Upgrade<UpgradeType, UpgradeLockedOptions>[] = [];

	public constructor() {
		this.mainAtom = new Clickable(PIXI.Texture.WHITE);
		this.mainAtom.sprite.height = 400;
		this.mainAtom.sprite.width = 400;
		this.mainAtom.sprite.position.set(window.innerWidth / 2 - this.mainAtom.sprite.width / 2, 150);
		app.stage.addChild(this.mainAtom.sprite);

		const style = new PIXI.TextStyle({
			dropShadow: true,
			dropShadowBlur: 5,
			dropShadowDistance: 0,
			fill: '#ffffff',
			fontSize: 60,
			padding: 20,
		});
		this.showedCount = new PIXI.Text(this.atomsCount.toString(), style);
		this.showedCount.anchor.set(0.5);
		this.showedCount.position.set(window.innerWidth / 2, 40);
		app.stage.addChild(this.showedCount);

		this.showedAPS = new PIXI.Text(this.atomsPerSecond.toString(), JSON.parse(JSON.stringify(style)));
		this.showedAPS.style.fontSize = 35;
		this.showedAPS.anchor.set(0.5);
		this.showedAPS.position.set(window.innerWidth / 2, 80);
		app.stage.addChild(this.showedAPS);

		this.atomsPerClicksText = new PIXI.Text(this.atomsPerClicks.toString());
		this.atomsPerClicksText.anchor.set(0.5);
		this.atomsPerClicksText.position.set(window.innerWidth / 10, window.innerHeight / 10);
		app.stage.addChild(this.atomsPerClicksText);

		this.mainAtom.on('click', async (_, position) => {
			this.atomsCount = this.atomsCount.add(this.totalAtomsPerClicks);
			this.totalClicks++;

			const text = new PIXI.Text(`+${this.totalAtomsPerClicks}`);
			text.position = position;
			text.anchor.set(0.5);
			text.x += Math.random() * 10 - 5;
			app.stage.addChild(text);
			for (let i = 0; i < 100; i++) {
				text.y--;
				text.alpha -= 1 / 60;
				await sleep(PIXI.Ticker.shared.deltaMS);
			}
			app.stage.removeChild(text);
		});

		buildings.forEach((building: BuildingOptions) => this.buildings.push(new Building(building)));

		upgrades.forEach((upgrade: any) =>
			this.upgrades.push(
				new Upgrade(
					{
						name: upgrade.name,
						description: upgrade.description,
						price: upgrade.price,
					},
					upgrade.effect
				)
			)
		);
		
		this.buildings.forEach((building) => {
			this.upgrades.push(new Upgrade({
				name: `15 ${building.name}.`,
				description: `Buy 15 ${building.name}.`,
				price: building.price * 30
			}, {
				kind: 'building',
				building: building.name,
				multiplier: 1.5
			}, {
				kind: 'building',
				building: building.name,
				count: 15
			}));
		})

		this.buildings.forEach(buildings => app.stage.addChild(buildings.container));
		this.upgrades.forEach(upgrade => app.stage.addChild(upgrade.container));
	}

	get totalAtomsPerClicks(): BigFloat {
		return this.atomsPerClicks.add(this.atomsPerSecond.mul(this.atomsPerClicksAPSBoost));
	}

	public update() {
		this.showedCount.text = `${this.atomsCount.toString().split('.')[0]} atoms`;
		this.showedCount.position.x = window.innerWidth / 2;
		this.showedAPS.text = `per second: ${this.atomsPerSecond.toString().replace(/(\d+\.\d{2})\d+/g, '$1')}`;
		this.atomsPerClicksText.text = `Atoms per clicks: ${this.totalAtomsPerClicks.toString()}`;
		this.showedAPS.position.x = window.innerWidth / 2;
		this.mainAtom.sprite.position.x = window.innerWidth / 2 - this.mainAtom.sprite.width / 2;

		this.buildings.forEach((building, index) => {
			building.update();
			building.container.x = window.innerWidth - building.container.width;
			building.container.y = index * (building.container.height + 5) + window.innerHeight / 4;
		});

		for (const upgrade of this.upgrades) {
			const index = this.upgrades.filter(upgrade => upgrade.unlocked).indexOf(upgrade);
			upgrade.update();
			upgrade.container.visible = upgrade.unlocked;
			upgrade.container.y = index * (upgrade.container.height + 5) + window.innerHeight / 4;
		}
		
		this.atomsCount = this.atomsCount.add(this.atomsPerSecond.dividedBy(PIXI.Ticker.shared.FPS));
	}

	public calculateAPS() {
		this.atomsPerSecond = new BigFloat(
			this.buildings.map(building => building.totalAtomPerSecond * this.buildingsGlobalBoost).reduce((previous, current) => previous + current)
		);
	}
}
