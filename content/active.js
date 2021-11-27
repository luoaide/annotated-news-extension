//https://stackoverflow.com/questions/4698118/google-chrome-extensions-how-to-include-jquery-in-programmatically-injected-con
const { createPopper } = Popper;
//settup
let panelState = 0;

//Set the frame content to be correct based on current view...
updateCurrentView();

//HIDE AND SHOW FUNCTIONS FOR THE POPUPS
function show(linkedid) {
  //create the new popper with popper.js.org/docs/v2/
  const ref = document.getElementById(linkedid);
  const popup = document.querySelector("[linkedid='" + linkedid + "']");

  if(!popup.hasAttribute('data-show')){
    const popperInstance = Popper.createPopper(ref, popup, {
      placement: 'auto',
      strategy: 'absolute',
      modifiers: [{
        name: "offset",
        options: {
          offset: [0, 8],
        },
      }, ],
    });
    // Make the tooltip visible
      popup.setAttribute('data-show', '');

    // Update its position
    popperInstance.update();
  } else {
    popup.removeAttribute('data-show');
  }

  // Send a message to background.js to update the Annotation Data table on the server:
  chrome.runtime.sendMessage({
    "type": "server_request",
    "command": "update_annotation_database",
    "annotId": linkedid,
    "newOpen": 1,
    "helpful": 0
  });

}

function hideCurrent(linkedid) {
  const popup = document.querySelector("[linkedid='" + linkedid + "']");
  popup.removeAttribute('data-show');
}

function resize() {
  let height = $(window).height();
  $('#annotatednews-root').css({
    "height": ((0.6*height) + 50) + "px", // we add fifty to account for the "closeArrow" bar above the panel when open
    "top": (height - 100) + "px"
  });
}

function openDrawer() {
  panelState = 1;
  //console.log("opening drawer from active.js");
  let frame = $('#annotatednews-root');
  frame.animate({
    "top": "40%"
  }, 100);
}

function closeDrawer() {
  panelState = 0;
  //console.log("closing drawer from active.js");
  let frame = $('#annotatednews-root');
  let height = $(window).height();
  frame.animate({
    "top": (height - 100) + "px"
  }, 100);
}

// Auto scroll no longer supported:
// function scrollUp() {
//   let prevSpan = $('.an-current.span').closest('.an-span-wrapper');
//   let height = $(window).height();
//   //from: https://stackoverflow.com/questions/6677035/jquery-scroll-to-element
//   $('html, body').animate({
//     scrollTop: (prevSpan.offset().top + (.25)*height)
//   }, 2000);
//   updateFrame(prevSpan);
// }
//
// function scrollDown() {
//   let nextSpan = $('.an-current.span').next('.an-span-wrapper');
//   let height = $(window).height();
//   //from: https://stackoverflow.com/questions/6677035/jquery-scroll-to-element
//   $('html, body').animate({
//     scrollTop: (nextSpan.offset().top + (.25)*height)
//   }, 2000);
//   updateFrame(nextSpan);
// }


function updateFrame(spanElement){
  $('.an-current-span').removeClass('an-current-span');
  spanElement.addClass('an-current-span');
  let key = $('.an-current-span').first().attr('id');
  let iframe = document.getElementById('annotatednews-root');
  iframe.contentWindow.postMessage({
    "type": "to_frame",
    "command": "update_current",
    "curid": key
  }, "*");
}


function updateCurrentView() {
  let mid = $(window).height()/5;
  let currentSpan =  $(".an-span-wrapper").first();
  let minDist = 90000000;
  $(".an-span-wrapper").each(function() {
    //This logic should be upgraded, but for now it is operational.
    let dist = Math.abs($( this )[0].getBoundingClientRect().top - mid)
    if(dist < minDist) {
      currentSpan = $( this );
      minDist = dist;
    }
  });
  if(!currentSpan.hasClass("an-current-span")) {
    updateFrame(currentSpan);
  }
}

//SECTION 2
//SET EVENT LISTENERS FOR ALL POPUPS AND HIDE/SHOW APPROPRIATELY.
// https://stackoverflow.com/questions/11190930/jquery-not-recognizing-classes-added-to-page-dynamically
// Tricky stuff needed becasue the element is added during the lifetime of the page...
$(document).on('click', '.an-span-wrapper', function() {
  //See if it is a panel or Popup:
  if($(this).attr("type") == "counterpoint") {
    //If it's a panel (panel = counterpoint):
    let iframe = document.getElementById('annotatednews-root');
    updateFrame($(this));

    // Only open the panel if it's not already open; prevents multiple calls to annotation table
    // update when a user closes a panel by clicking the same key text again.
    if(panelState == 0) {
      iframe.contentWindow.postMessage({
        "type": "to_frame",
        "command": "open_panel"
      }, "*");
    }
    // frame.js will send a message back here to actually open the drawer.
  } else {
    //If it's a popup:
    //// (EDGE CASE) if there is a popup currently opened, hide it:
    // this case is not covered by the "window.addEventListener("click",{})" below
    // because it looks for clicks that ***aren't*** an "an-span-wrapper".
    let selected = document.querySelector("[data-show='']");
    if(selected != null) {
      let linkedId = selected.getAttribute('linkedid');
      hideCurrent(linkedId);
    }
    /// SHOW THE NEW CLICKED ANNOTATION:
    let linkedId = $(this).attr('id');
    show(linkedId);
  }
});

window.resize(function(){
  resize();
});

window.addEventListener('scroll', function () {
  // only update the current view if the panel is not open...
  if(panelState == 0) {
    updateCurrentView();
  }
}, false);

window.addEventListener('click', function (elem) {
  //Find the mouse position:
  // var e = window.event;
  // var posX = e.clientX;
  // var posY = e.clientY;
  // console.log("x: " + posX + " y: " + posY);
  //If the panel is open, close the panel.
  if(panelState == 1){
    let iframe = document.getElementById('annotatednews-root');
    iframe.contentWindow.postMessage({
      "type": "to_frame",
      "command": "close_panel"
    }, "*");
  }

  //If a popup is displayed: hide it.
  if(!$(elem.target).hasClass("an-span-wrapper")) {
    let selected = document.querySelector("[data-show='']");
    if(selected != null) {
      let linkedId = selected.getAttribute('linkedid');
      hideCurrent(linkedId);
    }
  }
});

window.addEventListener("message", function(event) {
    let request = event.data;
    switch( request.type ) {
        case "frame_output":
            switch( request.command ) {
                //make the frame get larger (open the drawer)
                case "open_drawer":
                    openDrawer();
                    break;

                case "close_drawer":
                    closeDrawer();
                    break;

                //redirect to the annotated news hompage
                case "open_home_page":
                    window.location.href = "https://www.annotatednews.com/instructions";
                    break;

                //scroll up to the previous annotation
                case "scroll_up":
                    scrollUp();
                    break;

                //scroll down to the next annotation
                case "scroll_down":
                    scrollDown();
                    break;

                case "go_to_link":
                    window.open(request.href, "_blank");
                    break;
                case "update_annotation_database":
                    // Send a message to background.js to update the Annotation Data table on the server:
                    chrome.runtime.sendMessage({
                      "type": "server_request",
                      "command": "update_annotation_database",
                      "annotId": request.annotId,
                      "newOpen": request.newOpen,
                      "helpful": request.helpful
                    });
            }
    }
    return true;
});
