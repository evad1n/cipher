import { Cipher, CipherOptions, DEFAULT_CIPHER_OPTIONS } from './Cipher';

import { Object } from 'ts-toolbelt';

type Child = {
  /** parent container */
  container: HTMLDivElement;
  cipher: Cipher;
};

export type CipherStreamOptions = {
  canvasSize: number;
  /** Options for each individual Cipher */
  individualOptions: CipherOptions;
};

export type CipherStreamOptionsUpdate = Object.Partial<
  CipherStreamOptions,
  'deep'
>;

export const DEFAULT_CIPHER_STREAM_OPTIONS: CipherStreamOptions = {
  canvasSize: 400,
  individualOptions: DEFAULT_CIPHER_OPTIONS,
} as const;

type Props = {
  id: string;
  options: CipherStreamOptionsUpdate;
};

export class CipherStream {
  /** DOM id of parent container */
  id: string;

  children: Child[];

  private options: CipherStreamOptions;

  constructor({ id, options }: Props) {
    this.id = id;
    this.children = [];

    this.options = {
      ...DEFAULT_CIPHER_STREAM_OPTIONS,
      ...options,
      individualOptions: {
        ...DEFAULT_CIPHER_STREAM_OPTIONS.individualOptions,
        ...options.individualOptions,
      },
    };
  }

  updateOptions(options: CipherStreamOptionsUpdate) {
    this.options = {
      ...this.options,
      ...options,
      individualOptions: {
        ...this.options.individualOptions,
        ...options.individualOptions,
      },
    };

    // Gotta redraw everything
    this.updateHard();
  }

  private get parent() {
    return document.getElementById(this.id);
  }

  /** Remove last symbol */
  private pop() {
    const removedSymbol = this.children.pop();
    removedSymbol?.container.remove();
  }

  private clear() {
    while (this.children.length) {
      this.pop();
    }
  }

  private updateHard() {
    const words = this.children.map(child => child.cipher.word);
    this.clear();
    this.update(words);
  }

  update(words: string[]) {
    while (this.children.length > words.length) {
      this.pop();
    }

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      // Added a word
      if (i >= this.children.length) {
        // Create new element
        const parent = document.createElement('div');
        parent.classList.add('cipher-symbol');
        const canvas = document.createElement('canvas');
        canvas.width = this.options.canvasSize;
        canvas.height = this.options.canvasSize;
        parent.appendChild(canvas);
        const cipher = new Cipher({
          word,
          canvas,
          options: this.options.individualOptions,
        });
        this.children.push({
          container: parent,
          cipher,
        });
        this.parent?.appendChild(parent);
      }

      const cipher = this.children[i].cipher;
      cipher.update(word);
    }
  }
}
