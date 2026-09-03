(() => {
  'use strict';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const button = document.querySelector('[data-toggle-motion]');
  let paused = false;
  button.addEventListener('click', () => {
    paused = !paused;
    document.body.toggleAttribute('data-motion-paused', paused);
    button.textContent = paused ? 'Resume animation' : 'Pause animation';
  });

  // Animate entry without hiding content or depending on data loading.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (!reducedMotion.matches && !paused) entry.target.classList.add('home-enter');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.08 });
    document.querySelectorAll('main > .section .section-header, main > .section .card, .fieldbook-intro').forEach(node => observer.observe(node));
  }

  let scheduled = false;
  function progress() {
    const available = document.documentElement.scrollHeight - innerHeight;
    document.documentElement.style.setProperty('--reading-progress', available > 0 ? Math.min(1, scrollY / available) : 0);
    scheduled = false;
  }
  function schedule() { if (!scheduled) { scheduled = true; requestAnimationFrame(progress); } }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  progress();
})();
