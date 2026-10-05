const WAITLIST_ENDPOINT = '';
const conversations = [
  {id:'aicha',name:'Aïcha Diabaté',initials:'AD',color:'rose',channel:'whatsapp',time:'12:42',preview:'Parfait, je le prends !',loyal:true,price:18000,product:'Sac Sira',insight:'Aïcha revient pour la 4e fois. Pensez à la remercier !',messages:[{text:'Bonjour Messan ! Le sac de votre story est encore disponible ?',time:'12:40'},{text:'Bonjour Aïcha ! Oui, le Sira est à 18 000 F CFA. Je vous le réserve ?',reply:true,time:'12:41'},{text:'Parfait, je le prends ! Livraison à Cocody possible ?',time:'12:42'}]},
  {id:'moussa',name:'Moussa Traoré',initials:'MT',color:'blue',channel:'tiktok',time:'12:38',preview:'Je viens de votre live !',loyal:false,price:18000,product:'Sac Sira',insight:'Moussa découvre la boutique. Proposez-lui les détails du produit.',messages:[{text:'Bonjour ! Je viens de votre live. Combien coûte le sac ?',time:'12:37'},{text:'Bonjour Moussa ! Le Sira est à 18 000 F CFA. Vous cherchez une couleur en particulier ?',reply:true,time:'12:38'}]},
  {id:'aminata',name:'Aminata Coulibaly',initials:'AC',color:'yellow',channel:'whatsapp',time:'12:25',preview:'Vous livrez à Marcory ?',loyal:true,price:18000,product:'Sac Sira',insight:'Aminata a déjà commandé. Confirmez son adresse avant la livraison.',messages:[{text:'Bonjour ! Vous livrez à Marcory ?',time:'12:24'},{text:'Bonjour Aminata ! Oui, quel quartier exactement ? Je vérifie le tarif avec le livreur.',reply:true,time:'12:25'}]},
  {id:'kevin',name:'Kévin N’Guessan',initials:'KN',color:'blue',channel:'tiktok',time:'12:10',preview:'C’est pour un cadeau.',loyal:false,price:18000,product:'Sac Sira',insight:'Kévin cherche un cadeau. Proposez-lui un emballage attentionné.',messages:[{text:'C’est pour un cadeau. Vous pouvez l’emballer ?',time:'12:08'},{text:'Bien sûr ! On prépare un joli emballage avec votre commande.',reply:true,time:'12:10'}]}
];
let selectedId = 'aicha';
let selectedFilter = 'all';
let orderTotal = 148000;
let toastTimer;
const number = new Intl.NumberFormat('fr-FR', {maximumFractionDigits:0});
const fcfa = (value) => `${number.format(value)} F CFA`;
const byId = (id) => document.getElementById(id);
const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
function icons() { if (window.lucide) window.lucide.createIcons(); }
function notify(message) {
  clearTimeout(toastTimer);
  byId('toast').textContent = message;
  byId('toast').hidden = false;
  toastTimer = setTimeout(() => { byId('toast').hidden = true; }, 5000);
}
function renderList() {
  const query = byId('chat-search').value.trim().toLocaleLowerCase('fr');
  const visible = conversations.filter((chat) => (selectedFilter === 'all' || chat.channel === selectedFilter) && chat.name.toLocaleLowerCase('fr').includes(query));
  byId('conversation-count').textContent = visible.length;
  byId('chat-list').innerHTML = visible.length ? visible.map((chat) => `<button class="chat-item ${chat.id === selectedId ? 'active' : ''}" data-chat="${chat.id}" aria-pressed="${chat.id === selectedId}" aria-label="Conversation avec ${chat.name}"><span class="initial-avatar ${chat.channel}">${chat.initials}</span><span class="chat-copy"><span class="chat-title">${chat.name}<time>${chat.time}</time></span><span class="chat-preview">${escapeHtml(chat.preview)}</span><span class="chat-channel ${chat.channel}">${chat.confirmed ? 'Commande confirmée · Paiement attendu' : chat.channel === 'whatsapp' ? 'WhatsApp' : 'TikTok'}</span></span></button>`).join('') : '<p class="empty-chats">Aucune conversation trouvée.</p>';
}
function renderThread() {
  const chat = conversations.find((item) => item.id === selectedId);
  byId('thread-name').textContent = chat.name;
  byId('thread-avatar').textContent = chat.initials;
  byId('thread-avatar').className = `initial-avatar ${chat.channel}`;
  byId('messages').closest('.thread').dataset.channel = chat.channel;
  byId('thread-channel').textContent = `${chat.channel === 'whatsapp' ? 'WhatsApp' : 'TikTok'}`;
  byId('customer-badge').textContent = chat.loyal ? 'Client fidèle' : 'Premier échange';
  byId('order-summary').textContent = `${chat.product} · ${fcfa(chat.price)}`;
  byId('order-status').textContent = chat.confirmed ? 'Confirmée' : 'À confirmer';
  byId('order-product').textContent = chat.product;
  byId('order-price').textContent = fcfa(chat.price);
  byId('ai-suggestion').textContent = chat.insight;
  byId('confirm-order').disabled = Boolean(chat.confirmed);
  byId('confirm-order').querySelector('span').textContent = chat.confirmed ? 'Commande confirmée' : 'Confirmer la commande';
  byId('messages').innerHTML = chat.messages.map((message) => `<div class="message ${message.reply ? 'reply' : ''}">${escapeHtml(message.text)}<time>${message.time}</time></div>`).join('');
  byId('messages').scrollTop = byId('messages').scrollHeight;
}
byId('chat-list').addEventListener('click', (event) => {
  const button = event.target.closest('[data-chat]');
  if (!button) return;
  selectedId = button.dataset.chat;
  byId('message-input').value = '';
  renderList(); renderThread();
});
document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => {
  selectedFilter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach((filter) => {
    filter.classList.toggle('active', filter === button);
    filter.setAttribute('aria-pressed', String(filter === button));
  });
  renderList();
}));
byId('chat-search').addEventListener('input', renderList);
byId('message-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const input = byId('message-input');
  const text = input.value.trim();
  if (!text) return;
  const chat = conversations.find((item) => item.id === selectedId);
  const time = new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  chat.messages.push({text,reply:true,time});
  chat.preview = text;
  chat.time = time;
  input.value = '';
  renderList(); renderThread();
  notify('Message ajouté à la démonstration. Aucun envoi réel.');
});
byId('confirm-order').addEventListener('click', () => {
  const chat = conversations.find((item) => item.id === selectedId);
  if (chat.confirmed) return;
  chat.confirmed = true;
  orderTotal += chat.price;
  byId('revenue-value').textContent = number.format(orderTotal);
  renderList(); renderThread();
  notify(`Commande fictive de ${fcfa(chat.price)} confirmée. Aucun paiement encaissé.`);
});
const menuButton = document.querySelector('.menu-toggle');
function closeMenu() {
  byId('navigation').classList.remove('open');
  menuButton.setAttribute('aria-expanded','false');
  menuButton.setAttribute('aria-label','Ouvrir le menu');
}
menuButton.addEventListener('click', () => {
  const opened = byId('navigation').classList.toggle('open');
  menuButton.setAttribute('aria-expanded',String(opened));
  menuButton.setAttribute('aria-label',opened ? 'Fermer le menu' : 'Ouvrir le menu');
});
document.querySelectorAll('#navigation a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && byId('navigation').classList.contains('open')) { closeMenu(); menuButton.focus(); }
});
if (WAITLIST_ENDPOINT) byId('form-privacy').textContent = 'Votre email servira uniquement à vous contacter pour l’accès anticipé.';
byId('waitlist-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const feedback = byId('form-feedback');
  const shop = byId('shop').value.trim();
  const email = byId('email').value.trim();
  if (shop.length < 2) { byId('shop').setCustomValidity('Indiquez un nom de boutique d’au moins 2 caractères.'); byId('shop').reportValidity(); return; }
  if (!WAITLIST_ENDPOINT) {
    feedback.textContent = `Merci, ${shop} ! Ceci est une démonstration : aucune inscription réelle n’a été créée et aucune donnée n’a été conservée.`;
    event.target.reset();
    return;
  }
  const submit = byId('waitlist-submit');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  submit.disabled = true;
  submit.querySelector('span').textContent = 'Inscription en cours…';
  feedback.textContent = '';
  try {
    const response = await fetch(WAITLIST_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,shop}),signal:controller.signal});
    if (!response.ok) throw new Error('Inscription indisponible');
    feedback.textContent = `Bienvenue, ${shop} ! Votre demande est enregistrée. Nous vous contacterons à l’ouverture des accès.`;
    event.target.reset();
  } catch {
    feedback.textContent = 'Votre inscription n’a pas pu être confirmée. Veuillez réessayer dans un instant.';
  } finally {
    clearTimeout(timer);
    submit.disabled = false;
    submit.querySelector('span').textContent = 'Je rejoins l’aventure';
  }
});
byId('shop').addEventListener('input', () => byId('shop').setCustomValidity(''));
byId('year').textContent = new Date().getFullYear();
renderList(); renderThread(); icons();