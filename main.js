var config = require('./config');

var twitterAPI = require('node-twitter-api');
var twitter = new twitterAPI({
    consumerKey: config.consumerKey,
    consumerSecret: config.consumerSecret,
});
var https = require('https');

var since_id = 1;

var getTrack = function(trackName) {
	https.get({
		host: 'api.spotify.com',
		path: '/v1/search?q=' + escape(trackName) + '&type=track'
	}, function(response) {
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {

            // Data reception is done, do whatever with it!
            var parsed = JSON.parse(body);
			if(parsed.tracks.items.length > 0) {
				var track = parsed.tracks.items[0];
				console.log('Playing ' + track.artists[0].name + ' - ' + track.name);
			}
        });
    });
};

var mainLoop = function() {

	var songName = '';

	console.log('Retrieving tweets since ' + since_id);
	twitter.getTimeline("mentions", {
			trim_user: true,
			since_id : since_id,
    	},
	config.accessToken,
    	config.accessTokenSecret,
	    function(error, results, response) {
	        if (error) {
				console.error(error);
	        } else {
				results.forEach(function _processResults(tweet) {
					songName = tweet.text.replace("@smplayerbot", "");
					console.log("Searching for song '" + songName + "'");
					getTrack(songName);
				});
        	}
    	}
	);
};

setInterval(mainLoop, 10000);
