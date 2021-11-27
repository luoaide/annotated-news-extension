'use strict';
//HELPFUL RESOURCE: https://thoughtbot.com/blog/how-to-make-a-chrome-extension
//from: https://www.tutorialrepublic.com/javascript-tutorial/javascript-ajax.php

// I think of this backgroud script as running at all times out of view when the
// extension is enabled. It is the controller that gives
// us the key to interact with other content scripts that we throw into the DOM
// of specific pages.

async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors', // no-cors, *cors, same-origin
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
}

function incrementProgress(url) {
  // UPDATE THE STUDY BACKEND HERE... BUT BE CAREFUL NOT TO INCREMENT EVERY SINGLE TIME (handled by server)
  // Send a post request to the Server to increment Progress.
  var siteURL = url;
  var postURL = ""
  if(siteURL == "https://www.huffpost.com/entry/georgia-election-trump-voter-fraud-claims_n_5ff36b73c5b61817a538bd20" || siteURL == "https://www.breitbart.com/politics/2020/12/17/fraud-happened-sen-rand-paul-says-the-election-in-many-ways-was-stolen/") {
    postURL = "https://www.annotatednews.com/readArticle";
  } else if (siteURL == "https://twitter.com/jaketapper/status/1400532544555307009" || siteURL == "https://twitter.com/HawleyMO/status/1344307458085412867") {
    postURL = "https://www.annotatednews.com/readSocial";
  } else {
    // do nothing
    postURL = "nothing";
  }

  if(postURL != "nothing") {
    chrome.storage.local.get('cNumber', function(result){
      var data = {
        'c_number': result.cNumber
      }
      postData(postURL, data)
        .then(response => console.log(response));
    });
  }
}

function loadExtension(currentURL, studyPin, currentTAB) {
  let url = "https://www.annotatednews.com/loadExtension";
  var data = {
    "user_current_url": currentURL,
    "study_pin": studyPin
  };

  postData(url, data)
    .then(serverResponse => {
      chrome.tabs.sendMessage(currentTAB, {
        "type": "server_output",
        "command": "incoming_data",
        "payload": JSON.stringify(serverResponse)
      }, function(response) {
        //After all the elements have been modified and added to the page... load Active.JS.
        if (response.responseCode == "success") {
          // adds active.js to the context in its own "isolated world"
          chrome.scripting.executeScript({
            target: { tabId: currentTAB },
            files: ['content/active.js']
          });

          // once we successfully load the extension, increment study progress through another .fetch()
          incrementProgress(response.url);
        }
        return true;
      });
    });
}

function updateAnnotationData(annotId, studyPin, opened, helpful) {
  let url = "https://www.annotatednews.com/updateAnnotationStats";
  var data = {
    "annot_id": annotId,
    "study_pin": studyPin,
    "opened": opened,
    "helpful": helpful,
  };

  postData(url, data)
    .then(serverResponse => console.log(serverResponse));
}

function updateUserInteractionsTable(studyPin, sourceType, viewTime, numPops, numPanels, scrolls){
  let url = "https://www.annotatednews.com/updateExtensionStats";
  var data = {
    "study_pin": studyPin,
    "source_type": sourceType,
    "view_time": viewTime,
    "num_pops": numPops,
    "num_panels": numPanels,
    "scrolls": scrolls
  };

  postData(url, data)
    .then(serverResponse => console.log(serverResponse));
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
              loadExtension(thisURL, thisUSER, thisTAB);
          });
          break;
        case "send_stats":
          //can get information like request.type or stuff.
          chrome.storage.local.get(["studyPin", "stats"], function(result){
            var sourceType = result.stats.sourceType;
            var viewTime = result.stats.viewTime;
            var numPops = result.stats.numPops;
            var numPanels = result.stats.numPanels;
            var scrolls = result.stats.scrolls;
            var studyPin = result.studyPin;
            ///////////DO THE SEND...
            updateUserInteractionsTable(studyPin, sourceType, viewTime, numPops, numPanels, scrolls);
          });
          // Clear the Stats table so that it is ready to collect stats for the next article/social media post.
          var emptyStatsDict = {
            "sourceType": "none",
            "viewTime": 0,
            "numPops": 0,
            "numPanels": 0,
            "scrolls": 0,
          };
          chrome.storage.local.set({"stats": emptyStatsDict}, () => {});
          break;
        case "update_annotation_database":
          //can get information like request.type or stuff.
          var annotId = request.annotId;
          var opened = request.newOpen; // 1 if this is a new open, 0 if no event...
          // sum all entries on same annotId in order to get the total number of opened and helpful/unhelpful.
          // if this is just an "open" event, helpful will be 0 and there is no change to the total
          // helpful value.
          var helpful = request.helpful;
          chrome.storage.local.get('studyPin', function(result){
            updateAnnotationData(annotId, result.studyPin, opened, helpful);
          });
      }
  }
  return true;
});
