export default class $$lang {
	static async sleep(msec) {
		return new Promise(resolve => setTimeout(resolve, msec))
	}
	
	static instanceOf (obj, className) {
		let o = obj.__proto__
		while(o) {
			if (o.constructor.name === className) return true
			o = o.__proto__
		}
		return false
	}
	
	static isFunction(obj) {
		return !!(obj && obj.constructor && obj.call && obj.apply)
	}
}