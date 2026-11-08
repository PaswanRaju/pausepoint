/**
 * PausePoint's transparent, browser-local cue detector.
 * No network requests, model calls, storage, probabilities, or sender verification.
 * These heuristics identify wording worth checking; they do not establish fraud.
 */
export const MAX_MESSAGE_LENGTH = 5000;

const BASE_LIMITATIONS = [
  'This is a rule-based prototype, not a trained classifier. Risk level describes the detected request, not certainty that the sender is fraudulent.',
  'It cannot authenticate senders, inspect destinations, verify account activity, or detect every scam. A message with no detected cues is not verified safe.',
  'Rules primarily cover English, with limited Spanish transfer/code patterns and common text obfuscation. This is not full multilingual support; sarcasm, quotations, other languages, and unfamiliar wording remain limitations.'
];
const VERIFY = [
  'Pause before replying, paying, or sharing information.',
  'Open the organization’s official app yourself, or use contact details you independently know are genuine. Do not rely on a link or number in this message.',
  'If the request is unexpected, ask the organization to confirm it through that separate channel.'
];

const RULES = [
  {
    id: 'safe-account', label: '“Safe account” money-transfer request', category: 'Bank impersonation pattern', severity: 'high',
    pattern: /\b(?:transfer|move|send|deposit|relocate|withdraw|remit)\b[^.!?\n]{0,85}\b(?:safe|secure|protected|holding)\s+(?:(?:bank|reserve|temporary)\s+)?(?:account|wallet)\b/gi,
    explanation: 'A request to move money to a supposedly safe account is a serious warning sign. Verify directly with your bank before taking any action.',
    steps: ['Do not make the requested transfer while the request is unverified.', 'Contact your bank through its official app or the number printed on your card.']
  },
  {
    id: 'secret-request', label: 'Request for a password or security code', category: 'Credential or verification-code theft pattern', severity: 'high',
    pattern: /\b(?:share|send|tell|give|provide|forward|screenshot|photograph|reply\s+with|respond\s+with|confirm|enter|submit|read\s+(?:back|out)|repeat|dictate)\b[^.!?\n]{0,60}\b(?:password|passcode|PIN|OTP|one[- ]time(?:\s+(?:verification|security))?\s+(?:code|password)|(?:verification|security|authentication|login|six[- ]digit(?:s)?|6[- ]digit(?:s)?)\s+code|(?:six[- ]digit|6[- ]digit|six|6)\s+digits?|recovery\s+(?:code|phrase)|seed\s+phrase)\b|\b(?:what|which)\b[^.\n]{0,35}\b(?:code|number|digits?)\b[^.\n]{0,35}\b(?:received|arrived|sent|texted)\b|\b(?:read|repeat)\s+(?:it|that|them)\s+back\b/gi,
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
    id: 'account-link', label: 'Account verification link request', category: 'Bank or account impersonation pattern', severity: 'review',
    pattern: /\b(?:click|tap|open|follow|use)\b[^.!?\n]{0,55}\b(?:link|url|button)\b[^.!?\n]{0,70}\b(?:verify|confirm|unlock|restore|secure)\b[^.!?\n]{0,55}\b(?:account|identity|card|payment)\b|\b(?:verify|confirm|unlock|restore|secure)\b[^.!?\n]{0,70}\b(?:account|identity|card|payment)\b[^.!?\n]{0,55}\b(?:link|url|button)\b/gi,
    explanation: 'A message that directs you to a supplied link to verify or unlock an account may be impersonating a bank or service. Open the official app or site independently instead.',
    steps: ['Do not use the supplied link to sign in or provide information.', 'Open the organization’s official app or type its known website address yourself to check for alerts.']
  },
  {
    id: 'delivery-fee', label: 'Delivery or redelivery payment request', category: 'Delivery-fee scam pattern', severity: 'review',
    pattern: /\b(?:pay|payment|fee|charge|update\s+(?:your\s+)?(?:card|payment))\b[^.!?\n]{0,70}\b(?:delivery|redelivery|shipping|shipment|postage|parcel|package|customs)\b|\b(?:delivery|redelivery|shipping|shipment|postage|parcel|package|customs)\b[^.!?\n]{0,70}\b(?:pay|payment|fee|charge|card\s+details)\b/gi,
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
    pattern: /\b(?:act\s+now|immediately|urgent(?:ly)?|within\s+\d+\s+(?:minutes?|hours?)|(?:account|access|service)\s+(?:(?:will|may)\s+be\s+|is\s+|has\s+been\s+)?(?:suspended|blocked|locked|closed|disabled)|(?:avoid|face|risk)\s+(?:arrest|suspension|closure|legal\s+action)|final\s+warning|last\s+chance|failure\s+to\s+act)\b/gi,
    explanation: 'Time pressure or threatened consequences can discourage you from checking a request. These phrases also occur in legitimate messages; they are a reason to pause, not proof of a scam.',
    steps: ['Take time to verify the request, even if the message says you must act immediately.']
  }
];


RULES.push(
 {id:'payment-details', label:'Request for payment-card information', category:'Payment information request', severity:'review',
 pattern:/\b(?:enter|submit|send|provide|confirm|update)\b[^.!?\n]{0,60}\b(?:(?:credit|debit)\s+)?card\s+(?:details|number|information)|\b(?:enter|submit|send|provide)\b[^.!?\n]{0,45}\b(?:cvv|cvc)\b/gi,
 explanation:'This requests payment information. A real checkout can do this too; independently verify the organization and the reason before providing details.',steps:['Open the merchant or carrier app independently and verify the charge before entering card details.']},
 {id:'advance-fee', label:'Payment to unlock a prize or reward', category:'Advance-fee pattern',severity:'high',
 pattern:/\b(?:prize|reward|lottery|winnings|won)\b[^!?\n]{0,160}\b(?:pay|send|transfer|deposit)\b[^!?\n]{0,65}\b(?:fee|charge|cost|deposit)|\b(?:pay|send)\b[^!?\n]{0,65}\b(?:fee|charge)\b[^!?\n]{0,90}\b(?:prize|reward|winnings)\b/gi,
 explanation:'Paying first to collect a promised prize or reward is a strong scam warning sign. Do not send money based on the promise.',steps:['Do not pay to unlock a promised prize. Verify the supposed promotion independently.']},
 {id:'changed-payment',label:'Changed payment destination',category:'Payment-diversion verification needed',severity:'review',
 pattern:/\b(?:revised|updated|new|changed)\s+(?:(?:bank|banking|payment)\s+)?(?:account|details|information)\b|\b(?:bank(?:ing)?\s+(?:details|information)|account)\s+(?:has|have)\s+changed\b/gi,
 explanation:'Changed payment details can be legitimate or a sign of invoice diversion. Text alone cannot resolve this. Confirm the change with your established contact before paying.',steps:['Call your established contact using contact details from before the change. Confirm the payment destination independently.']},
 {id:'spanish-secret',label:'Request for a security code (Spanish cue)',category:'Credential disclosure pattern',severity:'high',
 pattern:/\b(?:envia(?:me|nos)?|envie(?:me|nos)?|envienos|comparte|comparta|dime|danos)\b[^.!?\n]{0,65}\b(?:codigo\s+de\s+(?:seguridad|verificacion)|contrasena)\b/gi,
 explanation:'This Spanish wording appears to ask for a password or verification code. Limited language rules can miss context; verify independently.',steps:['Do not send an authentication code or password to the sender. Use the official account app independently.']},
 {id:'spanish-transfer',label:'Protected-account transfer (Spanish cue)',category:'Bank impersonation pattern',severity:'high',
 pattern:/\b(?:transfiera|transfiere|transfieran|mueve|mueva|deposita|deposite)\b[^.!?\n]{0,100}\bcuenta\s+(?:segura|protegida|de\s+reserva)\b/gi,
 explanation:'This Spanish wording requests a transfer into a supposedly safe account. Verify directly with your bank; limited language rules cannot establish intent.',steps:['Do not transfer funds based on the message. Contact your bank using its existing app or the number on your card.']}
);
// Normalize a detection view, retaining a map back to original UTF-16 spans.
function normalizedView(text) {
 const confusable={'а':'a','е':'e','о':'o','р':'p','с':'c','х':'x','у':'y','і':'i','ј':'j','ѕ':'s','Α':'A','Ο':'O','Ρ':'P'};
 let value='',map=[];
 for(let i=0;i<text.length;){const c=String.fromCodePoint(text.codePointAt(i));const end=i+c.length;
  if(!/[\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/u.test(c)) {
   for(const n of c.normalize('NFKD').replace(/[\u0300-\u036f]/g,'')){const out=confusable[n]||n;value+=out;for(let k=0;k<out.length;k++)map.push({start:i,end});}
  }i=end;
 }
 value=value.replace(/\b[a-zA-Z01345]+\b/g,token=>/[a-z]/i.test(token)?token.replace(/[01345]/g,c=>({'0':'o','1':'i','3':'e','4':'a','5':'s'}[c])):token);
 return {value,map};
}
function isNegated(text,start) {
 const cut=Math.max(...['.','!','?','\n',';'].map(x=>text.lastIndexOf(x,start-1)))+1;
 const before=text.slice(Math.max(cut,start-100),start);
 return /\b(?:do\s+not|don['’]t|never|not\s+to|avoid|should\s+not|shouldn['’]t|will\s+not|won['’]t|no|nunca)\b[^.!?;\n]{0,65}$/i.test(before);
}
function educationalQuotation(text,start,end) {
 // Only a bounded quotation with a preceding education cue; not a global allowlist.
 const quotes=/(?<![a-z0-9])["“']([^"”'\n]{3,200})["”'](?![a-z0-9])/gi;
 for(const q of text.matchAll(quotes))if(start>=q.index+1&&end<=q.index+q[0].length){
  const before=text.slice(Math.max(0,q.index-130),q.index);
  if(/\b(?:workshop|lesson|article|training|scams?\s+that\s+say|scammers?\s+(?:may|might)\s+say)\b/i.test(before))return true;
 }
 return false;
}
function suspiciousUrlRule(rawUrl) {
  const candidate = rawUrl.match(/^[a-z]+:\/\//i) ? rawUrl : `https://${rawUrl}`;
  if (!URL.canParse(candidate)) return null;
  const url = new URL(candidate);
  const host = url.hostname.toLowerCase();
  if (url.username || url.password) return {id:'suspicious-link-structure',label:'Link uses hidden username or password text',category:'Suspicious link structure',severity:'review',explanation:'This link contains text before the host that can disguise the real destination. Do not open it; use the organization’s official app or site independently.',steps:['Do not open this link or enter credentials into it. Open the official app or type the known website address yourself.']};
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return {id:'suspicious-link-structure',label:'Link uses a numeric IP address',category:'Suspicious link structure',severity:'review',explanation:'A login or payment link using a bare IP address is unusual and can indicate a phishing page. The destination has not been verified.',steps:['Do not open the link. Visit the organization through its official app or a known website address.']};
  if (host.startsWith('xn--') || host.includes('.xn--')) return {id:'suspicious-link-structure',label:'Link uses an encoded internationalized domain',category:'Suspicious link structure',severity:'review',explanation:'Encoded domain labels can make a look-alike address harder to recognize. The domain has not been verified.',steps:['Do not rely on the displayed link. Open the organization’s official app or type its known address yourself.']};
 return null;
}
export function analyze(input) {
 const raw=typeof input==='string'?input:'';const text=raw.slice(0,MAX_MESSAGE_LENGTH);
 const {value,map}=normalizedView(text);const limitations=[...BASE_LIMITATIONS];
 if(raw.length>MAX_MESSAGE_LENGTH)limitations.unshift('Only the first 5,000 characters were analyzed. Shorten the message to review the remaining text.');
 const matches=[];
 for(const rule of RULES)for(const match of value.matchAll(new RegExp(rule.pattern.source,rule.pattern.flags))){
  const a=match.index,b=a+match[0].length;
  if(isNegated(value,a)||educationalQuotation(value,a,b))continue;
  if(rule.id==='secret-request'&&/\b(?:read|repeat)\s+(?:it|that|them)\s+back\b/i.test(match[0])&&!/\b(?:code|digits?|OTP|passcode)\b/i.test(value))continue;
  if(rule.id==='changed-payment'&&!/\b(?:invoice|pay|payment|remit|transfer|bank|banking)\b/i.test(value))continue;
  matches.push({rule,start:map[a].start,end:map[b-1].end});
 }
 if(matches.some(m=>m.rule.id!=='pressure'))for(const match of text.matchAll(/\b(?:https?:\/\/|www\.)[^\s<>"']+/gi))matches.push({rule:{id:'message-link',label:'Link supplied by the sender',category:'Unverified link',severity:'context',explanation:'This link has not been opened or checked. Use an independently opened official app or site.',steps:[]},start:match.index,end:match.index+match[0].replace(/[.,;!?)]+$/,'').length});
 for(const match of text.matchAll(/\b(?:https?:\/\/|www\.)[^\s<>"']+/gi)){
  const url=match[0].replace(/[.,;!?)]+$/,''); const rule=suspiciousUrlRule(url);
  if(rule)matches.push({rule,start:match.index,end:match.index+url.length});
 }
 matches.sort((a,b)=>a.start-b.start||b.end-a.end);
 const rules=[...new Map(matches.map(m=>[m.rule.id,m.rule])).values()];const strong=rules.find(r=>r.severity==='high');const review=rules.filter(r=>r.severity==='review');
 const level=strong?'high':review.length?'review':'unknown';const main=strong||review.find(r=>r.id!=='pressure')||review[0];
 return {level,category:main?.category||'No recognized pattern',summary:level==='high'?'Pause before taking action. This message contains a request that could expose your money, account, or device.':level==='review'?'This message contains wording worth checking. Verify the request independently before acting.':'No warning pattern was recognized by these limited rules. This does not verify the sender or establish that the message is safe.',signals:matches.map(({rule,start,end})=>({id:rule.id,label:rule.label,explanation:rule.explanation,start,end})),nextSteps:[...new Set([...(main?.steps||[]),...VERIFY])],limitations};
}
