var _gamesCache = {};

Meteor.methods({
	invoke: function(opts) {
		var _game = _.find(_gamesCache, function(g) { return g._id === opts.gameId; });
		if (!_game) {
			_game = new Battleship({gameId: opts.gameId});
			_gamesCache[opts.gameId] = _game;
		}
		console.log("found game ", _game, opts);
		return _game[opts.method].apply(_game, opts.args);
	}
});

//Meteor.call("invoke", { gameId: Session.get("gameId"), method: "fire", "args": ["Tim", "a", 1] }, function(err, res) { console.log(err,res); })