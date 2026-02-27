self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Sistema Solo Leveling";
  const options = {
    body: data.body || "Você tem uma nova mensagem do Sistema.",
    icon: data.icon || "/icon-192x192.png",
    badge: "/badge.png",
    data: data.data || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || "/")
  );
});
