import $$strings from "../utils/strings.js"
import {DEGREE_OF_SUCCESS_STRINGS} from "../module/constants.js"

export default class PF2EI18N {
	static $ = (toTranslate) => game.i18n.localize(toTranslate)
	static $$ = (toTranslate, params) => game.i18n.format(toTranslate, params)
	static has = (toTranslate) => game.i18n.has(toTranslate)

	static action(action) {
		return PF2EI18N.$(`PF2E.Actions.${$$strings.camelize(action)?.replace(/-/g, () => "")}.Title`)
	}

	static condition(condition) {
		return PF2EI18N.$(`PF2E.ConditionType${$$strings.camelize(action)}`)
	}

	static skillCheck(skill) {
		const toTranslate = `PF2E.ActionsCheck.${skill}`
		return PF2EI18N.has(toTranslate) ? PF2EI18N.$(toTranslate) : undefined
	}

	static skill(skill) {
		let toTranslate = `PF2E.Skill${$$strings.camelize(skill)}`
		return PF2EI18N.has(toTranslate) ? PF2EI18N.$(toTranslate) : undefined
	}

	static save(save) {
		return PF2EI18N.$(`PF2E.Saves${$$strings.camelize(save)}`)
	}

	static spellAttack(tradition) {
		return PF2EI18N.$$("PF2E.SpellAttackWithTradition", {tradition: $$strings.camelize(tradition)})
	}

	static ability(abilityAbrv) {
		return PF2EI18N.$(`PF2E.Ability${$$strings.camelize(abilityAbrv)}`)
	}

	static alignment(alignmentShort) {
		return PF2EI18N.$(`PF2E.Alignment${alignmentShort.toUpperCase()}`)
	}

	static attitude(attitude) {
		return PF2EI18N.$(`PF2E.Attitudes.${$$strings.camelize(attitude)}`)
	}

	static language(lang) {
		return PF2EI18N.$(`PF2E.Language${$$strings.camelize(lang)}`)
	}

	static trait(trait) {
		return PF2EI18N.$(`PF2E.Trait${$$strings.camelize(trait)}`)
	}

	static weapon(weaponSlug) {
		return PF2EI18N.$(`PF2E.Weapon.Base.${weaponSlug}`)
	}

	static actionTag(tag) {
		return PF2EI18N.$(`PF2E.ActionTag.${tag}`)
	}

	static modifier(mod) {
		return PF2EI18N.$(`PF2E.MKS.Modifier.${mod}`)
	}

	static modifierType(mt) {
		return PF2EI18N.$(`PF2E.BonusLabel.${mt}`)
	}

	static uiAction(action) {
		return PF2EI18N.$(`PF2E.MKS.UI.Actions.${action}`)
	}
	
	static equipmentSlot(slot) {
		return PF2EI18N.$(`PF2E.MKS.EquipmentSlot.${slot}`)
	}

	static actionNote(action, degreeOfSuccess) {
		let toTranslete = `PF2E.Actions.${$$strings.camelize(action)}.Notes.${DEGREE_OF_SUCCESS_STRINGS[degreeOfSuccess]}`
		if (PF2EI18N.has(toTranslete))
			return PF2EI18N.$(toTranslete)
		else if (degreeOfSuccess === 0) {
			toTranslete = `PF2E.Actions.${$$strings.camelize(action)}.Notes.${DEGREE_OF_SUCCESS_STRINGS[degreeOfSuccess + 1]}`
			return PF2EI18N.has(toTranslete) ? PF2EI18N.$(toTranslete) : undefined
		}
		else if (degreeOfSuccess === 3) {
			toTranslete = `PF2E.Actions.${$$strings.camelize(action)}.Notes.${DEGREE_OF_SUCCESS_STRINGS[degreeOfSuccess - 1]}`
			return PF2EI18N.has(toTranslete) ? PF2EI18N.$(toTranslete) : undefined
		}
	}
}