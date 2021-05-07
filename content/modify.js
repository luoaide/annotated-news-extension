'use strict';

var State = "off";
var Annotations = {};
var Source = {};

'use strict';

// modify.js interacts directly with the DOM of the current webpage. Instead of storing HTML
// as a string, modifying, and returning, it modifies the existing DOM.

function addPopup(annot) {
  let popup = document.createElement('an-popup');
  popup.setAttribute('role', 'popup');
  popup.setAttribute('linkedid', annot['unique-id']);
  popup.setAttribute('category', annot['category']);

  //add a title
  let title = document.createElement('h2');
  title.setAttribute('class', 'popup-title');
  title.textContent = annot['popup-title'];
  popup.appendChild(title);

  //add line
  let line = document.createElement('div');
  line.setAttribute('class', 'popup-line');
  popup.appendChild(line);

  //add text body
  let text = document.createElement('div');
  text.setAttribute('class', 'popup-body');
  text.textContent = annot['text-body'];
  popup.appendChild(text);

  //add arrow
  let arrow = document.createElement('div');
  arrow.setAttribute('class', 'popup-arrow');
  arrow.setAttribute('data-popper-arrow', '');
  popup.appendChild(arrow);

  //let span = document.getElementById(annot['unique-id']);
  //span.parentElement.appendChild(popup);
  //document.body.appendChild(popup);
  let span = $("#"+ annot['unique-id']);
  span.closest("div").append(popup);
}

function addPanel(annot){
  var iframe = document.getElementById('annotatednews-root');
  iframe.contentWindow.postMessage({
    "type": "to_frame",
    "command": "add_panel",
    "annotation": JSON.stringify(annot),
  }, "*");
}

function linkData(index){
  // Takes a key to the next annotation in Annotations and does the following:
  //   1. adds a corresponding signal marker on the page to indicate an annotation exists for given text
  //   2. decides if the annotation takes the form of a Panel or Popup, adding the corresponding Element
  //      by calling the associated wrapper helper function.

  //index is the index of the current annotation object in the JSON object
  let annot = Annotations[index];
  //gather up all the element that has a textContent equal to the annotations key-text


  //Strategy outlined here: https://j11y.io/javascript/replacing-text-in-the-dom-solved/
  // Performance likely terrible...
  //ONLY WORKS ON P ELEMENTS FOR NOW....
  let foundElem;
  let keyElem = document.querySelectorAll("p")
  keyElem.forEach(elem => {
    if(elem.textContent.includes(annot['key-text'])) {
      foundElem = elem;
    }
  });

  if(foundElem == null) console.log("no element found matching the key text"); //IMPROVE ERROR HANDLING
  let newSpan = `<span id="${annot['unique-id']}" category="${annot['category']}" type="${annot['type']}" class='an-span-wrapper' aria-describedby=""${annot['unique-id']}">${annot['key-text']}</span>`;
  let newElemContents = foundElem.innerHTML.replace(annot['key-text'], newSpan);
  foundElem.innerHTML = newElemContents;

  if(annot['type'] == 'panel') {
    addPanel(annot);
  } else if(annot['type'] == 'popup') {
    addPopup(annot);
  }
}

function modifyHTML(){
  var frame = document.createElement('iframe');
  frame.setAttribute('src', chrome.runtime.getURL("frame/frame.html"));
  frame.setAttribute('id', 'annotatednews-root');
  frame.setAttribute('type', 'content');
  //frame.setAttribute('pageHeight') = $(body).height(); //change this value onScroll so that I can watch it from the frame.

  document.body.appendChild(frame);

  //https://javascript.info/cross-window-communication
  frame.onload = function(){
    let length = Annotations.length;
    for(var i = 0; i < length; i++){
      linkData(i);
    }
  }
}


//Messaging communicates with the backend (background.js) to provide modify.js with an exportable data model.
//Messaging.js contains state information about the extension on the client side.
chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    switch( request.type ) {
        case "user_input":
            switch( request.command ) {
                case "turn_on":
                    let thisURL = window.location.href;
                    chrome.runtime.sendMessage({
                        "type": "server_request",
                        "command": "turn_on",
                        "url": thisURL
                    });
                    sendResponse( {"output": "The extension is now running."} );
                    break;

                case "turn_off":
                    chrome.runtime.sendMessage({
                        "type": "server_request",
                        "command": "turn_off"
                    });
                    sendResponse( {"output": "The extension is now off."} );
            }
            break;

        case "server_output":
            switch( request.command ) {
                case "incoming_data":
                    let payload = JSON.parse(request.payload);
                    State = "on";
                    Annotations = payload.annotations['annotations'];
                    Source = payload.source;
                    modifyHTML();
                    sendResponse({"responseCode": "success"})
                    break;

                case "unload_extension":
                    State = "off";
                    Annotations = {};
                    sendResponse({"responseCode": "success"});
                    window.location.reload();
            }

    }
    return true;
});
