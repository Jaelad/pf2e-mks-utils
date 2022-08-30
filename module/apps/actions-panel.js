import {BaseAppl} from "./base-appl.js"
import {default as i18n} from "../../lang/pf2e-helper.js"
import {default as LOG} from "../../utils/logging.js"

export class ActionsPanel extends BaseAppl {

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["form", "fxmaster", "weathers", "sidebar-popout"],
            //classes: ["form"],
            closeOnSubmit: false,
            submitOnChange: false,
            submitOnClose: false,
            popOut: false,
            editable: false,
            width: 300,
            height: "auto",
            template: "modules/pf2e-tools-mks/templates/actions-panel.hbs",
            id: "actions-panel",
            title: "Test",
        })
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find("a[data-action=seek]").click(async (elem) => {
            const action = elem.target.dataset.action
            const method = elem.target.dataset.method
        });
    }

    getData(options) {
        // const allTags = {}
        // for (let action in game.MKS.actions) {
        //     const methods = game.MKS.actions[action].methods()
        //     methods.forEach( (m) => {
        //         (m.tags ?? []).forEach(tag => {
        //             if (!allTags[tag])
        //                 allTags[tag] = {label: i18n.actionTag(tag), methods: []}
        //             allTags[tag].methods.push(m)
        //         })
        //         m.action = action
        //     })
        // }
        //
        // console.log(allTags)


        return {
            weatherEffectGroups: {
                animals: {
                    effects: {
                        bats: {
                            icon: "modules/fxmaster/assets/weatherEffects/icons/bats.png",
                            label: "Bats"
                        },
                        birds: {
                            icon: "modules/fxmaster/assets/weatherEffects/icons/bats.png",
                            label: "Birds"
                        },
                    },
                    expanded: false,
                    label: "pf2e.mks.checkType.perception"
                },
                other: {
                    effects: {
                        bubbles: {
                            icon: "modules/fxmaster/assets/weatherEffects/icons/bats.png",
                            label: "Bubbles"
                        }
                    },
                    expanded: false,
                    label: "pf2e.mks.checkType.reflex"
                }
            }
        }
    }
}