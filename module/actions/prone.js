import {default as i18n} from "../../lang/pf2e-i18n.js"
import {default as LOG} from "../../utils/logging.js"
import Action from "../action.js"
import Compendium from "../compendium.js"

export default class ActionProne extends Action {

	async prone() {
		const {applicable, selected} = this.isApplicable(null,true)
		if (!applicable)
			return

		const actor = selected?.actor ?? selected
		if (!this.effectManager.hasCondition(actor, 'prone'))
			await this.effectManager.setCondition(actor, 'prone')
		else
			await this.effectManager.removeCondition(actor, 'prone')
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