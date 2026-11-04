# MIA_MAYS — fan site prototype
Static site: plain HTML/CSS/vanilla JS, no build step.

## Structure
```
mia-site/
  index.html   # single page, sticky nav + anchors
  style.css    # pastel pink/rose/deep-red/cream theme, Fredoka+Nunito, reveal anims, reduced-motion
  app.js       # nav, reveal, hearts/petals, lightbox, GIF Factory (WebM/PNG), try-on, meme maker,
               # laser toy, catch-the-hearts game, countdown, localStorage fan wall
  img/         # mia-pillow, mia-pajama-pillow, mia-pajama-crop, face-pillow, face-pajama2, face-pajama (only allowed images)
```
Sections: Home hero · Story · Comic (4 panels) · Fan Tools (stickers, GIF Factory, Try-on, Meme Maker, laser toy) · Games (Catch the Hearts) · Events (Cozy Night countdown + mock calendar) · Shop (mock, no checkout) · Gallery (lightbox) · Community (X/Discord placeholders, fan wall) · Footer.

Notes: GIF Factory exports WebM via MediaRecorder (PNG frame fallback) — no true GIF encoder. No user image uploads. Fan wall and game best score live in localStorage only.

## Run locally
`python3 -m http.server 8000` → http://localhost:8000

## Deploy free
- **GitHub Pages:** push folder to a repo → Settings → Pages → Deploy from branch `main` / root.
- **Cloudflare Pages:** dash → Workers & Pages → Create → Pages → upload folder (or connect repo, build command empty, output `/`).

## Next steps
- Replace placeholder lore and `https://x.com/` links with real handles.
- Real merch images/prices and a store (Shopify/Gumroad links).
- Proper sticker pack export (PNG zip / Telegram pack), more wallpapers in phone/desktop sizes.
- Add favicon, OG preview image, custom domain.
