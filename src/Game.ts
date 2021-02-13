import JSBI from 'jsbi';
import * as PIXI from 'pixi.js';
import { app } from './app.js';
import Clickable from './Clickable.js';
import Upgrade from './Upgrade.js';
import { sleep } from './utils/utils.js';

export default class Game {
	public mainAtom: Clickable;
	public showedCount: PIXI.Text;
	public atomsCount: JSBI = JSBI.BigInt(0);
	public atomPerSeconds: JSBI = JSBI.BigInt(0);
	public showedAPR: PIXI.Text;
	public upgrades: Upgrade[] = [];

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
			fontSize: 50,
			padding: 20,
		});
		this.showedCount = new PIXI.Text(this.atomsCount.toString(), style);
		this.showedCount.anchor.set(0.5);
		this.showedCount.position.set(window.innerWidth / 2, 40);
		app.stage.addChild(this.showedCount);

		this.showedAPR = new PIXI.Text(this.atomPerSeconds.toString(), JSON.parse(JSON.stringify(style)));
		this.showedAPR.style.fontSize = 30;
		this.showedAPR.anchor.set(0.5);
		this.showedAPR.position.set(window.innerWidth / 2, 80);
		app.stage.addChild(this.showedAPR);

		this.mainAtom.on('click', () => {
			this.atomsCount = JSBI.add(this.atomsCount, JSBI.BigInt(1));
		});
		
		this.upgrades.push(new Upgrade({
			name: 'cursor',
			atomsPerSecond: 0.1,
			startingPrice: 10
		}));
	}

	public update() {
		this.showedCount.text = `${this.atomsCount.toString()} atoms`;
		this.showedAPR.text = `per second: ${this.atomPerSeconds.toString()}`;
		this.mainAtom.sprite.position.x = window.innerWidth / 2 - this.mainAtom.sprite.width / 2;
		this.showedCount.position.x = window.innerWidth / 2;
		
		this.upgrades.forEach(upgrade => upgrade.update());
		this.upgrades.forEach((upgrade, index) => {
			upgrade.container.x = window.innerWidth - upgrade.container.width;
			upgrade.container.y = index * upgrade.container.height / 2;
			app.stage.addChild(upgrade.container);
		})
	}

	public async calculateAPR() {
		const oldAtoms = this.atomsCount;
		await sleep(1000);
		this.atomPerSeconds = JSBI.add(this.atomsCount, JSBI.BigInt(-oldAtoms));
	}
}
