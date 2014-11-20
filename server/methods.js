Meteor.gamesCache = {};

Meteor.methods({
	invoke: function(opts) {
		var _game = _.find(Meteor.gamesCache, function(g) { return g._id === opts.gameId; });
		if (!_game) {
			_game = new Battleship({gameId: opts.gameId});
			Meteor.gamesCache[opts.gameId] = _game;
		}
		console.log("found game ", _game, opts);
		var _res = _game[opts.method].apply(_game, opts.args);
		return _res;
	}
});

//Meteor.call("invoke", { gameId: Session.get("gameId"), method: "fire", "args": ["Tim", "a", 1] }, function(err, res) { console.log(err,res); })