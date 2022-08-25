import Compendium from "./compendium.js"

export default class MksUtils {
	static i18n = (toTranslate) => game.i18n.localize(toTranslate)

	static MODULEID = 'pf2e-tools-mks'
	static FOUNDRY_VERSION = 0
	static GAME_SYSTEM = null
	static LOG_LEVEL = {
		Debug: 0,
		Info: 1,
		Warn: 2,
		Error: 3
	}
	static REGEX_SPELLCASTING_SELECTOR = /spell\[(arcane|primal|divine|occult)]/
	static REGEX_SKILL_SELECTOR = /skill\[(\w+)]/
	static REGEX_STRIKE_SELECTOR = /strike\[(\w+)]/

	constructor() {
		this.initHooks()

		MksUtils.FOUNDRY_VERSION = game.version ?? game.data.version
		MksUtils.GAME_SYSTEM = game.system?.id ?? game.data.system.id
		this.systemSupported = /pf2e/.exec(MksUtils.GAME_SYSTEM) !== null
	}

    static withTemplate = (template, vars = {}) => {
        const handler = new Function('vars', [
            'const tagged = ( ' + Object.keys(vars).join(', ') + ' ) =>',
            '`' + template + '`',
            'return tagged(...Object.values(vars))'
        ].join('\n'))

        return handler(vars)
    }

	static escapeHtml(html) {
		const text = document.createTextNode(html);
		const p = document.createElement('p');
		p.appendChild(text);
		return p.innerHTML;
	}

	static log(force, level, ...args) {
		const shouldLog = force || game.modules.get('_dev-mode')?.api?.getPackageDebugValue(MksUtils.MODULEID)

		if (shouldLog) {
			switch (level) {
				case MksUtils.LOG_LEVEL.Error:
					console.error("MKS Utils", '|', ...args)
					break
				case MksUtils.LOG_LEVEL.Warn:
					console.warn("MKS Utils", '|', ...args)
					break
				case MksUtils.LOG_LEVEL.Info:
					console.info("MKS Utils", '|', ...args)
					break
				case MksUtils.LOG_LEVEL.Debug:
				default:
					console.debug("MKS Utils", '|', ...args)
					break
			}
		}
	}

	static debug(...args) {
		MksUtils.log(true, MksUtils.LOG_LEVEL.Debug, ...args)
	}
	static info(...args) {
		MksUtils.log(true, MksUtils.LOG_LEVEL.Info, ...args)
	}
	static warn(...args) {
		MksUtils.log(true, MksUtils.LOG_LEVEL.Warn, ...args)
	}
	static error(...args) {
		MksUtils.log(true, MksUtils.LOG_LEVEL.Error, ...args)
	}

	initHooks() {

	}

	_getTokenById(tokenId) {
		//return canvas.tokens.placeables.find(t => t.id === tokenId)
		return game.scenes.active.tokens.get(tokenId)
	}

	_ensureOneSelected() {
		let tokens = canvas.tokens.controlled
		if (tokens.length != 1) {
			const warning = MksUtils.i18n("pf2e.mks.warning.actor.onemustbeselected")
			ui.notifications.warn(warning)
			throw new Error(warning)
		}
		return tokens[0]
	}

	_ensureAtLeastOneSelected() {
		let tokens = canvas.tokens.controlled
		if (tokens.length < 1) {
			const warning = MksUtils.i18n("pf2e.mks.warning.actor.atleastonemustbeselected")
			ui.notifications.warn(warning)
			throw new Error(warning)
		}
		return tokens
	}

	_ensureOneTarget(player) {
		let tokens
		if (player)
			tokens = game.users.players.find(p => p.name == player).targets
		else
			tokens = game.user.targets
		if (tokens.size != 1) {
			const warning = MksUtils.i18n("pf2e.mks.warning.target.onemustbeselected")
			ui.notifications.warn(warning)
			throw new Error(warning)
		}
		return Array.from(tokens)[0]
	}

	_ensureAtLeastOneTarget(player) {
		let tokens
		if (player)
			tokens = game.users.players.find(p => p.name === player).targets
		else
			tokens = game.user.targets
		if (tokens.length < 1) {
			const warning = MksUtils.i18n("pf2e.mks.warning.target.atleastonemustbeselected")
			ui.notifications.warn(warning)
			throw new Error(warning)
		}
		return Array.from(tokens)
	}

	_localSave(key, value, actor = null) {
		const storeKey = (actor ? actor.id + "/" : "") + key
		const storeValue = JSON.stringify(value)
		localStorage.setItem(storeKey, storeValue)
		MksUtils.info("Store: " + storeKey + ":" + storeValue)
	}

	_localLoad(key, actor = null) {
		const storeKey = (actor ? actor.id + "/" : "") + key
		const storeValue = localStorage.getItem(storeKey)
		return JSON.parse(storeValue)
	}

	_localDelete(key, actor = null) {
		const storeKey = (actor ? actor.id + "/" : "") + key
		localStorage.removeItem(storeKey)
	}

	getAttackActionStats(ready=null) {
		let actor = this._ensureOneSelected().actor
		if (!actor) return

		return actor.data.data.actions.filter(a => ready === null || a.ready === ready)
	}

    getSkillStat(skill) {
        let actor = this._ensureOneSelected().actor
        if (!actor) return

        return actor.skills[skill]
    }

	getSkillStats(proficiencyRankThreshold=null) {
		let actor = this._ensureOneSelected().actor
		if (!actor) return

		let skillStats = Object.entries(actor.skills).map(([key, skill]) => {
			if (proficiencyRankThreshold === null || skill.rank >= proficiencyRankThreshold)
				return skill
		})
		return skillStats.filter(s => s)
	}

	getCheckTypes(actor) {
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

	getStat(actor, type) {
		let match, stat

		if (type === "ac")
			stat = actor.attributes.ac
		else if (type === "perception")
			stat = actor.perception
		else if (type === "class")
			stat = actor.attributes.classDC
		else if (type === "fortitude")
			stat = actor.saves.fortitude
		else if (type === "reflex")
			stat = actor.saves.reflex
		else if (type === "will")
			stat = actor.saves.will
		else if (type === "spell")
			stat = actor.spellcasting.find(sc => true)?.statistic
		else if (match = MksUtils.REGEX_SPELLCASTING_SELECTOR.exec(type)) {
			let tradition = match[1]
			stat = actor.spellcasting.find(sc => sc.tradition === tradition)?.statistic
		}
		else if (match = MksUtils.REGEX_SKILL_SELECTOR.exec(type)) {
			let skill = match[1]
			stat = actor.skills[skill]
		}
		else if (match = MksUtils.REGEX_STRIKE_SELECTOR.exec(type)) {
			let slug = match[1]
			stat = actor.data.data.actions.find(strike => strike.slug === slug)
		}
		if (!stat)
			throw new Error("Illegal stat type : " + type)
		return stat
	}

	_getDefaultDomain(checkType) {
		if (checkType === "perception")
			return "perception-check"
		else if (checkType === "fortitude" || checkType === "reflex" || checkType === "will")
			return "saving-throw"
		else if (checkType.startsWith("skill"))
			return "skill-check"
		else if (checkType.startsWith("spell"))
			return "spell-attack"
		else
			throw new Error("Illegal check type : " + checkType)
	}

	_prepareCheckContext(actor, checkType, domain, dc = null, dcVisibility = 'gm') {
		const context = {
			actor,
			type: domain,
			stat: this.getStat(actor, checkType),
			options: actor.getRollOptions([domain]),
			notes: null
		}

		if (!context.stat)
			throw new Error("Cannot find stat : " + checkType)
		context.notes = context.stat.notes

		if (dc > 0)
			context.dc = {value: dc, visibility: dcVisibility}

		return context
	}

	// dcType examples: "ac" | "perception" | "fortitude" | "reflex" | "will" | "class" | "spell[arcane]" | "skill[athletics]"
	// dcReduce: "max" | "min" | "avg"
	// dcVisibility?: "none" | "gm" | "owner" | "all"
	check(tokens, targets, checkType, dcType ,domain = null, playerWhoTargets = null, dcReduce = "max", dcVisibility = 'gm', messageTemplate = null) {
		let dc = this.resolveDC(targets, dcType, dcReduce)
		return this.checkStatic(tokens, checkType, domain, dc, dcVisibility, messageTemplate)
	}

	// dcVisibility?: "none" | "gm" | "owner" | "all"
	checkStatic(tokens, checkType, domain = null, dc = null, dcVisibility = 'gm', messageTemplate = null) {
		if (!domain)
			domain = this._getDefaultDomain(checkType)

		if (!messageTemplate)
			messageTemplate = MksUtils.i18n("pf2e.mks.check."+ domain +".defaulttitle.firstpart")
				+ (dc > 0 && dcVisibility === 'all' ? " " + MksUtils.i18n("pf2e.mks.check.defaulttitle.dcpart") : "")

		const promises = {}
		tokens.forEach(token => {
			const actor = token.actor
			const context = this._prepareCheckContext(actor, checkType, domain, dc, dcVisibility)
			const stat = context.stat
			delete context.stat
			let message = MksUtils.withTemplate(messageTemplate, {actor, stat, dc})

			promises[token.id] = game.pf2e.Check.roll(new game.pf2e.CheckModifier(message, stat, []), context)
		})
		return promises
	}

	// type examples: "ac" | "perception" | "fortitude" | "reflex" | "will" | "class" | "spell[arcane]" | "skill[athletics]"
	// reduce: "max" | "min" | "avg"
	resolveDC(actors, type, reduce = "max") {
		if (!Array.isArray(actors))
			actors = [actors]
		let dcs = []
		actors.forEach(actor => {
			let stat = this.getStat(actor, type)
			dcs.push(stat.dc ? stat.dc.value : stat.value ?? 0)
		})

		switch (reduce) {
			case "max": return Math.max(dcs)
			case "min": return Math.min(dcs)
			case "avg": return dcs.reduce((a, b) => a + b, 0) / dcs.length
			default: throw new Error("Illegal reduce operation : " + reduce)
		}
	}

	tokensTurnInCombat(token) {
		return token.inCombat && token.combatant.encounter.started && token.combatant.encounter.current.tokenId === token.id
	}

	onCheckRoll(token, checkRoll, pf2e) {
		const traits = pf2e.context?.traits
		const attackTrait = traits?.find(t => t.name === "attack")
		if (attackTrait && this.tokensTurnInCombat(token)) {
			this.incrementEffect(token.actor, Compendium.EFFECT_MULTIPLE_ATTACK).then()
		}

		const aided = pf2e.modifiers.find(mod => mod.slug === 'aided')
		if (aided)
			this.removeEffect(token.actor, Compendium.EFFECT_AIDED).then()
	}

	async onCreateEffect(effect, options, userId) {
		if (effect.sourceId === Compendium.EFFECT_AID_READY && game.user.isGM) {
			this.actions.aid.setDC(effect)
		}
	}

	getEffect(actor, effectSourceId) {
		return actor?.itemTypes?.effect.find((e) => e.flags.core?.sourceId === effectSourceId)
	}

	async incrementEffect(actor, effectSourceId, flags, changes) {
		const existingEffect = this.getEffect(actor, effectSourceId)
		if (existingEffect) {
			const updates = {_id: existingEffect.id}
			const badge = existingEffect.system?.badge
			if (badge && badge.type === 'counter' && badge.value > 0) {
				updates["data.badge"] = {type: "counter", value: existingEffect.system.badge.value + 1}
				//await actor.updateEmbeddedDocuments("Item", [{ _id: existingEffect.id, "data.badge": {type:"counter", value: existingEffect.system.badge.value + 1} }])
			}
			for (let flagKey in flags) {
				updates["flags." + flagKey] = flags[flagKey]
			}
			await actor.updateEmbeddedDocuments("Item", [updates])
		}
		else {
			const effect = await fromUuid(effectSourceId)
			const effectData = effect.toObject()
			for (let flagKey in flags) {
				effectData.flags[flagKey] = flags[flagKey]
			}
			for (let change in changes) {
				const val = changes[change]
				eval("effectData." + change + "=" + val)
			}
			await actor.createEmbeddedDocuments("Item", [effectData])
		}
	}

	async decrementEffect(actor, effectSourceId) {
		const existingEffect = this.getEffect(actor, effectSourceId)
		if (existingEffect) {
			const badge = existingEffect.system?.badge
			if (badge && badge.type === 'counter' && badge.value > 1)
				await actor.updateEmbeddedDocuments("Item", [{ _id: existingEffect.id, "data.badge": {type:"counter", value: existingEffect.system.badge.value - 1} }])
			else
				await existingEffect.delete()
		}
	}

	async updateEffectFlags(actor, effectSourceId, flags) {
		const existingEffect = this.getEffect(actor, effectSourceId)
		if (existingEffect) {
			const updates = {_id: existingEffect.id}
			for (let flagKey in flags) {
				updates["flags." + flagKey] = flags[flagKey]
			}
			await actor.updateEmbeddedDocuments("Item", [updates])
		}
	}

	async removeEffect(actor, effectSourceId) {
		const existingEffect = this.getEffect(actor, effectSourceId)
		if (existingEffect) {
			await existingEffect.delete()
		}
	}

	async incrementCondition(actor, conditionSlug, value = 1, flags) {
		const condition = actor.itemTypes.condition.find(c => c.slug === conditionSlug)
		if (condition) {
			if (condition?.badge?.value > 0) {
				return await game.pf2e.ConditionManager.updateConditionValue(condition.id, actor, condition?.badge?.value + value)
			}
			else
				return condition
		}
		else
			return await game.pf2e.ConditionManager.addConditionToActor(conditionSlug, actor)
	}

	async decrementCondition(actor, conditionSlug, value = 1) {
		const condition = actor.itemTypes.condition.find(c => c.slug === conditionSlug)
		if (condition) {
			if (condition?.badge?.value > value) {
				game.pf2e.ConditionManager.updateConditionValue(condition.id, actor, condition?.badge?.value - value).then()
			}
			else
				game.pf2e.ConditionManager.removeConditionFromActor(condition.id, actor).then()
		}
	}

	async updateConditionFlags(actor, conditionSlug, flags) {
		const condition = actor.itemTypes.condition.find(c => c.slug === conditionSlug)
		if (condition) {
			const updates = {_id: condition.id}
			for (let flagKey in flags) {
				updates["flags." + flagKey] = flags[flagKey]
			}
			await actor.updateEmbeddedDocuments("Item", [updates])
		}
	}

	async onStartTurn(combatant) {
		await this.removeEffect(combatant.actor, Compendium.EFFECT_MULTIPLE_ATTACK)

		this.onTurnCompleted(combatant.parent).then()
	}

	async onEndTurn(combatant) {
		await this.removeEffect(combatant.actor, Compendium.EFFECT_MULTIPLE_ATTACK)
	}

	async onTurnCompleted(encounter) {
		const tokenId = encounter.previous.tokenId
		const token = this._getTokenById(tokenId)
		const effects = token.actor.itemTypes.effect
		effects.forEach(effect => {
			if (effect.slug === 'effect-grabbing') {
				if (effect.isExpired) {
					const grabbedTokenId = effect.flags?.mks?.grapple?.grabbed
					grabbedTokenId && this.actions.grapple.grabbingExpired(grabbedTokenId)
					effect.delete().then()
				}
			}
		})
	}
}

export class Action {
	constructor(MKS) {
		this._ = MKS
	}

	isPossible() {
		return true
	}
}
