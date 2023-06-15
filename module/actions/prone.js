import {default as i18n} from "../../lang/pf2e-i18n.js"
import Action from "../action.js"
import Condition, { CONDITION_PRONE } from "../model/condition.js"
import {Engagement} from "../model/engagement.js"

export default class ActionProne extends Action {

	constructor(MKS) {
		super(MKS, 'prone', 'encounter', false, false, {
			icon: "systems/pf2e/icons/conditions/prone.webp",
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
		new Condition(engagement.initiator, CONDITION_PRONE).toogle().then()
	}
}