import MksUtils, {Action} from "../mks-utils.js";
import Compendium from "../compendium.js";

export default class ActionGrapple extends Action {

	//Below exports.SetGamePF2e = { // Line:50709: actionHelpers: action_macros_1.ActionMacroHelpers,

	onGrappleSuccess(tokenGrabbed, grapplerTokenId, isRestrained) {
		this._.incrementCondition(tokenGrabbed.actor, isRestrained ? 'restrained' : 'grabbed').then()
	}

	grapple(options = {}) {
		const ActionMacroHelpers = game.pf2e.actionHelpers
		const grappler = this._._ensureOneSelected()
		const willBeGrabbed = this._._ensureOneTarget()

		const callback = ({actor, message, outcome, roll}) => {
			switch(roll.data.degreeOfSuccess) {
				case 0: {
					new Dialog({
						title: MksUtils.i18n("pf2e.mks.dialog.grapple.grabbedorprone.title"),
						content: '',
						buttons: {
							no: {
								icon: '<i class="far fa-hand-receiving"></i>',
								label: MksUtils.i18n("PF2E.ConditionTypeGrabbed"),
								callback: () => {
									this._.incrementCondition(grappler.actor, 'grabbed').then()
								}
							},
							yes: {
								icon: '<i class="far fa-hand-point-down"></i>',
								label: MksUtils.i18n("PF2E.ConditionTypeProne"),
								callback: () => {
									this._.incrementCondition(grappler.actor, 'prone').then()
								}
							},
						},
						default: 'no',
					}).render(true)
				}
				case 1: {
					this._.decrementCondition(willBeGrabbed.actor, 'grabbed').then()
					this._.decrementCondition(willBeGrabbed.actor, 'restrained').then()
					break
				}
				case 2: {
					this._.incrementCondition(willBeGrabbed.actor, 'grabbed').then(()=>{
						const mksFlagData = {grabbed: willBeGrabbed.id}
						this._.incrementEffect(grappler.actor, Compendium.EFFECT_GRABBING, {"mks.grapple": mksFlagData}).then()
					})
					break
				}
				case 3: {
					this.onGrappleSuccess(willBeGrabbed, grappler.id)
					this.onGrappleSuccess(willBeGrabbed, grappler.id, true)
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

	grabbingExpired(grabbedTokenId) {
		const token = this._._getTokenById(grabbedTokenId)
		this._.decrementCondition(token.actor, 'grabbed').then()
		this._.decrementCondition(token.actor, 'restrained').then()
	}
}
