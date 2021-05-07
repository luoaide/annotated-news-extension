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


$(document).ready(function() {
  //settup
  let frameHeight = $(document).height();
  $('#panel-holder').css({
    "height": (frameHeight - 80) + "px"
  });



  //INTERFACES FOR EACH OF THE MENU BAR OPTIONS

  // >>> PREVIEW.   SHOW THE PANEL DRAWER WHEN CLICKED
  $("#preview").click(function(){
    //TELL THE PARENT TO "TOGGLE THE DRAWER"
    window.parent.postMessage({
      "type": "frame_output",
      "command": "toggle_drawer",
    }, "*");
  });

  // >>> SETTINGS.   SHOW THE SETTINGS DRAWER WHEN CLICKED
  $("#gearbox").click(function(){
      setPanel("settings");
      window.parent.postMessage({
        "type": "frame_output",
        "command": "toggle_drawer",
      }, "*");
  });

  // >>> HOMEPAGE.   Go to annotatednews.com:9095
  $("#title").click(function(){
    window.parent.postMessage({
      "type": "frame_output",
      "command": "open_home_page",
    }, "*");
  });

  // >>> UP ARROW.   SCROLL UP
  $("#upArrow").click(function(){
    window.parent.postMessage({
      "type": "frame_output",
      "command": "scroll_up",
    }, "*");
  });

  // >>> DOWN ARROW.   SCROLL DOWN
  $("#upArrow").click(function(){
    window.parent.postMessage({
      "type": "frame_output",
      "command": "scroll_down",
    }, "*");
  });



});

function addPanel(annot) {
  //annot: is a JSON object with all the annotations at a given index.

  let panel = document.createElement('div');
  panel.setAttribute('class', 'an-panel');
  panel.setAttribute('linkedid', annot['unique-id']);
  panel.setAttribute('category', annot['category']);

  //add a header
  let header = document.createElement('h1');
  header.setAttribute('class', 'panel-title');
  header.textContent = annot['panel-title'];
  panel.appendChild(header);

  //add a image
  let image = document.createElement('img');
  image.setAttribute('class', 'panel-image');
  image.src = annot['images'];
  panel.appendChild(image);

  //add a text body
  let text = document.createElement('p');
  text.setAttribute('class', 'panel-body');
  text.textContent = annot['text-bodies']
  panel.appendChild(text);

  //add a link
  let link = document.createElement('a');
  link.setAttribute('class' , 'panel-link');
  link.textContent = "Heres a link to external resources";
  link.href = annot['links'][0];
  panel.appendChild(link);

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
