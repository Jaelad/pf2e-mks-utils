import {default as i18n} from "../lang/pf2e-i18n.js"
import {ROLL_MODE, SYSTEM} from "./constants.js"
import {registerHandlebarsHelpers} from "./helpers/handlebars.js"
import DCHelper from "./helpers/dc-helper.js"
import CommonUtils from "./helpers/common-utils.js"
import ActorManager from "./actor-manager.js"
import EffectManager from "./effect-manager.js"
import EncounterManager from "./encounter-manager.js"
import TemplateManager from "./measurement/template-manager.js"
import InventoryManager from "./inventory-manager.js"
import SettingsManager from "./settings-manager.js"
import SocketHandler from "./socket-handler.js"
import {ActionRunner, RUDIMENTARY_ACTIONS} from "./action.js"
import ActionAdministerFirstAid from "./actions/administer-first-aid.js"
import ActionAid from "./actions/aid.js"
import ActionCreateADiversion from "./actions/create-a-diversion.js"
import ActionDemoralize from "./actions/demoralize.js"
import ActionDisarm from "./actions/disarm.js"
import ActionEscape from "./actions/escape.js"
import ActionGrapple from "./actions/grapple.js"
import ActionHide from "./actions/hide.js"
import ActionProne from "./actions/prone.js"
import ActionRaiseAShield from "./actions/raise-a-shield.js"
import ActionRecallKnowledge from "./actions/recall-knowledge.js"
import ActionSeek from "./actions/seek.js"
import ActionShove from "./actions/shove.js"
import ActionSneak from "./actions/sneak.js"
import ActionTakeCover from "./actions/take-cover.js"
import ActionTrip from "./actions/trip.js"
import {
	ActionAvoidNotice,
	ActionBalance,
	ActionBorrowAnArcaneSpell,
	ActionClimb,
	ActionCoerce,
	ActionCommandAnAnimal,
	ActionConcealAnObject,
	ActionCoverTracks, ActionCreateForgery,
	ActionDecipherWriting,
	ActionDisableADevice,
	ActionFeint,
	ActionForceOpen, ActionGatherInformation,
	ActionGrabAnEdge,
	ActionHighJump, ActionIdentifyAlchemy, ActionIdentifyMagic, ActionImpersonate, ActionLearnASpell,
	ActionLie,
	ActionLongJump, ActionMakeAnImpression,
	ActionPalmAnObject,
	ActionPerform,
	ActionPickALock,
	ActionRequest, ActionSenseDirection,
	ActionSenseMotive, ActionSqueeze,
	ActionSteal, ActionSubsist,
	ActionSwim, ActionTrack,
	ActionTumbleThrough
} from "./actions/simple-actions.js"
import ActionRepair from "./actions/repair.js"
import ActionTreatWounds from "./actions/treat-wounds.js"
import ActionCraft from "./actions/craft.js"
import ActionLongTermRest from "./actions/long-term-rest.js"
import ActionEarnIncome from "./actions/earn-income.js"
import ActionTreatDisease from "./actions/treat-disease.js"
import ActionReadyAid from "./actions/ready-aid.js"
import ActionReceiveAid from "./actions/receive-aid.js"

export default class MksTools {

	static registerSocketListeners() {
		game.MKS.socketHandler.on('SetDC', ({action, defaultDC, title, challenger}) => {
			DCHelper.setDC(action, defaultDC, title, challenger).then((dc) => {
				game.MKS.socketHandler.emit('SetDCResponse', dc)
			})
		}, true)
		game.MKS.socketHandler.on('CompendiumToChat', ({actorId, source, rollMode}) => {
			const actor = CommonUtils.getActorById(actorId)
			game.MKS.compendiumToChat(actor, source, rollMode)
		}, true)
		game.MKS.socketHandler.on('GmChatMessage', (chatData) => {
			chatData.whisper = [game.user.id]
			ChatMessage.create(chatData, {rollMode: ROLL_MODE.BLIND})
		}, true)
		game.MKS.socketHandler.on('UpdateRelativeConditions', (relativeData) => {
			game.combat?.setFlag(SYSTEM.moduleId, "relative", relativeData).then(() => {
				console.log("Updated Relative Data")
			})
		}, true)
		game.MKS.socketHandler.on('GmTakesAction', (actionRequest) => {
			const action = this.actions[actionRequest.action]
			new ActionRunner(action).actByGM(actionRequest)
		}, true)
		game.MKS.socketHandler.on('GmAppliesActionResult', (actionResult) => {
			const action = this.actions[actionResult.action]
			new ActionRunner(action).applyByGM(actionResult.result)
		}, true)
	}

	constructor() {
		this.actorManager = new ActorManager(this)
		this.inventoryManager = new InventoryManager(this)
		this.effectManager = new EffectManager(this)
		this.encounterManager = new EncounterManager(this)
		this.templateManager = new TemplateManager(this)
		this.settingsManager = new SettingsManager(this)

		this.socketHandler = new SocketHandler(this)
		this.dcHelper = DCHelper
		this.commons = CommonUtils

		this.actions = {
			readyAid: new ActionReadyAid(this),
			receiveAid: new ActionReceiveAid(this),
			grapple: new ActionGrapple(this),
			seek: new ActionSeek(this),
			raiseAShield: new ActionRaiseAShield(this),
			disarm: new ActionDisarm(this),
			shove: new ActionShove(this),
			trip: new ActionTrip(this),
			escape: new ActionEscape(this),
			senseMotive: new ActionSenseMotive(this),
			takeCover: new ActionTakeCover(this),
			prone: new ActionProne(this),
			grabAnEdge: new ActionGrabAnEdge(this),
			balance: new ActionBalance(this),
			tumbleThrough: new ActionTumbleThrough(this),
			climb: new ActionClimb(this),
			forceOpen: new ActionForceOpen(this),
			highJump: new ActionHighJump(this),
			longJump: new ActionLongJump(this),
			swim: new ActionSwim(this),
			recallKnowledge: new ActionRecallKnowledge(this),
			createADiversion: new ActionCreateADiversion(this),
			feint: new ActionFeint(this),
			request: new ActionRequest(this),
			demoralize: new ActionDemoralize(this),
			administerFirstAid: new ActionAdministerFirstAid(this),
			concealAnObject: new ActionConcealAnObject(this),
			perform: new ActionPerform(this),
			commandAnAnimal: new ActionCommandAnAnimal(this),
			lie: new ActionLie(this),
			hide: new ActionHide(this),
			sneak: new ActionSneak(this),
			palmAnObject: new ActionPalmAnObject(this),
			steal: new ActionSteal(this),
			pickALock: new ActionPickALock(this),
			disableADevice: new ActionDisableADevice(this),
			avoidNotice: new ActionAvoidNotice(this),
			borrowAnArcaneSpell: new ActionBorrowAnArcaneSpell(this),
			coerce: new ActionCoerce(this),
			coverTracks: new ActionCoverTracks(this),
			decipherWriting: new ActionDecipherWriting(this),
			gatherInformation: new ActionGatherInformation(this),
			identifyAlchemy: new ActionIdentifyAlchemy(this),
			identifyMagic: new ActionIdentifyMagic(this),
			impersonate: new ActionImpersonate(this),
			learnASpell: new ActionLearnASpell(this),
			makeAnImpression: new ActionMakeAnImpression(this),
			senseDirection: new ActionSenseDirection(this),
			squeeze: new ActionSqueeze(this),
			track: new ActionTrack(this),
			treatWounds: new ActionTreatWounds(this),
			repair: new ActionRepair(this),
			createForgery: new ActionCreateForgery(this),
			subsist: new ActionSubsist(this),
			craft: new ActionCraft(this),
			longTermRest: new ActionLongTermRest(this),
			earnIncome: new ActionEarnIncome(this),
			treatDisease: new ActionTreatDisease(this),
		}
		this.rudimentaryActions = RUDIMENTARY_ACTIONS

		Object.values(this.actions).forEach(a => a.initialize())
		registerHandlebarsHelpers()
	}

	ensureOneSelected(warn = true, requiresEncounter = false) {
		if (requiresEncounter) {
			if (game.combat?.combatant)
				return game.combat?.combatant?.token?.object
			else {
				if (warn)
					ui.notifications.warn(i18n.$("PF2E.MKS.Warning.Encounter.NoneExists"))
				return
			}
		}
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
			const warning = i18n.$("PF2E.MKS.Warning.Actor.OneMustBeSelected")
			ui.notifications.warn(warning)
		}
	}

	ensureAtLeastOneSelected(warn = true) {
		let tokens = canvas.tokens.controlled
		if (tokens.length >= 1)
			return tokens
		else if (warn) {
			const warning = i18n.$("PF2E.MKS.Warning.Actor.AtLeastOneMustBeSelected")
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
			const warning = i18n.$("PF2E.MKS.Warning.Target.OneMustBeSelected")
			ui.notifications.warn(warning)
		}
	}

	ensureAtLeastOneTarget(warn = true, player = null) {
		let tokens
		if (player)
			tokens = game.users.players.find(p => p.name === player).targets
		else
			tokens = game.user.targets
		if (tokens.size >= 1)
			return Array.from(tokens)
		else if (warn) {
			const warning = i18n.$("PF2E.MKS.Warning.Target.AtLeastOneMustBeSelected")
			ui.notifications.warn(warning)
		}
	}

	getAttackActionStats(ready=null) {
		let actor = this.ensureOneSelected()?.actor
		if (!actor) return

		return actor.system.actions.filter(a => ready === null || a.ready === ready)
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

		const reach = weapon
			? ["character", "npc", "familiar"].includes(self.type)
				? self.getReach({action: "attack", weapon})
				: null
			: null
		return token1.distanceTo(token2, {reach})
	}

	compendiumToChat(tokenOrActor, source, rollMode = 'publicroll', byGM = false) {
		if (byGM) {
			const actor = tokenOrActor?.actor ?? tokenOrActor
			const data = {rollMode, source, actorId: actor.id}
			this.socketHandler.emit("CompendiumToChat", data, true)
		}
		else
			fromUuid(source).then((s => {
				this.sheetToChat(tokenOrActor, s.sheet, rollMode)
			}))
	}

	sheetToChat(tokenOrActor, sheet, rollMode = ROLL_MODE.PUBLIC) {
		let actor = tokenOrActor?.actor ?? tokenOrActor
		if (!sheet) return
		if (sheet.document?.actor)
			sheet.document.toChat().then()
		else {
			actor = actor ?? new Actor({ name: game.user.name, type: "character" })
			new sheet.document.constructor(sheet.document.toJSON(), { parent: actor }).toMessage(null, {rollMode, create: true}).then()
			//new sheet.document.constructor(sheet.document.toJSON(), { parent: actor }).toChat().then()
		}
	}

	remindGM(token, message, rollMode = 'publicroll') {
		const gm = game.users.find(u=>u.isGM)
		const chatData = {
			user: gm,
			author: gm,
			content: message,
			blind: true,
			whisper: [gm.id]
		}
		ChatMessage.create(chatData, {rollMode: ROLL_MODE.BLIND})
	}
}
