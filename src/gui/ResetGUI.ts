import * as PIXI from 'pixi.js'
import {resetGame} from '../app'
import Button from './Button'
import ClosableGUI from './ClosableGUI'

export default class ResetGUI extends ClosableGUI {
	public disclaimerText: PIXI.Text
	public resetButton: Button

	public constructor() {
		super({
			width: window.innerWidth / 2,
			height: window.innerHeight / 2,
		})

		this.resetButton = new Button(PIXI.Texture.WHITE, "I'm sure.")
		this.resetButton.label.style.fill = 0xaa0000
		this.resetButton.label.style.fontWeight = 'bold'
		this.resetButton.label.style.fontSize = 50
		this.resetButton.color = 0xe5e0e0
		this.resetButton.hoverColor = 0xf5c5c5
		this.disclaimerText = new PIXI.Text(
			'Are you sure you want to reset ? This action is not cancellable !!',
			new PIXI.TextStyle({
				fontSize: 35,
				fontWeight: 'bold',
				breakWords: true,
				align: 'center',
				wordWrap: true,
			})
		)
		this.disclaimerText.anchor.set(0.5)

		this.container.addChild(this.resetButton.container, this.disclaimerText)

		this.resetButton.on('click', () => {
			localStorage.removeItem('save')
			resetGame()
		})
		this.resize()
	}

	public resize() {
		this.background.width = window.innerWidth / 2
		this.background.height = window.innerHeight / 2
		this.resetButton.resize()
		this.resetButton.container.position.set((this.container.width - this.resetButton.container.width) / 2, window.innerHeight / 3)
		this.disclaimerText.position.set(this.container.width / 2, this.container.height / 2.2)
		this.disclaimerText.style.wordWrapWidth = this.container.width * 0.9

		this.container.position.set((window.innerWidth - this.container.width) / 2, (window.innerHeight - this.container.height) / 2)
		super.resize()
	}

	public update() {
		this.resetButton.update()
	}
}
