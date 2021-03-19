import {Easing} from '@tweenjs/tween.js';
import * as PIXI from 'pixi.js';
import {app, game} from '../app';
import Clickable from '../components/Clickable';
import {deepCopy, getTextureByName, random, sleep, tween} from '../utils/utils';
import Upgrade, {ConditionType, UpgradeType} from './Upgrade';

interface BoostOptions<T extends UpgradeType, L extends ConditionType> {
	condition?: L;
	duration?: number;
	effect: T;
	texture?: PIXI.Texture;
}

export default class Boost<T extends UpgradeType, L extends ConditionType> extends Clickable {
	public static savedBoosts: Boost<UpgradeType, ConditionType>[] = [];
	public clicked: boolean = false;
	public condition?: L;
	public duration?: number;
	public effect: T;
	public hiding: boolean = false;
	public spawned: boolean = false;
	public unlocked: boolean = true;

	public constructor(options: BoostOptions<T, L>) {
		super(options.texture ?? random([getTextureByName('red-atom'), getTextureByName('blue-atom')]));
		this.effect = options.effect;
		this.sprite.width = 100;
		this.sprite.height = 100;
		this.sprite.alpha = 0;
		this.condition = options.condition;
		this.duration = options.duration;

		this.sprite.on('click', async () => {
			if (!this.hiding) await this.click();
		});
	}

	public async spawn() {
		this.unlocked = Upgrade.checkUnlock(this.condition);
		if (!this.unlocked) return;
		this.spawned = true;
		this.sprite.position.set(
			Math.random() * (window.innerWidth - this.sprite.width * 2) + this.sprite.width,
			Math.random() * (window.innerHeight - this.sprite.height * 2) + this.sprite.height
		);

		this.sprite.alpha = 0;
		app.stage.addChild(this.sprite);
		await tween({
			duration: 5000,
			easing: Easing.Linear.None,
			from: 0,
			to: 1,
			onUpdate: value => (this.sprite.alpha = value),
		});

		await sleep(20000);
		if (!this.clicked) await this.hide(5000);
	}

	public async click() {
		if (!this.spawned || this.clicked) return;
		Upgrade.applyEffect(this.effect);
		this.clicked = true;

		if (this.duration) {
			setTimeout(() => {
				const negativeEffect = deepCopy(this.effect);
				if (negativeEffect.multiplier) negativeEffect.multiplier = 1 / negativeEffect.multiplier;
				else negativeEffect.addition = -negativeEffect.addition;

				switch (this.effect.kind) {
					case 'building':
					case 'buildingGlobal':
					case 'clicks':
					case 'clickAPS':
						Upgrade.applyEffect(negativeEffect);
				}
			}, this.duration * 1000);
		}

		const textContent: string = Upgrade.getEffectAsString(this.effect, this.duration).replace('Multiply', 'Multiplied').replace('Add', 'Added');
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
		this.hiding = true;
		await tween({
			duration: time,
			easing: Easing.Linear.None,
			from: 1,
			to: 0,
			onUpdate: value => (this.sprite.alpha = value),
		});
		app.stage.removeChild(this.sprite);
		this.spawned = false;
		this.hiding = false;
		this.clicked = false;
	}
}

(window as any).Boost = Boost;
