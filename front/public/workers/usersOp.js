self.addEventListener('install', ()=>{
    console.log('Installed Service Worker.');
});

self.addEventListener('activate', ()=>{
    console.log('Active Service Worker.');
});

self.addEventListener('fetch', (e)=>{
    console.log('Service Worker Intercepting Peticion');
});

onmessage=function(e){
    this.postMessage(e.data);
}