/**
 * PausePoint's transparent, browser-local cue detector.
 * No network requests, model calls, storage, probabilities, or sender verification.
 * These heuristics identify wording worth checking; they do not establish fraud.
 */
export const MAX_MESSAGE_LENGTH = 5000;

const BASE_LIMITATIONS = [
  'This is a rule-based prototype, not a trained classifier. Risk level describes the detected request, not certainty that the sender is fraudulent.',
  'It cannot authenticate senders, inspect destinations, verify account activity, or detect every scam. A message with no detected cues is not verified safe.',
  'The current rules target English wording. Quoted warnings, sarcasm, other languages, and unfamiliar wording can produce false alarms or missed scams.'
];
const VERIFY = [
  'Pause before replying, paying, or sharing information.',
  'Open the organization’s official app yourself, or use contact details you independently know are genuine. Do not rely on a link or number in this message.',
  'If the request is unexpected, ask the organization to confirm it through that separate channel.'
];

const RULES = [
  {
    id: 'safe-account', label: '“Safe account” money-transfer request', category: 'Bank impersonation pattern', severity: 'high',
    pattern: /\b(?:transfer|move|send|deposit)\b[^.!?\n]{0,85}\b(?:safe|secure|protected|holding)\s+(?:bank\s+)?account\b/gi,
    explanation: 'A request to move money to a supposedly safe account is a serious warning sign. Verify directly with your bank before taking any action.',
    steps: ['Do not make the requested transfer while the request is unverified.', 'Contact your bank through its official app or the number printed on your card.']
  },
  {
    id: 'secret-request', label: 'Request for a password or security code', category: 'Credential or verification-code theft pattern', severity: 'high',
    pattern: /\b(?:share|send|tell|give|provide|forward|reply\s+with|respond\s+with|confirm|enter|submit)\b[^.!?\n]{0,60}\b(?:password|passcode|PIN|OTP|one[- ]time(?:\s+(?:verification|security))?\s+(?:code|password)|(?:verification|security|authentication|login|six[- ]digit|6[- ]digit)\s+code|recovery\s+(?:code|phrase)|seed\s+phrase)\b/gi,
    explanation: 'This wording asks for an account secret. Someone who obtains a security code or password may be able to access your account. Context matters; an expected login you initiated is different from an unsolicited request.',
    steps: ['Do not send passwords, one-time codes, or recovery phrases to the person who contacted you.', 'If you initiated a login, return to the official app or site independently to check what it requires.']
  },
  {
    id: 'remote-access', label: 'Request to install remote-access software', category: 'Remote-access support pattern', severity: 'high',
    pattern: /\b(?:install|download|run|open|enable|grant|allow)\b[^.!?\n]{0,65}\b(?:AnyDesk|TeamViewer|RustDesk|remote\s+(?:access|control|desktop)|screen[- ]sharing|QuickSupport)\b/gi,
    explanation: 'Remote-access tools can give someone control of your device. An unexpected support request involving these tools deserves independent verification.',
    steps: ['Do not grant remote control to an unverified caller or message sender.', 'Contact the company through an independently verified support channel.']
  },
  {
    id: 'delivery-fee', label: 'Delivery or redelivery payment request', category: 'Delivery-fee scam pattern', severity: 'review',
    pattern: /\b(?:pay|payment|fee|charge|update\s+(?:your\s+)?(?:card|payment))\b[^.!?\n]{0,70}\b(?:delivery|redelivery|shipping|postage|parcel|package|customs)\b|\b(?:delivery|redelivery|shipping|postage|parcel|package|customs)\b[^.!?\n]{0,70}\b(?:pay|payment|fee|charge|card\s+details)\b/gi,
    explanation: 'Unexpected delivery-fee messages can be used to collect payment details. Real charges can also exist; verify the shipment and charge with the carrier independently.',
    steps: ['Check the shipment in the carrier’s official app or website, opened independently.', 'Verify any charge before entering payment or address information.']
  },
  {
    id: 'gift-card', label: 'Gift-card payment or code request', category: 'Unusual payment pattern', severity: 'review',
    pattern: /\b(?:pay|payment|purchase|buy|send|provide|share)\b[^.!?\n]{0,60}\b(?:gift\s*cards?|gift[- ]card\s+(?:codes?|numbers?))\b|\bgift[- ]?\s*card\b[^.!?\n]{0,40}\b(?:codes?|numbers?)\b/gi,
    explanation: 'Gift-card payments and requests for their codes can be difficult to reverse. A request from an unexpected sender should be verified before buying or sharing anything.',
    steps: ['Do not share gift-card numbers or PINs with an unverified sender.', 'Confirm the request independently, especially if it claims to come from a boss, friend, or authority.']
  },
  {
    id: 'crypto-payment', label: 'Cryptocurrency payment request', category: 'Unusual payment pattern', severity: 'review',
    pattern: /\b(?:pay|send|transfer|deposit|payment)\b[^.!?\n]{0,65}\b(?:bitcoin|BTC|cryptocurrency|crypto|USDT|ethereum|ETH|wallet\s+address)\b/gi,
    explanation: 'Cryptocurrency payment requests are not automatically scams, but transfers can be difficult to reverse. Verify the recipient and reason independently.',
    steps: ['Pause before sending cryptocurrency; do not act on pressure or promises of guaranteed returns.', 'Confirm the recipient and request using a separate, trusted channel.']
  },
  {
    id: 'pressure', label: 'Urgency or threatened consequences', category: 'Pressure to act', severity: 'review',
    pattern: /\b(?:act\s+now|immediately|urgent(?:ly)?|within\s+\d+\s+(?:minutes?|hours?)|(?:account|access|service)\s+(?:(?:will|may)\s+be\s+|is\s+|has\s+been\s+)?(?:suspended|blocked|locked|closed|disabled)|(?:avoid|face|risk)\s+(?:arrest|suspension|closure|legal\s+action)|final\s+warning)\b/gi,
    explanation: 'Time pressure or threatened consequences can discourage you from checking a request. These phrases also occur in legitimate messages; they are a reason to pause, not proof of a scam.',
    steps: ['Take time to verify the request, even if the message says you must act immediately.']
  }
];

// Suppress instructions framed as warnings, not requests: “never share your code”.
// This is intentionally local to the sentence, and remains a heuristic.
function isNegated(text, start) {
  const sentenceStart = Math.max(text.lastIndexOf('.', start - 1), text.lastIndexOf('!', start - 1), text.lastIndexOf('?', start - 1), text.lastIndexOf('\n', start - 1)) + 1;
  const before = text.slice(Math.max(sentenceStart, start - 100), start);
  return /\b(?:do\s+not|don['’]t|never|not\s+to|avoid|should\s+not|shouldn['’]t|will\s+not|won['’]t)\b[^.!?\n]{0,65}$/i.test(before);
}

/** Analyze up to 5,000 UTF-16 code units. All signal offsets reference the original input. */
export function analyze(input) {
  const raw = typeof input === 'string' ? input : '';
  const text = raw.slice(0, MAX_MESSAGE_LENGTH);
  const limitations = [...BASE_LIMITATIONS];
  if (raw.length > MAX_MESSAGE_LENGTH) limitations.unshift('Only the first 5,000 characters were analyzed. Shorten the message to review the remaining text.');
  const matches = [];
  for (const rule of RULES) {
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    for (const match of text.matchAll(regex)) {
      if (isNegated(text, match.index)) continue;
      matches.push({rule, start:match.index, end:match.index + match[0].length});
    }
  }
  const actionable = matches.some(m => m.rule.id !== 'pressure');
  // URLs alone do not establish risk. Add a URL cue only alongside a detected request.
  if (actionable) {
    const urls = text.matchAll(/\b(?:https?:\/\/|www\.)[^\s<>"']+/gi);
    for (const match of urls) matches.push({
      rule: {id:'message-link', label:'Link supplied by the sender', category:'Unverified link', severity:'context', explanation:'This destination has not been opened or checked. A link alone does not indicate a scam. Verify the request through an independently opened official app or site.', steps:[]},
      start:match.index, end:match.index+match[0].replace(/[.,;!?)]+$/, '').length
    });
  }
  matches.sort((a,b)=>a.start-b.start || b.end-a.end);
  const uniqueRules = [...new Map(matches.map(m=>[m.rule.id,m.rule])).values()];
  const strong = uniqueRules.find(r=>r.severity==='high');
  const reviewed = uniqueRules.filter(r=>r.severity==='review');
  const level = strong ? 'high' : reviewed.length ? 'review' : 'unknown';
  const mainRule = strong || reviewed.find(r=>r.id!=='pressure') || reviewed[0];
  return {
    level,
    category: mainRule?.category || 'No recognized pattern',
    summary: level === 'high' ? 'Pause before taking action. This message contains a request that could expose your money, account, or device.' : level === 'review' ? 'This message contains wording worth checking. Verify the request independently before acting.' : 'No warning pattern was recognized by these limited rules. This does not verify the sender or establish that the message is safe.',
    signals: matches.map(({rule,start,end})=>({id:rule.id,label:rule.label,explanation:rule.explanation,start,end})),
    nextSteps: [...new Set([...(mainRule?.steps || []), ...VERIFY])],
    limitations
  };
}
