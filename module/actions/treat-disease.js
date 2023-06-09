import {SimpleAction} from "../action.js"
import Effect from "../model/effect.js"
import Equipments, { EQU_HEALERS_TOOLS, EQU_HEALERS_TOOLS_EXPANDED } from "../model/equipments.js"

export default class ActionTreatDisease extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'treatDisease', mode: "downtime",
			checkType: 'skill[medicine]',
			traits: ['manipulate', 'downtime'],
			icon: "systems/pf2e/icons/effects/treat-disease.webp",
			tags: ['preparation'],
			actionGlyph: '',
			targetCount: 1
		})
	}
	
	pertinent(engagement, warn) {
		return engagement.isAlly
	}
	
	async apply(engagement, result) {
		const hasHealersTools = new Equipments(engagement.initiator).hasAny([EQU_HEALERS_TOOLS, EQU_HEALERS_TOOLS_EXPANDED])
		if (!hasHealersTools)
			return
		super.apply(engagement, result)
		
		const degreeOfSuccess = result.roll.degreeOfSuccess
		const bonus = degreeOfSuccess == 2 ? 2 : degreeOfSuccess == 3 ? 4 : degreeOfSuccess == 0 ? -2 : 0
		if (bonus !== 0) {
			const diseaseTreated = new Effect(targeted, EFFECT_DISEASE_TREATED)
			diseaseTreated.ensure().then(() => {
				diseaseTreated.setFlag("treatDiseaseBonus", bonus)
			})
		}
	}
}