import {default as i18n} from "../../lang/pf2e-i18n.js"
import Action from "../action.js"
import CommonUtils from "../helpers/common-utils.js"
import Effect, { EFFECT_MOUNTED } from "../model/effect.js"
import { Engagement } from "../model/engagement.js"

export default class ActionMount extends Action {

	constructor(MKS) {
		super(MKS, 'mount', 'encounter', false, false, {
			icon: "systems/pf2e/icons/equipment/worn-items/companion-items/waverider-barding.webp",
			actionGlyph: 'A',
			tags: ['move']
		})
	}

	pertinent(engagement, warn) {
		const mount = canvas.tokens.ownedTokens.find((t) => {
			const e = new Engagement(engagement.initiator, t)
			return e.isAdjacent && ((e.isAlly && e.targetHasTrait('animal')) || t.actor.type === 'vehicle') && e.sizeDifference <= -1
		})
		if (mount)
			engagement.options.mountId = mount.id
		else if (warn)
			this._.warn("PF2E.Actions.Mount.Warning.NoAvail")

		return !!mount
	}

	async act(engagement, options) {
		const mount = CommonUtils.getTokenById(engagement.options.mountId)
		const ele = engagement.initiator.document.elevation
		const mounted = new Effect(engagement.initiator, EFFECT_MOUNTED)
		if (mounted.exists) {
			await mounted.purge()
			await engagement.initiator.document.update({elevation:0})
			ui.chat.processMessage(i18n.$$('PF2E.Actions.Mount.DismountMessage', {mount: mount.name}))
			if (tokenAttacher)
				tokenAttacher.detachElementFromToken(engagement.initiator, mount, true)
		}
		else {
			await mounted.ensure()
			await engagement.initiator.document.update({elevation:4})
			ui.chat.processMessage(i18n.$$('PF2E.Actions.Mount.MountMessage', {mount: mount.name}))
			if (tokenAttacher) {
				const token = engagement.initiator
				const newCoords = {x:token.x, y:token.y}
				if (mount.x + mount.w - token.w < token.x)
					newCoords.x = mount.x + mount.w - token.w
				else if (mount.x > token.x)
					newCoords.x = mount.x;
				if (mount.y + mount.h - token.h < token.y)
					newCoords.y = mount.y + mount.h - token.h
				else if (mount.y > token.y)
					newCoords.y = mount.y
				await token.document.update({x: newCoords.x, y: newCoords.y})
				await tokenAttacher.attachElementToToken(token, mount, true)
				await tokenAttacher.setElementsLockStatus(token, false, true)
				await tokenAttacher.setElementsMoveConstrainedStatus(token, true, true, {type: tokenAttacher.CONSTRAINED_TYPE.TOKEN_CONSTRAINED})
			}
			
		}
	}
}