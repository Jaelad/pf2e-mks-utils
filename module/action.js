import {default as i18n} from "../lang/pf2e-helper.js"
import {ACTION_GLYPH, ROLL_MODE} from "./constants.js"
import Compendium from "./compendium.js"
import Check from "./check.js"
import $$strings from "../utils/strings.js"
import DCHelper from "./helpers/dc-helper.js"

export default class Action {

	constructor(MKS) {
		this._ = MKS
		this.effectManager = MKS.effectManager
	}

	initialize() {
	}

	methods(onlyApplicable) {
		return []
	}

	isApplicable(method = null, warn= false) {
		// return {applicable, selected, targeted}
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
}

export class SimpleAction extends Action {
	constructor(MKS, {action, traits, checkType, dc, icon, tags, mode='encounter', actionGlyph = 'A', targetCount = 0}) {
		super(MKS)
		this.actionGlyph = actionGlyph
		this.action = action
		this.traits = traits
		this.checkType = checkType
		this.dc = dc
		this.icon = icon
		this.mode = mode
		this.tags = tags
		this.targetCount = targetCount
	}

	act({overrideDC}) {
		const options = arguments[0]
		const {applicable, selected, targeted, targets} = this.isApplicable(null,true)
		if (!applicable)
			return

		const rollCallback = ({roll, actor}) => {
			this.resultHandler(roll, selected, targets ?? targeted, options)
		}

		const check = new Check({
			action: this.action,
			actionGlyph: this.actionGlyph,
			rollOptions: ["action:" + game.pf2e.system.sluggify(this.action)],
			extraOptions: ["action:" + game.pf2e.system.sluggify(this.action)],
			traits: this.traits,
			checkType: this.checkType,
			difficultyClass: overrideDC ?? this.targetCount > 1 ? DCHelper.getMaxDC(targets, this.dc) : this.dc?.(targets),
			askGmForDC: {
				action: this.action,
				defaultDC: 20
			}
		})
		check.roll(selected).then(rollCallback)
	}

	resultHandler(roll, selected, targets, options) {
		this.resultToChat(selected, this.action, roll?.data.degreeOfSuccess, this.actionGlyph)
	}

	methods(onlyApplicable) {
		const {applicable} = this.isApplicable()
		return !onlyApplicable || applicable ? [{
			method: 'act',
			label: i18n.action(this.action),
			icon: this.icon,
			actionGlyph: this.actionGlyph,
			mode: this.mode,
			tags: this.tags
		}] : []
	}

	isApplicable(method=null, warn=false) {
		const selected = this._.ensureOneSelected(warn)
		if (!selected) return {applicable: false}

		if (this.targetCount === 1) {
			const targeted = this._.ensureOneTarget(null, warn)
			if (!targeted) return {applicable: false}
			return {applicable: this.applies(selected, targeted), selected, targeted}
		}
		else if (this.targetCount > 1) {
			const targets = this._.ensureAtLeastOneTarget(null, warn)
			if (!targets) return {applicable: false}
			return {applicable: this.applies(selected, targets), selected, targets}
		}
		else if (this.targetCount === 0) {
			return {applicable: this.applies(selected), selected}
		}
		else
			return {applicable: false}
	}

	applies(selected, targets) {
		return !!selected && (this.targetCount === 0 || !!targets)
	}
}

export const RUDIMENTARY_ACTIONS = {
	step: {icon: 'systems/pf2e/icons/spells/synchronise-steps.webp', compendium: Compendium.ACTION_STEP},
	stride: {icon: 'systems/pf2e/icons/spells/fleet-step.webp', compendium: Compendium.ACTION_STRIDE},
	interact: {icon: 'systems/pf2e/icons/spells/mage-hand.webp', compendium: Compendium.ACTION_INTERACT},
	mount: {icon: 'systems/pf2e/icons/spells/phantom-steed.webp', compendium: Compendium.ACTION_MOUNT},
	ready: {icon: 'systems/pf2e/icons/features/feats/cavaliers-banner.webp', compendium: Compendium.ACTION_READY},
	release: {icon: 'systems/pf2e/icons/spells/mending.webp', compendium: Compendium.ACTION_RELEASE},
	sustainASpell: {icon: 'systems/pf2e/icons/spells/faerie-dust.webp', compendium: Compendium.ACTION_SUSTAIN_A_SPELL},
	sustainAnActivation: {icon: 'systems/pf2e/icons/spells/friendfetch.webp', compendium: Compendium.ACTION_SUSTAIN_AN_ACTIVATION},
	crawl: {icon: 'systems/pf2e/icons/spells/uncontrollable-dance.webp', compendium: Compendium.ACTION_CRAWL},
	leap: {icon: 'systems/pf2e/icons/spells/wind-jump.webp', compendium: Compendium.ACTION_LEAP},
	pointOut: {icon: 'systems/pf2e/icons/spells/object-memory.webp', compendium: Compendium.ACTION_POINT_OUT},
	avertGaze: {icon: 'systems/pf2e/icons/spells/veil-of-dreams.webp', compendium: Compendium.ACTION_AVERT_GAZE},
}