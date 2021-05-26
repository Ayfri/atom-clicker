import * as PIXI from 'pixi.js'
import ClickableContainer from '../components/ClickableContainer.js'

export default class Button extends ClickableContainer {
	public container: PIXI.Container
	public label: PIXI.Text

	public constructor(texture: PIXI.Texture | string, text: string = '') {
		super(texture)

		this.container = new PIXI.Container()
		this.label = new PIXI.Text(text)
		this.label.anchor.set(0.5)

		this.container.addChild(this.sprite, this.label)
		this.resize()
	}

	public resize() {
		this.sprite.height = this.label.height + 15
		this.sprite.width = this.label.width + 15
		this.label.position.x = this.container.width / 2
		this.label.position.y = this.container.height / 2
	}
}
