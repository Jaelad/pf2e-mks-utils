import {default as i18n} from "../../lang/pf2e-helper.js"
import Action from "../action.js"

export default class ActionEarnIncome extends Action {
	
	constructor(MKS) {
		super(MKS, 'downtime')
	}

	async earnIncome() {
		const {applicable, selected} = this.isApplicable(null,true)
		if (!applicable) return
		game.pf2e.actions.earnIncome(selected.actor)
	}

	methods(onlyApplicable) {
		return !onlyApplicable || this.isApplicable().applicable ? [{
			method: "earnIncome",
			label: i18n.action("earnIncome"),
			icon: "systems/pf2e/icons/spells/charitable-urge.webp",
			action: '',
			tags: ['preparation']
		}] : []
	}

	isApplicable(method=null, warn=false) {
		const selected = this._.ensureOneSelected(warn)
		return {applicable: !!selected, selected}
	}
}