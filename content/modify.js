var GLOBALSTATE = "inactive";
var NO_ATTR_ACTIVE = false;
var ANNOTATIONS = {};

// modify.js interacts directly with the DOM of the current webpage. Instead of storing HTML
// as a string, modifying, and returning, it modifies the existing DOM.

function addPopup(annot) {
  let popup = document.createElement('an-popup');
  popup.setAttribute('role', 'popup');
  popup.setAttribute('linkedid', annot['unique-id']);

  let perPill = document.createElement('span');
  perPill.setAttribute('class', 'pill');
  perPill.textContent = "Context Annotation";

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

      var button = document.createElement("div");
      button.setAttribute('class', 'popup-button');
      var link = document.createElement('a');
      link.setAttribute('class', 'popup-link');
      link.setAttribute("href", contentDict[i]['url']);
      link.setAttribute("target", "_blank");
      link.textContent = contentDict[i]['source'];
      button.appendChild(link);
      content.appendChild(button);

    } else if(contentDict[i]["content-type"] == "quote") {
      var quote = document.createElement('div');
      quote.setAttribute('class', 'popup-quote');
      content.appendChild(quote);
      if(!NO_ATTR_ACTIVE) {
        var string = "Quote from <a href=" + contentDict[i]["url"] + " target='blank' class='popup-source-link'>" + contentDict[i]["source"] + "</a>: ";
        quote.innerHTML = string;
      }
      quote.innerHTML += contentDict[i]['text'];

    } else if(contentDict[i]["content-type"] == "file") {
      var description = document.createElement('div');
      description.setAttribute('class', 'popup-description');
      description.textContent = contentDict[i]['text'];
      content.appendChild(description);

      var link = document.createElement('a');
      link.setAttribute('class', 'popup-source-link');
      link.setAttribute("href", contentDict[i]['path']);
      link.setAttribute("target", "_blank");
      link.textContent = "Open File";
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
    "no_attr_active": NO_ATTR_ACTIVE
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
  if(kt == "__ABS__") {
    // Ghost elements have fixed positioning relative to the page and float on the screen.
    // They can be interacted with the same as traditional "key text"
    let ghostElement = document.createElement("div");
    ghostElement.setAttribute("class", "ghost-text an-span-wrapper");
    ghostElement.setAttribute('id', annot['unique-id']);
    ghostElement.setAttribute('offset', annot['ABS_offset']);
    ghostElement.setAttribute('type', annot['type']);
    ghostElement.style.top = annot['ABS_offset'] + "px";
    ghostElement.textContent = "Annotation: click me for information.";
    document.body.append(ghostElement);
  } else {
    findAndReplaceDOMText(document.body, {
      find: annot['key-text'],
      wrap: "span",
      wrapClass: "an-span-wrapper",
      wrapID: annot['unique-id'],
      wrapType: annot['type']
    });
    // Several attempts to prevent key text that is also a link from performing the link operation:
    // event.preventDefault() works most consistently.
    // $("#" + annot['unique-id']).parents().attr("onclick", "return false;");
    // $("#" + annot['unique-id']).parents().find("a").attr("href", "javascript: void(0);");
    $("#" + annot['unique-id']).click(function(event){
      event.preventDefault();
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
//modify.js contains state information about the extension on the client side.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.type) {
    case "user_input":
      switch (request.command) {
        // Used to attempt to prevent multiple instances of the modify.js from being loaded...
        case "is_present":
          sendResponse({
            "status": "active"
          });
          break;
        case "sync":
          let curURL = window.location.href;
          let syncURL = "https://www.annotatednews.com/instructions";
          if(curURL == syncURL) {
            let studyPin = document.getElementById("studyPin").textContent;
            let cNum = document.getElementById("userCNum").textContent;
            let is_no_attr_active = document.getElementById("no_attr_indicator").getAttribute("value");
            // update chrome storage to reflect that we've now synced the extension to the study page.
            chrome.storage.local.set({studyPin: studyPin}, () => {});
            chrome.storage.local.set({cNumber: cNum}, () => {});

            if(is_no_attr_active == "true"){
              chrome.storage.local.set({is_no_attr: true}, () => {});
            } else {
              chrome.storage.local.set({is_no_attr: false}, () => {});
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
            "output": "[Annotations Loaded] Please read the article and the annotations. Feel free to continue exploring and researching the issue as the annotations direct you to other resources."
          });
          break;
        case "turn_off":
          GLOBALSTATE = "inactive";
          ANNOTATIONS = {};
          sendResponse({
            "output": "The extension is now off."
          });
          window.location.reload();
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
          //console.log(request.payload);
          let payload = JSON.parse(request.payload);
          GLOBALSTATE = "active";
          ANNOTATIONS = payload.annotations;
          chrome.storage.local.get('is_no_attr', function(result){
            var isNoAttr = result.is_no_attr;
            if(isNoAttr) { //pardon the double negative... if its no_attr: just don't add the link.. if its attr, add the link.
              NO_ATTR_ACTIVE = true;
            } else {
              NO_ATTR_ACTIVE = false;
            }
          });

          modifyHTML();

          let thisURL = window.location.href; // used to check the url in background.js to see if we should increment progress for turning on the extension
          // for a given article.

          // The below callback to background.js adds the first "load time" for article or social to a stats dict in chrome local storage.
          sendResponse({
            "responseCode": "success",
            "url": thisURL
          });
      }

  }
  return true;
});
