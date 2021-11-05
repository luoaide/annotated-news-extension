let colors = new Map()
colors.set('background', 'pink');
colors.set('context', 'yellow');

function setPanel(inputId, category) {
  //Make changes to the Frame based on the "annotation" currently in view for the user.
  //Also update the "preview" box with the correct
  // 1) color border
  // 2) preview text

  //set all the panels to display: none.
  $('.an-panel').css("display", "none");

  //check if we're trying to display the "settings" panel
  if(inputId == 'settings') {
    $("#settings").css("display", "inline");
  } else {
    //check to see if there is a valid panel with linkedid == inputId
    let panel = $("div[linkedid='" + inputId + "']");
    if(panel.length !== 0) {
      panel.css("display", "inline");
      $("#preview-text").text( panel.find(".panel-preview").text() );
      $("#preview-text").css({
        "color": "white",
        "text-align": "left",
        "font-style": "normal",
        "font-size": "20px"
      });
      $("#preview").css("border", "4px solid " + colors.get(category));
      $("#preview").css("background", "black");
    } else {
      $("#preview-text").text("Click text for a popup annotation.");
      $("#preview-text").css({
        "color": "white",
        "text-align": "center",
        "font-style": "italic",
        "font-size": "18px"
      });
      $("#preview").css("border", "4px solid " + colors.get(category));
      $("#preview").css("background", colors.get(category));
    }

  }
}

function resize() {
  let frameHeight = $(document).height();
  $('#panel-holder').css({
    "height": (frameHeight - 50) + "px"
  });
  $('.perspective-bin').css({
    "height": (frameHeight - 121) + "px"
  });
  $('.perspective').css({
    "height": (frameHeight - 175) + "px"
  });
}

$(document).ready(function() {
  //settup
  resize();

  //INTERFACES FOR EACH OF THE MENU BAR OPTIONS

  // >>> PREVIEW.   SHOW THE PANEL DRAWER WHEN CLICKED
  $("#preview").click(function(){
    //TELL THE PARENT TO "OPEN THE DRAWER"
    $("#toolbar-wrapper").hide();
    $("#closeArrow").show();
    // UPDATE THE STUDY BACKEND HERE... BUT BE CAREFUL NOT TO INCREMENT EVERY SINGLE TIME.
    // Send a post request to the Server to increment Progress.
    // var url = "https://www.annotatednews.com/finishedSurvey";
    // var xhr = new XMLHttpRequest();
    // xhr.open("POST", url);
    // xhr.setRequestHeader("Content-Type", "application/json");
    // var updateCommand = JSON.stringify({
    //   'c_number': cNum
    // });
    // xhr.send(updateCommand);
    window.parent.postMessage({
      "type": "frame_output",
      "command": "open_drawer",
    }, "*");
  });

  // >>> CLOSE ARROW.   CLOSE THE PANEL DRAWER WHEN CLICKED
  $("#closeArrow").click(function(){
    //TELL THE PARENT TO "OPEN THE DRAWER"
    $("#toolbar-wrapper").show();
    $("#closeArrow").hide();
    window.parent.postMessage({
      "type": "frame_output",
      "command": "close_drawer",
    }, "*");
  });

  // >>> HOMEPAGE.   Go to annotatednews.com:9095
  $("#logo").click(function(){
    window.parent.postMessage({
      "type": "frame_output",
      "command": "open_home_page",
    }, "*");
  });

  // // >>> UP ARROW.   SCROLL UP
  // $("#upArrow").click(function(){
  //   window.parent.postMessage({
  //     "type": "frame_output",
  //     "command": "scroll_up",
  //   }, "*");
  // });
  //
  // // >>> DOWN ARROW.   SCROLL DOWN
  // $("#upArrow").click(function(){
  //   window.parent.postMessage({
  //     "type": "frame_output",
  //     "command": "scroll_down",
  //   }, "*");
  // });



});

function addPanel(annot) {
  //annot: is a JSON object with all the annotations at a given index.

  let panel = document.createElement('div');
  panel.setAttribute('class', 'an-panel');
  panel.setAttribute('linkedid', annot['unique-id']);

  //add a header
  let header = document.createElement('h1');
  header.setAttribute('class', 'panel-title');
  header.textContent = annot['title'];
  panel.appendChild(header);

  //add a text body
  let text = document.createElement('p');
  text.setAttribute('class', 'panel-body');
  text.textContent = annot['text']
  panel.appendChild(text);

  //add content
  var content = annot["perspectives"];
  for(var i = 0; i<content.length; i++) {
    if(content[i] == "link") {
      let description = document.createElement('div');
      let link = document.createElement('div');
      description.setAttribute('class', 'popup-description');
      link.setAttribute('class', 'popup-link');
      description.textContent = content[i]['text'];
      link.textContent = content[i]['url'];
      popup.appendChild(description);
      popup.appendChild(link);
    } else if(content[i] == "quote") {
      let quote = document.createElement('div');
      quote.setAttribute('class', 'popup-quote');
      quote.textContent = content[i]['text'];
      popup.appendChild(quote);
      chrome.storage.local.get('is_no_attr', function(result){
        var isNoAttr = result.is_no_attr;
        if(!isNoAttr) { //pardon the double negative... if its no_attr: just don't add the link.. if its attr, add the link.
          let link = document.createElement('div');
          link.setAttribute('class', 'popup-link');
          link.textContent = content[i]['url'];
          popup.appendChild(link);
        }
      });
    } else if(content[i] == "webcontent") {

    } else {
      // error pass for now.
    }
  }

  //add preview Text
  let preview = document.createElement('p');
  preview.setAttribute('class' , 'panel-preview');
  preview.textContent = annot['preview'];
  panel.appendChild(preview);

  document.getElementById("panel-holder").appendChild(panel);
}


//https://www.msgtrail.com/articles/20200223-1106-passing-data-to-and-from-an-extension-sandbox/
window.addEventListener("message", function(event) {
    let request = event.data;
    switch( request.type ) {
        case "to_frame": //message to the frame
            switch( request.command ) {
                case "add_panel": //message coming from modify.js
                    console.log("message recieved");
                    let annot = JSON.parse(request.annotation);
                    addPanel(annot);
                    break;

                case "update_current": //message coming from modify.js
                    setPanel(request.curid, request.category);
            }
    }
    true;
});

window.addEventListener("resize", function(){
  resize();
});
