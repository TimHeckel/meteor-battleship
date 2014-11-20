Router.map(function () {
  this.route('fire', {
    where: 'server',
    action: function () {
    	//{ "gameId": "opAiE6GmD5AepSbrj", "method": "fire", "args": ["Tim", "a", 1] }
    	console.log("got payload ", this.request.body);
    	var _res = Meteor.call("invoke", this.request.body);
    	this.response.writeHead(200, {'Content-Type': 'application/json'});
    	this.response.end(JSON.stringify(_res));
    }
  });
  this.route("test", {
  	where: "server"
  	, action: function() {
  		this.response.writeHead(200, { "Content-Type": "application/json" });
  		this.response.end(JSON.stringify({ test: "hello" }));
  	}
  })
});