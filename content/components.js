'use strict';

// RESOURCE: https://developers.google.com/web/fundamentals/web-components

// Custom Web Components:
class AnnotatedNewsToolbar extends HTMLElement {
  constructor() {
    super();

    var annotations;
    var currentPosition;
    const shadowRoot = this.attachShadow({mode: 'open'});

    //link stylesheet to new shadow DOM
    let styleSheet = document.createElement('link');
    styleSheet.rel = 'stylesheet';
    styleSheet.href = 'toolbar.css';
    shadowRoot.appendChild(styleSheet);

    //link fontawesome script
    let addScript = document.createElement('script');
    addScript.src = 'https://kit.fontawesome.com/b957d9f290.js';
    addScript.crossorigin = 'anonymous';
    shadowRoot.appendChild(addScript);

    //add HTML structure
    let wrapper = document.createElement('div');
    wrapper.id = 'wrapper';

      let toolbar = document.createElement('ul');
      toolbar.id = 'toolbar';

        let gearbox = document.createElement('li');
        gearbox.id = 'gearbox';
        gearbox.class = 'toolbox';
          let icon = document.createElement('i');
          icon.class = 'fa fa-gear';
          gearbox.appendChild(icon);
        toolbar.appendChild(gearbox);

        let title = document.createElement('li');
        title.id = 'title';
        title.class = 'toolbox';
          let header = document.createElement('h1');
          header.textContent = 'Annotated News';
          title.appendChild(header);
        toolbar.appendChild(title);

        let preview = document.createElement('li');
        //REGISTER LISTENERS
        preview.id = 'preview';
        preview.class = 'toolbox';
          let previewText = document.createElement('p');
          previewText.textContent = 'some text';
          preview.appendChild(previewText);
        preview.appendChild(preview);

        let arrows = document.createElement('li');
        //REGISTER LISTENERS
        arrows.id = 'arrows';
        arrows.class = 'toolbox';
          let arrowHolder = document.createElement('ul');
          icon.id = 'arrowHolder';
            let upArrow = document.createElement('li');
            upArrow.class = 'arrow';
            upArrow.id = 'upArrow';
            upArrow.addEventListener('click', e=> function(){
              this.incrementPosition();
              this.updatePreview();
            });
              let arrowIconUp = document.createElement('i');
              arrowIconUp.class = 'fas fa-angle-double-up';
              upArrow.appendChild(arrowIconUp);
            arrowHolder.appendChild(upArrow);
            let downArrow = document.createElement('li');
            downArrow.class = 'arrow';
            downArrow.id = 'downArrow';
            upArrow.addEventListener('click', e=> function(){
              this.decrementPosition();
              this.updatePreview();
            });
              let arrowIconDown = document.createElement('i');
              arrowIconDown.class = 'fas fa-angle-double-up';
              downArrow.appendChild(arrowIconDown);
            arrowHolder.appendChild(downArrow);
          arrows.appendChild(arrowHolder);
        toolbar.appendChild(arrows);

      wrapper.appendChild(toolbar);
    shadowRoot.appendChild(wrapper);

  }

  upload(data) {
    annotations = data;
  }

  set incrementPosition() {

  }

  set decrementPosition() {

  }

  set setCurPos(index) {

  }

  set updatePreviewText() {
    //use currentPosition
    let elem = this.getElementById('preview');
    elem.textContent = annotations[currentPosition];
  }
}
window.customElements.define("an-toolbar", AnnotatedNewsToolbar);

class AnnotatedNewsPanel extends HTML Elements {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({mode: 'open'});

    //link stylesheet to new shadow DOM
    let styleSheet = document.createElement('link');
    styleSheet.rel = 'stylesheet';
    styleSheet.href = 'panel.css';
    shadowRoot.appendChild(styleSheet);

    //link fontawesome script
    let addScript = document.createElement('script');
    addScript.src = 'https://kit.fontawesome.com/b957d9f290.js';
    addScript.crossorigin = 'anonymous';
    shadowRoot.appendChild(addScript);

    //add HTML structure "<div id='AnnotatedNewsPanel'> <p> This is the News Panel </p>";
    panel.innerHTML = `
      <div id='panel-title'>

      <slot></slot>
      </div>
    `;
  }

  get active() {
    this.hasAttribute('active');
  }

  set active(val) {
    if(val) {
      this.setAttibute('active', 'true')
    } else {
      this.removeAttribute('active')
    }
  }
}
window.customElements.define("an-panel", AnnotatedNewsPanel)

class AnnotatedNewsPopup extends HTML Elements {
  //true or false
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
    //this can use slots
    this.addEventListener('click', e=> {
      return
    });
  }
}
window.customElements.define("an-popup", AnnotatedNewsPopup)
