from pathlib import Path
import sys

from PIL import Image


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit("Uso: encode-evidence-webp.py FRAME_DIR OUTPUT_WEBP FRAME_DURATION_MS")

    frame_directory = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    duration = int(sys.argv[3])
    frame_paths = sorted(frame_directory.glob("*.jpg"))
    if len(frame_paths) < 2:
        raise SystemExit("Servono almeno due frame JPEG")

    frames = []
    for frame_path in frame_paths:
        with Image.open(frame_path) as image:
            frames.append(image.convert("RGB").copy())

    output_path.parent.mkdir(parents=True, exist_ok=True)
    first, *remaining = frames
    first.save(
        output_path,
        format="WEBP",
        save_all=True,
        append_images=remaining,
        duration=duration,
        loop=0,
        quality=82,
        method=6,
    )
    print(f"Evidenza animata: {output_path} ({len(frames)} frame)")


if __name__ == "__main__":
    main()
