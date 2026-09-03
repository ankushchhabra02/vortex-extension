/* Markdown rendering for answers.

   Vortex's own chat renders with react-markdown + remark-gfm + rehype-highlight.
   An extension has no build step and can't load remote scripts, so this pairs
   vendored `marked` (GFM by default) with highlight.js for the same result.

   Model output is never trusted as HTML: marked's output goes through an
   allowlist before it reaches the DOM. */

const MD = {
  TAGS: new Set([
    'p', 'br', 'hr', 'strong', 'em', 'del', 'code', 'pre', 'blockquote',
    'ul', 'ol', 'li', 'a', 'span',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ]),
  SAFE_HREF: /^(https?:|mailto:)/i,
  // Unwrapping these would leave their source code as visible text.
  DROP: new Set(['script', 'style', 'iframe', 'object', 'embed', 'template']),

  render(text) {
    const html = marked.parse(text || '', { gfm: true, breaks: true, async: false });
    const doc = new DOMParser().parseFromString(html, 'text/html');
    MD.clean(doc.body);
    return doc.body.innerHTML;
  },

  clean(root) {
    for (const el of [...root.querySelectorAll('*')]) {
      const tag = el.tagName.toLowerCase();
      if (MD.DROP.has(tag)) {
        el.remove();
        continue;
      }
      if (!MD.TAGS.has(tag)) {
        // Unwrap rather than delete, so text inside a stripped tag survives.
        el.replaceWith(...el.childNodes);
        continue;
      }

      for (const attr of [...el.attributes]) {
        const name = attr.name.toLowerCase();
        const keep =
          (name === 'href' && el.tagName === 'A' && MD.SAFE_HREF.test(attr.value)) ||
          (name === 'class' && (el.tagName === 'CODE' || el.tagName === 'SPAN'));
        if (!keep) el.removeAttribute(attr.name);
      }

      if (el.tagName === 'A') {
        // Without this a link would navigate the side panel away from the chat.
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
      }
    }
  },

  highlight(root) {
    root.querySelectorAll('pre code').forEach((block) => {
      try {
        hljs.highlightElement(block);
      } catch {
        /* unknown language, leave it plain */
      }
    });
  },
};
