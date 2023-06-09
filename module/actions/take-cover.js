import {default as i18n} from "../../lang/pf2e-i18n.js"
import Action from "../action.js"
import Effect, { EFFECT_COVER_TAKEN } from "../model/effect.js"

export default class ActionTakeCover extends Action {
	constructor(MKS) {
		super(MKS, 'takeCover', 'encounter', false, false)
	}

	get properties() {
		return {
			label: i18n.action("takeCover"),
			icon: "systems/pf2e/icons/conditions-2/status_acup.webp",
			actionGlyph: 'A',
			tags: ['basic']
		}
	} 

	async apply(engagement) {
		new Effect(engagement.initiator, EFFECT_COVER_TAKEN).ensure().then()
	}
}
