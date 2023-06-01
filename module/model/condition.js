import Item from "./item.js"

export default class Condition extends Item {
	constructor(tokenOrActor, condition, filter = (c) => condition === c.slug) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		const cond = actor.itemTypes.condition.find(filter)
		super(actor, cond)
		this.slug = condition
	}
	
	async ensure() {
		if (!this.exists) {
			const conditionNew = game.pf2e.ConditionManager.getCondition(condition).toObject()
			await actor.createEmbeddedDocuments("Item", [conditionNew])
			this.item = actor.itemTypes.condition.find(c => conditionNew._id === c.id)
		}
	}
	
	get isValued() {
		return this.pf2e?.system.value.isValued
	}
	
	get value() {
		return this.pf2e?.system.value.value
	}
	
	async setValue(value, increment = false) {
		if (this.isValued) {
			let lastValue = increment ? this.value + value : value
			if (lastValue > 0)
				return game.pf2e.ConditionManager.updateConditionValue(this.item.id, this.actor, lastValue)
			else
				return this.purge()
		}
	}
	
	static async purgeAll(tokenOrActor, conditionSlugs) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		conditionSlugs = Array.isArray(conditionSlugs) ? conditionSlugs : [conditionSlugs]
		const ids = actor.itemTypes.condition.find(c => conditionSlugs.includes(c.slug)).map(c => c.id)
		if (ids.length > 0)
			return actor.deleteEmbeddedDocuments("Item", ids)
	}
	
	/*
	async setFlags(flags) {
		const updates = {_id: this.pf2e.id}
		for (let flagKey in flags) {
			updates["flags." + flagKey] = flags[flagKey]
		}
		return this.actor.updateEmbeddedDocuments("Item", [updates])
	}
	*/
}