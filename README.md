# MIA_MAYS — fan site prototype
Static site: plain HTML/CSS/vanilla JS, no build step.

## Structure
```
mia-site/
  index.html   # all sections
  style.css    # pastel pink theme, responsive
  app.js       # petals, mobile menu, lightbox, canvas meme maker
  img/         # mia-hoodie, mia-bed, mia-pajama-crop (+ face-*.png sticker crops)
```
Sections: nav · hero · Her story · Fan corner (wallpapers, stickers, meme maker) · Cozy shop (mock) · Gallery · Find her on X · footer.

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
