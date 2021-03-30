let pageData;
let html;
let isRunning = false;

///Use Popper.js for my pop-ups: https://popper.js.org/

//If the data object with all of the annotations is needed, the code must go in this "isolated world".
//Consider "messaging" the pageData object to another file to reduce complexity and keep update page seperate from modifyHTML.

function addMainPanel(){
  let newElems = "<script src='https://kit.fontawesome.com/b957d9f290.js' crossorigin='anonymous'></script>";
  newElems += "<div id='AnnotatedNewsToolbarWrapper'> <ul id='AnnotatedNewsToolbar'> <li id='AnnotatedNewsGearbox' class='AnnotatedNewsToolbox'> <i class='fa fa-gear'></i></li><li id='AnnotatedNewsTitle' class='AnnotatedNewsToolbox'><h1>Annotated <br> News</h1></li><li id='AnnotatedNewsPreview' class='AnnotatedNewsToolbox'>Some Text</li><li id='AnnotatedNewsArrows' class='AnnotatedNewsToolbox'><ul id='AnnotatedNewsArrowHolder'><li class='AnnotatedNewsArrow' id='AnnotatedNewsUpArrow'><i class='fas fa-angle-double-up'></i></li><li class='AnnotatedNewsArrow' id='AnnotatedNewsDownArrow'><i class='fas fa-angle-double-down'></i></li></ul></li></ul></div>";

  newElems += "<div id='AnnotatedNewsPanel'> <p> This is the News Panel </p>";

  return newElems;
}

function addContextPanel(key){
  let annotationObject = pageData[key]
  //TWO TYPES:
    // PANEL that gets placed inside the annotatedNewsPanel
    // POPUP that gets thrown at the end of the file.
}

function wrapAnnotation(key){
  //will be imported from the server via ajax and messaging

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

  return html;
}

function modifyHTML(){
    let annotatedNewsContent = addMainPanel();
/*
    for(key in pageData){
        //this website has annotions to display!
        isRunning = true;

        //add spans around the annotation text and return the entire webpage
        html = wrapAnnotation(key, html);
        annotatedNewsContent += addContent(key);
    }
*/
    annotatedNewsContent += "</div>" // closes the main Panel
    html += annotatedNewsContent
    return html;
}


function updateCurrentView() {
    if( isRunning ) {
        $( ".AnnotatedNewsSPAN" ).removeClass("AnnotatedNewsCurrentSPAN");

        let isCurrentSpan = ( function() {
            let tempCur = $( ".AnnotatedNewsSPAN" ).first();
            $( ".AnnotatedNewsSPAN" ).each(function() {
                //This logic should be upgraded, but for now it is operational.
                if( tempCur[0].getBoundingClientRect().top <= 0 && $( this )[0].getBoundingClientRect().top <= window.innerHeight ) {
                    tempCur = $( this );
                }
            });
            return tempCur;
        })();

        $( isCurrentSpan ).addClass("AnnotatedNewsCurrentSPAN");
        let key = $( isCurrentSpan ).attr("id");
        let thisAnnotation = pageData[key];
        // AUTHOR: $( "#AnnotatedNewsCurrentDisplay" ).html(thisAnnotation.annotation);
        // DEMOGRAPHICS$( "#AnnotatedNewsCurrentDisplay" ).html(thisAnnotation.annotation);
        // DATE: $( "#AnnotatedNewsCurrentDisplay" ).html(thisAnnotation.annotation);
        $( "#AnnotatedNewsCurrentDisplay" ).html(thisAnnotation.annotation);
    }
}


window.addEventListener('scroll', function () {
    updateCurrentView();
}, false);

//$("#AnnotatedNewsUpArrow").click(function(){});

//$("#AnnotatedNewsDownArrow").click(function(){});


//Messaging communicates with background.js & eventually activeContentScript.js
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
                    pageData = request.payload;
                    html = document.body.innerHTML
                    document.body.innerHTML = modifyHTML();
                    //updateCurrentView();
                    sendResponse({"responseCode": "success"});
                    break;

                case "unload_extension":
                    sendResponse({"responseCode": "success"});
                    window.location.reload();
            }

    }
    return true;
});
