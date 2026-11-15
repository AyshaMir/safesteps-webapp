# Offline guides in a mobile browser tab: iOS Safari vs Android Chrome

Ticket: #10. Map: #1.

**Scope.** SafeSteps is a mobile **website** that people use in the phone's browser. Installing it is out of scope, so this note leaves out install prompts and Add to Home Screen except where installation changes storage behaviour. The questions are:

1. Do the service worker and the Cache API keep the guides available offline in a normal browser tab?
2. What are iOS Safari's storage limits and eviction rules for a site that is not installed, and do they break "guides work offline"?
3. Does localStorage or IndexedDB last reliably enough for contacts that are "Saved on this phone only"?
4. Do `tel:` links work from a mobile browser?

## TL;DR

- **Yes, offline works in a plain tab on both browsers.** Service workers and the Cache API work in Safari and Chrome without installing anything. The service worker has to be registered while the phone is online (on the first visit), and the cached URLs then load with no network.
- **Space is not the problem. Eviction is.** Both browsers give an origin up to about 60% of disk, which is far more than 8 guides and their images need. Both treat that data as *best-effort* by default, though, which means the browser may delete it.
- **iOS Safari has a time-based wipe.** With tracking prevention on (the default), Safari deletes **all script-written storage** (Cache API, service worker registration, IndexedDB, localStorage) for a site that the user hasn't interacted with in **7 days of Safari use**. Someone who caches the guides and then doesn't open SafeSteps for a few weeks can find them gone. Chrome has no time-based rule. It evicts only under storage pressure, least recently used site first.
- **Data on the phone is a convenience, not a guarantee.** This applies to the guides cache and to "Saved on this phone only" contacts alike. The same 7-day rule covers localStorage and IndexedDB on iOS. On both browsers, clearing site data or using private browsing also deletes it.
- **`tel:` works from the mobile browser on both.** iOS always shows a confirmation alert before dialling. On a phone with a cellular radio, Android opens the dialer.

## 1. Service worker and Cache API in a normal tab

- A service worker is a web platform feature of the page and does not require installation. Safari has supported it since 11.1 (iOS 11.3), and Chrome on Android has supported it for years. ([MDN: Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API))
- WebKit says plainly that Home Screen web apps "never required Service Workers". Service workers are independent of installation, and an ordinary Safari tab runs them. ([WebKit: Features in Safari 26.0](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/))
- The Cache API counts toward the origin's quota. When the quota is exceeded, writes reject with `QuotaExceededError`. ([web.dev: Storage for the web](https://web.dev/articles/storage-for-the-web))
- Cross-origin requests made without CORS return opaque responses, and Chrome pads those heavily (a few-KB response can count as about 7 MB of quota). **Serve guide images from our own origin**, or with CORS, rather than as opaque third-party responses. ([Chrome Workbox: storage quota](https://developer.chrome.com/docs/workbox/understanding-storage-quota))

## 2. Quota and eviction

| | iOS Safari (tab) | Android Chrome (tab) |
|---|---|---|
| Per-origin quota | up to about 60% of disk (Safari 17+) | up to about 60% of disk |
| Browser-wide cap | about 80% of disk | about 80% of disk |
| Default mode | best-effort (can be evicted) | best-effort (can be evicted) |
| Eviction under pressure | yes, LRU by origin | yes, LRU by origin, persistent origins skipped |
| **Time-based eviction** | **yes: 7 days of Safari use without user interaction** (tracking prevention on) | none |
| `navigator.storage.persist()` | supported (15.2+), granted by heuristic, no prompt | supported, granted by heuristic (engagement, bookmarked or installed, notification permission), no prompt |
| What eviction deletes | everything for the origin at once (all-or-nothing) | the same |

Sources: [WebKit: Updates to Storage Policy (Safari 17)](https://webkit.org/blog/14403/updates-to-storage-policy/), [MDN: Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria), [web.dev: Persistent storage](https://web.dev/articles/persistent-storage).

**The 7-day rule.** WebKit's ITP change deletes "all of a website's script-writable storage after seven days of Safari use without user interaction on the site". The affected storage includes IndexedDB, LocalStorage, SessionStorage, and **Service Worker registrations and cache**. Home Screen web apps keep a separate day counter, but that exception doesn't help a site used in a tab. ([WebKit: Full Third-Party Cookie Blocking and More](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)) MDN's current page describes the same rule: it applies when cross-site tracking prevention is on, and server-set cookies are exempt.

Points that follow from this:

- The count is **days of Safari use**, not calendar days. A phone that rarely opens Safari runs out the clock slowly. A heavy Safari user who never visits SafeSteps loses the cache in about a week.
- Each tap on the site resets the counter, so regular users keep their cache.
- `persist()` is worth calling because it costs nothing. On iOS, though, the WebKit storage post names "opened as a Home Screen Web App" as a heuristic for granting it, so a site used only in a tab should expect it may be **denied**. Persistent mode also only protects against pressure eviction. Whether it overrides the ITP 7-day rule is not documented.
- **Is 8 guides plus images "safe"?** On quota, yes, by a wide margin. On eviction, the answer is "yes while the user keeps visiting". A guarantee isn't possible.

## 3. localStorage and IndexedDB for "Saved on this phone only"

- On iOS Safari, these fall under the same 7-day script-writable rule as the cache. ([WebKit 2020](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/))
- On both browsers, the user deletes them by clearing site data or browsing history. Private or incognito tabs throw them away when the session ends. ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria))
- On Chrome, they last until storage pressure triggers LRU eviction, which the Chrome team reports "very rarely" happens to sites people visit regularly. (same MDN page)
- So contacts that live only on the phone **will disappear on iPhones after a stretch of not using the site**. For logged-in users, the server copy (`/prepare/contacts`) should be the source of truth, and the local copy should be a cache of it.

## 4. `tel:` links from the mobile browser

- `<a href="tel:1122">` is a standard link. On cellular devices it starts a call. ([MDN: `<a>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a))
- On iOS, tapping a `tel:` link shows a **confirmation alert**, and the number is dialled only after the user accepts. Numbers containing `*` or `#` are not dialled. On a device with no Phone app (iPad, iPod), iOS shows a warning. ([Apple: Phone Links](https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/PhoneLinks/PhoneLinks.html))
- Safari auto-detects phone-like text and turns it into links. `<meta name="format-detection" content="telephone=no">` turns that off so that only our explicit links can be tapped. (same Apple page)
- A `tel:` link needs no network, so the Help button works offline as long as the page itself loaded (from cache).
- Make the tap target at least 44×44 CSS px, and show the number in the link text. (MDN `<a>`)

## Implications for screens

- **No install screen.** None is needed, and none is in scope. Offline works in a tab.
- **The offline chip must not promise more than the browser guarantees.** Honest options:
  - When online and the precache has finished: "Guides saved for offline use on this phone". This is better than "Works offline anytime".
  - When offline: "You're offline. Showing saved guides."
  - Drive the chip from a real check (`caches.match()` on the guide URLs), never from an assumption. If the cache is missing, say so: "Guides not saved yet. Connect once to save them."
- **Warning text (short, shown once or in an info sheet):** "Saved guides can be deleted if you clear your browser data, use private browsing, or (on iPhone) don't open SafeSteps for a while. Open it now and then to keep them."
- **Saved Contacts:** label any local-only contact "Saved on this phone only. It may be lost if browser data is cleared." For logged-in users, sync to the server and keep the local copy as a fallback.
- **The Help / Call 1122 button** must not depend on the network or on JS state. Use a plain `<a href="tel:1122">`, and expect the iOS confirmation alert in demos and tests.
- **Testing:** on an iPhone, open the site once online, switch to airplane mode, and reload every guide and Emergency Mode. Test in a non-private tab.
