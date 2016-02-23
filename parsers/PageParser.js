var request = require('request');
var cheerio = require('cheerio');
var $q = require('q');
var NotifyHandler=require('../sockets/NotifyHandler');


var listNew=[];
var listAds = [];
var idTracking = {};

var config={
	maxNumPages:1,
	loadFinished:false
}

var parsePage = function(url) {
    var q = $q.defer();
    try {
        request(url, function(err, resp, body) {
            $ = cheerio.load(body);
            rows = $('.chotot-list-row'); //use your CSS selector here
            $(rows).each(function(i, item) {
                var image = $(item).find('.listing_thumbs_image a img').attr('data-original');
                if (!image)
                    image = $(item).find('.listing_thumbs_image a img').attr('src');
                var text = $(item).find('.thumbs_subject .ad-subject').attr('title');
                var link = $(item).find('.thumbs_subject .ad-subject').attr('href');
                var token_strikethrough = link.split("-");
                var token_dot = token_strikethrough[token_strikethrough.length - 1].split('.');
                var id = token_dot[0];
                if (!idTracking[id]) {
                    listNew.push({ text: text, id: id , image:image})
                    idTracking[id] = text;
                }
                else
                {
                	return false;
                }
            });
            q.resolve({status:'success'});
        });
    } catch (e) {
        q.reject(e);
    }
    return q.promise;
}


var parseListPages=function(index)
{
	var url='http://www.chotot.vn/tp-ho-chi-minh/mua-ban?o='+index;
    parsePage(url)
    .then(function(data){
        if(index<=config.maxNumPages)
        {
            parseListPages(index+1);
        }
        else
        {
        	if(listNew.length>0)
            {
                for (var i=listNew.length-1;i>=0;i--)
                {
                    listAds.unshift(listNew[i]);
                }
            }
            config.loadFinished=true;
            NotifyHandler.PushNewAds(listAds);
            listNew=[];
        }
    },function(err){
        
    })
    
}



module.exports={

	listAds:listAds,

	idTracking:idTracking,

	config:config,

	updateAds:function()
	{
		config.initFinished=false;
		parseListPages(1);
	}
}