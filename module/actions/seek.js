import MksUtils from "../mks-utils.js"
import Action from "../action.js"
import Compendium from "../compendium.js"
import $$arrays from "../../utils/arrays.js"

export default class ActionSeek extends Action {

	seek(options = {}) {
		const seeker = this._.ensureOneSelected()

		const templateCallback = (template) => {
			const tokens = this._.templateManager.getEncompassingTokens(template)
			// if (template.author.isGM)
			// 	this._.templateManager.deleteTemplate(template.id)

			const ActionMacroHelpers = game.pf2e.actionHelpers
			const rollCallback = ({actor, message, outcome, roll}) => {
				switch(roll.data.degreeOfSuccess) {
					case 2: {
						console.log(actor)
						console.log(message)
						console.log(outcome)
						console.log(roll)
						break
					}
					case 3: {
						break
					}
				}
			}

			const { checkType, property, stat, subtitle } = ActionMacroHelpers.resolveStat("perception")
			for (let i = 0; i < tokens.length; i++) {
				ActionMacroHelpers.simpleRollActionCheck({
					actors: seeker.actor,
					target: () => ({token: tokens[i].document, actor: tokens[i].actor}),
					statName: property,
					actionGlyph: options.glyph ?? "A",
					title: "PF2E.Actions.Seek.Title",
					subtitle,
					content: (title) => ('<b>' + seeker.actor.name + '</b> ' + title),
					modifiers: options.modifiers,
					rollOptions: ["all", checkType, stat, "action:seek"],
					context: {
						rollMode: "gmroll",
						skipDialog: true,
					},
					extraOptions: ["action:seek"],
					traits: ["concentrate", "secret"],
					checkType,
					event: options.event,
					callback: rollCallback,
					difficultyClass: options.difficultyClass,
					difficultyClassStatistic: (target) => target.skills.stealth,
					extraNotes: (selector) => [
						ActionMacroHelpers.note(selector, "PF2E.Actions.Seek", "criticalSuccess"),
						ActionMacroHelpers.note(selector, "PF2E.Actions.Seek", "success")
					]
				}).then()
			}
		}

		const dialogContent = `
		<form>
		<div class="form-group">
			<select name="seekType">
				<option value="front_cone" selected>${MksUtils.i18n("pf2e.mks.dialog.seek.type.frontcone")}</option>
				<option value="front_burst" >${MksUtils.i18n("pf2e.mks.dialog.seek.type.frontburst")}</option>
				<option value="object" >${MksUtils.i18n("pf2e.mks.dialog.seek.type.object")}</option>
			</select>
		</div>
		</form>
		`

		new Dialog({
			title: MksUtils.i18n("pf2e.mks.dialog.seek.selecttype.title"),
			content: dialogContent,
			buttons: {
				yes: {
					icon: '<i class="far fa-eye"></i>',
					label: MksUtils.i18n("PF2E.Actions.Seek.Title"),
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