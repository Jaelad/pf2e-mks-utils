import {default as i18n} from "../../lang/pf2e-helper.js"

export default class DCHelper {
	static setDC(defaultDC = 11, title = i18n.$('PF2E.MKS.Dialog.SetDC.Title')) { //"PF2E.MKS.Dialog.SetDC.Title"
		return new Promise(resolve => {
			const dialogContent = `
			<form>
			<div class="form-group">
				<label>${i18n.$("PF2E.MKS.DC")}</label>
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
						label: i18n.$("PF2E.MKS.UI.Actions.ok"),
					}
				},
				default: "yes",
				close: ($html) => {
					const dc = parseInt($html[0].querySelector('[name="dc"]').value, 10) ?? defaultDC
					resolve({dc})
				}
			}).render(true)
		})
	}

	static requestGmSetDC({action = this?.constructor?.name, title, defaultDC= 11}) {
		if (game.user.isGM)
			return DCHelper.setDC(defaultDC, title)
		else {
			game.MKS.socketHandler.emit('SetDC', {action, title, defaultDC}, true)
			return game.MKS.socketHandler.waitFor('SetDCResponse', 20000)
		}
	}
}