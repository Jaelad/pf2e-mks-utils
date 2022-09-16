import {default as LOG} from "../utils/logging.js"
import Compendium from "./compendium.js"

export default class ActorManager {
	constructor(MKS) {
		this._ = MKS
	}

	// from AllwaysHP module
	async applyHPChange(token, change, multiplier = 1) {
		const actor = token.actor
		const hp = actor.system.attributes.hp
		const resourcename = "system.attributes.hp"
		const updates = {}

		const target = change.target
		const value = Math.floor(parseInt(change.value) * multiplier) * -1 // implement as damage

		// Deduct damage from temp HP first
		if (hp.hasOwnProperty("tempmax") && target === "max") {
			updates[resourcename + ".tempmax"] = (hp.tempmax ?? 0) - value
		}
		else {
			let dt = 0, tmpMax = 0
			if (hp.hasOwnProperty("temp")) {
				const tmp = parseInt(hp.temp) || 0
				dt = (value > 0 || target === 'temp') && target !== 'regular' && target !== 'max' ? Math.min(tmp, value) : 0
				// Remaining goes to health
				tmpMax = parseInt(hp.tempmax) || 0
				updates[resourcename + ".temp"] = tmp - dt
			}

			// Update the Actor
			if (target !== 'temp' && target !== 'max' && dt >= 0) {
				let change = (value - dt)
				updates[resourcename + ".value"] = Math.clamped(hp.value - change, 0, hp.max + tmpMax)

				let display = change + dt
				canvas.interface.createScrollingText(token.center, (-display).signedString(), {
					anchor: CONST.TEXT_ANCHOR_POINTS.CENTER,
					direction: display > 0 ? CONST.TEXT_ANCHOR_POINTS.BOTTOM : CONST.TEXT_ANCHOR_POINTS.TOP,
					distance: token.h,
					fontSize: 28,
					stroke: 0x000000,
					strokeThickness: 4,
					jitter: 0.25
				}).then()
			}
		}
		return await actor.update(updates)
	}

}