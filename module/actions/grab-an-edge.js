import {default as i18n} from "../../lang/pf2e-helper.js"
import {default as LOG} from "../../utils/logging.js"
import Action from "../action.js"
import Compendium from "../compendium.js"
import Check from "../check.js"
import {ROLL_MODE} from "../constants.js"

export default class ActionGrabAnEdge extends Action {

	grabAnEdge(options = {}) {
		const {applicable, selected, targeted} = this.isApplicable(null,true)
		if (!applicable)
			return

		const rollCallback = ({roll, actor}) => {
			this.resultToChat(selected,'grabAnEdge', roll?.data.degreeOfSuccess)
		}

		const check = new Check({
			actionGlyph: "R",
			rollOptions: ["action:grab-an-edge"],
			extraOptions: ["action:grab-an-edge"],
			traits: ["manipulate"],
			checkType: "reflex",
			askGmForDC: {
				action: this?.constructor?.name,
				title: i18n.action('GrabAnEdge'),
				defaultDC: 15
			}
		})
		check.roll(selected).then(rollCallback)
	}

	methods(onlyApplicable) {
		const {applicable} = this.isApplicable()
		return !onlyApplicable || applicable ? [{
			method: "grabAnEdge",
			label: i18n.action("grabAnEdge"),
			icon: "systems/pf2e/icons/spells/object-reading.webp",
			action: 'R',
			mode: "encounter",
			tags: ['basic']
		}] : []
	}

	isApplicable(method=null, warn=false) {
		const selected = this._.ensureOneSelected(warn)
		return {applicable: !!selected, selected}
	}
}
