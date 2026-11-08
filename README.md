# PausePoint

**Pause. Verify. Take the next step.** A solo HackUTD 2026 T-Mobile-track prototype.

## Working features
- Browser-local, explainable message analysis with highlighted evidence; never returns a safe verdict or invented probability.
- Guided independent verification for banks, deliveries, accounts, and unfamiliar contacts.
- Six recovery situations with official consumer resources and downloadable action plans that exclude original messages.
- Interactive Test Lab showing all 30 independent synthetic cases, including misses and false alarms.
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
20 behavioral tests pass. Separately authored synthetic set: **9/16 scam cases flagged, 7 missed; 1/10 legitimate cases flagged; 4 ambiguous cases unscored.** High/review count as flagged. This is a development check, not a real-world accuracy estimate. Cases were not used to tune the first engine. See docs/evaluation-results.json and docs/EVALUATION-NOTES.md.

Detection uses English text rules, not a trained model. It cannot authenticate senders, inspect destinations, detect all scams or languages, block messages, recover accounts, or submit reports. T-Mobile's supplied dataset/classifier are not integrated because their files have not been provided. No sponsor endorsement is implied.

## Privacy
Message text stays in runtime memory in the browser and is rendered as text, not HTML. No localStorage, cookies, analytics or message uploads are used by the application. Clear all resets the entered message and analysis. Hosting infrastructure may collect ordinary request metadata; external resource sites have their own policies. Downloaded plans exclude the original message.

## Two-minute demo
1. Choose Bank impersonation, then Find warning signs.
2. Explain the highlighted safe-account phrase; show Help me verify and select bank.
3. Open Recovery plan, choose I sent money, show sourced next steps and download.
4. Try Routine reminder: no strong cues never means safe.
5. Run Test lab, acknowledge misses and explain why independent verification remains essential.

## Architecture
`dist/app.js`: UI and verification workflow. `dist/engine.js`: pure rule engine. `dist/recovery.js`: fixed sourced guidance. `tests/`: behavior tests and independent dataset. `server.mjs`: local static preview only.

## AI assistance
Codex assisted with planning, writing and implementing the interface, detector, recovery content, tests, documentation, and synthetic evaluation cases. The evaluation cases were authored separately from the detector implementation using AI assistance; this is not a human-labeled external benchmark. The participant should review and understand the code before presenting. No generative model runs in the product.

## Before final submission
Record a working demo, update Devpost's story and technology/AI disclosures, review sponsor instructions, and ensure judges can access the chosen demo hosting. The Sites preview is owner-private; it is not a public judge link.
