import Compendium from "./compendium.js"
import MksUtils from "./mks-utils.js";

export default class EffectManager {
	constructor(MKS) {
		this._ = MKS
	}

	getEffect(tokenOrActor, sourceId) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		return actor.itemTypes?.effect.find((e) => e.flags.core?.sourceId === sourceId)
	}

	async setEffect(tokenOrActor, sourceId, {badgeMod, flags, changes} = {}) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		const existingEffect = this.getEffect(tokenOrActor, sourceId)
		if (existingEffect) {
			const updates = {_id: existingEffect.id}
			const badge = existingEffect.system?.badge
			if (badgeMod && badge && badge.type === 'counter' && badge.value > 0) {
				const newBadgeValue = badgeMod?.value ? value : (badgeMod?.increment ? badgeMod.increment + badge.value : null)
				if (newBadgeValue < 1 && badgeMod?.removeIfZero) {
					return await existingEffect.delete()
				}
				else if (newBadgeValue !== null)
					updates["data.badge"] = {type: "counter", value: newBadgeValue}
				//await actor.updateEmbeddedDocuments("Item", [{ _id: existingEffect.id, "data.badge": {type:"counter", value: existingEffect.system.badge.value + 1} }])
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
			for (let change in changes) {
				const val = changes[change]
				eval("effectData." + change + "=" + val)
			}
			return await actor.createEmbeddedDocuments("Item", [effectData])
		}
	}

	async removeEffect(tokenOrActor, sourceId) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		const existingEffect = this.getEffect(actor, sourceId)
		if (existingEffect)
			return await existingEffect.delete()
	}

	getCondition(tokenOrActor, conditionSlug) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		return actor.itemTypes.condition.find(c => c.slug === conditionSlug)
	}

	async setCondition(tokenOrActor, conditionSlug, {badgeMod, flags} = {}) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		let condition = this.getCondition(actor, conditionSlug)

		let promise = new Promise(() => condition)
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

	removeCondition(actor, conditionSlug) {
		const condition = this.getCondition(actor, conditionSlug)
		if (condition)
			return game.pf2e.ConditionManager.removeConditionFromActor(condition.id, actor)
	}

	test() {
		const token = this._.ensureOneSelected()

		this.setCondition(token, 'prone').then(condition => {
			MksUtils.info(condition)
		})

		this.setCondition(token, 'grabbed', {flags: {"mks.grapple": {test: 1}}}).then((condition) => {
			MksUtils.info(condition)
		})

		this.setCondition(token, 'frightened', {badgeMod: {value: 2}, flags: {"mks.grapple": {test: 1}}}).then(condition => {
			MksUtils.info(condition)
		})

		this.setCondition(token, 'clumsy', {badgeMod: {value: 3}}).then(condition => {
			MksUtils.info(condition)
		})
	}

}