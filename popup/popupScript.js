window.onload = function(){
  //TESTING chrome.storage.local.remove(['studyPin']);
  chrome.storage.local.get(['studyPin'], function(result) {
    if(typeof result.studyPin == "undefined") {
      //////////////// IF NOT SYNCED WITH STUDY WEBSITE ///////////////////////
      $("#syncPanel").css("display", "inline");
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
              $("#studyPin").text("Study Pin: " + studyPin);

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
              $("#syncButton").css("display", "None");
              $("#responsePanel").css("display", "inline");
              $("#redx").css("display", "inline");
              $("#status").text(response.output);
            }
         	});
       	});

      });
    } else {
      ////////////////// IF SYNCED WITH STUDY WEBSITE /////////////////////////
      ///SETUP THE VIEW in the POPUP
      $("#mainPanel").css("display", "inline");

      $( "#off" ).click( function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        	chrome.tabs.sendMessage(tabs[0].id, {
        		"type": "user_input",
          	"command": "turn_off"
          }, function(response) {
          	$( "#title" ).html(response.output);
         	});
       	});
      });
      
      $( "#off" ).click( function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        	chrome.tabs.sendMessage(tabs[0].id, {
        		"type": "user_input",
          	"command": "turn_off"
          }, function(response) {
          	$( "#title" ).html(response.output);
         	});
       	});
      });
    }
  });
}
