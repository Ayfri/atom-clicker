import {BigFloat} from 'bigfloat.js';
import * as PIXI from 'pixi.js';
import Game from './elements/Game.js';

export let game: Game;

async function setup() {
	await loadTextures();
	game = new Game();
	(window as any).game = game;
}

export const app = new PIXI.Application({
	antialias: true,
	resizeTo: window,
	backgroundColor: 0xbbbbbb,
});

async function loadTextures() {
	await new Promise(resolve => {
		PIXI.Loader.shared.load(resolve);
	});
}

setup().then(() => {
	PIXI.Ticker.shared.add(
		async () => {
			game.update();
			game.calculateAPS();
		},
		{},
		PIXI.UPDATE_PRIORITY.HIGH
	);
	console.log('Game started.');
});

document.body.appendChild(app.view);

(window as any).bigfloat = BigFloat;
(window as any).app = app;
(window as any).PIXI = PIXI;
