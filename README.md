# Darian Robert — Portfolio

Source for my [live portfolio](https://darianrobert.github.io/), hosted with GitHub Pages. It presents my university team projects and links to the repositories on my GitHub account.

## Built with

HTML, CSS and JavaScript, with no framework or build step.

| Path | Purpose |
| --- | --- |
| `index.html` | Portfolio content and project links |
| `style.css` | Layout, responsive styles and animations |
| `script.js` | Canvas effects, project panels and navigation |
| `images/` | Project previews |

## Preview locally

```bash
git clone https://github.com/DarianRobert/DarianRobert.github.io.git
cd DarianRobert.github.io
python -m http.server 8000
```

Open `http://localhost:8000` in your browser. Stop the server with Ctrl+C. Google Fonts requires an internet connection; the CSS also specifies fallback fonts.

## Updating a project

Edit its entry in `index.html`, put any preview image in `images/`, and check the repository/report links. The project count appears in the hero and About sections. Changes on `main` are published by the existing GitHub Pages workflow.

Project repositories retain their team author credits and original history.
