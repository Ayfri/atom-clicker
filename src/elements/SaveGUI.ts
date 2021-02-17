import Clickable from '../components/Clickable.js';
import {getTextureByName} from '../utils/utils.js';
import Window from './Window.js';

export default class SaveGUI extends Window {
	public exitButton: Clickable;
	public input: HTMLTextAreaElement;

	public constructor() {
		super({
			width: window.innerWidth / 3,
			height: window.innerHeight / 3,
		});
		this.background.tint = 0xd6d6d6;
		this.container.position.set((window.innerWidth - this.container.width) / 2, (window.innerHeight - this.container.height)/2);

		this.exitButton = new Clickable(getTextureByName('x'));
		this.exitButton.sprite.anchor.set(0.5, 0.5);
		this.exitButton.sprite.position.set(this.container.width - (this.exitButton.sprite.height / 2) - 10, this.exitButton.sprite.height - 10);
		this.container.addChild(this.exitButton.sprite);

		this.input = document.createElement('textarea');
		this.input.readOnly = true;
		this.input.textContent = 'test';
		this.input.style.padding = '5px';
		this.input.style.border = '1px solid black';
		this.input.style.borderRadius = '20px';
		this.input.style.textAlign = 'center';
		this.input.style.position = 'absolute';
		this.input.style.left = '35%';
		this.input.style.top = '40%';
		this.input.style.width = '29%';
		this.input.style.height = '25%';
		document.body.appendChild(this.input);
	}

	public close() {
		document.body.removeChild(this.input);
	}
}
