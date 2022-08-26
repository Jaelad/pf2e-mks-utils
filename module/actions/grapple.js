import MksUtils from "../mks-utils.js"
import Action from "../action.js"
import Compendium from "../compendium.js"
import $$arrays from "../../utils/arrays.js"

export default class ActionGrapple extends Action {

	//Below exports.SetGamePF2e = { // Line:50709: actionHelpers: action_macros_1.ActionMacroHelpers,

	grapple(options = {}) {
		const ActionMacroHelpers = game.pf2e.actionHelpers
		const grappler = this._.ensureOneSelected()
		const willBeGrabbed = this._.ensureOneTarget()

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
									this.onGrappleSuccess(grappler, willBeGrabbed)
								}
							},
							yes: {
								icon: '<i class="far fa-hand-point-down"></i>',
								label: MksUtils.i18n("PF2E.ConditionTypeProne"),
								callback: () => {
									this.effectManager.setCondition(grappler.actor, 'prone').then()
								}
							},
						},
						default: 'no',
					}).render(true)
				}
				case 1: {
					// TODO Maybe some other actor grappled it
					this.effectManager.removeCondition(willBeGrabbed.actor, 'grabbed')?.then()
					this.effectManager.removeCondition(willBeGrabbed.actor, 'restrained')?.then()
					break
				}
				case 2: {
					this.onGrappleSuccess(willBeGrabbed, grappler)
					break
				}
				case 3: {
					this.onGrappleSuccess(willBeGrabbed, grappler, true)
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
		}).then()
	}

	onGrappleSuccess(tokenGrabbed, tokenGrappler, isRestrained = false) {
		MksUtils.info(`Setting Grabbing Success : ${tokenGrappler.name} -> ${tokenGrabbed.name}`)
		const condition = this.effectManager.getCondition(tokenGrabbed, isRestrained ? 'restrained' : 'grabbed')
		const grapplers = $$arrays.pushAll(condition?.flags?.mks?.grapple?.grapplers ?? [], tokenGrappler.id, true)
		this.effectManager.setCondition(tokenGrabbed, isRestrained ? 'restrained' : 'grabbed', {flags: {"mks.grapple": {grapplers}}}).then()

		this.effectManager.setEffect(tokenGrappler, Compendium.EFFECT_GRABBING, {flags: {"mks.grapple": {grabbed: tokenGrabbed.id}}}).then()
	}

	onGrabbingExpired(grabbedTokenId) {
		// TODO Maybe some other actor also grappled it
		MksUtils.info("Grabbing Expired : " + grabbedTokenId)
		const token = this._.getTokenById(grabbedTokenId)
		this.effectManager.removeCondition(token, 'grabbed')?.then()
		this.effectManager.removeCondition(token, 'restrained')?.then()
	}
}
