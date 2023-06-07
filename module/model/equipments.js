import {default as LOG} from "../../utils/logging.js"
import {SYSTEM} from "../constants.js"
import Effect, { EFFECT_GRABBING } from "./effect.js"

export const EQU_HEALERS_TOOLS = "healers-tools" 
export const EQU_HEALERS_TOOLS_EXPANDED = "healers-tools-expanded"
export const EQU_THVS_TOOLS = "thieves-tools"
export const EQU_ALCHEMISTS_TOOLS = "alchemists-tools"

export const UUID_EQUIPMENTS = {
	"healers-tools": "Compendium.pf2e.equipment-srd.s1vB3HdXjMigYAnY",
	"healers-tools-expanded": "Compendium.pf2e.equipment-srd.SGkOHFyBbzWdBk8D",
}

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

export default class Equipments {
	constructor(tokenOrActor) {
		this.actor = tokenOrActor?.actor ?? tokenOrActor
		const items = this.actor.items

		const slots =  {
			armor: null, head :null, legs :null, feet: null,
			hand1: null, hand2: null, gloves: null, bracers: null,
			cloak: null, belt: null, necklace: null, shoulders: null,
			ring1: null, ring2: null
		}
		slots.armor = this.actor.wornArmor?.id
		slots.hand2 = this.actor.heldShield?.id
		const weapons = items.filter(i => i.type === 'weapon' && i.isEquipped)
		const itemsEquipped = items.filter(i => i.type === 'equipment' && i.isEquipped)
		const updates = []
		
		for (let i = 0; i < weapons.length; i++) {
			if (!slots.hand1)
				slots.hand1 = weapons[i].id
			else if (!slots.hand2)
				slots.hand2 = weapons[i].id
			else
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
					updates.push({"_id": eqp.id, "system.equipped.inSlot": false})
			}
		}
		if (updates.length > 0)
			this.actor.updateEmbeddedDocuments("Item", updates).then()
		
		const equipments = {
			armor: slots.armor ?? null, head: slots.head ?? null, legs: slots.legs ?? null, feet: slots.feet ?? null,
			hand1: slots.hand1 ?? null, hand2: slots.hand2 ?? null, gloves: slots.gloves ?? null, bracers: slots.bracers ?? null,
			cloak: slots.cloak ?? null, belt: slots.belt ?? null, necklace: slots.necklace ?? null, shoulders: slots.shoulders ?? null,
			ring1: slots.ring1 ?? null, ring2: slots.ring2 ?? null
		}
		if (equipments.hand1 === equipments.hand2)
			equipments.hand2 = null
		if (equipments.ring1 === equipments.ring2)
			equipments.ring2 = null
		this.actor.setFlag(SYSTEM.moduleId, "equipments", equipments).then()
		this.equipments = equipments
	}

	handsFree() {
		const heldItems = this.actor.inventory.filter((i) => i.system.consumableType?.value === 'ammo' ? false : i.isHeld)
		const handsFree = heldItems.reduce((count, item) => {
			const handsOccupied = item.traits.has("free-hand") ? 0 : item.handsHeld
			return Math.max(count - handsOccupied, 0)
		}, 2)
		const grabbing = new Effect(this.actor, EFFECT_GRABBING).exists

		return Math.max(0, Math.max(handsFree - (grabbing ? 1 : 0), 0))
	}
	
	hasAny(items) {
		return !!this.actor.itemTypes.equipment.find(e => items.includes(e.slug))
	}

	hasEquippedAny(items) {
		const handsFree = this.handsFree()
		const inv = this.hasAny(items)
		return inv.filter(e => { 
			if ([EQU_HEALERS_TOOLS, EQU_HEALERS_TOOLS_EXPANDED, EQU_THVS_TOOLS, EQU_ALCHEMISTS_TOOLS].includes(e.slug))
				return (e.carryType === 'worn' && handsFree > 0) || e.handsHeld === 2
			
			return e.isEquipped
		})
	}
	
	wieldsWeaponWithTraits(traits, all = true) {
		return this.actor.itemTypes.weapon.find((w => {
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
	
}