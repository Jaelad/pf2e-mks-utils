import {default as LOG} from "../utils/logging.js"
import Compendium from "./compendium.js"
import {SYSTEM} from "./constants.js"
import EquipmentsPanel from "./apps/equipments-panel.js"
import $$lang from "../utils/lang.js"

export const SLOT_USAGES = {
	'armor': {exclusive: true, slot: 'armor'},
	'circlet': {exclusive: false, slot: 'head'},
	'crown': {exclusive: false, slot: 'head'},
	'headwear': {exclusive: false, slot: 'head'},
	'clothing': {exclusive: false, slot: 'legs'},
	'garment': {exclusive: false, slot: 'legs'},
	'shoes': {exclusive: true, slot: 'feet'},
	'belt': {exclusive: true, slot: 'belt'},
	'gloves': {exclusive: true, slot: 'gloves'},
	'ring': {exclusive: false, slot: ['ring1', "ring2"]},
	'cloak': {exclusive: true, slot: 'cloak'},
	'necklace': {exclusive: false, slot: 'necklace'},
	'amulet': {exclusive: false, slot: 'necklace'},
	'bracers': {exclusive: false, slot: 'bracers'},
	'wrist': {exclusive: false, slot: 'bracers'},
	'epaulet': {exclusive: true, slot: 'shoulders'}
}

export default class InventoryManager {
	constructor(MKS) {
		this._ = MKS
	}
	
	openCharacterSheet(token, tab) {
		const sheet = token.actor.sheet
		if ( sheet.rendered ) {
			sheet.maximize()
			sheet.bringToTop()
		}
		else
			sheet.render(true, {token: token.document})
		
		if (tab)
			setTimeout(() => sheet.activateTab(tab), 200)
	}

	heldItems(tokenOrActor) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		return Array.from(actor.items.values()).filter((i) => i.isHeld)
	}

	// {carryType: dropped/worn/held, handsHeld: 0/1/2, invested:null, true, false}
	async changeItemEquipped(tokenOrActorOrItem, itemId, equipped) {
		let item = tokenOrActorOrItem.carryType ? tokenOrActorOrItem : null, actor
		if (!item) {
			actor = tokenOrActorOrItem.actor ? tokenOrActorOrItem.actor : tokenOrActorOrItem
			return await actor.updateEmbeddedDocuments("Item", [{"_id": itemId, "system.equipped": equipped}])
		}
		else {
			return await item.update({ "system.equipped": equipped})
		}
	}

	async dropItem(tokenOrActorOrItem, itemId) {
		return await this.changeItemEquipped(tokenOrActorOrItem, itemId, {carryType: 'dropped', handsHeld: 0})
	}

	handsFree(tokenOrActor) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		const handsFree = actor.system.attributes.handsFree
		const grabbing = this._.effectManager.hasEffect(tokenOrActor, Compendium.EFFECT_GRABBING)

		return Math.max(0, handsFree - (grabbing ? 1 : 0))
	}

	wieldsWeaponWithTraits(tokenOrActor, traits, all = true) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		return actor.itemTypes.weapon.find((w => {
			const wTraits = w.system.traits.value
			if (all) {
				for (let i = 0; i < traits.length; i++) {
					if (!wTraits.includes(traits[i]))
						return false
				}
			}
			else {
				for (let i = 0; i < traits.length; i++) {
					if (wTraits.includes(traits[i]))
						return true
				}
			}
		}))
	}

	async equip(tokenOrActor, item, slot) {
		const actor = tokenOrActor?.actor ?? tokenOrActor

		if (!$$lang.instanceOf(item, 'PhysicalItemPF2e')) return
		
		if (item.system.usage.type === 'held')
			await item.update({"system.equipped.carryType": 'held', "system.equipped.handsHeld": item.system.usage.hands})
		else if (item.system.usage.type === 'worn' && item.system.usage.where)
			await item.update({"system.equipped.inSlot": true})
		else if (item.system.usage.type === 'worn')
			return
		
		if (slot) {
			const equipments = {}
			equipments[slot] = item.id
			actor.setFlag(SYSTEM.moduleId, "equipments", equipments).then(() => EquipmentsPanel.rerender())
		}
	}

	async unequip(tokenOrActor, itemId, slot) {
		const actor = tokenOrActor?.actor ?? tokenOrActor

		if (!itemId)
			itemId = actor.flags[SYSTEM.moduleId]?.equipments?.[slot]
		
		const item = actor?.items.find(i => i.id === itemId)
		if (!item || !item.isEquipped) return
		
		if (item.system.usage.type === 'held')
			await item.update({"system.equipped.carryType": 'worn', "system.equipped.handsHeld": 0})
		else if (item.system.usage.type === 'worn' && item.system.usage.where)
			await item.update({"system.equipped.inSlot": false})
		else if (item.system.usage.type === 'worn')
			;
		
		if (slot) {
			const equipments = {}
			equipments[slot] = null
			actor.setFlag(SYSTEM.moduleId, "equipments", equipments).then(() => EquipmentsPanel.rerender())
		}
	}
	
	async toggleInvested(tokenOrActor, itemId) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		
		const item = actor?.items.find(i => i.id === itemId)
		if (!item || !item.isEquipped) return
		
		if (item.system.equipped.invested === false)
			await item.update({"system.equipped.invested": true}).then(() => EquipmentsPanel.rerender())
		else if (item.system.equipped.invested === true)
			await item.update({"system.equipped.invested": false}).then(() => EquipmentsPanel.rerender())
	}
	
	async equipments(tokenOrActor) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		
		const slots =  {
			armor: null, head :null, legs :null, feet: null,
			hand1: null, hand2: null, gloves: null, bracers: null,
			cloak: null, belt: null, necklace: null, shoulders: null,
			ring1: null, ring2: null
		}
		slots.armor = actor.wornArmor?.id
		slots.hand2 = actor.heldShield?.id
		const weapons = actor.items.filter(i => i.type === 'weapon' && i.isEquipped)
		const itemsEquipped = actor.items.filter(i => i.type === 'equipment' && i.isEquipped)
		const updates = []
		
		for (let i = 0; i < weapons.length; i++) {
			if (!slots.hand1)
				slots.hand1 = weapons[i].id
			else if (!slots.hand2)
				slots.hand2 = weapons[i].id
			else
				//await weapons[i].update({"system.equipped.carryType": 'worn', "system.equipped.handsHeld": 0})
				updates.push({"_id": weapons[i].id, "system.equipped.carryType": 'worn', "system.equipped.handsHeld": 0})
		}
		
		for (let i = 0; i < itemsEquipped.length; i++) {
			const eqp = itemsEquipped[i], usage = eqp.system.usage
			
			if (usage.type === 'held') {
				if (!slots.hand1)
					slots.hand1 = eqp.id
				else if (!slots.hand2)
					slots.hand2 = eqp.id
				else
					//await eqp.update({"system.equipped.carryType": 'worn', "system.equipped.handsHeld": 0})
					updates.push({"_id": eqp.id, "system.equipped.carryType": 'worn', "system.equipped.handsHeld": 0})
			}
			else if (usage.type === 'worn') {
				let unequip = false
				const slotUsage = SLOT_USAGES[usage.where]
				if (!slotUsage) continue
				if (Array.isArray(slotUsage.slot)) {
					let slotted = false
					for (let i = 0; i < slotUsage.slot.length; i++) {
						if (slotted) break
						if (!slots[slotUsage.slot[i]]) {
							slots[slotUsage.slot[i]] = eqp.id
							slotted = true
						}
					}
					unequip = !slotted
				}
				else
					slots[slotUsage.slot] ? unequip = slotUsage.exclusive : slots[slotUsage.slot] = eqp.id
				
				if (unequip)
					// await eqp.update({"system.equipped.inSlot": false})
					updates.push({"_id": eqp.id, "system.equipped.inSlot": false})
			}
		}
		if (updates.length > 0)
			await actor.updateEmbeddedDocuments("Item", updates)
		
		const equipments = {
			armor: slots.armor ?? null, head: slots.head ?? null, legs: slots.legs ?? null, feet: slots.feet ?? null,
			hand1: slots.hand1 ?? null, hand2: slots.hand2 ?? null, gloves: slots.gloves ?? null, bracers: slots.bracers ?? null,
			cloak: slots.cloak ?? null, belt: slots.belt ?? null, necklace: slots.necklace ?? null, shoulders: slots.shoulders ?? null,
			ring1: slots.ring1 ?? null, ring2: slots.ring2 ?? null
		}
		await actor.setFlag(SYSTEM.moduleId, "equipments", equipments)
		return equipments
	}

}