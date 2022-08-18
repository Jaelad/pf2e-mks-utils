export function MksUtils() {

	

    function getAttackActions(actor, ready=null) {
		return actor.data.data.actions.filter(a => ready === null || a.ready === ready);
	}

}
/*
let spellCasting = actor.data.items.find(i => i.type == 'spellcastingEntry')
console.log(spellCasting.statistic)
const options = actor.getRollOptions(['arcane-spell-attack']);
let promise = game.pf2e.Check.roll(
    new game.pf2e.CheckModifier("TEST", spellCasting.statistic.check, []), {
      actor: actor, type: 'arcane-spell-attack',
      options, notes: [],
      dc: {
        value: 20
      }
    },
    event
  )
promise.
    then(function (value) {
        console.log(value);
    }).
    catch(function (err) {
        console.log(err);
    });

*/