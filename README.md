# PausePoint

**Pause. Verify. Take the next step.** A solo HackUTD 2026 T-Mobile-track prototype.

## Working features
- Browser-local, explainable message analysis with highlighted evidence; never returns a safe verdict or invented probability.
- Guided independent verification for banks, deliveries, accounts, and unfamiliar contacts.
- Six recovery situations with official consumer resources and downloadable action plans that exclude original messages.
- Interactive Test Lab showing the 30-case regression set and 24-case additional synthetic development set, with per-case outcomes.
- Responsive, keyboard-accessible interface; no dependencies, API keys, account registration, message storage, or external AI calls.

## Run locally
Requires Node.js 18+.

```sh
npm start
```
Open http://127.0.0.1:4173. Static deployment: serve the `dist/` folder over HTTP. No build/install step.

```sh
npm test
npm run evaluate
```

## Evaluation and limits
27 behavioral tests pass. Original 30-case regression set: **v1 flagged 9/16 scam cases with 1/10 legitimate cases flagged; v2 flags 16/16 with 0/10 legitimate cases flagged.** Four ambiguous cases remain unscored. Additional 24-case prospective development set: **12/12 scams flagged, 0/10 legitimate cases flagged, 2 ambiguous unscored.** High/review count as flagged. This is a development check, not a real-world accuracy estimate. Original cases informed v2 and are now regression tests. Additional cases were written before v2 edits by the same AI-assisted author; neither set is a blinded or externally validated benchmark. See docs/evaluation-results.json and docs/EVALUATION-NOTES.md.

Detection uses English text rules and limited Spanish transfer/code patterns, not a trained model. V2 normalizes common leetspeak, selected Unicode lookalikes, accents and invisible characters while mapping evidence to original text. It cannot authenticate senders, inspect destinations, detect all scams or languages, block messages, recover accounts, or submit reports. T-Mobile's supplied dataset/classifier are not integrated because their files have not been provided. No sponsor endorsement is implied.

## Privacy
Message text stays in runtime memory in the browser and is rendered as text, not HTML. No localStorage, cookies, analytics or message uploads are used by the application. Clear all resets the entered message and analysis. Hosting infrastructure may collect ordinary request metadata; external resource sites have their own policies. Downloaded plans exclude the original message.

## Two-minute demo
1. Choose Bank impersonation, then Find warning signs.
2. Explain the highlighted safe-account phrase; show Help me verify and select bank.
3. Open Recovery plan, choose I sent money, show sourced next steps and download.
4. Try Routine reminder: no strong cues never means safe.
5. Run both Test Lab sets, compare the v1 baseline, and explain that small synthetic results do not guarantee real-world detection.

Keyboard: use Tab to move between controls, Enter/Space to activate buttons, and Command/Ctrl+Enter in the message editor to analyze. Results and selected recovery plans receive focus; Escape closes the privacy dialog. Motion follows the device's reduced-motion preference.

The local UI pass is documented in [docs/UI-PASS.md](docs/UI-PASS.md), including validation limits and a short presentation script. Local changes do not update GitHub or the private Sites deployment.

## Architecture
`dist/app.js`: UI and verification workflow. `dist/engine.js`: pure rule engine. `dist/recovery.js`: fixed sourced guidance. `tests/`: behavior tests and synthetic development datasets. `server.mjs`: local static preview only.

## AI assistance
Codex assisted with planning, writing and implementing the interface, detector, recovery content, tests, documentation, and synthetic evaluation cases. The evaluation cases were authored separately from the detector implementation using AI assistance; this is not a human-labeled external benchmark. The participant should review and understand the code before presenting. No generative model runs in the product.

## Before final submission
Record a working demo, update Devpost's story and technology/AI disclosures, review sponsor instructions, and ensure judges can access the chosen demo hosting. The Sites preview is owner-private; it is not a public judge link.
