# PausePoint synthetic evaluation notes

## Purpose and provenance

`tests/evaluation-cases.json` contains 30 AI-assisted synthetic messages: 16 scam scenarios, 10 legitimate scenarios, and 4 ambiguous scenarios. They were written independently of the detection engine; the dataset author did not inspect or run the engine while selecting examples. No messages are real customer data. Names, codes, amounts, and `.example` URLs are fictitious.

These are development challenge cases, not a representative sample of real messages, an externally validated benchmark, or a substitute for testing on the sponsor's supplied dataset. Independence here means authoring without inspecting the engine, not a statistically independent or permanently held-out test set. Once results inform engine changes, describe this set as a regression/development suite.

## Labels and interpretation

- `scam`: the authored scenario has fraudulent intent. Some cases deliberately provide little evidence in the message itself.
- `legitimate`: the author intended an ordinary or educational message. This does not prove that any real message with the same text is authentic.
- `ambiguous`: the content does not justify a binary judgment without sender, relationship, or account context.

A message can contain no recognized warning signs and still be fraudulent. The subtle vendor-payment case deliberately illustrates this. A benign safety reminder can contain many scam-related words. An authentication code in an expected message is different from an instruction to disclose that code to another person.

## Coverage

The cases include three variations of bank safe-account transfer scams, three requests for authentication codes, two delivery-fee scams, gift-card and cryptocurrency payments, unsolicited remote access, an advance-fee prize, obfuscated spelling, Spanish text, indirect payment diversion, and instructions intended to manipulate an AI analyzer. Benign cases cover negation, quoted scam phrases, code notifications, a meeting link, appointments, delivery, and payroll. Ambiguous cases probe the limits of content-only assessment.

## Reporting results

When the parent application integrates this dataset, report actual counts and the exact mapping from engine levels to evaluation decisions. Do not silently count `unknown` as “safe.” A useful diagnostic is whether `high` or `review` counts as a warning, with scam cases receiving no warning reported as misses and legitimate cases receiving a warning reported as false alarms. Also report `high` separately so an informational review is not confused with a severe warning. Keep ambiguous cases separate from binary precision and recall.

State denominators. If reporting precision or recall, calculate them from explicit TP/FP/FN counts and explain that they apply only to this small synthetic collection. Mark metrics with zero denominators as undefined. Include per-case outputs, especially failures and out-of-scope cases. Do not present headline “accuracy” as a real-world safety claim.

## Limitations to preserve in the demo

- Small, intentionally adversarial collection with no estimate of real-world scam prevalence.
- Labels rely on authored intent, not verified sender provenance.
- No URL reputation, account history, message metadata, attachment analysis, or device inspection.
- English-focused detection may miss other languages; Spanish examples expose that limitation rather than claim language support.
- Obfuscation, paraphrases, contextual negation, and quoted content can defeat rules.
- Prompt-injection text must remain untrusted data and must not alter analyzer behavior.
- Recovery guidance and detection quality are distinct concerns and should be reviewed separately.

## Results

V1 baseline is preserved in evaluation-baseline-v1.json and tests/baseline-engine-v1.js. V2 original results: 16/16 scams flagged, 0/10 legitimate cases flagged, 4 ambiguous unscored. The original set now informs implementation and is a regression set. The additional 24 cases were authored before v2 edits by the same AI-assisted author: 12/12 scams flagged, 0/10 legitimate flagged, 2 ambiguous unscored. It is prospective development coverage, not independent validation. All high/review outputs count as flagged; payment-detail changes remain review-level only. See evaluation-results.json and evaluation-fresh-v2.json.
