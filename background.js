'use strict';
//HELPFUL RESOURCE: https://thoughtbot.com/blog/how-to-make-a-chrome-extension
//from: https://www.tutorialrepublic.com/javascript-tutorial/javascript-ajax.php

// I think of this backgroud script as running at all times out of view when the
// extension is enabled. It is the controller that gives
// us the key to interact with other content scripts that we throw into the DOM
// of specific pages.

function sendRequest(currentURL, currentUSER, currentTAB) {
    $.ajax({
        // populate with the correct address to the Flask App Web Server
        url: "http://142.0.99.84:5000/loadextension",
        type: "POST",
        data: {
            user_current_url: currentURL,
            user_token: currentUSER
        },
        dataType: "json",
        //returns dataObject
        success: function(dataObject) {
            //DO SOMETHING WITH THE RETURNED JSON OUTPUT
            //Return it via sendResponse to contentScript.js
            chrome.tabs.sendMessage(currentTAB, {
                "type": "server_output",
                "command": "incoming_data",
                "payload": JSON.stringify(dataObject)
            }, function(response){
                chrome.tabs.executeScript({
                    file: 'content/components.js'
                });
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
