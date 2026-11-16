# TADA documentation site

The source of the documentation site for this repository: the design of both approaches, the results of
the paper, the TADA Lab (the published single-agent policies flying in the browser) and the research
notes of the single-agent work. Built with [MkDocs](https://www.mkdocs.org/) and
[Material for MkDocs](https://squidfunk.github.io/mkdocs-material/).

## Build

```sh
python -m pip install -r requirements.txt
mkdocs serve --livereload   # http://127.0.0.1:8000, rebuilt on change
mkdocs build --strict # static site in site/
```

Run the commands from this directory (`website/`).

## Publishing

`.github/workflows/docs.yml` builds the site with `mkdocs build --strict` on every push to `main` that touches
`website/`, and publishes it with GitHub Pages. Pull requests are built with the same checks and not published.

One-time setup by a repository admin: Settings → Pages → Build and deployment → Source: **GitHub Actions**. The
site is then served at `https://<owner>.github.io/<repository>/`. For a custom domain, set the repository variable
`DOCS_SITE_URL` to the full address, ending in a slash.

## Layout

| Path | What |
|---|---|
| `mkdocs.yml` | Configuration and the contents list |
| `docs/index.md`, `docs/results.md` | Home and the results of the paper |
| `docs/how/` | How it works: the shared design, the single-agent design page by page, rollout search, the multi-agent summary |
| `docs/lab/` | The Lab page and the engine-key request page |
| `docs/code/` | Setting up, evaluating and training with the public code |
| `docs/notes/` | Research notes: the single-agent development diary, imported as written and not regenerated here |
| `docs/assets/paper/` | Figures of the paper |
| `docs/assets/lab/` | The Lab's data: the encrypted engine, policy weights, curated seeds, airport maps |
| `docs/stylesheets/`, `docs/javascripts/`, `overrides/` | Theme, components, the Lab application, the previous / next buttons |
| `LAB-ENGINE-TERMS.md` | Terms of the encrypted Lab engine; included in `docs/lab/access.md` |

## Conventions

- **Glyphs.** Every page names one [Material Design Icon](https://pictogrammers.com/library/mdi/) in its
  front matter (`icon: material/<name>`). It is shown in the contents list, on the previous / next buttons
  and on the section cards. Use this one icon set only.
- **Section pages.** A section's first page is its `index.md`; its icon is the section's glyph.
- **Paper figures** are embedded as `<figure class="tada-paper-fig" markdown>` with a caption.

## The Lab engine and its key

`docs/assets/lab/engine.bin` is the Lab's WebAssembly engine (simulator, scenario configurations,
environment and search), encrypted with AES-256-GCM; `engine.json` is its manifest. The page decrypts it
in the browser with an engine key that the visitor enters. The key is not in this repository and must
never be committed. The plaintext module is not published either.

Visitors ask for a key through the form on `docs/lab/access.md`. The form composes an email to the address
in that page's `data-email` attribute (and in its `<noscript>` fallback). `LAB-ENGINE-TERMS.md` holds the terms
that come with a key.

The engine is built and encrypted outside this repository. To replace it, drop in a new `engine.bin` and
`engine.json` pair; a new key makes earlier keys stop working.
