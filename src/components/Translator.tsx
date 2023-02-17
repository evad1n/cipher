import { AnimationType } from '@/scripts/AnimationGroup';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CipherStream,
  CipherStreamOptionsUpdate,
} from '../scripts/CipherStream';

const ID = 'cipher-parent';

export const Translator = () => {
  const [input, setInput] = useState('');

  // Group options
  const [canvasSize, setCanvasSize] = useState(400);
  // Individual options
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [animationType, setAnimationType] = useState<AnimationType>('lerp');

  const currentOptions: CipherStreamOptionsUpdate = useMemo(
    () => ({
      canvasSize,
      individualOptions: {
        animationsEnabled,
        animationType,
      },
    }),
    [animationsEnabled, animationType, canvasSize]
  );

  const cipherStream = useRef(
    new CipherStream({
      id: ID,
      options: currentOptions,
    })
  );

  const words = input.split(' ');

  useEffect(() => {
    cipherStream.current.update(words);
  }, [words]);

  useEffect(() => {
    cipherStream.current.updateOptions(currentOptions);
  }, [currentOptions]);

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
      <div className="translator-controls">
        <label>
          <span>Canvas size</span>
          <input
            type="range"
            name="animation-group-progress"
            id="animation-group-progress"
            value={canvasSize}
            onChange={e => setCanvasSize(parseInt(e.target.value, 10))}
            min={200}
            max={1000}
          />
        </label>

        <label>
          <span>Animations enabled</span>
          <input
            type="checkbox"
            checked={animationsEnabled}
            onChange={() => setAnimationsEnabled(!animationsEnabled)}
          />
        </label>

        <div className="radio-input">
          <span>Animation type</span>
          <label>
            <input
              type="radio"
              name="animation-type"
              value="lerp"
              checked={animationType === 'lerp'}
              onChange={e => setAnimationType(e.target.value as AnimationType)}
            />
            Linear
          </label>
          <label>
            <input
              type="radio"
              name="animation-type"
              value="slerp"
              checked={animationType === 'slerp'}
              onChange={e => setAnimationType(e.target.value as AnimationType)}
            />
            Ease-out-in
          </label>
        </div>
      </div>
      <div id={ID} className="cipher-stream"></div>
    </div>
  );
};
