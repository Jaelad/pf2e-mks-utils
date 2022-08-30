import {default as LOG} from "../utils/logging.js"
import Compendium from "./compendium.js"

export default class InventoryManager {
	constructor(MKS) {
		this._ = MKS
	}

	heldItems(tokenOrActor) {
		return Array.from(actor.items.values()).filter((i) => i.isHeld)
	}

	handsFree(tokenOrActor) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		const handsFree = actor.data.data.attributes.handsFree
		const grabbing = this._.effectManager.hasEffect(tokenOrActor, Compendium.EFFECT_GRABBING)

		return Math.max(0, handsFree - (grabbing ? 1 : 0))
	}

}