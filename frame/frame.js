let panelState = 0;
var port = chrome.runtime.connect();

$(document).ready(function() {

  //SECTION 1:
  //SHOW THE EXPANDED ANNOTATED NEWS SCREEN WHEN CLICKED
  $("#preview").click(function(){
    if(panelState == 0){
      $("#panel").animate({
        bottom: "0"
      }, 100);
      $("#an-wrapper").animate({
        bottom: "50%",
        width: "60%",
        left: "20%"
      }, 100);
      panelState = 1;
    } else {
      $("#panel").animate({
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
  alert("adding");
  //annot: is a JSON object with all the annotations at a given index.

  //https://stackoverflow.com/questions/926916/how-to-get-the-bodys-content-of-an-iframe-in-javascript
  //https://stackoverflow.com/questions/14451358/how-to-pick-element-inside-iframe-using-document-getelementbyid
  //var frame = document.getElementById('annotatednews-root').contentWindow.document;

  //https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template
  //https://stackoverflow.com/questions/32815250/accessing-the-document-of-a-cross-domain-iframe-using-an-extension-in-chrome-45
  var template = document.getElementById("panel-template");
  var panel = template.content.cloneNode(true);

  panel.setAttribute('linkedid', annot['linked-id']);
  panel.setAttribute('category', annot['category']);
  panel.querySelector('.panel-title').textContent = annot['panel-title'];
  panel.querySelector('.panel-image').setAttribute('src', annot['image']);
  panel.querySelector('.panel-body').textContent = annot['text-bodies'];
  panel.querySelector('.panel-link').setAttribute('href', annot['links'][0]);

  document.getElementById("panel-holder").appendChild(panel);
}


//https://www.msgtrail.com/articles/20200223-1106-passing-data-to-and-from-an-extension-sandbox/
window.addEventListener("message", (request) => {
    switch( request.type ) {
        case "to_frame":
            switch( request.command ) {
                case "add_panel":
                    let annotation = JSON.parse(request.annotation)
                    addPanel(annotation);
            }
    }
    return true;
});
