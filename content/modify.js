'use strict';

var State = "off";
var Annotations = {};
var Source = {};

// modify.js interacts directly with the DOM of the current webpage. Instead of storing HTML
// as a string, modifying, and returning, it modifies the existing DOM.

function addPanel(index, linkedID) {
  let annot = Annotations[index];
  let panel = document.createElement('an-panel'); // calls constructor()
  panel.setAttibute('linkedid', linkedID); // calls attributeChangedCallback()
  panel.setAttibute('category', annot['category']); // calls attributeChangedCallback()
  let template = `
      <h1 slot="title">${annot['panel-title']}</h1>
      <img src="${annot['image']}" slot="images">
      <p slot="body">${annot['text-bodies'][0]}</p>
      <a href="${annot['links'][0]}" slot="links">${annot['links'][0]}</a>
  `;
  panel.appendChild(template);
  document.appendChild(panel); // calls connectedCallback()
}

function addPopup(index, linkedID) {
  let annot = Annotations[index];
  let popup = document.createElement('an-popup'); // calls constructor()
  panel.setAttibute('linkedid', linkedID); // calls attributeChangedCallback()
  panel.setAttibute('category', annot['category']); // calls attributeChangedCallback()
  let template = `
      <h1 slot="title">${annot['panel-title']}</h1>
      <p slot="body">${annot['text-bodies'][0]}</p>
  `;
  popup.appendChild(template);
  document.appendChild(popup); // calls connectedCallback()
}

function linkData(index){
  // Takes a key to the next annotation in Annotations and does the following:
  //   1. adds a corresponding signal marker on the page to indicate an annotation exists for given text
  //   2. decides if the annotation takes the form of a Panel or Popup, adding the corresponding Element
  //      by calling the associated wrapper helper function.

  //index is the index of the current annotation object in the JSON object
  let annot = Annotations[index];

  //gather up all the element that has a textContent equal to the annotations key-text
  //do all elements have a .textContent property?
  let keyElem = document.querySelectorAll("*").find(elem => elem.textContent.includes(annot['key-text']))
  if(keyElem == null) console.log("no element found matching the key text"); //IMPROVE ERROR HANDLING
  let newSpan = `<span id="${annot['unique-id']}" category="${annot['category']}" class='an-span-wrapper'>${annot['key-text']}</span>`;
  let newElemContents = keyElem.innerHTML.replace(annot['key-text'], newSpan);
  keyElem.innerHTML = newElemContents;

  if(annot['type'] == 'panel') {
    addPanel(index, annot['unique-id']);
  } else if(annot['type'] == 'popup') {
    addPopup(index, annot['unique-id']);
  }
}

function modifyHTML(){
  let toolbar = document.createElement('an-toolbar');
  toolbar.upload(Annotations);
  document.appendChild(toolbar);

  let length = Annotations.length;

  for(var i = 0; i < length; i++){
    linkData(i);
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
                    Annotations = payload.annotations;
                    Source = payload.source;
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
