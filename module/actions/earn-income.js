import {default as i18n} from "../../lang/pf2e-i18n.js"
import { SystemAction } from "../action.js"

export default class ActionEarnIncome extends SystemAction {
	
	constructor(MKS) {
		super(MKS, "earnIncome", 'downtime', false, false, {
			icon: "systems/pf2e/icons/spells/charitable-urge.webp",
			actionGlyph: '',
			tags: ['preparation']
		})
	}

	async act(engagement, options) {
		game.pf2e.actions.earnIncome(engagement.initiator.actor)
	}
}