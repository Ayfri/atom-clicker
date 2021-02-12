import * as PIXI from 'pixi.js';

async function setup() {
	await loadTextures();
}

export const app = new PIXI.Application({
	antialias: true,
	resizeTo: window,
	backgroundColor: 0xdddddd,
});

async function loadTextures() {
	await new Promise(resolve => {
		PIXI.Loader.shared.load(resolve);
	});
}

setup().then(() => {
	console.log('Game started.');
});

document.body.appendChild(app.view);
window['app'] = app;
window['PIXI'] = PIXI;
