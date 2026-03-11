(() => {
  const slides = document.querySelectorAll('.slide');
  const progressFill = document.querySelector('.progress-fill');
  const progressDots = document.querySelectorAll('.progress-dot');
  const slideCounter = document.querySelector('.slide-counter');
  const total = slides.length;
  let current = 0;
  let isAnimating = false;

  function goTo(index, direction) {
    if (isAnimating || index === current || index < 0 || index >= total) return;
    isAnimating = true;

    const dir = direction || (index > current ? 1 : -1);
    const outgoing = slides[current];
    const incoming = slides[index];

    // Remove all state classes
    outgoing.classList.remove('active', 'enter-from-right', 'enter-from-left');
    outgoing.classList.add(dir > 0 ? 'exit-to-left' : 'exit-to-right');

    incoming.classList.remove('exit-to-left', 'exit-to-right', 'enter-from-left', 'enter-from-right');
    incoming.classList.add(dir > 0 ? 'enter-from-right' : 'enter-from-left');
    incoming.classList.add('active');

    // Force reflow then animate in
    incoming.offsetHeight;
    requestAnimationFrame(() => {
      incoming.classList.remove('enter-from-right', 'enter-from-left');
    });

    // Update progress
    current = index;
    updateProgress();
    updateHash();

    // Reset stagger animations
    incoming.querySelectorAll('.stagger').forEach((el, i) => {
      el.style.animation = 'none';
      el.offsetHeight;
      el.style.animation = '';
      el.style.animationDelay = `${150 + i * 100}ms`;
    });

    setTimeout(() => {
      outgoing.classList.remove('active', 'exit-to-left', 'exit-to-right');
      isAnimating = false;
    }, 600);
  }

  function next() { goTo(current + 1, 1); }
  function prev() { goTo(current - 1, -1); }

  function updateProgress() {
    const pct = ((current + 1) / total) * 100;
    progressFill.style.width = pct + '%';
    progressDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });
    slideCounter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  }

  function updateHash() {
    history.replaceState(null, null, `#slide-${current + 1}`);
  }

  function readHash() {
    const match = location.hash.match(/^#slide-(\d+)$/);
    if (match) {
      const idx = parseInt(match[1], 10) - 1;
      if (idx >= 0 && idx < total) return idx;
    }
    return 0;
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); prev(); }
    if (e.key === 'Home') { e.preventDefault(); goTo(0); }
    if (e.key === 'End') { e.preventDefault(); goTo(total - 1); }
  });

  // Click navigation (edge gutters)
  document.addEventListener('click', (e) => {
    if (e.target.closest('.progress-bar') || e.target.closest('a') || e.target.closest('button')) return;
    const x = e.clientX / window.innerWidth;
    if (x < 0.15) prev();
    else if (x > 0.85) next();
  });

  // Progress dot clicks
  progressDots.forEach((dot, i) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      goTo(i);
    });
  });

  // Touch/swipe
  let touchStartX = 0;
  let touchStartY = 0;
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      dx < 0 ? next() : prev();
    }
  }, { passive: true });

  // Init
  const startSlide = readHash();
  slides[startSlide].classList.add('active');
  current = startSlide;
  updateProgress();

  // Hash change
  window.addEventListener('hashchange', () => {
    const idx = readHash();
    if (idx !== current) goTo(idx);
  });
})();
