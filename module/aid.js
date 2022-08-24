import MksUtils from "./mks-utils.js";
import Compendium from "./compendium.js";

export default class ActionAid {

	constructor(MKS) {
		this._ = MKS
	}

	checkTypeToLabel(checkType) {
		if (checkType.startsWith("strike"))
			return MksUtils.i18n("utils.mks.checkType.strike") + " (" + checkType.substring(7, checkType.length - 1) + ")"
		return MksUtils.i18n("utils.mks.checkType." + checkType)
	}

	readyAid() {
		const willAid = this._._ensureOneSelected()
		const willBeAided = this._._ensureOneTarget()

		const checkTypes = this._.getCheckTypes(willAid.actor).filter(ct => ct.indexOf("-lore") == -1)



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
						const mksFlagData = {}
						mksFlagData[willAid.id] = {checkType}
						this._.incrementEffect(willBeAided.actor, Compendium.EFFECT_AID_READY, {"mks.aid": mksFlagData}).then()
					},
				},
			},
			default: 'yes',
		}).render(true);
	}

	setDC(effect) {
		const dialogContent = `
		<form>
		<div class="form-group">
			<label>${MksUtils.i18n("actions.aid.setdc.dialog.dc")}</label>
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
			this._.updateEffectFlags(effect.actor,effect.sourceId,{"mks.aid": effect.data.flags.mks.aid}).then()
		}

		new Dialog({
			title: MksUtils.i18n("actions.aid.setdc.dialog.title"),
			content: dialogContent,
			buttons: {
				yes: {
					icon: '<i class="fas fa-hands-helping"></i>',
					label: MksUtils.i18n("utils.mks.ui.actions.ok"),
					callback: ($html) => {doSetDC(parseInt($html[0].querySelector('[name="dc"]').value, 10) ?? 20)}
				}
			},
			close: ($html) => {doSetDC(20)}
		}).render(true);
	}

	async receiveAid() {
		const token = this._._ensureOneSelected()
		const effect = this._.getEffect(token.actor, Compendium.EFFECT_AID_READY)
		if (!effect)
			return

		const aid = effect.data.flags?.mks?.aid
		for (let helperTokenId in aid) {
			const config = aid[helperTokenId]
			const helperToken = game.scenes.active.tokens.get(helperTokenId)
			if (helperToken?.actor) {
				const promises = this._.checkStatic([helperToken], config.checkType, null, config.dc)
				let bonus = 0
				for (let tokenId in promises) {
					const roll = await promises[tokenId]
					switch (roll.data.degreeOfSuccess) {
						case 0: bonus -= 1; break
						case 1: break
						case 2: bonus += 1; break
						case 3: bonus += 2; break
					}
				}

				this._.incrementEffect(token.actor, Compendium.EFFECT_AIDED, null, {"data.rules[0].value": bonus}).then()
			}
		}
	}

}

