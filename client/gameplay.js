Template.bindGame.created = function() {
	//Games.remove({_id: Games.findOne()._id });
};

Template.bindGame.helpers({
	isPlaying: function() {
		return Games.findOne(Session.get("gameId")) && Games.findOne(Session.get("gameId")).players.length >= 1;
		//return window.myBattleship && window.myBattleship.get({ type: "game" }).players.length >= 1; //.currentPlayer;
		//return Session.get("gameId");
	}
	, playerName: function() {
		return Session.get("playerName");
	}
	, currentPlayer: function() {
		//return window.myBattleship && window.myBattleship.get({ type: "game" }).currentPlayer;
		return Games.findOne(Session.get("gameId")) && Games.findOne(Session.get("gameId")).currentPlayer;
	}
})

Template.gameplay.helpers({
	availableGames: function() {
		return Games.find({ open: true });
	}
	, atLeastOneOpenGame: function() {
		return Games.find({ open: true }).count() > 0;
	}
	, player1: function() {
		return this.players[0].player;
	}
});

function _wire(opts) {
	if (!window.myBattleship) {

		opts = opts || {};

		var _opts = { 
			onShotFired: function(doc) {

				var _msg = "";

				if (doc.hit) {
					if (doc.by === Session.get("playerName")) {
						_msg = "YES! Boom. It's a hit!";
					} else {
						_msg = "Son of a. " + doc.by + " totally just hit your " + doc.shipName + ".";
					}
				} else {
					if (doc.by === Session.get("playerName")) {
						_msg = "You missed. Don't be an embarrassment.";
					} else {
						_msg = "Whew. " + doc.by + " totally tried to nail you at " + doc.col + doc.row + " but they missed!";
					}
				}

				if (doc.hasSunk) {
					if (doc.by === Session.get("playerName")) {
						_msg += "<p>You just sunk your opponent's " + doc.shipName + "!</p>";
					} else {
						_msg += "<p>Aww snap. " + doc.by + " just sunk your " + doc.shipName + ". Many tears.</p>";
					}
				}

				if (doc.gameOver) {
					_msg += "<p>Aaaand, the game is over, won by " + doc.winningDetails.by + " with " + doc.winningDetails.accuracy + "% accuracy.</p>";
				}

				bootbox.alert(_msg);
			} 
		};

		_.extend(opts, _opts);
		window.myBattleship = new Battleship(opts);

	}
};

Template.gameplay.events({
	"click #btnAddPlayer1": function(e, template) {

		var _name = $("#txtPlayer1Name").val();
		_wire();

		window.myBattleship.addPlayer(_name);
		var _gid = window.myBattleship.get({ type: "game" })._id;

		Session.setDefault("gameId", _gid);
		Session.setDefault("playerName", _name);

	}

	, "click .playGame": function(e, template) {

		var _id = $(e.target).attr("data-id");
		Session.set("gameId", _id);
		_wire({ gameId: _id });

		bootbox.prompt("What's your name, son?", function(res) {
			if (res !== null) {
				window.myBattleship.addPlayer(res);
				Session.set("playerName", res);
			}
		});
	}
});