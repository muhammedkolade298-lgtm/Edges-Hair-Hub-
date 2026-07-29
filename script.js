// Product data can be replaced with inventory from a backend later.
const products = [
  {name:'The Sade', type:'13x4 HD Lace Frontal', price:'₦285,000', image:'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=85'},
  {name:'The Maya', type:'Bone Straight • 24 inch', price:'₦320,000', image:'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=700&q=85'},
  {name:'The Zuri', type:'Deep Wave • 20 inch', price:'₦260,000', image:'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=700&q=85'},
  {name:'The Nia', type:'Pixie Cut • Glueless', price:'₦180,000', image:'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=700&q=85'}
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

// Contact form demo: ready to connect to email or a CRM endpoint.
document.querySelector('#contactForm').addEventListener('submit', event => { event.preventDefault(); document.querySelector('#formStatus').textContent = 'Thank you — your enquiry has been received. We will be in touch shortly.'; event.target.reset(); });

const backTop = document.querySelector('#backTop');
window.addEventListener('scroll', () => backTop.classList.toggle('show', window.scrollY > 500), {passive:true});
backTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
window.addEventListener('load', () => setTimeout(() => document.querySelector('#loader').classList.add('hide'), 450));
