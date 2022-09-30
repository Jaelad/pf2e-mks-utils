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
	
	Handlebars.registerPartial('actions-list', `
		<ol class="mks-list">
			{{#each actions as |tag|}}
			<li class="mks-list__item">
				<header class="flexrow">
					<label class="mks-list__collapse">{{tag.label}}
						<i class="mks-list__collapse-icon fa fa-angle-{{#if tag.expanded}}down{{else}}up{{/if}}"></i>
					</label>
				</header>
				<ol class="mks-list__collapsible{{#unless tag.expanded}} mks-list__collapsible--collapsed{{/unless}} mks-list" id="{{tag.tag}}">
					{{#each tag.methods as |method|}}
					<li class="mks-list__item mks-noborder">
						<header class="flexrow">
							{{#if method.icon}}
							<img class="mks-list__icon" width="24" height="24" src="{{method.icon}}" alt="{{method.label}}">
							{{/if}}
							<a data-action="{{method.action}}" data-method="{{method.method}}" class="mks-list__link">{{method.label}} {{#if (ne method.action 'rudimentary')}}<i class="fas fa-caret-right"></i>{{/if}}</a>
						</header>
					</li>
					{{/each}}
				</ol>
			</li>
			{{/each}}
		</ol>
	`)
}