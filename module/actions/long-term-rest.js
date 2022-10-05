import {default as i18n} from "../../lang/pf2e-i18n.js"
import Action from "../action.js"

export default class ActionLongTermRest extends Action {
	
	constructor(MKS) {
		super(MKS, 'downtime')
	}

	async longTermRest() {
		const {applicable, selected} = this.isApplicable(null,true)
		if (!applicable) return
		
		game.pf2e.actions.earnIncome({actors: selected.map(t => t.actor)})
	}

	methods(onlyApplicable) {
		return !onlyApplicable || this.isApplicable().applicable ? [{
			method: "longTermRest",
			label: i18n.action("longTermRest"),
			icon: "systems/pf2e/icons/spells/sleep.webp",
			action: '',
			tags: ['preparation']
		}] : []
	}

	isApplicable(method=null, warn=false) {
		const selected = this._.ensureAtLeastOneSelected(warn)
		return {applicable: selected?.length > 0, selected}
	}
}