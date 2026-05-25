// Daily Routine Notifier - Push Service Worker

self.addEventListener('push', function (event) {
  if (event.data) {
    try {
      const payload = event.data.json();
      
      const title = payload.title || "⏰ Routine Alert";
      const options = {
        body: payload.message || "Time for your scheduled activity!",
        icon: "/icon.png", // Web-app branding icon
        badge: "/icon.png",
        requireInteraction: true, // Forces notification to stay until user interacts
        vibrate: [200, 100, 200],
        data: {
          url: payload.url || '/'
        }
      };

      event.waitUntil(
        self.registration.showNotification(title, options)
      );
    } catch (e) {
      console.warn("Failed to parse push data as JSON. Showing text fallback.", e);
      const textPayload = event.data.text();
      
      event.waitUntil(
        self.registration.showNotification("⏰ Routine Alert", {
          body: textPayload,
          icon: "/icon.png",
          requireInteraction: true
        })
      );
    }
  }
});

// Handle clicking on the notification
self.addEventListener('notificationclick', function (event) {
  event.notification.close(); // Close the notification

  // Open the application page on click
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      const targetUrl = event.notification.data ? event.notification.data.url : '/';
      
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
