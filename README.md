# Annotated News Extension

To use... download directory and upload to chrome as "unpacked extension"
Load a webpage.
click the extension icon.
click "start"

## Development Notes
Currntly annotatedNewsPanel.html is not actually part of the "extension." It is a useful device for designing and building pop-ups. As discussed in the Annotation Design Guide, there are various forms of annotations. Each one should eventually be a different js function.

Uses:  popper.js to position "pop-up" context windows.
https://popper.js.org/docs/v2/

/inline   
annotatedNewsPanel.html   
annotatedNewsPanel.js   
annotatedNewsPanel.css   

^ creates the development-poppers to design each annotatation type.

Note: poppers emerge from <span> elements b/c they are directly linked to text snippets in an article/social media source.


## Design Discussion

### Bottom "Toolbar"
Features:
1. Talks about the current article.
2. Displays useful information? what exactly?
3. Shows what is currently being moused-over.
4. Shows the type of annotation that exists in a <span> element
5. Allows jumping from annotation to annotation.

Can be EXPANDED to show?
More involved information... possibly uses iFrames to bring in 3rd party sources.
?Organized in a manner similar to ProCon.org?


### Context Windows
Have: title, content

### Context Lists
Have: Title, list of content
