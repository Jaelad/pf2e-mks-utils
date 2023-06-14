import {default as i18n} from "../../lang/pf2e-i18n.js"
import {default as LOG} from "../../utils/logging.js"
import Action from "../action.js"
import Compendium from "../compendium.js"
import $$arrays from "../../utils/arrays.js"
import Check from "../check.js"
import CommonUtils from "../helpers/common-utils.js"
import { Engagement } from "../model/engagement.js"
import Equipments from "../model/equipments.js"
import Condition, { CONDITION_GRABBED, CONDITION_RESTRAINED } from "../model/condition.js"
import Effect, { EFFECT_GRABBING } from "../model/effect.js"

export default class ActionGrapple extends Action {

	constructor(MKS) {
		super(MKS, 'grapple', 'encounter', false, true)
	}

	get properties() {
		return {
			label: i18n.action("grapple"),
			icon: "systems/pf2e/icons/spells/athletic-rush.webp",
			actionGlyph: 'A',
			tags: ['combat']
		}
	}

	relevant(warn) {
		const grappler = this._.ensureOneSelected(warn)
		const willBeGrabbed = this._.ensureOneTarget(null,warn)
		if (!grappler || !willBeGrabbed || grappler.id === willBeGrabbed.id)
			return

		const engagement = new Engagement(grappler, willBeGrabbed)
		const equipments = new Equipments(grappler), grabbed = new Condition(willBeGrabbed, CONDITION_GRABBED)
		
		if ((equipments.handsFree > 0 || grabbed.exists) && engagement.sizeDifference > -2 
			&& engagement.isEnemy && engagement.distance < equipments.weaponWieldedWithTraits(['reach', 'grapple']) ? 15 : 10)
			return engagement
	}

	//Below exports.SetGamePF2e = { // Line:50709: actionHelpers: action_macros_1.ActionMacroHelpers,

	async act(engagement, options) {
		const check = new Check({
			actionGlyph: "A",
			rollOptions: ["action:grapple"],
			extraOptions: ["action:grapple"],
			traits: ["attack"],
			weaponTrait: "grapple",
			checkType: "skill[athletics]",
			difficultyClassStatistic: (target) => target.saves.fortitude
		})
		return check.roll(engagement).then(({roll, actor}) => this.createResult(engagement, roll))
	}

	async apply(engagement, result) {
		const grappler = engagement.initiator, willBeGrabbed = engagement.targeted
		switch(result.roll.degreeOfSuccess) {
			case 0: {
				new Dialog({
					title: i18n.$("PF2E.MKS.Dialog.grapple.grabbedorprone.title"),
					content: '',
					buttons: {
						no: {
							icon: '<i class="far fa-hand-receiving"></i>',
							label: i18n.$("PF2E.ConditionTypeGrabbed"),
							callback: () => {
								this.onGrappleSuccess(grappler, willBeGrabbed).then()
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
				this.onGrappleFailure(willBeGrabbed, grappler).then()
				break
			}
			case 2: {
				this.onGrappleSuccess(willBeGrabbed, grappler).then()
				break
			}
			case 3: {
				this.onGrappleSuccess(willBeGrabbed, grappler, true).then()
				break
			}
		}
	}
	
	async onGrappleFailure(tokenGrabbed, tokenGrappler) {
		// TODO Maybe some other actor grappled it
		Item.purgeAll(tokenGrabbed, [CONDITION_GRABBED, CONDITION_RESTRAINED, EFFECT_GRABBING])
	}

	async onGrappleSuccess(tokenGrabbed, tokenGrappler, isRestrained = false) {
		LOG.info(`Setting Grabbing Success : ${tokenGrappler.name} -> ${tokenGrabbed.name}`)

		const grabbedOrRestrained = new Condition(tokenGrabbed, isRestrained ? CONDITION_RESTRAINED : CONDITION_GRABBED)
		grabbedOrRestrained.ensure().then(c => {
			let grapplers = c.getFlag("grapple")?.grapplers ?? []
			grapplers = $$arrays.pushAll(grapplers, tokenGrappler.id, true)
			c.setFlag('grapple', grapplers)
		})

		const grabbing = new Effect(tokenGrappler, EFFECT_GRABBING)
		grabbing.ensure().then(e => {
			e.setFlag("grapple", {grabbed: tokenGrabbed.id})
		})
	}

	async onGrabbingExpired(grabbedTokenId) {
		// TODO Maybe some other actor also grappled it
		LOG.info("Grabbing Expired : " + grabbedTokenId)
		const token = CommonUtils.getTokenById(grabbedTokenId)
		Item.purgeAll(token, [CONDITION_GRABBED, CONDITION_RESTRAINED])
	}
}
