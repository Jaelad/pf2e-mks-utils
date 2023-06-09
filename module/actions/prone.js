import {default as i18n} from "../../lang/pf2e-i18n.js"
import {default as LOG} from "../../utils/logging.js"
import Action from "../action.js"
import Compendium from "../compendium.js"
import Condition, { CONDITION_DYING, CONDITION_PRONE } from "../model/condition.js"

export default class ActionProne extends Action {

	constructor(MKS) {
		super(MKS, 'prone', 'encounter', false, false)
	}

	get properties() {
		return {
			label: i18n.action("prone"),
			icon: "systems/pf2e/icons/conditions/prone.webp",
			actionGlyph: 'A',
			tags: ['basic']
		}
	} 

	async apply(engagement) {
		new Condition(engagement.initiator, CONDITION_PRONE).toogle().then()
	}
}