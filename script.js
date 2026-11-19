const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
function closeMenu() {
  navMenu.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}
menuToggle.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
navMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', event => {
  if (!event.target.closest('.navigation')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navMenu.classList.contains('open')) {
    closeMenu();
    menuToggle.focus();
  }
});
window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);
document.querySelector('#year').textContent = new Date().getFullYear();
const dialog = document.querySelector('.certificate-dialog');
const dialogImage = dialog.querySelector('.dialog-image');
let certificateTrigger;
document.querySelectorAll('[data-certificate]').forEach(link => {
  link.addEventListener('click', event => {
    if (typeof dialog.showModal !== 'function') return;
    event.preventDefault();
    certificateTrigger = link;
    const image = link.querySelector('img');
    dialogImage.src = link.href;
    dialogImage.alt = image.alt;
    dialog.querySelector('#certificate-title').textContent = link.closest('article').querySelector('h3').textContent;
    dialog.querySelector('.original-link').href = link.href;
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
  certificateTrigger?.focus();
});
