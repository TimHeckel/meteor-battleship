Common = {
	headerRow: function() {
		var _cnt = window.myBattleship.get("boardWidth");
		var _rows = [];
		_(_cnt).times(function(n){ 
			_rows.push({ number: n + 1, isHeader: true });
		});
		return { col: "", rows: _rows };
	}
};