import {default as i18n} from "../../lang/pf2e-i18n.js"
import {default as LOG} from "../../utils/logging.js"
import Action from "../action.js"
import Compendium from "../compendium.js"

export default class ActionTreatWounds extends Action {
	
	constructor(MKS) {
		super(MKS, 'exploration')
	}

	async treatWounds() {
		const {applicable, selected, targeted} = this.isApplicable(null,true)
		if (!applicable) return
		
		game.pf2e.actions.treatWounds({ actors: [selected] })
	}

	methods(onlyApplicable) {
		const {applicable} = this.isApplicable()
		return !onlyApplicable || applicable ? [{
			method: "treatWounds",
			label: i18n.action("treatWounds"),
			icon: "systems/pf2e/icons/features/feats/treat-wounds.webp",
			action: '',
			tags: ['preparation']
		}] : []
	}

	isApplicable(method=null, warn=false) {
		const selected = this._.ensureOneSelected(warn)
		const targeted = this._.ensureOneTarget(null, warn)
		
		return {applicable: !!selected && !!targeted
				&& selected.actor.alliance === targeted.actor.alliance
				&& this._.actorManager.hasLostHP(targeted)
			, selected, targeted}
	}
}