import '../sass/style.scss';

/**
 * This Class controls core functionalities/ interactions
 */
class CoreFunctions {
    coreInit() {
        this.registerServiceWorker();
        this.pushNotificationCheck();
    }
    
    /**
     * Registration of Service Worker and from event
     */
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('service-worker.js')
                .then(()=> {
                    return navigator.serviceWorker.ready;
                }).then((registration) => {
                    if(registration.sync) {
                        registration.sync.register('numberForm')
                        .catch((err) => {
                            return err;
                        });
                    }
                });
            });
        } else {
            alert('Sorry, your browser doesn\'t support Service Workers.');
        }
    }

    /**
     * Check is browser supports Push Notifications
     */
    pushNotificationCheck() {
        if (!('PushManager' in window)) { 
            alert('Sorry, your browser doesn\'t support Push Notifications.');
        } 
    }
}

/**
 * All functionalities for Background Synced form
 */
class SyncedForm extends CoreFunctions {
    constructor() {
        super();
        this.formButton = document.querySelector('#js--form');
        this.formInput = document.querySelector('#js--number');
    }

    bacgroundSyncInit() {
        this.initializeIndexedDb();
        this.coreInit();
        this.formButton.addEventListener('click', (event) => {
            this.formHandler(event)
        });
    }

    /**
     * Initialize IndexedDB
     */
    initializeIndexedDb() {
        const formData = window.indexedDB.open('pwaAppDb');
        
        formData.onupgradeneeded = event => {
            const dataBase = event.target.result;
            const formStore = dataBase.createObjectStore('formStore', { autoIncrement: true });
            
            formStore.createIndex('number', 'number', { unique: false });
            formStore.createIndex('date', 'date', { unique: true });
        }
    }

    /**
     * Handle click event, if SW supported send data there 
     * @param {any} event default event
     */
    formHandler(event) {
        event.preventDefault();
        if (this.formInput.value) {
            this.formInput.style.borderColor = '#3a78ff';
            if (navigator.serviceWorker) {
                this.sendDataToSW();
            } else {
                this.sendDataToServer();
            }                
        } else {
            this.formInput.style.borderColor = 'red';
        };
    }

    /**
     * Data goes to Service Worker
     */
    sendDataToSW() {
        return new Promise((resolve, reject) => {
            const formData = window.indexedDB.open('pwaAppDb');

            formData.onsuccess = () => {
                const objStore = formData.result.transaction('formStore', 'readwrite')
                .objectStore('formStore');
                objStore.add({
                    number: this.formInput.value,
                    date: new Date()
                });
                resolve();
            }

            formData.onerror = err => {
                reject(err);
            }
        });
    }

    sendDataToServer() {
        console.log('go to Server');
    }
}

/**
 * All functionalities for Push Notifications form
 */

class PushNotifications extends SyncedForm {
    constructor() {
        super();
        this.triggerButton = document.querySelector('#js--trigger-button');
        this.luckyNumber = document.querySelector('.lucky-number');
        this.oldNumbers = document.querySelector('.old-numbers');
        this.notificationArray = [];
    }

    init() {
        this.bacgroundSyncInit();
        this.checkPushNotState();
        this.message();
    }

    /**
     * Message event used as a trigger for rendering notifications in real time
     */
    message() {
        navigator.serviceWorker.addEventListener('message', () => {
            navigator.serviceWorker.ready.then(registration => {
                registration.getNotifications().then(notifications => {
                    this.renderNotifications(notifications.slice(-6));                    
                });
            });
        });
    }

    /**
     * Render notifications
     * @param {array} array of push notifications from SW
     */
    renderNotifications(array) {
        this.notificationArray = array.reverse();
        this.oldNumbers.innerHTML = '';
        this.luckyNumber.innerHTML = this.notificationArray[0].title;
        this.oldNumbers.innerHTML = this.notificationArray.splice(-5).map( a => {
            return a.title;
        }).join(', ');
    }
    
    /**
     * Check permission state of Push Notifications
     */
    checkPushNotState() {
        if (Notification.permission === 'granted') {
            this.toogleButton();
        } else if (Notification.permission === 'denied') {
            alert(`Push Notifiactions are disabled in your browser. You won't be able to use the app.
                You can enable them via your browser settings.`);
        } else if (Notification.permission === 'default') {
            alert(`In a moment you'll be asked to enable Push Notifiactions. If you block them the app won't work. 
                Then the only way to enable them again will be via your browser settings.`);
            this.enablePushNot();
        }
    }

    /**
     * Prompt for Push Notification activation
     */
    enablePushNot() {
        return new Promise((resolve, reject) => {
            const permissionResult = Notification.requestPermission((result) => {
                resolve(result);
            });
        
            if (permissionResult) {
                permissionResult.then(resolve, reject);
            }
        })
        .then(permissionResult => {
            permissionResult === 'granted' ? this.toogleButton() : 
            alert('You wont\t be able to use the app without the permission.');
        });
    }

    /**
     * Toogle Push Notifiaction button
     */
    toogleButton() {
        this.triggerButton.classList.toggle('button--disabled');
    }

}

const pwdApp = new PushNotifications();

pwdApp.init();