'use strict';

// Think of this backgroud script as running at all times out of view when the
// extension is enabled. It is the controller that allows us to interact with
// other content scripts that we throw into the DOM of specific pages.

async function postData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
}

function incrementProgress(url) {
  // UPDATE THE STUDY BACKEND HERE... The server must include logic to ensure that repeated increments are not made for the same trigger
  // Send a post request to the Server to increment Progress.
  var siteURL = url;
  var postURL = ""
  if(siteURL == "https://www.huffpost.com/entry/georgia-election-trump-voter-fraud-claims_n_5ff36b73c5b61817a538bd20" || siteURL == "https://www.breitbart.com/politics/2020/12/17/fraud-happened-sen-rand-paul-says-the-election-in-many-ways-was-stolen/") {
    postURL = "https://www.annotatednews.com/readArticle";
    chrome.storage.local.get('stats', function(result){
      console.log(result.stats);
      var newStatsObj = {};
      if(typeof(result.stats) !== "undefined") {
        newStatsObj = result.stats;
      }
      if(!("article" in newStatsObj)) {
        newStatsObj["article"] = Math.round(Date.now() / 1000);
      }
      chrome.storage.local.set({"stats": newStatsObj}, () => {});
    });
  } else if (siteURL == "https://twitter.com/jaketapper/status/1400532544555307009" || siteURL == "https://twitter.com/HawleyMO/status/1344307458085412867") {
    postURL = "https://www.annotatednews.com/readSocial";
    chrome.storage.local.get('stats', function(result){
      console.log(result.stats);
      var newStatsObj = {};
      if(typeof(result.stats) !== "undefined") {
        newStatsObj = result.stats;
      }
      if(!("social" in newStatsObj)) {
        newStatsObj["social"] = Math.round(Date.now() / 1000);
      }
      chrome.storage.local.set({"stats": newStatsObj}, () => {});
    });
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

function updateUserInteractionsTable(studyPin, sourceType, loadTime, endTime){
  let url = "https://www.annotatednews.com/updateExtensionStats";
  var data = {
    "study_pin": studyPin,
    "source_type": sourceType,
    "load_time": loadTime,
    "end_time": endTime
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
        case "update_annotation_database":
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
