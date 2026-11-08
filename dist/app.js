import {analyze} from './engine.js';
import {recoveryPlans} from './recovery.js';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const samples = {
  bank: 'Security alert: Your bank account is at risk. Transfer your money to a safe account now. Do not call your branch.',
  delivery: 'Your parcel could not be delivered. Pay a redelivery fee of $2.99 immediately at https://parcel-check.example to avoid return.',
  code: 'This is account support. Send us your verification code to prevent your account from being suspended.',
  normal: 'Your appointment is tomorrow at 10 AM. If you need to reschedule, use the clinic app you normally use.'
};
let current = null;
let planKey = 'none';
let toastTimer;
const emptyResult = $('#result').innerHTML;

// Message text is always inserted as text nodes, never interpreted as markup.
function node(tag, text, className) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
}
function toast(message) {
  clearTimeout(toastTimer);
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 4500);
}
function focusSection(element) {
  element.focus({preventScroll: true});
  element.scrollIntoView({block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
}
function setJourney(step) {
  const steps = ['message', 'understand', 'act'];
  steps.forEach((name, index) => {
    const item = $(`#journey-${name}`);
    if (name === step) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
    item.classList.toggle('complete', index < steps.indexOf(step));
  });
}
function page(key, moveFocus = true) {
  if (!['check', 'recovery', 'lab'].includes(key)) key = 'check';
  $$('.page').forEach(section => section.hidden = section.id !== `page-${key}`);
  $$('.nav').forEach(button => {
    const active = button.dataset.page === key;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  history.replaceState(null, '', `#${key}`);
  window.scrollTo(0, 0);
  if (moveFocus) $(`#page-${key} h1`).focus({preventScroll: true});
}
$$('.nav').forEach(button => button.onclick = () => page(button.dataset.page));
$$('a[href="#check"]').forEach(link => link.onclick = event => {
  event.preventDefault();
  page('check');
});
window.addEventListener('hashchange', () => {
  const key = location.hash.slice(1);
  if (['check', 'recovery', 'lab'].includes(key)) page(key);
});

function resetResult() {
  current = null;
  $('#result').classList.remove('has-result');
  // This is the fixed empty-state markup captured from our own document.
  $('#result').innerHTML = emptyResult;
  setJourney('message');
}
function update() {
  const message = $('#message').value;
  const hadResult = current !== null;
  $('#count').textContent = `${message.length.toLocaleString()} / 5,000`;
  $('#analyze').disabled = !message.trim();
  $('#input-error').hidden = true;
  $('#message').removeAttribute('aria-invalid');
  $('#input-status').textContent = message.trim()
    ? hadResult ? 'Message changed. Check it again for updated results.' : 'Ready when you are. Use ⌘ / Ctrl + Enter to analyze.'
    : 'Add a message to begin.';
  resetResult();
  $$('[data-sample]').forEach(button => {
    const selected = message === samples[button.dataset.sample];
    button.setAttribute('aria-pressed', String(selected));
  });
}
$('#message').oninput = update;
$('#message').onkeydown = event => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
    event.preventDefault();
    $('#message-form').requestSubmit();
  }
};
$$('[data-sample]').forEach(button => button.onclick = () => {
  $('#message').value = samples[button.dataset.sample];
  update();
  toast('Example loaded. Choose Find warning signs to check it.');
});
$('#clear').onclick = () => {
  $('#message').value = '';
  update();
  planKey = 'none';
  renderPlan();
  toast('Message and analysis cleared.');
  $('#message').focus();
};

function highlight(text, signals) {
  const box = node('div', undefined, 'evidence');
  box.tabIndex = 0;
  box.setAttribute('role', 'region');
  box.setAttribute('aria-label', 'Original message with detected wording highlighted');
  const ranges = signals.map(signal => [signal.start, signal.end])
    .filter(([start, end]) => Number.isInteger(start) && end > start && start >= 0 && end <= text.length)
    .sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const range of ranges) {
    const last = merged.at(-1);
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push([...range]);
  }
  let position = 0;
  for (const [start, end] of merged) {
    box.append(document.createTextNode(text.slice(position, start)), node('mark', text.slice(start, end)));
    position = end;
  }
  box.append(document.createTextNode(text.slice(position)));
  return box;
}

$('#message-form').onsubmit = event => {
  event.preventDefault();
  const text = $('#message').value;
  if (!text.trim()) {
    $('#input-error').textContent = 'Choose an example or paste a message first.';
    $('#input-error').hidden = false;
    $('#message').setAttribute('aria-invalid', 'true');
    $('#message').focus();
    return;
  }
  try {
    current = analyze(text);
    renderResult(text);
    $('#input-status').textContent = 'Analysis ready. Edit the message to check something else.';
    setJourney('understand');
    focusSection($('#result-title'));
  } catch {
    resetResult();
    $('#input-error').textContent = 'The message could not be checked. Your text is still here. Please try again.';
    $('#input-error').hidden = false;
    $('#message').focus();
  }
};

function renderResult(text) {
  const result = $('#result');
  result.replaceChildren();
  result.classList.add('has-result');
  result.append(node('p', '02  UNDERSTAND & ACT', 'step-label'));
  const status = {
    high: 'High concern · Pause before acting',
    review: 'Needs review · Check independently',
    unknown: 'Uncertain · No strong cues found'
  };
  result.append(node('div', status[current.level], `result-status ${current.level}`));
  const title = node('h2', current.level === 'high' ? 'Let’s verify this independently.' : current.level === 'review' ? 'A few things deserve a check.' : 'Keep your usual safeguards.', 'result-title');
  title.id = 'result-title';
  title.tabIndex = -1;
  result.append(title, node('p', current.summary, 'result-summary'));
  const evidenceHeading = node('div', undefined, 'evidence-heading');
  evidenceHeading.append(node('h3', 'What stands out'), node('span', current.signals.length ? 'Detected wording is highlighted' : 'No wording highlighted'));
  result.append(evidenceHeading, highlight(text, current.signals));
  const signals = node('ul', undefined, 'signal-list');
  // Keep all original highlights; explain each kind of cue once for readability.
  const uniqueSignals = [...new Map(current.signals.map(signal => [signal.id, signal])).values()];
  for (const signal of uniqueSignals) {
    const item = node('li');
    item.append(node('strong', signal.label), node('span', signal.explanation));
    signals.append(item);
  }
  if (uniqueSignals.length) result.append(signals);
  const next = node('div', undefined, 'next-step');
  next.append(node('p', '03  YOUR SAFER NEXT STEP', 'eyebrow'), node('p', current.nextSteps[0] || 'Verify independently through a company app or contact you already trust.'));
  const verify = node('button', undefined, 'primary verify-button');
  verify.append(node('span', 'Help me verify'), node('span', '→'));
  verify.lastChild.setAttribute('aria-hidden', 'true');
  verify.firstChild.className = 'button-label';
  verify.onclick = () => {
    verify.hidden = true;
    setJourney('act');
    renderVerify(next);
  };
  next.append(verify);
  result.append(next);
  const recovery = node('div', undefined, 'result-recovery');
  const recoverButton = node('button', 'Make a recovery plan →', 'text-button');
  recoverButton.onclick = () => page('recovery');
  recovery.append(node('span', 'Already interacted with the message?'), recoverButton);
  result.append(recovery);
  const details = node('details', undefined, 'limit-details');
  details.append(node('summary', 'How to interpret this result'));
  const limits = node('ul');
  ['Warning level reflects the potential consequences of detected cues, not a probability of fraud.', ...current.limitations].forEach(text => limits.append(node('li', text)));
  details.append(limits);
  result.append(details);
}

function renderVerify(parent) {
  const flow = node('div', undefined, 'verify-flow');
  const label = node('label', 'Who does the message claim to be from?');
  label.htmlFor = 'relationship';
  const select = node('select');
  select.id = 'relationship';
  [['', 'Choose a category'], ['bank', 'My bank or payment provider'], ['delivery', 'A delivery company'], ['account', 'An account or service I use'], ['other', 'Someone else / I’m not sure']].forEach(([value, text]) => {
    const option = node('option', text);
    option.value = value;
    select.append(option);
  });
  const route = node('div', undefined, 'verify-route');
  route.setAttribute('aria-live', 'polite');
  select.onchange = () => {
    route.replaceChildren();
    if (!select.value) return;
    const routes = {
      bank: ['Use your existing banking app.', 'Find support inside the app, or use the number printed on your bank card. Do not use contact details from this message.'],
      delivery: ['Check your original order.', 'Open the retailer’s app or your original order record. Check delivery status through that independent route.'],
      account: ['Open the service independently.', 'Use the official app you already have or a saved website address. Check your account notifications there.'],
      other: ['Pause the conversation.', 'Contact the person or organization through a number or channel you already knew before this message. Ask a trusted person for help if unsure.']
    };
    const [title, body] = routes[select.value];
    route.append(node('strong', title), node('p', body));
    const check = node('label', undefined, 'verified-check');
    const input = node('input');
    input.type = 'checkbox';
    check.append(input, node('span', 'I know an independent way to contact them.'));
    const complete = node('div', undefined, 'verify-complete');
    complete.hidden = true;
    complete.append(node('strong', 'Ready for your next step'), node('p', 'Use that trusted channel to check the request. PausePoint has not verified the sender.'));
    input.onchange = () => complete.hidden = !input.checked;
    route.append(check, complete);
  };
  flow.append(label, select, route);
  parent.append(flow);
  focusSection(select);
}

const choices = {
  none: 'I haven’t interacted', clicked: 'I clicked a link', credentials: 'I shared a password or code',
  money: 'I sent money', identity: 'I shared identity information', remote: 'I allowed device access'
};
for (const [key, title] of Object.entries(choices)) {
  const button = node('button', undefined, 'choice');
  button.dataset.plan = key;
  button.append(node('span', title), node('span', '→'));
  button.lastChild.setAttribute('aria-hidden', 'true');
  button.onclick = () => {
    planKey = key;
    renderPlan();
    focusSection($('#plan-title'));
  };
  $('#recovery-choices').append(button);
}

function renderPlan() {
  const plan = recoveryPlans[planKey];
  $$('[data-plan]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.plan === planKey)));
  const box = $('#recovery-detail');
  const title = node('h2', plan.title);
  title.id = 'plan-title';
  title.tabIndex = -1;
  box.replaceChildren(node('p', '02  YOUR ACTION PLAN', 'step-label'), title, node('p', plan.intro, 'plan-intro'));
  const steps = node('ol', undefined, 'plan-steps');
  for (const step of plan.steps) {
    const item = node('li');
    item.append(node('h3', step.title), node('p', step.detail));
    steps.append(item);
  }
  box.append(steps);
  const sources = node('div', undefined, 'sources');
  sources.append(node('p', 'GUIDANCE FROM OFFICIAL SOURCES'));
  for (const source of plan.sources) {
    const link = node('a', source.label + ' ↗');
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    sources.append(link);
  }
  box.append(sources);
  const download = node('button', 'Download this action plan ↓', 'secondary export');
  download.onclick = () => {
    // Only fixed guidance is exported. No entered message or analysis is included.
    const content = ['PausePoint — Personal action plan', plan.title, plan.intro,
      ...plan.steps.map((step, index) => `${index + 1}. ${step.title}\n${step.detail}`),
      'Official resources', ...plan.sources.map(source => `${source.label}: ${source.url}`),
      'General U.S. consumer guidance. No guarantee of safety or recovery. No original message included.'
    ].join('\n\n');
    try {
      const url = URL.createObjectURL(new Blob([content], {type: 'text/plain;charset=utf-8'}));
      const link = node('a');
      link.href = url;
      link.download = 'PausePoint-action-plan.txt';
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      download.textContent = 'Download again ↓';
      $('#export-status').textContent = 'Download requested. Your file contains only guidance and official sources.';
      toast('Action plan prepared. No message text included.');
    } catch {
      $('#export-status').textContent = 'The file could not be prepared. Please try again; your steps are still shown above.';
    }
  };
  const exportStatus = node('p', 'Only the guidance is included. Your original message stays out of the file.', 'export-note');
  exportStatus.id = 'export-status';
  exportStatus.setAttribute('role', 'status');
  box.append(download, exportStatus);
}
$('#open-recovery').onclick = () => page('recovery');
renderPlan();

$('#about-button').onclick = () => $('#about-dialog').showModal();
$('#close-dialog').onclick = () => $('#about-dialog').close();

$('#evaluation-set').onchange = () => {
  $('#lab-results').replaceChildren();
  $('#lab-status').classList.remove('error');
  $('#lab-status').textContent = 'Test set changed. Run the selected set to see its results.';
};
$('#run-lab').onclick = async () => {
  const button = $('#run-lab');
  const select = $('#evaluation-set');
  const datasetName = select.selectedOptions[0].textContent;
  button.disabled = true;
  select.disabled = true;
  button.textContent = 'Running test set…';
  $('#lab-results').replaceChildren();
  $('#lab-results').setAttribute('aria-busy', 'true');
  $('#lab-status').classList.remove('error');
  $('#lab-status').textContent = 'Loading the synthetic examples and checking them locally…';
  try {
    const response = await fetch(select.value === 'fresh' ? './fresh-cases.json' : './evaluation-cases.json');
    if (!response.ok) throw Error('Dataset unavailable');
    const cases = await response.json();
    const results = cases.map(testCase => ({...testCase, result: analyze(testCase.text)}));
    renderLab(results, datasetName);
    $('#lab-status').textContent = `${results.length} cases evaluated in your browser. ${datasetName}.`;
  } catch {
    $('#lab-status').classList.add('error');
    $('#lab-status').textContent = 'Could not load the test cases. Check that the local server is running, then choose Run selected test set to try again.';
  } finally {
    button.disabled = false;
    select.disabled = false;
    button.replaceChildren(document.createTextNode('Run selected test set'), node('span', '→'));
    button.lastChild.setAttribute('aria-hidden', 'true');
    $('#lab-results').setAttribute('aria-busy', 'false');
  }
};

function renderLab(results, datasetName) {
  const scams = results.filter(testCase => testCase.label === 'scam');
  const legitimate = results.filter(testCase => testCase.label === 'legitimate');
  const caught = scams.filter(testCase => testCase.result.level !== 'unknown').length;
  const falseAlarms = legitimate.filter(testCase => testCase.result.level !== 'unknown').length;
  const box = $('#lab-results');
  const metrics = node('div', undefined, 'metrics');
  [[`${caught}/${scams.length}`, 'Scam cases flagged'], [`${scams.length - caught}`, 'Scam cases missed'],
    [`${falseAlarms}/${legitimate.length}`, 'Legitimate cases flagged'],
    [`${results.filter(testCase => testCase.label === 'ambiguous').length}`, 'Ambiguous cases, unscored']
  ].forEach(([value, text]) => {
    const metric = node('div', undefined, 'metric');
    metric.append(node('strong', value), node('span', text));
    metrics.append(metric);
  });
  box.append(metrics, node('p', '“Flagged” means high or review. Orange rows expose misses and false alarms. These examples do not estimate real-world accuracy.', 'legend'));
  const wrap = node('div', undefined, 'table-wrap');
  wrap.tabIndex = 0;
  wrap.setAttribute('role', 'region');
  wrap.setAttribute('aria-label', 'Test results; scroll horizontally on a narrow screen');
  const table = node('table');
  table.append(node('caption', datasetName));
  const head = node('thead');
  const header = node('tr');
  ['Synthetic message', 'Expected label', 'Detector', 'Outcome'].forEach(text => {
    const cell = node('th', text);
    cell.scope = 'col';
    header.append(cell);
  });
  head.append(header);
  table.append(head);
  const body = node('tbody');
  for (const testCase of results) {
    const flagged = testCase.result.level !== 'unknown';
    const outcome = testCase.label === 'ambiguous' ? 'Unscored' : testCase.label === 'scam' ? flagged ? 'Flagged' : 'Missed' : flagged ? 'False alarm' : 'No warning';
    const row = node('tr', undefined, ['Missed', 'False alarm'].includes(outcome) ? 'miss' : '');
    const message = node('td', testCase.text);
    message.append(node('small', testCase.reason));
    row.append(message, node('td', testCase.label), node('td', testCase.result.level), node('td', outcome));
    body.append(row);
  }
  table.append(body);
  wrap.append(table);
  box.append(wrap);
}

page(location.hash.slice(1), false);
window.addEventListener('pageshow', update);
