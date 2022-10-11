import CommonUtils from "./common-utils.js"
import {default as i18n} from "../../lang/pf2e-i18n.js"

export function registerHandlebarsHelpers() {
	Handlebars.registerHelper("token", (id, property) => {
		const token = CommonUtils.getTokenById(id)
		if (typeof property === 'string')
			return eval('token.' + property)
		else
			return token
	})
	
	Handlebars.registerHelper("invItem", (actorId, itemId) => {
		const actor = CommonUtils.getActorById(actorId)
		return actor?.items?.find((i => i.id === itemId))
	})
	
	Handlebars.registerHelper("i18n", (func, toTranslate) => {	
		i18n[func](toTranslate)
	})
	
	Handlebars.registerHelper("chain", (obj, ...ev) => {
		for (let i = 0; i < ev.length - 1; i++) {
			obj = obj[ev[i]]
		}
		return obj
	})

	Handlebars.registerHelper("startsWith", (str, start) => {
		return str.startsWith(start)
	})
	
	Handlebars.registerPartial('actions-list', `
		<div class="entry-filter form-group">
			<input name="filter" type="search" placeholder="{{localize "PF2E.MKS.ActionsPanel.Filter"}}" value="{{filter}}">
		</div>
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
							<a data-action="{{method.action}}" data-method="{{method.method}}" class="mks-list__link">{{method.label}} {{#unless (startsWith method.action 'Compendium')}}<i class="fas fa-caret-right"></i>{{/unless}}</a>
						</header>
					</li>
					{{/each}}
				</ol>
			</li>
			{{/each}}
			{{#each filteredActions as |method|}}
			<li class="mks-list__item mks-noborder">
				<header class="flexrow">
					{{#if method.icon}}
					<img class="mks-list__icon" width="24" height="24" src="{{method.icon}}" alt="{{method.label}}">
					{{/if}}
					<a data-action="{{method.action}}" data-method="{{method.method}}" class="mks-list__link">{{method.label}} {{#unless (startsWith method.action 'Compendium')}}<i class="fas fa-caret-right"></i>{{/unless}}</a>
				</header>
			</li>
			{{/each}}
		</ol>
	`)
}