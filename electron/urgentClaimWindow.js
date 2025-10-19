/**
 * Urgent Claim Window
 * Always-on-top modal window for urgent claim notifications
 */

import { BrowserWindow, screen } from 'electron';

class UrgentClaimWindow {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.urgentWindow = null;
  }

  show(data) {
    const { claimCode, claimName, expiresAt } = data;

    // Close existing urgent window if open
    if (this.urgentWindow && !this.urgentWindow.isDestroyed()) {
      this.urgentWindow.close();
    }

    // Center on screen
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
    const width = 500;
    const height = 300;

    this.urgentWindow = new BrowserWindow({
      width,
      height,
      x: Math.floor((screenWidth - width) / 2),
      y: Math.floor((screenHeight - height) / 2),
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      resizable: false,
      minimizable: false,
      maximizable: false,
      skipTaskbar: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Generate HTML
    const html = this.generateHtml(claimCode, claimName, expiresAt);
    this.urgentWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

    // Show window
    this.urgentWindow.show();
    this.urgentWindow.focus();
    this.urgentWindow.setAlwaysOnTop(true, 'screen-saver');

    // Handle close button click via IPC would be set up in the HTML
    // For now, auto-close after 5 minutes
    setTimeout(() => {
      if (this.urgentWindow && !this.urgentWindow.isDestroyed()) {
        this.urgentWindow.close();
      }
    }, 5 * 60 * 1000);
  }

  close() {
    if (this.urgentWindow && !this.urgentWindow.isDestroyed()) {
      this.urgentWindow.close();
    }
  }

  generateHtml(claimCode, claimName, expiresAt) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            overflow: hidden;
          }
          .backdrop {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(8px);
            border-radius: 16px;
          }
          .modal {
            position: relative;
            background: linear-gradient(135deg, rgba(17, 24, 39, 0.98), rgba(31, 41, 55, 0.98));
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 32px;
            width: 460px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
            text-align: center;
          }
          .icon {
            font-size: 64px;
            margin-bottom: 16px;
            animation: pulse 2s ease-in-out infinite;
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          .title {
            color: white;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 12px;
          }
          .claim-info {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 12px;
            padding: 16px;
            margin: 20px 0;
          }
          .claim-code {
            color: #ef4444;
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 4px;
          }
          .claim-name {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
          }
          .timer {
            color: #fbbf24;
            font-size: 32px;
            font-weight: 700;
            margin: 20px 0;
            font-family: monospace;
          }
          .buttons {
            display: flex;
            gap: 12px;
            margin-top: 24px;
          }
          button {
            flex: 1;
            padding: 14px 24px;
            border: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          .primary {
            background: #ef4444;
            color: white;
          }
          .primary:hover {
            background: #dc2626;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
          }
          .secondary {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .secondary:hover {
            background: rgba(255, 255, 255, 0.15);
          }
        </style>
      </head>
      <body>
        <div class="backdrop"></div>
        <div class="modal">
          <div class="icon">🔥</div>
          <div class="title">É SUA VEZ DE CLAMAR!</div>
          <div class="claim-info">
            <div class="claim-code">${claimCode}</div>
            <div class="claim-name">${claimName}</div>
          </div>
          <div class="timer" id="timer">5:00</div>
          <div class="buttons">
            <button class="secondary" onclick="closeWindow()">Já vi, obrigado</button>
            <button class="primary" onclick="goToClaim()">Ir para o Respawn</button>
          </div>
        </div>

        <script>
          // Countdown timer
          const expiresAt = new Date('${expiresAt}');
          const timerEl = document.getElementById('timer');
          
          function updateTimer() {
            const now = new Date();
            const diff = expiresAt - now;
            
            if (diff <= 0) {
              timerEl.textContent = '0:00';
              setTimeout(closeWindow, 500);
              return;
            }
            
            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            timerEl.textContent = minutes + ':' + seconds.toString().padStart(2, '0');
          }
          
          updateTimer();
          setInterval(updateTimer, 1000);
          
          function closeWindow() {
            window.close();
          }
          
          function goToClaim() {
            // This would send IPC message to main process
            // For now, just close
            window.close();
          }
        </script>
      </body>
      </html>
    `;
  }
}

export default UrgentClaimWindow;
