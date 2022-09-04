import {default as i18n} from "../lang/pf2e-helper.js"

export default class Action {

	constructor(MKS) {
		this._ = MKS
		this.effectManager = MKS.effectManager
	}

	initialize() {
	}

	methods(onlyApplicable) {
		return []
	}

	isApplicable(method = null, warn= false) {
		// return {applicable, selected, targeted}
	}


}