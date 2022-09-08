import {default as i18n} from "../../lang/pf2e-helper.js"
import {default as LOG} from "../../utils/logging.js"
import Action from "../action.js"
import Compendium from "../compendium.js"
import Check from "../check.js"
import {ROLL_MODE} from "../constants.js"

export default class ActionTumbleThrough extends Action {

	tumbleThrough(options = {}) {
		const {applicable, selected, targeted} = this.isApplicable(null,true)
		if (!applicable)
			return

		const rollCallback = ({roll, actor}) => {
			this.resultToChat(selected,'tumbleThrough', roll?.data.degreeOfSuccess)
		}

		const check = new Check({
			actionGlyph: "A",
			rollOptions: ["action:tumble-through"],
			extraOptions: ["action:tumble-through"],
			traits: ["move"],
			checkType: "skill[acrobatics]",
			askGmForDC: {
				action: this?.constructor?.name,
				title: i18n.action('tumbleThrough'),
				defaultDC: targeted.actor.saves.reflex.dc.value
			}
		})
		check.roll(selected, targeted).then(rollCallback)
	}

	methods(onlyApplicable) {
		const {applicable} = this.isApplicable()
		return !onlyApplicable || applicable ? [{
			method: "tumbleThrough",
			label: i18n.action("tumbleThrough"),
			icon: "systems/pf2e/icons/spells/mislead.webp",
			action: 'A',
			mode: "encounter",
			tags: ['basic']
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
