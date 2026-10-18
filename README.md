# kettlekite.com

Studio page for Kettlekite, the studio name of independent developer Mert Can Gözükara.
Served by GitHub Pages from `main` (domain in `CNAME`). DNS and the support@ forwarder live at Namecheap.

Each game has its own site and repo on its own subdomain:

| Site | Repo |
| --- | --- |
| https://kettlekite.com | `iammertg/kettlekite-site` (this repo) |
| https://vanityjam.kettlekite.com | `iammertg/kettlekite-vanityjam` |
| https://sundaejam.kettlekite.com | `iammertg/kettlekite-sundaejam` |

`assets/kk.css` (layout, type, components) and `assets/fonts/` (Fraunces + Nunito Sans, SIL OFL 1.1, self-hosted) are the shared base. After changing them run `scripts/sync-shared.sh`, which copies them into every `../kettlekite-*` site, then commit and push each site.

## Add a game
1. Copy `kettlekite-vanityjam` to `kettlekite-<slug>`, set `CNAME` to `<slug>.kettlekite.com`, change `assets/theme.css` (colour tokens only), the icon, the screenshot and every page's text. Write `privacy.html` from the game's real data practices.
2. `gh repo create iammertg/kettlekite-<slug> --public --source . --push`, then enable Pages on `main` with the custom domain.
3. Namecheap → Advanced DNS → CNAME `<slug>` → `iammertg.github.io.`
4. Add a row to `index.html` here.
5. App Store Connect: Privacy Policy URL `https://<slug>.kettlekite.com/privacy`, Support URL `https://<slug>.kettlekite.com/support`, Marketing URL `https://<slug>.kettlekite.com`.

No third-party requests anywhere: no web fonts from other hosts, no analytics, no trackers. The privacy pages promise it.
