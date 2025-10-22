type SseHandlers = {
  onOpen?: () => void;
  onMessage?: (data: any) => void;
  onError?: (err: any) => void;
  onClose?: () => void;
};

export function connectOrderStatus(orderId: string, handlers: SseHandlers = {}) {
  const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '';
  const url = API_BASE ? `${API_BASE.replace(/\/$/, '')}/api/orders/${orderId}/stream` : `/api/orders/${orderId}/stream`;

  const es = new EventSource(url);

  es.onopen = () => handlers.onOpen && handlers.onOpen();
  es.onerror = (err) => handlers.onError && handlers.onError(err);
  es.onmessage = (ev) => {
    try {
      const parsed = JSON.parse(ev.data);
      handlers.onMessage && handlers.onMessage(parsed);
    } catch (e) {
      handlers.onMessage && handlers.onMessage(ev.data);
    }
  };

  // custom 'close' event from server
  es.addEventListener('close', () => {
    handlers.onClose && handlers.onClose();
    es.close();
  });

  return {
    close: () => {
      es.close();
      handlers.onClose && handlers.onClose();
    },
    raw: es,
  };
}
