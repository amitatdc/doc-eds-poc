import { toClassName } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// Model field order for each `form-field` item row (see blocks/form/_form.json).
// Each authored field renders one cell <div> per model field, in this order.
const CELL = {
  type: 0,
  label: 1,
  name: 2,
  placeholder: 3,
  options: 4,
  required: 5,
  action: 6,
  confirmation: 7,
};

/** Read a cell's plain text, tolerating missing trailing cells. */
function cellText(cells, index) {
  return cells[index] ? cells[index].textContent.trim() : '';
}

/** Read a link href from a cell (aem-content fields render as an anchor). */
function cellHref(cells, index) {
  const cell = cells[index];
  if (!cell) return '';
  const a = cell.querySelector('a');
  if (a) return a.getAttribute('href');
  return cell.textContent.trim();
}

/** Parse the pipe-separated Options string into {text, value} pairs. */
function parseOptions(raw) {
  if (!raw) return [];
  return raw
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const eq = part.indexOf('=');
      if (eq === -1) return { text: part, value: part };
      return { text: part.slice(0, eq).trim(), value: part.slice(eq + 1).trim() };
    });
}

let idSeq = 0;
function nextId(name) {
  idSeq += 1;
  return `form-${name || 'field'}-${idSeq}`;
}

function buildLabel(text, forId, required) {
  const label = document.createElement('label');
  label.setAttribute('for', forId);
  label.textContent = text;
  if (required) label.dataset.required = 'true';
  return label;
}

/** Read one authored row into a normalized field descriptor. */
function readField(row) {
  const cells = [...row.children];
  const type = (cellText(cells, CELL.type) || 'text').toLowerCase();
  const label = cellText(cells, CELL.label);
  const explicitName = cellText(cells, CELL.name);
  return {
    row,
    type,
    label,
    name: explicitName || toClassName(label || type),
    placeholder: cellText(cells, CELL.placeholder),
    options: parseOptions(cellText(cells, CELL.options)),
    required: cellText(cells, CELL.required).toLowerCase() === 'true',
    action: cellText(cells, CELL.action),
    confirmation: cellHref(cells, CELL.confirmation),
  };
}

function createInputField(fd, tag = 'input') {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-field-wrapper';
  const id = nextId(fd.name);

  const field = document.createElement(tag);
  field.id = id;
  field.name = fd.name;
  if (tag === 'input') field.type = fd.type;
  if (fd.placeholder) field.placeholder = fd.placeholder;
  if (fd.required) field.required = true;

  wrapper.append(buildLabel(fd.label, id, fd.required), field);
  return wrapper;
}

function createSelectField(fd) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-field-wrapper';
  const id = nextId(fd.name);

  const select = document.createElement('select');
  select.id = id;
  select.name = fd.name;
  if (fd.required) select.required = true;

  if (fd.placeholder) {
    const ph = document.createElement('option');
    ph.textContent = fd.placeholder;
    ph.value = '';
    ph.disabled = true;
    ph.selected = true;
    select.append(ph);
  }
  fd.options.forEach((opt) => {
    const option = document.createElement('option');
    option.textContent = opt.text;
    option.value = opt.value;
    select.append(option);
  });

  wrapper.append(buildLabel(fd.label, id, fd.required), select);
  return wrapper;
}

/** Radio group or checkbox group rendered as a fieldset of options. */
function createChoiceField(fd) {
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'form-choice-wrapper';
  fieldset.name = fd.name;

  if (fd.label) {
    const legend = document.createElement('legend');
    legend.textContent = fd.label;
    if (fd.required) legend.dataset.required = 'true';
    fieldset.append(legend);
  }

  fd.options.forEach((opt) => {
    const optionWrapper = document.createElement('div');
    optionWrapper.className = 'form-option-wrapper';
    const id = nextId(fd.name);

    const input = document.createElement('input');
    input.type = fd.type; // 'radio' | 'checkbox'
    input.id = id;
    input.name = fd.name;
    input.value = opt.value;
    if (fd.required && fd.type === 'radio') input.required = true;

    const label = document.createElement('label');
    label.setAttribute('for', id);
    label.textContent = opt.text;

    optionWrapper.append(input, label);
    fieldset.append(optionWrapper);
  });

  return fieldset;
}

function createHeading(fd) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-field-wrapper form-heading-wrapper';
  const heading = document.createElement('h3');
  heading.textContent = fd.label;
  wrapper.append(heading);
  return wrapper;
}

function createParagraph(fd) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-field-wrapper form-paragraph-wrapper';
  const p = document.createElement('p');
  p.textContent = fd.label;
  wrapper.append(p);
  return wrapper;
}

function createSubmit(fd, form) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-field-wrapper form-submit-wrapper';
  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'button';
  button.textContent = fd.label || 'Submit';
  wrapper.append(button);

  if (fd.action) form.dataset.action = fd.action;
  if (fd.confirmation) form.dataset.confirmation = fd.confirmation;
  return wrapper;
}

const BUILDERS = {
  text: (fd) => createInputField(fd, 'input'),
  email: (fd) => createInputField(fd, 'input'),
  tel: (fd) => createInputField(fd, 'input'),
  number: (fd) => createInputField(fd, 'input'),
  date: (fd) => createInputField(fd, 'input'),
  textarea: (fd) => createInputField(fd, 'textarea'),
  select: createSelectField,
  radio: createChoiceField,
  checkbox: createChoiceField,
  heading: createHeading,
  paragraph: createParagraph,
};

function buildPayload(form) {
  const payload = {};
  [...form.elements].forEach((field) => {
    if (!field.name || field.type === 'submit' || field.disabled) return;
    if (field.type === 'radio') {
      if (field.checked) payload[field.name] = field.value;
    } else if (field.type === 'checkbox') {
      if (field.checked) {
        payload[field.name] = payload[field.name]
          ? `${payload[field.name]},${field.value}`
          : field.value;
      }
    } else {
      payload[field.name] = field.value;
    }
  });
  return payload;
}

async function handleSubmit(form) {
  if (!form.dataset.action) return;
  if (form.getAttribute('data-submitting') === 'true') return;
  const button = form.querySelector('button[type="submit"]');
  try {
    form.setAttribute('data-submitting', 'true');
    if (button) button.disabled = true;
    const response = await fetch(form.dataset.action, {
      method: 'POST',
      body: JSON.stringify({ data: buildPayload(form) }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
      if (form.dataset.confirmation) window.location.href = form.dataset.confirmation;
    } else {
      throw new Error(await response.text());
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Form submission failed:', e);
  } finally {
    form.setAttribute('data-submitting', 'false');
    if (button) button.disabled = false;
  }
}

export default function decorate(block) {
  const form = document.createElement('form');

  [...block.children].forEach((row) => {
    const fd = readField(row);
    const builder = BUILDERS[fd.type];
    let el;
    if (fd.type === 'submit') {
      el = createSubmit(fd, form);
    } else if (builder) {
      el = builder(fd);
    }
    if (el) {
      // preserve Universal Editor instrumentation so the field stays editable
      moveInstrumentation(row, el);
      form.append(el);
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (form.checkValidity()) {
      handleSubmit(form);
    } else {
      const firstInvalid = form.querySelector(':invalid:not(fieldset)');
      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });

  block.textContent = '';
  block.append(form);
}
