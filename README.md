# kettlekite.com

Static site for Kettlekite, the studio name of independent developer Mert Can Gözükara.
Served by GitHub Pages from `main` (custom domain in `CNAME`). DNS and the support@ forwarder live at Namecheap.

- `/` studio page: one card per game.
- `/<game>/` support page, `/<game>/privacy`, `/<game>/terms`: the URLs App Store Connect and the in-game Settings link to.

## Add a game
1. Copy `vanity-jam/` to `<game-slug>/` and rewrite the three pages from the game's real data practices.
2. Add an icon (256 px) to `assets/` and a card to `index.html`.
3. Push. Use `https://kettlekite.com/<game-slug>/privacy` (Privacy Policy URL), `https://kettlekite.com/<game-slug>/` (Support URL) and `https://kettlekite.com` (Marketing URL) in App Store Connect.

No third-party requests: no web fonts, analytics or trackers. Keep it that way, the privacy pages promise it.
