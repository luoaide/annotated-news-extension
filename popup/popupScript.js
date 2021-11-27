function injectScripts() {
  // This function is a way around using <all_urls> match in manifest.json. Instead, because we have activeTab
  // enabled. Whenever the user clicks the icon, the base scripts previously described in manifest.JSON as:
  // "content_scripts": [{
  //     "matches": ["<all_urls>"],
  //     "js": ["src/jquery-3.5.1.js","src/popper.min.js", "src/icons.js", "src/findAndReplaceDOMText.js", "content/modify.js"],
  //     "css": ["content/content.css"],
  //     "all_frames": false
  // }],
  // are instead loaded programatically with the following:
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    tab = tabs[0].id;
    chrome.scripting.insertCSS({
      target: {tabId: tab },
      files: ["content/content.css"]
    })
    chrome.scripting.executeScript({
      target: { tabId: tab },
      files: ["src/jquery-3.5.1.js","src/popper.min.js", "src/icons.js", "src/findAndReplaceDOMText.js", "content/modify.js"]
    }, loadPopup());
  });
}

function loadPopup() {
  // AFTER THE CONTENT SCRIPT HAS BEEN LOADED.... THEN CHOSE WHICH POPUP VIEW TO DISPLAY:
  //TESTINGchrome.storage.local.remove(['studyPin']);
  chrome.storage.local.get(['studyPin'], function(result) {
    if(typeof result.studyPin == "undefined") {
      //////////////// IF NOT SYNCED WITH STUDY WEBSITE ///////////////////////
      ///SETUP THE VIEW in the POPUP
      $("#syncPanel").css("display", "inline");
    } else {
      ////////////////// IF SYNCED WITH STUDY WEBSITE /////////////////////////
      ///SETUP THE VIEW in the POPUP
      $("#mainPanel").css("display", "inline");
      chrome.storage.local.get('studyPin', function(result){
          $("#assignedStudyPin").text(result.studyPin);
      });
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          "type": "user_input",
          "command": "query_state"
        }, function(response) {
          if(response.status == "active") {
            $("#loadAnnotations").css("display", "none");
            $("#removeAnnotations").css("display", "inline");
          } else {
            $("#loadAnnotations").css("display", "inline");
            $("#removeAnnotations").css("display", "none");
          }
        });
      });
    }
  });
}

$(document).ready(function(){
  //////////// CHECK TO SEE IF THE CONTENT SCRIPT HAS BEEN LOADED YET ////////////////
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    try {
      chrome.runtime.sendMessage(tabs[0].id, {
        "type": "user_input",
        "command": "is_present"
      }, function(response) {
        if(response.status == "active") {
          loadPopup();
        }
      });
    } catch {
      injectScripts();
    }
  });

  $("#unsync").click(function(){
    chrome.storage.local.remove(['studyPin']);
    location.reload();
  });

  $("#syncButton").click( function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        "type": "user_input",
        "command": "sync"
      }, function(response) {
        $("#syncPanel").css("display", "None");
        $("#responsePanel").css("display", "inline");
        if(response.status == "synced") {
          let studyPin = response.studyPin;
          let cNum = response.cNum;
          //for TEsTING
          // studyPin = 1;
          // cNum = 12345678;
          //////
          $("#syncButton").css("display", "None");
          $("#checkmark").css("display", "inline");
          $("#status").text(response.output);

          // Send a post request to the Server to increment Progress.
          var url = "https://www.annotatednews.com/syncedExtension";
          var xhr = new XMLHttpRequest();
          xhr.open("POST", url);
          xhr.setRequestHeader("Content-Type", "application/json");
          var updateCommand = JSON.stringify({
            'c_number': cNum
          });
          xhr.send(updateCommand);
        } else {
          $("#syncPanel").css("display", "None");
          $("#responsePanel").css("display", "inline");
          $("#redx").css("display", "inline");
          $("#status").text(response.output);
        }
      });
    });
  });

  $( "#loadAnnotations" ).click( function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        "type": "user_input",
        "command": "turn_on"
      }, function(response) {
        $("#removeAnnotations").css("display", "inline");
        $("#loadAnnotations").css("display", "none");
        $("#mainStatus").html(response.output);
      });
    });
  });

  $( "#removeAnnotations" ).click( function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        "type": "user_input",
        "command": "turn_off"
      }, function(response) {
        $("#removeAnnotations").css("display", "none");
        $("#loadAnnotations").css("display", "inline");
        $("#mainStatus").html(response.output);
      });
    });
  });
});
