/* ==========================================================================
   NADA COMPTABLE — script.js
   Menu mobile, révélation au scroll, compteurs animés, grand livre,
   année du footer, envoi du formulaire de contact.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Menu mobile ---------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Ferme le menu quand on choisit un lien (utile en mobile)
    mainNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Année du footer ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ---------- Révélation au scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    // Pas de support IntersectionObserver : on affiche tout directement
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  /* ---------- Compteurs animés ---------- */
  function animateValue(el, endValue, { duration = 1400, suffix = '', formatter } = {}) {
    const format = formatter || ((n) => Math.round(n).toString());
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = format(endValue * eased) + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = format(endValue) + suffix;
      }
    }
    requestAnimationFrame(tick);
  }

  const frNumber = (n) => Math.round(n).toLocaleString('fr-FR');

  // Chiffres clés du hero (ans d'expérience, clients, % à temps)
  const factNums = document.querySelectorAll('.fact-num');
  if (factNums.length) {
    factNums.forEach((el) => {
      const target = parseFloat(el.dataset.count || '0');
      const suffix = el.dataset.suffix || '';
      animateValue(el, target, { suffix });
    });
  }

  // Grand livre : compteurs + calcul du solde + tampon "Équilibré"
  const ledgerCard = document.querySelector('.ledger-card');
  if (ledgerCard) {
    const ledgerVals = ledgerCard.querySelectorAll('.ledger-val');
    ledgerVals.forEach((el) => {
      const target = parseFloat(el.dataset.target || '0');
      animateValue(el, target, { formatter: frNumber });
    });

    const cols = ledgerCard.querySelectorAll('.ledger-col');
    if (cols.length === 2) {
      const sumCol = (col) =>
        Array.from(col.querySelectorAll('.ledger-val')).reduce(
          (sum, el) => sum + parseFloat(el.dataset.target || '0'),
          0
        );

      const debitTotal = sumCol(cols[0]);
      const creditTotal = sumCol(cols[1]);
      const solde = creditTotal - debitTotal;

      const ledgerTotalVal = ledgerCard.querySelector('.ledger-total-val');
      if (ledgerTotalVal) {
        const formatted = Math.abs(solde).toLocaleString('fr-FR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        ledgerTotalVal.textContent = `${formatted} DH`;
      }

      const ledgerStamp = document.getElementById('ledgerStamp');
      if (ledgerStamp && Math.abs(solde) < 0.01) {
        setTimeout(() => ledgerStamp.classList.add('show'), 900);
      }
    }
  }

  /* ---------- Formulaire de contact ---------- */
  const contactForm = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');

  if (contactForm && formNote) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!contactForm.checkValidity()) {
        formNote.textContent = 'Merci de vérifier les champs requis avant d\'envoyer.';
        formNote.style.color = 'var(--brass)';
        return;
      }

      const firstName = contactForm.name.value.trim().split(' ')[0] || '';

      // Pas de backend connecté ici : on confirme côté client.
      // Brancher cet endroit sur un vrai service d'envoi (API, mailto, etc.)
      // pour que la demande soit réellement transmise à Nada.
      formNote.style.color = 'var(--emerald)';
      formNote.textContent = `Merci ${firstName}, votre demande a bien été envoyée. Réponse sous 24h ouvrées.`;
      contactForm.reset();
    });
  }
});
