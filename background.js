/* The only job here: make the toolbar button open the side panel.

   This used to be a popup, and popups close the instant they lose focus —
   clicking the page, switching windows, or opening a tab all killed a search
   mid-flight. A side panel stays put. */

const openOnClick = () =>
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});

chrome.runtime.onInstalled.addListener(openOnClick);
chrome.runtime.onStartup.addListener(openOnClick);
