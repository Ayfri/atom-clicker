import {BigFloat} from 'bigfloat.js'
import * as PIXI from 'pixi.js'
import Game from './app/Game'
import GUI from './gui/GUI'
import LoadGUI from './gui/LoadGUI'
import SaveGUI from './gui/SaveGUI'
import {JSONObject} from './types'

export let game: Game | undefined

export const app = new PIXI.Application({
	antialias: true,
	resizeTo: window,
	backgroundColor: 0xaaaaaa,
})

export const locale = new Intl.Locale(navigator.languages[0] ?? navigator.language)

window.onload = () => {
	const localeTag = document.createElement('script')
	const durationTag = document.createElement('script')
	const relativeTimeTag = document.createElement('script')
	localeTag.src = `https://unpkg.com/dayjs@1.10.5/locale/${locale.language}.js`
	durationTag.src = `https://unpkg.com/dayjs@1.10.5/plugin/duration.js`
	relativeTimeTag.src = `https://unpkg.com/dayjs@1.10.5/plugin/relativeTime.js`
	document.head.appendChild(localeTag)
	document.head.appendChild(durationTag)
	document.head.appendChild(relativeTimeTag)

	relativeTimeTag.onload = () => {
		;(window as any).dayjs.locale(locale.language)
		;(window as any).dayjs.extend((window as any).dayjs_plugin_duration)
		;(window as any).dayjs.extend((window as any).dayjs_plugin_relativeTime)
	}
}

document.body.appendChild(app.view)

async function loadTextures() {
	await new Promise(resolve => {
		PIXI.Loader.shared.add('x', 'textures/x.png')
		PIXI.Loader.shared.add('red-atom', 'textures/red-atom.png')
		PIXI.Loader.shared.add('blue-atom', 'textures/blue-atom.png')
		PIXI.Loader.shared.load(resolve)
	})
}

async function setup() {
	await loadTextures()
	Game.setDefaultBuyables()
	if (localStorage.getItem('save')) LoadGUI.decompressSave(localStorage.getItem('save'))
	else {
		game = new Game()
		;(window as any).game = game
	}
	game.resize()
	await game.update()
	window.onresize = () => game.resize()

	setInterval(() => localSave(), 1000 * 30)
	PIXI.Ticker.shared.add(async () => await game.update(), {}, PIXI.UPDATE_PRIORITY.HIGH)
}

export function localSave() {
	localStorage.setItem('save', SaveGUI.generateSave())
	const popup = new GUI({
		texture: PIXI.Texture.WHITE,
	})
	popup.background.width = 150
	popup.background.height = 40
	popup.background.anchor.set(0.5)
	popup.container.position.set(window.innerWidth / 2, window.innerHeight - window.innerHeight / 5)

	const text = new PIXI.Text(
		'Game saved !',
		new PIXI.TextStyle({
			fontSize: 20,
		})
	)
	text.anchor.set(0.5)
	popup.container.addChild(text)
	app.stage.addChild(popup.container)

	const up = new PIXI.Ticker()
	up.add(
		() => {
			popup.container.position.y--
			popup.container.alpha -= 1 / up.FPS
		},
		{},
		PIXI.UPDATE_PRIORITY.LOW
	)
	up.start()

	setTimeout(() => {
		app.stage.removeChild(popup.container)
		up.destroy()
	}, 2000)
}

export function resetGame(save?: JSONObject) {
	game?.gui.loadGUI.close()
	game?.gui.saveGUI.close()
	game?.gui.resetGUI.close()
	game?.upgrades.forEach(upgrade => upgrade.overlay.hide())
	game?.buildings.forEach(building => building.overlay.hide())

	app.stage.removeChildren()
	Game.resetDefaultBuyables()
	Game.setDefaultBuyables()
	game = new Game(save)
	;(window as any).game = game
	game.resize()
}

setup().then(() => console.log('Game started.'))
;(window as any).bigfloat = BigFloat
;(window as any).app = app
;(window as any).PIXI = PIXI
;(window as any).setup = setup
