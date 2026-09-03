const $ = (id) => document.getElementById(id);

let messages = [];          // full turn history, sent back for follow-ups
let conversationId = null;  // Vortex persists the thread under this id
let busy = false;
let gated = false;          // re-check the session whenever the panel regains focus

const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

const ICON = {
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  bot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M8 16h.01M16 16h.01"/></svg>',
};

/* ---------------- rendering ---------------- */

function addTurn(role) {
  const el = document.createElement('div');
  el.className = 'turn ' + role;
  el.innerHTML =
    `<div class="bubble"><div class="who">${ICON[role === 'user' ? 'user' : 'bot']}<span>${
      role === 'user' ? 'User' : 'Assistant'
    }</span></div><div class="body"></div></div>`;
  $('log').appendChild(el);
  return el.querySelector('.body');
}

function scrollDown() {
  $('log').scrollTop = $('log').scrollHeight;
}

function renderAnswer(body, text) {
  body.innerHTML = MD.render(text);
}

function addSources(body, sources) {
  if (!sources?.length) return;
  const wrap = document.createElement('div');
  wrap.className = 'srcs';
  wrap.innerHTML =
    '<div class="srcs-label">Sources:</div><div class="srcs-list">' +
    sources
      .map(
        (s) =>
          `<span class="src" title="${esc(s.title)}${
            typeof s.similarity === 'number' ? ` (${Math.round(s.similarity * 100)}% match)` : ''
          }">[${s.index}] ${esc(s.title)}</span>`
      )
      .join('') +
    '</div>';
  body.parentElement.appendChild(wrap);
}

function gate(message, buttonLabel, onClick) {
  gated = true;
  $('kb').hidden = true;
  $('newchat').hidden = true;
  $('composer').hidden = true;
  $('log').innerHTML = `<div class="gate"><p>${esc(message)}</p>${
    buttonLabel ? `<button class="primary" id="gatebtn">${esc(buttonLabel)}</button>` : ''
  }</div>`;
  if (buttonLabel) $('gatebtn').addEventListener('click', onClick);
}

function emptyState() {
  $('log').innerHTML = `<div class="empty">${ICON.bot}<h3>Start a Conversation</h3><p>Ask a question about your knowledge base documents.</p></div>`;
}

/* ---------------- session ---------------- */

async function init() {
  let kbs;
  try {
    kbs = await VX.knowledgeBases();
  } catch (e) {
    if (e.code === 'NOT_LOGGED_IN')
      return gate('Log into Vortex to search your knowledge bases.', 'Log in to Vortex', () =>
        chrome.tabs.create({ url: VX.loginUrl() })
      );
    return gate(e.message, 'Retry', () => init());
  }

  if (!kbs.length)
    return gate('No knowledge bases yet.', 'Open Vortex', () => chrome.tabs.create({ url: VX.BASE }));

  const { kbId } = await VX.cfg();
  $('kb').innerHTML = kbs
    .map((k) => `<option value="${k.id}" ${k.id === kbId ? 'selected' : ''}>${esc(k.name)}</option>`)
    .join('');
  if (!kbs.some((k) => k.id === kbId))
    await chrome.storage.local.set({ kbId: kbs[0].id, kbName: kbs[0].name });

  gated = false;
  $('kb').hidden = false;
  $('newchat').hidden = false;
  $('composer').hidden = false;
  if (!messages.length) emptyState();
  $('q').focus();
}

/* ---------------- asking ---------------- */

async function send() {
  const question = $('q').value.trim();
  if (!question || busy) return;
  const { kbId } = await VX.cfg();

  busy = true;
  $('send').disabled = true;
  $('q').value = '';
  autoGrow();
  if ($('log').querySelector('.empty')) $('log').innerHTML = '';

  addTurn('user').textContent = question;
  messages.push({ role: 'user', content: question });

  const body = addTurn('assistant');
  body.innerHTML = '<span class="thinking">Thinking...</span>';
  scrollDown();

  let sources = [];
  let full = '';
  let painted = 0;

  try {
    const stream = VX.ask({
      messages,
      knowledgeBaseId: kbId,
      conversationId,
      onMeta: (meta) => {
        sources = meta.sources || [];
        conversationId = meta.conversationId || conversationId;
      },
    });

    for await (const chunk of stream) {
      full += chunk;
      // Re-parsing markdown on every token is wasteful; ~16/s stays smooth.
      const now = Date.now();
      if (now - painted > 60) {
        painted = now;
        renderAnswer(body, full);
        scrollDown();
      }
    }

    renderAnswer(body, full);
    MD.highlight(body);
    addSources(body, sources);
    messages.push({ role: 'assistant', content: full });
    scrollDown();
  } catch (e) {
    if (e.code === 'NOT_LOGGED_IN')
      return gate('Your Vortex session expired.', 'Log in again', () =>
        chrome.tabs.create({ url: VX.loginUrl() })
      );
    renderAnswer(body, full);
    const err = document.createElement('div');
    err.className = 'turn-error';
    err.textContent = e.message;
    body.parentElement.appendChild(err);
    messages.pop(); // don't carry a failed turn into the next question
  } finally {
    busy = false;
    $('send').disabled = false;
    $('q').focus();
  }
}

/* ---------------- composer ---------------- */

function autoGrow() {
  const el = $('q');
  el.style.height = 'auto';
  const wanted = el.scrollHeight;
  el.style.height = Math.min(wanted, 132) + 'px';
  // Keep the scrollbar (and its arrows) out of sight until it's actually needed.
  el.classList.toggle('scrolls', wanted > 132);
}

$('q').addEventListener('input', autoGrow);
$('q').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});
$('send').addEventListener('click', send);

$('newchat').addEventListener('click', () => {
  messages = [];
  conversationId = null;
  emptyState();
  $('q').focus();
});

$('kb').addEventListener('change', () => {
  const opt = $('kb').selectedOptions[0];
  chrome.storage.local.set({ kbId: opt.value, kbName: opt.textContent });
  // A different knowledge base is a different conversation.
  messages = [];
  conversationId = null;
  emptyState();
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && gated) init();
});
window.addEventListener('focus', () => {
  if (gated) init();
});

init();
