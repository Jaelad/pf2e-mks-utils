import {default as i18n} from "../lang/pf2e-i18n.js"
import {ACTION_GLYPH, ROLL_MODE} from "./constants.js"
import Compendium from "./compendium.js"
import Check from "./check.js"
import $$lang from "../utils/lang.js"
import CommonUtils from "./helpers/common-utils.js"
import {Engagement, Engagements} from "./model/engagement.js"
import ObjectColl from "./model/object-coll.js"
import $$strings from "../utils/strings.js"
import DCHelper from "./helpers/dc-helper.js"

export default class Action {

	constructor(MKS, name, mode = 'encounter', gmActs = false, gmApplies = true,
				{icon = ACTION_GLYPH[''], tags = ['basic'], actionGlyph = 'A'
				, requiresEncounter = false, targetCount, opposition = 'all'}) {
		this._ = MKS
		this.name = name
		this.mode = mode
		this.gmActs = gmActs
		this.gmApplies = gmApplies

		this.icon = icon
		this.tags = tags
		this.actionGlyph = actionGlyph
		this.requiresEncounter = requiresEncounter
		this.targetCount = targetCount
		this.opposition = opposition
	}

	async run(options) {
		const runner = new ActionRunner(this)
		return runner.run(options, true)
	}

	initialize() {
	}

	get properties() {
		return {
			label: i18n.action(this.name),
			icon: this.icon,
			actionGlyph: this.actionGlyph,
			tags: this.tags
		}
	}

	showSheet() {
		const compendium = Compendium['ACTION_' + $$strings.underscored(this.name)]
		this._.compendiumShow(compendium).then()
	}

	relevant(warn) {
		const selected = this._.ensureOneSelected(warn, this.requiresEncounter)
		if (!selected) return

		if (this.targetCount === 1) {
			const targeted = this._.ensureOneTarget(null, warn)
			if (!targeted || targeted.id === selected.id) return
			const engagement = new Engagement(selected, targeted)
			const oppositionOk = this.opposition === 'ally' || (this.opposition === 'ally' && engagement.isAlly) || (this.opposition === 'enemy' && engagement.isEnemy)
			if (warn && !oppositionOk)
				this._.warn("PF2E.MKS.Warning.Target.MustBe" + $$strings.camelize(this.opposition))
			const ok = oppositionOk && this.pertinent(engagement, warn)
			return ok ? engagement : undefined
		}
		else if (this.targetCount > 1) {
			const targets = this._.ensureAtLeastOneTarget(null, warn)
			if (!targets || targets.find(t => t.id === selected.id)) return
			const engagement = new Engagements(selected, targets)
			const oppositionOk = this.opposition === 'ally' || (this.opposition === 'ally' && engagement.isAlly) || (this.opposition === 'enemy' && engagement.isEnemy)
			if (warn && !oppositionOk)
				this._.warn("PF2E.MKS.Warning.Target.MustBe" + $$strings.camelize(this.opposition))
			const ok = oppositionOk && this.pertinent(engagement, warn)
			return ok ? engagement : undefined
		}
		else  {
			if (this.targetCount === 0 && this._.getTargets()?.size > 0) {
				if (warn) this._.warn("PF2E.MKS.Warning.Target.NoneMustBeSelected")
				return
			}
			const engagement = new Engagement(selected)
			const ok = this.pertinent(engagement, warn)
			return ok ? engagement : undefined
		}
	}

	pertinent(engagement, warn) {
		return true
	}

	// simply returns action result object
	async act(engagement, options) {}

	async apply(engagement, result) {
		if (result?.roll?.degreeOfSuccess > -1)
			this.resultToChat(engagement.initiator, result.roll.degreeOfSuccess)
	}

	createResult(engagement, roll, options) {
		return {
			engagement: engagement.initiator ? engagement.participants : ObjectColl.serialize(engagement),
			roll: {
				die: roll?.dice?.[0]?.total,
				total: roll?.total,
				degreeOfSuccess: roll?.degreeOfSuccess,
				options: roll?.options
			},
			options
		}
	}

	resultToChat(token, degreeOfSuccess) {
		const actionName = i18n.action(this.name)
		const noteText = i18n.actionNote(this.name, degreeOfSuccess)
		if (!noteText)
			return

		const chatMessage =	`
		<div class="pf2e chat-card action-card">
            <header class="card-header flexrow">
                <img src="${ACTION_GLYPH[this.actionGlyph].img}" title="${actionName}" width="36" height="36">
                <h3>${actionName}</h3>
            </header>
    		<p>${noteText}</p>
		</div>
		`
		const chatData = {
			speaker: {
				actor: token.actor.id,
				token: token.id,
				scene: canvas.scene.id,
				alias: token.name
			},
			content: chatMessage,
			blind: true,
			whisper: [game.user.id]
		}
		if (game.user.isGM)
			ChatMessage.create(chatData, {rollMode: ROLL_MODE.BLIND})
		else
			this._.socketHandler.emit('GmChatMessage', chatData, true)
	}

	messageToChat(token, message, priv = false, rollMode = ROLL_MODE.PUBLIC) {
		const actionName = i18n.action(this.name)

		const chatMessage =	`
		<div class="pf2e chat-card action-card">
            <header class="card-header flexrow">
                <img src="${ACTION_GLYPH[this.actionGlyph].img}" title="${actionName}" width="36" height="36">
                <h3>${actionName}</h3>
            </header>
    		<p>${message}</p>
		</div>
		`
		const chatData = {
			speaker: {
				actor: token.actor.id,
				token: token.id,
				scene: canvas.scene.id,
				alias: token.name
			},
			content: chatMessage
		}
		if (priv)
			chatData.whisper = CommonUtils.findGM().id
		ChatMessage.create(chatData, {rollMode})
	}
}

export class SimpleAction extends Action {
	constructor(MKS, name, mode = 'encounter', gmActs = false, gmApplies = true, {
		icon = ACTION_GLYPH['']
		, tags = ['basic']
		, requiresEncounter = false
		, actionGlyph = 'A'
		, targetCount
		, opposition = "all"
		,traits,
		checkType,
		dc
	}) {
		super(MKS, name, mode, gmActs, gmApplies, {icon, tags, actionGlyph, requiresEncounter, targetCount, opposition})
		this.traits = traits
		this.checkType = checkType
		this.dc = dc
	}

	async act(engagement, options) {
		const overrideDC = options?.overrideDC

		const rollCallback = ({roll, actor}) => {
			return this.createResult(engagement, roll, options)
		}
		
		const check = new Check({
			action: this.name,
			actionGlyph: this.actionGlyph,
			rollOptions: ["action:" + game.pf2e.system.sluggify(this.name)],
			extraOptions: ["action:" + game.pf2e.system.sluggify(this.name)],
			traits: this.traits,
			checkType: this.checkType,
			difficultyClass: overrideDC > 0 ? overrideDC : $$lang.isFunction(this.dc) ? engagement.getTargetDC(this.dc) : null,
			askGmForDC: {
				action: this.name,
				defaultDC: typeof this.dc === 'number' ? this.dc : null
			}
		})
		const result = check.roll(engagement).then(rollCallback)
		return result
	}
}

export class SystemAction extends Action {
	constructor(MKS, name, mode = 'encounter', gmActs = false, gmApplies = true, {
				icon = ACTION_GLYPH['']
				, tags = ['basic']
				, actionGlyph = 'A'
				, requiresEncounter = false,
				targetCount,
				opposition = 'all',
				dc = undefined
			}) {
		super(MKS, name, mode, gmActs, gmApplies, {icon, tags, actionGlyph, requiresEncounter, targetCount, opposition})
		this.dc = dc
	}

	async act(engagement, options) {
		const actor = engagement.initiator.actor
		let difficultyClass = undefined
		if (this.dc) {
			const dcObj = await DCHelper.requestGmSetDC({action: this.name, defaultDC: this.dc, challenger: actor.name})
			difficultyClass = dcObj?.dc
		}
		const systemRoll = await new Promise((resolve, reject) => {
			const callback = (result) => {
				resolve(result.roll)
			}
			game.pf2e.actions[this.name]({ actors: engagement.initiator.actor, callback, difficultyClass})
		})
		return this.createResult(engagement, systemRoll)
	}

	async apply(engagement, result) {
	}
}

export class ActionRunner {
	constructor(action) {
		this.action = action
	}

	async run(options, warn = false) {
		const gm = game.user.isGM
		const engagement = this.action.relevant(warn)
		if (engagement) {
			if (!this.action.gmActs || gm) {
				const result = await this.action.act(engagement, options)
				if (!result) return
				if (!this.action.gmApplies || gm) {
					this.action.apply(engagement, result)
				}
				else {
					const eventData = {
						action: this.action.name,
						result
					}
					game.MKS.socketHandler.emit('GmAppliesActionResult', eventData, true)
				}
			}
			else {
				const eventData = {
					action: this.action.name,
					engagement: engagement.initiator ? engagement.participants : engagement.serialize(),
					options
				}
				game.MKS.socketHandler.emit('GmTakesAction', eventData, true)
			}
		}
	}

	async actByGM(request) {
		const engagement = request.engagement.initiator ? Engagement.from(request.engagement) : ObjectColl.deserialize(request.engagement)
		if (!engagement)
			return

		const result = await this.action.act(engagement, request.options)
		this.action.apply(engagement, result)
	}

	async applyByGM(result) {
		const engagement = result.engagement.initiator ? Engagement.from(result.engagement) : ObjectColl.deserialize(result.engagement)
		if (!engagement)
			return

		return this.action.apply(engagement, result)
	}
}

export const RUDIMENTARY_ACTIONS = {
	aid: {icon: "systems/pf2e/icons/spells/efficient-apport.webp", compendium: Compendium.ACTION_AID, mode: 'encounter'},
	step: {icon: 'systems/pf2e/icons/spells/synchronise-steps.webp', compendium: Compendium.ACTION_STEP, mode: 'encounter'},
	stride: {icon: 'systems/pf2e/icons/spells/fleet-step.webp', compendium: Compendium.ACTION_STRIDE, mode: 'encounter'},
	interact: {icon: 'systems/pf2e/icons/spells/mage-hand.webp', compendium: Compendium.ACTION_INTERACT, mode: 'encounter'},
	mount: {icon: 'systems/pf2e/icons/spells/phantom-steed.webp', compendium: Compendium.ACTION_MOUNT, mode: 'encounter'},
	ready: {icon: 'systems/pf2e/icons/features/feats/cavaliers-banner.webp', compendium: Compendium.ACTION_READY, mode: 'encounter'},
	release: {icon: 'systems/pf2e/icons/spells/mending.webp', compendium: Compendium.ACTION_RELEASE, mode: 'encounter'},
	sustainASpell: {icon: 'systems/pf2e/icons/spells/faerie-dust.webp', compendium: Compendium.ACTION_SUSTAIN_A_SPELL, mode: 'encounter'},
	sustainAnActivation: {icon: 'systems/pf2e/icons/spells/friendfetch.webp', compendium: Compendium.ACTION_SUSTAIN_AN_ACTIVATION, mode: 'encounter'},
	crawl: {icon: 'systems/pf2e/icons/spells/uncontrollable-dance.webp', compendium: Compendium.ACTION_CRAWL, mode: 'encounter'},
	leap: {icon: 'systems/pf2e/icons/spells/wind-jump.webp', compendium: Compendium.ACTION_LEAP, mode: 'encounter'},
	pointOut: {icon: 'systems/pf2e/icons/spells/object-memory.webp', compendium: Compendium.ACTION_POINT_OUT, mode: 'encounter'},
	avertGaze: {icon: 'systems/pf2e/icons/spells/veil-of-dreams.webp', compendium: Compendium.ACTION_AVERT_GAZE, mode: 'encounter'},
	
	defend: {icon: 'systems/pf2e/icons/spells/rebounding-barrier.webp', compendium: Compendium.ACTION_DEFEND, mode: 'exploration'},
	detectMagic: {icon: 'systems/pf2e/icons/spells/detect-magic.webp', compendium: Compendium.ACTION_DETECT_MAGIC, mode: 'exploration'},
	followTheExpert: {icon: 'systems/pf2e/icons/spells/perseiss-precautions.webp', compendium: Compendium.ACTION_FOLLOW_THE_EXPERT, mode: 'exploration'},
	hustle: {icon: 'systems/pf2e/icons/spells/triple-time.webp', compendium: Compendium.ACTION_HUSTLE, mode: 'exploration'},
	investigate: {icon: 'systems/pf2e/icons/spells/anticipate-peril.webp', compendium: Compendium.ACTION_INVESTIGATE, mode: 'exploration'},
	refocus: {icon: 'systems/pf2e/icons/spells/perfected-mind.webp', compendium: Compendium.ACTION_REFOCUS, mode: 'exploration'},
	repeatASpell: {icon: 'systems/pf2e/icons/spells/read-fate.webp', compendium: Compendium.ACTION_REPEAT_A_SPELL, mode: 'exploration'},
	scout: {icon: 'systems/pf2e/icons/spells/vision-of-weakness.webp', compendium: Compendium.ACTION_SCOUT, mode: 'exploration'},
	search: {icon: 'systems/pf2e/icons/spells/far-sight.webp', compendium: Compendium.ACTION_SEARCH, mode: 'exploration'},
	
	retraining: {icon: 'systems/pf2e/icons/spells/scouring-pulse.webp', compendium: Compendium.ACTION_RETRAINING, mode: 'downtime'},
}