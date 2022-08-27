import MksUtils from "../mks-utils.js"
import Action from "../action.js"
import Compendium from "../compendium.js"
import $$arrays from "../../utils/arrays.js"

export default class ActionSeek extends Action {

	seek(options = {}) {
		const seeker = this._.ensureOneSelected()

		const templateCallback = (template) => {
			console.log(this._.templateManager.getEncompassingTokens(template))
			if (template.author.isGM)
				this._.templateManager.deleteTemplate(template.id)
		}

		const dialogContent = `
		<form>
		<div class="form-group">
			<select name="seekType">
				<option value="front_cone" selected>${MksUtils.i18n("pf2e.mks.dialog.seek.type.frontcone")}</option>
				<option value="front_burst" >${MksUtils.i18n("pf2e.mks.dialog.seek.type.frontburst")}</option>
				<option value="object" >${MksUtils.i18n("pf2e.mks.dialog.seek.type.object")}</option>
			</select>
		</div>
		</form>
		`

		new Dialog({
			title: MksUtils.i18n("pf2e.mks.dialog.seek.selecttype.title"),
			content: dialogContent,
			buttons: {
				yes: {
					icon: '<i class="far fa-eye"></i>',
					label: MksUtils.i18n("PF2E.Actions.Seek.Title"),
					callback: ($html) => {
						const seekType = $html[0].querySelector('[name="seekType"]').value

						let override = {}
						if (seekType === 'front_burst')
							override = {t: "circle", distance: 15, ttype: "ghost"}
						else if (seekType === 'object')
							override = {t: "circle", distance: 10}
						this._.templateManager.draw(seeker, templateCallback, {preset: 'seek'}, override)
					}
				}
			}
		}).render(true)
	}
}