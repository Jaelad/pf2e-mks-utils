import {default as LOG} from "../utils/logging.js"
import Compendium from "./compendium.js"

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
			return await actor.updateEmbeddedDocuments("Item", [{"_id": itemId, "data.equipped": equipped}])
		}
		else {
			return await item.update({ "data.equipped": equipped})
		}
	}

	async dropItem(tokenOrActorOrItem, itemId) {
		return await this.changeItemEquipped(tokenOrActorOrItem, itemId, {carryType: 'dropped', handsHeld: 0})
	}

	handsFree(tokenOrActor) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		const handsFree = actor.data.data.attributes.handsFree
		const grabbing = this._.effectManager.hasEffect(tokenOrActor, Compendium.EFFECT_GRABBING)

		return Math.max(0, handsFree - (grabbing ? 1 : 0))
	}

}