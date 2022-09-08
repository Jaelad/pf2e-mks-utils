import {default as i18n} from "../../lang/pf2e-helper.js"
import {default as LOG} from "../../utils/logging.js"
import Action from "../action.js"
import Compendium from "../compendium.js"
import Check from "../check.js"
import {ROLL_MODE} from "../constants.js"

export default class ActionBalance extends Action {

	balance(options = {}) {
		const {applicable, selected, targeted} = this.isApplicable(null,true)
		if (!applicable)
			return

		const rollCallback = ({roll, actor}) => {
			this.resultToChat(selected,'balance', roll?.data.degreeOfSuccess)
		}

		const check = new Check({
			actionGlyph: "A",
			rollOptions: ["action:balance"],
			extraOptions: ["action:balance"],
			traits: ["move"],
			checkType: "skill[acrobatics]",
			askGmForDC: {
				action: this?.constructor?.name,
				title: i18n.action('balance'),
				defaultDC: 15
			}
		})
		check.roll(selected).then(rollCallback)
	}

	methods(onlyApplicable) {
		const {applicable} = this.isApplicable()
		return !onlyApplicable || applicable ? [{
			method: "balance",
			label: i18n.action("balance"),
			icon: "systems/pf2e/icons/spells/tempest-form.webp",
			action: 'A',
			mode: "encounter",
			tags: ['basic']
		}] : []
	}

	isApplicable(method=null, warn=false) {
		const selected = this._.ensureOneSelected(warn)
		return {applicable: !!selected, selected}
	}
}
