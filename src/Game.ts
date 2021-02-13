import { BigFloat } from 'bigfloat.js';
import * as PIXI from 'pixi.js';
import { app } from './app.js';
import Clickable from './Clickable.js';
import Building from './Building.js';
import { sleep } from './utils/utils.js';

export default class Game {
	public mainAtom: Clickable;
	public showedCount: PIXI.Text;
	public atomsCount: BigFloat = new BigFloat(0);
	public atomPerSeconds: BigFloat = new BigFloat(0);
	public showedAPS: PIXI.Text;
	public buildings: Building[] = [];

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

		this.showedAPS = new PIXI.Text(this.atomPerSeconds.toString(), JSON.parse(JSON.stringify(style)));
		this.showedAPS.style.fontSize = 35;
		this.showedAPS.anchor.set(0.5);
		this.showedAPS.position.set(window.innerWidth / 2, 80);
		app.stage.addChild(this.showedAPS);

		this.mainAtom.on('click', () => {
			this.atomsCount = this.atomsCount.add(1);
		});
		
		this.buildings.push(new Building({
			name: 'quarks',
			atomsPerSecond: 0.1,
			startingPrice: 10
		}));
		
		this.buildings.push(new Building({
			name: 'nucleons',
			atomsPerSecond: 3,
			startingPrice: 100
		}));
		
		this.buildings.push(new Building({
			name: 'white hole',
			atomsPerSecond: 50,
			startingPrice: 5000
		}));
	}

	public update() {
		this.showedCount.text = `${this.atomsCount.toString().split('.')[0]} atoms`;
		this.showedCount.position.x = window.innerWidth / 2;
		this.showedAPS.text = `per second: ${this.atomPerSeconds.toString().replace(/(\d+\.\d{2})\d+/g, '$1')}`;
		this.showedAPS.position.x = window.innerWidth / 2;
		this.mainAtom.sprite.position.x = window.innerWidth / 2 - this.mainAtom.sprite.width / 2;
		
		this.buildings.forEach(building => building.update());
		this.buildings.forEach((building, index) => {
			building.container.x = window.innerWidth - building.container.width;
			building.container.y = index * (building.container.height + 5) + window.innerHeight / 4;
			app.stage.addChild(building.container);
		})
	}

	public async calculateAPS() {
		this.atomPerSeconds = new BigFloat(this.buildings.map(building => building.totalAtomPerSecond).reduce((previous, current) => previous + current));
	}
}
