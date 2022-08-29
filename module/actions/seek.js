import {default as i18n} from "../../lang/pf2e-helper.js"
import {default as LOG} from "../../utils/logging.js"
import Action from "../action.js"
import Compendium from "../compendium.js"
import $$arrays from "../../utils/arrays.js"
import Check from "../check.js"

export default class ActionSeek extends Action {

	static setHidden(target) {

	}

	seek(options = {}) {
		const seeker = this._.ensureOneSelected()

		const templateCallback = (template) => {
			const tokens = this._.templateManager.getEncompassingTokens(template, (token) => {
				// if (game.user.isGM) {
				// 	return ['character', 'familiar'].includes(token.actor.type) &&
				// }
			})
			// if (template.author.isGM)
			// 	this._.templateManager.deleteTemplate(template.id)

			const rollCallback = ({roll, actor, target}) => {
				const step = roll.data.degreeOfSuccess - 1
				if (step <= 0)
					return

				const seekerType = seeker.actor.type, targetType = target.actor.type

				const unnoticed = this.effectManager.getCondition(target, Compendium.CONDITION_UNNOTICED)
				const undetected = this.effectManager.getCondition(target, Compendium.CONDITION_UNDETECTED)
				const hidden = this.effectManager.getCondition(target, Compendium.CONDITION_HIDDEN)

				if (hidden) {
					this.effectManager.setCondition(target, Compendium.CONDITION_OBSERVED).then(() => {
						this.effectManager.removeCondition(target, Compendium.CONDITION_HIDDEN)
					})
				}
				else if (undetected) {
					this.effectManager.setCondition(target, step > 1 ? Compendium.CONDITION_OBSERVED : Compendium.CONDITION_HIDDEN).then(() => {
						this.effectManager.removeCondition(target, Compendium.CONDITION_UNDETECTED)
					})
				}
				else if (unnoticed) {
					this.effectManager.setCondition(target, step > 1 ? Compendium.CONDITION_HIDDEN : Compendium.CONDITION_UNDETECTED).then(() => {
						this.effectManager.removeCondition(target, Compendium.CONDITION_UNNOTICED)
					})
				}
			}

			const check = new Check({
				actionGlyph: "A",
				rollOptions: ["action:seek"],
				extraOptions: ["action:seek"],
				traits: ["secret", "concentrate"],
				checkType: "perception",
				rollMode: "blindroll",
				secret: true,
				difficultyClassStatistic: (target) => target.skills.stealth
			})

			for (let i = 0; i < tokens.length; i++) {
				check.roll(seeker, tokens[i]).then(rollCallback)
			}
		}

		const dialogContent = `
		<form>
		<div class="form-group">
			<select name="seekType">
				<option value="front_cone" selected>${i18n.$("pf2e.mks.dialog.seek.type.frontcone")}</option>
				<option value="front_burst" >${i18n.$("pf2e.mks.dialog.seek.type.frontburst")}</option>
				<option value="object" >${i18n.$("pf2e.mks.dialog.seek.type.object")}</option>
			</select>
		</div>
		</form>
		`

		new Dialog({
			title: i18n.$("pf2e.mks.dialog.seek.selecttype.title"),
			content: dialogContent,
			buttons: {
				yes: {
					icon: '<i class="far fa-eye"></i>',
					label: i18n.$("PF2E.Actions.Seek.Title"),
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