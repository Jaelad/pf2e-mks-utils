import {SYSTEM} from "./constants.js";
import {default as LOG} from "../utils/logging.js"
import ActionsPanel from "./apps/actions-panel.js";

export default class SettingsManager {
	constructor(MKS) {
		this._ = MKS
		setTimeout(()=> {
			for (let setting in SETTINGS) {
				game.settings.register(SYSTEM.moduleId, setting, SETTINGS[setting])
			}
		}, 1000)
	}

	get(setting) {
		return game.settings.get(SYSTEM.moduleId, setting);
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
}