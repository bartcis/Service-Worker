/**
 * Instal Service Worker and create cache store
 */
self.oninstall = event => {
    event.waitUntil(
        caches.open('v1').then(cache => {
            return cache.addAll([
                '/index.html'
            ]);
        }, error => {
            console.log(`Installation failed with error: ${error}`);
        })
    );
};

/**
 * Get resources from SW cache
 */
self.onactivate = event => {
    let cacheKeepList = ['v1'];

    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(function (key) {
                if (cacheKeepList.indexOf(key) === -1) {
                    return caches.delete(key);
                }
            }));
        })
    );
};

/**
 * Get resources from SW cache
 */
self.onfetch = event => {
    if (event.request.method != 'GET') return;

    event.respondWith(async function () {
        const cache = await caches.open('v1');
        const cachedResponse = await cache.match(event.request);

        if (cachedResponse) {
            event.waitUntil(cache.add(event.request));
            return cachedResponse;
        }

        return fetch(event.request);
    }());
};

/**
 * Handle Background Sync
 */
self.onpush = event => {
    const title = event.data.text();
    const message = {
        body: 'Is your new lucky number.',
    };
    const promiseChain = self.registration.showNotification(title, message);
    triggerMessage('fetch');

    event.waitUntil(promiseChain);
}

/**
 * This functions send a trigger to main core to fetch notifications from SW
 */
function messageToClient(client, msg){
    return new Promise((resolve, reject) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = event => {
            event.data.error ? reject(event.data.error) : resolve(event.data);
        };
        client.postMessage(msg, [channel.port2]);
    });
}
function triggerMessage(msg){
    clients.matchAll().then(clients => {
        clients.forEach(client => {
            messageToClient(client, msg);
        })
    })
}

/**
 * Handle Background Synced Form
 */
self.onsync = event => {
    if(event.tag === 'numberForm') {
        event.waitUntil(synchronize());
    }
}

/**
 * Get data from IndexedDB
 */
function getDataFromDb () {
    return new Promise((resolve, reject) => {
        const db = indexedDB.open('pwaAppDb');
        
        db.onsuccess = () => {
            db.result.transaction('formStore').objectStore('formStore').getAll()
            .onsuccess = event => {
                resolve(event.target.result);
            }
        }
        db.onerror = err => {
            console.log('SW: Nie pobrano z indexed DB');
            reject(err);
        }
    });
}

/**
 * Send data to server
 */
function sendToServer(response) {
    // console.log('SW mess: ', response);
    return fetch('your server address', {
        method: 'POST',
        body: JSON.stringify(response),
        headers:{
            'Content-Type': 'application/json'
        }
    })
    .catch(err => {
        console.log('SW: Nie wyslano na serwer');
        return err;
    });
}

/**
 * Promise that gets data from indexedDB and sends to server
 */
function synchronize() {
    return getDataFromDb()
    .then(sendToServer)
    .catch(function(err) {
        return err;
    });
}