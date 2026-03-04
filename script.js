document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  function closeMenu() {
    navLinks.classList.remove('open');
    hamburger?.classList.remove('active');
    navLinks.querySelectorAll('.dropdown-open').forEach(li => li.classList.remove('dropdown-open'));
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) {
        closeMenu();
      } else {
        navLinks.classList.add('open');
        hamburger.classList.add('active');
      }
    });
  }

  navLinks?.querySelectorAll(':scope > li').forEach(li => {
    const dropdown = li.querySelector('.dropdown');
    if (!dropdown) return;

    li.querySelector(':scope > a').addEventListener('click', (e) => {
      if (window.innerWidth > 768) return;
      e.preventDefault();
      const isOpen = li.classList.contains('dropdown-open');
      navLinks.querySelectorAll('.dropdown-open').forEach(el => el.classList.remove('dropdown-open'));
      if (!isOpen) li.classList.add('dropdown-open');
    });
  });

  document.addEventListener('click', (e) => {
    if (navLinks && !e.target.closest('.navbar')) {
      closeMenu();
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
