import {default as i18n} from "../../lang/pf2e-helper.js"
import {default as LOG} from "../../utils/logging.js"
import Action from "../action.js"
import Compendium from "../compendium.js"
import $$arrays from "../../utils/arrays.js"
import Check from "../check.js"

export default class ActionGrapple extends Action {

	//Below exports.SetGamePF2e = { // Line:50709: actionHelpers: action_macros_1.ActionMacroHelpers,

	methods() {
		const grappler = this._.ensureOneSelected(false)
		const willBeGrabbed = this._.ensureOneTarget(null,false)
		if (!grappler || !willBeGrabbed)
			return []

		const handsFree = this._.inventoryManager.handsFree(grappler)
		const sizeDiff = this._.getSizeDifference(grappler.actor, willBeGrabbed.actor)
		const grabbed = this.effectManager.hasCondition(willBeGrabbed, 'grabbed')
		const distance = this._.distanceTo(grappler, willBeGrabbed)
		const reqMet = (handsFree > 0 || grabbed) && sizeDiff < 2 && distance < 10
		return reqMet ? [{
			method: "grapple",
			label: i18n.action("grapple"),
			icon: "systems/pf2e/icons/spells/athletic-rush.webp",
			action: 'A',
			mode: "encounter",
			tags: ['hostile', 'combat']
		}] : []
	}

	grapple(options = {}) {
		const ActionMacroHelpers = game.pf2e.actionHelpers
		const grappler = this._.ensureOneSelected()
		const willBeGrabbed = this._.ensureOneTarget()

		const rollCallback = ({roll, actor}) => {
			switch(roll.data.degreeOfSuccess) {
				case 0: {
					new Dialog({
						title: i18n.$("pf2e.mks.dialog.grapple.grabbedorprone.title"),
						content: '',
						buttons: {
							no: {
								icon: '<i class="far fa-hand-receiving"></i>',
								label: i18n.$("PF2E.ConditionTypeGrabbed"),
								callback: () => {
									this.onGrappleSuccess(grappler, willBeGrabbed)
								}
							},
							yes: {
								icon: '<i class="far fa-hand-point-down"></i>',
								label: i18n.$("PF2E.ConditionTypeProne"),
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

		if (options.oldImpl) {
			const {checkType, property, stat, subtitle} = ActionMacroHelpers.resolveStat("athletics")
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
		else {
			const check = new Check({
				actionGlyph: "A",
				rollOptions: ["action:grapple"],
				extraOptions: ["action:grapple"],
				traits: ["attack"],
				weaponTrait: "grapple",
				checkType: "skill[athletics]",
				difficultyClassStatistic: (target) => target.saves.fortitude
			})
			check.roll(grappler, willBeGrabbed).then(rollCallback)
		}
	}

	onGrappleSuccess(tokenGrabbed, tokenGrappler, isRestrained = false) {
		LOG.info(`Setting Grabbing Success : ${tokenGrappler.name} -> ${tokenGrabbed.name}`)
		const condition = this.effectManager.getCondition(tokenGrabbed, isRestrained ? 'restrained' : 'grabbed')
		const grapplers = $$arrays.pushAll(condition?.flags?.mks?.grapple?.grapplers ?? [], tokenGrappler.id, true)
		this.effectManager.setCondition(tokenGrabbed, isRestrained ? 'restrained' : 'grabbed', {flags: {"mks.grapple": {grapplers}}}).then()

		this.effectManager.setEffect(tokenGrappler, Compendium.EFFECT_GRABBING, {flags: {"mks.grapple": {grabbed: tokenGrabbed.id}}}).then()
	}

	onGrabbingExpired(grabbedTokenId) {
		// TODO Maybe some other actor also grappled it
		LOG.info("Grabbing Expired : " + grabbedTokenId)
		const token = this._.getTokenById(grabbedTokenId)
		this.effectManager.removeCondition(token, 'grabbed')?.then()
		this.effectManager.removeCondition(token, 'restrained')?.then()
	}
}
