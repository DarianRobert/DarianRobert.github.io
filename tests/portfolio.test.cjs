const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');

function openPage(narrow = false) {
  const dom = new JSDOM(html, { url: 'https://portfolio.example/', runScripts: 'outside-only' });
  const { window } = dom;
  const media = new window.EventTarget();
  media.matches = narrow;
  window.matchMedia = () => media;
  // Feed browser observer records into the real script against the real page markup.
  let notify;
  window.IntersectionObserver = class {
    constructor(callback) { notify = callback; }
    observe() {}
  };
  window.eval(script);
  return { dom, window, document: window.document, media, notify };
}

function click(document, selector) {
  const element = document.querySelector(selector);
  assert.ok(element, `Missing element: ${selector}`);
  element.click();
  return element;
}

test('project filters show the matching cards and update their counts', () => {
  const { dom, document } = openPage();
  try {
    const projects = [...document.querySelectorAll('[data-category]')];
    assert.equal(projects.length, 9);
    for (const category of ['software', 'ml', 'systems', 'all']) {
      click(document, `[data-filter="${category}"]`);
      const visible = projects.filter(project => !project.hidden);
      const expected = projects.filter(project => category === 'all' || project.dataset.category === category);
      assert.deepEqual(visible, expected);
      assert.equal(document.querySelector('#filter-count').textContent, `Showing ${expected.length} projects`);
      assert.equal(document.querySelectorAll('[data-filter][aria-pressed="true"]').length, 1);
    }
  } finally { dom.window.close(); }
});

test('a skill link reveals a project hidden by a different filter', () => {
  const { dom, document } = openPage();
  try {
    click(document, '[data-filter="systems"]');
    const project = document.querySelector('[aria-labelledby="smart-title"]');
    assert.equal(project.hidden, true);
    click(document, 'a[href="#smart-title"]');
    assert.equal(project.hidden, false);
    assert.equal(document.querySelector('[data-filter="all"]').getAttribute('aria-pressed'), 'true');
  } finally { dom.window.close(); }
});

test('mobile menu closes on Escape, navigation, outside clicks and a wider screen', () => {
  const { dom, document, window, media } = openPage(true);
  try {
    const toggle = click(document, '#menu-toggle');
    assert.equal(toggle.getAttribute('aria-expanded'), 'true');
    assert.equal(document.body.classList.contains('menu-open'), true);
    document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    assert.equal(toggle.getAttribute('aria-expanded'), 'false');
    assert.equal(document.activeElement, toggle);
    toggle.click();
    click(document, '#main-nav a');
    assert.equal(toggle.getAttribute('aria-expanded'), 'false');
    toggle.click();
    document.body.click();
    assert.equal(toggle.getAttribute('aria-expanded'), 'false');
    toggle.click();
    media.matches = false;
    media.dispatchEvent(new window.Event('change'));
    assert.equal(toggle.getAttribute('aria-expanded'), 'false');
    assert.equal(document.body.classList.contains('menu-open'), false);
  } finally { dom.window.close(); }
});

test('navigation remembers visible sections omitted from an observer update', () => {
  const { dom, document, notify } = openPage();
  try {
    const links = [...document.querySelectorAll('#main-nav a[href^="#"]')];
    const entry = (index, ratio) => ({
      target: document.querySelector(links[index].hash),
      isIntersecting: ratio > 0,
      intersectionRatio: ratio,
    });
    notify([entry(0, 0.8)]);
    notify([entry(1, 0.2)]);
    assert.equal(document.querySelector('#main-nav [aria-current="location"]'), links[0]);
    notify([entry(0, 0)]);
    assert.equal(document.querySelector('#main-nav [aria-current="location"]'), links[1]);
  } finally { dom.window.close(); }
});

test('progressive controls show the current year and print button', () => {
  const { dom, document } = openPage();
  try {
    assert.equal(document.querySelector('#footer-year').textContent, String(new Date().getFullYear()));
    if (document.querySelector('#print-resume'))
      assert.equal(document.querySelector('#print-resume').hidden, false);
    assert.equal(document.querySelector('#work-toolbar').hidden, false);
  } finally { dom.window.close(); }
});
