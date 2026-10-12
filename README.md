# Portfolio site

A static site with no build step. Open `index.html` in a browser to preview it.

## Publish on GitHub Pages

1. Create a repository named `YOUR-USERNAME.github.io` (or any name, then use the project URL).
2. Upload everything in this folder to the repository root.
3. In the repository, go to Settings, then Pages, and choose the `main` branch and the `/ (root)` folder.
4. The site appears at `https://YOUR-USERNAME.github.io` within a minute or two.

## Edit your content

Almost everything you will want to change is in `js/data.js`:

- `config`: your GitHub, LinkedIn and Google Scholar links. A link left empty is hidden from the page.
- `projects`: one entry per project. Add a `fig` entry to show an image.
- `courses`, `tools`, and the thesis `steps` and `results`.

Page text that does not come from `data.js` is in `index.html`.

## Files

- `assets/img`: figures (WebP).
- `assets/zones`: the five zone layers for the hero map.
- `assets/cv.pdf`: the CV behind the Download CV button. Replace it with a version that leaves out your home address and phone number if you prefer.

## Credits

The zone map and the paper figures come from the published article (CC BY 4.0). Studio reports were written in teams, and each project shows its team size.
