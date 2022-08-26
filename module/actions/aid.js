import MksUtils from "../mks-utils.js"
import Action from "../action.js"
import Compendium from "../compendium.js"

export default class ActionAid extends Action {

	checkTypeToLabel(checkType) {
		if (checkType.startsWith("strike"))
			return MksUtils.i18n("pf2e.mks.checkType.strike") + " (" + checkType.substring(7, checkType.length - 1).toUpperCase() + ")"
		return MksUtils.i18n("pf2e.mks.checkType." + checkType)
	}

	readyAid() {
		const willAid = this._.ensureOneSelected()
		const willBeAided = this._.ensureOneTarget()

		const checkTypes = this._.getCheckTypes(willAid.actor).filter(ct => ct.indexOf("-lore") == -1)

		const dialogContent = `
		<form>
		<div class="form-group">
			<label>${MksUtils.i18n("pf2e.mks.dialog.aid.ready.select")}</label>
			<select name="checkType">
				${checkTypes.map((c) =>
					`<option value="${c}" ${
						"perception" === c ? 'selected' : ''
					}>${MksUtils.escapeHtml(this.checkTypeToLabel(c))}</option>`,
				).join('')}
			</select>
		</div>
		</form>
		`
		new Dialog({
			title: MksUtils.i18n("pf2e.mks.dialog.aid.ready.title"),
			content: dialogContent,
			buttons: {
				no: {
					icon: '<i class="fas fa-times"></i>',
					label: MksUtils.i18n("pf2e.mks.ui.actions.cancel"),
				},
				yes: {
					icon: '<i class="fas fa-hands-helping"></i>',
					label: MksUtils.i18n("pf2e.mks.dialog.aid.ready.yesaction"),
					callback: ($html) => {
						const checkType = $html[0].querySelector('[name="checkType"]').value
						const mksFlagData = {}
						mksFlagData[willAid.id] = {checkType}
						this.effectManager.setEffect(willBeAided, Compendium.EFFECT_AID_READY, {flags: {"mks.aid": mksFlagData}}).then()
					},
				},
			},
			default: 'yes',
		}).render(true)
	}

	setDC(effect) {
		const dialogContent = `
		<form>
		<div class="form-group">
			<label>${MksUtils.i18n("pf2e.mks.dc")}</label>
			<input type="number" name="dc" value="20">
		</div>
		</form>
		`
		const doSetDC = (dc) => {
			for (let tokenId in effect.data.flags.mks?.aid) {
				if (!effect.data.flags.mks.aid[tokenId].dc) {
					effect.data.flags.mks.aid[tokenId].dc = dc
					break
				}
			}
			this.effectManager.setEffect(effect.actor, effect.sourceId,{flags:{"mks.aid": effect.data.flags.mks.aid}}).then()
		}

		new Dialog({
			title: MksUtils.i18n("pf2e.mks.dialog.setdc.title"),
			content: dialogContent,
			buttons: {
				yes: {
					icon: '<i class="fas fa-hands-helping"></i>',
					label: MksUtils.i18n("pf2e.mks.ui.actions.ok"),
					callback: ($html) => {doSetDC(parseInt($html[0].querySelector('[name="dc"]').value, 10) ?? 20)}
				}
			},
			close: ($html) => {doSetDC(20)}
		}).render(true);
	}

	async receiveAid() {
		const token = this._.ensureOneSelected()
		const effect = this.effectManager.getEffect(token.actor, Compendium.EFFECT_AID_READY)
		if (!effect)
			return

		const aid = effect.data.flags?.mks?.aid
		const aidTokens = Object.keys(aid)
		const getTokenById = this._.getTokenById

		if (aidTokens.length === 1) {
			const config = aid[aidTokens[0]]
			const helperToken = getTokenById(aidTokens[0])
			if (helperToken?.actor) {
				const promises = this._.simpleCheckRoll.checkStatic([helperToken], config.checkType, null, config.dc)
				const roll = await Object.values(promises)[0]
				let bonus = roll.data.degreeOfSuccess - 1
				if (bonus !== 0)
					this.effectManager.setEffect(token, Compendium.EFFECT_AIDED, {changes: {"data.rules[0].value": bonus}}).then()
			}
			this.effectManager.removeEffect(token, Compendium.EFFECT_AID_READY).then()
		}
		else if (aidTokens.length > 1) {
			const dialogContent = `
				<form>
				${aidTokens.map((tokenId) =>
						`
						<div class="form-group">
							<label>${getTokenById(tokenId).name}</label>
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
				let bonus
				for (let helperTokenId in checkedAids) {
					const config = aid[helperTokenId]
					const helperToken = getTokenById(helperTokenId)
					if (helperToken?.actor) {
						const promises = this._.simpleCheckRoll.checkStatic([helperToken], config.checkType, null, config.dc)
						promisesAll.push(Object.values(promises)[0])
					}
				}
				for (let i=0; i<promisesAll.length; i++) {
					const roll = await promisesAll[i]
					bonus += (roll.data.degreeOfSuccess - 1)
				}

				if (bonus !== 0)
					this.effectManager.setEffect(token, Compendium.EFFECT_AIDED, {changes:{"data.rules[0].value": bonus}}).then()
			}

			new Dialog({
				title: MksUtils.i18n("pf2e.mks.dialog.receiveaid.title"),
				content: dialogContent,
				buttons: {
					yes: {
						icon: '<i class="fas fa-hands-helping"></i>',
						label: MksUtils.i18n("pf2e.mks.ui.actions.ok"),
						callback
					}
				}
			}).render(true)
		}
	}
}
