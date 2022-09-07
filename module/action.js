import {default as i18n} from "../lang/pf2e-helper.js"
import {ACTION_GLYPH} from "./constants.js"

export default class Action {

	constructor(MKS) {
		this._ = MKS
		this.effectManager = MKS.effectManager
	}

	initialize() {
	}

	methods(onlyApplicable) {
		return []
	}

	isApplicable(method = null, warn= false) {
		// return {applicable, selected, targeted}
	}

	resultToChat(token, action, degreeOfSuccess, glyph = 'A') {
		const actionName = i18n.action(action)
		const noteText = i18n.actionNote(action, degreeOfSuccess)

		const chatMessage =	`
		<div class="pf2e chat-card action-card">
            <header class="card-header flexrow">
                <img src="${ACTION_GLYPH[glyph].img}" title="${actionName}" width="36" height="36">
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
			blind: true
		}
		this._.socketHandler.emit('ChatMessage', chatData, true)
	}
}