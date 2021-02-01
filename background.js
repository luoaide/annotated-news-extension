'use strict';
//HELPFUL RESOURCE: https://thoughtbot.com/blog/how-to-make-a-chrome-extension

//from: https://www.tutorialrepublic.com/javascript-tutorial/javascript-ajax.php

// I think of this backgroud script as running at all times out of view when the
// extension is enabled. It is the controller that gives
// us the key to interact with other content scripts that we throw into the DOM
// of specific pages.
function sendRequest(currentURL, currentUSER, currentTAB) {
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
                    break;
                case "turn_off":
                    chrome.tabs.sendMessage(sender.tab.id, {
                        "type": "server_output",
                        "command": "unload_extension"
                    });
                    sendResponse( {"output": "The extension is now off."} );
            }
    }
});


chrome.runtime.onInstalled.addListener(function() {
    //settup the extension on install.
});
