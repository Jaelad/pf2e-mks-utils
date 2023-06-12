export default class Equipment {
	constructor(item) {
		this.item = item
	}
	
	get id() {
		return this.item.id
	}

	get type() {
		return this.item.type
	}

	get isEquipped() {
		return this.item.isEquipped
	}

	get isWeapon() {
		return this.item.type === 'weapon'
	}

	get isArmor() {
		return this.item.type === 'armor'
	}

	get isEquipment() {
		return this.item.type === 'equipment'
	}

	get usage() {
		return this.item.system.usage
	}

	async equip() {
		const item = this.item
		if (!item || item.isEquipped) return

		const container = item.system.containerId ? {"system.containerId": null} : {}

		if (item.system.usage.type === 'held')
			return item.update({...container, "system.equipped.carryType": 'held', "system.equipped.handsHeld": item.system.usage.hands})
		else if (item.system.usage.type === 'worn' && item.system.usage.where)
			return item.update({...container, "system.equipped.carryType": 'worn'}).then(() => {
				item.update({"system.equipped.inSlot": true})
			})
		else if (item.system.usage.type === 'worn')
			return item.update({...container, "system.equipped.carryType": 'worn'})
	}

	async unequip() {
		const item = this.item
		if (!item || !item.isEquipped) return
		
		if (item.system.usage.type === 'held')
			return item.update({"system.equipped.carryType": 'worn', "system.equipped.handsHeld": 0})
		else if (item.system.usage.type === 'worn' && item.system.usage.where)
			return item.update({"system.equipped.inSlot": false})
		else if (item.system.usage.type === 'worn')
			return
	}

	async stow() {
		const item = this.item
		if (!item || !item.isEquipped) return

		const backpack = item.parent.items.find(i => i.type === 'backpack')
		if (backpack)
			return item.update({"system.containerId": backpack.id, "system.equipped.carryType": 'stowed', "system.equipped.handsHeld": 0, "system.equipped.invested": null})
	}

	async toggleInvested() {
		const item = this.item
		if (!item || !item.isEquipped) return
		
		if (!item.system.equipped.invested)
			return item.update({"system.equipped.invested": true})
		else if (item.system.equipped.invested === true)
			return item.update({"system.equipped.invested": false})
	}

	getUnequipUpdateObject() {
		return {"_id": this.item.id, "system.equipped.inSlot": false}
	}

	getEquipUpdateObject(hands) {
		return {"_id": this.item.id, "system.equipped.inSlot": true}
	}

	static byOwner(tokenOrActor, itemId) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		const item = actor.items.find(i => i.id === itemId)
		return new Equipment(item)
	}

	static collect(tokenOrActor, usageType = 'worn', equipped) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		return actor.items.filter(item => (equipped == null || item.isEquipped === equipped) && item.system?.usage?.type === usageType && (['weapon','armor','equipment'].includes(item.type))).map(i => new Equipment(i))
	}

	static collectAsMap(tokenOrActor, usageType = 'worn', equipped) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		return actor.items.filter(item => (equipped == null || item.isEquipped === equipped) && item.system?.usage?.type === usageType && (['weapon','armor','equipment'].includes(item.type)))
			.reduce((m, i) => Object.assign(m, { [i.id]: new Equipment(i) }), {})
	}
}