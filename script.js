// Product data can be replaced with inventory from a backend later.
const products = [
  {name:'The Chioma Wig', type:'13x4 HD Lace Frontal Wig', price:'₦110,000', image:'AFFO3104.WEBP'},
  {name:'The Mariam Wig', type:'Bone Straight • 24 inch', price:'₦150,000', image:'TAP.JPG'},
  {name:'The Zainab Wig', type:'Deep Wave • 20 inch', price:'₦90,000', image:'WASH.JPG'},
  {name:'The Onyere Wig', type:'Pixie Cut • Glueless', price:'₦80,000', image:'amer.webp'}
];
const productGrid = document.querySelector('#productGrid');
productGrid.innerHTML = products.map((product, index) => `<article class="product-card reveal"><img src="${product.image}" alt="${product.name} ${product.type}" loading="lazy"><div class="product-meta"><div><h3>${product.name}</h3><p>${product.type}</p></div><strong>${product.price}</strong></div></article>`).join('');

// Mobile navigation.
const menuToggle = document.querySelector('#menuToggle');
const nav = document.querySelector('#nav');
menuToggle.addEventListener('click', () => { const open = nav.classList.toggle('open'); menuToggle.setAttribute('aria-expanded', open); });
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => nav.classList.remove('open')));

// Reveal sections as they enter the viewport.
const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); } }), {threshold:.12});
document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

// Keep the active navigation item aligned with the visible section.
const sections = document.querySelectorAll('main section[id]');
const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { document.querySelectorAll('.nav a').forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`)); } }), {rootMargin:'-35% 0px -55%'});
sections.forEach(section => sectionObserver.observe(section));

// Testimonial slider.
const reviews = [
  ['“The attention to detail is unmatched. My install was so natural, comfortable and beautiful — I received compliments all week.”','AMAKA O.'],
  ['“Edges made choosing my first human hair wig feel effortless. The team understood exactly what I wanted.”','TOLU A.'],
  ['“My revamp looked brand new. The finish, service and care are all five-star.”','CHIAMAKA N.']
];
let reviewIndex = 0;
const testimonial = document.querySelector('#testimonial');
function showReview() { testimonial.innerHTML = `<div class="stars">★★★★★</div><blockquote>${reviews[reviewIndex][0]}</blockquote><p>${reviews[reviewIndex][1]} <span>•</span> LEKKI CLIENT</p>`; }
document.querySelector('#prevReview').addEventListener('click', () => { reviewIndex = (reviewIndex - 1 + reviews.length) % reviews.length; showReview(); });
document.querySelector('#nextReview').addEventListener('click', () => { reviewIndex = (reviewIndex + 1) % reviews.length; showReview(); });

// --- Contact / booking form -------------------------------------------
// Sends the enquiry to Formspree AND logs it to localStorage so it shows
// up in the admin dashboard's Inbox page (admin.html reads the same key).
//
// TODO: replace with your real Formspree endpoint, e.g.
// https://formspree.io/f/abcdwxyz
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/meeydvlk';
const APPOINTMENTS_KEY = 'edgesHairHub_appointments';

const contactForm = document.querySelector('#contactForm');
const formStatus = document.querySelector('#formStatus');

function saveAppointment(entry) {
  let list = [];
  try { list = JSON.parse(localStorage.getItem(APPOINTMENTS_KEY) || '[]'); } catch { list = []; }
  list.push(entry);
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(list));
}

contactForm.addEventListener('submit', async event => {
  event.preventDefault();

  const formData = new FormData(contactForm);
  const entry = {
    id: `apt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: (formData.get('name') || '').toString().trim(),
    email: (formData.get('email') || '').toString().trim(),
    service: formData.get('service') || '',
    wig: formData.get('wig') || '',
    color: formData.get('color') || '',
    length: formData.get('length') || '',
    type: formData.get('type') || '',
    message: (formData.get('message') || '').toString().trim(),
    createdAt: Date.now(),
    read: false,
    dismissed: false
  };

  const submitButton = contactForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  formStatus.textContent = 'Sending your enquiry…';

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData
    });

    if (!response.ok) throw new Error('Formspree request failed');

    saveAppointment(entry);
    formStatus.textContent = 'Thank you — your enquiry has been received. We will be in touch shortly.';
    contactForm.reset();
  } catch (error) {
    // Still log locally so the request isn't lost even if email delivery failed.
    saveAppointment(entry);
    formStatus.textContent = 'Your enquiry was saved, but the email notification failed to send. We will still follow up.';
  } finally {
    submitButton.disabled = false;
  }
});

const backTop = document.querySelector('#backTop');
window.addEventListener('scroll', () => backTop.classList.toggle('show', window.scrollY > 500), {passive:true});
backTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
window.addEventListener('load', () => setTimeout(() => document.querySelector('#loader').classList.add('hide'), 450));