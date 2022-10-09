import {default as i18n} from "../../lang/pf2e-i18n.js"
import {SYSTEM} from "../constants.js"
import BasePanel from "./base-panel.js"
import $$strings from "../../utils/strings.js"
import CommonUtils from "../helpers/common-utils.js"
import Dialogs from "./dialogs.js"
import SLOT_USAGES from "../inventory-manager.js"

export default class EquipmentsPanel extends BasePanel {
	
	constructor(dialogData = {}, options = {}) {
		super(dialogData, options)
	}
	
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			id: "equipments-panel",
			title: game.i18n.localize("PF2E.MKS.UI.EquipmentsPanel.Label"),
			template: `modules/pf2e-tools-mks/templates/equipments.hbs`,
			width: "auto",
			height: 618,
			top: 300,
			left: 300,
			resizable: false
		})
	}
	
	activateListeners(html) {
		super.activateListeners(html)
		
		html.find("a[data-action][data-item]").click((event) => this._takeAction(event))
		html.find("div[data-slot][data-item]").click((event) => this._slotLeftClick(event))
		html.find("div[data-slot][data-item]").contextmenu((event) => this._slotRightClick(event))
		html.find("a[data-action=refresh]").click((event) => {
			game.MKS.inventoryManager.equipments(this.token).then(() => {
				EquipmentsPanel.rerender()
			})
			event.stopPropagation()
		})
		html.find("[data-token]").click((event) =>	game.MKS.inventoryManager.openCharacterSheet(this.token, 'inventory'))
	}

	async _slotRightClick(event) {
		const {item, slot} = event?.currentTarget?.dataset

		const pf2eSlots = []
		for (const [pf2eSlot, value] of Object.entries(SLOT_USAGES)) {
			if (Array.isArray(value.slot) ? value.slot.includes(slot) : value.slot === slot)
				pf2eSlots.push(pf2eSlot)
		}

		const selectedItem = await Dialogs.selectItem(this.token, (item) => {
			if (!['weapon', 'equipment', 'armor'].includes(item.type))
				return false
			const usageType = item.system.usage.type
			if (slot === 'hand1' || slot === 'hand2')
				return usageType === 'held'
			else
				return pf2eSlots.includes(item.system.usage.where)
		})

		console.log(selectedItem)
	}

	_slotLeftClick(event) {
		const {item, slot} = event?.currentTarget?.dataset
		console.log("Left : " + item + " " + slot)
	}
	
	_takeAction(event) {
		const dataset = event?.currentTarget?.dataset
		const itemId = dataset?.item, action = dataset?.action, slot = dataset?.slot
		if (!itemId || !action || !this.token) return

		event.stopPropagation()
		game.MKS.inventoryManager[action](this.token, itemId, slot).then()
	}
	
	async getData(options = {}) {
		let data = super.getData()
		
		const selected = game.MKS.ensureOneSelected(false)
		if (!selected) return data
		this.token = selected
		
		let equipments = selected.actor.getFlag(SYSTEM.moduleId, "equipments")
		if (!equipments)
			equipments = await game.MKS.inventoryManager.equipments(this.token)
		
		data.token = {id: selected.id, name: selected.name, img: selected.document.texture.src}
		data.equipments = {}
		Object.keys(equipments).forEach(slot => {
			const itemId = equipments[slot]
			if (!itemId) return
			const item = selected.actor.items.find(i => i.id === itemId)
			const investable = item.system.traits.value.includes('invested')
			data.equipments[slot] = {img: item.img, name: item.name, id: itemId, invested: investable ? !!item.system.equipped.invested : null}
		})
		
		console.log(data)
		return data
	}
}