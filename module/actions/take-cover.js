import {default as i18n} from "../../lang/pf2e-i18n.js"
import Action from "../action.js"
import Effect, { EFFECT_COVER_TAKEN } from "../model/effect.js"
import {Engagement} from "../model/engagement.js"

export default class ActionTakeCover extends Action {
	constructor(MKS) {
		super(MKS, 'takeCover', 'encounter', false, false, {
			icon: "systems/pf2e/icons/conditions-2/status_acup.webp",
			actionGlyph: 'A',
			tags: ['basic']
		})
	}

	relevant(warn) {
		const selected = this._.ensureOneSelected(warn)
		if (!selected) return
		const targets = this._.getTargets()
		return targets?.size > 0 ? undefined : new Engagement(selected)
	}
	
	async act(engagement, options) {
		new Effect(engagement.initiator, EFFECT_COVER_TAKEN).ensure().then()
	}
}
