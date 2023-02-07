import { ProfanityFilter } from './cipher_profanity';
export function Draw() {
  const canvas = document.getElementById('ZonosNameLogo');
  const input = document.getElementById('UserInput');
  const showGuides = document.getElementById('ShowGuides');
  const showLetters = document.getElementById('ShowLetters');
  const showWord = document.getElementById('ShowWord');
  const strokeColor = document.getElementById('StrokeColor');
  const strokeHex = document.getElementById('StrokeColorHex');

  const radius = 50; // The initial size of the first ring
  const gap = 20; // The gap between each ring
  const font = 'sans-serif'; // The font of all text on the canvas
  const letterFontSize = 10; // The font size of the ring text
  const wordFontSize = 26; // The font size of the word under the rings
  const watermarkFontSize = 14; // The font size of the watermark
  const guideColor = 'rgb(0, 0, 0)'; // The color of the small letters and watermark
  const guideLinesColor = 'rgb(158, 158, 158)'; // The color of the guide lines

  if (canvas.getContext) {
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (showGuides.checked) {
      DrawGuides(canvas, ctx, gap * 20 + radius - gap, guideLinesColor);
    }

    const userInput = ValidateInput(input);
    const colorInput = ValidateColor(strokeHex, strokeColor);
    const showCenter =
      userInput.length > 0 && userInput[0].toLowerCase() != 'z';

    if (showCenter) {
      DrawCenter(canvas, ctx, radius, gap);
    }

    const cleanInput = userInput.replace(/\s/g, '').replace(/\./g, '');
    const spacesAndDots = [];

    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] == ' ') {
        spacesAndDots.push('space');
      } else if (userInput[i] == '.') {
        spacesAndDots.push('dot');
      } else {
        spacesAndDots.push(CharToNumber(userInput[i]));
      }
    }

    DrawArcs(canvas, ctx, cleanInput, radius, gap, colorInput, showCenter);
    DrawDots(canvas, ctx, radius, gap, spacesAndDots, colorInput);
    DrawSpaces(canvas, ctx, radius, gap, spacesAndDots);

    if (showLetters.checked) {
      DrawText(
        canvas,
        ctx,
        cleanInput,
        radius,
        gap,
        font,
        letterFontSize,
        guideColor
      );
    }

    if (showWord.checked) {
      DrawWord(
        canvas,
        ctx,
        userInput,
        cleanInput,
        radius,
        gap,
        font,
        wordFontSize,
        colorInput
      );
    }

    DrawWatermark(
      canvas,
      ctx,
      font,
      watermarkFontSize,
      guideColor,
      canvas.height / 2 + radius + 30 + gap * cleanInput.length,
      showWord.checked
    );
  }
}

function NoDoubleSpacesAt(n, data) {
  const isNotFirstOrLast = n > 0 && n < data.length - 1;

  if (isNotFirstOrLast) {
    const spaceBack = data[n - 1] == 'space';
    const spaceFront = data[n + 1] == 'space';

    if ((!spaceBack && !spaceFront) || (spaceBack && !spaceFront)) {
      return true;
    }
  }

  return false;
}

function DrawSpaces(canvas, ctx, radius, gap, data) {
  let lastAngle = ToRadians(-90);

  radius -= gap;

  for (let n = 0; n < data.length; n++) {
    if (data[n] == 'space') {
      if (NoDoubleSpacesAt(n, data)) {
        ctx.beginPath();
        ctx.arc(
          canvas.width / 2,
          canvas.height / 2,
          radius,
          lastAngle,
          lastAngle + (Math.PI * 2) / 104
        );
        ctx.arc(
          canvas.width / 2,
          canvas.height / 2,
          radius + gap,
          lastAngle + (Math.PI * 2) / 104,
          lastAngle + (Math.PI * 2) / 104
        );
        ctx.stroke();
      }
    } else if (data[n] != 'dot') {
      radius += gap;
      lastAngle = GetAngle(data[n]) + lastAngle;
    }
  }
}

function DrawDots(canvas, ctx, radius, gap, data, color) {
  if (color.length >= 4) {
    ctx.fillStyle = color;
  } else {
    ctx.fillStyle = 'black';
  }

  let letterPosition = 0;

  radius -= gap;

  for (let n = 0; n < data.length; n++) {
    if (data[n] == 'dot') {
      const offset = 7 + letterPosition * (360 / 26);
      const points = GetPoints(
        canvas.width / 2,
        canvas.height / 2,
        radius,
        26,
        offset
      );

      if (points.length > 0) {
        ctx.beginPath();
        ctx.arc(points[0].x, points[0].y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (data[n] != 'space') {
      radius += gap;
      letterPosition += data[n];
    }
  }
}

export function SavePNG() {
  const canvas = document.getElementById('ZonosNameLogo');
  const sizeSelection = document.getElementById('ImageSize');

  const resizedCanvas = document.createElement('canvas');
  const resizedContext = resizedCanvas.getContext('2d');

  let size = canvas.width;

  switch (sizeSelection.value) {
    case 'Small':
      size = canvas.width / 2;
      break;
    case 'Large':
      size = canvas.width * 2;
      break;
  }

  resizedCanvas.width = size;
  resizedCanvas.height = size;

  resizedContext.drawImage(canvas, 0, 0, size, size);

  const w = window.open(resizedCanvas.toDataURL('image/png'));
  const a = document.createElement('a');

  a.href = resizedCanvas.toDataURL('png');
  a.download = 'zonosid.png';

  a.click();
  w.close();
}

function ValidateInput(element) {
  const value = ProfanityFilter(element.value.replace(/[^a-zA-Z .]+/, ''));
  element.value = value;
  return value;
}

function SetHex(element) {
  const strokeHex = document.getElementById('StrokeColorHex');
  strokeHex.value = element.value;
}

function ValidateColor(hex, color) {
  const value = `#${hex.value.replace(/[^a-fA-F0-9]+/, '')}`;
  hex.value = value;
  color.value = value;
  return value;
}

function DrawWatermark(canvas, ctx, font, fontSize, color, offset, showText) {
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.font = `${fontSize}px ${font}`;

  if (showText) {
    offset += fontSize;
  }

  ctx.fillText('ZONOS.COM', canvas.width / 2, offset);
}

function DrawCenter(canvas, ctx, radius, gap) {
  ctx.fillStyle = 'black';

  ctx.beginPath();
  ctx.arc(
    canvas.width / 2,
    canvas.height / 2,
    radius - gap,
    ToRadians(-90),
    Math.PI * 2
  );
  ctx.stroke();
}

function DrawArcs(canvas, ctx, input, radius, gap, strokeColor, showCenter) {
  if (strokeColor.length >= 4) {
    ctx.strokeStyle = strokeColor;
  } else {
    ctx.strokeStyle = 'black';
  }

  ctx.lineWidth = 3;

  const numbers = StringToNumbers(input);
  let lastAngle = ToRadians(-90);
  const endPoints = [];

  if (!showCenter) {
    ctx.beginPath();
  }

  for (let i = 0; i < numbers.length; i++) {
    const newAngle = GetAngle(numbers[i]) + lastAngle;

    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      radius + gap * i,
      lastAngle,
      newAngle
    );
    lastAngle = newAngle;
  }

  DrawEndpoint(canvas, ctx, radius, gap, numbers, showCenter);

  ctx.stroke();
}

function DrawEndpoint(canvas, ctx, radius, gap, numbers, showCenter) {
  const endPoints = [];
  let n = 0;
  let pt = 0;

  for (let i = 0; i < numbers.length; i++) {
    var points = GetPoints(
      canvas.width / 2,
      canvas.height / 2,
      radius + gap * i,
      26
    );

    let pn = numbers[i];

    for (let p = n; p <= pn + n; p++) {
      pt = p;

      while (pt >= 26) {
        pt -= 26;
      }

      if (pt >= endPoints.length) {
        endPoints.push(new GuideLine([points[pt]]));
      } else {
        endPoints[pt].points.push(points[pt]);
      }
    }

    n += pn;
  }

  if (endPoints.length > 0) {
    let z = endPoints[pt].points.length - 2;

    if (z < 0) {
      z = 0;

      if (showCenter) {
        var points = GetPoints(
          canvas.width / 2,
          canvas.height / 2,
          radius - gap,
          26
        );
        ctx.lineTo(points[pt].x, points[pt].y);
      }
    } else {
      ctx.lineTo(endPoints[pt].points[z].x, endPoints[pt].points[z].y);
    }
  }
}

function DrawGuides(canvas, ctx, radius, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  const points = GetPoints(canvas.width / 2, canvas.height / 2, radius, 26);

  ctx.beginPath();

  for (let i = 0; i < points.length; i++) {
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.lineTo(points[i].x, points[i].y);
  }

  ctx.stroke();
}

function DrawText(
  canvas,
  ctx,
  input,
  radius,
  gap,
  font,
  fontSize,
  unusedColor
) {
  ctx.textAlign = 'center';
  ctx.font = `${fontSize}px ${font}`;

  radius -= gap + gap / 1.5;

  let letterPosition = 0;

  for (let n = 0; n < input.length; n++) {
    radius += gap;

    const c = CharToNumber(input[n]);
    const offset = 7 + (n + letterPosition) * (360 / 26);

    const points = GetPoints(
      canvas.width / 2,
      canvas.height / 2,
      radius,
      26,
      offset
    );

    for (let i = 0; i < c; i++) {
      if (i == c - 1) {
        ctx.fillStyle = 'black';
      } else {
        ctx.fillStyle = unusedColor;
      }

      ctx.save();
      ctx.translate(points[i].x, points[i].y);
      ctx.rotate(GetAngle(i + n + letterPosition + 0.5));
      ctx.fillText(NumberToString(i), 0, 0);
      ctx.restore();
    }

    letterPosition += c - 1;
  }
}

function DrawWord(
  canvas,
  ctx,
  input,
  cleanInput,
  radius,
  gap,
  font,
  fontSize,
  color
) {
  if (color.length >= 4) {
    ctx.fillStyle = color;
  } else {
    ctx.fillStyle = 'black';
  }

  ctx.textAlign = 'center';
  ctx.font = `${fontSize}px ${font}`;

  ctx.fillText(
    input.toUpperCase(),
    canvas.width / 2,
    canvas.height / 2 + radius + 10 + gap * cleanInput.length
  );
}

function CharToNumber(c) {
  return c.toLowerCase().charCodeAt(c) - 96;
}

function StringToNumbers(text) {
  text = text.toLowerCase();

  const numbers = [];

  for (let i = 0; i < text.length; i++) {
    numbers.push(text.charCodeAt(i) - 96);
  }

  return numbers;
}

function NumberToString(n) {
  return String.fromCharCode(n + 97).toUpperCase();
}

function GetAngle(n) {
  return ToRadians(n * (360 / 26));
}

function GetPoints(positionX, positionY, radius, numberOfPoints, offset = 0) {
  let angle = 0;
  const vectors = [];

  for (let i = 0; i < numberOfPoints; i++) {
    angle = i * (360 / numberOfPoints) + offset;

    const radians = ToRadians(angle - 90);

    vectors.push(
      new Vector2(
        positionX + radius * Math.cos(radians),
        positionY + radius * Math.sin(radians)
      )
    );
  }

  return vectors;
}

function ToRadians(angle) {
  return angle * (Math.PI / 180);
}

function Vector2(x, y) {
  this.x = x;
  this.y = y;
}

Vector2.create = function (x, y) {
  return new Vector2(x, y);
};

function GuideLine(points) {
  this.points = points;
}

GuideLine.create = function (points) {
  return new GuideLine(points);
};
