import {default as i18n} from "../../lang/pf2e-helper.js"
import {default as LOG} from "../../utils/logging.js"
import Action from "../action.js"

export default class ActionSeek extends Action {

	raiseAShield() {
		const token = this._.ensureOneSelected()
		const actor = token.actor

		const shield = actor.heldShield;

	}
}