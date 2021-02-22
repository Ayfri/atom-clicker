import {game, loadGameFromSave} from '../app.js';
import Button from '../components/Button.js';
import Clickable from '../components/Clickable.js';
import {JSONObject} from '../types.js';
import {getTextureByName} from '../utils/utils.js';
import Game from './Game.js';
import Window from './Window.js';

export default class LoadGUI extends Window {
	public exitButton: Clickable;
	public input: HTMLTextAreaElement;
	public loadButton: Button;

	public constructor() {
		super({
			width: window.innerWidth / 3,
			height: window.innerHeight / 3,
		});

		this.loadButton = new Button(PIXI.Texture.WHITE, 'Load');
		this.background.tint = 0xd6d6d6;

		this.exitButton = new Clickable(getTextureByName('x'));
		this.exitButton.sprite.anchor.set(0.5, 0.5);
		this.exitButton.sprite.position.set(this.container.width - this.exitButton.sprite.height / 2 - 10, this.exitButton.sprite.height - 10);
		this.container.addChild(this.loadButton.container, this.exitButton.sprite);

		this.input = document.createElement('textarea');
		this.input.style.padding = '5px';
		this.input.style.resize = 'none';
		this.input.style.border = '1px solid black';
		this.input.style.borderRadius = '20px';
		this.input.style.position = 'absolute';
		this.input.style.left = '35%';
		this.input.style.top = '40%';
		this.input.style.width = '29%';
		this.input.style.height = '25%';
		this.input.style.visibility = 'hidden';
		this.input.id = 'load';
		document.body.appendChild(this.input);

		this.loadButton.on('click', () => {
			LoadGUI.decompressSave(this.input.value);
		});
	}

	public static decompressSave(save: string) {
		if (!save) return;
		save = atob(save);
		let decompressSave: JSONObject;
		save = save.replace(/([{,])([iubctonpsde]|ac|acb|asb|bb|ta)(:)/g, '$1"$2"$3');
		decompressSave = JSON.parse(save);
		decompressSave.b = (decompressSave.b as JSONObject[]).map(b => {
			return typeof b === 'number'
				? {i: Game.getBuyableFromIndex(b, 'building').name}
				: typeof b.i === 'number'
				? {
						...b,
						i: Game.getBuyableFromIndex(b.i, 'building')?.name,
				  }
				: b;
		}) as JSONObject[];
		decompressSave.u = (decompressSave.u as JSONObject[]).map(u => {
			return typeof u === 'number'
				? {i: Game.getBuyableFromIndex(u, 'upgrade')?.name}
				: typeof u.i === 'number'
				? {
						...u,
						i: Game.getBuyableFromIndex(u.i, 'upgrade')?.name,
				  }
				: u;
		}) as JSONObject[];
		game.gui.loadGUI?.close();
		game.gui.saveGUI?.close();
		loadGameFromSave(decompressSave);
	}

	public open() {
		this.input.style.visibility = 'visible';
	}

	public close() {
		this.input.style.visibility = 'hidden';
	}

	public update() {
		this.background.width = window.innerWidth / 3;
		this.background.height = window.innerHeight / 2.5;
		this.exitButton.sprite.position.set(this.container.width - this.exitButton.sprite.height / 2 - 10, this.exitButton.sprite.height - 10);
		this.loadButton.container.position.set(this.container.width / 2 - this.loadButton.container.width / 2, 10);

		this.container.position.set((window.innerWidth - this.container.width) / 2, (window.innerHeight - this.container.height) / 2);
	}
}
