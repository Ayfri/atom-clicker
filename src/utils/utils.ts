export function getTextureByName(name: string): PIXI.Texture | undefined {
	return PIXI.Loader.shared.resources[name].texture;
}

export function sleep(ms: number): Promise<unknown> {
	return new Promise( resolve => setTimeout(resolve, ms) );
}
