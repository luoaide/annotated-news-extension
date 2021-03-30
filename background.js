'use strict';
//HELPFUL RESOURCE: https://thoughtbot.com/blog/how-to-make-a-chrome-extension

//from: https://www.tutorialrepublic.com/javascript-tutorial/javascript-ajax.php

// I think of this backgroud script as running at all times out of view when the
// extension is enabled. It is the controller that gives
// us the key to interact with other content scripts that we throw into the DOM
// of specific pages.
function sendRequest(currentURL, currentUSER, currentTAB) {
  //temporary... non-remote
  chrome.tabs.sendMessage(currentTAB, {
    //send to contentScript.js
      "type": "server_output",
      "command": "incoming_data",
      "payload": {
            "asdSDj46": {
                "text": "Taken at face value, Mr. Cassidy",
                "author": "Aiden Roberts",
                "annotation": "I find this point very very interesting because of the way it is.",
                "date": "August 14th, 2020"
            },
            "dvnEj234": {
                "text": " and one of only a few officials in the South — to acknowledge President Biden’s victory. Months later, after Mr. Trump’s campaign to overturn the election culminated in the Capitol riot, Mr. Cassidy was one",
                "author": "Aiden Roberts",
                "annotation": "This point is also very interesting.",
                "date": "August 13th, 2020"
            }
        }
  }, function(response){
      chrome.tabs.executeScript({
          file: 'inline/activeContentScript.js'
      });
  });

  /* Temporarily deactivated while I don't have a real server.
    $.ajax({
        // populate with the correct address to the Flask App
        url: "http://10.213.149.63:5000/loadExtension",
        type: "POST",
        data: {
            //this is date that we send to the server so it can serve the appropriate content.
            user_current_url: currentURL,
            user_token: currentUSER
        },
        dataType: "json",
        //returns servableJSON
        success: function(servableJSON) {
            //DO SOMETHING WITH THE RETURNED JSON OUTPUT
            //Return it via sendResponse to contentScript.js
            chrome.tabs.sendMessage(currentTAB, {
                "type": "server_output",
                "command": "incoming_data",
                "payload": JSON.stringify(servableJSON)
            }, function(response){
                chrome.tabs.executeScript({
                    file: 'activeContentScript.js'
                });
            });
        }
    });
    */
}

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    switch( request.type ) {
        case "server_request":
            switch( request.command ){
                case "turn_on":
                    let thisTAB = sender.tab.id;
                    let thisURL = request.url;
                    let thisUSER = {"name": "Aiden"};
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
