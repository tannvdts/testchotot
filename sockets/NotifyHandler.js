var io = require('socket.io')(3001);
var config={};
io.on('connection', function (socket) {
	config.socket=socket;
	socket.emit('socketConnected', { status: 'socket connected' });
});

module.exports={

	config:config,

	io:io,

	PushNewAds:function(listAds)
	{
		console.log("=======PushNewAds=======");
		io.emit('PushNewAds',listAds);
	},

	UpdateAdsPosition:function(listAds)
	{
		console.log("=======UpdateAdsPosition=======");
		io.emit('UpdateAdsPosition', listAds);
	}
}