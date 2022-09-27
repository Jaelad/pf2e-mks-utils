import {default as i18n} from "../../lang/pf2e-helper.js"
import LocalStorage from "../../utils/local-storage.js";
import {SYSTEM} from "../constants.js";
import BasePanel from "./base-panel.js"
import $$strings from "../../utils/strings.js"

export default class RelativeCondPanel extends BasePanel {
    
    constructor(dialogData = {}, options = {}) {
        super(dialogData, options)
    
        this.labels = {
            cover: [
                i18n.$("PF2E.Concept.Cover.None"),
                i18n.$("PF2E.Concept.Cover.Lesser"),
                i18n.$("PF2E.Concept.Cover.Standard"),
                i18n.$("PF2E.Concept.Cover.Greater")
            ],
            awareness: [
                i18n.$("PF2E.Concept.Awareness.Unnoticed"),
                i18n.$("PF2E.Concept.Awareness.Undetected"),
                i18n.$("PF2E.Concept.Awareness.Hidden"),
                i18n.$("PF2E.Concept.Awareness.Observed"),
            ],
            attitude: [
                i18n.$("PF2E.Concept.Attitude.Hostile"),
                i18n.$("PF2E.Concept.Attitude.Unfriendly"),
                i18n.$("PF2E.Concept.Attitude.Indifferent"),
                i18n.$("PF2E.Concept.Attitude.Friendly"),
                i18n.$("PF2E.Concept.Attitude.Helpful"),
            ]
        }
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "relative-cond-panel",
            title: game.i18n.localize("PF2E.MKS.UI.RelativeCondPanel.Label"),
            template: `modules/pf2e-tools-mks/templates/relative-cond-panel.hbs`,
            //template: `modules/pf2e-tools-mks/templates/test.hbs`,
            classes: ["form"],
            width: 500,
            height: "auto",
            top: 150,
            left: 150,
            resizable: false
        })
    }

    activateListeners(html) {
        super.activateListeners(html)
    
        html.find("a[data-action]").click((event) => this._conditionChange(event))
        //html.find("button[data-action='submit']").click((event) => this._submitChanges())
        //html.find("button[data-action='revert']").click((event) => this._revertChanges())
    }
    
    _conditionChange(event) {
        const shift = event.shiftKey
        const dataset = event?.currentTarget?.dataset
        if (dataset?.action && dataset.reference && dataset.target) {
            const length = this.labels[dataset.action].length
            const val = this.relativeData[dataset.reference][dataset.target][dataset.action]
            this.relativeData[dataset.reference][dataset.target][dataset.action] = (val + length + (shift ? -1 : 1)) % length
            RelativeCondPanel.rerender()
        }
    }
    
    /*
    _submitChanges() {
        if (!game.combat?.combatant) return
        game.combat.update({"flags.mks.relative" : this.relativeData}).then(()=>{
            game.MKS.encounterManager.applyRelativeConditions(game.combat.combatant).then()
        })
    }
    
    _revertChanges() {
        this.relativeData = game.combat?.flags?.mks?.relative
        RelativeCondPanel.rerender()
    }
    
    async close(options = {}) {
        this._revertChanges()
        return super.close(options)
    }
    */
    
    getData(options={}) {
        let data = super.getData()
        if (!game.combat)
            return data
    
        if (this.combatId && game.combat.id !== this.combatId)
            this.relativeData = null
        this.combatId = game.combat.id
        this.relativeData = this.relativeData ?? game.combat.flags?.mks?.relative
        if (this.relativeData) {
            data.referenceTokenId = game.combat.combatant.token.id
            data.relative = this.relativeData[data.referenceTokenId]
        }
        data.editable = game.user.isGM
        data.labels = this.labels
        return data
    }
    
    
}