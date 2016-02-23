var io = require('socket.io')(3001);
var config={};
io.on('connection', function (socket) {
	config.socket=socket;
	socket.emit('socketConnected', { status: 'socket connected' });
	/*socket.on('my other event', function (data) {
		console.log(data);
	});*/
});

module.exports={

	config:config,

	PushNewAds:function(listAds)
	{
		console.log("=======PushNewAds=======");
		this.config.socket.emit('PushNewAds',listAds);
	}
}