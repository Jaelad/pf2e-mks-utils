import Item from "./item.js"
import disarm from "../actions/disarm.js"

export default class Effect extends Item {
	constructor(tokenOrActor, effect) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		const eff = actor.itemTypes.effect.find((c) => "effect-" + effect === c.slug)
		super(actor, eff)
		this.effect = effect
	}
	
	async ensure(changes) {
		if (!this.exists) {
			const effectData = (await fromUuid(Effect.EFFECTS[this.effect])).toObject()
			
			for (let change in changes) {
				const val = changes[change]
				eval("effectData." + change + "=" + val)
			}
			this.item = await this.actor.createEmbeddedDocuments("Item", [effectData])
		}
	}
	
	get hasBadge() {
		return this.badgeValue > 0
	}
	
	get badgeValue() {
		return this.item?.system.badge?.value
	}
	
	get duration() {
		return this.item?.system.duration
	}
	
	async setBadgeValue(value, modType) {
		if (!this.exists)
			await this.ensure()
		const updates = {_id: this.item.id}
		
		switch (modType) {
			case "inc": {
				if (this.hasBadge)
					updates["system.badge.value"] = this.badgeValue + value
				break
			}
			case "multiply": {
				if (this.hasBadge)
					updates["system.badge.value"] = this.badgeValue * value
				break
			}
			default: {
				if (this.hasBadge)
					updates["system.badge.value"] = value
				else
					updates["system.badge"] = {type: "counter", value: value}
			}
		}
		return this.actor.updateEmbeddedDocuments("Item", [updates])
	}
	
	static EFFECTS = {
		"multiple-attack-penalty": "Compendium.pf2e-tools-mks.core-effects.DPVfUT43aCQMvauJ",
		"aid-ready": "Compendium.pf2e-tools-mks.core-effects.p9PSILLD0f0NkBc5",
		"aided": "Compendium.pf2e-tools-mks.core-effects.lgOBZWFDOE9xIXzS",
		"grabbing": "Compendium.pf2e-tools-mks.core-effects.gAMtcNpDb57hxSrC",
		"cover": "Compendium.pf2e-tools-mks.core-effects.SSVgCBCgk98E2VpI",
		"cover-taken": "Compendium.pf2e-tools-mks.core-effects.U7wkXUO0YGVkKNRA",
		"raise-a-shield": "Compendium.pf2e.equipment-effects.2YgXoHvJfrDHucMr",
		"disarm-success": "Compendium.pf2e.equipment-effects.z3ATL8DcRVrT0Uzt",
		"resist-a-diversion": "Compendium.pf2e-tools-mks.core-effects.GK9OckuuNDJFdFDe",
		"immune-to-demoralize": "Compendium.pf2e-tools-mks.core-effects.0mPMeOFZfos07cut",
		"poison-treated": "Compendium.pf2e-tools-mks.core-effects.9CucVXo0BT77gw2h",
		"disease-treated": "Compendium.pf2e-tools-mks.core-effects.VhUYetlOZu2PQGQZ"
	}

	static EFFECT_MAP = "multiple-attack-penalty"
	static EFFECT_AID_READY = "aid-ready"
	static EFFECT_AIDED = "aided"
	static EFFECT_GRABBING = "grabbing"
	static EFFECT_COVER = "cover"
	static EFFECT_COVER_TAKEN = "cover-taken"
	static EFFECT_RAISE_A_SHIELD = "raise-a-shield"
	static EFFECT_DISARM_SUCCESS = "disarm-success"
	static EFFECT_RESIST_A_DIVERSION = "resist-a-diversion"
	static EFFECT_IMMUNE_TO_DEMORALIZE = "immune-to-demoralize"
	static EFFECT_POISON_TREATED = "poison-treated"
	static EFFECT_DISEASE_TREATED = "disease-treated"
	
	static collect(tokenOrActor, effectSlugs = []) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		return effectSlugs.map(slug => new Effect(actor, slug))
	}
}

export class RelativeEffect extends Effect {
	constructor(tokenOrActor, effect) {
		super(tokenOrActor, effect)
	}

	async ensure(changes) {
		super.ensure(changes).then(() => {
			game.MKS.encounterManager.syncRelativeConds(this.actor.combatant)
		})
	}

	async purge() {
		super.purge().then(() => {
			game.MKS.encounterManager.syncRelativeConds(this.actor.combatant)
		})
	}

	async setBadgeValue(value, modType) {
		super.setBadgeValue(value, modType).then(() => {
			game.MKS.encounterManager.syncRelativeConds(this.actor.combatant)
		})
	}
}