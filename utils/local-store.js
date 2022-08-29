import {default as LOG} from "./logging.js"

export default class LocalStore {
	localSave(key, value, actor = null) {
		const storeKey = (actor ? actor.id + "/" : "") + key
		const storeValue = JSON.stringify(value)
		localStorage.setItem(storeKey, storeValue)
		LOG.info("Store: " + storeKey + ":" + storeValue)
	}

	localLoad(key, actor = null) {
		const storeKey = (actor ? actor.id + "/" : "") + key
		const storeValue = localStorage.getItem(storeKey)
		return JSON.parse(storeValue)
	}

	localDelete(key, actor = null) {
		const storeKey = (actor ? actor.id + "/" : "") + key
		localStorage.removeItem(storeKey)
	}
}