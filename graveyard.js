
    //ALTERNATIVE METHOD NOT USING A PARSED HTML STRING:
    // //link stylesheet to new shadow DOM
    // let styleSheet = document.createElement('link');
    // styleSheet.rel = 'stylesheet';
    // styleSheet.href = 'toolbar.css';
    // shadowRoot.appendChild(styleSheet);
    //
    // //link fontawesome script
    // let addScript = document.createElement('script');
    // addScript.src = 'https://kit.fontawesome.com/b957d9f290.js';
    // addScript.crossorigin = 'anonymous';
    // shadowRoot.appendChild(addScript);
    //
    // //add HTML structure
    // let wrapper = document.createElement('div');
    // wrapper.id = 'wrapper';
    //
    // let toolbar = document.createElement('ul');
    // toolbar.id = 'toolbar';
    //
    // let gearbox = document.createElement('li');
    // gearbox.id = 'gearbox';
    // gearbox.class = 'toolbox';
    // let icon = document.createElement('i');
    // icon.class = 'fa fa-gear';
    // gearbox.appendChild(icon);
    // toolbar.appendChild(gearbox);
    //
    // let title = document.createElement('li');
    // title.id = 'title';
    // title.class = 'toolbox';
    // let header = document.createElement('h1');
    // header.textContent = 'Annotated News';
    // title.appendChild(header);
    // toolbar.appendChild(title);
    //
    // let preview = document.createElement('li');
    // //REGISTER LISTENERS
    // preview.id = 'preview';
    // preview.class = 'toolbox';
    // let previewText = document.createElement('p');
    // previewText.textContent = 'some text';
    // preview.appendChild(previewText);
    // preview.appendChild(preview);
    //
    // let arrows = document.createElement('li');
    // //REGISTER LISTENERS
    // arrows.id = 'arrows';
    // arrows.class = 'toolbox';
    // let arrowHolder = document.createElement('ul');
    // icon.id = 'arrowHolder';
    // let upArrow = document.createElement('li');
    // upArrow.class = 'arrow';
    // upArrow.id = 'upArrow';
    // upArrow.addEventListener('click', e=> function(){
    // this.incrementPosition();
    // this.updatePreview();
    // });
    // let arrowIconUp = document.createElement('i');
    // arrowIconUp.class = 'fas fa-angle-double-up';
    // upArrow.appendChild(arrowIconUp);
    // arrowHolder.appendChild(upArrow);
    // let downArrow = document.createElement('li');
    // downArrow.class = 'arrow';
    // downArrow.id = 'downArrow';
    // upArrow.addEventListener('click', e=> function(){
    // this.decrementPosition();
    // this.updatePreview();
    // });
    // let arrowIconDown = document.createElement('i');
    // arrowIconDown.class = 'fas fa-angle-double-up';
    // downArrow.appendChild(arrowIconDown);
    // arrowHolder.appendChild(downArrow);
    // arrows.appendChild(arrowHolder);
    // toolbar.appendChild(arrows);
    //
    // wrapper.appendChild(toolbar);
    // shadowRoot.appendChild(wrapper);



    // // HTML Templates to parse.
    // var templatesString = `
    //   <template id="toolbar-template">
    //     <script src="https://kit.fontawesome.com/b957d9f290.js" crossorigin="anonymous"></script>
    //     <div id="wrapper">
    //       <ul id='toolbar'>
    //
    //         <li id="gearbox" class="toolbox">
    //           <i class="fa fa-gear"></i>
    //         </li>
    //
    //         <li id="title" class="toolbox">
    //           <h1>Annotated <br> News</h1>
    //         </li>
    //
    //         <li id="preview" class="toolbox">
    //           Some Text
    //         </li>
    //
    //         <li id="arrows" class="toolbox">
    //           <ul id="arrowHolder">
    //             <li class="arrow" id="upArrow"><i class="fas fa-angle-double-up"></i></li>
    //             <li class="arrow" id="downArrow"><i class="fas fa-angle-double-down"></i></li>
    //           </ul>
    //         </li>
    //       </ul>
    //     </div>
    //   </template>
    //
    //   <template id="panel-template">
    //     <link rel="stylesheet" href="content/panel.css">
    //     <script src="https://kit.fontawesome.com/b957d9f290.js"></script>
    //     <div id="panel">
    //         <slot id="panel-title" name="title"></slot>
    //         <slot name="images"></slot>
    //         <slot name="body"></slot>
    //         <slot name="links"></slot>
    //     </div>
    //   </template>
    //
    //   <template id="popup-template">
    //     <link rel="stylesheet" href="content/popup.css">
    //
    //     <div id="popup" role="popup">
    //       <slot name="title">Title of the Context Panel</slot>
    //       <div id="line"></div>
    //       <slot id="text" name="body"></slot>
    //       <div id="arrow" data-popper-arrow></div>
    //     </div>
    //
    //     <script src="/src/jquery-3.5.1.js"></script>
    //     <script src="https://unpkg.com/@popperjs/core@2"></script>
    //   </template>
    // `;
    //
    //
    // var parser = new DOMParser();
    // var templates = parser.parseFromString(templatesString, 'text/html');


    // popup.appendChild(parser.parseFromString(temp_str, 'text/html').getElementById("wrapper").cloneNode(true));
    // shadowRoot.appendChild(popup.cloneNode(true));
