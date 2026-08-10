/**
 * Modal Component — Reusable modal dialog
 */

let activeModal = null;

export function showModal({ title, content, onSubmit, submitLabel = 'Save', showCancel = true }) {
  closeModal();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'active-modal-overlay';

  overlay.innerHTML = `
    <div class="modal" id="active-modal">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close" id="modal-close-btn">✕</button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
      <div class="modal-footer">
        ${showCancel ? '<button class="btn btn-outline" id="modal-cancel-btn">Cancel</button>' : ''}
        ${onSubmit ? `<button class="btn btn-accent" id="modal-submit-btn">${submitLabel}</button>` : ''}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  activeModal = overlay;

  // Close handlers
  overlay.querySelector('#modal-close-btn').addEventListener('click', closeModal);
  const cancelBtn = overlay.querySelector('#modal-cancel-btn');
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Submit handler
  if (onSubmit) {
    overlay.querySelector('#modal-submit-btn').addEventListener('click', () => {
      onSubmit();
    });
  }

  // Escape key
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  // Focus first input
  setTimeout(() => {
    const firstInput = overlay.querySelector('input, select, textarea');
    if (firstInput) firstInput.focus();
  }, 100);
}

export function closeModal() {
  if (activeModal) {
    activeModal.remove();
    activeModal = null;
  }
}

/**
 * Confirmation dialog
 */
export function showConfirm({ title, message, onConfirm, confirmLabel = 'Confirm', danger = false }) {
  showModal({
    title,
    content: `<p style="color: var(--text-secondary); line-height: 1.6;">${message}</p>`,
    onSubmit: () => {
      closeModal();
      onConfirm();
    },
    submitLabel: confirmLabel
  });

  // Style the confirm button if danger
  if (danger) {
    setTimeout(() => {
      const btn = document.getElementById('modal-submit-btn');
      if (btn) {
        btn.className = 'btn btn-danger';
      }
    }, 10);
  }
}

/**
 * Toast notification system
 */
let toastContainer = null;

export function showToast(message, type = 'success', duration = 3000) {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    toast.style.transition = 'all 300ms ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
