'use strict';

const { createPopper } = Popper;

// RESOURCE: https://developers.google.com/web/fundamentals/web-components

// HTML Templates to parse.
var templatesString = `
  <template id="toolbar-template">
    <link rel="stylesheet" href="toolbar.css">
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
    <link rel="stylesheet" href="panel.css">
    <script src="https://kit.fontawesome.com/b957d9f290.js"></script>
    <div id="panel">
        <slot id="panel-title" name="title"></slot>
        <slot name="images"></slot>
        <slot name="body"></slot>
        <slot name="links"></slot>
    </div>
  </template>

  <template id="popup-template">
    <link rel="stylesheet" href="popup.css">

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


// Custom Web Components:

//well.... fuck: https://bugs.chromium.org/p/chromium/issues/detail?id=390807
class AnnotatedNewsPanel extends HTMLElement {
  //this defines the attributes that I'm going to 'watch' and call changedCallback on their change.
  static get observedAttributes() {
    return ['linkedid', 'category', 'active'];
  }

  //attribute getters and setters: has linkedid and a category attribute
  get linkedId() {
    return this.connectedSpan.getAttribute('id');
  }

  set linkedId(val) {
    if(val == null) {
      this.removeAttribute('linkedid');
    } else {
      this.setAttribute('linkedid', val);
    }
  }

  get category() {
    return this.connectedSpan.getAttribute('category');
  }

  set category(val) {
    if(val == null) {
      this.removeAttribute('category');
    } else {
      this.setAttribute('category', val);
    }
  }

  get active() {
    this.hasAttribute('active');
  }

  set active(val) {
    if(val) {
      this.setAttibute('active', '')
    } else {
      this.removeAttribute('active')
    }
  }

  constructor() {
    super();

    const newSpan = document.createElement('span');
    const template = templates.getElementById('panel-template').content;
    const shadowRoot = this.attachShadow({mode: 'open'}).appendChild(template.cloneNode(true));
    this.connectedSpan = newSpan;
  }

  connectedCallback() {
    const showEvents = ['mouseenter', 'focus'];
    const hideEvents = ['mouseleave', 'blur'];

    showEvents.forEach(event => {
      this.connectedSpan.addEventListener(event, this.show());
    });

    hideEvents.forEach(event => {
      this.connectedSpan.addEventListener(event, this.hide());
    });
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    if(oldVal !== newVal) {
      if(attr == 'linkedid') {
        this.connectedSpan = document.getElementById(newVal); //sets the this.connectedSpan property to the appropriate span (id must be unique)
      } else if(attr == 'category') {
        this.connectedSpan.setAttibute('category', newVal); //determines what color is displayed to indicate annotation type
      } else if(attr == 'active') {
        //if active is ="true" then make the panel visable!! look at the logic active.js for help here.
      }
    }
  }
}
window.customElements.define("an-panel", AnnotatedNewsPanel);

class AnnotatedNewsPopup extends HTMLElement {
  //this defines the attributes that I'm going to 'watch' and call changedCallback on their change.
  static get observedAttributes() {
    return ['linkedid', 'category'];
  }

  //attribute getters and setters: has linkedid and a category attribute
  get linkedId() {
    return this.connectedSpan.getAttribute('id');
  }

  set linkedId(val) {
    if(val == null) {
      this.removeAttribute('linkedid');
    } else {
      this.setAttribute('linkedid', val);
    }
  }

  get category() {
    return this.connectedSpan.getAttribute('category');
  }

  set category(val) {
    if(val == null) {
      this.removeAttribute('category');
    } else {
      this.setAttribute('category', val);
    }
  }

  constructor() {
    super();

    const newSpan = document.createElement("span"); //this is a placeholder blank span
    const template = templates.getElementById('popup-template').content;
    const shadowRoot = this.attachShadow({mode: 'open'}).appendChild(template.cloneNode(true));
    this.connectedSpan = newSpan;                         //these two properties are needed by createPopper
    this.popup = shadowRoot.getElementById('popup');      //these two properties are needed by createPopper
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    if(oldVal !== newVal) {
      if(attr == 'linkedid') {
        this.connectedSpan = document.getElementById(newVal); //sets the this.connectedSpan property to the appropriate span (id must be unique)
      } else if(attr == 'category') {
        this.connectedSpan.setAttibute('category', newVal); //determines what color is displayed to indicate annotation type
      }
    }
  }

  connectedCallback() {
    const popperInstance = Popper.createPopper(this.connectedSpan, this.popup, {
      modifiers: [{
        name: "offset",
        options: {
          offset: [0, 8],
        },
      }, ],
    });

    const showEvents = ['mouseenter', 'focus'];
    const hideEvents = ['mouseleave', 'blur'];

    showEvents.forEach(event => {
      this.connectedSpan.addEventListener(event, this.show());
    });

    hideEvents.forEach(event => {
      this.connectedSpan.addEventListener(event, this.hide());
    });
  }

  show() {
    // Make the tooltip visible
    this.popup.setAttribute('data-show', '');

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
}
window.customElements.define("an-popup", AnnotatedNewsPopup);

class AnnotatedNewsToolbar extends HTMLElement {
  constructor() {
    super();

    var annotations = {};
    var index = 0;

    const template = templates.getElementById('toolbar-template').content;
    const shadowRoot = this.attachShadow({mode: 'open'}).appendChild(template.cloneNode(true));
  }

  upload(data) {
    annotations = data;
  }
  //
  // set incrementPosition() {
  //
  // }
  //
  // set decrementPosition() {
  //
  // }
  //
  // set setCurPos(index) {
  //
  // }
  //
  // set updatePreviewText() {
  //   //use currentPosition
  //   let elem = this.getElementById('preview');
  //   elem.textContent = annotations[index].preview;
  // }
}
window.customElements.define('an-toolbar', AnnotatedNewsToolbar);
