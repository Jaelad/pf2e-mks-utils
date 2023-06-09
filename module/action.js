import {default as i18n} from "../lang/pf2e-i18n.js"
import {ACTION_GLYPH, ROLL_MODE} from "./constants.js"
import Compendium from "./compendium.js"
import Check from "./check.js"
import DCHelper from "./helpers/dc-helper.js"
import $$lang from "../utils/lang.js"
import CommonUtils from "./helpers/common-utils.js"
import {Engagement, Engagements} from "./model/engagement.js"
import ObjectColl from "./model/object-coll.js"

export default class Action {

	constructor(MKS, name, mode = 'encounter', gmActs = false, gmApplies = true) {
		this._ = MKS
		this.name = name
		this.mode = mode
		this.gmActs = gmActs
		this.gmApplies = gmApplies
	}

	initialize() {
	}

	get properties() {
		// {
		// 	label:
		// 	icon:
		// 	actionGlyph:
		// 	tags:
		// }
	}

	// return engagement
	relevant(warn) {
		const selected = this._.ensureOneSelected(warn)
		return selected ? new Engagement(selected) : undefined
	}

	// simply returns action result object
	async act(engagement, options) {}

	async apply(engagement, result) {
		if (result?.roll?.degreeOfSuccess > -1)
			this.resultToChat(engagement.initiator, this.name, result.roll.degreeOfSuccess)
	}

	createResult(engagement, roll, options) {
		return {
			engagement: engagement.initiator ? engagement.participants : ObjectColl.serialize(engagement),
			roll: {
				degreeOfSuccess: roll.degreeOfSuccess
			},
			options
		}
	}

	resultToChat(token, action, degreeOfSuccess, glyph = 'A') {
		const actionName = i18n.action(action)
		const noteText = i18n.actionNote(action, degreeOfSuccess)
		if (!noteText)
			return

		const chatMessage =	`
		<div class="pf2e chat-card action-card">
            <header class="card-header flexrow">
                <img src="${ACTION_GLYPH[glyph].img}" title="${actionName}" width="36" height="36">
                <h3>${actionName}</h3>
            </header>
    		<p>${noteText}</p>
		</div>
		`
		const chatData = {
			speaker: {
				actor: token.actor.id,
				token: token.id,
				scene: canvas.scene.id,
				alias: token.name
			},
			content: chatMessage,
			blind: true
		}
		if (game.user.isGM)
			ChatMessage.create(chatData, {rollMode: ROLL_MODE.BLIND})
		else
			this._.socketHandler.emit('GmChatMessage', chatData, true)
	}

	messageToChat(token, action, message, glyph = 'A', priv = false, rollMode = ROLL_MODE.PUBLIC) {
		const actionName = i18n.action(action)

		const chatMessage =	`
		<div class="pf2e chat-card action-card">
            <header class="card-header flexrow">
                <img src="${ACTION_GLYPH[glyph].img}" title="${actionName}" width="36" height="36">
                <h3>${actionName}</h3>
            </header>
    		<p>${message}</p>
		</div>
		`
		const chatData = {
			speaker: {
				actor: token.actor.id,
				token: token.id,
				scene: canvas.scene.id,
				alias: token.name
			},
			content: chatMessage
		}
		if (priv)
			chatData.whisper = CommonUtils.findGM().id
		ChatMessage.create(chatData, {rollMode})
	}
}

export class ActionRunner {
	constructor(action) {
		this.action = action
	}

	async run(options, warn = false) {
		const engagement = this.action.relevant(warn)
		if (engagement) {
			if (!this.action.gmActs) {
				const result = await this.action.act(engagement, options)
				if (!this.action.gmApplies) {
					this.action.apply(engagement, result)
				}
				else {
					const eventData = {
						action: this.action.name,
						result
					}
					game.MKS.socketHandler.emit('GmAppliesActionResult', eventData, true)
				}
			}
			else {
				const eventData = {
					action: this.action.name,
					engagement: engagement.initiator ? engagement.participants : engagement.serialize(),
					options
				}
				game.MKS.socketHandler.emit('GmTakesAction', eventData, true)
			}
		}
	}

	async actByGM(request) {
		const engagement = request.engagement.initiator ? Engagement.from(request.engagement) : ObjectColl.deserialize(request.engagement)
		if (!engagement)
			return

		return this.action.act(engagement, request.options)
	}

	async applyByGM(result) {
		const engagement = result.engagement.initiator ? Engagement.from(result.engagement) : ObjectColl.deserialize(result.engagement)
		if (!engagement)
			return

		return this.action.apply(engagement, result)
	}
}

export class SimpleAction extends Action {
	constructor(MKS, {action, mode = 'encounter', gmActs = false, gmApplies = true, traits, checkType, dc, icon, tags, requiresEncounter = false, actionGlyph = 'A', targetCount = 0}) {
		super(MKS, action, mode, gmActs, gmApplies)
		this.actionGlyph = actionGlyph
		this.traits = traits
		this.checkType = checkType
		this.dc = dc
		this.icon = icon
		this.tags = tags
		this.targetCount = targetCount
		this.requiresEncounter = requiresEncounter
	}

	relevant(warn) {
		const selected = this._.ensureOneSelected(warn, this.requiresEncounter)
		if (!selected) return

		if (this.targetCount === 1) {
			const targeted = this._.ensureOneTarget(null, false)
			if (!targeted || targeted.id === selected.id) return
			const engagement = new Engagement(selected, targeted)
			const ok = this.pertinent(engagement, warn) 
			return ok ? engagement : undefined
		}
		else if (this.targetCount > 1) {
			const targets = this._.ensureAtLeastOneTarget(false, null)
			if (!targets || targets.find(t => t.id === selected.id)) return
			const engagement = new Engagements(selected, targets)
			const ok = this.pertinent(engagement, warn) 
			return ok ? engagement : undefined
		}
		else if (this.targetCount === 0) {
			const engagement = new Engagement(selected)
			const ok = this.pertinent(engagement, warn) 
			return ok ? engagement : undefined
		}
	}

	pertinent(engagement, warn) {
		const opponentCount = engagement.opponentCount()
		return this.targetCount === 1 ? opponentCount === 1 : this.targetCount > 1 ? opponentCount > 1 : true
	}

	async act(engagement, {overrideDC}) {
		const options = arguments[1]

		const rollCallback = ({roll, actor}) => {
			//this.resultHandler(roll, engagement, options)
			return this.createResult(engagement, roll, options)
		}
		
		const check = new Check({
			action: this.name,
			actionGlyph: this.actionGlyph,
			rollOptions: ["action:" + game.pf2e.system.sluggify(this.name)],
			extraOptions: ["action:" + game.pf2e.system.sluggify(this.name)],
			traits: this.traits,
			checkType: this.checkType,
			difficultyClass: overrideDC > 0 ? overrideDC : $$lang.isFunction(this.dc) ? engagement.getTargetDC(this.dc) : null,
			askGmForDC: {
				action: this.name,
				defaultDC: typeof this.dc === 'number' ? this.dc : null
			}
		})
		const result = await check.roll(engagement).then(rollCallback)
		return result
	}

	async apply(engagement, result) {
		if (!result.roll) return
		this.resultToChat(engagement.initiator, this.name, result.roll.degreeOfSuccess, this.actionGlyph)
	}

	// resultHandler(roll, engagement, options) {
	// 	if (!roll) return
	// 	this.resultToChat(engagement.initiator, this.name, roll.degreeOfSuccess, this.actionGlyph)
	// }

	get properties() {
		return {
			label: i18n.action(this.name),
			icon: this.icon,
			actionGlyph: this.actionGlyph,
			tags: this.tags
		}
	}
}

export const RUDIMENTARY_ACTIONS = {
	step: {icon: 'systems/pf2e/icons/spells/synchronise-steps.webp', compendium: Compendium.ACTION_STEP, mode: 'encounter'},
	stride: {icon: 'systems/pf2e/icons/spells/fleet-step.webp', compendium: Compendium.ACTION_STRIDE, mode: 'encounter'},
	interact: {icon: 'systems/pf2e/icons/spells/mage-hand.webp', compendium: Compendium.ACTION_INTERACT, mode: 'encounter'},
	mount: {icon: 'systems/pf2e/icons/spells/phantom-steed.webp', compendium: Compendium.ACTION_MOUNT, mode: 'encounter'},
	ready: {icon: 'systems/pf2e/icons/features/feats/cavaliers-banner.webp', compendium: Compendium.ACTION_READY, mode: 'encounter'},
	release: {icon: 'systems/pf2e/icons/spells/mending.webp', compendium: Compendium.ACTION_RELEASE, mode: 'encounter'},
	sustainASpell: {icon: 'systems/pf2e/icons/spells/faerie-dust.webp', compendium: Compendium.ACTION_SUSTAIN_A_SPELL, mode: 'encounter'},
	sustainAnActivation: {icon: 'systems/pf2e/icons/spells/friendfetch.webp', compendium: Compendium.ACTION_SUSTAIN_AN_ACTIVATION, mode: 'encounter'},
	crawl: {icon: 'systems/pf2e/icons/spells/uncontrollable-dance.webp', compendium: Compendium.ACTION_CRAWL, mode: 'encounter'},
	leap: {icon: 'systems/pf2e/icons/spells/wind-jump.webp', compendium: Compendium.ACTION_LEAP, mode: 'encounter'},
	pointOut: {icon: 'systems/pf2e/icons/spells/object-memory.webp', compendium: Compendium.ACTION_POINT_OUT, mode: 'encounter'},
	avertGaze: {icon: 'systems/pf2e/icons/spells/veil-of-dreams.webp', compendium: Compendium.ACTION_AVERT_GAZE, mode: 'encounter'},
	
	defend: {icon: 'systems/pf2e/icons/spells/rebounding-barrier.webp', compendium: Compendium.ACTION_DEFEND, mode: 'exploration'},
	detectMagic: {icon: 'systems/pf2e/icons/spells/detect-magic.webp', compendium: Compendium.ACTION_DETECT_MAGIC, mode: 'exploration'},
	followTheExpert: {icon: 'systems/pf2e/icons/spells/perseiss-precautions.webp', compendium: Compendium.ACTION_FOLLOW_THE_EXPERT, mode: 'exploration'},
	hustle: {icon: 'systems/pf2e/icons/spells/triple-time.webp', compendium: Compendium.ACTION_HUSTLE, mode: 'exploration'},
	investigate: {icon: 'systems/pf2e/icons/spells/anticipate-peril.webp', compendium: Compendium.ACTION_INVESTIGATE, mode: 'exploration'},
	refocus: {icon: 'systems/pf2e/icons/spells/perfected-mind.webp', compendium: Compendium.ACTION_REFOCUS, mode: 'exploration'},
	repeatASpell: {icon: 'systems/pf2e/icons/spells/read-fate.webp', compendium: Compendium.ACTION_REPEAT_A_SPELL, mode: 'exploration'},
	scout: {icon: 'systems/pf2e/icons/spells/vision-of-weakness.webp', compendium: Compendium.ACTION_SCOUT, mode: 'exploration'},
	search: {icon: 'systems/pf2e/icons/spells/far-sight.webp', compendium: Compendium.ACTION_SEARCH, mode: 'exploration'},
	
	retraining: {icon: 'systems/pf2e/icons/spells/scouring-pulse.webp', compendium: Compendium.ACTION_RETRAINING, mode: 'downtime'},
}