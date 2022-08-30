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
            title: game.i18n.localize("SEQUENCER.Effects"),
            template: `modules/sequencer/templates/sequencer-effects-template.html`,
            classes: ["dialog"],
            width: "auto",
            height: 640,
            top: 65,
            left: 120,
            resizable: true,
            tabs: [{
                navSelector: ".tabs",
                contentSelector: ".content",
                initial: "manager"
            }]
        });
    }

    static show({inFocus = true, tab = "player" }={}){
        let activeApp;
        for(let app of Object.values(ui.windows)){
            if(app instanceof this){
                activeApp = app;
                break;
            }
        }
        if(activeApp){
            if(activeApp._tabs[0].active !== tab){
                activeApp.render(true, { focus: inFocus });
                activeApp.reapplySettings();
            }
        }else{
            activeApp = new this();
            activeApp.render(true, { focus: inFocus });
        }

        return this
    }

    static get isVisible() {
        return this.activeInstance !== undefined;
    }

    static get activeInstance(){
        for (let app of Object.values(ui.windows)) {
            if (app instanceof this) return app;
        }
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
    }

    /** @override */
    getData() {
        let data = super.getData()
        data.userIsGM = game.user.isGM
        data.canCreateEffects = true
        data = {}
        return data
    }
}