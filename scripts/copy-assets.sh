#!/bin/sh
# Copies the handful of images this companion needs FROM the main portfolio
# repo INTO ./public/img. The portfolio repo is treated as read-only: this
# script only ever reads from $SRC (via `sips --out`, which writes a new
# file to $DEST and never touches the source).
#
# Images are resized (longest edge) and, where opaque, re-encoded as JPEG so
# the whole offline cache stays small enough to pre-load on the iPad.
# Re-run with `npm run assets` after the portfolio images change.
set -eu

SRC="/Users/vimala/Documents/Redesign of my portfolio/redesigning PF/public/images"
DEST="$(cd "$(dirname "$0")/.." && pwd)/public/img"

# source (relative to $SRC) | destination (relative to $DEST) | format | max edge px
LIST='
case-studies/youclean-dashboard-mobile-real.png|youclean/mobile.jpg|jpeg|1600
case-studies/cornerstone-homepage-hero-real.png|cornerstone/cover.jpg|jpeg|2200
case-studies/cornerstone/section-06-reference.png|cornerstone/ai-panel.png|png|1800
case-studies/cornerstone/cornerstone-section-07-workflow.png|cornerstone/assistant.png|png|1200
case-studies/cornerstone/cornerstone-section-08-impact.png|cornerstone/translate.png|png|1200
case-studies/flyin/flyin-hero-devices.jpg|flyin/cover.jpg|jpeg|2200
case-studies/flyin/flyin-desktop-home.jpg|flyin/desktop.jpg|jpeg|2000
case-studies/flyin/flyin-mobile-home.jpg|flyin/mobile.jpg|jpeg|1600
case-studies/flyin/flyin-hotel-booking.jpg|flyin/hotel.jpg|jpeg|2000
civtech.jpeg|civtech/cover.jpg|jpeg|2200
case-studies/civtech/civtech-journey-map.jpg|civtech/journey-map.jpg|jpeg|2400
case-studies/civtech/civtech-competitors.jpg|civtech/competitors.jpg|jpeg|2000
case-studies/civtech/civtech-structure-organisation.jpg|civtech/structure.jpg|jpeg|2000
case-studies/civtech/civtech-journey-brainstorm.jpg|civtech/brainstorm.jpg|jpeg|2000
about/vimala-about-portrait.png|about/portrait.jpg|jpeg|1400
'

echo "$LIST" | while IFS='|' read -r src dest fmt max; do
  [ -z "$src" ] && continue
  mkdir -p "$DEST/$(dirname "$dest")"
  if [ "$fmt" = "jpeg" ]; then
    sips -s format jpeg -s formatOptions 80 -Z "$max" "$SRC/$src" --out "$DEST/$dest" >/dev/null
  else
    sips -s format png -Z "$max" "$SRC/$src" --out "$DEST/$dest" >/dev/null
  fi
  echo "  ✓ $dest"
done

# YouClean crops. The source screenshots show an outdated store name in the app's
# store switcher, so these frames are cut to exclude it (cropped, not masked):
#  - dashboard: the top bar (search, store switcher, avatar) is removed
#  - tracking:  the customer "Track your order" card from the homepage mockup
TMPC="$(mktemp -d)"
# (sips ignores --cropOffset on current macOS, so the top-aligned crop uses Pillow.)
python3 -c "from PIL import Image; im = Image.open('$SRC/case-studies/youclean-dashboard-real.png').convert('RGB'); im.crop((0, 64, im.width, im.height)).save('$DEST/youclean/dashboard.jpg', quality=84)"
echo "  ✓ youclean/dashboard.jpg (top bar cropped)"
sips -c 480 250 --cropOffset 300 45 "$SRC/case-studies/youclean-homepage-hero-real.png" --out "$TMPC/track.png" >/dev/null
sips -s format jpeg -s formatOptions 88 "$TMPC/track.png" --out "$DEST/youclean/tracking.jpg" >/dev/null
echo "  ✓ youclean/tracking.jpg (customer tracking card)"
rm -rf "$TMPC"

echo "Assets copied to $DEST"
