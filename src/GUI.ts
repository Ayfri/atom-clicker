import * as PIXI from 'pixi.js';
import { game } from './app.js';

export default class GUI {
	public atomsCountText: PIXI.Text;
	public atomsPerClicksText: PIXI.Text;
	public APSText: PIXI.Text;
	public container: PIXI.Container;
	public clicksTexts: PIXI.Text[] = [];
	
	public constructor() {
		this.container = new PIXI.Container();
		
		const style = new PIXI.TextStyle({
			dropShadow: true,
			dropShadowBlur: 5,
			dropShadowDistance: 0,
			fill: '#ffffff',
			fontSize: 60,
			padding: 20
		});
		
		this.atomsCountText = new PIXI.Text('', style);
		this.atomsCountText.anchor.set(0.5);
		this.atomsCountText.position.set(window.innerWidth / 2, 40);
		this.container.addChild(this.atomsCountText);
		
		this.APSText = new PIXI.Text('', JSON.parse(JSON.stringify(style)));
		this.APSText.style.fontSize = 35;
		this.APSText.anchor.set(0.5);
		this.APSText.position.set(window.innerWidth / 2, 80);
		this.container.addChild(this.APSText);
		
		this.atomsPerClicksText = new PIXI.Text('');
		this.atomsPerClicksText.anchor.set(0.5);
		this.atomsPerClicksText.position.set(window.innerWidth / 10, window.innerHeight / 10);
		this.container.addChild(this.atomsPerClicksText);
		
		for (let i = 0; i < 50; i++) {
			const text: PIXI.Text = new PIXI.Text('');
			text.visible = false;
			text.zIndex = 100;
			text.anchor.set(0.5);
			this.clicksTexts.push(text);
		}
		
		this.container.addChild(...this.clicksTexts);
	}
	
	public click(position: PIXI.Point) {
		const text = this.clicksTexts.find((text) => !text.visible);
		if (!text) return;
		text.text = `+${game.totalAtomsPerClicks}`;
		text.alpha = 1;
		text.visible = true;
		text.position = position;
		text.x += Math.random() * 10 - 5;
		setTimeout(() => text.visible = false, 1000);
	}
	
	public update() {
		this.atomsCountText.text = `${game.atomsCount.toString().split('.')[0]} atoms`;
		this.atomsCountText.position.x = window.innerWidth / 2;
		
		this.APSText.text = `per second: ${game.atomsPerSecond.toString().replace(/(\d+\.\d{2})\d+/g, '$1')}`;
		this.APSText.position.x = window.innerWidth / 2;
		
		this.atomsPerClicksText.text = `Atoms per clicks: ${game.totalAtomsPerClicks.toString()}`;
		
		this.clicksTexts.filter(text => text.visible).forEach((text) => {
			text.position.y--;
			text.alpha -= 1/PIXI.Ticker.shared.FPS;
		});
	}
}
