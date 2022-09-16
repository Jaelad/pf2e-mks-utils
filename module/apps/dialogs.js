import {default as i18n} from "../../lang/pf2e-helper.js"
import $$strings from "../../utils/strings.js";
import Check from "../check.js";
import Compendium from "../compendium.js";

export default class Dialogs  {

	static addModifier(title = 'PF2E.MKS.Dialog.AddModifier.Title') {
		const dialogContent = `
		<form>
		<div class="add-modifier-panel">
            <input type="text" name="label" class="add-modifier-name" placeholder="${i18n.$('PF2E.MKS.Dialog.AddModifier.Label')}">
            <select class="add-modifier-type" name="type">
                <option value="untyped" selected>${i18n.modifierType('untyped')}</option>
				<option value="circumstance">${i18n.modifierType('circumstance')}</option>
				<option value="status">${i18n.modifierType('status')}</option>
            </select>
            <input type="text" name="bonus" class="add-modifier-value" placeholder="+1">
        </div>
		</form>
		`
		return new Promise((resolve) => {
			new Dialog({
				title: i18n.$(title),
				content: dialogContent,
				buttons: {
					yes: {
						icon: '<i class="fas fa-plus"></i>',
						label: i18n.uiAction("add"),
						callback: ($html) => {
							const label = $html[0].querySelector('[name="label"]').value
							const type = $html[0].querySelector('[name="type"]').value
							const bonus = parseInt($html[0].querySelector('[name="bonus"]').value, 10)
							resolve(new game.pf2e.Modifier({
								label,
								type,
								modifier: bonus
							}))
						},
					},
				},
				default: 'yes',
				close: () => resolve(null)
			}).render(true)
		})
	}

	static selectOne(elems, selectLabel, labelFunc, valueFunc, title = 'PF2E.MKS.Dialog.SelectOne.Title') {
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
					// 	label: i18n.$("PF2E.MKS.UI.Actions.cancel"),
					// },
					yes: {
						icon: '<i class="fas fa-check-circle"></i>',
						label: i18n.uiAction('ok'),
						callback: ($html) => {
							const selectedValue = $html[0].querySelector('[name="' + uuid + '"]').value
							resolve(selectedValue)
						},
					},
				},
				default: 'yes',
				close: () => resolve(null)
			}).render(true)
		})
	}

	static multipleButtons(elems, label, title = 'PF2E.MKS.Dialog.MultipleButtons.Title') {
		const dialogContent = `
		<form>
		<div class="form-group">
			<label>${i18n.$(label)}</label>
		</div>
		</form>
		`

		return new Promise((resolve) => {
			const buttons = {}
			elems.forEach((e, i) => {
				buttons['_' + i] = {
					icon: '<i class="fas fa-dot-circle"></i>',
					label: i18n.$(e.name),
					callback: () => resolve(e.value)
				}
			})

			new Dialog({
				title: i18n.$(title),
				content: dialogContent,
				buttons,
				default: '_0',
				close: () => resolve(null)
			}).render(true)
		})
	}
}