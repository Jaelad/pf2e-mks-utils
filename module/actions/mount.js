import {default as i18n} from "../../lang/pf2e-i18n.js"
import Action from "../action.js"
import CommonUtils from "../helpers/common-utils.js"
import { Engagement } from "../model/engagement.js"

export default class ActionMount extends Action {

	constructor(MKS) {
		super(MKS, 'mount', 'encounter', false, false, {
			icon: "systems/pf2e/icons/equipment/worn-items/companion-items/waverider-barding.webp",
			actionGlyph: 'A',
			tags: ['basic'],
			targetCount: 0
		})
	}

	pertinent(engagement) {
		const mount = canvas.tokens.ownedTokens.find((t) => {
			const e = new Engagement(engagement.initiator, t)
			return e.isAdjacent && e.sizeDifference <= -1 && e.targetHasTrait('animal')
		})
		if (mount)
			engagement.options.mountId = mount.id
		return !!mount
	}

	async act(engagement, options) {
		const mount = CommonUtils.getTokenById(engagement.options.mountId)
		const ele = engagement.initiator.document.elevation
		if (ele === 5) {
			await engagement.initiator.document.update({elevation:0})
			ui.chat.processMessage(i18n.$$('PF2E.Actions.Mount.DismountMessage', {mount: mount.name}))
			if (tokenAttacher)
				tokenAttacher.detachElementFromToken(engagement.initiator, mount, true)
		}
		else {
			await engagement.initiator.document.update({elevation:5})
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