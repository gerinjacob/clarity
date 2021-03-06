/*
 * Copyright (c) 2016-2020 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import {
  baseStyles,
  Directions,
  hasStringPropertyChanged,
  hasStringPropertyChangedAndNotNil,
  Orientations,
  property,
  internalProperty,
  StatusTypes,
  id,
} from '@clr/core/internal';
import { html, LitElement, query } from 'lit-element';
import { styles } from './icon.element.css.js';
import { ClarityIcons } from './icon.service.js';
import { updateIconSizeStyleOrClassnames } from './utils/icon.classnames.js';
import { hasIcon } from './utils/icon.service-helpers.js';

/**
 * Icon component that renders svg shapes that can be customized.
 * To load an icon, import the icon with the icon service.
 *
 * ```typescript
 * import '@clr/core/icon/register.js';
 * import { ClarityIcons, userIcon } from '@clr/core/icon';
 *
 * ClarityIcons.addIcons(userIcon);
 * ```
 *
 * ```html
 * <cds-icon shape="user"></cds-icon>
 * ```
 *
 * @element cds-icon
 * @cssprop --color
 * @cssprop --badge-color
 */
export class CdsIcon extends LitElement {
  static get styles() {
    return [baseStyles, styles];
  }

  private _shape: string;
  private _size: string;

  @property({ type: String })
  get shape() {
    return hasIcon(this._shape, ClarityIcons.registry) ? this._shape : 'unknown';
  }

  /**
   * Changes the svg glyph displayed in the icon component. Defaults to the 'unknown' icon if
   * the specified icon cannot be found in the icon registry.
   */
  set shape(val: string) {
    if (hasStringPropertyChangedAndNotNil(val, this._shape)) {
      const oldVal = this._shape;
      this._shape = val;
      this.requestUpdate('shape', oldVal);
    }
  }

  get size() {
    return this._size;
  }

  /**
   * @type {string | sm | md | lg | xl | xxl}
   * Apply numerical width-height or a t-shirt-sized CSS classname
   */
  @property({ type: String })
  set size(val: string) {
    if (hasStringPropertyChanged(val, this._size)) {
      const oldVal = this._size;
      this._size = val;
      updateIconSizeStyleOrClassnames(this, val);
      this.requestUpdate('size', oldVal);
    }
  }

  /** If present, customizes the aria-label for the icon for accessibility. */
  @property({ type: String })
  title: string;

  /**
   * @deprecated
   * Takes a directional value (up|down|left|right) that rotates the icon 90° with the
   * top of the icon pointing in the specified direction.
   *
   * Deprecated in 3.0. Use `direction` instead. `dir` will be removed in 4.0!
   */
  @property({ type: String })
  dir: Directions;

  /**
   * @type {up | down | left | right}
   * Takes a directional value that rotates the icon 90° with the
   * top of the icon pointing in the specified direction.
   */
  @property({ type: String })
  direction: Directions;

  /**
   * @type {horizontal | vertical}
   * Takes an orientation value that reverses the orientation of the icon vertically or horizontally'
   */
  @property({ type: String })
  flip: Orientations;

  /**
   * Displays most icons in their "filled" version if set to `true`.
   */
  @property({ type: Boolean })
  solid = false;

  /**
   * @type {info | success | warning | danger | highlight}
   * Changes color of icon fills and outlines
   */
  @property({ type: String })
  status: StatusTypes | 'highlight' | '' = '';

  /**
   * Inverts color of icon fills and outlines if `true`.
   * Useful for displaying icons on a dark background.
   */
  @property({ type: Boolean })
  inverse = false;

  /**
   * @type {info | success | warning | danger | inherit | warning-triangle | inherit-triangle}
   * Sets the color of the icon decoration that appears in the top-right corner
   * of the glyph. The icon decoration is derived from the following predefined types.
   *
   * The color of the badge can change according to the following
   * list of statuses:
   * 'info'  -> blue dot
   * 'success' -> green dot
   * 'warning' -> yellow dot
   * 'danger' -> red dot
   * 'inherit' -> dot inherits color of full icon glyph
   * 'warning-triangle' -> yellow triangle
   * 'inherit-triangle' -> triangle inherits color of full icon glyph
   * unrecognized value, empty string, or true -> red dot
   *
   * By default, the badge displays a 'danger' dot (a red-colored dot).
   *
   * Setting the badge to 'false' or removing the attribute will remove the default icon badge.
   */
  @property({ type: String })
  badge: StatusTypes | 'inherit' | 'warning-triangle' | 'inherit-triangle' | true | false;

  /**
   * @private
   * given a pixel value offset any surrounding whitespace within the svg
   */
  @internalProperty({ type: Number, reflect: true })
  innerOffset = 0;

  @query('svg') private svg: SVGElement;

  @id()
  private idForAriaLabel: string;

  firstUpdated(props: Map<string, any>) {
    super.firstUpdated(props);
    this.updateSVGAriaLabel();
  }

  updated(props: Map<string, any>) {
    if (props.has('title')) {
      this.updateSVGAriaLabel();
    }

    if (props.has('innerOffset') && this.innerOffset > 0) {
      const dimension = `calc(100% + ${this.innerOffset * 2}px)`;
      this.svg.style.width = dimension;
      this.svg.style.height = dimension;
      this.svg.style.margin = `-${this.innerOffset} 0 0 -${this.innerOffset}`;
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'none');
  }

  protected render() {
    return html`
      <span .innerHTML="${ClarityIcons.registry[this.shape]}"></span>
      ${this.title
        ? html`<span id="${this.idForAriaLabel}" cds-layout="display:screen-reader-only">${this.title}</span>`
        : ''}
    `;
  }

  private updateSVGAriaLabel() {
    if (this.title) {
      this.svg.removeAttribute('aria-label'); // remove empty label that makes icon decorative by default
      this.svg.setAttribute('aria-labelledby', this.idForAriaLabel); // use labelledby for better SR support
    } else {
      this.svg.removeAttribute('aria-labelledby');
    }
  }
}
