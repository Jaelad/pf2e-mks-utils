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
			})
		}
	}

	async toogle() {
		if (this.exists)
			return this.purge()
		else
			return this.ensure()
	}

	static hasAny(tokenOrActor, slugs) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		slugs = Array.isArray(slugs) ? slugs : [slugs]
		return !!actor.items.find(i => slugs.includes(i.slug))
	}
	
	static hasAll(tokenOrActor, slugs) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		slugs = Array.isArray(slugs) ? slugs : [slugs]
		
		const filtered = actor.items.filter(i => slugs.includes(i.slug))
		return filtered.length === conditionSlugs.length
	}

	static async purgeAll(tokenOrActor, slugs = []) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		slugs = Array.isArray(slugs) ? slugs : [slugs]
		const ids = actor.items.filter(i => slugs.includes(i.slug))?.map(i => i.id)
		if (ids?.length > 0)
			return actor.deleteEmbeddedDocuments("Item", ids)
	}
}