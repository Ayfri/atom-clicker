import * as PIXI from 'pixi.js';

export default class EventEmitter<Events extends Record<string, any[]>> extends PIXI.utils.EventEmitter {
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

(window as any).EventEmitter = EventEmitter;
