import * as PIXI from 'pixi.js';
import Overlay from '../gui/Overlay.js';
import {JSONable} from '../types.js';

export interface Buyable extends JSONable {
	readonly canBeBought: boolean;
	container: PIXI.Container;
	readonly name: string;
	nameText?: PIXI.Text;
	overlay: Overlay;
	readonly price: number;
	priceText?: PIXI.Text;
}
