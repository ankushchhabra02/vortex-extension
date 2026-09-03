/* Vortex API client, shared by the popup.

   One instance, declared in the manifest, so there is nothing to configure:
   host permission is granted at install and Vortex's Supabase session cookie
   rides along with every request. Self-hosting? Change BASE below and the
   matching host_permissions entry in manifest.json. */

const VX = {
  BASE: 'https://vortex-rho-cyan.vercel.app',
  DEFAULTS: { kbId: '', kbName: '' },

  async cfg() {
    return chrome.storage.local.get(VX.DEFAULTS);
  },

  loginUrl() {
    return VX.BASE + '/login';
  },

  async call(path, init = {}) {
    let res;
    try {
      res = await fetch(VX.BASE + path, { credentials: 'include', ...init });
    } catch {
      throw new VXError('UNREACHABLE', 'Can’t reach Vortex right now.');
    }

    // Vortex's middleware redirects unauthenticated API calls to /login
    // instead of returning 401, so the final URL is what gives it away.
    if (res.url.includes('/login') || res.status === 401)
      throw new VXError('NOT_LOGGED_IN', 'Not logged in.');
    if (res.status === 429) throw new VXError('RATE_LIMIT', 'Too many requests — wait a moment.');
    if (res.status === 403) throw new VXError('FORBIDDEN', 'That knowledge base is no longer yours.');
    if (!res.ok) {
      let detail = '';
      try {
        detail = (await res.json()).error || '';
      } catch {}
      throw new VXError('HTTP_' + res.status, detail || `Vortex returned ${res.status}.`);
    }
    return res;
  },

  async knowledgeBases() {
    const res = await VX.call('/api/knowledge-bases?limit=50');
    return (await res.json()).knowledgeBases || [];
  },

  /* Streams the answer. Vortex sends raw text chunks, with the sources and the
     conversation id on response headers rather than in the body. */
  async *ask({ messages, knowledgeBaseId, conversationId, onMeta }) {
    const res = await VX.call('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        ...(knowledgeBaseId ? { knowledgeBaseId } : {}),
        // Threading the id back keeps the conversation in Vortex's own history.
        ...(conversationId ? { conversationId } : {}),
      }),
    });

    if (onMeta) {
      let sources = [];
      try {
        sources = JSON.parse(res.headers.get('X-Sources') || '[]');
      } catch {}
      onMeta({ sources, conversationId: res.headers.get('X-Conversation-Id') || conversationId });
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield decoder.decode(value, { stream: true });
    }
  },
};

class VXError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

if (typeof self !== 'undefined') self.VX = VX;
