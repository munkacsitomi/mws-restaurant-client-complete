# Mobile Web Specialist Certification Course
---
#### _Three Stage Course Material Project - Restaurant Reviews_

## How to start local server

- In this folder, start up a simple HTTP server to serve up the site files on your local computer. Python has some simple tools to do this, and you don't even need to know Python. For most people, it's already installed on your computer.

In a terminal, check the version of Python you have: `python -V`. If you have Python 2.x, spin up the server with `python -m SimpleHTTPServer 8000` (or some other port, if port 8000 is already in use.) For Python 3.x, you can use `python3 -m http.server 8000`. If you don't have Python installed, navigate to Python's [website](https://www.python.org/) to download and install the software.

- With your server running, visit the site: `http://localhost:8000`
- If Node.js already installed to your computer you are able to start the local server with `npm start` and run debugger from VSCode.

### Requirements for Stage 1

- [x] All content is responsive and displays on a range of display sizes.
- [x] Content should make use of available screen real estate and should display correctly at all screen sizes.
- [x] An image's associated title and text renders next to the image in all viewport sizes.
- [x] Images in the site are sized appropriate to the viewport and do not crowd or overlap other elements in the browser, regardless of viewport size.
- [x] On the main page, restaurants and images are displayed in all viewports. The detail page includes a map, hours and reviews in all viewports.
- [x] All content-related images include appropriate alternate text that clearly describes the content of the image.
- [x] Focus is appropriately managed allowing users to noticeably tab through each of the important elements of the page. Modal or interstitial windows appropriately lock focus.
- [x] Elements on the page use the appropriate semantic elements. For those elements in which a semantic element is not available, appropriate ARIA roles are defined.
- [x] When available in the browser, the site uses a service worker to cache responses to requests for site assets. Visited pages are rendered when there is no network access.

### Developer Notes

If you want to generate new images you need to setup some tools first.
1. Install Grunt globally `npm i -g grunt`
2. Install GraphicsMagick `brew install GraphicsMagick`
3. Now you're able to generate new images: `grunt responsive_images` or `npm run srcset`
