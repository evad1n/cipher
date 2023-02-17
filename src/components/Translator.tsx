import { AnimationType } from '@/scripts/AnimationGroup';
import { DEFAULT_CIPHER_OPTIONS } from '@/scripts/Cipher';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CipherStream,
  CipherStreamOptionsUpdate,
  DEFAULT_CIPHER_STREAM_OPTIONS,
} from '../scripts/CipherStream';

import { useDebounce } from 'use-debounce';

const ID = 'cipher-parent';

export const Translator = () => {
  const [input, setInput] = useState('');

  // Group options
  const [canvasSize, setCanvasSize] = useState(
    DEFAULT_CIPHER_STREAM_OPTIONS.canvasSize
  );
  // Individual options
  const [animationsEnabled, setAnimationsEnabled] = useState(
    DEFAULT_CIPHER_OPTIONS.animationsEnabled
  );
  const [animationType, setAnimationType] = useState<AnimationType>(
    DEFAULT_CIPHER_OPTIONS.animationType
  );
  const [startRadius, setStartRadius] = useState(DEFAULT_CIPHER_OPTIONS.radius);
  const [ringGap, setRingGap] = useState(DEFAULT_CIPHER_OPTIONS.gap);
  const [animationDuration, setAnimationDuration] = useState(
    DEFAULT_CIPHER_OPTIONS.animationDuration
  );

  const currentOptions: CipherStreamOptionsUpdate = useMemo(
    () => ({
      canvasSize,
      individualOptions: {
        animationsEnabled,
        animationType,
        gap: ringGap,
        radius: startRadius,
        animationDuration,
      },
    }),
    [
      canvasSize,
      animationsEnabled,
      animationType,
      ringGap,
      startRadius,
      animationDuration,
    ]
  );

  const [debouncedCurrentOptions] = useDebounce(currentOptions, 200);

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
    cipherStream.current.updateOptions(debouncedCurrentOptions);
  }, [debouncedCurrentOptions]);

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
            name="canvas-size"
            id="canvas-size"
            value={canvasSize}
            onChange={e => setCanvasSize(parseInt(e.target.value, 10))}
            min={50}
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

        <label>
          <span>Animation duration</span>
          <input
            type="range"
            value={animationDuration}
            onChange={e => setAnimationDuration(parseInt(e.target.value, 10))}
            min={10}
            max={2000}
          />
        </label>

        <label>
          <span>Start radius</span>
          <input
            type="range"
            value={startRadius}
            onChange={e => setStartRadius(parseInt(e.target.value, 10))}
            min={1}
            max={100}
          />
        </label>

        <label>
          <span>Ring gap</span>
          <input
            type="range"
            value={ringGap}
            onChange={e => setRingGap(parseInt(e.target.value, 10))}
            min={1}
            max={100}
          />
        </label>
      </div>
      <div id={ID} className="cipher-stream"></div>
    </div>
  );
};
