$(document).ready(function() {

  $("#AnnotatedNewsPanel").click(function(){
    $("#AnnotatedNewsPanel").animate({
      width: "100%",
      left: "0",
      height: "20%",
      bottom: "0",
      borderRadius: "0px"
    }, 200);
  });
  $("#AnnotatedNewsLogoBar").click(function(){
    $("#AnnotatedNewsPanel").animate({
      width: "50%",
      left: "20%",
      height: "10%",
      bottom: "10%",
      borderRadius: "10px"
    }, 200);
  })

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
      }
    });


  });
});
