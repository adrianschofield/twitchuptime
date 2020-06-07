'use strict';

//channel name - edit this to reflect your channel name
var channel = '';

var oAuthToken = '';

//global for output format
var myOutputFormat = 'hh:mm:ss';
//edit this value if you want something other than 00:00:00 to appear when you are offline
var myOfflineString = "";

//The variable above determines how the uptime is presented in the scene
//You can change the word Uptime: to something of your choosing
//var myOutputFormat = 'Streaming for hh:mm:ss';
//You can also choose between different time formats
//Valid formats are hh:mm:ss hh:mm and mm:ss
//var myOutputFormat = 'Live for hh:mm';

//DO NOT EDIT ANYTHING BELOW THIS LINE
//Unless you know what you are doing of course

//globals for hours minutes and seconds
var hrs = 0;
var mins = 0;
var secs = 0;

//Polling intervals
var oneMinutePoll = 60000;//1 minute
var oneSecondPoll = 1000;//1 second
var tenMinutePoll = 600000;//ten minutes

//globals for timers and stream status
var isStreamLive = false;
var myTwitchPoller = null;
var myOneSecondCounter = null;

//global for output format
 var textValue = null;
 var useHours = false;
 var useMins = false;
 var useSecs = false;

 //API calling information
//Kraken v5 Headers
var v5headers = new Headers();
v5headers.append('Client-ID', 'nfmebw2293663r1rski1j8d5vezfvpz');
v5headers.append('Accept', 'application/vnd.twitchtv.v5+json');
v5headers.append('Content-Type', 'application/json');

//Helix headers
var helixheaders = new Headers();
helixheaders.append('Client-ID', 'nfmebw2293663r1rski1j8d5vezfvpz');
if(oAuthToken !== '') {
    helixheaders.append('Authorization', 'Bearer ' + oAuthToken);
}

//This code runs when the DOM objects are initialised as defined in the jQuery documentation

window.onload = function () {
    
    
    //We want to check if the stream is live first
    //We can then poll if not to see if we can find when it does go live
    
    //Parse the text format so we know what to display
    parseText();

    //For Kraken v5 channel id requirements
    getChannelId();
    
    //Once we've got an actual uptime we can start the count up.
    myTwitchPoller = setInterval(getStream, oneMinutePoll);
    
    //Debugging
    displayTime();
   
    
};

//Need this section for Kraken v5 API calls to convert names to ids

//v5 needs a Channel Id rather than a channel name

function getChannelId() {
   
    //Rewritten to use fetch rather than ajax

    //Some detailed comments so I remember what I did
    //Set up the request, we need url, method and headers which are defined as globals to aid reuse
    /* var request = new Request('https://api.twitch.tv/kraken/search/channels?query=' + channel, {
        headers: v5headers,
        method: 'GET'
    });*/

    //OK Let's see if we can get this from Helix now
    var request = new Request('https://api.twitch.tv/helix/users?login=' + channel, {
        headers: helixheaders,
        method: 'GET'
    })

    //Make the call using fetch, which returns a promise
    //When the fetch succeeds return the response as json
    //Then manage the data it contained
    //Catch just in case
    fetch(request).then(function(response) {
        //Success, return the response as JSON
        return response.json();
    }).then(function (data){
        //Data contains the JSON from the response
        //Update the global variable with the channel id rather than the name
        //channel = data["channels"][0]["_id"];
        //For Helix the format of the returned data has changed
        channel = data.data[0]["id"];
        //Now we can get the current game
        getStream();
    }).catch(function (err) {
       console.log(err);
    });
    
}

//End of Kraken v5 requirement


function getStream() {
   
    //This is the REST url for the streams data for my channel
    //https://api.twitch.tv/kraken/streams/unshapedadrian
       
    //Some detailed comments so I remember what I did
    //Set up the request, we need url, method and headers which are defined as globals to aid reuse
    /* var request = new Request('https://api.twitch.tv/kraken/streams/' + channel, {
        headers: v5headers,
        method: 'GET'
    }); */

    var request = new Request('https://api.twitch.tv/helix/streams?user_id=' + channel, {
        headers: helixheaders,
        method: 'GET'
    });

    //Make the call using fetch, which returns a promise
    //When the fetch succeeds return the response as json
    //Then manage the data it contained
    //Catch just in case
    fetch(request).then(function(response) {
        //Success, return the response as JSON
        return response.json();
    }).then(function (json){
        //get the stream start time in UTC from the data returned from Twitch API
        //this is a sample of the format the data is returned in "2016-04-02T14:18:28Z"
        //Actually don't need to worry about Time Zones as I am looking at differences
        //in time not actual times.
        var streamCreatedDate = null;
        var streamStartDate = null;
        var streamStartUTCDate = null;
        var streamCurrentDate = null;
        var streamUTCDate = null;
        var diffMilliseconds = null;
        //Check to see if the data actually contains a stream object
        //If not then the stream isn't live we can then make some decisions on what to do
        if(json.data === null){
            //If isStreamLive is true then we know that the stream was live and now it isn't
            //In that case we can go back to polling Twitch every one minute
            //And cancel the one second timer.
            if (isStreamLive === true) {
                clearInterval(myOneSecondCounter);
                clearInterval(myTwitchPoller);
                myTwitchPoller = setInterval(getStream, oneMinutePoll);
                isStreamLive = false;
                //clear the displayed timer
                upDateText("");
            }
            //If there's no data then just return, polling will continue
            return;
        } else {
            streamCreatedDate = json.data[0].started_at;
            isStreamLive = true;
        }
        
        //The default date constructor works well on our date format
        streamStartDate = new Date(streamCreatedDate);
        
        //Convert the stream start time into UTC 	
        streamStartUTCDate = new Date(streamStartDate.getUTCFullYear(), streamStartDate.getUTCMonth(), streamStartDate.getUTCDate(),  streamStartDate.getUTCHours(), streamStartDate.getUTCMinutes(), streamStartDate.getUTCSeconds());
        
    
        //get the current time now() returns milliseconds
        streamCurrentDate = new Date(Date.now());
        
        //Convert the current local time into UTC 	
        streamUTCDate = new Date(streamCurrentDate.getUTCFullYear(), streamCurrentDate.getUTCMonth(), streamCurrentDate.getUTCDate(),  streamCurrentDate.getUTCHours(), streamCurrentDate.getUTCMinutes(), streamCurrentDate.getUTCSeconds());
        
        
        //subtract start from current to give uptime
    
        diffMilliseconds = new Date(streamUTCDate.getTime() - streamStartUTCDate.getTime());
        
        //extract the hours minutes seconds and update globals
        
        hrs = diffMilliseconds.getUTCHours();
        mins = diffMilliseconds.getUTCMinutes();
        secs = diffMilliseconds.getUTCSeconds();
        
        //show the time
        displayTime();
        
        //OK here we can test if we got data from Twitch and
        //if so cancel the Twitch poller and start counting up
        if(isStreamLive === true){
            //We can cancel the poll to Twitch
            clearInterval(myTwitchPoller);
            //And start the counter going up
            if(myOneSecondCounter === null){
                myOneSecondCounter = setInterval(countUp, oneSecondPoll);
            }
            //And start the longer poll to Twitch
            myTwitchPoller = setInterval(getStream, tenMinutePoll);
        } 
    }).catch(function (err) {
       console.log(err);
    });
    
}

function countUp(){
    
    if(secs === 59 & mins === 59 & hrs === 59){
        secs = 0;
        mins = 0;
        hrs = 0;
    }
    else if(secs === 59 & mins === 59){
        secs = 0;
        mins = 0;
        hrs++;
    }
    else if(secs === 59){
        secs = 0;
        mins++;
    }
    else {
        secs++;
    }
    
    displayTime();
       
}

function displayTime(){
    
    //This is the string which holds the output 
    var outputText = null;
    
    //Now format the output based on the format
    
    if(useHours === true){
        if(hrs < 10){
            outputText = textValue + ' 0' + hrs;
        }else{
            outputText = textValue + hrs;
        }
    }
    if(useMins == true){
        if(useHours === false){
            outputText = textValue + ': ';
        } else {
            outputText = outputText + ':';
        }
        if(mins < 10){
            outputText = outputText + '0' + mins;
        } else {
            outputText = outputText + mins;
        }
    }
    
    if(useSecs == true){
        if(useHours === false & useMins === false){
            outputText = textValue + ': ';
        } else {
            outputText = outputText + ':';
        }
        if(secs < 10){
            outputText = outputText + '0' + secs;
        } else {
            outputText = outputText + secs;
        }
    }

    if(myOfflineString != "" && hrs === 0 && mins === 0 && secs === 0){
        outputText = myOfflineString;
    }
    
    upDateText(outputText);
}

function parseText() {
	
	//OK we've got to parse through the string.
	var trimmedData = myOutputFormat.trim();
	
	
	if(trimmedData.substring(trimmedData.length - 8, trimmedData.length).toLowerCase() === 'hh:mm:ss'){
		
        useHours = true;
        useMins = true;
        useSecs = true;
        
		textValue = trimmedData.substring(0, trimmedData.length - 8);
	} else if (trimmedData.substring(trimmedData.length - 5, trimmedData.length).toLowerCase() === 'hh:mm') {
		
        useHours = true;
        useMins = true;
		textValue = trimmedData.substring(0,trimmedData.length -5);
	} else if (trimmedData.substring(trimmedData.length - 5, trimmedData.length).toLowerCase() === 'mm:ss') {
		
        useMins = true;
        useSecs = true;
		textValue = trimmedData.substring(0,trimmedData.length -5);
	} else {
        useHours = true;
        useMins = true;
        useSecs = true;
        textValue = "Uptime:";
    }
	//Debugging
    //displayTime();
	
	
}

//This is a small piece of code that updates the contents of a div
function upDateText(comment) {
        
    var text = document.getElementById("uptime");

    if (comment !== null && typeof comment !== "undefined") {
       text.innerHTML = comment;
   }
}
