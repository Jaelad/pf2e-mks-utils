export default class MksUtils {
	static i18n = (toTranslate) => game.i18n.localize(toTranslate)

	static MODULEID = 'pf2e-utils-mks'
	static FOUNDRY_VERSION = 0
	static GAME_SYSTEM = null
	static LOG_LEVEL = {
		Debug: 0,
		Info: 1,
		Warn: 2,
		Error: 3
	}
	static REGEX_SPELLCASTING_SELECTOR = /spell\[(arcane|primal|divine|occult)\]/
	static REGEX_SKILL_SELECTOR = /skill\[(\w+)\]/

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

	_ensureOneActor(player) {
		let tokens = canvas.tokens.controlled
		if (tokens.length != 1) {
			const warning = MksUtils.i18n("utils.mks.warning.actor.onemustbeselected")
			ui.notifications.warn(warning)
			throw new Error(warning)
		}
		return tokens[0].actor
	}

	_ensureAtLeastOneActor(player) {
		let tokens = canvas.tokens.controlled
		if (tokens.length < 1) {
			const warning = MksUtils.i18n("utils.mks.warning.actor.atleastonemustbeselected")
			ui.notifications.warn(warning)
			throw new Error(warning)
		}
		return tokens.map(token => token.actor)
	}

	_ensureOneTarget(player) {
		let tokens
		if (player)
			tokens = game.users.players.find(p => p.name == player).targets
		else
			tokens = game.user.targets
		if (tokens.size != 1) {
			const warning = MksUtils.i18n("utils.mks.warning.target.onemustbeselected")
			ui.notifications.warn(warning)
			throw new Error(warning)
		}
		return Array.from(tokens)[0].actor
	}

	_ensureAtLeastOneTarget(player) {
		let tokens
		if (player)
			tokens = game.users.players.find(p => p.name == player).targets
		else
			tokens = game.user.targets
		if (tokens.length < 1) {
			const warning = MksUtils.i18n("utils.mks.warning.target.atleastonemustbeselected")
			ui.notifications.warn(warning)
			throw new Error(warning)
		}
		return Array.from(tokens).map(token => token.actor)
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
		let actor = this._ensureOneActor()
		if (!actor) return

		return actor.data.data.actions.filter(a => ready === null || a.ready === ready)
	}

    getSkillStat(skill) {
        let actor = this._ensureOneActor()
        if (!actor) return

        return actor.skills[skill]
    }

	getSkillStats(proficiencyRankThreshold=null) {
		let actor = this._ensureOneActor()
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
			stat = actor.spellcasting.find(sc => sc.tradition == tradition)?.statistic
		}
		else if (match = MksUtils.REGEX_SKILL_SELECTOR.exec(type)) {
			let skill = match[1]
			stat = actor.skills[skill]
		}
		else
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
	check(checkType, dcType ,domain = null, playerWhoTargets = null, dcReduce = "max", dcVisibility = 'gm', messageTemplate = null) {
		let targets = this._ensureAtLeastOneTarget(playerWhoTargets)
		let dc = this.resolveDC(targets, dcType, dcReduce)
		return this.checkStatic(checkType, domain, dc, dcVisibility, messageTemplate)
	}

	// dcVisibility?: "none" | "gm" | "owner" | "all"
	checkStatic(checkType, domain = null, dc = null, dcVisibility = 'gm', messageTemplate = null) {
		let actors = this._ensureAtLeastOneActor()
		if (!actors || actors.length < 1) return

		if (!domain)
			domain = this._getDefaultDomain(checkType)

		if (!messageTemplate)
			messageTemplate = MksUtils.i18n("utils.mks.check."+ domain +".defaulttitle.firstpart")
				+ (dc > 0 && dcVisibility == 'all' ? " " + MksUtils.i18n("utils.mks.check.defaulttitle.dcpart") : "")

		const promises = {}
		actors.forEach(actor => {
			const context = this._prepareCheckContext(actor, checkType, domain, dc, dcVisibility)
			const stat = context.stat
			delete context.stat
			let message = MksUtils.withTemplate(messageTemplate, {actor, stat: stat, dc})

			let promise = game.pf2e.Check.roll(new game.pf2e.CheckModifier(message, stat, []), context)
			promises[actor.id] = promise
		})
		return promises
	}

	// visibility?: "none" | "gm" | "owner" | "all"
	// skillCheckAgainstStaticDC(skill, messageTemplate, dc = null, dcVisibility = 'gm') {
    //     let actors = this._ensureAtLeastOneActor()
    //     if (!actors || actors.length < 1) return
	//
	// 	if (!messageTemplate)
	// 		messageTemplate = this.i18n("utils.mks.skill.roll.check.defaulttitle.firstpart")
	// 			+ (dc > 0 && dcVisibility == 'all' ? " " + this.i18n("utils.mks.skill.roll.check.defaulttitle.dcpart") : "")
	//
    //     const promises = {}
	//
    //     actors.forEach(actor => {
    //         let skillStat = actor.skills[skill]
    //         let message = MksUtils.withTemplate(messageTemplate, {actor, skill: skillStat, dc})
	//
    //         const options = actor.getRollOptions(['skill-check']);
    //         const context = {
    //             actor: actor,
    //             type: 'skill-check',
    //             options,
    //             notes: skillStat.notes
    //         }
    //         if (dc > 0)
    //             context.dc = {value: dc, visibility: dcVisibility}
	//
    //         let promise = game.pf2e.Check.roll(new game.pf2e.CheckModifier(message, skillStat, []), context)
    //         promises[actor.id] = promise
    //     })
	//
    //     return promises
    // }

	// dcType examples: "ac" | "perception" | "fortitude" | "reflex" | "will" | "class" | "spell[arcane]" | "skill[athletics]"
	// dcReduce: "max" | "min" | "avg"
	// dcVisibility?: "none" | "gm" | "owner" | "all"
	// skillCheck(skill, dcType, playerWhoTargets, dcReduce = "max", dcVisibility = 'gm', messageTemplate) {
	// 	let targets = this._ensureAtLeastOneTarget(playerWhoTargets)
	// 	let dc = this.resolveDC(targets, dcType, dcReduce)
	// 	return this.skillCheckAgainstStaticDC(skill, messageTemplate, dc, dcVisibility)
	// }

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

	async test(actor) {
		const ITEM_UUID = "Compendium.pf2e.feature-effects.AHMUpMbaVkZ5A1KX"

		const item = await fromUuid(ITEM_UUID);
		console.info(item)
		actor.createEmbeddedDocuments("Item", [item.toObject()])

		// let existing = actor.items.find(e => e.name === item.name);
		// if (existing) {
		// 	await actor.deleteOwnedItem(existing._id);
		// }
		// else {
		// 	let owneditemdata = await actor.createOwnedItem(item);
		// 	owneditemdata.data.start.value = game.time.worldTime;
		// }
	}
}
/*
let spellCasting = actor.data.items.find(i => i.type == 'spellcastingEntry')
console.log(spellCasting.statistic)
const options = actor.getRollOptions(['arcane-spell-attack']);
let promise = game.pf2e.Check.roll(
	new game.pf2e.CheckModifier("TEST", spellCasting.statistic.check, []), {
	  actor: actor, type: 'arcane-spell-attack',
	  options, notes: [],
	  dc: {
		value: 20
	  }
	},
	event
  )
promise.
	then(function (value) {
		console.log(value);
	}).
	catch(function (err) {
		console.log(err);
	});

*/

/*
	const isSuccess = await (async (): Promise<boolean> => {
        const existingEffect = actor.itemTypes.effect.find((e) => e.flags.core?.sourceId === ITEM_UUID);
        if (existingEffect) {
            await existingEffect.delete();
            return false;
        }

        if (shield?.isBroken === false) {
            const effect = await fromUuid(ITEM_UUID);
            if (!(effect instanceof EffectPF2e)) {
                throw ErrorPF2e("Raise a Shield effect not found");
            }
            await actor.createEmbeddedDocuments("Item", [effect.toObject()]);
            return true;
        } else if (shield?.isBroken) {
            ui.notifications.warn(
                game.i18n.format(translations.ShieldIsBroken, { actor: speaker.alias, shield: shield.name })
            );
            return false;
        } else {
            ui.notifications.warn(game.i18n.format(translations.NoShieldEquipped, { actor: speaker.alias }));
            return false;
        }
    })();
*/