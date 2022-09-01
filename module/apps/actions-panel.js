import {default as i18n} from "../../lang/pf2e-helper.js"

export default class ActionsPanel extends FormApplication {

    constructor(dialogData = {}, options = {}) {
        super(dialogData, options);
        this.settingsElements = [];
        this.presetSelect = undefined;
        this.deletePresetButton = undefined;
        this.fileInput = undefined;
        this.userSelect = undefined;
        this.lastSearch = undefined;
        this.lastResults = [];
        this.effects = [];
    }

    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            title: game.i18n.localize("pf2e.mks.ui.actionspanel.label"),
            template: `modules/pf2e-tools-mks/templates/actions-panel.hbs`,
            classes: ["dialog"],
            width: "auto",
            height: 640,
            top: 65,
            left: 120,
            resizable: true,
            tabs: [{
                navSelector: ".tabs",
                contentSelector: ".content",
                initial: "exploration"
            }]
        })
    }

    static show({inFocus = true, tab = "exploration" }={}){
        let activeApp;
        for(let app of Object.values(ui.windows)){
            if(app instanceof this){
                activeApp = app
                break;
            }
        }
        if(activeApp){
            if(activeApp._tabs[0].active !== tab){
                activeApp.render(true, { focus: inFocus })
                activeApp.reapplySettings()
            }
        }
        else{
            activeApp = new this();
            activeApp.render(true, { focus: inFocus })
        }

        return activeApp.setTab(tab)
    }

    setTab(tab){
        this._tabs[0].active = tab
        return this;
    }

    static get isVisible() {
        return this.activeInstance !== undefined
    }

    static get activeInstance(){
        for (let app of Object.values(ui.windows)) {
            if (app instanceof this) return app
        }
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
    }

    _onClickCollapse(event, parentClass, collapsibleClass, iconClass) {
        const parentItem = $(event.currentTarget).parents(`.${parentClass}`)
        const collapsible = parentItem.children(`.${collapsibleClass}`)
        const icon = iconClass !== undefined ? parentItem.find(`.${iconClass}`) : undefined
        this._collapse(collapsible, icon, `${collapsibleClass}--collapsed`)
    }

    _collapse(collapsible, icon, collapsedClass = "collapsed", speed = 250) {
        const shouldCollapse = !collapsible.hasClass(collapsedClass);

        if (shouldCollapse) {
            collapsible.slideUp(speed, () => {
                collapsible.addClass(collapsedClass);
                icon?.removeClass("fa-angle-down").addClass("fa-angle-up");
            })
        }
        else {
            collapsible.slideDown(speed, () => {
                collapsible.removeClass(collapsedClass);
                icon?.removeClass("fa-angle-up").addClass("fa-angle-down");
            })
        }
    }

    /** @override */
    getData() {
        let data = super.getData()
        data.userIsGM = game.user.isGM

        const allTags = {}
        for (let action in game.MKS.actions) {
            const methods = game.MKS.actions[action].methods()
            methods.forEach( (m) => {
                (m.tags ?? []).forEach(tag => {
                    if (!allTags[tag])
                        allTags[tag] = {expanded: false, label: i18n.actionTag(tag), methods: []}
                    allTags[tag].methods.push(m)
                })
                m.action = action
            })
        }

        const allTagsArr = [], sort = (a,b) => a.label.localeCompare(b.label)
        for (let tag in allTags) {
            allTags[tag].tag = tag
            allTags[tag].methods.sort(sort)
            allTagsArr.push(allTags[tag])
        }
        allTagsArr.sort(sort)

        data.actions = allTagsArr

        data.weatherEffectGroups= {
            animals: {
                effects: {
                    bats: {
                        icon: "systems/pf2e/icons/spells/dread-aura.webp",
                        label: "Bats"
                    },
                    birds: {
                        icon: "systems/pf2e/icons/spells/dread-aura.webp",
                        label: "Birds"
                    },
                },
                expanded: true,
                label: "Animals"
            },
            other: {
                effects: {
                    bubbles: {
                        icon: "systems/pf2e/icons/spells/dread-aura.webp",
                        label: "Bubbles"
                    }
                },
                expanded: false,
                label: "Other"
            }
        }

        console.log(data)
        return data
    }
}