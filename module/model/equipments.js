import $$objects from "../../utils/objects.js"
import {SYSTEM} from "../constants.js"
import Effect, { EFFECT_GRABBING } from "./effect.js"
import Equipment from "./equipment.js"
import HandableEquipment from "./handable.js"

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
	'collar': {exclusive: false, slot: 'necklace'},
	'bracers': {exclusive: false, slot: 'bracers'},
	'wrist': {exclusive: false, slot: 'bracers'},
	'epaulet': {exclusive: true, slot: 'shoulders'}
}

export default class Equipments {
	constructor(tokenOrActor) {
		this.actor = tokenOrActor?.actor ?? tokenOrActor

		const slots = /* this.actor.getFlag(SYSTEM.moduleId, "equipments") ??*/ {
			armor: null, head :null, legs :null, feet: null,
			hand1: null, hand2: null, gloves: null, bracers: null,
			cloak: null, belt: null, necklace: null, shoulders: null,
			ring1: null, ring2: null
		}
		const handables = HandableEquipment.collectAsMap(tokenOrActor, true)
		const shields = $$objects.filter(handables, (h => h.isShield))
		const weapons = $$objects.filter(handables, (h => h.isWeapon))

		const updates = []
		let leftHand, rightHand

		const twohandedEquipped = Object.values(weapons).find(w => w.handsEquipped == 2)?.id
		if (twohandedEquipped) {
			leftHand = rightHand = twohandedEquipped
		}
		for (const itemId in weapons) {
			const weapon = weapons[itemId], handsEquipped = weapon.handsEquipped
			if (twohandedEquipped == itemId)
				continue

			if ((leftHand && rightHand) || ((leftHand || rightHand) && handsEquipped == 2)) 
				updates.push(weapon.getUnequipUpdateObject())
			else if (!leftHand) {
				leftHand = itemId
			}
			else if (!rightHand) {
				rightHand = itemId
			}
		}
		for (const itemId in shields) {
			if (rightHand)
				updates.push(shields[itemId].getUnequipUpdateObject())
			else {
				rightHand = itemId
			}
		}

		for (const itemId in handables) {
			const handable = handables[itemId], handsEquipped = handable.handsEquipped
			if (handable.isShield || handable.isWeapon)
				continue
			if ((leftHand && rightHand)) 
				updates.push(handable.getUnequipUpdateObject())
			else if (handsEquipped == 2 && (!leftHand || !rightHand)) {
				if (leftHand) {
					const prevEqp = HandableEquipment.byOwner(this.actor, leftHand)
					updates.push(prevEqp.getUnequipUpdateObject())
				}
				else if (rightHand) {
					const prevEqp = HandableEquipment.byOwner(this.actor, rightHand)
					updates.push(prevEqp.getUnequipUpdateObject())
				}
				leftHand = rightHand = itemId
			}
			else if (!leftHand) {
				leftHand = itemId
			}
			else if (!rightHand) {
				rightHand = itemId
			}
			else
				updates.push(handable.getUnequipUpdateObject())
		}

		slots.hand1 = leftHand
		slots.hand2 = rightHand
		const worns = Equipment.collectAsMap(tokenOrActor, 'worn', true)
		for (const itemId in worns) {
			const worn = worns[itemId]
			let unequip = false
			const slotUsage = SLOT_USAGES[worn.usage.where]
			if (!slotUsage) continue
			if (Array.isArray(slotUsage.slot)) {
				let slotted = false
				for (let i = 0; i < slotUsage.slot.length; i++) {
					if (slotted) break
					if (!slots[slotUsage.slot[i]]) {
						slots[slotUsage.slot[i]] = worn.id
						slotted = true
					}
				}
				unequip = !slotted
			}
			else {
				if (slots[slotUsage.slot])
					unequip = slotUsage.exclusive
				else
					slots[slotUsage.slot] = worn.id
			}
			
			if (unequip)
				updates.push(worn.getUnequipUpdateObject())
		}

		if (updates.length > 0)
			this.actor.updateEmbeddedDocuments("Item", updates).then()
		this.actor.unsetFlag(SYSTEM.moduleId, 'equipments').then(() => {
			this.actor.setFlag(SYSTEM.moduleId, "equipments", slots).then()
		})
		this.equipments = slots
	}

	get description() {
		const description = {}
		Object.keys(this.equipments).forEach(slot => {
			const itemId = this.equipments[slot]
			if (itemId) {
				const item = this.actor.items.find(i => i.id === itemId)
				if (item) {
					const investable = item.system.traits.value.includes('invested')
					description[slot] = {img: item.img, name: item.name, id: itemId, invested: investable ? !!item.system.equipped.invested : null}
					if (slot == 'hand2' && this.equipments.hand1 === this.equipments.hand2)
						description[slot].secondHand = true
					if (item.type == 'weapon' && (!!item.system.traits?.value?.find(t => t.startsWith('two-hand')) || item.system.usage.value == 'held-in-one-plus-hands'))
						description[slot].grip = item.system.equipped.handsHeld
 				}
			}
		})

		return description
	}

	// {carryType: dropped/worn/held, handsHeld: 0/1/2, invested:null, true, false}
	async changeItemEquipped(itemId, equipped) {
		return this.actor.updateEmbeddedDocuments("Item", [{"_id": itemId, "system.equipped": equipped}])
	}

	async dropItem(itemId) {
		return this.changeItemEquipped(itemId, {carryType: 'dropped', handsHeld: 0})
	}

	get handsFree() {
		const heldItems = this.actor.inventory.filter((i) => i.system.consumableType?.value === 'ammo' ? false : i.isHeld)
		const handsFree = heldItems.reduce((count, item) => {
			const handsOccupied = item.traits.has("free-hand") ? 0 : item.handsHeld
			return Math.max(count - handsOccupied, 0)
		}, 2)
		const grabbing = new Effect(this.actor, EFFECT_GRABBING).exists

		return Math.max(0, Math.max(handsFree - (grabbing ? 1 : 0), 0))
	}
	
	hasAny(items) {
		return this.actor.itemTypes.equipment.filter(e => items.includes(e.slug))
	}

	get heldItems() {
		return this.actor.inventory.filter((i) => i.isHeld)
	}

	hasEquippedAny(items) {
		const handsFree = this.handsFree
		const inv = this.hasAny(items)
		return inv.filter(e => { 
			if ([EQU_HEALERS_TOOLS, EQU_HEALERS_TOOLS_EXPANDED, EQU_THVS_TOOLS, EQU_ALCHEMISTS_TOOLS].includes(e.slug))
				return (e.carryType === 'worn' && handsFree > 0) || e.handsHeld === 2
			
			return e.isEquipped
		})
	}
	
	weaponWieldedWithTraits(traits, all = true) {
		return this.actor.itemTypes.weapon.find((w => {
			if (!w.isEquipped)
				return false
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