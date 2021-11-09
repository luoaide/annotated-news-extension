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
        "source": "Facebook",
        "url": "https://www.facebook.com/restorationpac/videos/1002133710271567/?__xts__[0]=68.ARDNP9n4TakNeD99chaJc2gDGs7i64Qr3MLQ3V9zBNbsBfRU-FWycMk81D9FhYFXdYbBB0_2OjtcYqb9F6d-W8wrvpTBVzHc2YPdq1oUSrvg277ruZTspwqos-I2jB-cyC_meoUt4_buEl7w9lAg-o_FybSsRJ_ZhQD8dfDvnyTMdR2xA-yqHLyQ8ro0LvT6GtazvFPnLgYpjVs4NUbYtRg8ZOivfyBBzYRMlPPlA1x47VBW2hJrx7l8MwzzPzMc81NIV7vSDRMTZuDEqcQnJXBsh-suD92g9zL9j-oUsLdCU0StkVgRiRge2KQsj0TSsRG1WtCcowTjwcgt3A"
      }
    ]
  },
  */
  let popup = document.createElement('an-popup');
  popup.setAttribute('role', 'popup');
  popup.setAttribute('linkedid', annot['unique-id']);

  let perPill = document.createElement('span');
  perPill.setAttribute('class', 'pill');
  perPill.textContent = "Annotation";

  //add a title
  let title = document.createElement('p');
  title.setAttribute('class', 'popup-title');
  title.textContent = annot['title'];
  popup.appendChild(perPill);
  popup.appendChild(title);

  //add text body
  let text = document.createElement('p');
  text.setAttribute('class', 'popup-body');
  text.textContent = annot['text'];
  popup.appendChild(text);

  //add content
  var contentDict = annot["content"];
  for(var i = 0; i<contentDict.length; i++) {
    var content = document.createElement("div");
    content.setAttribute("class", "popup-content");

    if(contentDict[i]["content-type"] == "link") {
      var description = document.createElement('div');
      description.setAttribute('class', 'popup-description');
      description.textContent = contentDict[i]['text'];
      content.appendChild(description);

      var link = document.createElement('a');
      link.setAttribute('class', 'popup-link');
      link.setAttribute("href", contentDict[i]['url']);
      link.setAttribute("target", "_blank");
      link.textContent = contentDict[i]['source'];
      content.appendChild(link);

    } else if(contentDict[i]["content-type"] == "quote") {
      var quote = document.createElement('div');
      quote.setAttribute('class', 'popup-quote');
      content.appendChild(quote);
      if(!NO_ATTR_ACTIVE) {
        var string = "Quote from ";
        var attr = document.createElement('a');
        attr.setAttribute('class', 'popup-link');
        attr.setAttribute("target", "_blank");
        attr.textContent = contentDict[i]['source'];
        quote.innerHTML = string;
        quote.innerHTML += attr;
        quote.innerHTML += ": ";
      }
      quote.innerHTML += contentDict[i]['text'];

    } else if(contentDict[i]["content-type"] == "webcontent") {
      var description = document.createElement('div');
      description.setAttribute('class', 'popup-description');
      description.textContent = contentDict[i]['text'];
      content.appendChild(description);

      var webframe = document.createElement('iframe');
      webframe.setAttribute('class', 'popup-iframe');
      webframe.setAttribute('src', contentDict[i]['url']);
      content.appendChild(webframe);

    } else if(contentDict[i]["content-type"] == "file") {
      var description = document.createElement('div');
      description.setAttribute('class', 'popup-description');
      description.textContent = contentDict[i]['text'];
      content.appendChild(description);

      var link = document.createElement('a');
      link.setAttribute('class', 'popup-link');
      link.setAttribute("href", contentDict[i]['path']);
      link.setAttribute("target", "_blank");
      link.textContent = "View File";
      content.appendChild(link);

    } else {
      // error pass for now.
      console.log("annotatednews/modify.js tried to load an unsupported content-type into a popup annotation.");
    }

    popup.appendChild(content);
  }

  //add arrow
  let arrow = document.createElement('div');
  arrow.setAttribute('class', 'popup-arrow');
  arrow.setAttribute('data-popper-arrow', '');
  popup.appendChild(arrow);

  // let span = $("#" + annot['unique-id']);
  // span.closest("div").append(popup);
  document.body.appendChild(popup);
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

  //!!!!!!!!!!!!!!! https://github.com/padolsey/findAndReplaceDOMText

  var foundElem;
  var kt = annot["key-text"];
  if(kt == "__PAGETOP__" || kt == "__ABS__") {
    // Ghost elements have absolute positioning relative to the page and float on the screen.
    // They can be interacted with the same as traditional "key text"
    let ghostElement = document.createElement("div");
    ghostElement.setAttribute("class", "ghost-text an-span-wrapper");
    ghostElement.setAttribute('linkedid', annot['unique-id']);
    ghostElement.setAttribute('offset', annot['ABS_offset']);
    ghostElement.style.top = annot['ABS_offset'];
    ghostElement.textContent = "Annotation: hover over me for information.";
    document.body.append(ghostElement);
  } else {
    findAndReplaceDOMText(document.body, {
      find: annot['key-text'],
      wrap: "span",
      wrapClass: "an-span-wrapper",
      wrapID: annot['unique-id'],
      wrapType: annot['type']
    });
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
            let is_no_attr_active = document.getElementById("no_attr_indicator").getAttribute("value");
            // update chrome storage to reflect that we've now synced the extension to the study page.
            chrome.storage.local.set({studyPin: studyPin}, function() {
            });
            chrome.storage.local.set({cNumber: cNum}, function() {
            });

            if(is_no_attr_active == "true"){
              chrome.storage.local.set({is_no_attr: true}, function() {
              });
            } else {
              chrome.storage.local.set({is_no_attr: false}, function() {
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
          chrome.storage.local.get('is_no_attr', function(result){
            var isNoAttr = result.is_no_attr;
            if(!isNoAttr) { //pardon the double negative... if its no_attr: just don't add the link.. if its attr, add the link.
              NO_ATTR_ACTIVE = true;
            } else {
              NO_ATTR_ACTIVE = false;
            }
          });

          modifyHTML();
          let thisURL = window.location.href; // used to check the url in background.js to see if we should increment progress for turning on the extension
          // for a given article.
          sendResponse({
            "responseCode": "success",
            "url": thisURL
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
