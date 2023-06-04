import Item from "./item.js"
import Condition from "./condition.js"

export const PERSISTENT_BLEED = "bleed"
export const PERSISTENT_POISON = "poison"

export default class PersistentDamage extends Condition {
	constructor(tokenOrActor, damageType) {
		super(tokenOrActor, "persistent-damage", (c) => "persistent-damage" === c.slug && c.system.persistent.damageType === damageType)
		this.damageType = damageType
	}
	
	async ensure(formula, dc) {
		if (!this.exists) {
			const damageType = this.damageType
			const baseConditionSource = game.pf2e.ConditionManager.getCondition("persistent-damage").toObject()
			const persistentSource = mergeObject(baseConditionSource, {
				system: {
					persistent: { formula, damageType, dc }
				},
			})
			await actor.createEmbeddedDocuments("Item", [persistentSource])
			this.item = actor.itemTypes.condition.find(c => "persistent-damage" === c.slug && c.system.persistent.damageType === damageType)
		}
		return this
	}
	
	get formula() {
		return this.item?.system.persistent.formula
	}
	
	get dc() {
		return this.item?.system.persistent.dc
	}

	static hasAny(tokenOrActor, damageTypes) {
		damageTypes = Array.isArray(damageTypes) ? damageTypes : [damageTypes]
		const actor = tokenOrActor?.actor ?? tokenOrActor
		return !!actor.itemTypes.condition.find(c => c.slug === 'persistent-damage' && damageTypes.includes(c.system.persistent.damageType))
	}
}