import '../sass/style.scss';

/**
 * Description
 * @param {type} nameof variable
 */
class yourClass {
    constructor() {}

    initialize() {
        this.registerServiceWorker();
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function () {
                navigator.serviceWorker.register('service-worker.js')
            });
        }
    }
}

const yourPage = new yourClass();

yourPage.initialize();