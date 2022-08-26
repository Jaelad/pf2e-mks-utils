export default class Action {
	constructor(MKS) {
		this._ = MKS
		this.effectManager = MKS.effectManager
	}

	isPossible() {
		return true
	}
}