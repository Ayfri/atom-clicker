import {game} from '../app.js'
import {JSONObject} from '../types.js'
import ClosableGUI from './ClosableGUI'

export default class SaveGUI extends ClosableGUI {
	public text: HTMLTextAreaElement

	public constructor() {
		super({
			width: window.innerWidth / 3,
			height: window.innerHeight / 3,
		})

		this.text = document.createElement('textarea')
		this.text.readOnly = true
		this.text.style.padding = '5px'
		this.text.style.border = '1px solid black'
		this.text.style.borderRadius = '20px'
		this.text.style.position = 'absolute'
		this.text.style.left = '35%'
		this.text.style.top = '38%'
		this.text.style.width = '29%'
		this.text.style.height = '25%'
		this.text.style.visibility = 'hidden'
		this.text.id = 'save'
		document.body.appendChild(this.text)
	}

	public static generateSave(): string {
		function JSONForEachProperties(json: JSONObject, callback: (value: JSONObject[keyof JSONObject]) => JSONObject[keyof JSONObject]) {
			for (const jsonKey in json) {
				if (json.hasOwnProperty(jsonKey)) {
					if (typeof json[jsonKey] === 'object') JSONForEachProperties(json[jsonKey] as JSONObject, callback)
					json[jsonKey] = callback(json[jsonKey] as JSONObject[keyof JSONObject])
				}
			}
		}

		let data: JSONObject | string | Buffer = game.toJSON()
		JSONForEachProperties(data, value => (typeof value === 'boolean' ? Number(value) : value))
		data = JSON.stringify(data).replace(/"([iubctonpsde]|ac|acb|asb|bb|ta)"/g, '$1')

		return btoa(data.toString())
	}

	public close() {
		super.close()
		this.text.style.visibility = 'hidden'
	}

	public open() {
		super.open()
		this.text.textContent = SaveGUI.generateSave()
		this.text.style.visibility = 'visible'
	}

	public resize() {
		this.background.width = window.innerWidth / 3
		this.background.height = window.innerHeight / 3

		this.container.position.set((window.innerWidth - this.container.width) / 2, (window.innerHeight - this.container.height) / 2)
		super.resize()
	}
}
