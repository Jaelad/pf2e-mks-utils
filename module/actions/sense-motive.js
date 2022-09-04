import {default as i18n} from "../../lang/pf2e-helper.js"
import {default as LOG} from "../../utils/logging.js"
import Action from "../action.js"
import Compendium from "../compendium.js"
import Check from "../check.js"
import {ROLL_MODE} from "../constants.js"

export default class ActionSenseMotive extends Action {

	senseMotive(options = {}) {
		const {applicable, selected, targeted} = this.isApplicable(null,true)
		if (!applicable)
			return

		const rollCallback = ({roll, actor}) => {
			if (roll?.data.degreeOfSuccess === 0)
				;//this.effectManager.setCondition(selected, 'prone').then()
			else if (roll?.data.degreeOfSuccess > 1)
				;//this._.compendiumToChat(selected, Compendium.ACTION_SHOVE, ROLL_MODE.BLIND)
		}

		const check = new Check({
			actionGlyph: "A",
			rollOptions: ["action:sense-motive"],
			extraOptions: ["action:sense-motive"],
			traits: ["concentrate", "secret"],
			checkType: "perception",
			askGmForDC: {
				action: this?.constructor?.name,
				title: i18n.action('SenseMotive'),
				defaultDC: targeted.actor.skills.deception.dc.value
			}
		})
		check.roll(selected, targeted).then(rollCallback)
	}

	methods(onlyApplicable) {
		const {applicable} = this.isApplicable()
		return !onlyApplicable || applicable ? [{
			method: "senseMotive",
			label: i18n.action("senseMotive"),
			icon: "systems/pf2e/icons/spells/enhance-senses.webp",
			action: 'A',
			mode: "encounter",
			tags: ['social']
		}] : []
	}

	isApplicable(method=null, warn=false) {
		const selected = this._.ensureOneSelected(warn)
		const targeted = this._.ensureOneTarget(null,warn)
		if (!selected || !targeted)
			return {applicable: false}

		return {applicable: true, selected, targeted}
	}
}
