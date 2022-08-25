import MksUtils, {Action} from "../mks-utils.js";
import Compendium from "../compendium.js";

export default class ActionGrapple extends Action {

	//Below exports.SetGamePF2e = { // Line:50709: actionHelpers: action_macros_1.ActionMacroHelpers,

	grapple(options = {}) {
		const ActionMacroHelpers = game.pf2e.actionHelpers
		const grappler = this._._ensureOneSelected()
		const willBeGrabbed = this._._ensureOneTarget()

		const callback = ({actor, message, outcome, roll}) => {
			switch(roll.data.degreeOfSuccess) {
				case 3: {
					game.pf2e.ConditionManager.addConditionToToken('restrained', willBeGrabbed).then()
					break
				}
				case 2: {
					game.pf2e.ConditionManager.addConditionToToken('grabbed', willBeGrabbed).then()
					break
				}
				case 1: {
					game.pf2e.ConditionManager.removeConditionFromToken('grabbed', willBeGrabbed).then()
					game.pf2e.ConditionManager.removeConditionFromToken('restrained', willBeGrabbed).then()
					break
				}
				case 0: {
					game.pf2e.ConditionManager.removeConditionFromToken('grabbed', willBeGrabbed).then()
					game.pf2e.ConditionManager.removeConditionFromToken('restrained', willBeGrabbed).then()
					new Dialog({
						title: MksUtils.i18n("pf2e.mks.dialog.grapple.grabbedorprone.title"),
						content: '',
						buttons: {
							no: {
								icon: '<i class="far fa-hand-receiving"></i>',
								label: MksUtils.i18n("PF2E.ConditionTypeGrabbed"),
								callback: () => {
									game.pf2e.ConditionManager.addConditionToToken('grabbed', grappler).then()
								}
							},
							yes: {
								icon: '<i class="far fa-hand-point-down"></i>',
								label: MksUtils.i18n("PF2E.ConditionTypeProne"),
								callback: () => {
									game.pf2e.ConditionManager.addConditionToToken('prone', grappler).then()
								}
							},
						},
						default: 'no',
					}).render(true)
					break
				}

			}
		}

		const { checkType, property, stat, subtitle } = ActionMacroHelpers.resolveStat("athletics")
		ActionMacroHelpers.simpleRollActionCheck({
			actors: grappler.actor,
			target: () => ({token: willBeGrabbed.document, actor: willBeGrabbed.actor}),
			statName: property,
			actionGlyph: options.glyph ?? "A",
			title: "PF2E.Actions.Grapple.Title",
			subtitle,
			content: (title) => ('<b>' + grappler.actor.name + '</b> ' + title),
			modifiers: options.modifiers,
			rollOptions: ["all", checkType, stat, "action:grapple"],
			extraOptions: ["action:grapple"],
			traits: ["attack"],
			checkType,
			event: options.event,
			callback,
			difficultyClass: options.difficultyClass,
			difficultyClassStatistic: (target) => target.saves.fortitude,
			extraNotes: (selector) => [
				ActionMacroHelpers.note(selector, "PF2E.Actions.Grapple", "criticalSuccess"),
				ActionMacroHelpers.note(selector, "PF2E.Actions.Grapple", "success"),
				ActionMacroHelpers.note(selector, "PF2E.Actions.Grapple", "failure"),
				ActionMacroHelpers.note(selector, "PF2E.Actions.Grapple", "criticalFailure"),
			],
			weaponTrait: "grapple",
		});
	}

}
