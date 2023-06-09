import {default as i18n} from "../../lang/pf2e-i18n.js"
import Action from "../action.js"
import { Engagement, Engagements } from "../model/engagement.js"
import ObjectColl from "../model/object-coll.js"

export default class ActionLongTermRest extends Action {

	constructor(MKS) {
		super(MKS, 'longTermRest', 'downtime', false, false)
	}

	get properties() {
		return {
			label: i18n.action("longTermRest"),
			icon: "systems/pf2e/icons/spells/sleep.webp",
			actionGlyph: '',
			tags: ['preparation']
		}
	}

	relevant(warn) {
		const selecteds = this._.ensureAtLeastOneSelected(warn)
		if (selecteds?.length > 0)
			return new ObjectColl('token', selecteds)
	}

	async act(coll, options) {
		const selecteds = coll.objects
		game.pf2e.actions.longTermRest({actors: selecteds.map(t => t.actor)})
	}
}