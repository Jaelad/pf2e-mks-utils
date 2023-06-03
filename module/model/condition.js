import Item from "./item.js"
import {ATTITUDES, AWARENESS} from "../constants.js"

export const UUID_UNNOTICED = "Compendium.pf2e.conditionitems.9evPzg9E6muFcoSk"
export const UUID_UNDETECTED = "Compendium.pf2e.conditionitems.VRSef5y1LmL2Hkjf"
export const UUID_HIDDEN = "Compendium.pf2e.conditionitems.iU0fEDdBp3rXpTMC"
export const UUID_OBSERVED = "Compendium.pf2e.conditionitems.1wQY3JYyhMYeeV2G"

export default class Condition extends Item {
	constructor(tokenOrActor, condition, filter = ((c) => condition === c.slug)) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		const cond = condition.type === 'condition' ? condition : actor.itemTypes.condition.find(filter)
		super(actor, cond)
		this.condition = condition
	}
	
	async ensure() {
		if (!this.exists) {
			const conditionNew = game.pf2e.ConditionManager.getCondition(this.condition).toObject()
			await this.actor.createEmbeddedDocuments("Item", [conditionNew])
			this.item = this.actor.itemTypes.condition.find(c => conditionNew._id === c.id)
		}
	}
	
	get isValued() {
		return this.item?.system.value.isValued
	}
	
	get value() {
		return this.item?.system.value.value
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
		const ids = actor.itemTypes.condition.filter(c => conditionSlugs.includes(c.slug))?.map(c => c.id)
		if (ids?.length > 0)
			return actor.deleteEmbeddedDocuments("Item", ids)
	}
	
	static hasAny(tokenOrActor, conditionSlugs) {
		conditionSlugs = Array.isArray(conditionSlugs) ? conditionSlugs : [conditionSlugs]
		const actor = tokenOrActor?.actor ?? tokenOrActor
		return !!actor.itemTypes.condition.find(c => conditionSlugs.includes(c.slug))
	}
	
	static hasAll(tokenOrActor, conditionSlugs) {
		conditionSlugs = Array.isArray(conditionSlugs) ? conditionSlugs : [conditionSlugs]
		const actor = tokenOrActor?.actor ?? tokenOrActor
		
		const filtered = actor.itemTypes.condition.filter(c => conditionSlugs.includes(c.slug))
		return filtered.length === conditionSlugs.length
	}
	
	static collect(tokenOrActor, conditionSlugs = []) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		return conditionSlugs.map(slug => new Condition(actor, slug))
	}
}

export class ExclusiveConditions {
	constructor(tokenOrActor, states, defaultState) {
		this.actor = tokenOrActor?.actor ?? tokenOrActor
		this.states = states
		this.conditions = states.filter(c => !c.includes(defaultState))
		this.defaultState = defaultState
	}
	
	get state() {
		const conds = Condition.collect(this.actor, this.conditions)
		let active = null
		for (const cond of conds) {
			if (active)
				cond.purge().then()
			else if (cond.exists) {
				active = cond
			}
		}
		
		return active?.slug ?? this.defaultState
	}
	
	get stateIndex() {
		const state = this.state
		return this.states.indexOf(state)
	}
	
	findIndex(state) {
		return this.states.indexOf(state)
	}
	
	async setState(slug) {
		slug = typeof slug === 'number' ? this.states[slug] : slug
		if (this.states.includes(slug)) {
			await Condition.purgeAll(this.actor, this.conditions)
			if (slug !== this.defaultState)
				await new Condition(this.actor, slug).ensure()
		}
	}
}

export class Awareness extends ExclusiveConditions {
	constructor(tokenOrActor) {
		super(tokenOrActor, AWARENESS, 'observed')
	}

	async setState(slug) {
		super.setState(slug).then(() => {
			game.MKS.encounterManager.syncRelativeConds(this.actor.combatant)
		})
	}

	async setStateAsync(slug) {
		super.setState(slug)
	}
}

export class Attitude extends ExclusiveConditions {
	constructor(tokenOrActor) {
		super(tokenOrActor, ATTITUDES, 'indifferent')
	}

	async setState(slug) {
		super.setState(slug).then(() => {
			game.MKS.encounterManager.syncRelativeConds(this.actor.combatant)
		})
	}

	async setStateAsync(slug) {
		super.setState(slug)
	}
}
