// Cleaned script: search, save/load contacts, clear-field, clear-all, per-contact load/delete

// Safe form submit handler if a form exists
const contactForm = document.querySelector('form');
if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    alert('Thank you for your message!');
  });
}

// Search functionality (if present)
const searchInputEl = document.getElementById('searchInput');
if (searchInputEl) {
  searchInputEl.addEventListener('keyup', function () {
    const searchValue = this.value.toLowerCase();
    const namesList = document.getElementById('namesList');
    if (!namesList) return;
    const items = namesList.getElementsByTagName('li');
    for (let i = 0; i < items.length; i++) {
      const name = items[i].textContent.toLowerCase();
      items[i].style.display = name.includes(searchValue) ? '' : 'none';
    }
  });
}

// Collect values from the details form
function getDetailsFields() {
  const sel = (s) => document.querySelector(s);
  return {
    name: sel('#details input[placeholder^="Enter your name"]')?.value || '',
    email: sel('#details input[type="email"]')?.value || '',
    phone: sel('#details input[placeholder^="Enter your phone"]')?.value || '',
    facebook: sel('#details input[placeholder*="Facebook"]')?.value || '',
    instagram: sel('#details input[placeholder*="Instagram"]')?.value || '',
    snapchat: sel('#details input[placeholder*="Snapchat"]')?.value || '',
    payment: sel('#details textarea[placeholder*="payment"]')?.value || '',
    address: sel('#details textarea[placeholder*="address"]')?.value || ''
  };
}

function populateDetailsFromObject(d) {
  const set = (s, v) => { const el = document.querySelector(s); if (el) el.value = v || ''; };
  set('#details input[placeholder^="Enter your name"]', d.name);
  set('#details input[type="email"]', d.email);
  set('#details input[placeholder^="Enter your phone"]', d.phone);
  set('#details input[placeholder*="Facebook"]', d.facebook);
  set('#details input[placeholder*="Instagram"]', d.instagram);
  set('#details input[placeholder*="Snapchat"]', d.snapchat);
  set('#details textarea[placeholder*="payment"]', d.payment);
  set('#details textarea[placeholder*="address"]', d.address);
}

function renderContacts() {
  const list = document.getElementById('contactsList');
  if (!list) return;
  const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
  list.innerHTML = '';
  if (!contacts.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'No contacts yet. Save a detail to add here.';
    list.appendChild(li);
    return;
  }
  contacts.forEach((c, idx) => {
    const li = document.createElement('li');
    li.className = 'contact-item';
    li.dataset.idx = idx;
    const row = document.createElement('div');
    row.className = 'contact-row';

    const loadBtn = document.createElement('button');
    loadBtn.type = 'button';
    loadBtn.className = 'contact-load';
    loadBtn.dataset.idx = idx;
    const name = c.name || 'Unnamed';
    const email = c.email ? ` — ${c.email}` : '';
    loadBtn.textContent = `${name}${email}`;

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'delete-contact';
    delBtn.dataset.idx = idx;
    delBtn.textContent = 'Delete';
    row.appendChild(loadBtn);
    li.appendChild(row);
    list.appendChild(li);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  const saved = localStorage.getItem('myDetails');
  if (saved) populateDetailsFromObject(JSON.parse(saved));
  renderContacts();

  // Move to next field on Enter for Name and Email
  const nameInput = document.querySelector('#details input[placeholder^="Enter your name"]');
  const emailInput = document.querySelector('#details input[type="email"]');
  
  if (nameInput) {
    nameInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        emailInput?.focus();
      }
    });
  }
  
  if (emailInput) {
    emailInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const phoneInput = document.querySelector('#details input[placeholder^="Enter your phone"]');
        phoneInput?.focus();
      }
    });
  }

  const saveBtn = document.getElementById('saveDetails');
  if (saveBtn) {
    saveBtn.addEventListener('click', function () {
      const details = getDetailsFields();
      localStorage.setItem('myDetails', JSON.stringify(details));
      const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
      contacts.push(details);
      localStorage.setItem('contacts', JSON.stringify(contacts));
      renderContacts();
      saveBtn.textContent = 'Saved';
      setTimeout(() => (saveBtn.textContent = 'Save Details'), 1500);
    });
  }

  // Clear All in Fill Details
  const clearFormBtn = document.getElementById('clearForm');
  if (clearFormBtn) {
    clearFormBtn.addEventListener('click', function () {
      const fields = document.querySelectorAll('#details input, #details textarea');
      fields.forEach((f) => {
        if (f.type === 'checkbox' || f.type === 'radio') return;
        f.value = '';
      });
      const first = document.querySelector('#details input, #details textarea');
      if (first) first.focus();
    });
  }
  // Next button: save current contact then clear form for next entry
  const nextBtn = document.getElementById('nextEntry');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      const details = getDetailsFields();
      // don't save if all fields are empty
      const hasAny = Object.values(details).some(v => v && v.trim() !== '');
      if (hasAny) {
        const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
        contacts.push(details);
        localStorage.setItem('contacts', JSON.stringify(contacts));
        // also update last-used
        localStorage.setItem('myDetails', JSON.stringify(details));
        renderContacts();
        // give quick feedback
        const original = nextBtn.textContent;
        nextBtn.textContent = 'Saved';
        setTimeout(() => nextBtn.textContent = original, 1000);
      }
      // clear form for next entry
      const fields = document.querySelectorAll('#details input, #details textarea');
      fields.forEach((f) => { if (f.type !== 'checkbox' && f.type !== 'radio') f.value = ''; });
      const first = document.querySelector('#details input, #details textarea');
      if (first) first.focus();
    });
  }

  // Previous button: load the last entry from contacts
  const prevBtn = document.getElementById('prevEntry');
  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
      if (contacts.length === 0) {
        alert('No previous entries. Save a contact first.');
        return;
      }
      // Load the last contact entry
      const lastContact = contacts[contacts.length - 1];
      populateDetailsFromObject(lastContact);
      // mark it as selected in the list
      const prev = document.querySelectorAll('#contactsList .contact-item.selected');
      prev.forEach(p => p.classList.remove('selected'));
      const items = document.querySelectorAll('#contactsList .contact-item');
      const lastItem = items[items.length - 1];
      if (lastItem) lastItem.classList.add('selected');
    });
  }
});

// Delegated click handling for clear-field, contact load, contact delete
document.addEventListener('click', function (e) {
  const clearBtn = e.target.closest('.clear-field');
  if (clearBtn) {
    const container = clearBtn.closest('.field-with-clear');
    if (!container) return;
    const field = container.querySelector('input, textarea');
    if (!field) return;
    field.value = '';
    field.focus();
    return;
  }

  const load = e.target.closest('.contact-load');
  if (load) {
    const idx = Number(load.dataset.idx);
    const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    const contact = contacts[idx];
    if (!contact) return;
    // mark selected contact visually
    const prev = document.querySelectorAll('#contactsList .contact-item.selected');
    prev.forEach(p => p.classList.remove('selected'));
    const li = load.closest('.contact-item');
    if (li) li.classList.add('selected');
    populateDetailsFromObject(contact);
    return;
  }
});

// Delete selected contact via header button
const deleteSelectedBtn = document.getElementById('deleteSelected');
if (deleteSelectedBtn) {
  deleteSelectedBtn.addEventListener('click', function() {
    const selected = document.querySelector('#contactsList .contact-item.selected');
    if (!selected) {
      alert('Please select a contact first by clicking its name.');
      return;
    }
    const idx = Number(selected.dataset.idx);
    const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    if (!contacts[idx]) return;
    if (!confirm('Delete selected contact? This cannot be undone.')) return;
    contacts.splice(idx, 1);
    localStorage.setItem('contacts', JSON.stringify(contacts));
    renderContacts();
  });
}

// Search modal behavior: show matching contacts in a popup
function openSearchModal() {
  const modal = document.getElementById('searchModal');
  if (modal) modal.classList.remove('hidden');
}

function closeSearchModal() {
  const modal = document.getElementById('searchModal');
  if (modal) modal.classList.add('hidden');
}

function renderSearchResults(matches) {
  const out = document.getElementById('modalResults');
  if (!out) return;
  out.innerHTML = '';
  if (!matches.length) {
    const p = document.createElement('div');
    p.className = 'modal-empty';
    p.textContent = 'No matches found.';
    out.appendChild(p);
    return;
  }

  matches.forEach((c, i) => {
    const r = document.createElement('div');
    r.className = 'modal-result';
    const h = document.createElement('h4');
    h.textContent = c.name || 'Unnamed';
    r.appendChild(h);
    if (c.email) {
      const e = document.createElement('div');
      e.textContent = `Email: ${c.email}`;
      r.appendChild(e);
    }
    if (c.phone) {
      const p = document.createElement('div');
      p.textContent = `Phone: ${c.phone}`;
      r.appendChild(p);
    }
    if (c.facebook) {
      const f = document.createElement('div');
      f.textContent = `Facebook: ${c.facebook}`;
      r.appendChild(f);
    }
    if (c.instagram) {
      const ig = document.createElement('div');
      ig.textContent = `Instagram: ${c.instagram}`;
      r.appendChild(ig);
    }
    if (c.snapchat) {
      const s = document.createElement('div');
      s.textContent = `Snapchat: ${c.snapchat}`;
      r.appendChild(s);
    }
    if (c.payment) {
      const pay = document.createElement('div');
      pay.textContent = `Payment: ${c.payment}`;
      r.appendChild(pay);
    }
    if (c.address) {
      const a = document.createElement('div');
      a.textContent = `Address: ${c.address}`;
      r.appendChild(a);
    }

    // Load button for this result
    const loadBtn = document.createElement('button');
    loadBtn.type = 'button';
    loadBtn.textContent = 'Load';
    loadBtn.className = 'next-btn';
    loadBtn.addEventListener('click', function() {
      populateDetailsFromObject(c);
      closeSearchModal();
    });
    r.appendChild(loadBtn);

    out.appendChild(r);
  });
}

// wire up search actions after DOM ready
document.addEventListener('DOMContentLoaded', function() {
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');
  const closeModal = document.getElementById('closeModal');
  const backdrop = document.getElementById('modalBackdrop');

  function doSearch() {
    const q = (searchInput?.value || '').trim().toLowerCase();
    const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    const matches = contacts.filter(c => {
      return (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q);
    });
    renderSearchResults(matches);
    openSearchModal();
  }

  if (searchBtn) searchBtn.addEventListener('click', doSearch);
  if (searchInput) searchInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') { e.preventDefault(); doSearch(); } });
  if (closeModal) closeModal.addEventListener('click', closeSearchModal);
  if (backdrop) backdrop.addEventListener('click', closeSearchModal);
});