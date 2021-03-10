import {Easing} from '@tweenjs/tween.js';
import * as PIXI from 'pixi.js';
import {app} from '../app';
import Clickable from '../components/Clickable';
import {sleep, tween} from '../utils/utils';
import Upgrade, {UpgradeType} from './Upgrade';

interface BoostOptions<T extends UpgradeType> {
	effect: T;
	texture?: PIXI.Texture;
}

export default class Boost<T extends UpgradeType> extends Clickable {
	public static savedBoosts: Boost<UpgradeType>[] = [];
	public clicked: boolean = false;
	public effect: T;
	public spawned: boolean = false;

	public constructor(options: BoostOptions<T>) {
		super(options.texture ?? PIXI.Texture.WHITE);
		this.effect = options.effect;
		this.sprite.width = 100;
		this.sprite.height = 100;
		this.sprite.alpha = 0;

		this.sprite.on('click', async () => await this.click());
	}

	public async spawn() {
		this.sprite.position.set(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
		app.stage.addChild(this.sprite);
		this.spawned = true;
		await tween({
			duration: 5000,
			easing: Easing.Linear.None,
			from: 0,
			to: 4,
			onUpdate: value => (this.sprite.alpha = value),
		});
		await sleep(20000);
		if (!this.clicked) await this.hide(5000);
	}

	public async click() {
		if (!this.spawned) return;
		Upgrade.applyEffect(this.effect);
		this.clicked = true;
		const textContent: string = Upgrade.getEffectAsString(this.effect).replace('Multiply', 'Multiplied').replace('Add', 'Added');
		const text = new PIXI.Text(textContent, {
			fontSize: 30,
			fontWeight: 'bold',
		});
		text.anchor.set(0.5);
		text.position.set(window.innerWidth / 2, window.innerHeight / 6);
		app.stage.addChild(text);
		await this.hide();

		await sleep(500);
		await tween({
			duration: 300,
			from: 1,
			to: 0,
			onUpdate: value => {
				text.alpha = value;
				text.position.y--;
			},
		});
		app.stage.removeChild(text);
		text.destroy();
	}

	public async hide(time: number = 1000) {
		if (!this.spawned) return;
		await tween({
			duration: time,
			easing: Easing.Linear.None,
			from: 1,
			to: 0,
			onUpdate: value => (this.sprite.alpha = value),
		});
		app.stage.removeChild(this.sprite);
		this.spawned = false;
	}
}

(window as any).Boost = Boost;
