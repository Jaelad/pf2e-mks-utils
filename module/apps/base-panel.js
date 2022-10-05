import {default as i18n} from "../../lang/pf2e-i18n.js"
import LocalStorage from "../../utils/local-storage.js";
import {SYSTEM} from "../constants.js";

export default class BasePanel extends FormApplication {

    constructor(dialogData = {}, options = {}) {
        super(dialogData, options)
    }

    static show({inFocus = true, tab }={}){
        let activeApp;
        for(let app of Object.values(ui.windows)){
            if(app instanceof this){
                activeApp = app
                break;
            }
        }
        if (activeApp) {
            if (activeApp._tabs && activeApp._tabs?.[0]?.active !== tab) {
                activeApp.render(true, { focus: inFocus })
            }
        }
        else {
            activeApp = new this();
            activeApp.render(true, { focus: inFocus })
        }

        return activeApp.setTab(tab)
    }

    setTab(tab){
        if (!tab || !this._tabs) return
        this._tabs[0].active = tab
        console.log(this.activeTab)
        return this
    }
    
    get activeTab() {
        return this._tabs?.[0]?.active
    }
    
    _onChangeTab(event, tabs, active) {
        super._onChangeTab(event, tabs, active)
        this.render()
    }
    
    static rerender() {
        let activeApp;
        for (let app of Object.values(ui.windows)) {
            if (app instanceof this) {
                activeApp = app
                break;
            }
        }
        if (activeApp)
            setTimeout(() => activeApp.render(), 300)
    }

    static get isVisible() {
        return this.activeInstance !== undefined
    }

    static get activeInstance(){
        for (let app of Object.values(ui.windows)) {
            if (app instanceof this) return app
        }
    }
}