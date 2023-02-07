import { Cipher, CipherOptions, CipherProps } from './Cipher';

const CANVAS_SIZE = 400;

type Child = {
  /** parent container */
  container: HTMLDivElement;
  cipher: Cipher;
};

type Props = {
  id: string;
  options?: CipherProps['options'];
};

export class CipherStream {
  /** DOM id of parent container */
  id: string;

  children: Child[];

  private options: CipherOptions;

  constructor({ id, options }: Props) {
    this.id = id;
    this.children = [];

    this.options = {
      animationsEnabled: true,
      radius: 50,
      gap: 20,
      ...options,
    };
  }

  updateOptions(options: Partial<CipherOptions>) {
    this.options = {
      ...this.options,
      ...options,
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
        canvas.width = CANVAS_SIZE;
        canvas.height = CANVAS_SIZE;
        parent.appendChild(canvas);
        const cipher = new Cipher({ word, canvas, options: this.options });
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
