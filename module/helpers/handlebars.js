import Finders from "./finders.js"
import {default as i18n} from "../../lang/pf2e-helper.js"

export function registerHandlebarsHelpers() {
	Handlebars.registerHelper("token", (id, property) => {
		const token = Finders.getTokenById(id)
		if (typeof property === 'string')
			return eval('token.' + property)
		else
			return token
	})
	
	Handlebars.registerHelper("i18n", (func, toTranslate) => {
		i18n[func](toTranslate)
	})
	
	Handlebars.registerHelper("at", (arr, i) => {
		return arr[i]
	})
}