let NO_ATTR_ACTIVE = false;

function setPanel(inputId, category) {
  //Make changes to the Frame based on the "annotation" currently in view for the user.
  //Also update the "preview" box with the correct
  // 1) preview text
  // 2) annotation type

  //set all the panels to display: none.
  $('.an-panel').css("display", "none");

  //check to see if there is a valid panel with linkedid == inputId
  let panel = $("div[linkedid='" + inputId + "']");
  if (panel.length !== 0) {
    // display the correct panel
    panel.css("display", "inline");
    $("#noAnnotationData").hide();
    // update preview text
    $("#preview-text").text(panel.find(".panel-preview").text());
    // $("#explainer-text").text(); can change explainer text too
  } else {
    $("#noAnnotationData").show();
    $("#preview-text").text("Click text for a popup annotation.");
    $("#explainer-text").text();
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

  // >>> UP ARROW.   SCROLL UP
  $("#upArrow").click(function() {
    window.parent.postMessage({
      "type": "frame_output",
      "command": "scroll_up",
    }, "*");
  });

  // >>> DOWN ARROW.   SCROLL DOWN
  $("#upArrow").click(function() {
    window.parent.postMessage({
      "type": "frame_output",
      "command": "scroll_down",
    }, "*");
  });



});

function addPanel(annot) {
  //annot: is a JSON object with all the annotations at a given index.
  // FORMAT FOR PANEL
  // <div class="an-panel" linkedid="an-1234">
  //   <h1 class="panel-title">Perspectives on the Raffensperger Phone Call</h1>
  //   <h3 class="panel-text">At Question: Was the Raffensperger phone call illegal?</h3>
  //   <ul class="perspective-bin">
  //     <li class="perspective">
  //       <p class="per-header"><span class="pill">Perspective</span> The phone call was illegal</p>
  //       <p class="per-quote"> <span class="attribution"> Quote from <a href="https://www.npr.org/2021/01/04/953151921/trumps-call-to-georgia-election-officials-sparks-debate-over-legality-ethics"> NPR:</a> </span>Trump's message during the call also violates Georgia law, according to Anthony Michael Kreis, a Georgia State University law professor, who spoke with Politico on Sunday. \"The Georgia code says that anybody who solicits, requests or commands or otherwise attempts to encourage somebody to commit election fraud is guilty of solicitation of election fraud,\" Kreis said. \"'Soliciting or requesting' is the key language. The president asked, in no uncertain terms, the secretary of state to invent votes, to create votes that were not there. Not only did he ask for that in terms of just overturning the specific margin that Joe Biden won by, but then said we needed one additional vote to secure victory in Georgia.</p>
  //     </li>
  //     <li class="perspective">
  //       <p class="per-header"><span class="pill">Perspective</span> The phone call was disturbing</p>
  //       <p class="per-quote"><span class="attribution"> Quote from <a href="https://www.npr.org/2021/01/04/953151921/trumps-call-to-georgia-election-officials-sparks-debate-over-legality-ethics"> NPR:</a> </span> Kim Wehle, law professor at the University of Baltimore and author of How to Read the Constitution — and Why, told NPR's Steve Inskeep on Morning Edition on Monday that it's \"a crime to request, solicit or ask someone else to say falsify returns or falsify reports of votes, and arguably that's what we heard on the call.\" She added, \"Whether this is prosecutable is a different question from whether it's antithetical to the rule of law and the Constitution and democracy itself, and I would say clearly it is. It's very disturbing.</p>
  //     </li>
  //     <li class="perspective">
  //       <p class="per-header"><span class="pill">Perspective</span> The phone call was a confidential settlement discussion</p>
  //       <p class="per-text">Twitter Post from David Shafer, Chairman of the Georgia Republican Party:</p>
  //       <div class="per-webcontent"><blockquote class="twitter-tweet"><p lang="en" dir="ltr">President <a href="https://twitter.com/realDonaldTrump?ref_src=twsrc%5Etfw">@realDonaldTrump</a> has filed two lawsuits - federal and state - against <a href="https://twitter.com/GaSecofState?ref_src=twsrc%5Etfw">@GaSecofState</a>. The telephone conference call <a href="https://twitter.com/GaSecofState?ref_src=twsrc%5Etfw">@GaSecofState</a> secretly recorded was a “confidential settlement discussion” of that litigation, which is still pending.</p>&mdash; David Shafer (@DavidShafer) <a href="https://twitter.com/DavidShafer/status/1345868002026205184?ref_src=twsrc%5Etfw">January 3, 2021</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
  //       </div>
  //     </li>
  //   </ul>
  // </div>

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
  perPill.textContent = "Perspective";

  //add content
  var content = annot["perspectives"];
  for (var i = 0; i < content.length; i++) {
    let perspective = document.createElement('li');
    perspective.setAttribute('class', 'perspective');

    let perHeader = document.createElement('p');
    perHeader.setAttribute('class', 'per-header');
    perHeader.appendChild(perPill);
    perHeader.innerHTML += content[i]["perspective"];
    perspective.appendChild(perHeader);

    if(content[i]["content-type"] == "link") {
      let perText = document.createElement('p');
      perText.setAttribute('class', 'per-text');
      perText.textContent = content[i]["text"]
      perspective.appendChild(perText);

      var link = document.createElement('a');
      link.setAttribute('class', 'per-link');
      link.setAttribute("href", content[i]['url']);
      link.setAttribute("target", "_blank");
      link.textContent = content[i]['source'];
      perspective.appendChild(link);

    } else if(content[i]["content-type"] == "quote") {
      var quote = document.createElement('p');
      quote.setAttribute('class', 'popup-quote');
      popup.appendChild(quote);
      if(!NO_ATTR_ACTIVE) {
        var string = "Quote from ";
        var attr = document.createElement('a');
        attr.setAttribute('class', 'popup-link');
        attr.setAttribute("target", "_blank");
        attr.textContent = content[i]['source'];
        quote.innerHTML = string;
        quote.innerHTML += attr;
        quote.innerHTML += ": ";
      }
      quote.innerHTML += content[i]['text'];
      perspective.appendChild(quote);

    } else if(content[i]["content-type"] == "webcontent") {
      var description = document.createElement('p');
      description.setAttribute('class', 'per-text');
      description.textContent = content[i]['text'];
      perspective.appendChild(description);

      var webframe = document.createElement('iframe');
      webframe.setAttribute('class', 'per-webcontent');
      webframe.setAttribute('src', content[i]['url']);
      perspective.appendChild(webframe);

    } else if(content[i]["content-type"] == "file") {
      var description = document.createElement('p');
      description.setAttribute('class', 'per-text');
      description.textContent = content[i]['text'];
      perspective.appendChild(description);

      //add file.
    } else if(content[i]["content-type"] == "file-quote") {
      // var description = document.createElement('p');
      // description.setAttribute('class', 'per-text');
      // description.textContent = content[i]['text'];
      // perspective.appendChild(description);
      //
      // //add file.
    } else if(content[i]["content-type"] == "quote-list") {
      // only difference is that ["text"] is a list.
      // var description = document.createElement('p');
      // description.setAttribute('class', 'per-text');
      // description.textContent = content[i]['text'];
      // perspective.appendChild(description);
      //
      // //add file.

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
          console.log("message recieved");
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
      }
  }
  true;
});

window.addEventListener("resize", function() {
  resize();
});
