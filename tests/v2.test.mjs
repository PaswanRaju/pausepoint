import test from 'node:test';import assert from 'node:assert/strict';import {analyze} from '../dist/engine.js';
test('Educational quoted actions are suppressed but later demand remains',()=>{assert.equal(analyze("In today's safety workshop we discussed scams that say 'send gift card codes' or 'install remote access software.' Never follow those instructions.").level,'unknown');assert.equal(analyze("Our training says 'never share your code'. Now send your OTP to the agent.").level,'high')});
test('Normalization preserves original evidence offsets',()=>{for(const text of ['🚩 Please sh\u200bare your pass\u200bword','Sеnd your passw0rd','Send your ＰＡＳＳＷＯＲＤ']){const r=analyze(text);assert.equal(r.level,'high');for(const s of r.signals){assert.ok(s.start>=0&&s.end<=text.length);assert.match(text.slice(s.start,s.end),/\S/);}}});
test('Invoice diversion is a review, not a definitive scam claim',()=>{assert.equal(analyze('Please remit the next invoice to our new bank account.').level,'review');assert.equal(analyze('Your new account is ready.').level,'unknown')});
test('Ordinary card checkout remains review level',()=>assert.equal(analyze('Enter your credit card number to complete checkout.').level,'review'));
test('Account-link wording is review-level and ordinary confirmation is not flagged',()=>{
 const result=analyze('Tap the button to confirm your payment account.');
 assert.equal(result.level,'review');
 assert.ok(result.signals.some(s=>s.id==='account-link'));
 assert.equal(analyze('Your payment account was confirmed yesterday.').level,'unknown');
});
test('Indirect code extraction is high risk while code notifications remain unknown',()=>{
 assert.equal(analyze('Which code did you receive? Read it back to me.').level,'high');
 assert.equal(analyze('Your code 731820 was sent. Do not share it.').level,'unknown');
});
test('Suspicious URL structures are review-level without treating ordinary domains as unsafe',()=>{
 assert.ok(analyze('Open https://192.0.2.44/login').signals.some(s=>s.id==='suspicious-link-structure'));
 assert.ok(analyze('Open https://xn--paypa-3ve.example/login').signals.some(s=>s.id==='suspicious-link-structure'));
 assert.equal(analyze('Our portal is https://portal.example.org/home.').level,'unknown');
});
test('Limited Spanish cues respect negation',()=>{assert.equal(analyze('Envíame el código de seguridad.').level,'high');assert.equal(analyze('Nunca envíes tu código de seguridad.').level,'unknown')});
test('Digits without letters are not decoded as words',()=>assert.equal(analyze('Your code is 01345. Do not share it.').level,'unknown'));
test('No safety verdict or sender verification implied for arbitrary input',()=>{for(const text of ['',null,'普通的信息','abc '.repeat(2000)]){const r=analyze(text);assert.equal(r.level,'unknown');assert.match(r.summary,/does not verify/);}});
