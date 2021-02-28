import * as PIXI from 'pixi.js';
import {game, localSave} from '../app.js';
import Button from './Button';
import GUI from './GUI';
import LoadGUI from './LoadGUI';
import SaveGUI from './SaveGUI';

export default class MainGUI extends GUI {
	public atomsCountText: PIXI.Text;
	public atomsPerClicksText: PIXI.Text;
	public APSText: PIXI.Text;
	public clicksTexts: PIXI.Text[] = [];
	public CPSText: PIXI.Text;
	public exportSaveButton: Button;
	public loadExportedSaveButton: Button;
	public saveButton: Button;
	public saveGUI: SaveGUI;
	public loadGUI: LoadGUI;

	public constructor() {
		super({
			texture: PIXI.Texture.EMPTY,
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

		this.exportSaveButton = new Button(PIXI.Texture.WHITE, 'Export Save');
		this.loadExportedSaveButton = new Button(PIXI.Texture.WHITE, 'Load Exported Save');
		this.saveButton = new Button(PIXI.Texture.WHITE, 'Save');

		this.container.addChild(
			this.atomsCountText,
			this.APSText,
			this.atomsPerClicksText,
			this.CPSText,
			this.saveButton.container,
			this.exportSaveButton.container,
			this.loadExportedSaveButton.container,
			...this.clicksTexts
		);

		this.saveButton.on('click', () => localSave());

		this.exportSaveButton.on('click', () => {
			if (!this.saveGUI) this.saveGUI = new SaveGUI();
			this.saveGUI.open();
			this.container.addChild(this.saveGUI.container);

			this.saveGUI.exitButton.on('click', () => {
				this.saveGUI.close();
				this.container.removeChild(this.saveGUI.container);
			});
		});

		this.loadExportedSaveButton.on('click', () => {
			if (!this.loadGUI) this.loadGUI = new LoadGUI();
			this.loadGUI.open();
			this.container.addChild(this.loadGUI.container);

			this.loadGUI.exitButton.on('click', () => {
				this.loadGUI.close();
				this.container.removeChild(this.loadGUI.container);
			});
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
		this.saveGUI?.update();
		this.loadGUI?.update();
		this.saveButton.container.position.set(window.innerWidth / 2 - this.saveButton.container.width / 2, window.innerHeight - this.saveButton.container.height);
		this.saveButton.update();
		this.exportSaveButton.container.position.set(0, window.innerHeight - this.exportSaveButton.container.height);
		this.exportSaveButton.update();
		this.loadExportedSaveButton.container.position.set(this.exportSaveButton.container.width + 5, window.innerHeight - this.loadExportedSaveButton.container.height);
		this.loadExportedSaveButton.update();

		this.clicksTexts
			.filter(text => text.visible)
			.forEach(text => {
				text.position.y--;
				text.alpha -= 1 / PIXI.Ticker.shared.FPS;
			});
	}
}