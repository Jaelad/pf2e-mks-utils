import {default as i18n} from "../lang/pf2e-helper.js"
import $$strings from "../utils/strings.js"

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

	setDC(callback, defaultDC = 11, title = `PF2E.Actions.${this.constructor.name.substring(6)}.Title`) { //"pf2e.mks.dialog.setdc.title"
		const dialogContent = `
		<form>
		<div class="form-group">
			<label>${i18n.$("pf2e.mks.dc")}</label>
			<input type="number" name="dc" value="${defaultDC}">
		</div>
		</form>
		`
		new Dialog({
			title: i18n.$(title),
			content: dialogContent,
			buttons: {
				yes: {
					icon: '<i class="fas fa-fist-raised"></i>',
					label: i18n.$("pf2e.mks.ui.actions.ok"),
				}
			},
			default: "yes",
			close: ($html) => {
				const dc = parseInt($html[0].querySelector('[name="dc"]').value, 10) ?? defaultDC
				callback(dc)
			}
		}).render(true);
	}

	requestGmSetDC({action = this?.constructor?.name, title, defaultDC= 11}, callback) {
		if (game.user.isGM)
			this.setDC(callback, defaultDC, title)
		else {
			this._.socketHandler.emit('SetDC', {action, title, defaultDC}, true)
			this._.socketHandler.waitFor('SetDCResponse', 20000).then(callback)
		}
	}
}