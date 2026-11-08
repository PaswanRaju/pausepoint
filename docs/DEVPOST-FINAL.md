# Final Devpost copy

Review these statements against the app you present. Replace the concept video with a recording of the working app. Do not describe localhost or the owner-private Sites preview as a public demo.

## Project name
PausePoint

## Pitch
Pause before a scam becomes a loss. Understand warning signs, verify through a trusted channel, and find a practical recovery plan—all with browser-local analysis.

## Built with
JavaScript, HTML5, CSS3, Node.js

## Project story (paste the sections below)

## Inspiration
Scam messages pressure people to act before they have time to think. A warning alone can leave someone asking, “What should I do now?” As a solo participant, I focused PausePoint on that moment: help someone pause, understand the warning, and take a safer next step.

## What it does
PausePoint checks message text for scam-related cues and highlights the exact wording behind each warning. It then guides users toward independent verification through a contact route they already trust. If they have already clicked, shared a password, sent money, shared identity information, or allowed device access, six recovery situations offer practical steps and official consumer resources. Users can download a plan without including the original message.

Analysis runs locally in the browser. The app does not upload or store messages, open suspicious links, or generate a fake confidence percentage. “No strong cues” means uncertain, never verified safe. An interactive Test Lab exposes individual results and evaluation limitations.

## How we built it
I built a dependency-free HTML, CSS, and JavaScript app, with Node.js for local serving and automated tests. The detector uses deterministic rules, contextual suppression for some educational or negated wording, and normalization for common obfuscations while mapping highlights back to the original text. Recovery content uses fixed guidance linked to official U.S. consumer resources. Codex assisted extensively with planning, code, design, documentation, tests, and synthetic examples. No generative model or external AI API runs during analysis.

## Challenges we ran into
Scam-like language also appears in legitimate reminders, security education, and ordinary payments. I needed to improve detection without treating every suspicious phrase as proof of fraud. Another challenge was turning classification into usable next steps while clearly explaining what the app cannot verify. The supplied T-Mobile dataset and baseline classifier were not available to me, so the prototype uses clearly labeled synthetic development sets instead.

## Accomplishments that we're proud of
The prototype connects evidence, independent verification, and recovery in one usable flow. It has 30 passing automated behavioral tests. On the original 30 synthetic development cases, v1 flagged 9 of 16 scam examples and flagged 1 of 10 legitimate examples; v2 flags 16 of 16 and 0 of 10. An additional 24-case development set gives 12 of 12 and 0 of 10. Ambiguous cases remain unscored. These are development results, not real-world accuracy claims: the original cases informed v2, and the additional cases were authored with AI assistance before those edits, not independently validated.

## What we learned
Scam protection needs more than a label. Clear explanations, independent contact routes, and calm recovery guidance make a warning useful. Privacy can also be a design decision from the beginning: local processing avoids sending a user's message to an analysis service. Honest evaluation requires documenting both the test set's origin and its limits.

## What's next for PausePoint
Evaluate on larger, independently labeled datasets; integrate the supplied T-Mobile materials if available; improve multilingual and subtle social-engineering coverage; and conduct usability testing with people who would benefit from clearer verification guidance. Any future model integration should preserve privacy and be evaluated against the transparent local baseline.

## Additional-info answers

Technology experience: I used JavaScript, HTML, and CSS for a browser-local prototype and Node.js for previewing and testing. The dependency-free approach made the project easy to run, while accessible interactions and honest error states required careful review. Codex helped implement and evaluate the prototype; I am reviewing its behavior and limitations before presenting.

GenAI tools used: Codex; ChatGPT if that matches the tools you actually used. Provider: OpenAI.

How GenAI was used: I used Codex for project planning, implementation, UI iteration, tests, documentation, and synthetic evaluation examples. I selected it to help me build and review a scoped solo prototype. AI assistance was substantial and is disclosed in the repository. No generative model runs in the app.

Did you implement a generative AI model or API? N/A. Generative AI assisted development, but the application's analysis uses local deterministic rules and does not call a generative AI API.

Sponsor prize: T-Mobile Track. HackUTD special track: None unless intentionally entering one eligible special track. Do not select the first-time-hacker checkbox: this is your second hackathon.

School: enter your actual school; do not infer it from the event location. GoDaddy domains and Gemini project number: leave blank if not applicable.

## Two-minute recording and presentation

0:00–0:15: Introduce the problem: “Scam warnings often stop at a label. PausePoint helps people decide what to do next.”

0:15–0:40: Bank impersonation → Find warning signs. Show the highlighted safe-account transfer request. “The browser checks written cues locally and explains the warning; it cannot authenticate the sender.”

0:40–1:00: Help me verify → My bank or payment provider. Show the independent contact route and the explicit reminder that the sender is not verified.

1:00–1:25: Recovery plan → I sent money → Download. “Recovery guidance gives concrete steps and official resources. The downloaded plan excludes the original message.”

1:25–1:40: Routine reminder → Analyze. “Uncertain is never a guarantee of safety.”

1:40–2:00: Test Lab → Run selected test set. “These are small synthetic development sets, not a real-world accuracy estimate. The app is a prototype, built with extensive AI coding assistance.”

## Final checklist
- Public GitHub repository contains dist/app.js, dist/engine.js, dist/index.html, tests, and setup instructions.
- Chosen demo URL opens for judges without your account; otherwise demonstrate locally and state the hosting limitation.
- Working demo video uploaded to YouTube with public or unlisted visibility and its exact URL added to Devpost.
- Updated screenshots show actual working features.
- Project story and AI disclosure match the final app.
- Devpost still shows Submitted after saving edits, before the organizer deadline.
- Be present for in-person judging and practice explaining the rules, evaluation limits, and privacy decisions.
