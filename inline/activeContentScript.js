let panelState = 0;

$(document).ready(function() {

  $("#AnnotatedNewsPreview").click(function(){
    if(panelState == 0){
      $("#AnnotatedNewsPanel").animate({
        bottom: "0"
      }, 100);
      $("#AnnotatedNewsToolbarWrapper").animate({
        bottom: "50%",
        width: "60%",
        left: "20%"
      }, 100);
      panelState = 1;
    } else {
      $("#AnnotatedNewsPanel").animate({
        bottom: "-55%"
      }, 100);
      $("#AnnotatedNewsToolbarWrapper").animate({
        bottom: "0%",
        width: "100%",
        left: "0"
      }, 100);
      panelState = 0;
    }
  });

  //CAN USE A QUERY SELECTOR TO GET ACCESS TO ALL OF MY NEW ELEMS.

    // process the form
    // $.ajax({
    //   type:'POST', // define the type of HTTP verb we want to use (POST for our form)
    //   url: 'http://10.213.149.63:5000/postAnnotation', // the url where we want to POST
    //   data: newAnnotation, // our data object
    //   dataType: 'json', // what type of data do we expect back from the server
    //   encode: true,
    //   success: function(servableJSON) {
    //     chrome.tabs.sendMessage(currentTAB, {
    //         "type": "server_output",
    //         "command": "incoming_data",
    //         "payload": JSON.stringify(servableJSON)
    //     }, function(response){
    //     });
    //   }
    // });
});
