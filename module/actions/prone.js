import {default as i18n} from "../../lang/pf2e-helper.js"
import {default as LOG} from "../../utils/logging.js"
import Action from "../action.js"
import Compendium from "../compendium.js"

export default class ActionProne extends Action {

	async prone() {
		const {applicable, selected} = this.isApplicable(null,true)
		if (!applicable)
			return

		const actor = selected?.actor ?? selected
		const prone = this.effectManager.getCondition(selected, 'prone')
		if (prone)
			await game.pf2e.ConditionManager.removeConditionFromActor(prone.id, actor)
		else
			await game.pf2e.ConditionManager.addConditionToActor('prone', actor)
	}

	methods(onlyApplicable) {
		const {applicable} = this.isApplicable()
		return !onlyApplicable || applicable ? [{
			method: "prone",
			label: i18n.action("prone"),
			icon: "systems/pf2e/icons/conditions/prone.webp",
			action: 'A',
			mode: "encounter",
			tags: ['basic']
		}] : []
	}

	isApplicable(method= null, warn= false) {
		let selected = this._.ensureOneSelected(warn)

		return {applicable: !!selected, selected}
	}
}