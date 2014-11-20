Battleship = function(opts) {

	opts = opts || {};
	var _self = this;
	var _boardTemplate = null;
	var _game = { inProgress: false, currentPlayer: "", players: [], open: true };

	var _defaults = {
		boardWidth: 10
		, boardHeight: 10
	};

	_.extend(opts, _defaults);

	function _map(num){
		var res = 'abcdefghijklmnopqrstuvwxyz'.slice(num, num + 1);
	    return res;
	};

	function _createBoardTemplate() {
		_boardTemplate = [];
		for (var xi = 0; xi < opts.boardWidth; xi++) {
			var _col = { col: _map(xi), rows: [] };
			for (var xii = 0; xii < opts.boardHeight; xii++) {
				_col.rows.push({ number: xii + 1, isHit: false, foundHit: false, shipName: "", isAttempted: false });
			}
			_boardTemplate.push(_col);
		}
	};

	function _row(board, col, row) {
		var _col = _.find(board, function(b) { return b.col === col; });
		var _rr = _.find(_col.rows, function(r) { return r.number === row; });
		return _rr;
	};


	function _observe(id) {
		Games.find({ _id: id }).observe({
			added: function(doc) {
				_game = doc
			}
			, changed: function(doc) {
				_game = doc
			}
			, removed: function(doc) {
				_game = doc
			}
		});
		ShotsFired.find({ gameId: id }).observe({
			added: function(doc) {
				opts.onShotFired && opts.onShotFired(doc);
			}
		});
	};


	function _saveGame() {
		if (!_game._id) {
			_game._id = Games.insert(_game);
			_observe(_game._id);
		} else {
			Games.update({ _id: _game._id }, { $set: _.omit(_game, "_id") });
		}
	};

	var _ships = [
		{ name: 'Destroyer', size: 3, coordinates: [ "a1", "a2", "a3" ] }
		, { name: 'Cruiser', size: 4, coordinates: [ "c3", "d3", "e3", "f3" ] }
		, { name: 'Puddle Jumper', size: 4, coordinates: [ "i6", "i7" ] }
	];

	var _methods = {
		addPlayer: function(playerName, ships) {
			if (!_boardTemplate) _createBoardTemplate();
			if (!_game.inProgress && _game.players.length <= 1) {
				if (!ships) ships = _ships;
				var __board = JSON.parse(JSON.stringify(_boardTemplate));
				_.each(_ships, function(ship) {
					_.each(ship.coordinates, function(c) {

						var _colChar = c.substring(0,1);
						var _rowNum = parseInt(c.substring(1, 2), 10);
						var _col = _.find(__board, function(b) { return b.col === _colChar; });
						var _row = _.find(_col.rows, function(r) { return r.number === _rowNum; });

						_row.isHit = true;
						_row.shipName = ship.name;

					});
				});

				_game.players.push({ player: playerName, board: __board });

				if (_game.players.length === 1) {
					_game.currentPlayer = playerName;
				} else {
					_game.open = false;
				}

				_saveGame();

			} else if (_game.players.length > 1) {
				throw Error("Only two players can play battleship at one time!");
			} else if (_game.inProgress) {
				throw Error("You cannot add a player when the game is in progress!");
			}
			
			return _self;
		}
		, fire: function(playerName, col, row) {

			if (_game.players.length <= 1) {
				throw new Meteor.Error("invalid", "The game has not started yet!");
			} else if (!_game.inProgress) {
				_game.inProgress = true;
				_game.currentPlayer = _game.players[0].player;
				_saveGame();
			}

			if (_game.currentPlayer === playerName && _game.inProgress) {

				//you
				var _you = _.find(_game.players, function(p) { return p.player === playerName; });
				var _yourBoard = _row(_you.board, col, row);

				//enemy
				var _enemy = _.find(_game.players, function(p) { return p.player !== playerName; });
				var _enemyBoard = _row(_enemy.board, col, row);

				var _alreadyAttempted = _yourBoard.isAttempted;
				_yourBoard.isAttempted = true;
				_yourBoard.isAttemptedAHit = _enemyBoard.isHit;

				//does this sink a battleship?
				var _hasSunk = false;
				if (_enemyBoard.isHit) {
					_enemyBoard.foundHit = true;
					var _hits =  _(_enemy.board).chain().pluck("rows").flatten().filter(function(c) { return c.shipName === _enemyBoard.shipName; }).pluck("foundHit").value();
					if (_hits.length > 0 && _.all(_hits, function(h) { return h === true; })) {
						_hasSunk = true;
					}
				}

				if (_hasSunk) {
					//has all of the opponents ships been sunk?
					var _possibleHits = _(_enemy.board).chain().pluck("rows").flatten().filter(function(r) { return r.isHit === true; }).value();
					var _attemptedHits = _.filter(_possibleHits, function(h) { return h.foundHit === true; });

					if (_possibleHits.length === _attemptedHits.length) {
						//woohoo, this user won the game
						_game.inProgress = false;

						//because it's nerdy.
						var _totalAttempts = _(_you.board).chain().pluck("rows").flatten().filter(function(r) { return r.isAttempted === true; }).value().length;
						var _accuracy = _totalAttempts/(opts.boardWidth * opts.boardHeight);
						_game.won = { by: playerName, accuracy: _accuracy };

					}
				}

				_game.currentPlayer = _enemy.player;

				_saveGame();

				var _attempt = { gameId: _game._id, col: col, row: row, by: playerName, at: new Date().valueOf(), hit: _enemyBoard.isHit, shipName: _enemyBoard.shipName, hasSunk: _hasSunk, alreadyAttempted: _alreadyAttempted, gameOver: !_game.inProgress, winningDetails: _game.won };
				ShotsFired.insert(_attempt);

				return _attempt;

			} else {
				throw new Meteor.Error("invalid", "You cannot fire because it's not your turn!");
			}
		}
		, get: function(_opts) {
			switch (_opts.type) {
				case "board":
					var b = _.find(_game.players, function(p) { return p.player === _opts.playerName; });
					return b ? b.board: null;
				case "game":
					return _game;
				default:
					return opts[_opts] ? opts[_opts] : null;
			}
		}
	};

	//all methods
	_.each(["stop", "start", "fire", "addPlayer", "get"], function(m) {
		_self[m] = function() {
			return _methods[m].apply( this, arguments );
		}
	});

	//finally, is this an existing game, then observe it.
	if (opts.gameId) {
		_observe(opts.gameId);
	}

	return _self;
};
