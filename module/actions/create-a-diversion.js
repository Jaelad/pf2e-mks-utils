import {default as i18n} from "../../lang/pf2e-i18n.js"
import Check from "../check.js"
import Dialogs from "../apps/dialogs.js"
import DCHelper from "../helpers/dc-helper.js"
import Effect, { EFFECT_RESIST_A_DIVERSION } from "../model/effect.js"
import RelativeConditions from "../model/relative-conditions.js"
import { UUID_CONDITONS } from "../model/condition.js"
import { SimpleAction } from "../action.js"

export default class ActionCreateADiversion extends SimpleAction {

	constructor(MKS) {
		super(MKS, {action: 'createADiversion',
			icon: "systems/pf2e/icons/spells/lose-the-path.webp",
			tags: ['stealth'],
			actionGlyph: 'A',
			targetCount: 2,
			requiresEncounter: true,
			opposition: 'enemy'
		})
	}

	pertinent(engagement, warn) {
		return engagement.isEnemy
	}
	
	async act(engagement, options) {
		const type = await Dialogs.multipleButtons([
			{ value: 'trick-gesture', name: 'PF2E.Actions.CreateADiversion.TrickGesture'},
			{ value: 'distracting-words', name: 'PF2E.Actions.CreateADiversion.DistractingWords'},
		], "PF2E.MKS.Dialog.CreateADiversion.SelectType")
		if (!type) return

		const traits = type === 'trick-gesture' ? ['mental', 'manipulate'] : ['mental', 'auditory', 'linguistic']

		const rollCallback = ({roll}) => {
			return this.createResult(engagement, roll, options)
		}

		const check = new Check({
			checkType: 'skill[deception]',
			traits,
			rollOptions: ["action:create-a-diversion"],
			extraOptions: ["action:create-a-diversion"],
			actionGlyph: "A",
		})
		return await check.roll(engagement).then(rollCallback)
	}
	
	async apply(engagement, result) {
		const relative = new RelativeConditions()
		if (!relative.isOk) return
		const roll = result.roll

		for (const target of engagement.targets) {
			const awareness = relative.getAwarenessTowardMe(target)
			if (awareness < 3)
				continue
			const resistDiversion = new Effect(target, EFFECT_RESIST_A_DIVERSION)
			const dc = target.actor.perception.dc.value + (resistDiversion.exists ? 4 : 0)

			const degree = DCHelper.calculateDegreeOfSuccess(roll.die, roll.total, dc)
			relative.setAwarenessTowardMe(target, degree > 1 ? 2 : 3)
			const conditionUuid = degree > 1 ? UUID_CONDITONS.hidden : UUID_CONDITONS.observed

			resistDiversion.ensure()

			const message = i18n.$$('PF2E.Actions.CreateADiversion.Result', {target: target.name, conditionRef: `@UUID[${conditionUuid}]`})
			this.messageToChat(engagement.initiator, message, true)
		}
		
		RelativeConditions.sync()
	}
}
