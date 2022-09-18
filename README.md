# Annotated News Extension
This Google Chrome Extension was developed in order to facilitate a controlled social sciences experiment. While the tool was designed with a specific use case in mind, the result is a broad and expansible platform for annotating online content. With modifications, this software can be used in other experiments or a product.

# Testing and Deployment
To test the extension, upload the entire directory to Chrome as an "unpacked extension"
Load a webpage.
Click the extension icon.

## Design Discussion
The extension has multiple layers of

## Server Backend
In order to use the full functionality of the tool, you will need to deploy a web server that can service the extension by providing data and keeping records of a user's interaction with the tool. This is done through HTTP GET and POST requests to url endpoints on your server. All communication with the server is conducted through background.js.

## Development Notes
Uses:  popper.js to position "pop-up" context windows.
https://popper.js.org/docs/v2/

Uses: findAndReplaceDOMText.js
https://github.com/padolsey/findAndReplaceDOMText
