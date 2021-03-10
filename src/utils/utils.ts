import TWEEN from '@tweenjs/tween.js';
import * as PIXI from 'pixi.js';

export function getTextureByName(name: string): PIXI.Texture | undefined {
	return PIXI.Loader.shared.resources[name].data;
}

export function deepCopy<T>(source: T): T {
	return JSON.parse(JSON.stringify(source));
}

export function sleep(ms: number): Promise<unknown> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

interface TweenOptions {
	duration: number;
	easing: (value: number) => number;
	endIf?: (value: number) => boolean;
	from: number;
	onUpdate: (value: number) => unknown;
	to: number;
}

export function tween(options: TweenOptions): Promise<void> {
	return new Promise(resolve => {
		const ticker = new PIXI.Ticker();
		const object = {value: options.from};
		const t = new TWEEN.Tween(object)
			.to(
				{
					value: options.to,
				},
				options.duration,
			)
			.easing(options.easing)
			.onUpdate(() => options.onUpdate(object.value))
			.onComplete(() => {
				resolve();
				ticker.stop();
				ticker.destroy();
			})
			.start();

		ticker.add(() => {
			t.update();
			if (options.endIf?.(object.value)) {
				object.value = options.to;
				t.end();
			}
		}, {}, PIXI.UPDATE_PRIORITY.HIGH).start();
	});
}

(window as any).utils = {
	getTextureByName,
	deepCopy,
	sleep,
	tween,
};
