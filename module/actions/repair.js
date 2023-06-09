import {SimpleAction} from "../action.js"
import {SYSTEM} from "../constants.js"
import {default as i18n} from "../../lang/pf2e-i18n.js"
import Dialogs from "../apps/dialogs.js"

export default class ActionRepair extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'repair', mode: 'exploration',
			checkType: 'skill[crafting]',
			traits: ['exploration', 'manipulate'],
			icon: "systems/pf2e/icons/equipment/weapons/gnome-hooked-hammer.webp",
			tags: ['preparation'],
			actionGlyph: ''
		})
	}

	pertinent(engagement, warn) {
		const selected = engagement.initiator
		const hasRepairableItem = !!selected.actor.items.find(i => i.system.hp?.max > i.system.hp?.value)
		return hasRepairableItem
			&& !!selected.actor.itemTypes.equipment.find(e => e.slug === 'repair-kit')
			&& selected.actor.skills.crafting.rank > 0
	}
	
	async act(engagement, {overrideDC}) {
		const selected = engagement.initiator
		const repairableItems = selected.actor.items.filter(i => i.system.hp?.max > i.system.hp?.value)
		let itemId = null
		if (repairableItems.length > 0) {
			const repairs = repairableItems.map(i => {
				return {name: i.name + "(" + i.system.hp.value + "/" + i.system.hp.max + ")", value: i.id}
			})
			itemId = await Dialogs.selectOne(repairs, "PF2E.MKS.Dialog.Repair.SelectItem")
		}
		else
			itemId = repairableItems[0].id
		
		return super.act(engagement, {overrideDC, itemId})
	}

	async apply(engagement, result) {
		const selected = engagement.initiator
		const item = selected.actor.items.filter(i => i.id === result.options.itemId)
		const rank = selected.actor.skills.crafting.rank
		let hpValue = item.system.hp.value
		
		if (roll.degreeOfSuccess === 3)
			hpValue += 10 * (rank + 1)
		else if (roll.degreeOfSuccess === 2)
			hpValue += 5 * (rank + 1)
		else if (roll.degreeOfSuccess === 0)
			hpValue -= new Roll("2d6").roll({async: false}) - item.system.hardness
		hpValue = Math.clamped(hpValue, 0, item.system.hp.max)
		
		if (hpValue !== item.system.hp.value)
			await item.update({ "system.hp.value": hpValue})
	}
}