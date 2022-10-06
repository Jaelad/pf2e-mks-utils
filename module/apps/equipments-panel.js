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
	}
	
	async getData(options = {}) {
		let data = super.getData()
		
		const selected = game.MKS.ensureOneSelected(false)
		if (!selected) return data
		
		let equipments = selected.actor.getFlag(SYSTEM.moduleId, "equipments")
		if (!equipments)
			equipments = await game.MKS.inventoryManager.equipments(selected)
		data.equipments = equipments
		data.equipmentsData = {}
		
		Object.keys(equipments).forEach(slot => {
			const itemId = data.equipments[slot]
			const item = selected.actor.items.find(i => i.id === itemId)
			const investable = item.system.traits.value.includes('invested')
			data.equipmentsData[slot] = {img: item.img, name: item.name, id: itemId, invested: investable ? !!item.system.equipped.invested : null}
		})
		
		return data
	}
}