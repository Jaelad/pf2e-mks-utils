import {default as i18n} from "../../lang/pf2e-i18n.js"
import Action from "../action.js"
import Compendium from "../compendium.js"
import Check from "../check.js"
import $$strings from "../../utils/strings.js"
import CommonUtils from "../helpers/common-utils.js"

export default class ActionAid extends Action {
	
	readyAid() {
		const {applicable, selected, targeted} = this.isApplicable('readyAid', true)
		if (!applicable) return

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
						this.effectManager.setEffect(targeted, Compendium.EFFECT_AID_READY, {flags: {"mks.aid": mksFlagData}}).then()
					},
				},
			},
			default: 'yes',
		}).render(true)
	}

	async receiveAid() {
		const {applicable, selected} = this.isApplicable('receiveAid', true)
		if (!applicable) return
		const effect = this.effectManager.getEffect(selected, Compendium.EFFECT_AID_READY)

		const checkContext = {
			actionGlyph: "R",
			rollOptions: ["action:aid"],
			extraOptions: ["action:aid"],
			checkType: null,
			askGmForDC: {
				action: 'receiveAid',
				title: i18n.action('ReceiveAid'),
				defaultDC: 20
			}
		}

		const aid = effect.flags?.mks?.aid
		const aidTokens = Object.keys(aid)

		if (aidTokens.length === 1) {
			const config = aid[aidTokens[0]]
			const helperToken = CommonUtils.getTokenById(aidTokens[0])
			if (helperToken?.actor) {
				checkContext.checkType = config.checkType
				const check = new Check(checkContext)
				const {roll} = await check.roll(helperToken)
				if (!roll) return
				const proficiency = await Check.getProficiency(helperToken, config.checkType)
				let degreeOfSuccess = roll.data.degreeOfSuccess
				let bonus = degreeOfSuccess === 3 ? Math.max(2, proficiency.rank) : degreeOfSuccess - 1
				if (bonus !== 0)
					this.effectManager.setEffect(selected, Compendium.EFFECT_AIDED, {changes: {"system.rules[0].value": bonus}}).then()
			}
			this.effectManager.removeEffect(selected, Compendium.EFFECT_AID_READY).then()
		}
		else if (aidTokens.length > 1) {
			const dialogContent = `
				<form>
				${aidTokens.map((tokenId) =>
						`
						<div class="form-group">
							<label>${CommonUtils.getTokenById(tokenId).name}</label>
							<input name="${tokenId}" type="checkbox">
						</div>
						`
					).join('')}
				</form>
				`
			const callback = async ($html) => {
				const checkedAids = {}
				for (let aidTokenId in aid) {
					const checked = $html[0].querySelector('[name="' + aidTokenId + '"]').checked
					if (checked)
						checkedAids[aidTokenId] = aid[aidTokenId]
				}
				const promisesAll = []
				let bonus = 0
				for (let helperTokenId in checkedAids) {
					const config = aid[helperTokenId]
					const helperToken = CommonUtils.getTokenById(helperTokenId)
					if (helperToken?.actor) {
						checkContext.checkType = config.checkType
						const check = new Check(checkContext)
						const {roll} = await check.roll(helperToken)
						promisesAll.push(roll)
					}
				}
				for (let i = 0; i < promisesAll.length; i++) {
					const roll = await promisesAll[i]
					bonus += ((roll?.data?.degreeOfSuccess ?? 1) - 1)
				}

				if (bonus !== 0)
					this.effectManager.setEffect(selected, Compendium.EFFECT_AIDED, {changes:{"system.rules[0].value": bonus}}).then()
			}

			new Dialog({
				title: i18n.$("PF2E.MKS.Dialog.receiveaid.title"),
				content: dialogContent,
				buttons: {
					yes: {
						icon: '<i class="fas fa-hands-helping"></i>',
						label: i18n.$("PF2E.MKS.UI.Actions.ok"),
						callback
					}
				}
			}).render(true)
		}
	}

	methods(onlyApplicable) {
		const methods = []
		if (!onlyApplicable || this.isApplicable('receiveAid').applicable) {
			methods.push({
				method: "receiveAid",
				label: i18n.action("receiveAid"),
				icon: "systems/pf2e/icons/spells/heartbond.webp",
				action: 'A',
				mode: "encounter",
				tags: ['basic']
			})
		}
		if (!onlyApplicable || this.isApplicable( 'readyAid').applicable) {
			methods.push({
				method: "readyAid",
				label: i18n.action("aid"),
				icon: "systems/pf2e/icons/spells/efficient-apport.webp",
				action: 'A',
				mode: "encounter",
				tags: ['basic']
			})
		}
		return methods
	}

	isApplicable(method, warn = false) {
		const selected = this._.ensureOneSelected(warn)
		const aidReadied = !!selected && this.effectManager.hasEffect(selected, Compendium.EFFECT_AID_READY)

		if (method === 'readyAid') {
			const targeted = this._.ensureOneTarget(null, warn)
			return {applicable: !!selected && !!targeted
					&& selected.id !== targeted.id
					&& selected.actor.alliance === targeted.actor.alliance, selected, targeted}
		}
		else if (method === 'receiveAid')
			return {applicable: aidReadied, selected}
	}
}
