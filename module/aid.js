import MksUtils from "./mks-utils.js";

export default class ActionAid {

	constructor(MKS) {
		this._ = MKS
	}

	checkTypeToLabel(checkType) {
		if (checkType.startsWith("strike"))
			return MksUtils.i18n("utils.mks.checkType.strike") + " (" + checkType.substring(7, checkType.length - 1) + ")"
		return MksUtils.i18n("utils.mks.checkType." + checkType)
	}

	readyAid () {
		const actor = this._._ensureOneActor()
		const willBeAided = this._._ensureOneTarget()

		const checkTypes = this._.getCheckTypes(actor).filter(ct => ct.indexOf("-lore") == -1)



		const dialogContent = `
		<form>
		<div class="form-group">
			<label>${MksUtils.i18n("actions.aid.ready.dialog.select")}</label>
			<select name="checkType">
				${checkTypes
				.map(
					(c) =>
						`<option value="${c}" ${
							"perception" === c ? 'selected' : ''
						}>${MksUtils.escapeHtml(this.checkTypeToLabel(c))}</option>`,
				)
				.join('')}
			</select>
		</div>
		</form>
		`

		new Dialog({
			title: MksUtils.i18n("actions.aid.ready.dialog.title"),
			content: dialogContent,
			buttons: {
				no: {
					icon: '<i class="fas fa-times"></i>',
					label: MksUtils.i18n("utils.mks.ui.actions.cancel"),
				},
				yes: {
					icon: '<i class="fas fa-hands-helping"></i>',
					label: MksUtils.i18n("actions.aid.ready.dialog.yesaction"),
					callback: ($html) => {
						const checkType = $html[0].querySelector('[name="checkType"]').value
						this._._localSave("AID", {target: willBeAided.id, checkType})
					},
				},
			},
			default: 'yes',
		}).render(true);
	}
}

