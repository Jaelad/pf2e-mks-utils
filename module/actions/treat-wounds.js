import {default as i18n} from "../../lang/pf2e-i18n.js"
import {default as LOG} from "../../utils/logging.js"
import Action from "../action.js"
import Compendium from "../compendium.js"
import { Engagement } from "../model/engagement.js"

export default class ActionTreatWounds extends Action {

	constructor(MKS) {
		super(MKS, 'treatWounds', 'exploration', false, false, {
			icon: "systems/pf2e/icons/features/feats/treat-wounds.webp",
			actionGlyph: '',
			tags: ['preparation']
		})
	}

	relevant(warn) {
		const selected = this._.ensureOneSelected(warn)
		const targeted = this._.ensureOneTarget(null,warn)
		if (!selected || !targeted)
			return

		const engagement = new Engagement(selected, targeted)

		if (engagement.isAlly && this._.actorManager.hasLostHP(targeted))
			return engagement
	}
	
	async act(engagement, options) {
		game.pf2e.actions.treatWounds({ actors: [engagement.initiator] })
	}
}