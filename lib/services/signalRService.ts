import { WaterAlert } from '../types/alert';

/**
 * WebSocket Service để kết nối realtime với backend
 * Nhận water alerts và các events khác
 */

// Get backend URL từ environment hoặc fallback
const getBackendUrl = (): string => {
  // Đổi HTTPS sang WSS cho WebSocket
  return 'wss://zenkoi-backend-n5r8.onrender.com/api/ws/alerts';
};

type AlertHandler = (alert: WaterAlert) => void;
type ConnectionStateHandler = (
  state: 'Connected' | 'Disconnected' | 'Reconnecting'
) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private alertHandlers: AlertHandler[] = [];
  private stateHandlers: ConnectionStateHandler[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000; // Start with 2 seconds
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private accessToken: string | null = null;
  private shouldReconnect = true;

  /**
   * Khởi tạo và start connection
   */
  async start(accessToken?: string): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('[WEBSOCKET] Already connected');
      return;
    }

    if (this.ws?.readyState === WebSocket.CONNECTING) {
      console.log('[WEBSOCKET] Connection in progress');
      return;
    }

    this.accessToken = accessToken || null;
    this.shouldReconnect = true;
    const wsUrl = getBackendUrl();

    // Thêm token vào URL nếu có
    const urlWithToken = this.accessToken
      ? `${wsUrl}?access_token=${encodeURIComponent(this.accessToken)}`
      : wsUrl;

    console.log('[WEBSOCKET] Connecting to:', wsUrl);

    try {
      this.ws = new WebSocket(urlWithToken);
      this.setupEventHandlers();
    } catch (error) {
      console.error('[WEBSOCKET] Connection failed:', error);
      this.handleConnectionError();
      throw error;
    }
  }

  /**
   * Setup các event handlers từ WebSocket
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('[WEBSOCKET] Connected successfully');
      this.reconnectAttempts = 0;
      this.notifyStateChange('Connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[WEBSOCKET] Received message:', data);

        // Kiểm tra message type và xử lý
        if (data.Type === 'ReceiveAlert' || data.type === 'ReceiveAlert') {
          const alert = data.Data || data.data || data;
          this.alertHandlers.forEach((handler) => handler(alert));
        } else if (
          data.Type === 'AlertResolved' ||
          data.type === 'AlertResolved'
        ) {
          console.log('[WEBSOCKET] Alert resolved:', data.Data || data.data);
        } else {
          // Nếu không có type, coi như là alert trực tiếp
          this.alertHandlers.forEach((handler) => handler(data));
        }
      } catch (error) {
        console.error('[WEBSOCKET] Error parsing message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('[WEBSOCKET] WebSocket error:', error);
    };

    this.ws.onclose = (event) => {
      console.log('[WEBSOCKET] Connection closed:', event.code, event.reason);
      this.notifyStateChange('Disconnected');

      if (this.shouldReconnect) {
        this.handleConnectionError();
      }
    };
  }

  /**
   * Xử lý lỗi kết nối và retry
   */
  private handleConnectionError(): void {
    this.reconnectAttempts++;

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WEBSOCKET] Max reconnect attempts reached');
      this.notifyStateChange('Disconnected');
      return;
    }

    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    console.log(
      `[WEBSOCKET] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );
    this.notifyStateChange('Reconnecting');

    this.reconnectTimeout = setTimeout(() => {
      if (this.shouldReconnect && this.accessToken) {
        this.start(this.accessToken).catch(console.error);
      }
    }, delay);
  }

  /**
   * Đăng ký handler để nhận alerts
   */
  onAlert(handler: AlertHandler): () => void {
    this.alertHandlers.push(handler);

    // Return cleanup function
    return () => {
      this.alertHandlers = this.alertHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Đăng ký handler để theo dõi connection state
   */
  onStateChange(handler: ConnectionStateHandler): () => void {
    this.stateHandlers.push(handler);

    // Return cleanup function
    return () => {
      this.stateHandlers = this.stateHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Notify tất cả state handlers
   */
  private notifyStateChange(
    state: 'Connected' | 'Disconnected' | 'Reconnecting'
  ): void {
    this.stateHandlers.forEach((handler) => handler(state));
  }

  /**
   * Stop connection
   */
  async stop(): Promise<void> {
    this.shouldReconnect = false;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (!this.ws) return;

    try {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
      }
      console.log('[WEBSOCKET] Disconnected');
      this.notifyStateChange('Disconnected');
    } catch (error) {
      console.error('[WEBSOCKET] Error stopping connection:', error);
    } finally {
      this.ws = null;
      this.alertHandlers = [];
      this.stateHandlers = [];
      this.reconnectAttempts = 0;
      this.accessToken = null;
    }
  }

  /**
   * Get current connection state
   */
  getState(): 'Connected' | 'Disconnected' | 'Connecting' {
    if (!this.ws) return 'Disconnected';

    switch (this.ws.readyState) {
      case WebSocket.OPEN:
        return 'Connected';
      case WebSocket.CONNECTING:
        return 'Connecting';
      default:
        return 'Disconnected';
    }
  }

  /**
   * Send message to server
   */
  send(data: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[WEBSOCKET] Not connected');
      return;
    }

    try {
      this.ws.send(JSON.stringify(data));
    } catch (error) {
      console.error('[WEBSOCKET] Error sending message:', error);
    }
  }
}

// Export singleton instance
export const signalRService = new WebSocketService();
