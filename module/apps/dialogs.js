import {default as i18n} from "../../lang/pf2e-helper.js"
import $$strings from "../../utils/strings.js";
import Check from "../check.js";
import Compendium from "../compendium.js";

export default class Dialogs  {

	static selectOne(elems, labelFunc, valueFunc, selectLabel, title = 'pf2e.mks.dialog.selectone.title') {
		const uuid = $$strings.generateUUID()
		let selectedItem = true
		const dialogContent = `
		<form>
		<div class="form-group">
			<label>${i18n.$(selectLabel)}</label>
			<select name="${uuid}">
				${elems.map((e) =>
					`<option value="${valueFunc?.(e) ?? e.value}" ${selectedItem ? 'selected' : ''} ${selectedItem = false}>${$$strings.escapeHtml(labelFunc ? labelFunc(e) : e.name)}</option>`
				).join('')}
			</select>
		</div>
		</form>
		`
		return new Promise((resolve) => {
			new Dialog({
				title: i18n.$(title),
				content: dialogContent,
				buttons: {
					// no: {
					// 	icon: '<i class="fas fa-times"></i>',
					// 	label: i18n.$("pf2e.mks.ui.actions.cancel"),
					// },
					yes: {
						icon: '<i class="fas fa-check-circle"></i>',
						label: i18n.$("pf2e.mks.dialog.selectone.yes"),
						callback: ($html) => {
							const selectedValue = $html[0].querySelector('[name="' + uuid + '"]').value
							resolve(selectedValue)
						},
					},
				},
				default: 'yes',
				close: (e) => {
					console.log(e)
				}
			}).render(true)
		})
	}
}