window.onload = function(){
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
            $("#loadAnnotations").css("display", "inline");
          } else {
            $("#removeAnnotations").css("display", "inline");
          }
        });
      });
    }
  });
}

$(document).ready(function(){
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
        console.log(response);
        $("#syncPanel").css("display", "None");
        $("#responsePanel").css("display", "inline");
        if(response.status == "synced") {
          let studyPin = response.studyPin;
          let cNum = response.cNum;
          //for TEsTING
          studyPin = 1;
          cNum = 12345678;
          //////
          $("#syncButton").css("display", "None");
          $("#checkmark").css("display", "inline");
          $("#status").text(response.output);

          // Send a post request to the Server to increment Progress.
          var url = "https://www.annotatednews.com/finishedSurvey";
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
