$(document).ready(function() {

  $("#AnnotatedNewsViewAddForm").click(function(){
    $("#AnnotatedNewsForm").css("display","inline");
    let currentSelection = window.getSelection().toString();
    $("#AnnotatedNewsHighlightedText").html(currentSelection);
  });

  $("#AnnotatedNewsForm").submit(function(){
    let newAnnoation = {
      'name'    : $('input[name=name]').val(),
      'email'   : $('input[name=email]').val()
    };

    // process the form
    $.ajax({
      type:'POST', // define the type of HTTP verb we want to use (POST for our form)
      url: 'http://10.213.149.63:5000/postAnnotation', // the url where we want to POST
      data: newAnnotation, // our data object
      dataType: 'json', // what type of data do we expect back from the server
      encode: true,
      success: function(servableJSON) {
        chrome.tabs.sendMessage(currentTAB, {
            "type": "server_output",
            "command": "incoming_data",
            "payload": JSON.stringify(servableJSON)
        }, function(response){
        });
      });
    });


  });
});
