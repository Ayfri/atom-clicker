import {BigFloat} from 'bigfloat.js';
import * as PIXI from 'pixi.js';
import Game from './app/Game';
import GUI from './gui/GUI';
import LoadGUI from './gui/LoadGUI';
import SaveGUI from './gui/SaveGUI';
import {JSONObject} from './types';

export let game: Game;

export const app = new PIXI.Application({
	antialias: true,
	resizeTo: window,
	backgroundColor: 0xaaaaaa,
});

document.body.appendChild(app.view);

async function loadTextures() {
	await new Promise(resolve => {
		PIXI.Loader.shared.add('x', 'textures/x.png');
		PIXI.Loader.shared.load(resolve);
	});
}

async function setup() {
	await loadTextures();
	game = new Game();
	if (localStorage.getItem('save')) LoadGUI.decompressSave(localStorage.getItem('save'));
	(window as any).game = game;

	game.resize();
	window.onresize = () => game.resize();

	setInterval(() => localSave(), 1000 * 30);
}

export function localSave() {
	localStorage.setItem('save', SaveGUI.generateSave());
	const popup = new GUI({
		texture: PIXI.Texture.WHITE,
	});
	popup.background.width = 150;
	popup.background.height = 40;
	popup.background.anchor.set(0.5);
	popup.container.position.set(window.innerWidth / 2, window.innerHeight - window.innerHeight / 5);

	const text = new PIXI.Text(
		'Game saved !',
		new PIXI.TextStyle({
			fontSize: 20,
		})
	);
	text.anchor.set(0.5);
	popup.container.addChild(text);
	app.stage.addChild(popup.container);

	const up = new PIXI.Ticker();
	up.add(
		() => {
			popup.container.position.y--;
			popup.container.alpha -= 1 / up.FPS;
		},
		{},
		PIXI.UPDATE_PRIORITY.LOW
	);
	up.start();

	setTimeout(() => {
		app.stage.removeChild(popup.container);
		up.destroy();
	}, 2000);
}

export function resetGame(save?: JSONObject) {
	game.gui.loadGUI.close();
	game.gui.saveGUI.close();
	game.gui.resetGUI.close();
	game.upgrades.forEach(upgrade => upgrade.overlay.hide());
	game.buildings.forEach(building => building.overlay.hide());

	app.stage.removeChildren();
	game.resetDefaultBuyables();
	game = new Game(save);
	(window as any).game = game;
}

setup().then(() => {
	PIXI.Ticker.shared.add(() => game.update(), {}, PIXI.UPDATE_PRIORITY.HIGH);
	console.log('Game started.');
});

(window as any).bigfloat = BigFloat;
(window as any).app = app;
(window as any).PIXI = PIXI;
