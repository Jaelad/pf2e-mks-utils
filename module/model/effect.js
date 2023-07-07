import Item from "./item.js"
import disarm from "../actions/disarm.js"

export const EFFECT_MAP = "multiple-attack-penalty"
export const EFFECT_AID_READY = "aid-ready"
export const EFFECT_AIDED = "aided"
export const EFFECT_GRABBING = "grabbing"
export const EFFECT_COVER = "cover"
export const EFFECT_COVER_TAKEN = "cover-taken"
export const EFFECT_RAISE_A_SHIELD = "raise-a-shield"
export const EFFECT_DISARM_SUCCESS = "disarm-success"
export const EFFECT_RESIST_A_DIVERSION = "resist-a-diversion"
export const EFFECT_IMMUNE_TO_DEMORALIZE = "immune-to-demoralize"
export const EFFECT_POISON_TREATED = "poison-treated"
export const EFFECT_DISEASE_TREATED = "disease-treated"
export const EFFECT_MOUNTED = "mounted"

export const UUID_EFFECTS = {
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
	"disease-treated": "Compendium.pf2e-tools-mks.core-effects.VhUYetlOZu2PQGQZ",
	"mounted": "Compendium.pf2e.other-effects.Item.9c93NfZpENofiGUp",
}

export default class Effect extends Item {
	constructor(tokenOrActor, effect) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		const eff = actor.itemTypes.effect.find((c) => "effect-" + effect === c.slug)
		super(actor, eff)
		this.effect = effect
	}
	
	async ensure(changes) {
		if (!this.exists) {
			const effectData = (await fromUuid(UUID_EFFECTS[this.effect])).toObject()
			
			for (let change in changes) {
				const val = changes[change]
				eval("effectData." + change + "=" + val)
			}
			await this.actor.createEmbeddedDocuments("Item", [effectData])
			this.item = this.actor.itemTypes.effect.find((c) => "effect-" + this.effect === c.slug)
		}
		return this
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
					updates["system.badge"] = {type: "value", value: value}
			}
		}
		return this.actor.updateEmbeddedDocuments("Item", [updates])
	}

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