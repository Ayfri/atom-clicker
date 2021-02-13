import * as PIXI from 'pixi.js';

export const buttons = new Set<Button>();
export type ButtonEvent = 'down' | 'up' | 'dblclick';

export class Button extends PIXI.utils.EventEmitter {
	private _pressedAt: number = 0;

	constructor(public readonly id: number) {
		super();
		buttons.add(this);
	}

	private _isPressed: boolean = false;

	get isPressed(): boolean {
		return this._isPressed;
	}

	get duration(): number {
		if (!this._isPressed) return 0;
		return Date.now() - this._pressedAt;
	}

	handle(event: MouseEvent, action: ButtonEvent) {
		this.emit(action, event, this.duration);
		if (action === 'down') {
			this._isPressed = true;
			this._pressedAt = Date.now();
		} else {
			this._isPressed = false;
		}
	}

	on(event: ButtonEvent, fn: (event?: KeyboardEvent, duration?: number) => unknown, context?: any): this {
		super.on(event, fn, context);
		return this;
	}

	once(event: ButtonEvent, fn: (eventN: KeyboardEvent, durationN: number) => unknown, context?: any): this {
		super.once(event, fn, context);
		return this;
	}

	isMineEvent(event: MouseEvent): boolean {
		return event.button === this.id;
	}
}

export const LeftClick = new Button(0);
export const RightClick = new Button(2);
export let mousePosition: PIXI.Point = new PIXI.Point();

document.addEventListener('mousemove', (event: MouseEvent) => {
	mousePosition.set(event.x, event.y);
});

document.addEventListener('mouseup', (event: MouseEvent) => {
	buttons.forEach(button => {
		if (button.isMineEvent(event)) button.handle(event, 'up');
	});
});

document.addEventListener('mousedown', (event: MouseEvent) => {
	buttons.forEach(button => {
		if (button.isMineEvent(event)) button.handle(event, 'down');
	});
});

document.addEventListener('dblclick', (event: MouseEvent) => {
	buttons.forEach(button => {
		if (button.isMineEvent(event)) button.handle(event, 'dblclick');
	});
});
