import {default as LOG} from "../utils/logging.js"
import Compendium from "./compendium.js"
import Objects from "../utils/objects.js"

export default class ActorManager {
	constructor(MKS) {
		this._ = MKS
	}
	
	openCharacterSheet(token, tab) {
		const sheet = token.actor.sheet
		if ( sheet.rendered ) {
			sheet.maximize()
			sheet.bringToTop()
		}
		else
			sheet.render(true, {token: token.document})
		
		if (tab)
			setTimeout(() => sheet.activateTab(tab), 200)
	}
	
	hasLostHP(tokenOrActor) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		return actor.system.attributes.hp.max > actor.system.attributes.hp.value
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
				if (dt !== 0)
					updates[resourcename + ".temp"] = tmp - dt
			}

			// Update the Actor
			if (target !== 'temp' && target !== 'max' && dt >= 0) {
				const change = (value - dt)
				const newValue = Math.clamped(hp.value - change, 0, hp.max + tmpMax)
				if (newValue !== hp.value) {
					updates[resourcename + ".value"] = newValue
				}
			}
		}
		if (!Objects.isEmpty(updates)) {
			LOG.info("HP Temp:" + hp.temp + "->" + updates["system.attributes.hp.temp"])
			LOG.info("HP:" + hp.value + "->" + updates["system.attributes.hp.value"])
			const diff = (updates["system.attributes.hp.temp"] ? hp.temp - updates["system.attributes.hp.temp"] : 0)
				+ (updates["system.attributes.hp.value"] ? hp.value - updates["system.attributes.hp.value"] : 0)
			canvas.interface.createScrollingText(token.center, (-diff).signedString(), {
				anchor: CONST.TEXT_ANCHOR_POINTS.CENTER,
				direction: diff > 0 ? CONST.TEXT_ANCHOR_POINTS.BOTTOM : CONST.TEXT_ANCHOR_POINTS.TOP,
				distance: token.h,
				fontSize: 28,
				stroke: 0x000000,
				strokeThickness: 4,
				jitter: 0.25
			}).then()
			return await actor.update(updates)
		}
	}

}