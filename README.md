# Darian Robert — Portfolio

Source for my [portfolio](https://darianrobert.github.io/), hosted on GitHub Pages. It introduces my background, skills and university team projects, with links to my GitHub repositories.

## Built with

Semantic HTML, responsive CSS and progressive-enhancement JavaScript. No framework, package installation or build step is required.

| Path | Purpose |
| --- | --- |
| `index.html` | Introduction, About, nine project groups, skills, background and contact |
| `resume.html` | Résumé with a print / Save as PDF option |
| `style.css` | Shared layout, responsive, reduced-motion and print styles |
| `script.js` | Mobile navigation, project filtering, current section and print controls |
| `favicon.svg` | Portfolio monogram |
| `images/` | Project images and social preview |
| `robots.txt`, `sitemap.xml` | Public-page discovery |

## Preview locally

```bash
git clone https://github.com/DarianRobert/DarianRobert.github.io.git
cd DarianRobert.github.io
python -m http.server 8000
```

Open `http://localhost:8000` in your browser. Stop the server with Ctrl+C. Google Fonts requires an internet connection; CSS provides fallback fonts. Content, repository links and project disclosures remain available without JavaScript.

## Updating content

- Edit project articles in `index.html`. Set `data-category` to `software`, `ml` or `systems` for filtering. JavaScript calculates the total; also update the initial all-work count and status text when changing the number of projects.
- DnD Trading's application and website form one project group. Nine groups link to ten project repositories.
- Keep technologies, results and contributions consistent with the project READMEs. Preserve team attribution and avoid implying sole authorship or production deployment.
- Honours is in progress. Update the portfolio and résumé together when the final outcome is confirmed.
- The banknote sample comes from `test_images/R10/1.jpg` in [SA Banknote Recognition](https://github.com/DarianRobert/SA-Banknote-Recognition). The DnD diagram is an architecture overview, not an application screenshot.
- Existing unused project illustrations remain in `images/`. Current project imagery uses the banknote test sample, cardiovascular report plot and soil-moisture prototype photograph.

## Check before publishing

Review links, keyboard navigation, the mobile menu, all four filters, expanded project details, the résumé and print layout. Check desktop and narrow-screen layouts. The site respects reduced-motion settings and uses the standard pointer.

Changes pushed to `main` are published by the existing GitHub Pages workflow.
