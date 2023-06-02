import {default as LOG} from "../../utils/logging.js"
import {SYSTEM} from "../constants.js"

export default class Item {
	constructor(actor, pf2eItem) {
		this.actor = actor
		this.item = pf2eItem
	}
	
	get exists() {
		return !!this.item
	}
	
	get slug() {
		return this.item?.slug
	}
	
	getFlag(flag) {
		this.item.getFlag(SYSTEM.moduleId, flag)
	}
	
	async setFlag(flag, value) {
		return this.item.setFlag(SYSTEM.moduleId, flag, value)
	}
	
	async unsetFlag(flag) {
		return this.item.unsetFlag(SYSTEM.moduleId, flag)
	}
	
	async purge() {
		if (this.exists) {
			LOG.info("Purging [" + this.item.id + "] ...")
			return this.actor.deleteEmbeddedDocuments("Item", [this.item.id]).then(() => {
				this.item = null
				LOG.info("Purged!")
			})
		}
	}
}