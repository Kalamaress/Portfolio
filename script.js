const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const stops = [...document.querySelectorAll('main > section[id]')];
const destinations = document.querySelectorAll('.navigation a[href^="#"]');
let waveFrame = 0;
const slideProgress = new Map();
const rippleMotion = matchMedia('(prefers-reduced-motion:no-preference) and (forced-colors:none)');
let lastRipple = -Infinity;
function releaseRipple(event) {
  if (!rippleMotion.matches || !event.isPrimary) return;
  if (event.type === 'pointermove' && (event.pointerType === 'touch' || event.timeStamp - lastRipple < 160)) return;
  lastRipple = event.timeStamp;
  const ripple = document.createElement('span');
  ripple.className = 'water-ring';
  ripple.setAttribute('aria-hidden', 'true');
  ripple.style.left = event.clientX + 'px';
  ripple.style.top = event.clientY + 'px';
  (event.target.closest('dialog') || document.body).append(ripple);
  window.setTimeout(() => ripple.remove(), 1000);
}
document.addEventListener('pointermove', releaseRipple, { passive:true });
document.addEventListener('pointerdown', releaseRipple, { passive:true });
const tideMotion = matchMedia('(prefers-reduced-motion: no-preference)');
let lastScroll = scrollY;
let tideFrame = 0;
let tideTime = 0;
let tideSpeed = 0;
let tidePosition = 0;
function rollTide(now) {
  const elapsed = Math.min((now - tideTime) / 1000, .05);
  tideTime = now;
  tideSpeed *= Math.exp(-3 * elapsed);
  tidePosition += tideSpeed * elapsed;
  const style = document.documentElement.style;
  style.setProperty('--tide-front', tidePosition + 'px');
  style.setProperty('--tide-back', tidePosition * .52 + 'px');
  const speed = Math.abs(tideSpeed);
  const rolling = speed > 1 && tideMotion.matches;
  const lift = rolling ? Math.sin(tidePosition / 55) * Math.min(8, speed / 35) : 0;
  style.setProperty('--tide-lift', lift + 'px');
  tideFrame = rolling ? requestAnimationFrame(rollTide) : 0;
}
function onPageScroll() {
  const distance = scrollY - lastScroll;
  lastScroll = scrollY;
  if (distance !== 0 && tideMotion.matches) {
    const direction = Math.sign(distance);
    const momentum = Math.max(0, tideSpeed * direction);
    tideSpeed = direction * Math.min(280, momentum + Math.abs(distance) * 1.8);
    if (!tideFrame) {
      tideTime = performance.now();
      tideFrame = requestAnimationFrame(rollTide);
    }
  }
  queueWave();
}
function updateWave() {
  waveFrame = 0;
  const distance = document.documentElement.scrollHeight - innerHeight;
  const progress = Math.min(1, Math.max(0, scrollY / Math.max(1, distance)));
  const current = progress === 1 ? stops.at(-1) : stops.filter(section => section.getBoundingClientRect().top <= innerHeight * .4).pop() || stops[0];
  const stopIndex = [...destinations].findIndex(link => link.hash === '#' + current.id);
  const wavePosition = stopIndex < 0 ? 0 : (stopIndex + .5 + (slideProgress.get(current.id) || 0)) / destinations.length;
  document.documentElement.style.setProperty('--unread', 1 - (progress === 1 ? 1 : wavePosition));
  destinations.forEach(link => {
    if (link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
function queueWave() {
  if (!waveFrame) waveFrame = requestAnimationFrame(updateWave);
}
window.addEventListener('scroll', onPageScroll, { passive:true });
window.addEventListener('resize', queueWave);
window.addEventListener('load', queueWave);
updateWave();
document.querySelector('#year').textContent = new Date().getFullYear();
document.querySelectorAll('[data-carousel]').forEach(track => {
  const slides = [...track.children];
  const controls = document.createElement('div');
  controls.className = 'carousel-controls';
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', 'Choose a slide: ' + track.dataset.carousel);
  let current = 0;
  function updateSlide(index) {
    current = index;
    slideProgress.set(track.closest('section').id, index / slides.length);
    slides.forEach((slide, position) => { slide.inert = position !== index; });
    selectors.forEach((button, position) => button.setAttribute('aria-pressed', String(position === index)));
    queueWave();
  }
  const selectors = slides.map((slide, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', 'Show ' + slide.querySelector('h3').textContent + ', ' + (index + 1) + ' of ' + slides.length);
    button.addEventListener('click', () => {
      updateSlide(index);
    });
    return button;
  });
  controls.append(...selectors);
  track.after(controls);
  track.classList.add('carousel-track');
  updateSlide(0);
});
const dialog = document.querySelector('.certificate-dialog');
const preview = dialog.querySelector('.preview-content');
let previewTrigger;
document.querySelectorAll('[data-preview]').forEach(button => {
  const article = button.closest('article');
  const title = article.querySelector('h3').textContent;
  button.setAttribute('aria-label', 'View ' + title);
  button.setAttribute('aria-haspopup', 'dialog');
  button.addEventListener('click', () => {
    previewTrigger = button;
    const image = article.querySelector('.certificate-image img');
    const visual = (image || article.querySelector('.project-art')).cloneNode(true);
    if (image) visual.className = 'dialog-image';
    const description = article.querySelector('.project-copy > p:not(.eyebrow), .certificate-copy > p:not(.eyebrow)').cloneNode(true);
    preview.replaceChildren(visual, description);
    const stack = article.querySelector('.project-stack');
    if (stack) preview.append(stack.content.cloneNode(true));
    dialog.querySelector('#certificate-title').textContent = title;
    dialog.showModal();
    document.body.classList.add('modal-open');
  });
});
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  previewTrigger?.focus();
});
