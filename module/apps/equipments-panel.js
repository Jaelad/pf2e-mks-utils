import {default as i18n} from "../../lang/pf2e-i18n.js"
import {SYSTEM} from "../constants.js"
import BasePanel from "./base-panel.js"
import {SLOT_USAGES} from "../inventory-manager.js"
import SelectItemDialog from "./select-item-dialog.js"

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
		html.contextmenu((event) => this._mainRightClick(event))
		html.find("a[data-action=refresh]").click((event) => {
			event.stopPropagation()
			game.MKS.inventoryManager.equipments(this.token).then(() => {
				EquipmentsPanel.rerender()
			})
		})
		html.find("[data-token]").click((event) => {
			event.stopPropagation()
			game.MKS.actorManager.openCharacterSheet(this.token, 'inventory')
		})
	}

	_mainRightClick(event) {
		event.stopPropagation()
		const x = event.pageX - $(event?.currentTarget).offset().left
		const y = event.pageY - $(event?.currentTarget).offset().top

		let inSlot
		for (const [slot, coor] of Object.entries(COORDINATES))
			if (x > coor.left && x < coor.left + coor.width && y > coor.top && y < coor.top + coor.height) {
				inSlot = slot
				break
			}
		if (inSlot)
			this._slotItemSelect(inSlot)
	}

	_slotRightClick(event) {
		event.stopPropagation()
		const {item, slot} = event?.currentTarget?.dataset

		this._slotItemSelect(slot, item)
	}

	_slotItemSelect(slot, itemId) {
		const pf2eSlots = []
		for (const [key, value] of Object.entries(SLOT_USAGES)) {
			if (Array.isArray(value.slot) ? value.slot.includes(slot) : value.slot === slot)
				pf2eSlots.push(key)
		}
		
		const equipedItems = Object.values(this.token.actor.flags?.[SYSTEM.moduleId]?.equipments ?? {})
		const items = this.token.actor.items.filter((item) => {
			const actor = item.parent
			if (equipedItems.includes(item.id))
				return false
			if (!['weapon', 'equipment', 'armor'].includes(item.type))
				return false
			const usageType = item.system.usage.type
			if (slot === 'hand1' || slot === 'hand2')
				return usageType === 'held'
			else
				return pf2eSlots.includes(item.system.usage.where)
		})
		if (items.length < 1) return
		
		SelectItemDialog.getItem({items, title: i18n.$$("PF2E.MKS.Dialog.Equipment.SelectItem", {slot: i18n.equipmentSlot(slot)})})
			.then((selectedItem) => {
				if (selectedItem === null)
					game.MKS.inventoryManager.unequip(this.token, itemId, slot).then()
				else if (selectedItem) {
					game.MKS.inventoryManager.unequip(this.token, itemId, slot).then( () => {
						game.MKS.inventoryManager.equip(this.token, selectedItem, slot).then()
					})
				}
			})
	}

	_slotLeftClick(event) {
		const {item} = event?.currentTarget?.dataset
		game.MKS.sheetToChat(this.token, this.token.actor.items.find(i => i.id === item)?.sheet)
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
		
		return data
	}
}

const COORDINATES = {
	armor: {
		left: 196,
		top: 162,
		width: 120,
		height: 120,
	},
	hand1: {
		left: 53,
		top: 287,
		width: 85,
		height: 85,
	},
	hand2: {
		left: 52,
		top: 414,
		width: 85,
		height: 85,
	},
	head: {
		left: 206,
		top: 37,
		width: 88,
		height: 88,
	},
	legs: {
		left: 215,
		top: 417,
		width: 84,
		height: 84,
	},
	feet: {
		left: 364,
		top: 428,
		width: 58,
		height: 58,
	},
	gloves: {
		left: 63,
		top: 164,
		width: 68,
		height: 68,
	},
	bracers: {
		left: 183,
		top: 323,
		width: 58,
		height: 58,
	},
	shoulders: {
		left: 63,
		top: 72,
		width: 68,
		height: 68,
	},
	cloak: {
		left: 370,
		top: 80,
		width: 58,
		height: 58,
	},
	necklace: {
		left: 369,
		top: 158,
		width: 58,
		height: 58,
	},
	belt: {
		left: 261,
		top: 323,
		width: 58,
		height: 58,
	},
	ring1: {
		left: 369,
		top: 233,
		width: 58,
		height: 58,
	},
	ring2: {
		left: 368,
		top: 310,
		width: 58,
		height: 58,
	}
}