import Overlay from '../gui/Overlay.js';
import {JSONable} from '../types.js';

export interface Buyable extends JSONable {
	readonly name: string;
	readonly price: number;
	readonly canBeBought: boolean;
	container: PIXI.Container;
	overlay: Overlay;
	priceText?: PIXI.Text;
	nameText?: PIXI.Text;
}
