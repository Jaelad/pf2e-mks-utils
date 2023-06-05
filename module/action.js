import {default as i18n} from "../lang/pf2e-i18n.js"
import {ACTION_GLYPH, ROLL_MODE} from "./constants.js"
import Compendium from "./compendium.js"
import Check from "./check.js"
import DCHelper from "./helpers/dc-helper.js"
import $$lang from "../utils/lang.js"
import CommonUtils from "./helpers/common-utils.js"
import {Engagement, Engagements} from "./model/engagement.js"

export default class Action {

	constructor(MKS, mode = 'encounter') {
		this._ = MKS
		this.mode = mode
	}

	initialize() {
	}

	methods(onlyApplicable) {
		return []
	}

	isApplicable(method = null, warn= false) {
		// return {applicable, engagement}
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

export class SimpleAction extends Action {
	constructor(MKS, {action, traits, checkType, dc, icon, tags, mode='encounter', requiresEncounter = false, actionGlyph = 'A', targetCount = 0}) {
		super(MKS, mode)
		this.actionGlyph = actionGlyph
		this.action = action
		this.traits = traits
		this.checkType = checkType
		this.dc = dc
		this.icon = icon
		this.tags = tags
		this.targetCount = targetCount
		this.requiresEncounter = requiresEncounter
	}

	async act({overrideDC}) {
		const options = arguments[0]
		const {applicable, engagement} = this.isApplicable(null,true)
		if (!applicable)
			return

		const rollCallback = ({roll, actor}) => {
			this.resultHandler(roll, engagement, options)
		}
		
		const check = new Check({
			action: this.action,
			actionGlyph: this.actionGlyph,
			rollOptions: ["action:" + game.pf2e.system.sluggify(this.action)],
			extraOptions: ["action:" + game.pf2e.system.sluggify(this.action)],
			traits: this.traits,
			checkType: this.checkType,
			difficultyClass: overrideDC > 0 ? overrideDC : $$lang.isFunction(this.dc) ? engagement.getTargetDC(this.dc) : null,
			askGmForDC: {
				action: this.action,
				defaultDC: typeof this.dc === 'number' ? this.dc : null
			}
		})
		check.roll(engagement.selected).then(rollCallback)
	}

	resultHandler(roll, engagement, options) {
		if (!roll) return
		this.resultToChat(engagement.selected, this.action, roll.degreeOfSuccess, this.actionGlyph)
	}

	methods(onlyApplicable) {
		const {applicable} = onlyApplicable ? this.isApplicable() : {applicable: true}
		return applicable ? [{
			method: 'act',
			label: i18n.action(this.action),
			icon: this.icon,
			actionGlyph: this.actionGlyph,
			tags: this.tags
		}] : []
	}

	isApplicable(method=null, warn=false) {
		const selected = this._.ensureOneSelected(warn, this.requiresEncounter)
		if (!selected) return {applicable: false}

		if (this.targetCount === 1) {
			const targeted = this._.ensureOneTarget(null, warn)
			if (!targeted || targeted.id === selected.id) return {applicable: false}
			const engagement = new Engagement(selected, targeted)
			return {applicable: this.applies(engagement), engagement}
		}
		else if (this.targetCount > 1) {
			const targets = this._.ensureAtLeastOneTarget(warn, null)
			if (!targets || targets.find(t => t.id === selected.id)) return {applicable: false}
			const engagement = new Engagements(selected, targets)
			return {applicable: this.applies(engagement), engagement}
		}
		else if (this.targetCount === 0) {
			const engagement = new Engagements(selected)
			return {applicable: this.applies(engagement), engagement}
		}
		else
			return {applicable: false}
	}

	applies(engagement) {
		const opponentCount = engagement.opponentCount()
		return this.targetCount === 1 ? opponentCount === 1 : this.targetCount > 1 ? opponentCount > 1 : true
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