import { __, used } from './el.js';

const UNLOCKED_STATE = 0;
const LOCKED_STATE = 1;

const READY_STATE = 0;
const SELECTED_STATE = 1;
const DISPLAYED_STATE = 2;

const Card = (label, row, col) => used(
  el => el.addEventListener('click', () => {
    switch(Number(el.dataset.phase)) {
      case READY_STATE:
        if (Number(root.dataset.state) === LOCKED_STATE) {
          return;
        }
        // no break
      case SELECTED_STATE:
        el.dataset.phase = Number(el.dataset.phase) + 1;
        root.dataset.state = LOCKED_STATE;
        break;
      case DISPLAYED_STATE:
        root.dataset.state = UNLOCKED_STATE;
        el.dataset.phase = READY_STATE;
    }
  }),
  __('div',
    {
      className: 'Card',
      dataset: { phase: READY_STATE },
      style: `--row: ${row}; --col: ${col};`
    },
    [
      __('div', { className: 'Card-Decoration' }),
      __('div', { className: 'Card-Label' }, label)
    ]
  ),
);

const DEFAULT_CARDS = [ '0', '1/2', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', '\u2615' ];
const cardsParam = new URLSearchParams(window.location.search).get('cards');
const cards = cardsParam ? cardsParam.split(';') : DEFAULT_CARDS;

const cols = Math.ceil(Math.sqrt(cards.length));
const rows = Math.ceil(cards.length / cols);
const firstRowPosition = (cols - rows) / 2;

const root = __('div', { className: 'Root', dataset: { state: READY_STATE }, style: `--cols: ${cols};` });
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(root), false);

for (let row = 0; row < rows; row++) {
  const cardsInRow = Math.min(cols, cards.length - cols * row);
  const firstCardPosition = (cols - cardsInRow) / 2;

  for (let col = 0; col < cols; col++) {
    if (cards.length < row * cols + col + 1) {
      continue;
    }

    root.appendChild(Card(cards[row * cols + col], firstRowPosition + row, firstCardPosition + col));
  }
}

root.appendChild(__('a', { className: 'AboutLink', href: './about'}, 'about'));

// fullscreen

const canBeFullscreen = root.requestFullscreen !== undefined ||
  root.webkitRequestFullscreen !== undefined;

let fullscreenButtonDisabled = false;

const exitFullscreen = () => {
  if (document.fullscreenElement) {
    fullscreenButtonDisabled = true;
    document.exitFullscreen()
      .catch(() => { /* Noop */ })
      .finally(() => { fullscreenButtonDisabled = false; });

    return;
  }

  if (document.webkitFullscreenElement) {
    document.webkitCancelFullScreen();
  }
};

const toggleFullscreen = () => {
  if (fullscreenButtonDisabled) {
    return;
  }

  if (document.fullscreenElement || document.webkitFullscreenElement) {
    exitFullscreen();

    return;
  }

  if (root.requestFullscreen) {
    fullscreenButtonDisabled = true;
    root.requestFullscreen()
      .catch(() => { /* Noop */ })
      .finally(() => { fullscreenButtonDisabled = false; });

    return;
  }

  root.webkitRequestFullscreen?.();
};

const fullscreenButton = used(
  el => el.addEventListener('click', toggleFullscreen),
  __('button', { className: 'FullscreenButton' }, 'fullscreen')
);

document.addEventListener('fullscreenchange', () => {
  console.log('document.webkitFullscreenElement', document.webkitFullscreenElement);
  if (document.fullscreenElement === root || document.webkitFullscreenElement === root) {
    fullscreenButton.textContent = 'exit fullscreen';

    return;
  }

  fullscreenButton.textContent = 'fullscreen';
});


if (canBeFullscreen) {
  root.appendChild(fullscreenButton);
}
