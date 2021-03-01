import TWEEN from '@tweenjs/tween.js';

export function getTextureByName(name: string): PIXI.Texture | undefined {
	return PIXI.Loader.shared.resources[name].texture;
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
	from: number;
	onUpdate: (value: number) => unknown;
	to: number;
}

export function tween(options: TweenOptions): Promise<void> {
	return new Promise(resolve => {
		const ticker = new PIXI.Ticker();
		const t = new TWEEN.Tween({value: options.from})
			.to(
				{
					value: options.to,
				},
				options.duration
			)
			.easing(options.easing)
			.onUpdate(result => options.onUpdate(result.value))
			.onComplete(() => resolve())
			.start();

		ticker.add(() => t.update(), {}, PIXI.UPDATE_PRIORITY.HIGH).start();
	});
}

(window as any).utils = {
	getTextureByName,
	deepCopy,
	sleep,
	tween,
};
