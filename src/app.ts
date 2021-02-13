import * as PIXI from 'pixi.js';
import Game from './Game.js';

export let game: Game;

async function setup() {
	await loadTextures();
	game = new Game();
	//@ts-ignore
	window['game'] = game;
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
	PIXI.Ticker.shared.add(async() => {
		game.update();
		await game.calculateAPR();
	}, {}, PIXI.UPDATE_PRIORITY.HIGH);
	console.log('Game started.');
});

document.body.appendChild(app.view);
//@ts-ignore
window['app'] = app;
window['PIXI'] = PIXI;
