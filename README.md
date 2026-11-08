# pausepoint
HackUTD 2026 T-Mobile Track: a planned web app that explains scam warning signs and guides users through safe verification and recovery steps.


**Pause. Verify. Take the next step.**

PausePoint is a solo HackUTD 2026 project for the **T-Mobile Track**. It aims to help people understand suspicious messages and choose safer actions.

## Project status

Initial planning stage. This repository currently documents the project concept. Application code, setup instructions, and evaluation results will be added as development progresses.

## The problem

Scam messages pressure people to act quickly. A warning alone can leave someone unsure how to verify a request or what to do if they have already clicked, shared information, or sent money.

## Planned prototype

The first version will focus on:

- Bank impersonation.
- Fake delivery fees.
- Verification-code theft.

The planned user flow is:

1. Paste a synthetic message or choose a sample.
2. Review potential warning signs and plain-language explanations.
3. Get guidance for independently verifying the request.
4. Choose “I already interacted” for recovery guidance based on what happened.

## Privacy and uncertainty

The prototype is intended to:

- Use synthetic examples for development and demonstrations.
- Avoid storing submitted messages by default.
- Keep suspicious message links non-clickable.
- Communicate detection limitations.
- Avoid treating an unflagged message as proof of safety.

These are design goals pending implementation and verification.

## Technology

JavaScript is planned for the initial web prototype. Additional technologies and any integration with T-Mobile’s supplied baseline classifier will be documented once implemented.

## Development checklist

- [x] Define the concept and initial scope.
- [ ] Build the message-review interface.
- [ ] Implement and document the detection approach.
- [ ] Add verification and recovery guidance.
- [ ] Evaluate on synthetic examples, including legitimate messages.
- [ ] Document false alarms, missed scams, and limitations.
- [ ] Add setup instructions and a demo.

## AI assistance

Codex was used to help scope the project and draft initial documentation. This disclosure will be updated as development progresses.
