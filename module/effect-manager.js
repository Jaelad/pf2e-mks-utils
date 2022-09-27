import {default as LOG} from "../utils/logging.js"

export default class EffectManager {
	constructor(MKS) {
		this._ = MKS
	}

	getEffect(tokenOrActor, sourceIdOrSlug) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		return actor.itemTypes?.effect.find((e) => e.sourceId === sourceIdOrSlug || e.slug === sourceIdOrSlug)
	}

	hasEffect(tokenOrActor, sourceIdOrSlugs, any = true) {
		sourceIdOrSlugs = Array.isArray(sourceIdOrSlugs) ? sourceIdOrSlugs : [sourceIdOrSlugs]
		const actor = tokenOrActor?.actor ?? tokenOrActor

		if (any)
			return !!actor.itemTypes.effect.find(c => sourceIdOrSlugs.includes(c.sourceId) || sourceIdOrSlugs.includes(c.slug))
		else {
			const filtered = actor.itemTypes.effect.filter(c => sourceIdOrSlugs.includes(c.sourceId) || sourceIdOrSlugs.includes(c.slug))
			return filtered.length === sourceIdOrSlugs.length
		}
	}

	async setEffect(tokenOrActor, sourceId, {badgeMod, flags, changes} = {}) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		const existingEffect = this.getEffect(tokenOrActor, sourceId)
		if (existingEffect) {
			const updates = {_id: existingEffect.id}
			const badge = existingEffect.system?.badge
			if (badgeMod && badge && badge.type === 'counter' && badge.value > 0) {
				let newBadgeValue
				if (badgeMod.value)
					newBadgeValue = badgeMod.value
				else if (badgeMod.increment)
					newBadgeValue = badgeMod.increment + badge.value
				else if (badgeMod.multiply)
					newBadgeValue = badge.value * badgeMod.multiply

				if (newBadgeValue < 1 && badgeMod.removeIfZero)
					return await existingEffect.delete()
				else if (newBadgeValue !== null)
					updates["system.badge"] = {type: "counter", value: newBadgeValue}
			}
			for (let flagKey in flags) {
				updates["flags." + flagKey] = flags[flagKey]
			}
			return await actor.updateEmbeddedDocuments("Item", [updates])
		}
		else {
			const effect = await fromUuid(sourceId)
			const effectData = effect.toObject()
			for (let flagKey in flags) {
				effectData.flags[flagKey] = flags[flagKey]
			}
			if (badgeMod && badgeMod.value > 0 && effectData?.system?.badge?.type === 'counter' ) {
				effectData.system.badge.value = badgeMod.value
			}
			for (let change in changes) {
				const val = changes[change]
				eval("effectData." + change + "=" + val)
			}
			return await actor.createEmbeddedDocuments("Item", [effectData])
		}
	}

	async removeEffect(tokenOrActor, sourceIdOrSlug) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		const existingEffect = actor.itemTypes?.effect.find((e) => e.sourceId === sourceIdOrSlug || e.slug === sourceIdOrSlug)
		if (existingEffect)
			return await existingEffect.delete()
	}

	getCondition(tokenOrActor, conditionSlug) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		return actor.itemTypes.condition.find(c => c.slug === conditionSlug)
	}

	getConditions(tokenOrActor, conditionSlugs = []) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		return actor.itemTypes.condition.filter(c => conditionSlugs.includes(c.slug))
	}

	hasCondition(tokenOrActor, conditionSlugs, any = true) {
		conditionSlugs = Array.isArray(conditionSlugs) ? conditionSlugs : [conditionSlugs]
		const actor = tokenOrActor?.actor ?? tokenOrActor

		if (any)
			return !!actor.itemTypes.condition.find(c => conditionSlugs.includes(c.slug))
		else {
			const filtered = actor.itemTypes.condition.filter(c => conditionSlugs.includes(c.slug))
			return filtered.length === conditionSlugs.length
		}
	}

	async setCondition(tokenOrActor, conditionSlug, {badgeMod, flags} = {}) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		let condition = this.getCondition(actor, conditionSlug)

		//let promise = new Promise(() => condition)
		if (!condition)
			condition = await game.pf2e.ConditionManager.addConditionToActor(conditionSlug, actor)

		condition = await this.setBadge(condition, badgeMod)
		condition = await this.setConditionFlags(condition, flags)
		return condition
	}

	async setBadge(condition, badgeMod) {
		if (condition?.badge?.value > 0 && badgeMod) {
			const newBadgeValue = badgeMod.value ? badgeMod.value : (badgeMod.increment ? badgeMod.increment + condition.badge.value : null)
			if (newBadgeValue >= 0)
				await game.pf2e.ConditionManager.updateConditionValue(condition.id, condition.actor, newBadgeValue)
		}
		return condition
	}

	async setConditionFlags(condition, flags) {
		if (condition && flags) {
			const updates = {_id: condition.id}
			for (let flagKey in flags) {
				updates["flags." + flagKey] = flags[flagKey]
			}
			return await condition.actor.updateEmbeddedDocuments("Item", [updates])
		}
		return condition
	}

	removeCondition(tokenOrActor, conditionSlugs) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		const conditions = this.getConditions(actor, Array.isArray(conditionSlugs) ? conditionSlugs : [conditionSlugs])
		if (conditions.length > 0) {
			const ids = conditions.map(c => c.id)
			return game.pf2e.ConditionManager.removeConditionFromActor(ids, actor)
		}
	}

	test() {
		const token = this._.ensureOneSelected()

		this.setCondition(token, 'prone').then(condition => {
			LOG.info(condition)
		})

		this.setCondition(token, 'grabbed', {flags: {"mks.grapple": {test: 1}}}).then((condition) => {
			LOG.info(condition)
		})

		this.setCondition(token, 'frightened', {badgeMod: {value: 2}, flags: {"mks.grapple": {test: 1}}}).then(condition => {
			LOG.info(condition)
		})

		this.setCondition(token, 'clumsy', {badgeMod: {value: 3}}).then(condition => {
			LOG.info(condition)
		})
	}

}