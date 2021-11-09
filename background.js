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
          // adds active.js to the context in its own "isolated world"
          chrome.tabs.executeScript(currentTAB, {
            file: 'content/active.js'
          });

          // UPDATE THE STUDY BACKEND HERE... BUT BE CAREFUL NOT TO INCREMENT EVERY SINGLE TIME (handled by server)
          // Send a post request to the Server to increment Progress.
          var siteURL = response.url;
          var xhrURL = "";
          if(siteURL == "https://www.huffpost.com/entry/georgia-election-trump-voter-fraud-claims_n_5ff36b73c5b61817a538bd20" || siteURL == "https://www.breitbart.com/politics/2020/12/17/fraud-happened-sen-rand-paul-says-the-election-in-many-ways-was-stolen/") {
            xhrURL = "https://www.annotatednews.com/readArticle";
          } else if (siteURL == "https://twitter.com/jaketapper/status/1400532544555307009" || siteURL == "https://twitter.com/HawleyMO/status/1344307458085412867") {
            xhrURL = "https://www.annotatednews.com/readSocial";
          } else {
            // do nothing
            xhrURL = "nothing";
          }
          console.log(xhrURL);
          if(xhrURL != "nothing") {
            chrome.storage.local.get('cNumber', function(result){
              var xhrTwo = new XMLHttpRequest();
              xhrTwo.open("POST", xhrURL);
              xhrTwo.setRequestHeader("Content-Type", "application/json");
              var updateCommandTwo = JSON.stringify({
                'c_number': result.cNumber
              });
              xhrTwo.send(updateCommandTwo);
            });
          }
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
