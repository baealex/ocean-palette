# Ocean Palette

> A self-hosted personal workspace for your image-generation workflow

Manage prompts like a color palette, browse your generated images, extract metadata, and sync your output folder — all in one place.

## Features

- **Ocean Palette** — Organize keywords by category, click to copy, drag to reorder. Treat words like paint on a palette.
- **Image Metadata Reader** — Upload any SD-generated image to extract model, sampler, steps, CFG, seed, and upscale info.
- **Collection Manager** — Save and browse your favorite generations in list, gallery, browse, or slideshow view.
- **Live Sync** — Watch your output folder and auto-import new images as they're generated.
- **Idea Generator** — Randomly combine keywords across categories to spark new prompt ideas.

## Quick Start

### Docker (Recommended)

Choose an exact version from the GitHub Releases page. Do not rely on the
floating `latest` tag for installs or upgrades.

```bash
docker run \
    -v ./data:/data \
    -v ./assets:/assets \
    -p 7768:7768 \
    baealex/ocean-palette:<version>
```

Open `http://localhost:7768` and start organizing.

#### Docker Data and Updates

- `/data` stores the SQLite database. `/assets` stores image/static assets.
  Keep both paths mounted to host directories to preserve data across container
  replacements.
- New Docker releases are published only as exact version tags. The `latest`
  tag is not moved, so existing `latest` users do not receive updates from
  `docker pull`.
- To update, back up `./data` and `./assets`, read the GitHub Release notes,
  change the image tag to the target version, and restart the container.

### Node.js

```bash
git clone https://github.com/baealex/ocean-palette
cd ocean-palette
pnpm i
pnpm start
```

Open `http://localhost:7768`.

## License

[MIT](./LICENSE)
