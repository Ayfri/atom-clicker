import * as PIXI from 'pixi.js';
import {resetGame} from '../app.js';
import Game from '../app/Game.js';
import Clickable from '../components/Clickable.js';
import {JSONObject} from '../types.js';
import Button from './Button';
import ClosableGUI from './ClosableGUI';

export default class LoadGUI extends ClosableGUI {
	public input: HTMLTextAreaElement;
	public loadButton: Button;

	public constructor() {
		super({
			width: window.innerWidth / 3,
			height: window.innerHeight / 2.5,
		});

		this.loadButton = new Button(PIXI.Texture.WHITE, 'Load');
		this.loadButton.color = 0xe5e5e5;
		this.loadButton.hoverColor = 0xf5f5f5;

		this.container.addChild(this.loadButton.container);

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

		this.loadButton.on('click', () => LoadGUI.decompressSave(this.input.value));
		this.resize();
	}

	public static decompressSave(save: string) {
		if (!save) return;
		try {
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
			resetGame(decompressSave);
		} catch (ignored) {}
	}

	public close() {
		super.close();
		this.input.style.visibility = 'hidden';
	}

	public exitButton: Clickable;

	public open() {
		super.open();
		this.input.style.visibility = 'visible';
	}

	public resize() {
		this.background.width = window.innerWidth / 3;
		this.background.height = window.innerHeight / 2.5;
		this.loadButton.resize();
		this.loadButton.container.position.set(this.container.width / 2 - this.loadButton.container.width / 2, 10);

		this.container.position.set((window.innerWidth - this.container.width) / 2, (window.innerHeight - this.container.height) / 2);
		super.resize();
	}

	public update() {
		this.loadButton.update();
	}
}
