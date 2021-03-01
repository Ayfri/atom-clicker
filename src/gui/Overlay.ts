import {BigFloat} from 'bigfloat.js';
import {game} from '../app.js';
import GUI from './GUI';

interface OverlayOptions {
	description: string;
	stats?: {[k in StatsType]?: PIXI.Text};
	title: string;
}

export enum StatsType {
	APS_WAIT_TIME = 'APS_WAIT_TIME',
	EFFICIENCY_EACH = 'EFFICIENCY_EACH',
	EFFICIENCY_TOTAL_PERCENTAGE = 'EFFICIENCY_TOTAL_PERCENTAGE',
	EFFICIENCY_TOTAL = 'EFFICIENCY_TOTAL',
	PRICE = 'PRICE',
}

export default class Overlay extends GUI {
	public description: PIXI.Text;
	public stats: Map<StatsType, PIXI.Text>;
	public title: PIXI.Text;

	public constructor(options: OverlayOptions) {
		super();
		this.container.visible = false;
		this.container.zIndex = 100;

		this.background.height = 80 + Object.keys(options.stats).length * 25;
		this.background.width = 0;
		this.background.tint = 0xf0f0f0;

		this.title = new PIXI.Text(options.title);
		this.title.anchor.set(0.5, 0);

		this.description = new PIXI.Text(options.description, {
			fontSize: 18,
		});
		this.description.anchor.set(0, 0.5);

		this.stats = new Map();
		for (const stat in options.stats) {
			const text: PIXI.Text = options.stats[stat as StatsType];
			text.style.fontSize = 15;
			text.anchor.set(0, 0.5);
			this.stats.set(stat as StatsType, text);
		}

		this.container.addChild(this.title, this.description, ...this.stats.values());
		this.background.width = this.container.width + 50;
	}

	public hide() {
		this.container.visible = false;
	}

	public resize(position?: PIXI.Point) {
		if (position) this.update(position);
		this.title.position.x = this.container.width / 2;
		this.description.position.set(10, 45);

		for (let i = 0; i < this.stats.size; i++) {
			const stat: PIXI.Text = [...this.stats.values()].sort((stat1, stat2) => stat1.text.localeCompare(stat2.text))[i];
			stat.position.set(this.container.width / 10, 80 + i * (stat.height + 7));
		}
	}

	public setAPSWaitFromPrice(price: BigFloat | number) {
		const timeToWaitForBuy: BigFloat = new BigFloat(price).minus(game.atomsCount).div(game.totalAtomsPerSecond);
		this.stats.get(StatsType.APS_WAIT_TIME).text =
			timeToWaitForBuy.equals(0) && game.atomsCount.lessThan(price)
				? "Can't be bough."
				: `Can be bought${timeToWaitForBuy.lessThan(0) ?? game.atomsCount.greaterThanOrEqualTo(price) ? '' : ` in ${timeToWaitForBuy.ceil()} seconds`}.`;
	}

	public show() {
		this.container.visible = true;
	}

	public update(position: PIXI.Point) {
		this.container.position = position;
		if (position.x + this.container.width > window.innerWidth) this.container.x -= this.container.width;
		if (position.y + this.container.height > window.innerHeight) this.container.y -= this.container.height;
	}
}

(window as any).Overlay = Overlay;
