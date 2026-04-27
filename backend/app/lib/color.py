from __future__ import annotations

import io
from collections import defaultdict
from math import floor

from PIL import Image

from app.models.analysis import ExtractedColor, RGB

BUCKET_SIZE = 16
MAX_COLORS = 6


def clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))


def js_round(value: float) -> int:
    return floor(value + 0.5)


def to_hex(rgb: RGB) -> str:
    return "#" + "".join(f"{max(0, min(255, channel)):02X}" for channel in (rgb.r, rgb.g, rgb.b))


def saturation(rgb: RGB) -> float:
    maximum = max(rgb.r, rgb.g, rgb.b) / 255
    minimum = min(rgb.r, rgb.g, rgb.b) / 255
    if maximum == 0:
        return 0
    return (maximum - minimum) / maximum


def assign_role(rgb: RGB, index: int) -> str:
    if saturation(rgb) < 0.14:
        return "neutral"
    if index == 0:
        return "primary"
    if index == 1:
        return "secondary"
    return "accent"


def quantize(value: int) -> int:
    return int(clamp(js_round(value / BUCKET_SIZE) * BUCKET_SIZE, 0, 255))


def should_ignore_pixel(r: int, g: int, b: int, alpha: int) -> bool:
    if alpha < 32:
        return True
    maximum = max(r, g, b)
    minimum = min(r, g, b)
    is_near_white = minimum > 245
    is_near_black = maximum < 10
    return is_near_white or is_near_black


def extract_palette(image_bytes: bytes) -> list[ExtractedColor]:
    image = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    image.thumbnail((180, 180), Image.Resampling.LANCZOS)
    data = image.getdata()

    buckets: dict[str, dict[str, int]] = defaultdict(lambda: {"count": 0, "r": 0, "g": 0, "b": 0})
    included_pixels = 0

    for r, g, b, alpha in data:
        if should_ignore_pixel(r, g, b, alpha):
            continue

        qr = quantize(r)
        qg = quantize(g)
        qb = quantize(b)
        key = f"{qr}-{qg}-{qb}"
        bucket = buckets[key]
        bucket["count"] += 1
        bucket["r"] += r
        bucket["g"] += g
        bucket["b"] += b
        included_pixels += 1

    palette: list[ExtractedColor] = []
    sorted_buckets = sorted(buckets.values(), key=lambda bucket: bucket["count"], reverse=True)[:MAX_COLORS]

    for index, bucket in enumerate(sorted_buckets):
        rgb = RGB(
            r=js_round(bucket["r"] / bucket["count"]),
            g=js_round(bucket["g"] / bucket["count"]),
            b=js_round(bucket["b"] / bucket["count"]),
        )
        palette.append(
            ExtractedColor(
                hex=to_hex(rgb),
                rgb=rgb,
                weight=round(bucket["count"] / included_pixels, 3) if included_pixels else 0,
                role=assign_role(rgb, index),
            )
        )

    return palette


def get_palette_confidence(palette: list[ExtractedColor]) -> float:
    if not palette:
        return 0.2

    top_weight = palette[0].weight if len(palette) > 0 else 0
    second_weight = palette[1].weight if len(palette) > 1 else 0
    return round(clamp(0.45 + top_weight * 0.4 + second_weight * 0.2, 0, 0.98), 2)
