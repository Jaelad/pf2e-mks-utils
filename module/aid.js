import MksUtils from "./mks-utils.js"

const DEBUG = MksUtils.debug
const INFO = MksUtils.info
const WARN = MksUtils.warn
const ERROR = MksUtils.error
const I18N = MksUtils.i18n
const MKS = game["PF2E_Utils_MKS"]

export class ActionAid {

	static readyAid () {
		const subject = I18N("actions.aid.ready.dialog.subject")

		const actor = MKS._ensureOneActor()
		const willBeAided = MKS._ensureOneTarget()

		const checkTypes = MKS.getCheckTypes(actor).filter(ct => ct.indexOf("-lore") == -1)

		const dialog = `
		<form>
		<div class="form-group">
			<label>${subject}</label>
			<select name="checkType">
				${checkTypes
				.map(
					(c) =>
						`<option value="${c}" ${
							checkType === c ? 'selected' : ''
						}>${escapeHtml(I18N("utils.mks.checkType." + c))}</option>`,
				)
				.join('')}
			</select>
		</div>
		</form>
		`
	}
}
