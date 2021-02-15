export function getTextureByName(name: string): PIXI.Texture | undefined {
	return PIXI.Loader.shared.resources[name].texture;
}

export function deepCopy<T>(source: T): T {
	return JSON.parse(JSON.stringify(source));
}

export function sleep(ms: number): Promise<unknown> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

(window as any).utils = {
	getTextureByName,
	deepCopy,
	sleep,
};
