export function getTextureByName(name: string): PIXI.Texture | undefined {
	return PIXI.Loader.shared.resources[name].texture;
}
