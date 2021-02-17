import * as PIXI from 'pixi.js';
import {game} from '../app.js';
import Button from '../components/Button.js';
import {TextInput} from 'pixi-textinput-v5';
import SaveGUI from './SaveGUI.js';
import Window from './Window.js';

export default class GUI extends Window {
	public atomsCountText: PIXI.Text;
	public atomsPerClicksText: PIXI.Text;
	public APSText: PIXI.Text;
	public clicksTexts: PIXI.Text[] = [];
	public CPSText: PIXI.Text;
	public saveButton: Button;
	public saveGUI: SaveGUI;

	public constructor() {
		super({
			texture: PIXI.Texture.EMPTY
		});

		const style = new PIXI.TextStyle({
			dropShadow: true,
			dropShadowBlur: 5,
			dropShadowDistance: 0,
			fill: '#ffffff',
			fontSize: 60,
			padding: 20,
		});

		this.atomsCountText = new PIXI.Text('', style);
		this.atomsCountText.anchor.set(0.5);
		this.atomsCountText.position.set(window.innerWidth / 2, 40);

		this.APSText = new PIXI.Text('', JSON.parse(JSON.stringify(style)));
		this.APSText.style.fontSize = 35;
		this.APSText.anchor.set(0.5);
		this.APSText.position.set(window.innerWidth / 2, 80);

		this.atomsPerClicksText = new PIXI.Text('');
		this.atomsPerClicksText.anchor.set(0, 0.5);
		this.atomsPerClicksText.position.set(window.innerWidth / 40, window.innerHeight / 15);

		this.CPSText = new PIXI.Text('');
		this.CPSText.anchor.set(0, 0.5);
		this.CPSText.position.set(window.innerWidth / 40, window.innerHeight / 15 + 30);

		for (let i = 0; i < 50; i++) {
			const text: PIXI.Text = new PIXI.Text('');
			text.visible = false;
			text.zIndex = 100;
			text.anchor.set(0.5);
			this.clicksTexts.push(text);
		}

		this.saveButton = new Button(PIXI.Texture.WHITE, 'Save');

		this.container.addChild(this.atomsCountText, this.APSText, this.atomsPerClicksText, this.CPSText, this.saveButton.container, ...this.clicksTexts);

		this.saveButton.on('click', () => {
			this.saveGUI = new SaveGUI();
			this.container.addChild(this.saveGUI.container);
/*
			const textInput = new TextInput({
				input: {
					fontSize: '18px',
				},
				box: {
					default: {
						fill: 0xf9f9f9,
						rounded: 10,
						stroke: {
							color: 0x404040,
							width: 2,
						},
					},
				},
			});

			(textInput._dom_input as HTMLInputElement).value = 'test \n'.repeat(10);
			//			textInput._disabled = true;
			//			textInput._setState('DISABLED');
			textInput.setInputStyle('padding', '5px');
			(textInput._dom_input as HTMLInputElement).readOnly = true;
			textInput.position.set(window.innerWidth / 2, window.innerHeight / 2);
			this.container.addChild(textInput);
			console.log(textInput);*/

			this.saveGUI.exitButton.on('click', () => {
				this.saveGUI.close();
				this.container.removeChild(this.saveGUI.container);
			})
		});
	}

	public get clicksPerSeconds(): number {
		return this.clicksTexts.filter(text => text.visible).length;
	}

	public click(position: PIXI.Point) {
		const text = this.clicksTexts.find(text => !text.visible);
		if (!text) return;
		text.text = `+${game.totalAtomsPerClicks}`;
		text.alpha = 1;
		text.visible = true;
		text.position = position;
		text.x += Math.random() * 10 - 5;
		setTimeout(() => (text.visible = false), 1000);
	}

	public update() {
		this.atomsCountText.text = `${game.atomsCount.toString().split('.')[0]} atoms`;
		this.atomsCountText.position.x = window.innerWidth / 2;

		this.APSText.text = `per second: ${game.totalAtomsPerSecond.toString().replace(/(\d+\.\d{2})\d+/g, '$1')}`;
		this.APSText.position.x = window.innerWidth / 2;

		this.atomsPerClicksText.text = `Atoms per clicks: ${game.totalAtomsPerClicks.toString()}`;
		this.atomsPerClicksText.position.set(window.innerWidth / 40, window.innerHeight / 15);

		this.CPSText.text = `Clicks per second: ${this.clicksPerSeconds}`;
		this.CPSText.position.set(window.innerWidth / 40, window.innerHeight / 15 + 30);

		this.clicksTexts
			.filter(text => text.visible)
			.forEach(text => {
				text.position.y--;
				text.alpha -= 1 / PIXI.Ticker.shared.FPS;
			});
	}
}
