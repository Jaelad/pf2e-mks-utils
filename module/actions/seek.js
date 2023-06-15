import {default as i18n} from "../../lang/pf2e-i18n.js"
import Action from "../action.js"
import Check from "../check.js"
import CommonUtils from "../helpers/common-utils.js"
import {ROLL_MODE} from "../constants.js"
import Condition, {Awareness, CONDITION_HIDDEN, CONDITION_INVISIBLE, CONDITION_OBSERVED, CONDITION_UNDETECTED, CONDITION_UNNOTICED} from "../model/condition.js"
import Item from "../model/item.js"
import RelativeConditions from "../model/relative-conditions.js"
import { Engagement } from "../model/engagement.js"

export default class ActionSeek extends Action {

	constructor(MKS) {
		super(MKS, 'seek', 'encounter', false, true, {
			icon: "systems/pf2e/icons/features/classes/alertness.webp",
			actionGlyph: 'A',
			tags: ['inspection']
		})
	}

	async act(engagement, options) {
		const selected = engagement.initiator

		const templateCallback = (template) => {
			const tokens = this._.templateManager.getEncompassingTokens(template, (token) => {
				if (game.user.isGM) {
					return ['character', 'familiar'].includes(token.actor.type) && Item.hasAny(token, ['unnoticed', 'undetected', 'hidden'])
				}
				else
					return !token.owner && Item.hasAny(token, ['unnoticed', 'undetected', 'hidden'])
			})
			if (template.user.isGM)
				this._.templateManager.deleteTemplate(template.id)
			else
				setTimeout(() => this._.templateManager.deleteTemplate(template.id), 5000)

			return tokens
		}

		const dialogContent = `
		<form>
		<div class="form-group">
			<select name="seekType">
				<option value="front_cone" selected>${i18n.$("PF2E.MKS.Dialog.seek.type.frontcone")}</option>
				<option value="front_burst" >${i18n.$("PF2E.MKS.Dialog.seek.type.frontburst")}</option>
				<option value="object" >${i18n.$("PF2E.MKS.Dialog.seek.type.object")}</option>
			</select>
		</div>
		</form>
		`

		const tokens = await new Dialog({
			title: i18n.$("PF2E.MKS.Dialog.seek.selecttype.title"),
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
						return this._.templateManager.draw(selected, templateCallback, {preset: 'seek'}, override)
					}
				}
			}
		}).render(true)

		return this.createResult(engagement, null, {tokenIds: tokens.map(t => t.id)})
	}

	async apply(engagement, result) {
		const rollCallback = ({roll, actor, target}) => {
			const step = roll.degreeOfSuccess - 1
			if (step <= 0)
				return

			const invisible = new Condition(target, CONDITION_INVISIBLE)
			const relative = RelativeConditions()
			if (relative.isOk) {
				const awarenessState = relative.getMyAwarenessOf(target)
				if (awarenessState === CONDITION_HIDDEN || step > 1)
					relative.setMyAwarenessOf(target, invisible.exists ? CONDITION_HIDDEN : CONDITION_OBSERVED)
				else if (awarenessState === CONDITION_UNNOTICED || awarenessState === CONDITION_UNDETECTED)
					relative.setMyAwarenessOf(target, CONDITION_HIDDEN)
				this._.encounterManager.applyRelativeConditions(target.combatant)
			}
			else {
				const awareness = new Awareness(target)
				const awarenessState = awareness.state
				
				if (awarenessState === CONDITION_HIDDEN || step > 1)
					return awareness.setStateAsync(invisible.exists ? CONDITION_HIDDEN : CONDITION_OBSERVED)
				else if (awarenessState === CONDITION_UNNOTICED || awarenessState === CONDITION_UNDETECTED)
					return awareness.setStateAsync(CONDITION_HIDDEN)
			}
		}

		const check = new Check({
			actionGlyph: "A",
			rollOptions: ["action:seek"],
			extraOptions: ["action:seek"],
			traits: ["secret", "concentrate"],
			checkType: "perception",
			rollMode: ROLL_MODE.BLIND,
			secret: true,
			skipDialog: true,
			difficultyClassStatistic: (target) => target.skills.stealth
		})

		const targets = result.options.tokenIds.map(tId => CommonUtils.getTokenById(tId))

		for (const target of targets) {
			check.roll(new Engagement(engagement.initiator, target)).then(rollCallback)
		}
	}
}