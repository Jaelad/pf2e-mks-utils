import Equipment from "./equipment.js"

export default class HandableEquipment extends Equipment {
	constructor(item) {
		super(item)
		if (item.system?.usage?.type !== 'held' || !([1,2].includes(item.system.usage.hands)))
			this.item = null
	}

	get isShield() {
		return this.item.type === 'armor'
	}
	
	get handsHolding() {
		const usage = this.item.system.usage
		return usage.hands
	}
	
	get handsUsing() {
		const usage = this.item.system.usage
		const plusHands = usage.value === 'held-in-one-plus-hands'

		return plusHands ? 2 : usage.hands
	}

	get twoHandUsable() {
		return  !!this.item.system.traits.find(t => t.startsWith('two-hand'))
	}

	async changeGrip() {
		const item = this.item
		if (!item || !item.isEquipped) return
		
		const hands = this.handsEquipped
		if (hands === 1) 
			return item.update({"system.equipped.handsHeld": 2})
		else if (hands === 2) 
			return item.update({"system.equipped.handsHeld": 1})
	}

	get handsEquipped() {
		return this.item.system.equipped.carryType == 'held' ? this.item.system.equipped.handsHeld : 0
	}

	getUnequipUpdateObject() {
		return {"_id": this.item.id, "system.equipped.carryType": 'worn', "system.equipped.handsHeld": 0}
	}

	getEquipUpdateObject(hands) {
		hands = Math.min(this.handsHolding, hands)
		return {"_id": this.item.id, "system.equipped.carryType": 'held', "system.equipped.handsHeld": hands}
	}

	static byOwner(tokenOrActor, itemId) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		const item = actor.items.find(i => i.id === itemId)
		return new HandableEquipment(item)
	}

	static collect(tokenOrActor) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		return actor.items.filter(item => item?.system?.usage?.type === 'held' && [1,2].includes(item.system.usage.hands)).map(i => new HandableEquipment(i))
	}

	static collectAsMap(tokenOrActor, equipped) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		return actor.items.filter(item => (equipped == null || item.isEquipped === equipped) && item.system?.usage?.type === 'held' && [1,2].includes(item.system.usage.hands))
			.reduce((m, i) => Object.assign(m, { [i.id]: new HandableEquipment(i) }), {})
	}

	static collectAsMapGrouped(tokenOrActor) {
		const actor = tokenOrActor?.actor ?? tokenOrActor

		for (const item of actor.items) {
			if (item?.system?.usage?.type === 'held' && [1,2].includes(item.system.usage.hands)) {
				result[item.type][item.id] = new HandableEquipment(item)
			}
		}
		return result
	}

}