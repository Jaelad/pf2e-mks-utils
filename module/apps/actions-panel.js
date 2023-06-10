import {default as i18n} from "../../lang/pf2e-i18n.js"
import $$arrays from "../../utils/arrays.js"
import LocalStorage from "../../utils/local-storage.js"
import { ActionRunner, RUDIMENTARY_ACTIONS } from "../action.js"
import {SYSTEM} from "../constants.js"
import BasePanel from "./base-panel.js"

export default class ActionsPanel extends BasePanel {
	
	constructor(dialogData = {}, options = {}) {
		super(dialogData, options)
	}
	
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			title: game.i18n.localize("PF2E.MKS.UI.ActionsPanel.Label"),
			template: `modules/pf2e-tools-mks/templates/actions-panel.hbs`,
			classes: ["dialog"],
			width: "auto",
			height: 640,
			top: 150,
			left: 150,
			resizable: false,
			tabs: [{
				navSelector: ".tabs",
				contentSelector: ".content",
				initial: "encounter"
			}]
		})
	}
	
	/** @override */
	activateListeners(html) {
		super.activateListeners(html)
		
		html.find(".mks-list__collapse").click((event) =>
			this._onClickCollapse(
				event,
				"mks-list__item",
				"mks-list__collapsible",
				"mks-list__collapse-icon"
			)
		)
		
		html.find(".mks-checkbox").click((event) => this._toggleChecked(event))
		html.find("a[data-action]").click((event) => this._runAction(event))
		html.find("input[type=search][name=filter]").on('input', (event) => this._filterChanged(event))
		html.find("input[type=search][name=filter]").keyup( (event) => {
			if(event.keyCode == 13) {
				this._filterAccepted(event.currentTarget.value)
			}
		})
	}

	_filterChanged(event) {
		const value = event.currentTarget.value
		if (this.filter?.length > 0 && value === '')
			this._filterAccepted(value)
	}

	_filterAccepted(filter) {
		this.filter = filter
		ActionsPanel.rerender()
	}
	
	_runAction(event) {
		const dataset = event?.currentTarget?.dataset
		if (dataset?.action) {
			if (dataset.action.startsWith("Compendium"))
				game.MKS.compendiumShow(dataset.action)
			else if (event.ctrlKey)
				game.MKS.actions[dataset.action]?.showSheet()
			else
				new ActionRunner(game.MKS.actions[dataset.action]).run()
		}
	}
	
	_toggleChecked(event) {
		if (event.currentTarget.id === "inCombatTurn")
			game.settings.set(SYSTEM.moduleId, "selectCombatantFirst", event.target.checked).then()
		else {
			const settings = LocalStorage.load("actions.panel.settings") ?? {expanded: {}}
			settings[event.target.id] = event.target.checked
			LocalStorage.save("actions.panel.settings", settings)
		}
		ActionsPanel.rerender()
	}
	
	_onClickCollapse(event, parentClass, collapsibleClass, iconClass) {
		const parentItem = $(event.currentTarget).parents(`.${parentClass}`)
		const collapsible = parentItem.children(`.${collapsibleClass}`)
		const icon = iconClass !== undefined ? parentItem.find(`.${iconClass}`) : undefined
		this._collapse(collapsible, icon, `${collapsibleClass}--collapsed`)
	}
	
	_collapse(collapsible, icon, collapsedClass = "collapsed", speed = 250) {
		const shouldCollapse = !collapsible.hasClass(collapsedClass)
		
		if (shouldCollapse) {
			collapsible.slideUp(speed, () => {
				collapsible.addClass(collapsedClass)
				icon?.removeClass("fa-angle-down").addClass("fa-angle-up")
			})
		} else {
			collapsible.slideDown(speed, () => {
				collapsible.removeClass(collapsedClass)
				icon?.removeClass("fa-angle-up").addClass("fa-angle-down")
			})
		}
		
		const settings = LocalStorage.load("actions.panel.settings") ?? {expanded: {}}
		settings.expanded[collapsible[0].id] = !shouldCollapse
		LocalStorage.save("actions.panel.settings", settings)
	}
	
	/** @override */
	getData() {
		let data = super.getData()
		data.filter = this.filter
		data.userIsGM = game.user.isGM
		const localSettings = LocalStorage.load("actions.panel.settings")
		data.showApplicable = localSettings?.showApplicable ?? true
		data.inCombatTurn = game.settings.get(SYSTEM.moduleId, "selectCombatantFirst")
		
		const allTags = {}, mksActions = game.MKS.actions
		for (let action in mksActions) {
			if (!mksActions.hasOwnProperty(action) || mksActions[action].mode !== this.activeTab) continue
			const actionObj = mksActions[action]
			if (data.showApplicable && !actionObj.relevant())
				continue
			
			(actionObj.tags ?? []).forEach(tag => {
				if (!allTags[tag])
					allTags[tag] = {
						expanded: localSettings?.expanded?.[tag] ?? false,
						label: i18n.actionTag(tag),
						actions: []
					}
				const props = actionObj.properties
				props.action = action
				allTags[tag].actions.push(props)
			})
		}
		
		allTags.rudimentary = {
			expanded: localSettings?.expanded?.["rudimentary"] ?? false,
			label: i18n.actionTag("rudimentary"),
			actions: []
		}
		for (const rudimentaryAction in RUDIMENTARY_ACTIONS) {
			const definition = RUDIMENTARY_ACTIONS[rudimentaryAction]
			if (definition.mode === this.activeTab)
				allTags.rudimentary.actions.push({
					action: definition.compendium,
					label: i18n.action(rudimentaryAction),
					icon: definition.icon,
					compendium: definition.compendium,
				})
		}

		const sort = (a, b) => a.label.localeCompare(b.label)
		if (this?.filter?.length > 1) {
			const filtered = []
			for (let tag in allTags) {
				const filteredActions = allTags[tag].actions.filter(a => {
					return a.label.toLowerCase().includes(this.filter.toLowerCase())
				})
				$$arrays.pushAll(filtered, filteredActions, true)
			}
			filtered.sort(sort)
			data.filteredActions = filtered
		}
		else {
			const allTagsArr = []
			for (let tag in allTags) {
				allTags[tag].tag = tag
				allTags[tag].actions.sort(sort)
				allTagsArr.push(allTags[tag])
			}
			allTagsArr.sort(sort)
			data.actions = allTagsArr
		}
		return data
	}
}