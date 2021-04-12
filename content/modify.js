'use strict';

var State = "off";
var Annotations = {};
var Source = {};

// modify.js interacts directly with the DOM of the current webpage. Instead of storing HTML
// as a string, modifying, and returning, it modifies the existing DOM.


function addPanel(key) {
  let panel = document.createElement('an-panel');
  let contents = Annotations[key];
  //TWO TYPES:
    // PANEL that gets placed inside the annotatedNewsPanel
    // POPUP that gets thrown at the end of the file.
}

function addPopup(key) {
  let popup = document.createElement('an-popup');
  let contents = Annotations[key];
  ///Use Popper.js for my pop-ups: https://popper.js.org/
  //TWO TYPES:
    // PANEL that gets placed inside the annotatedNewsPanel
    // POPUP that gets thrown at the end of the file.
}

function linkData(key){
  // Takes a key to the next annotation in Annotations and does the following:
  //   1. adds a corresponding signal marker on the page to indicate an annotation exists for given text
  //   2. decides if the annotation takes the form of a Panel or Popup, adding the corresponding Element
  //      by calling the associated wrapper helper function.

  // Annotation object is directly imported and accessible from messaging.js

  //key is a string not an object
  let annotationObject = pageData[key];
  let annotationLength = annotationObject.text.length;

  let startIndex = html.indexOf(annotationObject.text);
  let tailTag = "</span>";

  //ISSUE: The .indexOf technique fails when the "text" is interupted by another html element or something else ~behind the scenes~
  if(startIndex != -1) {
      //ID of each Span is AnnotatedNews followed by the corresponding key of the annotation object within annotations Object
      //ex. AnnotatedNews0 is the first annotation... should allow access to pertinent information latter in an expandable way... ie. author, demographics, date.
      let uniqueHeadTag = "<span class='" + "AnnotatedNewsSPAN" + "' id='" + key + "'>";
      html = html.slice(0, startIndex) + uniqueHeadTag + annotationObject.text + tailTag + html.slice(startIndex+annotationLength);
  }

}

function modifyHTML(){
  // Ideally I need to register some kind of listener so that when the extension is started I know to call modifyHTML.
  // Right now messaging.js calls modifyHTML, but that may not work in a production environment.
  let toolbar = document.createElement('an-toolbar');
  toolbar.upload(Annotations);
  document.appendChild(toolbar);

  for(key in Annotations){
    linkData(key);
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
                    //when payload comes from PYTHON: pageData = JSON.parse(request.payload);
                    State = "on";
                    Annotations = request.annotations;
                    Source = request.source;
                    modifyHTML();
                    sendResponse({"responseCode": "success"});
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
