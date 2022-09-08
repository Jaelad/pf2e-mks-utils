import {default as i18n} from "../../lang/pf2e-helper.js"
import {default as LOG} from "../../utils/logging.js"
import Action from "../action.js"
import Compendium from "../compendium.js"
import Check from "../check.js"
import {ROLL_MODE} from "../constants.js"

export default class ActionRecallKnowledge extends Action {

	recallKnowledge(options = {}) {
		const {applicable, selected, targeted} = this.isApplicable(null,true)
		if (!applicable)
			return

		const rollCallback = ({roll, actor}) => {
			this.resultToChat(selected,'recallKnowledge', roll?.data.degreeOfSuccess)
		}



		const check = new Check({
			actionGlyph: "A",
			rollOptions: ["action:recall-knowledge"],
			extraOptions: ["action:recall-knowledge"],
			traits: ["secret", "concentrate"],
			checkType: "skill[acrobatics]",
			askGmForDC: {
				action: this?.constructor?.name,
				title: i18n.action('recallKnowledge'),
				defaultDC: targeted.actor.saves.reflex.dc.value
			}
		})
		check.roll(selected, targeted).then(rollCallback)
	}

	methods(onlyApplicable) {
		const {applicable} = this.isApplicable()
		return !onlyApplicable || applicable ? [{
			method: "recallKnowledge",
			label: i18n.action("recallKnowledge"),
			icon: "systems/pf2e/icons/spells/daydreamers-curse.webp",
			action: 'A',
			mode: "encounter",
			tags: ['basic']
		}] : []
	}

	isApplicable(method=null, warn=false) {
		const selected = this._.ensureOneSelected(warn)
		const targeted = this._.ensureOneTarget(null,warn)

		return {applicable: !!selected, selected, targeted}
	}
}
