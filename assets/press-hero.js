(() => {
  'use strict';
  const hero = document.querySelector('[data-press-hero]');
  if (!hero) return;
  const bed = hero.querySelector('.press-bed');
  const inks = [...hero.querySelectorAll('[data-ink]')];
  const rollers = [...hero.querySelectorAll('[data-roller]')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const shortScreen = matchMedia('(max-height: 619px)');
  const clamp = value => Math.max(0, Math.min(1, value));
  let pending = false;
  let active = false;
  let start = 0, distance = 1, paperHeight = 1, rollerHalfHeight = 0;
  let lastProgress = -1;

  function paint() {
    pending = false;
    const p = active ? clamp((scrollY - start) / distance) : 1;
    if (p === lastProgress) return;
    lastProgress = p;
    // Four contact lines run across the same paper coordinate system. A plate
    // is exposed exactly to its own roller, never ahead of the contact edge.
    const travel = (p / .83) * 1.54 - .07;
    const lift = active ? clamp((p - .84) / .16) : 1;
    hero.style.setProperty('--press-progress', p.toFixed(4));
    hero.style.setProperty('--press-lift', lift.toFixed(4));
    inks.forEach((ink, index) => {
      const contact = travel - index * .15;
      const printed = active ? clamp(contact) : 1;
      ink.style.clipPath = `inset(0px 0px ${(100 * (1 - printed)).toFixed(3)}%)`;
      rollers[index].style.transform = `translateY(${(contact * paperHeight - rollerHalfHeight).toFixed(2)}px)`;
      rollers[index].style.opacity = String(1 - clamp((p - .85) / .06));
    });
  }

  function measure() {
    active = !motion.matches && !shortScreen.matches;
    hero.classList.toggle('is-running', active);
    const bounds = hero.getBoundingClientRect();
    start = bounds.top + scrollY;
    distance = Math.max(1, hero.offsetHeight - innerHeight);
    paperHeight = bed.clientHeight;
    rollerHalfHeight = rollers[0].offsetHeight / 2;
    lastProgress = -1;
    paint();
  }

  function schedule() {
    if (pending || !active) return;
    pending = true;
    requestAnimationFrame(paint);
  }
  // No perpetual animation loop, no scroll interception or video decoder.
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', measure, {passive:true});
  addEventListener('pageshow', measure);
  motion.addEventListener('change', measure);
  shortScreen.addEventListener('change', measure);
  document.fonts?.ready.then(measure);
  measure();
})();
