import * as PIXI from 'pixi.js';

type EventMap = {
	[k in string]: any[];
};

export default class EventEmitter<Events extends EventMap> extends PIXI.utils.EventEmitter {
	public constructor() {
		super();
	}
	
	public emit<K extends keyof Events>(event: string | symbol, ...args: Events[K]): boolean {
		return super.emit(event, ...args);
	}
	
	public on<K extends string & keyof Events>(event: K, fn: (...params: Events[K]) => void, context?: any) {
		return super.on(event, fn, context);
	}
	
	public once<K extends string & keyof Events>(event: K, fn: (...params: Events[K]) => void, context?: any) {
		return super.once(event, fn, context);
	}
}
