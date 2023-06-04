import {SYSTEM} from "./constants.js";
import {default as LOG} from "../utils/logging.js"
import ActionsPanel from "./apps/actions-panel.js";

export default class SettingsManager {
	constructor(MKS) {
		this._ = MKS
	}

	get(setting) {
		return game.settings.get(SYSTEM.moduleId, setting)
	}

	set(setting, value) {
		game.settings.set(SYSTEM.moduleId, setting, value).then()
	}
}

export const SETTINGS = {
	selectCombatantFirst: {
		name: 'Select Combatant',
		hint: 'Actions select current combatant if exist instead of actualt selected tokens.',
		scope: 'client',     // "world" = sync to db, "client" = local storage
		config: true,       // false if you dont want it to show in module config
		type: Boolean,       // Number, Boolean, String, Object
		default: true,
		onChange: value => {
			ActionsPanel.rerender()
		}
	},
	chatMessageExpiration: {
		name: 'Chat Message Expiration',
		hint: 'Expired messages will be deleted. (Values in seconds)',
		scope: 'world',     // "world" = sync to db, "client" = local storage
		config: true,       // false if you dont want it to show in module config
		type: Number,       // Number, Boolean, String, Object
		default: 300
	}
}