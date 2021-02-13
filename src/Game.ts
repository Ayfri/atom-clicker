import { app } from './app.js';
import Clickable from './Clickable.js';
import * as PIXI from 'pixi.js';
import JSBI from 'jsbi';

export default class Game {
	public mainAtom: Clickable;
	public showedCount: PIXI.Text;
	public count: JSBI = JSBI.BigInt(0);

	public constructor() {
		this.mainAtom = new Clickable(PIXI.Texture.WHITE);
		this.mainAtom.sprite.height = 100;
		this.mainAtom.sprite.width = 100;
		this.showedCount = new PIXI.Text(this.count.toString());
		app.stage.addChild(this.mainAtom.sprite);
		app.stage.addChild(this.showedCount);

		this.mainAtom.on('click', () => {
			this.count = JSBI.add(this.count, JSBI.BigInt(1));
		});
	}

	public update() {
		this.showedCount.text = this.count.toString();
	}
}
