/**
 * Nutri Kitchen Custom Dialog Component
 * Provides a premium replacement for alert() and confirm()
 */

const Dialog = {
  queue: [],
  isOpen: false,

  init() {
    if (document.getElementById('custom-dialog-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'custom-dialog-overlay';
    overlay.className = 'dialog-overlay';
    overlay.style.display = 'none'; // Hidden by default
    overlay.innerHTML = `
      <div class="dialog-box">
        <div id="dialog-icon" class="dialog-icon"></div>
        <h3 id="dialog-title" class="dialog-title"></h3>
        <p id="dialog-message" class="dialog-message"></p>
        <div id="dialog-buttons" class="dialog-buttons"></div>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  show(options) {
    return new Promise((resolve) => {
      this.init();
      const { title, message, type = 'info', confirmText = 'OK', cancelText = null } = options;
      
      const overlay = document.getElementById('custom-dialog-overlay');
      const iconEl = document.getElementById('dialog-icon');
      const titleEl = document.getElementById('dialog-title');
      const messageEl = document.getElementById('dialog-message');
      const buttonsEl = document.getElementById('dialog-buttons');

      // Set content
      titleEl.textContent = title || (type.charAt(0).toUpperCase() + type.slice(1));
      messageEl.innerHTML = message;
      
      // Set type icon
      iconEl.className = `dialog-icon ${type}`;
      switch(type) {
        case 'success': iconEl.textContent = '✓'; break;
        case 'error': iconEl.textContent = '✕'; break;
        case 'warning': iconEl.textContent = '!'; break;
        default: iconEl.textContent = 'ℹ';
      }

      // Set buttons
      buttonsEl.innerHTML = '';
      
      if (cancelText) {
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'dialog-btn dialog-btn-secondary';
        cancelBtn.textContent = cancelText;
        cancelBtn.onclick = () => {
          this.close();
          resolve(false);
        };
        buttonsEl.appendChild(cancelBtn);
      }

      const confirmBtn = document.createElement('button');
      confirmBtn.className = 'dialog-btn dialog-btn-primary';
      confirmBtn.textContent = confirmText;
      confirmBtn.onclick = () => {
        this.close();
        resolve(true);
      };
      buttonsEl.appendChild(confirmBtn);

      // Show
      overlay.style.display = 'flex';
      setTimeout(() => overlay.classList.add('active'), 10);
      this.isOpen = true;

      // Close on overlay click (but not on dialog box click)
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          this.close();
          resolve(false);
        }
      };

      // Close on ESC key
      const escHandler = (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          document.removeEventListener('keydown', escHandler);
          this.close();
          resolve(false);
        }
      };
      document.addEventListener('keydown', escHandler);
    });
  },

  close() {
    const overlay = document.getElementById('custom-dialog-overlay');
    overlay.classList.remove('active');
    setTimeout(() => {
      overlay.style.display = 'none';
      this.isOpen = false;
    }, 300);
  },

  // Facades to replace alert/confirm
  alert(message, title = 'Notification', type = 'info') {
    return this.show({ title, message, type, confirmText: 'OK' });
  },

  confirm(message, title = 'Confirm Action', type = 'warning') {
    return this.show({ 
      title, 
      message, 
      type, 
      confirmText: 'Yes, Proceed', 
      cancelText: 'Cancel' 
    });
  }
};

// Auto-init on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Dialog.init());
} else {
  Dialog.init();
}

// Global variable
window.showAlert = (msg, type = 'info', title = 'Nutri Kitchen') => Dialog.alert(msg, title, type);
window.showConfirm = (msg, title = 'Are you sure?') => Dialog.confirm(msg, title);
