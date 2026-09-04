# Privacy Policy — Vortex Search

_Last updated: 3 September 2026_

Vortex Search is a browser extension that queries a Vortex knowledge base you control.

## What the extension sends, and where

When you ask a question, that question — and the earlier messages in the same conversation — are
sent to the Vortex instance the extension is configured for, and nowhere else. That instance is
operated by you or by whoever runs your deployment; its own privacy practices apply to anything
stored there, including the conversation history Vortex keeps.

The extension makes no requests to any other server. It contains no analytics, no telemetry, no
advertising or tracking code, and no third-party services.

## What the extension stores

In your browser's local extension storage: the identifier and name of the knowledge base you last
selected. Nothing else. It is never transmitted anywhere and is removed when you uninstall the
extension.

## Authentication

The extension does not ask for, read, or store your password, API keys, or session tokens.
Requests to your Vortex instance are made with `credentials: 'include'`, which means your browser
attaches the session cookie it already holds — the same one the Vortex website uses. The
extension never has access to its contents.

## Page content

The extension has no content scripts and no access to the pages you visit. It cannot read the
page you are on, your browsing history, your other tabs, or your bookmarks.

## Data sharing

No data is sold, shared, or transferred to third parties. There are no third parties.

## Changes

Material changes to this policy will be published in this file, with the date above updated.

## Contact

Open an issue: https://github.com/ankushchhabra02/vortex-extension/issues
