import {default as i18n} from "../../lang/pf2e-i18n.js"
import {SYSTEM} from "../constants.js"
import BasePanel from "./base-panel.js"
import $$strings from "../../utils/strings.js"
import CommonUtils from "../helpers/common-utils.js"

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
		html.find("a[data-action=refresh]").click((event) => {
			game.MKS.inventoryManager.equipments(this.token).then(() => {
				EquipmentsPanel.rerender()
			})
			event.stopPropagation()
		})
		html.find("[data-token]").click((event) =>	game.MKS.inventoryManager.openCharacterSheet(this.token))
	}
	
	_takeAction(event) {
		const dataset = event?.currentTarget?.dataset
		const itemId = dataset?.item, action = dataset?.action, slot = dataset?.slot
		if (!itemId || !action || !this.token) return
		
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