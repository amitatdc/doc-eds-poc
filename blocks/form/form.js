import { moveInstrumentation } from '../../scripts/scripts.js';

const FIELD_TYPES = ['text', 'email', 'tel', 'number', 'textarea', 'select', 'checkbox', 'date'];

/**
 * Reads the text content of a cell, trimmed.
 * @param {Element} cell
 * @returns {string}
 */
function cellText(cell) {
  return cell ? cell.textContent.trim() : '';
}

/**
 * Turns a label into a safe field name/id.
 * @param {string} value
 * @returns {string}
 */
function toName(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Reads the container-level configuration and the authored field rows.
 * Container config rows have a single cell; field rows either have multiple
 * cells or a single cell whose value is a known field type.
 * @param {Element} block
 * @returns {{config: string[], fieldRows: Element[]}}
 */
function readBlock(block) {
  const config = [];
  const fieldRows = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const isField = cells.length > 1
      || (cells.length === 1 && FIELD_TYPES.includes(cellText(cells[0]).toLowerCase()));
    if (isField) fieldRows.push(row);
    else config.push(cellText(cells[0]));
  });
  return { config, fieldRows };
}

/**
 * Builds a single form control (with label wrapper) from an authored row.
 * @param {Element} row
 * @param {number} index
 * @returns {Element|null}
 */
function buildField(row, index) {
  const cells = [...row.children];
  const type = (cellText(cells[0]) || 'text').toLowerCase();
  const label = cellText(cells[1]);
  const options = cellText(cells[2]);
  const required = /^(true|yes|x)$/i.test(cellText(cells[3]));
  const name = toName(label) || `field-${index}`;
  const placeholder = label;
  const id = `form-${name}-${index}`;

  const wrapper = document.createElement('div');
  wrapper.className = `form-field form-field-${type}`;
  moveInstrumentation(row, wrapper);

  let control;
  if (type === 'textarea') {
    control = document.createElement('textarea');
  } else if (type === 'select') {
    control = document.createElement('select');
    if (placeholder) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = placeholder;
      opt.disabled = true;
      opt.selected = true;
      control.append(opt);
    }
    options.split(',').map((o) => o.trim()).filter(Boolean).forEach((o) => {
      const opt = document.createElement('option');
      opt.value = o;
      opt.textContent = o;
      control.append(opt);
    });
  } else {
    control = document.createElement('input');
    control.type = type;
  }

  control.id = id;
  control.name = name;
  if (required) control.required = true;
  if (placeholder && type !== 'select') control.placeholder = placeholder;

  const labelEl = document.createElement('label');
  labelEl.setAttribute('for', id);
  labelEl.textContent = label || name;
  if (required) labelEl.classList.add('required');

  if (type === 'checkbox') {
    wrapper.append(control, labelEl);
  } else {
    wrapper.append(labelEl, control);
  }
  return wrapper;
}

/**
 * loads and decorates the form block
 * @param {Element} block The form block element
 */
export default function decorate(block) {
  const { config, fieldRows } = readBlock(block);
  const [action = '', submitLabel = 'Submit', successMessage = ''] = config;

  const form = document.createElement('form');
  form.className = 'form-body';
  form.noValidate = false;
  if (action) form.action = action;
  form.method = 'post';

  fieldRows.forEach((row, index) => {
    const field = buildField(row, index);
    if (field) form.append(field);
  });

  const actions = document.createElement('div');
  actions.className = 'form-field form-field-submit';
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'button primary';
  submit.textContent = submitLabel || 'Submit';
  actions.append(submit);
  form.append(actions);

  const message = document.createElement('div');
  message.className = 'form-message';
  message.setAttribute('role', 'status');
  message.setAttribute('aria-live', 'polite');
  message.hidden = true;
  message.innerHTML = successMessage;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries());
    submit.disabled = true;
    try {
      if (action) {
        const response = await fetch(action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data }),
        });
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      }
      form.hidden = true;
      message.hidden = false;
    } catch (error) {
      submit.disabled = false;
      message.hidden = false;
      message.classList.add('form-message-error');
      message.textContent = 'Something went wrong. Please try again.';
    }
  });

  block.replaceChildren(form, message);
}
