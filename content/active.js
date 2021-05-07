//https://stackoverflow.com/questions/4698118/google-chrome-extensions-how-to-include-jquery-in-programmatically-injected-con
const { createPopper } = Popper;

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
}

//settup
let panelState = 0;

let height = $(window).height();
$('#annotatednews-root').css({
  "top": (height - 80) + "px"
});

//Set the frame content to be correct based on current view...
updateCurrentView();

//SECTION 1
//BASED ON CATEGORY, STYLE THE .an-span-wrapper span elements and animate underline effects
console.log("active.js reporting present");


//SECTION 2
//SET EVENT LISTENERS FOR ALL POPUPS AND HIDE/SHOW APPROPRIATELY.
// https://stackoverflow.com/questions/11190930/jquery-not-recognizing-classes-added-to-page-dynamically
// Tricky stuff needed becasue the element is added during the lifetime of the page...
$(document).on('click', '.an-span-wrapper', function() {
  //See if it is a panel or Popup:
  if($(this).attr("type") == "panel") {
    //If it's a panel:
    updateFrame($(this));
    openDrawer();
  } else {
    //If it's a popup:
    console.log("display popper");
    let linkedId = $(this).attr('id');
    show(linkedId);
  }
});


window.addEventListener('scroll', function () {
  updateCurrentView();
}, false);


function openDrawer() {
  panelState = 1;
  console.log("opening drawer from active.js");
  let frame = $('#annotatednews-root');
  frame.animate({
    "top": "50%",
    "width": "60%",
    "left": "20%"
  }, 100);
}

function closeDrawer() {
  panelState = 0;
  console.log("closing drawer from active.js");
  let frame = $('#annotatednews-root');
  let height = $(window).height();
  frame.animate({
    "top": (height - 80) + "px",
    "width": "100%",
    "left": "0%"
  }, 100);
}

function scrollUp() {
  let prevSpan = $('.an-current.span').closest('.an-span-wrapper');
  let height = $(window).height();
  //from: https://stackoverflow.com/questions/6677035/jquery-scroll-to-element
  $('html, body').animate({
    scrollTop: (prevSpan.offset().top + (.25)*height)
  }, 2000);
  updateFrame(prevSpan);
}

function scrollDown() {
  let nextSpan = $('.an-current.span').next('.an-span-wrapper');
  let height = $(window).height();
  //from: https://stackoverflow.com/questions/6677035/jquery-scroll-to-element
  $('html, body').animate({
    scrollTop: (nextSpan.offset().top + (.25)*height)
  }, 2000);
  updateFrame(nextSpan);
}

window.addEventListener("message", function(event) {
    let request = event.data;
    switch( request.type ) {
        case "frame_output":
            switch( request.command ) {
                //make the frame get larger (open the drawer)
                case "toggle_drawer":
                    if(panelState == 0) openDrawer();
                    else closeDrawer();
                    break;

                //redirect to the annotated news hompage
                case "open_home_page":
                    window.location.href = "http://annotatednews.com:9095";
                    break;

                //scroll up to the previous annotation
                case "scroll_up":
                    scrollUp();
                    break;

                //scroll down to the previous annotation
                case "scroll_down":
                    scrollDown();
            }
    }
    return true;
});


function updateFrame(spanElement){
  $('.an-current-span').removeClass('an-current-span');
  spanElement.addClass('an-current-span');
  let key = $('.an-current-span').first().attr('id');
  let category = $('.an-current-span').first().attr("category");
  let iframe = document.getElementById('annotatednews-root');
  iframe.contentWindow.postMessage({
    "type": "to_frame",
    "command": "update_current",
    "curid": key,
    "category": category
  }, "*");
}


function updateCurrentView() {
  let mid = $(window).height()/4;
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
