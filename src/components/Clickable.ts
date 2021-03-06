import * as PIXI from 'pixi.js'
import EventEmitter from '../utils/EventEmitter.js'
import {Button} from '../utils/MouseManager.js'
import {getTextureByName} from '../utils/utils.js'

export type ClickableEvents = {
	click: [button: Button, position: PIXI.Point]
	hover: [posiion: PIXI.Point]
	hoverEnd: [posiion: PIXI.Point]
	hoverMove: [posiion: PIXI.Point]
}

export default class Clickable extends EventEmitter<ClickableEvents> {
	public hover: boolean
	public sprite: PIXI.Sprite

	public constructor(texture: PIXI.Texture | string) {
		super()

		if (typeof texture === 'string') {
			const textureName = texture
			texture = getTextureByName(textureName)
			if (!texture) throw new Error(`Texture '${textureName}' not found.`)
		}

		this.sprite = PIXI.Sprite.from(texture)
		this.sprite.interactive = true
		this.sprite.buttonMode = true
		this.sprite.on('pointertap', (event: PIXI.InteractionEvent) => {
			this.emit('click', new Button(event.data.button), event.data.global)
		})

		this.sprite.on('pointerover', (event: PIXI.InteractionEvent) => this.emit('hover', event.data.global))
		this.sprite.on('touchstart', (event: PIXI.InteractionEvent) => this.emit('hover', event.data.global))

		this.sprite.on('pointerout', (event: PIXI.InteractionEvent) => this.emit('hoverEnd', event.data.global))
		this.sprite.on('touchend', (event: PIXI.InteractionEvent) => this.emit('hoverEnd', event.data.global))
		this.sprite.on('touchendoutside', (event: PIXI.InteractionEvent) => this.emit('hoverEnd', event.data.global))

		this.sprite.on('pointermove', (event: PIXI.InteractionEvent) => {
			if (event.currentTarget && event.target === this.sprite) this.emit('hoverMove', event.data.global)
		})
		this.sprite.on('touchmove', (event: PIXI.InteractionEvent) => {
			if (event.currentTarget && event.target === this.sprite) this.emit('hoverMove', event.data.global)
		})

		this.on('hover', () => (this.hover = true))
		this.on('hoverEnd', () => (this.hover = false))
	}
}

;(window as any).Clickable = Clickable
