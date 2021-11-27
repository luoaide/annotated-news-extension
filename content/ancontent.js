
$("readArticleButton").click(function(){
  chrome.tabs.sendMessage(currentTAB, {
    "type": "server_request",
    "command": "send_stats",
    "type": "article"
  }, function(response) {
    //After all the elements have been modified and added to the page... load Active.JS.
    if (response.responseCode == "success") {
      // success
    }
    return true;
  });
});

$("readSocialButton").click(function(){
  chrome.tabs.sendMessage(currentTAB, {
    "type": "server_request",
    "command": "send_stats",
    "type": "social"
  }, function(response) {
    //After all the elements have been modified and added to the page... load Active.JS.
    if (response.responseCode == "success") {
      // success
    }
    return true;
  });
});
