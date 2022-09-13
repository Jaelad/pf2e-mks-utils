import {default as i18n} from "../../lang/pf2e-helper.js"
import Compendium from "../compendium.js"
import $$strings from "../../utils/strings.js"

export default class DCHelper {
	static determineDcByLevel(tokenOrActor) {
		const actor = tokenOrActor?.actor ?? tokenOrActor

		let dcByLevel = actor.level < 20 ? Math.floor(actor.level / 3) + 14 + actor.level : actor.level * 2
		if (actor.rarity === 'uncommon')
			dcByLevel += 2
		else if (actor.rarity === 'rare')
			dcByLevel += 5
		else if (actor.rarity === 'unique')
			dcByLevel += 10
		else
			return dcByLevel
	}

	static determineSpellDcByLevel(spell) {
		const rarity = spell.data.data.traits.rarity
		const level = spell.level
		const table = [15,18,20,23,26,28,31,34,36,39]

		let dcByLevel = table[level]
		if (rarity === 'uncommon')
			dcByLevel += 2
		else if (rarity === 'rare')
			dcByLevel += 5
		else if (rarity === 'unique')
			dcByLevel += 10
		else
			return dcByLevel
	}

	static setDC(action, defaultDC = 20, title) { //"PF2E.MKS.Dialog.SetDC.Title"
		const compendium = Compendium['ACTION_' + $$strings.underscored(action)]
		const actionTitle = i18n.action(action)
		title = title ?? actionTitle
		return new Promise(resolve => {
			const compendiumOnClick = compendium ? `game.MKS.compendiumToChat(null, '${compendium}', 'blindroll')` : ''
			const dialogContent = `
			<form>
			<div class="form-group">
				<button type="button" onclick="${compendiumOnClick}" style="margin-left: 30px; margin-right: 5px">
					<label>${i18n.$("PF2E.MKS.DC") + ': ' + actionTitle + ' '}</label>
					<i class="fas fa-head-side-cough"></i>
				</button>
				<input type="number" name="dc" value="${defaultDC}" maxlength="2" size="2" style="margin-left: 5px; margin-right: 30px">
			</div>
			</form>
			`
			new Dialog({
				title: i18n.$(title),
				content: dialogContent,
				buttons: {
					yes: {
						icon: '<i class="fas fa-fist-raised"></i>',
						label: i18n.$("PF2E.MKS.UI.Actions.ok"),
					}
				},
				default: "yes",
				close: ($html) => {
					const dc = parseInt($html[0].querySelector('[name="dc"]').value, 10) ?? defaultDC
					resolve({dc})
				}
			}).render(true)
		})
	}

	static requestGmSetDC({action, title, defaultDC= 20}) {
		if (game.user.isGM)
			return DCHelper.setDC(action, defaultDC, title)
		else {
			game.MKS.socketHandler.emit('SetDC', {action, title, defaultDC}, true)
			return game.MKS.socketHandler.waitFor('SetDCResponse', 20000)
		}
	}
}