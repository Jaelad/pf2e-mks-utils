import {default as LOG} from "../../utils/logging.js"
import {SYSTEM} from "../constants.js"
import CommonUtils from "../helpers/common-utils.js"

export default class ObjectColl {
	constructor(type, objects) {
		this.type
		this.objects = objects
	}
	
	serialize() {
		return {
			type: this.type,
			ids: this.objects.map(o => o.id)
		}
	}

	static deserialize(serialized) {
		let objects
		switch(serialized.type) {
			case 'token': objects = serialized.ids.map(id => CommonUtils.getTokenById(id)); break
			case 'actor': objects = serialized.ids.map(id => CommonUtils.getActorById(id)); break
		}
		return new Transmitter(serialized.type, objects)
	}
}