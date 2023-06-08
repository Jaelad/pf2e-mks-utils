import {default as i18n} from "../../lang/pf2e-i18n.js"
import {SimpleAction} from "../action.js"
import Check from "../check.js"
import CommonUtils from "../helpers/common-utils.js"
import Effect, { EFFECT_AIDED, EFFECT_AID_READY } from "../model/effect.js"

export default class ActionReceiveAid extends SimpleAction {
	
	constructor(MKS) {
		super(MKS, {action: 'receiveAid',
			icon: "systems/pf2e/icons/spells/heartbond.webp",
			tags: ['basic'],
			actionGlyph: 'A',
			requiresEncounter: true,
		})
	}
	
	async act(engagement, options) {}
	
	async apply(engagement) {
		const selected = engagement.initiator
		
		const aidReady = new Effect(selected, EFFECT_AID_READY)
		
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
		
		const aid = aidReady.getFlag("aid")
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
				let degreeOfSuccess = roll.degreeOfSuccess
				let bonus = degreeOfSuccess === 3 ? Math.max(2, proficiency.rank) : degreeOfSuccess - 1
				if (bonus !== 0)
					new Effect(selected, EFFECT_AIDED).ensure({"system.rules[0].value": bonus}).then()
			}
			aidReady.purge().then()
		}
		else if (aidTokens.length > 1) {
			const dialogContent =
				`
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
				for (const aidTokenId in aid) {
					const checked = $html[0].querySelector('[name="' + aidTokenId + '"]').checked
					if (checked && aid.hasOwnProperty(aidTokenId))
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
					new Effect(selected, EFFECT_AIDED).ensure({"system.rules[0].value": bonus}).then()
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
}
