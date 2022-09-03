import {default as i18n} from "../lang/pf2e-helper.js"
import EffectManager from "./effect-manager.js"
import EncounterManager from "./encounter-manager.js"
import TemplateManager from "./measurement/template-manager.js"
import InventoryManager from "./inventory-manager.js"
import SettingsManager from "./settings-manager.js";
import SocketHandler from "./socket-handler.js"
import ActionAid from "./actions/aid.js"
import ActionGrapple from "./actions/grapple.js"
import ActionSeek from "./actions/seek.js"
import ActionRaiseAShield from "./actions/raise-a-shield.js"
import ActionDisarm from "./actions/disarm.js"
import ActionShove from "./actions/shove.js";
import ActionTrip from "./actions/trip.js";
import ActionEscape from "./actions/escape.js";

export default class MksTools {

	static registerSocketListeners() {
		game.MKS.socketHandler.on('SetDC', ({action, defaultDC, title}) => {
			game.MKS.actions[action].setDC((dc) => {
				game.MKS.socketHandler.emit('SetDCResponse', {action, dc})
			}, defaultDC, title)
		}, true)
	}

	constructor() {
		this.inventoryManager = new InventoryManager(this)
		this.effectManager = new EffectManager(this)
		this.encounterManager = new EncounterManager(this)
		this.templateManager = new TemplateManager(this)
		this.settingsManager = new SettingsManager(this)

		this.socketHandler = new SocketHandler(this)

		this.actions = {
			aid: new ActionAid(this),
			grapple: new ActionGrapple(this),
			seek: new ActionSeek(this),
			raiseAShield: new ActionRaiseAShield(this),
			disarm: new ActionDisarm(this),
			shove: new ActionShove(this),
			trip: new ActionTrip(this),
			escape: new ActionEscape(this),
		}

		Object.values(this.actions).forEach(a => a.initialize())
	}

	getTokenById(tokenId) {
		return canvas.tokens.placeables.find(t => t.id === tokenId)
	}

	ensureOneSelected(warn = true) {
		// const inCombatTurn = LocalStorage.load("inCombatTurn")
		const inCombatTurn = this.settingsManager.get("selectCombatantFirst")
		let token
		if (inCombatTurn && game.combat?.combatant)
			token = game.combat?.combatant?.token?.object
		else {
			let tokens = canvas.tokens.controlled
			if (tokens.length === 1)
				token = tokens[0]
		}

		if (token)
			return token
		else if (warn) {
			const warning = i18n.$("pf2e.mks.warning.actor.onemustbeselected")
			ui.notifications.warn(warning)
		}
	}

	ensureAtLeastOneSelected(warn = true) {
		let tokens = canvas.tokens.controlled
		if (tokens.length >= 1)
			return tokens
		else if (warn) {
			const warning = i18n.$("pf2e.mks.warning.actor.atleastonemustbeselected")
			ui.notifications.warn(warning)
		}
	}

	ensureOneTarget(player, warn = true) {
		let tokens
		if (player)
			tokens = game.users.players.find(p => p.name === player).targets
		else
			tokens = game.user.targets
		if (tokens.size === 1)
			return Array.from(tokens)[0]
		else if (warn) {
			const warning = i18n.$("pf2e.mks.warning.target.onemustbeselected")
			ui.notifications.warn(warning)
		}
	}

	ensureAtLeastOneTarget(player, warn = true) {
		let tokens
		if (player)
			tokens = game.users.players.find(p => p.name === player).targets
		else
			tokens = game.user.targets
		if (tokens.size >= 1)
			return Array.from(tokens)
		else if (warn) {
			const warning = i18n.$("pf2e.mks.warning.target.atleastonemustbeselected")
			ui.notifications.warn(warning)
		}
	}

	getAttackActionStats(ready=null) {
		let actor = this.ensureOneSelected()?.actor
		if (!actor) return

		return actor.data.data.actions.filter(a => ready === null || a.ready === ready)
	}

    getSkillStat(skill) {
        let actor = this.ensureOneSelected()?.actor
        if (!actor) return

        return actor.skills[skill]
    }

	getSkillStats(proficiencyRankThreshold=null) {
		let actor = this.ensureOneSelected()?.actor
		if (!actor) return

		let skillStats = Object.entries(actor.skills).map(([key, skill]) => {
			if (proficiencyRankThreshold === null || skill.rank >= proficiencyRankThreshold)
				return skill
		})
		return skillStats.filter(s => s)
	}

	getSizeDifference(tokenOrActor1, tokenOrActor2) {
		const actor1 = tokenOrActor1?.actor ?? tokenOrActor1
		const actor2 = tokenOrActor2?.actor ?? tokenOrActor2
		return actor1.system.traits.size.difference(actor2.system.traits.size)
	}

	distanceTo(token1, token2, weapon = null) {
		const self = token1.actor

		const reach =weapon ? ["character", "npc", "familiar"].includes(self.type) ? self.getReach({action: "attack", weapon}) ?? null : null : null
		return token1.distanceTo(token2, {reach})
	}

	compendiumToChat(tokenOrActor, source, rollMode = 'publicroll') {
		fromUuid(source).then((s => {
			this.sheetToChat(tokenOrActor, s.sheet, rollMode)
		}))
	}

	sheetToChat(tokenOrActor, sheet, rollMode = 'publicroll') {
		let actor = tokenOrActor?.actor ?? tokenOrActor
		if (sheet?.document?.actor)
			sheet.document.toChat().then()
		else {
			actor = actor ?? new Actor({ name: game.user.name, type: "character" })
			new sheet.document.constructor(sheet.document.toJSON(), { parent: actor }).toMessage(null, {rollMode, create: true}).then()
			//new sheet.document.constructor(sheet.document.toJSON(), { parent: actor }).toChat().then()
		}
	}
}
