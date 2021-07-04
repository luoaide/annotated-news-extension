'use strict';
//HELPFUL RESOURCE: https://thoughtbot.com/blog/how-to-make-a-chrome-extension
//from: https://www.tutorialrepublic.com/javascript-tutorial/javascript-ajax.php

// I think of this backgroud script as running at all times out of view when the
// extension is enabled. It is the controller that gives
// us the key to interact with other content scripts that we throw into the DOM
// of specific pages.

function sendRequest(currentURL, currentUSER, currentTAB) {
  // chrome.tabs.sendMessage(currentTAB, {
  //     "type": "server_output",
  //     "command": "incoming_data",
  //     "payload": JSON.stringify({
  //       "meta-data": {
  //         "file": "sample_annotations",
  //         "source-url": "https://www.nytimes.com/2021/04/05/world/europe/iran-nuclear-talks-explained.html",
  //         "date": "11 April 2021"
  //       },
  //
  //       "annotations": [{
  //           "type": "panel",
  //           "unique-id": "an-2394857089",
  //           "category": "context",
  //           "key-text": "In Vienna last week, the signers",
  //           "preview": "Some preview text to give the reader a hint about what this annotation includes",
  //           "panel-title": "The Signers of the 2015 Iran Nuclear Deal",
  //           "images": "https://static01.nyt.com/images/2021/04/05/world/05IRAN-EXPLAINER2/05IRAN-EXPLAINER2-superJumbo.jpg?quality=90&auto=webp",
  //           "links": ["https://en.wikipedia.org/wiki/Iran", "https://apnews.com/article/middle-east-iran-358384f03b1ef6b65f4264bf9a59a458"],
  //           "text-bodies": ["This is the first point I want to make.", "Here is the second point, maybe below the pictures and links?", "I'd encourage you to consider this perspective"]
  //         }, {
  //           "type": "popup",
  //           "unique-id": "an-423573459",
  //           "category": "background",
  //           "key-text": "and the United States insist that they want to return to the deal",
  //           "preview": "Some preview text to give the reader a hint about what this annotation includes",
  //           "popup-title": "The Signers of the 2015 Iran Nuclear Deal",
  //           "images": "https://static01.nyt.com/images/2021/04/05/world/05IRAN-EXPLAINER2/05IRAN-EXPLAINER2-superJumbo.jpg?quality=90&auto=webp",
  //           "links": ["https://en.wikipedia.org/wiki/Iran", "https://apnews.com/article/middle-east-iran-358384f03b1ef6b65f4264bf9a59a458"],
  //           "text-body": "This is the first point I want to make."
  //         }, {
  //           "type": "panel",
  //           "unique-id": "an-2394857089",
  //           "category": "context",
  //           "key-text": "the talks will be much more strained",
  //           "preview": "DISPUTED!",
  //           "panel-title": "PANEL 2",
  //           "images": "https://static01.nyt.com/images/2021/04/05/world/05IRAN-EXPLAINER2/05IRAN-EXPLAINER2-superJumbo.jpg?quality=90&auto=webp",
  //           "links": ["https://en.wikipedia.org/wiki/Iran", "https://apnews.com/article/middle-east-iran-358384f03b1ef6b65f4264bf9a59a458"],
  //           "text-bodies": ["Thdleta detlat asda;sdlkfja; asdflk asdflI want to make.", "Here is the second point, maybe below the pictures and links?", "I'd encourage you to consider this perspective"]
  //         }, {
  //           "type": "panel",
  //           "unique-id": "an-2394857089",
  //           "category": "context",
  //           "key-text": "Natanz was done with the knowledge or even the permission of the United State",
  //           "preview": "About some guy...",
  //           "panel-title": "PANEL 4",
  //           "images": "https://static01.nyt.com/images/2021/04/05/world/05IRAN-EXPLAINER2/05IRAN-EXPLAINER2-superJumbo.jpg?quality=90&auto=webp",
  //           "links": ["https://en.wikipedia.org/wiki/Iran", "https://apnews.com/article/middle-east-iran-358384f03b1ef6b65f4264bf9a59a458"],
  //           "text-bodies": ["DIFFERENT TEXT IN THIS ONEint, maybe below the pictures and links?", "I'd encourage you to consider this perspective"]
  //         }, {
  //           "type": "popup",
  //           "unique-id": "an-423573459",
  //           "category": "background",
  //           "key-text": "worst deal ever negotiated",
  //           "preview": "Some preview text to give the reader a hint about what this annotation includes",
  //           "popup-title": "POPUP NUMBER 2 this one is really exciting!!!",
  //           "images": "https://static01.nyt.com/images/2021/04/05/world/05IRAN-EXPLAINER2/05IRAN-EXPLAINER2-superJumbo.jpg?quality=90&auto=webp",
  //           "links": ["https://en.wikipedia.org/wiki/Iran", "https://apnews.com/article/middle-east-iran-358384f03b1ef6b65f4264bf9a59a458"],
  //           "text-body": "WORST DEAL."
  //         }
  //       ]
  //     })
  //
  // }, function(response){
  //   //After all the elements have been modified and added to the page... load Active.JS.
  //   if(response.responseCode == "success") {
  //     //consider just throwing this content script in at the beginning, which I think I do anyway... might be redundant.
  //     chrome.tabs.executeScript(currentTAB, {
  //       file: 'content/active.js'
  //     });
  //   }
  //   true;
  // });
    $.ajax({
        // populate with the correct address to the Flask App Web Server
        url: "http://annotatednews-env.eba-me8iqkmp.us-east-2.elasticbeanstalk.com/loadextension",
        type: "POST",
        data: {
            user_current_url: currentURL,
            user_token: currentUSER
        },
        dataType: "json",
        //returns dataObject
        success: function(dataObject) {
            //DO SOMETHING WITH THE RETURNED JSON OUTPUT
            //Return it via post message to modify.js
            chrome.tabs.sendMessage(currentTAB, {
                "type": "server_output",
                "command": "incoming_data",
                "payload": JSON.stringify(dataObject)
            }, function(response){
              //After all the elements have been modified and added to the page... load Active.JS.
              if(response.responseCode == "success") {
                //consider just throwing this content script in at the beginning, which I think I do anyway... might be redundant.
                chrome.tabs.executeScript(currentTAB, {
                  file: 'content/active.js'
                });
              }
              true;
            });
        }
    });
}

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    switch( request.type ) {
        case "server_request":
            switch( request.command ){
                case "turn_on":
                    let thisTAB = sender.tab.id;
                    let thisURL = request.url;
                    let thisUSER = "12874";
                    sendRequest(thisURL, thisUSER, thisTAB);
                    sendResponse({"responseCode": "success"});
                    break;
                case "turn_off":
                    chrome.tabs.sendMessage(sender.tab.id, {
                        "type": "server_output",
                        "command": "unload_extension"
                    });
                    sendResponse( {"output": "The extension is now off."} );
            }
    }
    return true;
});


chrome.runtime.onInstalled.addListener(function() {
    //settup the extension on install.
});
