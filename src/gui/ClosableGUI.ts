import Clickable from '../components/Clickable';
import {getTextureByName} from '../utils/utils';
import GUI, {GUIOptions} from './GUI';

export default class ClosableGUI extends GUI {
    public exitButton: Clickable;

	public constructor(options?: GUIOptions) {
		super(options);

		this.exitButton = new Clickable(getTextureByName('x'));
		this.exitButton.sprite.anchor.set(0.5, 0.5);
		this.exitButton.sprite.position.set(this.container.width - this.exitButton.sprite.height / 2 - 10, this.exitButton.sprite.height - 10);
		this.container.addChild(this.exitButton.sprite);
		this.container.visible = false;

		this.exitButton.on('click', () => this.close());
	}

	public open() {
		this.container.visible = true;
	}

	public close() {
		this.container.visible = false;
	}

	public resize() {
		this.exitButton.sprite.position.set(this.container.width - this.exitButton.sprite.height / 2 - 10, this.exitButton.sprite.height - 10);
	}
}
