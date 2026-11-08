// Fixed, reviewed guidance. Never interpolate contact information from a message.
const phishing = { label: 'FTC: Recognize and report phishing', url: 'https://consumer.ftc.gov/articles/how-recognize-avoid-phishing-scams' };
const scammed = { label: 'FTC: What to do after a scam', url: 'https://consumer.ftc.gov/articles/what-do-if-you-were-scammed' };
const accounts = { label: 'FTC: Recover a hacked account', url: 'https://consumer.ftc.gov/articles/how-recover-your-hacked-email-or-social-media-account' };
const identity = { label: 'IdentityTheft.gov: Personal recovery guidance', url: 'https://www.identitytheft.gov/' };
const tech = { label: 'FTC: Tech support scams', url: 'https://consumer.ftc.gov/articles/how-spot-avoid-and-report-tech-support-scams' };
const business = { label: 'FTC: Responding to device compromise', url: 'https://www.ftc.gov/business-guidance/small-businesses/cybersecurity' };

export const recoveryPlans = {
  none: {
    title: 'Pause before you respond',
    intro: 'You can verify a request without engaging with the sender.',
    steps: [
      { title: 'Keep the message at a distance', detail: 'Avoid its links, attachments, phone numbers, and requests for information.' },
      { title: 'Check through a channel you already trust', detail: 'Open the official app yourself or use a company number you know is genuine.' },
      { title: 'Report suspected phishing', detail: 'Forward suspicious US texts to 7726, or use ReportFraud.ftc.gov. This app does not submit reports for you.' }
    ],
    sources: [phishing]
  },
  clicked: {
    title: 'Let’s check what happened',
    intro: 'Opening a link alone does not prove your device or account was compromised.',
    steps: [
      { title: 'Close the suspicious page', detail: 'Stop interacting with it. Do not enter information or approve a download.' },
      { title: 'Check for a download or installation', detail: 'If you suspect harmful software was downloaded, update your security software and run a scan. Follow its removal instructions.' },
      { title: 'Choose any other actions that apply', detail: 'If you also shared credentials, sent money, or granted device access, use that recovery plan too.' }
    ],
    sources: [phishing]
  },
  credentials: {
    title: 'Secure the affected account',
    intro: 'Sharing a password or sign-in code calls for prompt account protection.',
    steps: [
      { title: 'Use the service’s official recovery route', detail: 'Open its app or known website independently. If you cannot sign in, follow the provider’s account-recovery process.' },
      { title: 'Replace the password', detail: 'Choose a unique password. Change it on any other account where you reused it.' },
      { title: 'End other sessions and add protection', detail: 'Sign out of other devices where available, and enable multi-factor authentication.' },
      { title: 'Check recovery details and activity', detail: 'Review recovery email addresses, phone numbers, and recent activity. Follow the provider’s instructions for changes you do not recognize.' }
    ],
    sources: [accounts]
  },
  money: {
    title: 'Contact the payment provider now',
    intro: 'Act quickly. A reversal may be possible, but recovery is not guaranteed.',
    steps: [
      { title: 'Report the transaction directly', detail: 'Contact your bank, card issuer, payment app, or transfer provider using its official app or a known number. Explain what happened and ask about reversal or refund options.' },
      { title: 'Keep transaction evidence', detail: 'Retain receipts and transaction details. For gift cards, keep the card and receipt and contact the issuer.' },
      { title: 'File a fraud report', detail: 'Use ReportFraud.ftc.gov. Reporting does not itself reverse a payment.' }
    ],
    sources: [scammed, { label: 'Report fraud to the FTC', url: 'https://reportfraud.ftc.gov/' }]
  },
  identity: {
    title: 'Protect the information you shared',
    intro: 'The next steps depend on which information was exposed.',
    steps: [
      { title: 'Get guidance for the information involved', detail: 'Visit IdentityTheft.gov for a personal recovery plan. Do not enter identity details into PausePoint.' },
      { title: 'If information was exposed but misuse is uncertain', detail: 'Use IdentityTheft.gov/databreach for protective steps matched to the exposed information.' },
      { title: 'Address account access or payments too', detail: 'If you also shared a password or sent money, follow the corresponding account or payment plan.' }
    ],
    sources: [identity, { label: 'IdentityTheft.gov: Exposed information', url: 'https://www.identitytheft.gov/databreach' }, scammed]
  },
  remote: {
    title: 'Protect your device and accounts',
    intro: 'Take one step at a time. A trusted support professional can help.',
    steps: [
      { title: 'End the remote session', detail: 'Disconnect the affected device from the network to interrupt access. For a work device, contact your organization’s IT team.' },
      { title: 'Seek help through a trusted route', detail: 'Contact the device manufacturer or a support provider you know. Avoid contact details from the suspicious message or pop-up.' },
      { title: 'Check and secure the device', detail: 'Update security software, scan for malware, and follow removal guidance. Have unfamiliar remote-access software reviewed.' },
      { title: 'Protect affected accounts', detail: 'From a trusted device, change compromised passwords and enable multi-factor authentication. Use the payment plan if money was sent.' }
    ],
    sources: [business, tech, scammed]
  }
};
