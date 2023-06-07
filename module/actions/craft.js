import {default as i18n} from "../../lang/pf2e-i18n.js"
import Action from "../action.js"
import DropItemDialog from "../apps/drop-item-dialog.js"
import $$lang from "../../utils/lang.js"
import {Engagement} from "../model/engagement.js"

export default class ActionCraft extends Action {
	
	constructor(MKS) {
		super(MKS, 'downtime', false, false)
	}

	get properties() {
		return {
			label: i18n.action("craft"),
			icon: "systems/pf2e/icons/spells/precious-metals.webp",
			action: '',
			tags: ['preparation']
		}
	} 

	relevant(warn) {
		const selected = this._.ensureOneSelected(warn)
		return selected ? new Engagement(selected) : undefined
	}

	async act(engagement, options) {
		const item = await DropItemDialog.getItem({
			title: "PF2E.Actions.Craft.DropItemDialog.Title",
			classes: ["select-craft-item-dialog"],
			filter: i => $$lang.instanceOf(i, 'PhysicalItemPF2e'),
			filteredOutWarning: "PF2E.Actions.Craft.Error.ItemReferenceMismatch"
		})
		
		if (item)
			game.pf2e.actions.craft({item, free: false})
	}
}