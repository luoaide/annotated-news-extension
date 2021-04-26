'use strict';

var State = "off";
var Annotations = {};
var Source = {};

'use strict';

const { createPopper } = Popper;

// RESOURCE: https://developers.google.com/web/fundamentals/web-components

// HTML Templates to parse.
var templatesString = `
  <template id="toolbar-template">
    <script src="https://kit.fontawesome.com/b957d9f290.js" crossorigin="anonymous"></script>
    <div id="wrapper">
      <ul id='toolbar'>

        <li id="gearbox" class="toolbox">
          <i class="fa fa-gear"></i>
        </li>

        <li id="title" class="toolbox">
          <h1>Annotated <br> News</h1>
        </li>

        <li id="preview" class="toolbox">
          Some Text
        </li>

        <li id="arrows" class="toolbox">
          <ul id="arrowHolder">
            <li class="arrow" id="upArrow"><i class="fas fa-angle-double-up"></i></li>
            <li class="arrow" id="downArrow"><i class="fas fa-angle-double-down"></i></li>
          </ul>
        </li>
      </ul>
    </div>
  </template>

  <template id="panel-template">
    <link rel="stylesheet" href="content/panel.css">
    <script src="https://kit.fontawesome.com/b957d9f290.js"></script>
    <div id="panel">
        <slot id="panel-title" name="title"></slot>
        <slot name="images"></slot>
        <slot name="body"></slot>
        <slot name="links"></slot>
    </div>
  </template>

  <template id="popup-template">
    <link rel="stylesheet" href="content/popup.css">

    <div id="popup" role="popup">
      <slot name="title">Title of the Context Panel</slot>
      <div id="line"></div>
      <slot id="text" name="body"></slot>
      <div id="arrow" data-popper-arrow></div>
    </div>

    <script src="/src/jquery-3.5.1.js"></script>
    <script src="https://unpkg.com/@popperjs/core@2"></script>
  </template>
`;


var parser = new DOMParser();
var templates = parser.parseFromString(templatesString, 'text/html');


// modify.js interacts directly with the DOM of the current webpage. Instead of storing HTML
// as a string, modifying, and returning, it modifies the existing DOM.

function addPopup(index, linkedID) {
  let annot = Annotations[index];
  let wrapper = document.createElement('div');
  const template = templates.getElementById('popup-template').content;
  const shadowRoot = wrapper.attachShadow({mode: 'open'}).appendChild(template.cloneNode(true));
  const popup = document.createElement('popup');

  const span = document.getElementById(linkedID);
  popup.setAttribute('linkedid', linkedID);
  popup.setAttribute('category', annot['category']);
  let temp_str = `
    <div id="wrapper">
      <h1 slot="title">${annot['panel-title']}</h1>
      <p slot="body">${annot['text-bodies'][0]}</p>
    </div>
  `;
  popup.appendChild(parser.parseFromString(temp_str, 'text/html').getElementById("wrapper").cloneNode(true));
  shadowRoot.appendChild(panel.cloneNode(true));
  const popperInstance = Popper.createPopper(span, popup, {
    modifiers: [{
      name: "offset",
      options: {
        offset: [0, 8],
      },
    }, ],
  });
  document.body.appendChild(wrapper);

  const showEvents = ['mouseenter', 'focus'];
  const hideEvents = ['mouseleave', 'blur'];

  showEvents.forEach(event => {
    span.addEventListener(event, show(popperInstance));
  });

  hideEvents.forEach(event => {
    span.addEventListener(event, hide(popperInstance));
  });
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
  let foundElem;
  let keyElem = document.querySelectorAll("p")
  keyElem.forEach(elem => {
    if(elem.textContent.includes(annot['key-text'])) {
      foundElem = elem;
    }
  });

  if(foundElem == null) console.log("no element found matching the key text"); //IMPROVE ERROR HANDLING
  let newSpan = `<span id="${annot['unique-id']}" category="${annot['category']}" class='an-span-wrapper'>${annot['key-text']}</span>`;
  let newElemContents = foundElem.innerHTML.replace(annot['key-text'], newSpan);
  foundElem.innerHTML = newElemContents;

  if(annot['type'] == 'panel') {
    chrome.runtime.sendMessage({
        "type": "to_frame",
        "command": "add_panel",
        "annotation": JSON.stringify(annot)
    });
  } else if(annot['type'] == 'popup') {
    addPopup(index, annot['unique-id']);
  }
}

function modifyHTML(){
  var frame = document.createElement('iframe');
  frame.setAttribute('src', chrome.runtime.getURL("frame/frame.html"));
  frame.setAttribute('id', 'annotatednews-root')
  frame.setAttribute('type', 'content')
  frame.setAttribute('style', 'width: 100% !important; bottom: 0% !important; left: 0 !important; position: fixed !important; text-align: center!important;')

  document.body.appendChild(frame);

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
                    Annotations = payload.annotations['annotations'];
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
