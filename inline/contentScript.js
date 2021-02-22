let pageData;
let orginalHTML;
let isRunning = false;




///Use Popper.js for my pop-ups: https://popper.js.org/



//If the data object with all of the annotations is needed, the code must go in this "isolated world".
//Consider "messaging" the pageData object to another file to reduce complexity and keep update page seperate from modifyHTML.

function addMainPanel(){
  let newElem = "<div id='AnnotatedNewsPanel'> <div id='AnnotatedNewsLogoBar'> Annotated News Panel <img id='panelLogo' src='/images/logo.PNG'> </div>";
  newElem += "<p id='AnnotatedNewsCurrentDisplay'></p>";
  newElem += "</div>";

  return newElem;
}

function addContextPanel(key){
  let annotationObject = pageData[key]

  let ???

}

function wrapAnnotation(key, strHTML){
  //will be imported from the server via ajax and messaging

  //key is a string not an object
  let annotationObject = pageData[key];
  let annotationLength = annotationObject.text.length;
  let startIndex = strHTML.indexOf(annotationObject.text);
  let tailTag = "</span>";
  //ISSUE: The .indexOf technique fails when the "text" is interupted by another html element or something else ~behind the scenes~
  if(startIndex != -1) {
      //ID of each Span is AnnotatedNews followed by the corresponding key of the annotation object within annotations Object
      //ex. AnnotatedNews0 is the first annotation... should allow access to pertinent information latter in an expandable way... ie. author, demographics, date.
      let uniqueHeadTag = "<span class='" + "AnnotatedNewsSPAN" + "' id='" + key + "'>";
      strHTML = strHTML.slice(0, startIndex) + uniqueHeadTag + annotationObject.text + tailTag + strHTML.slice(startIndex+annotationLength);
  }

  return strHTML;
}

function modifyHTML(){
    let strHTML = orginalHTML;

    let annotatedNewsPanels = addMainPanel();

    for(key in pageData){
        //this website has annotions to display!
        isRunning = true;

        //add spans around the annotation text and return the entire webpage
        strHTML = wrapAnnotation(key, strHTML);
        annotatedNewsPanels += addContextPanel(key);
    }

    strHTML += annotatedNewsPanels

    return strHTML;
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
                    orginalHTML = document.body.innerHTML;
                    document.body.innerHTML = modifyHTML();
                    //updateCurrentView(); // FIX LOGIC.
                    sendResponse({"responseCode": "good"});
                    break;

                case "unload_extension":
                    document.body.innerHTML = orginalHTML;
            }

    }
});
