import {default as i18n} from "../../lang/pf2e-i18n.js"
import Compendium from "../compendium.js"
import $$strings from "../../utils/strings.js"

const adjustmentScale = [
	{name: "incredibly easy", dc: -10},
	{name: "very easy", dc: -5},
	{name: "easy", dc: -2},
	{name: "normal", dc: 0},
	{name: "hard", dc: 2},
	{name: "very hard", dc: 5},
	{name: "incredibly hard", dc: 10}
]

const simpleDCs = [
	{rank: "untrained", dc: 10},
	{rank: "trained", dc: 15},
	{rank: "expert", dc: 20},
	{rank: "master", dc: 30},
	{rank: "legendary", dc: 40},
]

export default class DCHelper {

	static calculateRollSuccess(roll, dc) {
		return DCHelper.calculateDegreeOfSuccess(roll.dice[0].total, roll.total, dc)
	}

	static calculateDegreeOfSuccess(die, rollTotal, dc) {
        if (rollTotal - dc >= 10) {
            return DCHelper.adjustDegreeByDieValue(3, die);
        }
		else if (dc - rollTotal >= 10) {
            return DCHelper.adjustDegreeByDieValue(0, die);
        }
		else if (rollTotal >= dc) {
            return DCHelper.adjustDegreeByDieValue(2);
        }

        return DCHelper.adjustDegreeByDieValue(1);
    }

	static adjustDegreeByDieValue(degree, dieResult) {
        if (dieResult === 20) {
            return Math.clamped(degree + 1, 0, 3)
        }
		else if (this.dieResult === 1) {
            return Math.clamped(degree - 1, 0, 3)
        }

        return degree;
    }

	static dcByLevel(level) {
		return level < 20 ? Math.floor(level / 3) + 14 + level : level * 2
	}
	
	static adjustDCByRarity(dc, rarity) {
		if (rarity === 'uncommon')
			return dc + 2
		else if (rarity === 'rare')
			return dc + 5
		else if (rarity === 'unique')
			return dc + 10
		else
			return dc
	}
	
	static calculateDC(level, rarity) {
		const dc = DCHelper.dcByLevel(level)
		return DCHelper.adjustDCByRarity(dc, rarity)
	}
	
	static calculateSimpleDC(rank) {
		if (typeof rank === 'number')
			return simpleDCs[rank].dc
		else if (typeof rank === 'string')
			return simpleDCs.find(dc => dc.rank === rank)?.dc ?? 10
		return 10
	}
	
	static calculateSpellDC(spell) {
		const rarity = spell.system.traits.rarity
		const level = spell.level
		const table = [15,18,20,23,26,28,31,34,36,39]

		let dcByLevel = table[level]
		return DCHelper.adjustDCByRarity(dcByLevel, rarity)
	}

	static getMaxDC(tokens, dcFunc) {
		if (!dcFunc || !tokens) return
		tokens = Array.isArray(tokens) ? tokens : [tokens]
		return tokens.reduce((p,v)=> {
			const dc = dcFunc(v)
			return p > dc ? p : dc
		}, 0)
	}

	static setDC(action, defaultDC = 20, title, challenger) { //"PF2E.MKS.Dialog.SetDC.Title"
		const compendium = Compendium['ACTION_' + $$strings.underscored(action)]
		const actionTitle = i18n.action(action)
		title = title ?? ((challenger ? challenger + ": " : "") + actionTitle)
		return new Promise(resolve => {
			const compendiumOnClick = compendium ? `game.MKS.compendiumToChat(null, '${compendium}', 'blindroll')` : ''
			const dialogContent = `
			<form>
			<div class="form-group">
				<button type="button" onclick="${compendiumOnClick}" style="margin-left: 20px; margin-right: 5px">
					<label>${i18n.$("PF2E.Concept.DC") + ': ' + actionTitle + ' '}</label>
					<i class="fas fa-head-side-cough"></i>
				</button>
				<input type="number" name="dc" value="${defaultDC}" maxlength="2" size="2" style="margin-left: 5px; margin-right: 20px">
			</div>
			</form>
			`
			let timeout
			const dialog = new Dialog({
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
					clearTimeout(timeout)
				}
			})
			
			timeout = setTimeout( ()=> {
				resolve({})
				dialog?.close({}).then()
			},20000)
			
			dialog.render(true)
		})
	}

	static requestGmSetDC({action, title, challenger, defaultDC= 20}) {
		if (game.user.isGM)
			return DCHelper.setDC(action, defaultDC, title, challenger)
		else {
			game.MKS.socketHandler.emit('SetDC', {action, title, defaultDC, challenger}, true)
			game.togglePause(true)
			return game.MKS.socketHandler.waitFor('SetDCResponse', 22000)
				.catch(e => {
					ui.notifications.error(i18n.$("PF2E.MKS.Error.DCNotSetInTime"))
				})
				.finally(() => game.togglePause(false))
		}
	}
}