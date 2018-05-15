var fs = require('fs'),
    path = require('path'),
    Twit = require('twit'),
    ForestGenerator = require(path.join(__dirname, 'js/ForestGenerator.js'),
    config = require(path.join(__dirname, 'config.js'));

var T = new Twit(config);

// Run this if we want to detect when people tweet us
//var stream = T.stream('statuses/filter', { track: ['@rttreebot'] });

// soon
//stream.on('tweet', tweetEvent);

/**
 * Do it.
 * @return {void}
 */
function tweetAForest(){
    var treegen = new ForestGenerator();

    // Make the GIF
    var filename = 'tree'+Math.floor(Math.random()*999999);
    treegen.generateSceneGIF(90, filename);

    var filePath = path.join(__dirname,'/images/',filename+'.gif');

    // Upload the GIF
    T.postMediaChunked({ file_path: filePath }, function (err, data, response) {
        if (err) {
            console.log(err)
        } else {
            console.log(data);
            const params = {
              status: "",
              media_ids: [data.media_id_string],
              encoding: 'base64'
            }

            // Tweet the GIF
            T.post('statuses/update', params, function(err, data, response) {
              if (err !== undefined) {
                console.log(err);
              } else {
                console.log('Tweeted: ' + params.status);
              }
            });
            console.log('Tweeted: ' + params.status);
        }
    });

}

function tweetEvent(tweet) {

    // Who sent the tweet?
    var name = tweet.user.screen_name;

    var displayName = tweet.user.name;
    // What is the text?
    // var txt = tweet.text;
    // the status update or tweet ID in which we will reply
    var nameID  = tweet.id_str;

    // What was the tweet replying to?
    var parentId =  tweet.in_reply_to_status_id_str;

    if(parentId == null){
        // Start a reply back to the sender
        var reply = "@" + name + " Hi! Please @ me in reply to another tweet if you want me to try to generate a tree from that tweet. Otherwise I've got nothing to work with.";
        var params             = {
                                  status: reply,
                                  in_reply_to_status_id: nameID
                                 };

        T.post('statuses/update', params, function(err, data, response) {
          if (err !== undefined) {
            console.log(err);
          } else {
            console.log('Tweeted: ' + params.status);
          }
        });
        console.log('Tweeted: ' + params.status);
      
    }
    
   
    //T.get('statuses/show/:id', {id: parentId}, function(err, data, response) {
    
    var requestParams = {id: parentId, count: 100, trim_user: false};    

    T.get('statuses/retweets/:id', requestParams, function(err, data, response) {
          if (err !== undefined) {
            console.log(err);
            
          } else {

            for(var i=0; i<data.length; i++){
                console.dir(data[i].retweeted_status);
                //console.dir(data[i].user.contributors);
                //console.dir(data[i].retweeted_status.extended_entities);
            }
 
        
        }
    });
};



function tweetEveryThisManyMinutes(mins){
    setInterval(tweetAForest, mins*60*1000);
}

tweetEveryThisManyMinutes(30);
//tweetAForest();
