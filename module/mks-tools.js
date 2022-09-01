import EffectManager from "./effect-manager.js"
import ActionAid from "./actions/aid.js"
import ActionGrapple from "./actions/grapple.js"
import ActionSeek from "./actions/seek.js"
import EncounterManager from "./encounter-manager.js"
import TemplateManager from "./measurement/template-manager.js"
import {default as i18n} from "../lang/pf2e-helper.js"
import SocketListener from "./socket-handler.js"
import InventoryManager from "./inventory-manager.js"

export default class MksTools {
	constructor() {
		this.inventoryManager = new InventoryManager(this)
		this.effectManager = new EffectManager(this)
		this.encounterManager = new EncounterManager(this)
		this.templateManager = new TemplateManager(this)

		this.socketListener = new SocketListener(this)

		this.actions = {
			aid: new ActionAid(this),
			grapple: new ActionGrapple(this),
			seek: new ActionSeek(this),
		}

		Object.values(this.actions).forEach(a => a.initialize())
	}

	getTokenById(tokenId) {
		return canvas.tokens.placeables.find(t => t.id === tokenId)
	}

	ensureOneSelected(warn = true) {
		let tokens = canvas.tokens.controlled
		if (tokens.length !== 1) {
			if (warn) {
				const warning = i18n.$("pf2e.mks.warning.actor.onemustbeselected")
				ui.notifications.warn(warning)
				throw new Error(warning)
			}
		}
		return tokens[0]
	}

	ensureAtLeastOneSelected(warn = true) {
		let tokens = canvas.tokens.controlled
		if (tokens.length < 1) {
			if (warn) {
				const warning = i18n.$("pf2e.mks.warning.actor.atleastonemustbeselected")
				ui.notifications.warn(warning)
				throw new Error(warning)
			}
		}
		return tokens
	}

	ensureOneTarget(player, warn = true) {
		let tokens
		if (player)
			tokens = game.users.players.find(p => p.name === player).targets
		else
			tokens = game.user.targets
		if (tokens.size !== 1) {
			if (warn) {
				const warning = i18n.$("pf2e.mks.warning.target.onemustbeselected")
				ui.notifications.warn(warning)
				throw new Error(warning)
			}
		}
		return Array.from(tokens)[0]
	}

	ensureAtLeastOneTarget(player, warn = true) {
		let tokens
		if (player)
			tokens = game.users.players.find(p => p.name === player).targets
		else
			tokens = game.user.targets
		if (tokens.length < 1) {
			if (warn) {
				const warning = i18n.$("pf2e.mks.warning.target.atleastonemustbeselected")
				ui.notifications.warn(warning)
				throw new Error(warning)
			}
		}
		return Array.from(tokens)
	}

	getAttackActionStats(ready=null) {
		let actor = this.ensureOneSelected().actor
		if (!actor) return

		return actor.data.data.actions.filter(a => ready === null || a.ready === ready)
	}

    getSkillStat(skill) {
        let actor = this.ensureOneSelected().actor
        if (!actor) return

        return actor.skills[skill]
    }

	getSkillStats(proficiencyRankThreshold=null) {
		let actor = this.ensureOneSelected().actor
		if (!actor) return

		let skillStats = Object.entries(actor.skills).map(([key, skill]) => {
			if (proficiencyRankThreshold === null || skill.rank >= proficiencyRankThreshold)
				return skill
		})
		return skillStats.filter(s => s)
	}

	getSizeDifference(actor1, actor2) {
		return actor1.system.traits.size.difference(actor2.system.traits.size)
	}

	distanceTo(token1, token2, weapon = null) {
		const self = token1.actor

		const reach =weapon ? ["character", "npc", "familiar"].includes(self.type) ? self.getReach({action: "attack", weapon}) ?? null : null : null
		return token1.distanceTo(token2, {reach})
	}
}
