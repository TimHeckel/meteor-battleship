
Template.battleship.helpers({
	you: function() {
		if (Session.get("gameId")) {
			var _game = Games.findOne(Session.get("gameId"));
			var _bb = _.find(_game.players, function(p) { return p.player === Session.get("playerName"); });
			_bb && _bb.board.unshift(Common.headerRow());
			return { tiles: _bb && _bb.board, pendingPlayer: _game.players.length <= 1 };
		}
	}
});

Template.battleship.events({
	"click #btnFire": function(e, template) {
		var _col = $("#txtCol").val();
		var _row = $("#txtRow").val();
		try {
			window.myBattleship.fire(Session.get("playerName"), _col, parseInt(_row, 10));
		} catch (err) {
			bootbox.alert("There was a problem firing: " + err.message);
		}
	}
});