import {default as i18n} from "../../lang/pf2e-i18n.js"
import {default as LOG} from "../../utils/logging.js"
import Action from "../action.js"
import Compendium from "../compendium.js"
import SelectItemDialog from "../apps/select-item-dialog.js"
import $$lang from "../../utils/lang.js"
import DCHelper from "../helpers/dc-helper.js"

export default class ActionCraft extends Action {
	
	constructor(MKS) {
		super(MKS, 'downtime')
	}

	async craft() {
		const {applicable, selected} = this.isApplicable(null,true)
		if (!applicable) return
		
		const item = await SelectItemDialog.getItem({
			title: "PF2E.Actions.Craft.SelectItemDialog.Title",
			classes: ["select-craft-item-dialog"],
			filter: i => $$lang.instanceOf(i, 'PhysicalItemPF2e'),
			filteredOutWarning: "PF2E.Actions.Craft.Error.ItemReferenceMismatch"
		})
		
		game.pf2e.actions.craft({item, free: false})
	}

	methods(onlyApplicable) {
		return !onlyApplicable || this.isApplicable().applicable ? [{
			method: "craft",
			label: i18n.action("craft"),
			icon: "systems/pf2e/icons/spells/precious-metals.webp",
			action: '',
			tags: ['preparation']
		}] : []
	}

	isApplicable(method=null, warn=false) {
		const selected = this._.ensureOneSelected(warn)
		return {applicable: !!selected, selected}
	}
}