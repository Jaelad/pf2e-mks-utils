export default class $$lang {
	static async sleep(msec) {
		return new Promise(resolve => setTimeout(resolve, msec))
	}
}