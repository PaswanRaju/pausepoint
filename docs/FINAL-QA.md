# Final prototype checks — November 8, 2026

Checked the running local application in a real browser after the UI pass.

- All 27 automated detector tests pass.
- Original development set: 16/16 scam examples flagged, 0/10 legitimate examples flagged, four ambiguous unscored. Additional set: 12/12, 0/10, two ambiguous unscored. These are synthetic development results, not real-world accuracy.
- All four sample buttons load and analyze: bank and code theft give high concern; delivery gives review; routine reminder gives uncertain, never safe.
- All four verification categories show independent contact routes. Checking the completion box explicitly says the sender has not been verified.
- All six recovery choices show their corresponding plan, steps, and official source links.
- Downloaded the money-recovery action plan and inspected the actual text file: readable line breaks, official resources, no original message.
- Both Test Lab datasets run in the browser with 30 and 24 result rows. Switching datasets clears previous results.
- Clear all resets the message and disables analysis until input is present.
- Command+Enter runs analysis; Escape closes the privacy dialog. Result and page headings receive focus.
- An HTML-like message renders as literal text; it creates no image element.
- Desktop layout inspected at 1440px; phone layout at 390px. All three pages checked at 320px with no page-level horizontal overflow. Test Lab uses its own scrollable table.

No broken core demo flow was found during these checks. README wording was corrected to remove outdated claims that the synthetic cases were independent.

Limits: this is targeted browser QA, not an exhaustive accessibility, browser compatibility, penetration, or real-world scam-detection audit. External resource destinations were not revalidated in this pass. The historical UI-PASS.md describes what that earlier session could verify; this document records the later browser checks.
