import {SELECTORS} from "./constants.js"
import {default as i18n} from "../lang/pf2e-helper.js"
import {MODIFIER_TYPE, DC_SLUGS, SKILLS, PROFICIENCY_RANK_OPTION} from "./constants.js"

// Lines: 42441 42347
export default class Check {
	constructor({
		dialogTitle,
		checkLabel,
		actionGlyph = "",
		rollOptions = [],
		extraOptions = [],
		traits = [],
		checkType,
		modifiers,
		weaponTrait,
		weaponTraitWithPenalty,
		difficultyClass,
		difficultyClassStatistic,
		createMessage,
		extraNotes,
		skipDialog = false,
		rollMode = 'publicroll', //blindroll,gmroll,publicroll,selfroll
		secret = false,
		event,
		callback
	}) {
		this.context = arguments[0]
		this.context.dialogTitle = this.context.dialogTitle ?? Check.defaultDialogTitle
		this.context.checkLabel = this.context.checkLabel ?? Check.defaultCheckLabel
		this.context.rollOptions = this.context.rollOptions ?? []
		this.context.extraOptions = this.context.rollOptions ?? []
		this.context.traits = this.context.traits ?? []

		const actionOption = extraOptions?.find(opt => opt.startsWith("action:")) ?? rollOptions?.find(opt => opt.startsWith("action:"))
		if (actionOption)
			this.context.action = actionOption.substring(7)
	}

	statisticToModifier(statistic) {
		const domains = statistic.data.domains
		const rollOptions = statistic.createRollOptions(domains)
		return new game.pf2e.StatisticModifier(statistic.label, statistic.modifiers, rollOptions)
	}

	getStatisticModifier(actor, type) {
		let match, checkSlug, statSlug, statistic, statisticModifier

		if (type === "ac")
			statisticModifier = actor.attributes.ac, checkSlug = 'ac-check', statSlug = 'ac'
		else if (type === "perception")
			statisticModifier = actor.attributes.perception, checkSlug = 'perception-check', statSlug = 'perception'
		else if (type === "class")
			statisticModifier = actor.attributes.classDC, checkSlug = 'class-dc-check', statSlug = 'class-dc'
		else if (type === "fortitude")
			statisticModifier = actor.data.data.saves.fortitude, checkSlug = 'saving-throw', statSlug = 'fortitude'
		else if (type === "reflex")
			statisticModifier = actor.data.data.saves.reflex, checkSlug = 'saving-throw', statSlug = 'reflex'
		else if (type === "will")
			statisticModifier = actor.data.data.saves.will, checkSlug = 'saving-throw', statSlug = 'will'
		else if (type === "spell")
			statistic = actor.spellcasting.find()?.statistic, checkSlug = 'spell-attack-roll', statSlug = 'spell-attack'
		else if (match = SELECTORS.spellcasting.exec(type)) {
			let tradition = match[1]
			statistic = actor.spellcasting.find(sc => sc.tradition === tradition)?.statistic
			checkSlug = 'spell-attack-roll', statSlug = tradition + '-spell-attack'
		}
		else if (match = SELECTORS.skill.exec(type)) {
			let skill = match[1]
			statisticModifier = actor.data.data.skills[SKILLS[skill]]
			checkSlug = 'skill-check', statSlug = skill
		}

		if (!statisticModifier && statistic) {
			statisticModifier = this.statisticToModifier(statistic)
		}
		else if (match = SELECTORS.strike.exec(type)) {
			let slug = match[1]
			statisticModifier = actor.data.data.actions.find(strike => strike.slug === slug)
			checkSlug = 'attack-roll', statSlug = slug
		}

		if (!statisticModifier)
			throw new Error("Illegal stat type : " + type)
		return {checkSlug, statSlug, stat: statisticModifier}
	}

	roll(tokenOrActor, target) {
		const actor = tokenOrActor?.actor ?? tokenOrActor
		if (!actor)
			throw new Error("No actor found to roll check!")

		const {checkSlug, statSlug, stat} = this.getStatisticModifier(actor, this.context.checkType)

		const targetOptions = target?.actor?.getSelfRollOptions("target") ?? []
		const selfToken = actor.getActiveTokens(false, true).shift()
		const finalOptions = [
			actor.getRollOptions(["all", checkSlug, statSlug, ...this.context.rollOptions]),
			this.context.extraOptions,
			this.context.traits,
			targetOptions,
			!!target &&
			!!selfToken?.object.isFlanking(target, { reach: actor.getReach({ action: "attack" }) })
				? "self:flanking"
				: [],
		].flat()
		const selfActor = actor.getContextualClone(finalOptions.filter((o) => o.startsWith("self:")))

		const dialogTitle = typeof this.context.dialogTitle === "function"
			? this.context.dialogTitle(selfToken, target, this.context.action, checkSlug, statSlug, this.context.actionGlyph)
			: this.context.dialogTitle
		const checkLabel = typeof this.context.checkLabel === "function"
			? this.context.checkLabel(selfToken, target, this.context.action, checkSlug, statSlug, this.context.actionGlyph)
			: this.context.checkLabel

		const modifiers = typeof this.context.modifiers === "function" ? this.context.modifiers(selfActor) : this.context.modifiers
		const check = new game.pf2e.CheckModifier(checkLabel, stat, modifiers ?? [])

		const weapon = [
			...(this.context.weaponTrait ? Check.getApplicableEquippedWeapons(selfActor, this.context.weaponTrait) : []),
			...(this.context.weaponTraitWithPenalty ? Check.getApplicableEquippedWeapons(selfActor, this.context.weaponTraitWithPenalty) : [])
		].shift()
		if (weapon) {
			const modifier = Check.getWeaponPotencyModifier(weapon, stat.name)
			if (modifier) check.push(modifier)
		}

		const weaponTraits = weapon?.traits;
		if (this.context.weaponTraitWithPenalty === "ranged-trip" && weaponTraits?.has("ranged-trip")) {
			const slug = "ranged-trip"
			check.push(
				new game.pf2e.Modifier({
					slug,
					adjustments: Check.extractModifierAdjustments(
						selfActor.synthetics.modifierAdjustments,
						["all", stat.name],
						slug
					),
					type: MODIFIER_TYPE.CIRCUMSTANCE,
					label: CONFIG.PF2E.weaponTraits["ranged-trip"],
					modifier: -2,
				})
			)
		}

		Check.ensureProficiencyOption(finalOptions, stat.rank ?? -1)
		const dc = (() => {
			if (this.context.difficultyClass) {
				return this.context.difficultyClass;
			}
			else if (["character", "npc", "familiar"].includes(target.actor.type)) {
				const dcStat = this.context.difficultyClassStatistic?.(target.actor)
				if (dcStat) {
					const extraRollOptions = finalOptions.concat(targetOptions)
					const { dc } = dcStat.withRollOptions({ extraRollOptions })
					const dcData = {
						value: dc.value,
						adjustments: stat.adjustments ?? [],
					}
					if (DC_SLUGS.has(dcStat.slug)) dcData.slug = dcStat.slug;

					return dcData;
				}
			}
			return null;
		})()

		const actionTraits = CONFIG.PF2E.actionTraits
		const traitDescriptions = CONFIG.PF2E.traitsDescriptions
		const traitObjects = this.context.traits.map((trait) => ({
			description: traitDescriptions[trait],
			name: trait,
			label: actionTraits[trait] ?? trait,
		}))

		const distance = (() => {
			const reach = ["character", "npc", "familiar"].includes(selfActor.type) ? selfActor.getReach({ action: "attack", weapon }) ?? null : null
			return selfToken?.object && target ? selfToken.object.distanceTo(target, { reach }) : null
		})()
		const targetInfo = target && target.actor && typeof distance === "number"
				? { token: target.document, actor: target.actor, distance }
				: null
		const notes = [stat.notes ?? [], this.context.extraNotes?.(stat.name) ?? []].flat()
		const substitutions = Check.extractRollSubstitutions(actor.synthetics.rollSubstitutions,[stat.name], finalOptions)

		const rollPromise = game.pf2e.Check.roll(
			check,
			{
				actor: selfActor,
				token: selfToken,
				createMessage: this.context.createMessage,
				target: targetInfo,
				dc,
				type: checkSlug,
				options: finalOptions,
				notes,
				substitutions,
				traits: traitObjects,
				title: dialogTitle,
				skipDialog: this.context.skipDialog,
				rollMode: this.context.rollMode,
			},
			this.context.event, //event
			(roll, outcome, message) => {
				this.context.callback?.({ actor, roll, outcome, message })
			}
		)
		return rollPromise.then((roll)=> {
			return new Promise((resolve, reject) => {
				resolve({roll, actor, target})
			})
		})
	}

	static note(selector, translationPrefix, outcome, translationKey) {
		const visibility = game.settings.get("pf2e", "metagame.showResults");
		const translated = game.i18n.localize(translationKey ?? `${translationPrefix}.Notes.${outcome}`);
		return {
			selector,
			text: `<p class="compact-text">${translated}</p>`,
			predicate: {},
			outcome: visibility === "all" ? [outcome] : []
		}
	}

	static getApplicableEquippedWeapons(actor, trait) {
		if (actor.isOfType("character"))
			return actor.data.data.actions.flatMap((s) => (s.ready && s.item.traits.has(trait) ? s.item : []))
		else
			return actor.itemTypes.weapon.filter((w) => w.isEquipped && w.traits.has(trait))
	}

	static getWeaponPotencyModifier(item, selector) {
		const itemBonus = item.data.data.runes.potency;
		const slug = "potency";
		if (game.settings.get("pf2e", "automaticBonusVariant") !== "noABP") {
			return new game.pf2e.Modifier({
				slug,
				type: MODIFIER_TYPE.POTENCY,
				label: item.name,
				modifier: item.actor.synthetics.weaponPotency["mundane-attack"]?.[0]?.bonus ?? 0,
				adjustments: Check.extractModifierAdjustments(item.actor.synthetics.modifierAdjustments, [selector], slug),
			})
		}
		else if (itemBonus > 0) {
			return new game.pf2e.Modifier({
				slug,
				type: MODIFIER_TYPE.ITEM,
				label: item.name,
				modifier: itemBonus,
				adjustments: Check.extractModifierAdjustments(item.actor.synthetics.modifierAdjustments, [selector], slug),
			})
		}
		else
			return null
	}

	static extractModifierAdjustments(adjustmentsRecord, selectors, slug) {
		const adjustments = Array.from(new Set(selectors.flatMap((s) => adjustmentsRecord[s] ?? [])))
		return adjustments.filter((a) => [slug, null].includes(a.slug))
	}

	static ensureProficiencyOption(options, rank) {
		if (rank >= 0) options.push(`skill:rank:${rank}`, PROFICIENCY_RANK_OPTION[rank]);
	}

	static extractRollSubstitutions(substitutions, domains, rollOptions) {
		return domains
			.flatMap((d) => deepClone(substitutions[d] ?? []))
			.filter((s) => s.predicate?.test(rollOptions) ?? true)
	}

	static defaultDialogTitle(token, target, action, checkSlug, statSlug) {
		let subtitle = ""

		if (checkSlug === 'skill-check' || checkSlug === 'perception-check')
			subtitle += i18n.skillCheck(statSlug)
		else if (checkSlug === 'attak-roll')
			subtitle += i18n.$("PF2E.AttackLabel")
		else if (checkSlug === 'spell-attak-roll')
			subtitle += i18n.$("PF2E.SpellAttackLabel")
		else if (checkSlug === 'saving-throw')
			subtitle += i18n.save(statSlug)

		return token.name + ":" + (action ? " " + i18n.action(action)  : "") + (subtitle ? " - " + subtitle : "")
	}

	static defaultCheckLabel(token, target, action, checkSlug, statSlug, actionGlyph) {
		let title = `<b>${token.name}</b> `
		if (action)
			title += `<b>${i18n.action(action)}</b> `
		if (actionGlyph)
			title += `<span class="pf2-icon">${actionGlyph}</span> `
		if (checkSlug === 'skill-check' || checkSlug === 'perception-check')
			title += `<p class="compact-text">(${i18n.skillCheck(statSlug)})</p> `
		else if (checkSlug === 'attak-roll')
			title += `<p class="compact-text">(${i18n.$("PF2E.AttackLabel")})</p> `
		else if (checkSlug === 'spell-attak-roll')
			title += `<p class="compact-text">(${i18n.$("PF2E.SpellAttackLabel")})</p> `
		else if (checkSlug === 'saving-throw')
			title += `<p class="compact-text">(${i18n.save(statSlug)})</p> `

		return title
	}

	static getCheckTypes(actor) {
		const checkTypes = ["perception", "fortitude", "reflex", "will"]
		Object.keys(actor.skills).forEach(skillName => {
			checkTypes.push("skill[" + skillName + "]")
		})
		actor.spellcasting.forEach(sc => {
			checkTypes.push("spell[" + sc.tradition + "]")
		})
		actor.data.data.actions.forEach(action => {
			if (action.type === 'strike' && action.ready)
				checkTypes.push("strike[" + action.slug + "]")
		})
		return checkTypes
	}

	static checkTypeToLabel(checkType) {
		if (checkType.startsWith("strike")) {
			const weapon = checkType.substring(7, checkType.length - 1)
			return i18n.$("PF2E.WeaponStrikeLabel") + " (" + (weapon === 'basic-unarmed' ? i18n.$("PF2E.MartialUnarmed") : i18n.weapon(weapon)) + ")"
		}
		else if (checkType.startsWith("skill"))
			return i18n.skillCheck(checkType.substring(6, checkType.length - 1))
		else if (checkType === 'perception')
			return i18n.skillCheck(checkType)
		else if (["fortitude", "reflex", "will"].includes(checkType))
			return i18n.save(checkType)
		else if (checkType.startsWith("spell"))
			return i18n.spellAttack(checkType.substring(6, checkType.length - 1))
		else
			throw new Error("Illegal check type : " + checkType)
	}
}