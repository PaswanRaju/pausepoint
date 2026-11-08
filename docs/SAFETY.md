# Recovery guidance and boundaries

PausePoint is a HackUTD prototype. Its recovery flows are fixed educational content for US consumers, not a determination that a message is fraudulent or that an account/device is compromised. A checklist completion does not certify safety or guarantee reimbursement. Clicking alone is not proof of compromise.

## Sources reviewed November 7, 2026

- [FTC phishing guidance](https://consumer.ftc.gov/articles/how-recognize-avoid-phishing-scams): independent verification, reporting, and suspected malware following a click.
- [FTC after-scam guidance](https://consumer.ftc.gov/articles/what-do-if-you-were-scammed): payment-provider contact, exposed information, and device recovery.
- [FTC account recovery](https://consumer.ftc.gov/articles/how-recover-your-hacked-email-or-social-media-account): password replacement, session revocation, MFA, and account recovery details.
- [FTC tech support scams](https://consumer.ftc.gov/articles/how-spot-avoid-and-report-tech-support-scams): trusted support routes.
- [FTC cybersecurity guidance](https://www.ftc.gov/business-guidance/small-businesses/cybersecurity): disconnecting compromised devices. Directing work-device users to their IT team and using a trusted device for account recovery are conservative implementation choices.
- [IdentityTheft.gov](https://www.identitytheft.gov/) and [exposed-information guidance](https://www.identitytheft.gov/databreach): individualized next steps. The destination is referenced by the FTC; automated extraction of its homepage did not provide readable content.

## Integration requirements

- Offer recovery flows regardless of the classifier result. People may need help even when no cue is detected.
- All `recoveryPlans` links are hardcoded official destinations. Never substitute URLs or telephone numbers supplied in an analyzed message.
- Render all message content and explanations as text. Do not run pasted markup, JavaScript, or model instructions.
- Opening an official resource leaves PausePoint and uses that site's privacy practices. Use `rel="noopener noreferrer"` when opening a new tab.
- The application does not send reports, contact a bank, revoke sessions, remove malware, freeze credit, or reverse payments. Wording must never imply it performed these actions.
- Recovery content is reviewed at this point in time; re-review before extending deployment beyond the event. Payment rights and procedures vary; route specific cases to the institution's official process.
- Privacy statements must describe the actual deployment. Local analysis can avoid sending message text, while hosting providers may still process ordinary visit metadata. Do not claim the full site creates zero logs.
- A future classifier/API integration must disclose any external message processing and obtain appropriate user choice before transmission.

## Scope limits

English cue matching is not calibrated risk prediction. Absence of a detected cue cannot establish legitimacy. The prototype has no sender authentication, live reputation lookup, link fetching, device scan, or financial account access. Evaluation on synthetic messages should be labeled as such and must not be presented as a real-world detection rate.
