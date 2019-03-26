# Sevice Worker Case Study
Sample usage of Service Worker in JavaScript App.

The features inculed in this configuration:

- Registration of Service Worker. Optionally check for already registered workers
- Communication between main thread of JavaScript and ServiceWorker
- Service Worker caching 
- Push Notification 
- IndexedDB setup
- Background Sync

All code is build using ES6+ standards and compiled using Webpack4 

To run the app:
1. Rename Babel config file from babelrc.js to .babelrc to enable Babel preset
2. Run npm install to add Webpack dependencies
3. Run Webpack using npm dev --watch

For more information about Service Workers check the series on my blog (sorry, Polish speakers only :( ):
https://bedekodzic.pl/tag/pwa/