import {default as LOG} from "./logging.js"

export default class LocalStorage {
	static PREFIX = "MKS."

	static save(key, value, actor = null) {
		const storeKey = (actor ? actor.id + "/" : "") + key
		const storeValue = JSON.stringify(value)
		localStorage.setItem(LocalStorage.PREFIX + storeKey, storeValue)
		LOG.info("Store: " + storeKey + ":" + storeValue)
	}

	static load(key, actor = null) {
		const storeKey = (actor ? actor.id + "/" : "") + key
		const storeValue = localStorage.getItem(LocalStorage.PREFIX +storeKey)
		return JSON.parse(storeValue)
	}

	static delete(key, actor = null) {
		const storeKey = (actor ? actor.id + "/" : "") + key
		localStorage.removeItem(LocalStorage.PREFIX +storeKey)
	}
}