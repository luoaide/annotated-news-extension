'use strict';

var GLOBALSTATE = "active";
var NO_ATTR_ACTIVE = false;
var ANNOTATIONS = {};

'use strict';

// modify.js interacts directly with the DOM of the current webpage. Instead of storing HTML
// as a string, modifying, and returning, it modifies the existing DOM.

function addPopup(annot) {
  /* Example Context Popup */
  /*
  {
    "type": "context",
    "unique-id": "an-23984",
    "key-text": "a 90-second video clip",
    "preview": "Watch the video.",
    "title": "Video of the Alledged Fraud",
    "text": "Watch the video of the alledged 2020 Presidential Election Fraud with the following resource(s):",
    "content": [
      {
        "content-type": "link",
        "text": "Facebook post of the Alledged Fraud:",
        "url": "https://www.facebook.com/restorationpac/videos/1002133710271567/?__xts__[0]=68.ARDNP9n4TakNeD99chaJc2gDGs7i64Qr3MLQ3V9zBNbsBfRU-FWycMk81D9FhYFXdYbBB0_2OjtcYqb9F6d-W8wrvpTBVzHc2YPdq1oUSrvg277ruZTspwqos-I2jB-cyC_meoUt4_buEl7w9lAg-o_FybSsRJ_ZhQD8dfDvnyTMdR2xA-yqHLyQ8ro0LvT6GtazvFPnLgYpjVs4NUbYtRg8ZOivfyBBzYRMlPPlA1x47VBW2hJrx7l8MwzzPzMc81NIV7vSDRMTZuDEqcQnJXBsh-suD92g9zL9j-oUsLdCU0StkVgRiRge2KQsj0TSsRG1WtCcowTjwcgt3A"
      }
    ]
  },
  */
  let popup = document.createElement('an-popup');
  popup.setAttribute('role', 'popup');
  popup.setAttribute('linkedid', annot['unique-id']);

  //add a title
  let title = document.createElement('h2');
  title.setAttribute('class', 'popup-title');
  title.textContent = annot['title'];
  popup.appendChild(title);

  //add line
  let line = document.createElement('div');
  line.setAttribute('class', 'popup-line');
  popup.appendChild(line);

  //add text body
  let text = document.createElement('div');
  text.setAttribute('class', 'popup-body');
  text.textContent = annot['text'];
  popup.appendChild(text);

  //add content
  var content = annot["content"];
  for(var i = 0; i<content.length; i++) {
    if(content[i] == "link") {
      let description = document.createElement('div');
      let link = document.createElement('div');
      description.setAttribute('class', 'popup-description');
      link.setAttribute('class', 'popup-link');
      description.textContent = content[i]['text'];
      link.textContent = content[i]['url'];
      popup.appendChild(description);
      popup.appendChild(link);
    } else if(content[i] == "quote") {
      let quote = document.createElement('div');
      quote.setAttribute('class', 'popup-quote');
      quote.textContent = content[i]['text'];
      popup.appendChild(quote);
      chrome.storage.local.get('is_no_attr', function(result){
        var isNoAttr = result.is_no_attr;
        if(!isNoAttr) { //pardon the double negative... if its no_attr: just don't add the link.. if its attr, add the link.
          let link = document.createElement('div');
          link.setAttribute('class', 'popup-link');
          link.textContent = content[i]['url'];
          popup.appendChild(link);
        }
      });
    } else if(content[i] == "webcontent") {

    } else {
      // error pass for now.
    }
  }

  //add arrow
  let arrow = document.createElement('div');
  arrow.setAttribute('class', 'popup-arrow');
  arrow.setAttribute('data-popper-arrow', '');
  popup.appendChild(arrow);

  //let span = document.getElementById(annot['unique-id']);
  //span.parentElement.appendChild(popup);
  //document.body.appendChild(popup);
  let span = $("#" + annot['unique-id']);
  span.closest("div").append(popup);
}

function addPanel(annot) {
  var iframe = document.getElementById('annotatednews-root');
  iframe.contentWindow.postMessage({
    "type": "to_frame",
    "command": "add_panel",
    "annotation": JSON.stringify(annot),
  }, "*");
}

function linkData(index) {
  // Takes a key to the next annotation in Annotations and does the following:
  //   1. adds a corresponding signal marker on the page to indicate an annotation exists for given text
  //   2. decides if the annotation takes the form of a Panel or Popup, adding the corresponding Element
  //      by calling the associated helper function.

  //index is the index of the current annotation object in the JSON object
  let annot = ANNOTATIONS[index];
  //gather up all the element that has a textContent equal to the annotations key-text


  //Strategy outlined here: https://j11y.io/javascript/replacing-text-in-the-dom-solved/
  // Performance likely terrible...
  //ONLY WORKS ON P ELEMENTS FOR NOW....

  //ADD POSITION CAPABILITIES.... = GHOST ELEMENT.

  var foundElem;
  var kt = annot["key-text"];
  if(kt == "__PAGETOP__" || kt == "__ABS__") {
    // Ghost elements have absolute positioning relative to the page and float on the screen.
    // They can be interacted with the same as traditional "key text"
    let ghostElement = document.createElement("div");
    ghostElement.setAttribute("class", "ghost-text");
    ghostElement.setAttribute('linkedid', annot['unique-id']);
    ghostElement.setAttribute('offset', annot['ABS_offset']);
    ghostElement.textContent = "Annotation: hover over me for information.";
    console.log("added ghost element");
    document.body.append(ghostElement);
  } else {
    let keyElem = document.querySelectorAll("p", "div", "span")
    keyElem.forEach(elem => {
      if (elem.textContent.includes(annot['key-text'])) {
        foundElem = elem;
      }
    });
    if (foundElem == null) {
      console.log("no element found matching the key text"); //IMPROVE ERROR HANDLING
    } else {
      let newSpan = `<span id="${annot['unique-id']}" type="${annot['type']}" class='an-span-wrapper' aria-describedby="${annot['unique-id']}">${annot['key-text']}</span>`;
      let newElemContents = foundElem.textContent.replace(annot['key-text'], newSpan);
      foundElem.innerHTML = newElemContents;
    }
  }

  if (annot['type'] == 'counterpoint') {
    addPanel(annot);
  } else if (annot['type'] == 'context') {
    addPopup(annot);
  }
}

function modifyHTML() {
  var frame = document.createElement('iframe');
  frame.setAttribute('src', chrome.runtime.getURL("frame/frame.html"));
  frame.setAttribute('id', 'annotatednews-root');
  frame.setAttribute('type', 'content');
  //frame.setAttribute('pageHeight') = $(body).height(); //change this value onScroll so that I can watch it from the frame.

  document.body.appendChild(frame);

  //https://javascript.info/cross-window-communication
  frame.onload = function() {
    let length = ANNOTATIONS.length;
    for (var i = 0; i < length; i++) {
      linkData(i);
    }
  }
}


//Messaging communicates with the backend (background.js) to provide modify.js with an exportable data model.
//Messaging.js contains state information about the extension on the client side.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.type) {
    case "user_input":
      switch (request.command) {
        case "sync":
          let curURL = window.location.href;
          let syncURL = "https://www.annotatednews.com/instructions";
          if(curURL == syncURL) {
            let studyPin = document.getElementById("studyPin").textContent;
            let cNum = document.getElementById("userCNum").textContent;
            let is_no_attr_active = document.getElementById("no_attr_indicator").textContent;
            // update chrome storage to reflect that we've now synced the extension to the study page.
            chrome.storage.local.set({studyPin: studyPin}, function() {
              console.log('extension study pin set to: ' + studyPin);
            });
            chrome.storage.local.set({cNum: cNum}, function() {
              console.log('extension c number set to: ' + cNum);
            });
            if(is_no_attr_active == "true"){
              chrome.storage.local.set({is_no_attr: true}, function() {
                console.log('extension c number set to: ' + cNum);
              });
            } else {
              chrome.storage.local.set({is_no_attr: false}, function() {
                console.log('extension c number set to: ' + cNum);
              });
            }

            sendResponse({
              "status": "synced",
              "studyPin": studyPin,
              "cNum": cNum,
              "output": "The extension has been successfully synced. Please proceed to the next step."
            });
          } else {
            sendResponse({
              "status": "unsynced",
              "output": "Must be on https://www.annotatednews.com/instructions to sync the extension."
            });
          }
          break;
        case "turn_on":
          let thisURL = window.location.href;
          chrome.runtime.sendMessage({
            "type": "server_request",
            "command": "turn_on",
            "url": thisURL
          });
          sendResponse({
            "output": "The extension is now running."
          });
          break;
        case "turn_off":
          chrome.runtime.sendMessage({
            "type": "server_request",
            "command": "turn_off"
          });
          sendResponse({
            "output": "The extension is now off."
          });
          break;
        case "query_state":
          sendResponse({
            "status": GLOBALSTATE
          });
      }
      break;

    case "server_output":
      switch (request.command) {
        case "incoming_data":
          console.log(request.payload);
          let payload = JSON.parse(request.payload);
          GLOBALSTATE = "active";
          ANNOTATIONS = payload.annotations;
          if(request.is_no_attr_active) {
            NO_ATTR_ACTIVE = true;
          }
          modifyHTML();
          sendResponse({
            "responseCode": "success"
          });
          break;

        case "unload_extension":
          GLOBALSTATE = "inactive";
          ANNOTATIONS = {};
          sendResponse({
            "responseCode": "success"
          });
          window.location.reload();
      }

  }
  return true;
});
