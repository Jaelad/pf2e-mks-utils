import {default as i18n} from "../../lang/pf2e-i18n.js"
import {SimpleAction} from "../action.js"
import Check from "../check.js"
import $$strings from "../../utils/strings.js"
import Effect, { EFFECT_AID_READY } from "../model/effect.js"

export default class ActionReadyAid extends SimpleAction {
	
	constructor(MKS) {
		super(MKS, {action: 'readyAid',
			icon: "systems/pf2e/icons/spells/efficient-apport.webp",
			tags: ['basic'],
			actionGlyph: 'A',
			targetCount: 1,
			requiresEncounter: true,
			opposition: 'ally',
		})
	}
	
	async apply(engagement) {
		const selected = engagement.initiator, targeted = engagement.targeted
		const checkTypes = Check.getCheckTypes(selected.actor).filter(ct => ct.indexOf("-lore") === -1)
		
		const dialogContent = `
		<form>
		<div class="form-group">
			<label>${i18n.$("PF2E.MKS.Dialog.aid.ready.select")}</label>
			<select name="checkType">
				${checkTypes.map((c) =>
			`<option value="${c}" ${
				"perception" === c ? 'selected' : ''
			}>${$$strings.escapeHtml(Check.checkTypeToLabel(c))}</option>`,
		).join('')}
			</select>
		</div>
		</form>
		`
		new Dialog({
			title: i18n.$("PF2E.MKS.Dialog.aid.ready.title"),
			content: dialogContent,
			buttons: {
				no: {
					icon: '<i class="fas fa-times"></i>',
					label: i18n.$("PF2E.MKS.UI.Actions.cancel"),
				},
				yes: {
					icon: '<i class="fas fa-hands-helping"></i>',
					label: i18n.$("PF2E.MKS.Dialog.aid.ready.yesaction"),
					callback: ($html) => {
						const checkType = $html[0].querySelector('[name="checkType"]').value
						const mksFlagData = {}
						mksFlagData[selected.id] = {checkType}
						const aidReady = new Effect(targeted, EFFECT_AID_READY)
						aidReady.ensure().then( () => {
							aidReady.setFlag("aid", mksFlagData).then()
						})
					},
				},
			},
			default: 'yes',
		}).render(true)
	}
}
