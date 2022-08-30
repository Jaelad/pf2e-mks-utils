import {default as i18n} from "../../lang/pf2e-helper.js"
import {default as LOG} from "../../utils/logging.js"
import Action from "../action.js"
import Check from "../check.js"

export default class ActionSeek extends Action {

	initialize() {
		this._.socketListener.on('SeekRequest', ({seekerId, targetIds, userId}) => {
			const seeker = this._.getTokenById(seekerId)
			const targets = targetIds.map((tid => this._.getTokenById(tid)))
			const user = game.users.get(userId)
			this.seekTargets(seeker, targets, user)
		})
	}

	methods() {
		const seeker = this._.ensureOneSelected(false)
		if (!seeker)
			return []

		return [{
			method: "seek",
			label: i18n.action("seek"),
			icon: "systems/pf2e/icons/features/classes/alertness.webp",
			action: 'A',
			tags: ['encounter', 'exploration']
		}]
	}

	seekTargets(seeker, targets, user = game.user) {
		const rollCallback = ({roll, actor, target}) => {
			const step = roll.data.degreeOfSuccess - 1
			if (step <= 0)
				return

			const seekerType = seeker.actor.type, targetType = target.actor.type

			const undetected = this.effectManager.getCondition(target, 'undetected')
			const hidden = this.effectManager.getCondition(target, 'hidden')

			if (hidden) {
				this.effectManager.setCondition(target, 'observed').then(() => {
					this.effectManager.removeCondition(target, 'hidden')
				})
			}
			else if (undetected || target.data.hidden) {
				this.effectManager.setCondition(target, step > 1 ? 'observed' : 'hidden').then(() => {
					this.effectManager.removeCondition(target, 'undetected')
				})
			}

			if (target.data.hidden)
				target.document.update({ _id : target.id, hidden : false })
		}

		const check = new Check({
			actionGlyph: "A",
			rollOptions: ["action:seek"],
			extraOptions: ["action:seek"],
			traits: ["secret", "concentrate"],
			checkType: "perception",
			rollMode: "gmroll",
			secret: true,
			skipDialog: true,
			difficultyClassStatistic: (target) => target.skills.stealth
		})

		for (let i = 0; i < targets.length; i++) {
			check.roll(seeker, targets[i]).then(rollCallback)
		}
	}

	seek(options = {}) {
		const seeker = this._.ensureOneSelected()

		const templateCallback = (template) => {
			const tokens = this._.templateManager.getEncompassingTokens(template, (token) => {
				if (game.user.isGM)
					return ['character', 'familiar'].includes(token.actor.type) && this.effectManager.hasCondition(token, ['undetected', 'hidden'])
				else
					return !token.owner && (token.data.hidden || this.effectManager.hasCondition(token, 'hidden'))
			})
			if (template.author.isGM)
				this._.templateManager.deleteTemplate(template.id)
			else
				setTimeout(() => this._.templateManager.deleteTemplate(template.id), 5000)


			if (game.user.isGM)
				this.seekTargets(seeker, tokens)
			else {
				const eventData = {
					seekerId: seeker.id,
					targetIds: tokens.map(t => t.id),
					userId: game.user.id
				}
				LOG.info(eventData)
				this._.socketListener.emit('SeekRequest', eventData)
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