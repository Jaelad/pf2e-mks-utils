import {default as i18n} from "../../lang/pf2e-i18n.js"
import LocalStorage from "../../utils/local-storage.js"

export default class SelectItemDialog extends Application {
	constructor(resolve, {items, title, classes = [], filteredOutWarning}) {
		super({
			classes,
			title,
		})
		this.resolve = resolve
		this.items = items
		this.filteredOutWarning = filteredOutWarning
	}
	
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			id: "select-item-dialog",
			template: "modules/pf2e-tools-mks/templates/select-item.hbs",
			width: 270,
			height: 'auto',
			resizable: false
		})
	}
	
	async _render(force=false, options={}) {
		await super._render(force, options)
		setTimeout(() => {
				super.element.css('height', 'auto')
				super.bringToTop()
			}
			, 100)
	}
	
	setPosition({left, top, width, height, scale}={}) {
		super.setPosition({left, top, width, height, scale})
		setTimeout(() => {
				super.element.css('height', 'auto')
			}
			, 100)
	}
	
	async getData(options = {}) {
		let data = super.getData()
		
		const compare = (a,b) => a.name.localeCompare(b.name)
		if (this.items?.length > 0) {
			const containers = {"_": {items: [], id: "_", name: '_', expanded: true}}
			for (let i = 0; i < this.items.length; i++) {
				const item = this.items[i]
				if (item.system.containerId) {
					if (!containers[item.system.containerId])
						containers[item.system.containerId] = {items: [], id: containers[item.system.containerId], name: item._container.name, expanded: false}
					containers[item.system.containerId].items.push(item)
				}
				else
					containers._.items.push(item)
			}
			
			const containersArr = Object.values(containers)
			containersArr.forEach(c => c.items.sort(compare))
			if (containersArr.length === 1 && containersArr[0].id === '_')
				data.items = containersArr[0].items
			else
				data.containers = Object.values(containers).sort(compare)
		}
		else if (this.filteredOutWarning)
			ui.notifications.info(i18n.$(this.filteredOutWarning))
		return data
	}
	
	activateListeners($html) {
		super.activateListeners($html)
		
		$html.find(".mks-list__collapse").click((event) =>
			this._onClickCollapse(
				event,
				"mks-list__item",
				"mks-list__collapsible",
				"mks-list__collapse-icon"
			)
		)
		
		$html.find("h4[data-item]").on("click", (event) => {
			event.stopPropagation()
			const {item} = event?.currentTarget?.dataset
			this.item = this.items.find(i=>i.id === item)
			this.close()
		})
		
		$html.find("[data-action=remove]").on("click", () => {
			this.item = null
			this.close()
		})
		
		$html.find("[data-action=cancel]").on("click", () => {
			this.item = undefined
			this.close()
		})
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
		}
		else {
			collapsible.slideDown(speed, () => {
				collapsible.removeClass(collapsedClass)
				icon?.removeClass("fa-angle-up").addClass("fa-angle-down")
			})
		}
	}
	
	close(options = {}) {
		this.resolve(this.item)
		return super.close(options)
	}
	
	static async getItem(options) {
		return new Promise((resolve) => {
			new SelectItemDialog(resolve, options).render(true)
		})
	}
}