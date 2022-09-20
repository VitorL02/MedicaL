const cache = 'cache-static-1';
const dinamicCache = 'cache-dynamic-v1'
//Informa as requests que serão guardadas
const assets = [
    '/',
    '/index.html',
    '/js/app.js',
    '/js/index.js',
    '/js/materialize.js',
    '/js/materialize.min.js',
    '/assets/icon.png',
    '/css/styles.css',
    '/css/materialize.min.css',
    '/css/materialize.css',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.gstatic.com/s/materialicons/v47/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
    '/html/error.html'
];


//limitar o cache

const limitCacheSize = (name,size) =>{
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if(keys.length > size){
                cache.delete(keys[0]).then(limitCacheSize(name,size))
            }
        })
    });
};

//instalação do serviceWorker
self.addEventListener('install',(event)=>{
    //Salva o cache de todas as requests 
    event.waitUntil(caches.open(cache).then(cache=>{
        cache.addAll(assets);
       })
    );
});

self.addEventListener('activate',(event)=>{
    event.waitUntil(
        //Realiza o versionamento do cache e retorna o mais recente cache da aplicação toda vez que ele e encontrado
        caches.keys().then(keys=>{
           return Promise.all(keys.filter(key => key !== cache && key !== dinamicCache).map(key=>caches.delete()));
        })
    );
});

//fetch events
self.addEventListener('fetch',(event)=>{
    event.respondWith(
        caches.match(event.request).then(cacheResponse =>{
            return cacheResponse || fetch(event.request).then(fetchResponse =>{
                return caches.open(dinamicCache).then(cache => {
                    cache.put(event.request.url, fetchResponse.clone());
                    limitCacheSize(dinamicCache,15)
                    return fetchResponse
                })
            });
        }).catch(() => {
            if(event.request.url.indexOf('.html') > -1){
                caches.match('/html/error_page.html');  
            }
        }) //Envia pra pagina de erro caso o cache não possua aquela pagina
    );
})