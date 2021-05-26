import EventEmitter from './EventEmitter'

type KeyboardEvents = {
	up: [string]
	down: [string]
}

const pressed: Set<string> = new Set()

export const events: EventEmitter<KeyboardEvents> = new EventEmitter()

export function isPressed(key: string): boolean {
	return pressed.has(key)
}

function onKeyDown(e: KeyboardEvent) {
	if (!isPressed(e.key)) events.emit('down', e.key)
	pressed.add(e.key)
}

function onKeyUp(e: KeyboardEvent) {
	if (isPressed(e.key)) events.emit('up', e.key)
	pressed.delete(e.key)
}

window.onkeydown = onKeyDown
window.onkeyup = onKeyUp
