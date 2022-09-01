export default class Action {
	constructor(MKS) {
		this._ = MKS
		this.effectManager = MKS.effectManager
	}

	initialize() {

	}

	methods() {
		return []
	}

	isApplicable(method = null, warn= false) {
		// return {applicable, selected, targeted}
	}

}