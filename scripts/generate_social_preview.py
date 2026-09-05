#!/usr/bin/env python3

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "social-preview.png"

W = 1280
H = 640

COLORS = {
    "black": (204, 218, 232),
    "white": (41, 59, 83),
    "red": (169, 185, 107),
    "yellow": (143, 157, 92),
    "green": (35, 53, 28),
    "cyan": (112, 131, 90),
}


def load_font(size: int, bold: bool = False):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
        "/System/Library/Fonts/Supplemental/Courier New Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Courier New.ttf",
        "/System/Library/Fonts/SFNSMono.ttf",
        "/System/Library/Fonts/Menlo.ttc",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


def main():
    im = Image.new("RGB", (W, H), COLORS["black"])
    draw = ImageDraw.Draw(im)

    title_font = load_font(104, bold=True)
    subtitle_font = load_font(40, bold=True)

    draw.text((118, 178), "Pocket", font=title_font, fill=COLORS["green"])
    draw.text((122, 306), "theme for eXeLearning", font=subtitle_font, fill=COLORS["white"])

    y = 448
    x = 122
    width = 180
    gap = 14
    for color in (COLORS["red"], COLORS["yellow"], COLORS["green"], COLORS["cyan"]):
        draw.rectangle((x, y, x + width, y + 22), fill=color)
        x += width + gap

    im.save(OUT)
    print(OUT.name)


if __name__ == "__main__":
    main()
