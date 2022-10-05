import {default as i18n} from "../../lang/pf2e-i18n.js"
import Action from "../action.js"
import Compendium from "../compendium.js"

export default class ActionTakeCover extends Action {

	takeCover(options = {}) {
		const {applicable, selected} = this.isApplicable('takeCover',true)
		if (!applicable) return
		this.effectManager.setEffect(selected, Compendium.EFFECT_COVER_TAKEN).then()
	}

	methods(onlyApplicable) {
		const {applicable} = this.isApplicable()
		return !onlyApplicable || applicable ? [{
			method: "takeCover",
			label: i18n.action("takeCover"),
			icon: "systems/pf2e/icons/conditions-2/status_acup.webp",
			action: 'A',
			mode: "encounter",
			tags: ['combat', 'stealth']
		}] : []
	}

	isApplicable(method, warn=false) {
		const selected = this._.ensureOneSelected(warn)
		return {applicable: !!selected, selected}
	}
}
