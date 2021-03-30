$( "#start" ).click( function() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
  		"type": "user_input",
    	"command": "turn_on"
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
