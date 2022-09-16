import {default as LOG} from "../utils/logging.js"
import Compendium from "./compendium.js"

export default class ActorManager {
	constructor(MKS) {
		this._ = MKS
	}

	hpChange(tokenOrActor, change) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		const {max, value} = actor.data.data.attributes.hp
		if ((change > 0 && max === value) || (change < 0 && value === 0) || change === 0)
			return
		return actor.update({_id: actor.id, "data.attributes.hp.value": Math.min(max, Math.max(0, value + change))})
	}

}