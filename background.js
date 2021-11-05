'use strict';
//HELPFUL RESOURCE: https://thoughtbot.com/blog/how-to-make-a-chrome-extension
//from: https://www.tutorialrepublic.com/javascript-tutorial/javascript-ajax.php

// I think of this backgroud script as running at all times out of view when the
// extension is enabled. It is the controller that gives
// us the key to interact with other content scripts that we throw into the DOM
// of specific pages.

function sendRequest(currentURL, studyPin, currentTAB) {
  let url = "https://www.annotatednews.com/loadExtension";
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      //DO SOMETHING WITH THE RETURNED JSON OUTPUT
      //Return it via post message to modify.js
      chrome.tabs.sendMessage(currentTAB, {
        "type": "server_output",
        "command": "incoming_data",
        "payload": xhr.responseText
      }, function(response) {
        //After all the elements have been modified and added to the page... load Active.JS.
        if (response.responseCode == "success") {
          //consider just throwing this content script in at the beginning, which I think I do anyway... might be redundant.
          chrome.tabs.executeScript(currentTAB, {
            file: 'content/active.js'
          });
        }
        return true;
      });
    }
  }

  var json_string = JSON.stringify({
    "user_current_url": currentURL,
    "study_pin": studyPin
  });

  xhr.send(json_string);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.type) {
    case "server_request":
      switch (request.command) {
        case "turn_on":
          let thisURL = request.url;
          let thisTAB = sender.tab.id;
          chrome.storage.local.get('studyPin', function(result){
              let thisUSER = result.studyPin;
              console.log(thisURL);
              console.log(thisUSER);
              sendRequest(thisURL, thisUSER, thisTAB);
          });
          sendResponse({
            "responseCode": "success"
          });
          break;
        case "turn_off":
          chrome.tabs.sendMessage(sender.tab.id, {
            "type": "server_output",
            "command": "unload_extension"
          });
          sendResponse({
            "responseCode": "success"
          });
      }
  }
  return true;
});


chrome.runtime.onInstalled.addListener(function() {
  //settup the extension on install.
});
