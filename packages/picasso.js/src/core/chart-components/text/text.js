import extend from 'extend';

function parseTitle(text, join, scale) {
  let title = '';
  if (typeof text === 'function') {
    title = text();
  } else if (typeof text === 'string') {
    title = text;
  } else if (scale) {
    let data = scale.data();
    const titles = (data.fields || []).map((field) => field.title());
    title = titles.join(join);
  }

  return title;
}

function getTextAnchor(dock, anchor) {
  let val = 'middle';
  if (dock === 'left') {
    if (anchor === 'top') {
      val = 'end';
    } else if (anchor === 'bottom') {
      val = 'start';
    }
  } else if (dock === 'right') {
    if (anchor === 'top') {
      val = 'start';
    } else if (anchor === 'bottom') {
      val = 'end';
    }
  } else if (anchor === 'left') {
    val = 'start';
  } else if (anchor === 'right') {
    val = 'end';
  }
  return val;
}

function generateTitle({ title, definitionSettings, dock, rect, measureText, style }) {
  const struct = {
    type: 'text',
    text: title,
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    anchor: getTextAnchor(dock, definitionSettings.anchor),
    baseline: 'alphabetical',
    stroke: style.overlay.stroke || 'transparent',
    strokeWidth: style.overlay.strokeWidth || 0,
    fontWeight: style.overlay.fontWeight || 'normal',
  };

  extend(struct, style.text, style.overlay);
  const textRect = measureText(struct);

  if (dock === 'top' || dock === 'bottom') {
    let x = rect.width / 2;
    if (definitionSettings.anchor === 'left') {
      x = definitionSettings.paddingLeft || 0;
    } else if (definitionSettings.anchor === 'right') {
      x = rect.width - (definitionSettings.paddingRight || 0);
    }

    struct.x = x;
    struct.y =
      dock === 'top'
        ? rect.height - definitionSettings.paddingStart
        : definitionSettings.paddingStart + textRect.height;
    struct.dy = dock === 'top' ? -(textRect.height / 6) : -(textRect.height / 3);
    struct.maxWidth = rect.width * 0.8;
  } else {
    let y = rect.height / 2;
    if (definitionSettings.anchor === 'top') {
      y = definitionSettings.paddingStart;
    } else if (definitionSettings.anchor === 'bottom') {
      y = rect.height - definitionSettings.paddingStart;
    }

    struct.y = y;
    struct.x = dock === 'left' ? rect.width - definitionSettings.paddingStart : definitionSettings.paddingStart;
    struct.dx = dock === 'left' ? -(textRect.height / 3) : textRect.height / 3;
    const rotation = dock === 'left' ? 270 : 90;
    struct.transform = `rotate(${rotation}, ${struct.x + struct.dx}, ${struct.y + struct.dy})`;
    struct.maxWidth = rect.height * 0.8;
  }

  if (!isNaN(definitionSettings.maxLengthPx)) {
    struct.maxWidth = Math.min(struct.maxWidth, definitionSettings.maxLengthPx);
  }

  return struct;
}

/**
 * @typedef {object} ComponentText
 * @extends ComponentSettings
 * @property {'text'} type component type
 * @property {string|function} text Text to display
 * @example
 * {
 *  type: 'text',
 *  text: 'my title',
 *  dock: 'left',
 *  settings: {
 *    anchor: 'left',
 *  }
 * }
 */

/**
 * @typedef {object} ComponentText.settings
 * @property {number} [paddingStart=5] - Start padding in pixels
 * @property {number} [paddingEnd=5] - End padding in pixels
 * @property {number} [paddingLeft=0] - Left padding in pixels
 * @property {number} [paddingRight=0] - Right padding in pixels
 * @property {string} [anchor='center'] - Where to v- or h-align the text. Supports `left`, `right`, `top`, `bottom` and `center`
 * @property {string} [join=', '] - String to add when joining titles from multiple sources
 * @property {number} [maxLengthPx] - Limit the text length
 */

/**
 * @typedef {object} ComponentText.style
 * @property {text-style} [text=ComponentText.style.text] - Style for text
 * @property {overlay-style} [overlay=ComponentText.style.overlay] - Style for overlay text
 */

/**
 * @typedef {object} ComponentText.style.text
 * @property {string} [fontSize='12px'] - Font size of text
 * @property {string} [fontFamily='Source Sans Pro'] - Font family of text
 */
/**
 * @typedef {object} ComponentText.style.overlay
 * @property {string} [fontWeight='bold'] - Font weight of the overlay text
 * @property {string} [fill='#ffffff'] - Fill color of the overlay text
 * @property {string} [stroke='#595959'] - Stroke of the overlay text
 * @property {number} [strokeWidth=2] - Stroke width of the overlay text
 * @property {number} [opacity=0.5] - Opacity of the overlay text
 */
const textComponent = {
  require: ['renderer', 'chart'],
  defaultSettings: {
    layout: {
      dock: 'bottom',
      displayOrder: 0,
      prioOrder: 0,
    },
    settings: {
      paddingStart: 5,
      paddingEnd: 5,
      paddingLeft: 0,
      paddingRight: 0,
      anchor: 'center',
      join: ', ',
      maxLengthPx: NaN,
    },
    style: {
      text: '$title',
      overlay: '$label-overlay',
    },
  },

  created() {
    this.definitionSettings = this.settings.settings;

    const text = this.settings.text;
    const join = this.definitionSettings.join;
    this.title = parseTitle(text, join, this.scale);
  },

  preferredSize() {
    const height = this.renderer.measureText({
      text: this.title,
      fontSize: this.style.text.fontSize,
      fontFamily: this.style.text.fontFamily,
    }).height;
    return height + this.definitionSettings.paddingStart + this.definitionSettings.paddingEnd;
  },

  render() {
    const { title, definitionSettings, rect } = this;
    const nodes = [];
    nodes.push(
      generateTitle({
        title,
        dock: this.settings.layout.dock,
        definitionSettings,
        rect,
        measureText: this.renderer.measureText,
        style: this.style,
      })
    );
    return nodes;
  },

  beforeUpdate(opts) {
    if (opts.settings) {
      extend(this.settings, opts.settings);
      this.definitionSettings = opts.settings.settings;
    }
    const text = this.settings.text;
    const join = this.definitionSettings.join;
    this.title = parseTitle(text, join, this.scale);
  },
};

export default textComponent;
