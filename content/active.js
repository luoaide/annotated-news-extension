//https://stackoverflow.com/questions/4698118/google-chrome-extensions-how-to-include-jquery-in-programmatically-injected-con
const { createPopper } = Popper;

//HIDE AND SHOW FUNCTIONS FOR THE POPUPS
function show(span, popup) {
  //create the new popper with popper.js.org/docs/v2/
  const popperInstance = Popper.createPopper(span.get(), popup.get())
  /*, {
    modifiers: [{
      name: "offset",
      options: {
        offset: [0, 8],
      },
    }, ],
  });
*/
  // Make the tooltip visible
  popup.attr('data-show', '');

  // Update its position
  console.log("updating position");
  popperInstance.update();
  console.log("position updated");
}

function hide(span, popup) {
  // Hide the tooltip
  popup.get().removeAttribute('data-show');
}

//https://stackoverflow.com/questions/11190930/jquery-not-recognizing-classes-added-to-page-dynamically
//Tricky stuff needed becasue the element is added during the lifetime of the page...
$(document).on('click', '.an-span-wrapper', function() {
  console.log("display popper");
  let linkedID = $(this).attr('id');
  let linkedPopper = $("[linkedid=" + linkedID + "]");
  show($(this), linkedPopper);
});

$(document).on("click", "#annotatednews-root", function(){
  if( $(this).css("height") == "80px") {
    $(this).css("height", "50%");
  } else {
    $(this).css("height", "80px");
  }
});

$(document).ready(function() {
  //SECTION 1
  //BASED ON CATEGORY, STYLE THE .an-span-wrapper span elements and animate underline effects
  console.log("active.js reporting present");
  //SECTION 2
  //SET EVENT LISTENERS FOR ALL POPUPS AND HIDE/SHOW APPROPRIATELY.
  //HIDE AND SHOW need to be fixed to accomodate a specific popup that its' linked to.
  $(".an-span-wrapper").mouseenter(function(){
    alert("here");
    let linkedID = $(this).getAttribute('id');
    let linkedPopper = document.querySelector("[linkedid=linkedID]");
    alert("linkeID");
    console.log(linkedPopper);
    show($(this), linkedPopper);
  });
  $(".an-span-wrapper").mouseleave(function(){
    let linkedID = $(this).getAttribute('id');
    let linkedPopper = document.querySelector("[linkedid=linkedID]");
    hide($(this), linkedPopper);
  });

  //SECTION 3
  //CHANGE THE SIZE OF THE IFRAME AS CLICKS HAPPEN INSIDE OF IT
  $("#annotatednews-root").click(function(){
    if( $(this).css("height") == "80px") {
      $(this).css("height", "50%");
    } else {
      $(this).css("height", "80px");
    }
  });

});

window.addEventListener('scroll', function () {
  //updateCurrentView();
  console.log("scrolling...");
}, false);






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
