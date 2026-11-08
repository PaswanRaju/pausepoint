import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
// Works whether or not the parent project declares type:module.
const code = await readFile(new URL('../dist/engine.js',import.meta.url),'utf8');
const {analyze} = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);

const scenarios = [
 ['Move your money to a safe account now.', 'high', 'safe-account'],
 ['Please send me your verification code.', 'high', 'secret-request'],
 ['Reply with your OTP to approve the refund.', 'high', 'secret-request'],
 ['Download AnyDesk so our support agent can help.', 'high', 'remote-access'],
 ['Pay a redelivery fee at https://example.test/pay.', 'review', 'delivery-fee'],
 ['Your package requires a payment of $2.99.', 'review', 'delivery-fee'],
 ['Buy gift cards and send them to me.', 'review', 'gift-card'],
 ['Send bitcoin to this wallet address.', 'review', 'crypto-payment'],
 ['Act now or your account will be suspended.', 'review', 'pressure'],
 ['Your appointment is tomorrow at 10. See you then.', 'unknown', null],
 ['Your verification code is 123456. Do not share your verification code.', 'unknown', null],
 ['We will never ask you to share your OTP.', 'unknown', null],
 ['Do not move your money to a safe account.', 'unknown', null],
 ['Your order shipped. Track at https://example.test/track.', 'unknown', null],
 ['Remember to buy milk on the way home.', 'unknown', null]
];
for(const [text,level,id] of scenarios) test(text,()=>{
 const result=analyze(text);assert.equal(result.level,level);
 if(id)assert.ok(result.signals.some(s=>s.id===id));
 for(const s of result.signals){assert.ok(s.start>=0 && s.end<=text.length && s.start<s.end);assert.ok(text.slice(s.start,s.end));}
 assert.ok(!result.summary.includes('verified safe'));
});
test('offsets preserve emoji and leading whitespace',()=>{
 const text='  🚩 Please share your password now.';const r=analyze(text);
 assert.equal(text.slice(r.signals[0].start,r.signals[0].end),'share your password');
});
test('URL cues require another actionable cue and do not request the destination',()=>{
 const text='Please share your password at https://example.test/reset.';
 const r=analyze(text); const link=r.signals.find(s=>s.id==='message-link');
 assert.equal(text.slice(link.start,link.end),'https://example.test/reset');
 assert.equal(analyze('Visit https://example.test/reset.').signals.length,0);
});
test('input remains data, never code',()=>{
 const text='<img src=x onerror=alert(1)> Please share your password';
 assert.equal(analyze(text).level,'high');
});
test('length limit is explicit and empty input is unknown',()=>{
 const r=analyze('x'.repeat(5000)+' share your password');
 assert.equal(r.level,'unknown');assert.match(r.limitations[0],/5,000/);
 assert.equal(analyze(null).level,'unknown');assert.equal(analyze('').level,'unknown');
});
test('negation does not suppress a request in a later sentence',()=>{
 assert.equal(analyze('Never share passwords. Now send your OTP to me.').level,'high');
});
