import { useEffect, useRef, useState } from 'react';
import { CipherStream } from '../scripts/CipherStream';

const ID = 'cipher-parent';

export const Translator = () => {
  const [input, setInput] = useState('');
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const cipherStream = useRef(
    new CipherStream({
      id: ID,
      options: {
        animationsEnabled,
      },
    })
  );

  const words = input.split(' ');

  useEffect(() => {
    cipherStream.current.update(words);
  }, [words]);

  useEffect(() => {
    cipherStream.current.updateOptions({
      animationsEnabled,
    });
    console.log(animationsEnabled);
  }, [animationsEnabled]);

  return (
    <div>
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        rows={5}
        style={{
          width: '100%',
        }}
      ></textarea>
      <label>
        <input
          type="checkbox"
          checked={animationsEnabled}
          onChange={() => setAnimationsEnabled(!animationsEnabled)}
        />
        Animations enabled
      </label>
      <div id={ID} className="cipher-stream"></div>
    </div>
  );
};
