let panelState = 0;

$(document).ready(function() {

  //SECTION 1:
  //SHOW THE EXPANDED ANNOTATED NEWS SCREEN WHEN CLICKED
  $("#preview").click(function(){
    if(panelState == 0){
      $("#panel-holder").animate({
        bottom: "0"
      }, 100);
      $("#an-wrapper").animate({
        bottom: "50%",
        width: "60%",
        left: "20%"
      }, 100);
      panelState = 1;
    } else {
      $("#panel-holder").animate({
        bottom: "-55%"
      }, 100);
      $("#an-wrapper").animate({
        bottom: "0%",
        width: "100%",
        left: "0"
      }, 100);
      panelState = 0;
    }
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

  document.getElementById("panel-holder").appendChild(panel);
}


//https://www.msgtrail.com/articles/20200223-1106-passing-data-to-and-from-an-extension-sandbox/
window.addEventListener("message", function(event) {
    let request = event.data;
    console.log(request);
    switch( request.type ) {
        case "to_frame": //message to the frame
            switch( request.command ) {
                case "add_panel": //message coming from modify.js
                    console.log("message recieved");
                    let annot = JSON.parse(request.annotation)
                    addPanel(annot);
            }
    }
});
