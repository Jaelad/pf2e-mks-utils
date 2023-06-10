import {default as i18n} from "../../lang/pf2e-i18n.js"
import Action from "../action.js"

export default class ActionEarnIncome extends Action {
	
	constructor(MKS) {
		super(MKS, "earnIncome", 'downtime', false, false)
	}

	get properties() {
		return {
			label: i18n.action("earnIncome"),
			icon: "systems/pf2e/icons/spells/charitable-urge.webp",
			actionGlyph: '',
			tags: ['preparation']
		}
	}

	async act(engagement, options) {
		game.pf2e.actions.earnIncome(engagement.initiator.actor)
	}
}