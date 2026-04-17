import sharp from "sharp";

import type { ExtractedColor, RGB } from "@/types/analysis";

const BUCKET_SIZE = 16;
const MAX_COLORS = 6;

type Bucket = {
  count: number;
  r: number;
  g: number;
  b: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const toHex = ({ r, g, b }: RGB) =>
  `#${[r, g, b]
    .map((channel) => clamp(channel, 0, 255).toString(16).padStart(2, "0"))
    .join("")}`.toUpperCase();

const saturation = ({ r, g, b }: RGB) => {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;

  if (max === 0) {
    return 0;
  }

  return (max - min) / max;
};

const assignRole = (rgb: RGB, index: number): ExtractedColor["role"] => {
  if (saturation(rgb) < 0.14) {
    return "neutral";
  }

  if (index === 0) {
    return "primary";
  }

  if (index === 1) {
    return "secondary";
  }

  return "accent";
};

const quantize = (value: number) =>
  clamp(Math.round(value / BUCKET_SIZE) * BUCKET_SIZE, 0, 255);

const shouldIgnorePixel = (r: number, g: number, b: number, alpha: number) => {
  if (alpha < 32) {
    return true;
  }

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const isNearWhite = min > 245;
  const isNearBlack = max < 10;

  return isNearWhite || isNearBlack;
};

export const extractPalette = async (image: Buffer): Promise<ExtractedColor[]> => {
  const { data } = await sharp(image)
    .ensureAlpha()
    .resize(180, 180, { fit: "inside", withoutEnlargement: true })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const buckets = new Map<string, Bucket>();
  let includedPixels = 0;

  for (let index = 0; index < data.length; index += 4) {
    const r = data[index] ?? 0;
    const g = data[index + 1] ?? 0;
    const b = data[index + 2] ?? 0;
    const alpha = data[index + 3] ?? 0;

    if (shouldIgnorePixel(r, g, b, alpha)) {
      continue;
    }

    const qr = quantize(r);
    const qg = quantize(g);
    const qb = quantize(b);
    const key = `${qr}-${qg}-${qb}`;
    const existing = buckets.get(key);

    includedPixels += 1;

    if (existing) {
      existing.count += 1;
      existing.r += r;
      existing.g += g;
      existing.b += b;
      continue;
    }

    buckets.set(key, {
      count: 1,
      r,
      g,
      b,
    });
  }

  const palette = [...buckets.values()]
    .sort((left, right) => right.count - left.count)
    .slice(0, MAX_COLORS)
    .map((bucket, index) => {
      const rgb = {
        r: Math.round(bucket.r / bucket.count),
        g: Math.round(bucket.g / bucket.count),
        b: Math.round(bucket.b / bucket.count),
      };

      return {
        hex: toHex(rgb),
        rgb,
        weight: includedPixels === 0 ? 0 : Number((bucket.count / includedPixels).toFixed(3)),
        role: assignRole(rgb, index),
      } satisfies ExtractedColor;
    });

  return palette;
};

export const getPaletteConfidence = (palette: ExtractedColor[]) => {
  if (palette.length === 0) {
    return 0.2;
  }

  const topWeight = palette[0]?.weight ?? 0;
  const secondWeight = palette[1]?.weight ?? 0;
  return Number(clamp(0.45 + topWeight * 0.4 + secondWeight * 0.2, 0, 0.98).toFixed(2));
};
