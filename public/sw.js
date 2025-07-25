const CACHE_NAME = "bbfitness-v1";
const urlsToCache = ["/", "/planner", "/premium", "/store", "/fitz", "/manifest.json"];

// Cache básico (instalação)
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Intercepta requisições
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Push notification handler
self.addEventListener("push", function (event) {
  const data = event.data?.json() || {};
  const title = data.title || "Notificação";
  const options = {
    body: data.body || "Você recebeu uma nova notificação.",
    icon: "/icon.png", // opcional: ícone que aparece na notificação
    badge: "/badge.png", // opcional: ícone pequeno de status
    data: data.url || "/", // opcional: URL para abrir ao clicar
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Quando o usuário clica na notificação
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const urlToOpen = event.notification.data || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(urlToOpen);
    })
  );
});
