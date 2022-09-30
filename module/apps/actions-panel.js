import {default as i18n} from "../../lang/pf2e-helper.js"
import LocalStorage from "../../utils/local-storage.js"
import {SYSTEM} from "../constants.js"
import BasePanel from "./base-panel.js"

export default class ActionsPanel extends BasePanel {
	
	constructor(dialogData = {}, options = {}) {
		super(dialogData, options)
		this.settingsElements = []
		this.presetSelect = undefined
		this.deletePresetButton = undefined
		this.fileInput = undefined
		this.userSelect = undefined
		this.lastSearch = undefined
		this.lastResults = []
		this.effects = []
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
		html.find("a[data-action][data-method]").click((event) => this._runActionMethod(event))
	}
	
	_runActionMethod(event) {
		const dataset = event?.currentTarget?.dataset
		if (dataset?.action && dataset?.method) {
			if (dataset.action.startsWith("Compendium"))
				game.MKS.compendiumToChat(null, dataset.action)
			else
				game.MKS.actions[dataset.action][dataset.method]({})
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
		data.userIsGM = game.user.isGM
		const localSettings = LocalStorage.load("actions.panel.settings")
		data.showApplicable = localSettings?.showApplicable ?? true
		data.inCombatTurn = game.settings.get(SYSTEM.moduleId, "selectCombatantFirst")
		
		const allTags = {}, mksActions = game.MKS.actions, mksRudimentaryActions = game.MKS.rudimentaryActions
		for (let action in mksActions) {
			if (!mksActions.hasOwnProperty(action) || mksActions[action].mode !== this.activeTab) continue
			const methods = mksActions[action].methods(data.showApplicable)
			methods.forEach((m) => {
				(m.tags ?? []).forEach(tag => {
					if (!allTags[tag])
						allTags[tag] = {
							expanded: localSettings?.expanded?.[tag] ?? false,
							label: i18n.actionTag(tag),
							methods: []
						}
					allTags[tag].methods.push(m)
				})
				m.action = action
			})
		}
		
		
		allTags.rudimentary = {
			expanded: localSettings?.expanded?.["rudimentary"] ?? false,
			label: i18n.actionTag("rudimentary"),
			methods: []
		}
		for (let rudimentaryAction in mksRudimentaryActions) {
			const definition = mksRudimentaryActions[rudimentaryAction]
			if (definition.mode === this.activeTab)
				allTags.rudimentary.methods.push({
					method: rudimentaryAction,
					label: i18n.action(rudimentaryAction),
					icon: definition.icon,
					action: definition.compendium,
				})
		}
		
		const allTagsArr = [], sort = (a, b) => a.label.localeCompare(b.label)
		for (let tag in allTags) {
			allTags[tag].tag = tag
			allTags[tag].methods.sort(sort)
			allTagsArr.push(allTags[tag])
		}
		allTagsArr.sort(sort)
		data.actions = allTagsArr
		
		console.log(data)
		return data
	}
}