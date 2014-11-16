var _player1 = "";
var _player2 = "";
var _hasStarted = false;

Template.battleship.helpers({
	you: function() {
		return { tiles: Session.get("playerOneBoard") };
	}
	, enemy: function() {
		return { tiles: Session.get("playerTwoBoard") };
	}
});

function _headerRow() {
	var _cnt = Battleship.get("boardWidth");
	var _rows = [];
	_(_cnt).times(function(n){ 
		_rows.push({ number: n + 1, isHeader: true });
	});
	return { col: "", rows: _rows };
};

function _fire(_name, _col, _row) {

	try {

		if (!_hasStarted) {
			_hasStarted = true;
			Battleship.start();
		}

		var _ff = Battleship.fire(_name, _col, parseInt(_row, 10));
		if (_ff.hasSunk) {
			bootbox.alert("You just sunk " + (_name === _player1 ? _player2 : _name) + "'s " + _ff.shipName + "!");
		}

		if (_ff.gameOver) {
			bootbox.alert("The game is over, won by " + _ff.winningDetails.by + " with " + _ff.winningDetails.accuracy + "% accuracy.");
			Battleship.stop();
		}

		//refresh both boards
		_setBoard(_player1, "playerOneBoard");
		_setBoard(_player2, "playerTwoBoard");

	} catch (Err) {
		bootbox.alert("There was a problem firing! " + Err.message);
	}

};

function _addPlayer(_name) {
	return Battleship.addPlayer(_name);
};

function _setBoard(_name, _sess, _addHeader) {
	var _bb = Battleship.get({ type: "board", playerName: _name });
	if (_addHeader) {
		_bb.unshift(_headerRow());
	}
	Session.set(_sess, _bb);
};

Template.battleship.events({
	"click #btnAddPlayer1": function(e, template) {
		_player1 = $("#txtPlayer1Name").val();
		_addPlayer(_player1);
		_setBoard(_player1, "playerOneBoard", true);
	}
	, "click #btnAddPlayer2": function(e, template) {
		_player2 = $("#txtPlayer2Name").val();
		_addPlayer(_player2);
		_setBoard(_player2, "playerTwoBoard", true);	
	}
	, "click #btnFirePlayer1": function(e, template) {
		var _col = $("#txtPlayer1Col").val();
		var _row = $("#txtPlayer1Row").val();
		_fire(_player1, _col, _row);
	}
	, "click #btnFirePlayer2": function(e, template) {
		var _col = $("#txtPlayer2Col").val();
		var _row = $("#txtPlayer2Row").val();
		_fire(_player2, _col, _row);
	}
});