import {default as i18n} from "../lang/pf2e-helper.js"
import {ACTION_GLYPH} from "./constants.js"
import Compendium from "./compendium.js"

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
		this._.socketHandler.emit('ChatMessage', chatData, true)
	}
}

export const RUDIMENTARY_ACTIONS = {
	step: {icon: 'systems/pf2e/icons/spells/synchronise-steps.webp', compendium: Compendium.ACTION_STEP},
	stride: {icon: 'systems/pf2e/icons/spells/fleet-step.webp', compendium: Compendium.ACTION_STRIDE},
	interact: {icon: 'systems/pf2e/icons/spells/mage-hand.webp', compendium: Compendium.ACTION_INTERACT},
	mount: {icon: 'systems/pf2e/icons/spells/phantom-steed.webp', compendium: Compendium.ACTION_MOUNT},
	ready: {icon: 'systems/pf2e/icons/features/feats/cavaliers-banner.webp', compendium: Compendium.ACTION_READY},
	release: {icon: 'systems/pf2e/icons/spells/', compendium: Compendium.ACTION_RELEASE},
	sustainASpell: {icon: 'systems/pf2e/icons/spells/', compendium: Compendium.ACTION_SUSTAIN_A_SPELL},
	sustainAnActivation: {icon: 'systems/pf2e/icons/spells/', compendium: Compendium.ACTION_SUSTAIN_AN_ACTIVATION},
	crawl: {icon: 'systems/pf2e/icons/spells/', compendium: Compendium.ACTION_CRAWL},
	leap: {icon: 'systems/pf2e/icons/spells/wind-jump.webp', compendium: Compendium.ACTION_LEAP},
	pointOut: {icon: 'systems/pf2e/icons/spells/', compendium: Compendium.ACTION_POINT_OUT},
	avertGaze: {icon: 'systems/pf2e/icons/spells/veil-of-dreams.webp', compendium: Compendium.ACTION_AVERT_GAZE},
}