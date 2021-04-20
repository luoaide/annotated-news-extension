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
    <link rel="stylesheet" href="content/toolbar.css">
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

function addPanel(index, linkedID) {
  let annot = Annotations[index];
  let wrapper = document.createElement('div');
  const template = templates.getElementById('popup-template').content;
  const shadowRoot = wrapper.attachShadow({mode: 'open'}).appendChild(template.cloneNode(true));
  const panel = shadowRoot.getElementById('popup');
  panel.setAttibute('linkedid', linkedID); // calls attributeChangedCallback()
  panel.setAttibute('category', annot['category']); // calls attributeChangedCallback()
  let temp_str = `
      <h1 slot="title">${annot['panel-title']}</h1>
      <img src="${annot['image']}" slot="images">
      <p slot="body">${annot['text-bodies'][0]}</p>
      <a href="${annot['links'][0]}" slot="links">${annot['links'][0]}</a>
  `;
  panel.appendChild(temp_str);
  document.appendChild(wrapper); // calls connectedCallback()
}

function addPopup(index, linkedID) {
  let annot = Annotations[index];
  let wrapper = document.createElement('div');
  const template = templates.getElementById('popup-template').content;
  const shadowRoot = wrapper.attachShadow({mode: 'open'}).appendChild(template.cloneNode(true));
  const popup = shadowRoot.getElementById('popup');

  const span = document.getElementById(linkedID);
  popup.setAttibute('linkedid', linkedID);
  popup.setAttibute('category', annot['category']);
  let temp_str = `
      <h1 slot="title">${annot['panel-title']}</h1>
      <p slot="body">${annot['text-bodies'][0]}</p>
  `;
  popup.appendChild(temp_str);
  const popperInstance = Popper.createPopper(span, popup, {
    modifiers: [{
      name: "offset",
      options: {
        offset: [0, 8],
      },
    }, ],
  });
  document.appendChild(wrapper);

  const showEvents = ['mouseenter', 'focus'];
  const hideEvents = ['mouseleave', 'blur'];

  showEvents.forEach(event => {
    span.addEventListener(event, show());
  });

  hideEvents.forEach(event => {
    span.addEventListener(event, hide());
  });

  //HIDE AND SHOW need to be fixed to accomodate a specific popup that its' linked to.
  /*
  show() {
    // Make the tooltip visible
    popup.setAttribute('data-show', '');

    // Enable the event listeners
    this.popperInstance.setOptions({
      modifiers: [{
        name: 'eventListeners',
        enabled: true
      }],
    });

    // Update its position
    this.popperInstance.update();
  }

  hide() {
    // Hide the tooltip
    this.popup.removeAttribute('data-show');

    // Disable the event listeners
    this.popperInstance.setOptions({
      modifiers: [{
        name: 'eventListeners',
        enabled: false
      }],
    });
  }
  */
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
  let wrapper = document.createElement('div');
  const template = templates.getElementById('toolbar-template').content;
  const shadowRoot = wrapper.attachShadow({mode: 'open'}).appendChild(template.cloneNode(true));
  document.body.appendChild(wrapper);

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
                    console.log(JSON.stringify(Annotations));
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
