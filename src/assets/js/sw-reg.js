if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(
      registration => {
        console.log(`ServiceWorker activated!`, registration);
      },
      err => {
        console.log(`ServiceWorker registration failed: ${err}`);
      }
    );
  });
}