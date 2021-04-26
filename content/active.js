//https://stackoverflow.com/questions/4698118/google-chrome-extensions-how-to-include-jquery-in-programmatically-injected-con
//
$(document).ready(function() {
  //SECTION 1
  //BASED ON CATEGORY, STYLE THE .an-span-wrapper span elements and animate underline effects


  //SECTION 2
  //SET EVENT LISTENERS FOR ALL POPUPS AND HIDE/SHOW APPROPRIATELY.
  //HIDE AND SHOW need to be fixed to accomodate a specific popup that its' linked to.
  /*
  show() {
    // Make the tooltip visible
    popup.setAttribute('data-show', '');

    // Enable the event listeners
    this.popperInstance.setOptions({
      modifiers: [{
        name: 'eventListeners',
        enabled: true
      }],
    });

    // Update its position
    this.popperInstance.update();
  }

  hide() {
    // Hide the tooltip
    this.popup.removeAttribute('data-show');

    // Disable the event listeners
    this.popperInstance.setOptions({
      modifiers: [{
        name: 'eventListeners',
        enabled: false
      }],
    });
  }
  */
});





/*

  //CAN USE A QUERY SELECTOR TO GET ACCESS TO ALL OF MY NEW ELEMS.
  //
  // function updateCurrentView() {
  //     if( isRunning ) {
  //         $( ".AnnotatedNewsSPAN" ).removeClass("AnnotatedNewsCurrentSPAN");
  //
  //         let isCurrentSpan = ( function() {
  //             let tempCur = $( ".AnnotatedNewsSPAN" ).first();
  //             $( ".AnnotatedNewsSPAN" ).each(function() {
  //                 //This logic should be upgraded, but for now it is operational.
  //                 if( tempCur[0].getBoundingClientRect().top <= 0 && $( this )[0].getBoundingClientRect().top <= window.innerHeight ) {
  //                     tempCur = $( this );
  //                 }
  //             });
  //             return tempCur;
  //         })();
  //
  //         $( isCurrentSpan ).addClass("AnnotatedNewsCurrentSPAN");
  //         let key = $( isCurrentSpan ).attr("id");
  //         let thisAnnotation = pageData[key];
  //         // AUTHOR: $( "#AnnotatedNewsCurrentDisplay" ).html(thisAnnotation.annotation);
  //         // DEMOGRAPHICS$( "#AnnotatedNewsCurrentDisplay" ).html(thisAnnotation.annotation);
  //         // DATE: $( "#AnnotatedNewsCurrentDisplay" ).html(thisAnnotation.annotation);
  //         $( "#AnnotatedNewsCurrentDisplay" ).html(thisAnnotation.annotation);
  //     }
  // }
  //
  //
  // window.addEventListener('scroll', function () {
  //     updateCurrentView();
  // }, false);

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
*/
