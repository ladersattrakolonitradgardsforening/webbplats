document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      hamburger.classList.toggle('active');
    });
  }

  document.addEventListener('click', (e) => {
    if (navLinks && !e.target.closest('.navbar')) {
      navLinks.classList.remove('open');
      hamburger?.classList.remove('active');
    }
  });

  const form = document.getElementById('membership-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      const data = new FormData(form);
      const entries = Object.fromEntries(data.entries());

      if (!entries.namn || !entries.epost || !entries.telefon || !entries.adress || !entries.postnummer || !entries.ort) {
        e.preventDefault();
        showToast('Vänligen fyll i alla obligatoriska fält.', 'error');
        return;
      }

      if (!entries.gdpr) {
        e.preventDefault();
        showToast('Du måste godkänna hanteringen av personuppgifter.', 'error');
        return;
      }
    });
  }
});

function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  if (type === 'error') {
    toast.style.background = '#a94442';
  }
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}
