// public/sw.js
// Service Worker mínimo — necessário para PWA install prompt
// Sem cache agressivo — apenas garante registro

self.addEventListener("install", (event) => {
  // Pula etapa de waiting — ativa imediatamente
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Garante controle imediato de todos os clients
  event.waitUntil(self.clients.claim());
});

// Não intercepta requests — apenas serve como SW registrado
// Futuramente: adicionar estratégia de cache aqui conforme necessidade
self.addEventListener("fetch", (event) => {
  // Sem intervenção — browser faz request normalmente
  // Quando adicionar cache, usar: event.respondWith(...)
});
