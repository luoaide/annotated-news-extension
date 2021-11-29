let NO_ATTR_ACTIVE = false;
let CURRENT_PANEL = "none";

function setPanel(inputId) {
  //Make changes to the Frame based on the "annotation" currently in view for the user.
  //Also update the "preview" box with the correct
  // 1) preview text
  // 2) annotation type

  //set all the panels to display: none.
  $('.an-panel').css("display", "none");
  CURRENT_PANEL = inputId;
  //check to see if there is a valid panel with linkedid == inputId
  let panel = $("div[linkedid='" + inputId + "']");
  if (panel.length !== 0) {
    // display the correct panel
    panel.css("display", "inline");
    $("#noAnnotationData").hide();
  } else {
    $("#noAnnotationData").show();
  }
}

function updatePreview(linkedid, kind, text) {
  $("#explainer-text").html("Currently Selected: <b>" + kind + "</b> annotation");
  $("#key-text").html(text);
  if(kind == "counterpoint") {
    let panel = $("div[linkedid='" + linkedid + "']");
    $("#preview-text").text(panel.find(".panel-preview").text());
  } else {
    $("#preview-text").text("Click the highlighted text to view a context annotation...");
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

function openPanel() {
  $("#toolbar-wrapper").hide();
  $("#closeArrow").show();
  window.parent.postMessage({
    "type": "frame_output",
    "command": "open_drawer",
  }, "*");
  resize();
  // Send a message to background.js to update the Annotation Data table on the server:
  window.parent.postMessage({
    "type": "frame_output",
    "command": "update_annotation_database",
    "annotId": CURRENT_PANEL,
    "newOpen": 1,
    "helpful": 0
  }, "*");
}

function closePanel() {
  $("#toolbar-wrapper").show();
  $("#closeArrow").hide();
  window.parent.postMessage({
    "type": "frame_output",
    "command": "close_drawer",
  }, "*");
}

$(document).ready(function() {
  //settup
  resize();

  chrome.storage.local.get('is_no_attr', function(result){
    var isNoAttr = result.is_no_attr;
    if(!isNoAttr) { //pardon the double negative... if its no_attr: just don't add the link.. if its attr, add the link.
      NO_ATTR_ACTIVE = true;
    } else {
      NO_ATTR_ACTIVE = false;
    }
  });

  //INTERFACES FOR EACH OF THE MENU BAR OPTIONS

  // >>> PREVIEW.   SHOW THE PANEL DRAWER WHEN CLICKED
  $("#preview").click(function() {
    //TELL THE PARENT TO "OPEN THE DRAWER"
    openPanel();
  });

  // >>> CLOSE ARROW.   CLOSE THE PANEL DRAWER WHEN CLICKED
  $("#closeArrow").click(function() {
    //TELL THE PARENT TO "OPEN THE DRAWER"
    closePanel();
  });

  // >>> HOMEPAGE.   Go to annotatednews.com:9095
  $("#logo").click(function() {
    window.parent.postMessage({
      "type": "frame_output",
      "command": "open_home_page",
    }, "*");
  });

  // AUTO SCROLLING NOT SUPPORTED:
  // // >>> UP ARROW.   SCROLL UP
  // $("#upArrow").click(function() {
  //   window.parent.postMessage({
  //     "type": "frame_output",
  //     "command": "scroll_up",
  //   }, "*");
  // });
  //
  // // >>> DOWN ARROW.   SCROLL DOWN
  // $("#upArrow").click(function() {
  //   window.parent.postMessage({
  //     "type": "frame_output",
  //     "command": "scroll_down",
  //   }, "*");
  // });

  $("a").click(function(el) {
    window.parent.postMessage({
      "type": "frame_output",
      "command": "go_to_link",
      "href": el.href
    }, "*");
  });


});

function addPanel(annot) {
  //annot: is a JSON object with all the annotations at a given index.

  let panel = document.createElement('div');
  panel.setAttribute('class', 'an-panel');
  panel.setAttribute('linkedid', annot['unique-id']);

  let title = document.createElement('h1');
  title.setAttribute('class', 'panel-title');
  title.textContent = annot['title'];
  panel.appendChild(title);

  let text = document.createElement('h3');
  text.setAttribute('class', 'panel-text');
  text.textContent = annot['text']
  panel.appendChild(text);

  let perspectiveBin = document.createElement('ul');
  perspectiveBin.setAttribute('class', 'perspective-bin');

  let perPill = document.createElement('span');
  perPill.setAttribute('class', 'pill');
  perPill.textContent = "Perspective ";

  //add content
  var content = annot["perspectives"];
  for (var i = 0; i < content.length; i++) {
    let perspective = document.createElement('li');
    perspective.setAttribute('class', 'perspective');

    let perHeader = document.createElement('p');
    perHeader.setAttribute('class', 'per-header');
    perPill.textContent = "Perspective " + (i+1);
    perHeader.appendChild(perPill);
    perHeader.innerHTML += content[i]["perspective"];
    perspective.appendChild(perHeader);

    if(content[i]["content-type"] == "link") {
      let perText = document.createElement('p');
      perText.setAttribute('class', 'per-text');
      perText.textContent = content[i]["text"]
      perspective.appendChild(perText);

      var button = document.createElement("div");
      button.setAttribute('class', 'per-button');
      var link = document.createElement('a');
      link.setAttribute('class', 'per-link');
      link.setAttribute("href", content[i]['url']);
      link.setAttribute("target", "_blank");
      link.textContent = content[i]['source'];
      button.appendChild(link);
      perspective.appendChild(button);

    } else if(content[i]["content-type"] == "quote") {
      var quote = document.createElement('p');
      quote.setAttribute('class', 'per-quote');
      if(!NO_ATTR_ACTIVE) {
        var string = "Quote from <a href=" + content[i]["url"] + " target='blank' class='attribution'>" + contentDict[i]["source"] + "</a>: ";
        quote.innerHTML = string;
      }
      quote.innerHTML += content[i]['text'];
      perspective.appendChild(quote);

    } else if(content[i]["content-type"] == "file") {
      let perText = document.createElement('p');
      perText.setAttribute('class', 'per-text');
      perText.textContent = content[i]["text"]
      perspective.appendChild(perText);

      var button = document.createElement("div");
      button.setAttribute('class', 'per-button');
      var link = document.createElement('a');
      link.setAttribute('class', 'per-link');
      link.setAttribute("href", content[i]['path']);
      link.setAttribute("target", "_blank");
      link.textContent = content[i]['source'];
      button.appendChild(link);
      perspective.appendChild(button);

      //add file.
    } else if(content[i]["content-type"] == "file-quote") {
      var quote = document.createElement('p');
      quote.setAttribute('class', 'per-quote');
      if(!NO_ATTR_ACTIVE) {
        var string = "Quote from <a href=" + content[i]["path"] + " target='blank' class='attribution'>" + contentDict[i]["source"] + "</a>: ";
        quote.innerHTML = string;
      }
      quote.innerHTML += content[i]['text'];
      perspective.appendChild(quote);

    } else if(content[i]["content-type"] == "quote-list") {
      var list = content[i]['text']
      for(var p = 0; p<list.length; p++) {
        var quote = document.createElement('p');
        quote.setAttribute('class', 'per-quote');
        if(!NO_ATTR_ACTIVE) {
          var string = "Quote from <a href=" + content[i]["url"] + " target='blank' class='attribution'>" + contentDict[i]["source"] + "</a>: ";
          quote.innerHTML = string;
        }
        quote.innerHTML += list[p];
        perspective.appendChild(quote);
      }

    } else {
      // error pass for now.
      console.log("annotatednews/frame.js tried to load an unsupported content-type into a perpsectives panel.");
    }

    perspectiveBin.appendChild(perspective);
  }

  //add preview Text
  let preview = document.createElement('p');
  preview.setAttribute('class', 'panel-preview');
  preview.textContent = annot['preview'];
  panel.appendChild(preview);

  panel.appendChild(perspectiveBin);
  document.getElementById("panel-holder").appendChild(panel);
}


//https://www.msgtrail.com/articles/20200223-1106-passing-data-to-and-from-an-extension-sandbox/
window.addEventListener("message", function(event) {
  let request = event.data;
  switch (request.type) {
    case "to_frame": //message to the frame
      switch (request.command) {
        case "add_panel": //message coming from modify.js
          let annot = JSON.parse(request.annotation);
          addPanel(annot);
          break;

        case "open_panel": //message coming from modify.js
          openPanel();
          break;

        case "close_panel": //message coming from modify.js
          closePanel();
          break;

        case "update_current": //message coming from modify.js
          setPanel(request.curid);
          break;

        case "preview_current":
          updatePreview(request.curid, request.kind, request.key_text);
          break;

        case "resize":
          resize();
      }
  }
  true;
});
