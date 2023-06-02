import {default as i18n} from "../../lang/pf2e-i18n.js"
import {default as LOG} from "../../utils/logging.js"
import Action from "../action.js"
import Check from "../check.js"
import CommonUtils from "../helpers/common-utils.js"
import {ROLL_MODE} from "../constants.js"
import Condition, {Awareness} from "../model/condition.js"

export default class ActionSeek extends Action {

	initialize() {
		this._.socketHandler.on('SeekRequest', ({seekerId, targetIds, userId}) => {
			const seeker = CommonUtils.getTokenById(seekerId)
			const targets = targetIds.map((tid => CommonUtils.getTokenById(tid)))
			const user = game.users.get(userId)
			this.seekTargets(seeker, targets, user)
		})
	}

	seekTargets(seeker, targets, user = game.user) {
		const rollCallback = ({roll, actor, target}) => {
			const step = roll.degreeOfSuccess - 1
			if (step <= 0)
				return

			//const seekerType = seeker.actor.type, targetType = target.actor.type

			const invisible = new Condition(target, 'invisible')
			const awareness = new Awareness(target)
			const awarenessState = awareness.state
			
			let promise
			if (awarenessState === 'hidden' || step > 1)
				promise = awareness.setState(invisible.exists ? 'hidden' : 'observed')
			else if (awarenessState === 'unnoticed' || awarenessState === 'undetected')
				promise = awareness.setState('hidden')
			
			promise?.then(() => {
				this._.encounterManager.syncRelativeConds(seeker.combatant).then()
			})
		}

		const check = new Check({
			actionGlyph: "A",
			rollOptions: ["action:seek"],
			extraOptions: ["action:seek"],
			traits: ["secret", "concentrate"],
			checkType: "perception",
			rollMode: ROLL_MODE.BLIND,
			secret: true,
			skipDialog: false,
			difficultyClassStatistic: (target) => target.skills.stealth
		})

		for (let i = 0; i < targets.length; i++) {
			check.roll(seeker, targets[i]).then(rollCallback)
		}
	}

	seek(options = {}) {
		const {selected} = this.isApplicable(null,true)

		const templateCallback = (template) => {
			const tokens = this._.templateManager.getEncompassingTokens(template, (token) => {
				if (game.user.isGM) {
					return ['character', 'familiar'].includes(token.actor.type) && Condition.hasAny(token, ['unnoticed', 'undetected', 'hidden'])
				}
				else
					return !token.owner && Condition.hasAny(token, ['unnoticed', 'undetected', 'hidden'])
			})
			if (template.user.isGM)
				this._.templateManager.deleteTemplate(template.id)
			else
				setTimeout(() => this._.templateManager.deleteTemplate(template.id), 5000)

			if (game.user.isGM)
				this.seekTargets(selected, tokens)
			else {
				const eventData = {
					seekerId: selected.id,
					targetIds: tokens.map(t => t.id),
					userId: game.user.id
				}
				LOG.info(eventData)
				this._.socketHandler.emit('SeekRequest', eventData, true)
			}
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

		new Dialog({
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
						this._.templateManager.draw(selected, templateCallback, {preset: 'seek'}, override)
					}
				}
			}
		}).render(true)
	}

	methods(onlyApplicable) {
		const {applicable} = this.isApplicable()
		return !onlyApplicable || applicable ? [{
			method: "seek",
			label: i18n.action("seek"),
			icon: "systems/pf2e/icons/features/classes/alertness.webp",
			action: 'A',
			mode: "encounter",
			tags: ['situational']
		}] : []
	}

	isApplicable(method=null, warn=false) {
		let selected = this._.ensureOneSelected(warn)
		return {applicable: !!selected, selected, targeted: null}
	}
}