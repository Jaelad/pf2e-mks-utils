import {default as LOG} from "../utils/logging.js"
import Compendium from "./compendium.js"
import {SYSTEM} from "./constants.js"

export default class InventoryManager {
	constructor(MKS) {
		this._ = MKS
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
	
	async equipments(tokenOrActor) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		
		let armor, head, legs, feet,
			hand1, hand2, gloves, bracers,
			cloak, belt, necklace, shoulders,
			ring1, ring2
		armor = actor.wornArmor?.id
		hand2 = actor.heldShield?.id
		const weapons = actor.items.filter(i => i.type === 'weapon' && i.isEquipped)
		const itemsEquipped = actor.items.filter(i => i.type === 'equipment' && i.isEquipped)
		
		for (let i = 0; i < weapons.length; i++) {
			if (!hand1)
				hand1 = weapons[i].id
			else if (!hand2)
				hand2 = weapons[i].id
			else
				await weapons[i].update({"system.equipped.carryType": 'worn', "system.equipped.handsHeld": 0})
		}
		
		for (let i = 0; i < itemsEquipped.length; i++) {
			const eqp = itemsEquipped[i], usage = eqp.system.usage
			
			if (usage.type === 'held') {
				if (!hand1)
					hand1 = eqp.id
				else if (!hand2)
					hand2 = eqp.id
				else
					await weapons[i].update({"system.equipped.carryType": 'worn', "system.equipped.handsHeld": 0})
			}
			else if (usage.type === 'worn') {
				let unequip = false
				switch (usage.where) {
					case 'circlet':
					case 'crown':
					case 'headwear':
						head ? unequip = true : head = eqp.id; break;
					case 'clothing':
					case 'garment':
						legs ? unequip = false : legs = eqp.id; break;
					case 'shoes':
						feet ? unequip = true : feet = eqp.id; break;
					case 'belt':
						belt ? unequip = true : belt = eqp.id; break;
					case 'gloves':
						gloves ? unequip = true : gloves = eqp.id; break;
					case 'ring':
						!ring1 ? ring1 = eqp.id : !ring2 ? ring2 = eqp.id : unequip = false; break;
					case 'cloak':
						cloak ? unequip = true : cloak = eqp.id; break;
					case 'necklace':
					case 'amulet':
						necklace ? unequip = false : necklace = eqp.id; break;
					case 'bracers':
					case 'wrist':
						bracers ? unequip = false : bracers = eqp.id; break;
					case 'epaulet':
						shoulders ? unequip = true : shoulders = eqp.id; break;
				}
				if (unequip)
					await eqp.update({"system.equipped.inSlot": false})
			}
		}
		
		const equipments = {
			armor, head, legs, feet,
			hand1, hand2, gloves, bracers,
			cloak, belt, necklace, shoulders,
			ring1, ring2
		}
		await selected.actor.setFlag(SYSTEM.moduleId, "equipments", equipments)
		return equipments
	}

}