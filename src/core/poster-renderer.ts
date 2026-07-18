import type { Artwork, PosterRatio, PosterState } from "@/core/types";

export const EXPORT_SIZES: Record<PosterRatio, { width: number; height: number }> = {
  portrait: { width: 1600, height: 2000 },
  square: { width: 1600, height: 1600 },
  story: { width: 1080, height: 1920 },
};

export interface CropRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export function calculateCoverCrop(
  imageWidth: number,
  imageHeight: number,
  frameWidth: number,
  frameHeight: number,
  scale = 1,
  focusX = 0,
  focusY = 0,
): CropRect {
  const safeScale = Math.min(1.8, Math.max(1, scale));
  const coverScale = Math.max(frameWidth / imageWidth, frameHeight / imageHeight) * safeScale;
  const sw = Math.min(imageWidth, frameWidth / coverScale);
  const sh = Math.min(imageHeight, frameHeight / coverScale);
  const normalizedX = (Math.min(1, Math.max(-1, focusX)) + 1) / 2;
  const normalizedY = (Math.min(1, Math.max(-1, focusY)) + 1) / 2;

  return {
    sx: Math.max(0, (imageWidth - sw) * normalizedX),
    sy: Math.max(0, (imageHeight - sh) * normalizedY),
    sw,
    sh,
  };
}

function drawCover(
  context: CanvasRenderingContext2D,
  image: CanvasImageSource & { width: number; height: number },
  frame: { x: number; y: number; width: number; height: number },
  state: PosterState,
) {
  const crop = calculateCoverCrop(
    image.width,
    image.height,
    frame.width,
    frame.height,
    state.scale,
    state.focusX,
    state.focusY,
  );
  context.drawImage(
    image,
    crop.sx,
    crop.sy,
    crop.sw,
    crop.sh,
    frame.x,
    frame.y,
    frame.width,
    frame.height,
  );
}

export function wrapCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
) {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth || !line) {
      line = candidate;
      continue;
    }

    lines.push(line);
    line = word;
    if (lines.length === maxLines - 1) {
      break;
    }
  }

  if (line && lines.length < maxLines) {
    lines.push(line);
  }

  const consumed = lines.join(" ").split(/\s+/).length;
  if (consumed < words.length && lines.length > 0) {
    let lastLine = lines[lines.length - 1];
    while (lastLine && context.measureText(`${lastLine}…`).width > maxWidth) {
      lastLine = lastLine.slice(0, -1).trimEnd();
    }
    lines[lines.length - 1] = `${lastLine}…`;
  }

  return lines;
}

function drawTitle(
  context: CanvasRenderingContext2D,
  text: string,
  options: {
    x: number;
    y: number;
    maxWidth: number;
    maxLines: number;
    maxSize: number;
    minSize: number;
    color: string;
    lineHeight: number;
  },
) {
  let size = options.maxSize;
  let lines: string[] = [];

  while (size >= options.minSize) {
    context.font = `600 ${size}px Georgia, "Times New Roman", serif`;
    lines = wrapCanvasText(context, text, options.maxWidth, options.maxLines);
    const allFit = lines.every((line) => context.measureText(line).width <= options.maxWidth);
    if (allFit) break;
    size -= 2;
  }

  context.fillStyle = options.color;
  context.textBaseline = "top";
  lines.forEach((line, index) => {
    context.fillText(line, options.x, options.y + index * size * options.lineHeight);
  });
  return options.y + lines.length * size * options.lineHeight;
}

function drawSourceLine(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  color: string,
) {
  context.fillStyle = color;
  context.font = `500 ${size}px Arial, Helvetica, sans-serif`;
  context.textBaseline = "alphabetic";
  context.fillText(text.toUpperCase(), x, y);
}

function drawExhibition(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  artwork: Artwork,
  image: CanvasImageSource & { width: number; height: number },
  state: PosterState,
) {
  context.fillStyle = "#f2f0e8";
  context.fillRect(0, 0, width, height);
  const margin = width * 0.07;
  const imageY = height * 0.065;
  const imageHeight = height * 0.61;
  drawCover(
    context,
    image,
    { x: margin, y: imageY, width: width - margin * 2, height: imageHeight },
    state,
  );
  context.fillStyle = "#d64a32";
  context.fillRect(margin, imageY + imageHeight + height * 0.03, width * 0.055, Math.max(6, height * 0.006));

  const titleY = imageY + imageHeight + height * 0.065;
  const titleEnd = drawTitle(context, artwork.title, {
    x: margin,
    y: titleY,
    maxWidth: width - margin * 2,
    maxLines: 3,
    maxSize: width * 0.066,
    minSize: width * 0.038,
    color: "#161616",
    lineHeight: 1.02,
  });
  drawSourceLine(
    context,
    `${artwork.artist} · ${artwork.date}`,
    margin,
    Math.min(height - height * 0.09, titleEnd + height * 0.035),
    width * 0.019,
    "#4d4b45",
  );
  drawSourceLine(
    context,
    "ATELIER ZERO · ARTIC.EDU · PUBLIC DOMAIN",
    margin,
    height - height * 0.04,
    width * 0.013,
    "#69675f",
  );
}

function drawFullBleed(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  artwork: Artwork,
  image: CanvasImageSource & { width: number; height: number },
  state: PosterState,
) {
  drawCover(context, image, { x: 0, y: 0, width, height }, state);
  const panelHeight = height * 0.31;
  context.fillStyle = "rgba(16, 16, 16, 0.84)";
  context.fillRect(0, height - panelHeight, width, panelHeight);
  const margin = width * 0.065;
  context.fillStyle = "#c8d63a";
  context.fillRect(margin, height - panelHeight + height * 0.045, width * 0.07, Math.max(6, height * 0.006));
  const titleY = height - panelHeight + height * 0.085;
  const titleEnd = drawTitle(context, artwork.title, {
    x: margin,
    y: titleY,
    maxWidth: width - margin * 2,
    maxLines: 3,
    maxSize: width * 0.064,
    minSize: width * 0.038,
    color: "#fbfaf6",
    lineHeight: 1.02,
  });
  drawSourceLine(
    context,
    `${artwork.artist} · ${artwork.date}`,
    margin,
    Math.min(height - height * 0.06, titleEnd + height * 0.025),
    width * 0.019,
    "#f2f0e8",
  );
  drawSourceLine(
    context,
    "ATELIER ZERO · PUBLIC DOMAIN",
    margin,
    height - height * 0.027,
    width * 0.013,
    "#cbc8bd",
  );
}

function drawArchive(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  artwork: Artwork,
  image: CanvasImageSource & { width: number; height: number },
  state: PosterState,
) {
  context.fillStyle = "#fbfaf6";
  context.fillRect(0, 0, width, height);
  const railWidth = width * 0.18;
  context.fillStyle = "#2454d6";
  context.fillRect(0, 0, railWidth, height);
  context.save();
  context.translate(railWidth * 0.46, height * 0.91);
  context.rotate(-Math.PI / 2);
  drawSourceLine(context, "ATELIER ZERO / OPEN COLLECTION EDITION", 0, 0, width * 0.018, "#fbfaf6");
  context.restore();

  const contentX = railWidth + width * 0.055;
  const right = width * 0.06;
  const imageY = height * 0.07;
  const imageHeight = height * 0.61;
  drawCover(
    context,
    image,
    { x: contentX, y: imageY, width: width - contentX - right, height: imageHeight },
    state,
  );
  drawSourceLine(context, String(artwork.id).padStart(6, "0"), contentX, height * 0.04, width * 0.017, "#d64a32");
  const titleEnd = drawTitle(context, artwork.title, {
    x: contentX,
    y: imageY + imageHeight + height * 0.055,
    maxWidth: width - contentX - right,
    maxLines: 3,
    maxSize: width * 0.06,
    minSize: width * 0.036,
    color: "#161616",
    lineHeight: 1.02,
  });
  drawSourceLine(
    context,
    `${artwork.artist} · ${artwork.date}`,
    contentX,
    Math.min(height - height * 0.08, titleEnd + height * 0.03),
    width * 0.018,
    "#4d4b45",
  );
  drawSourceLine(
    context,
    "ART INSTITUTE OF CHICAGO · PUBLIC DOMAIN",
    contentX,
    height - height * 0.035,
    width * 0.0125,
    "#69675f",
  );
}

export function renderPoster(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  artwork: Artwork,
  image: CanvasImageSource & { width: number; height: number },
  state: PosterState,
) {
  context.save();
  context.clearRect(0, 0, width, height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  if (state.template === "full-bleed") {
    drawFullBleed(context, width, height, artwork, image, state);
  } else if (state.template === "archive") {
    drawArchive(context, width, height, artwork, image, state);
  } else {
    drawExhibition(context, width, height, artwork, image, state);
  }

  context.restore();
}

export function getPreviewSize(ratio: PosterRatio, width = 720) {
  const exportSize = EXPORT_SIZES[ratio];
  return {
    width,
    height: Math.round((width * exportSize.height) / exportSize.width),
  };
}
