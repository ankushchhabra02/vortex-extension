# Chrome Web Store submission

Everything the listing form asks for, ready to paste. Build the upload with `./package.sh`.

## Before you submit

- [ ] `$5` one-time developer registration (Google account, paid once, not per extension)
- [ ] Decide **Unlisted** vs **Public** — see *Visibility* below
- [ ] Move off the `*.vercel.app` preview domain if going public; the hardcoded host in
      `manifest.json` breaks the extension the day that URL changes
- [ ] Bump `version` in `manifest.json` — the store rejects a re-upload of an existing version

## Visibility

**Unlisted** — anyone with the link installs it, it doesn't appear in search. Correct choice
while the instance URL is hardcoded: it works for you and anyone you send the link to, with no
setup screen.

**Public** — requires the instance to be configurable. Today every user would hit *your* Vortex
deployment. Restoring that means an options page, `optional_host_permissions`, and a runtime
permission request for whatever origin the user types.

## Listing fields

**Name** (max 75)
```
Vortex Search
```

**Summary** (max 132)
```
Ask your Vortex knowledge base from any tab. Streamed answers with source citations, in Chrome's side panel.
```

**Description**
```
Vortex Search puts your Vortex knowledge base one keystroke away.

Press Alt+Shift+V anywhere in Chrome and a side panel opens alongside the page you're reading. Ask a question, get a streamed answer with citations pointing at the documents it came from, and keep the conversation going with follow-ups.

FEATURES

• Side panel, not a popup — it stays open while you browse, scroll, and switch tabs
• Streaming answers, rendered as markdown with syntax-highlighted code
• Source citations under every answer, with similarity scores
• Multi-turn conversations, saved to your Vortex chat history
• Switch between knowledge bases from the header

NO SETUP

There is no API key to copy and no configuration screen. The extension reuses the Vortex session
you're already logged into in this browser.

PRIVACY

Your questions go to your Vortex instance and nowhere else. There are no analytics, no
third-party requests, and no tracking. The only thing stored locally is which knowledge base you
last selected.

OPEN SOURCE

https://github.com/ankushchhabra02/vortex-extension
```

**Category:** Productivity
**Language:** English

## Permission justifications

The review form asks for one per permission. Vague answers are the most common cause of a
rejection, so be specific about the user-visible feature each one enables.

**`storage`**
```
Remembers which knowledge base the user last selected, so the panel reopens on the same one. No other data is stored.
```

**`sidePanel`**
```
The extension's entire interface is a side panel. It is opened by the toolbar button or the keyboard shortcut.
```

**Host permission — `https://<your-vortex-instance>/*`**
```
The extension's only function is querying the user's own Vortex knowledge base. It sends the user's question to that instance's /api/chat endpoint and reads the streamed answer, and lists knowledge bases from /api/knowledge-bases. It requests no other host, and injects nothing into any page the user visits.
```

**Single purpose**
```
Search and ask questions of the user's Vortex knowledge base from a Chrome side panel.
```

## Data usage disclosures

Tick honestly — a mismatch between these answers and the code is a rejection, and re-review is
slower than first review.

| Question | Answer |
|---|---|
| Collects personally identifiable information | No |
| Collects health information | No |
| Collects financial information | No |
| Collects authentication information | No — the browser sends an existing session cookie; the extension never reads, stores, or transmits credentials |
| Collects personal communications | No |
| Collects location | No |
| Collects web history | No |
| Collects user activity | No |
| Collects website content | No |

Then certify: not sold to third parties, not used for unrelated purposes, not used for
creditworthiness.

**Privacy policy URL** — required whenever any data leaves the browser, which the user's question
does. Publish `PRIVACY.md` and link it:
```
https://github.com/ankushchhabra02/vortex-extension/blob/main/PRIVACY.md
```

## Assets

| Asset | Requirement | Status |
|---|---|---|
| Icon | 128×128 PNG | in `icons/128.png` |
| Screenshot | 1280×800 or 640×400, at least one, up to five | **to do** — screenshot the panel mid-answer, with citations visible |
| Small promo tile | 440×280, optional | optional |

For the screenshot: a 1280×800 window with the panel open next to a real page reads better than
the panel alone.

## Submitting

1. https://chrome.google.com/webstore/devconsole → **New item**
2. Upload `vortex-search-<version>.zip` from `./package.sh`
3. Fill the listing, privacy, and distribution tabs — every tab must be green
4. **Submit for review**

Review is usually hours to a few days. Extensions requesting host permissions get looked at more
closely; a single specific host reviews faster than a wildcard. Rejections arrive by email with a
policy reference — fix and resubmit, no penalty.

## Updating later

Bump `version`, re-run `./package.sh`, upload as a new package on the same item. Updates go
through review too, and reach existing users automatically within a few hours of approval.
