import EffectManager from "./effect-manager.js"
import SimpleCheckRoll from "./simple-checkroll.js"
import ActionAid from "./actions/aid.js"
import ActionGrapple from "./actions/grapple.js"
import ActionSeek from "./actions/seek.js"
import EncounterManager from "./encounter-manager.js"
import TemplateManager from "./measurement/template-manager.js"
import {default as i18n} from "../lang/pf2e-helper.js"

export default class MksTools {
	static MODULEID = 'pf2e-tools-mks'
	static FOUNDRY_VERSION = 0
	static GAME_SYSTEM = null

	constructor() {
		MksTools.FOUNDRY_VERSION = game.version ?? game.data.version
		MksTools.GAME_SYSTEM = game.system?.id ?? game.data.system.id
		this.systemSupported = /pf2e/.exec(MksTools.GAME_SYSTEM) !== null

		this.effectManager = new EffectManager(this)
		this.encounterManager = new EncounterManager(this)
		this.simpleCheckRoll = new SimpleCheckRoll(this)
		this.templateManager = new TemplateManager(this)

		this.actions = {
			aid: new ActionAid(this),
			grapple: new ActionGrapple(this),
			seek: new ActionSeek(this),
		}
	}

	getTokenById(tokenId) {
		return canvas.tokens.placeables.find(t => t.id === tokenId)
	}

	ensureOneSelected() {
		let tokens = canvas.tokens.controlled
		if (tokens.length !== 1) {
			const warning = i18n.$("pf2e.mks.warning.actor.onemustbeselected")
			ui.notifications.warn(warning)
			throw new Error(warning)
		}
		return tokens[0]
	}

	ensureAtLeastOneSelected() {
		let tokens = canvas.tokens.controlled
		if (tokens.length < 1) {
			const warning = i18n.$("pf2e.mks.warning.actor.atleastonemustbeselected")
			ui.notifications.warn(warning)
			throw new Error(warning)
		}
		return tokens
	}

	ensureOneTarget(player) {
		let tokens
		if (player)
			tokens = game.users.players.find(p => p.name === player).targets
		else
			tokens = game.user.targets
		if (tokens.size !== 1) {
			const warning = i18n.$("pf2e.mks.warning.target.onemustbeselected")
			ui.notifications.warn(warning)
			throw new Error(warning)
		}
		return Array.from(tokens)[0]
	}

	ensureAtLeastOneTarget(player) {
		let tokens
		if (player)
			tokens = game.users.players.find(p => p.name === player).targets
		else
			tokens = game.user.targets
		if (tokens.length < 1) {
			const warning = i18n.$("pf2e.mks.warning.target.atleastonemustbeselected")
			ui.notifications.warn(warning)
			throw new Error(warning)
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
}
