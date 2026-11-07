# Witchy Portfolio ✦

**Live site:** https://main.d3torq8kgl7g85.amplifyapp.com/

The portfolio of **Sarah Chowdhury**, aspiring platform and operations engineer, built for the
**AWS Student Builder Challenge: Build Your Tech Superpower** and hosted on **AWS Amplify Hosting**.

It has two parts:

1. **The portfolio page:** About me, Skills, Projects, Experience, Certifications and Contact, in a
   pastel pixel style that is easy to read and navigate.
2. **The Spell Station** (press **✦ Explore ✦**): a night-time pixel potion shop where you brew my
   skills together to discover what I built with them.

## The Spell Station

I love cozy pixel games, my favourite being Stardew Valley, and the magic of my favourite manga,
*Witch Hat Atelier*. The Spell Station is where those meet my work.

- **Pick two bottles** from the shelves (skills on the left, topics on the right) by clicking,
  tapping, dragging, or using the keyboard.
- **Brew** in the cauldron. If I have used both together, glowing orbs carry the result to the
  window, where the matching projects and jobs appear.
- **Fizzles** suggest a pair that does work. **Secret recipes** hidden in a few mixes tell you
  things about me that aren't on my résumé.
- **Luna**, the shop cat, sleeps on the shelf. Give her a pet.
- **How to brew** in the header starts a short guided tour. A welcome from me plays on your first visit.

Entering the station plays a bubbling-cauldron animation. Sound effects (pop, sparkle, meow) only
play after you do something and can be muted with the ♪ button.

## Accessibility

- WCAG 2.2 AA checked with axe on desktop and phone widths (0 violations); Lighthouse accessibility 100
  on the portfolio page.
- Everything works by keyboard: skip link, visible focus, focus kept inside the station while it is
  open, Esc to leave, screen reader announcements for picks and results.
- `prefers-reduced-motion` turns off the entry animation and brewing effects.
- Body text uses Atkinson Hyperlegible, a font designed for low-vision readers; pixel fonts are only
  used for headings and buttons.

## Tech stack

| Part | Choice |
| --- | --- |
| Build | Vite + TypeScript (no framework) |
| Portfolio page | Plain HTML/CSS rendered from `src/content.json` |
| Spell Station | Plain DOM + CSS + Web Animations API, lazy-loaded when you press Explore |
| Content | One file, `src/content.json`: profile, projects, jobs, skills, flask tags, secret recipes |
| Tests | `node --test`: every skill pair is checked against the content, every fizzle's hint must lead to a real match, every tag must exist. Tests run in the build, so a content mistake fails the deploy instead of breaking the live site |
| Hosting | AWS Amplify Hosting, connected to this GitHub repo |

## AWS setup

- **AWS Amplify Hosting** serves the site from the `main` branch.
- Every push to `main` triggers an Amplify build (CI/CD from GitHub) using `amplify.yml`:
  Node 22 → `npm ci` → `npm run build` (type-check, tests, Vite build) → deploy `dist/`.
- Work happens on `dev`; `main` only moves when a stage's checks pass, and every stage is tagged
  (`stage-0-setup` … `stage-8-cat`) so any version can be rolled back.

## Run it locally

```bash
npm install
npm run dev      # local dev server
npm test         # content + brewing logic tests
npm run build    # type-check, test and build to dist/
```

## Project structure

```
index.html              portfolio page
src/content.json        all content (single source of truth)
src/site/               portfolio page script + styles
src/station/            Spell Station: scene, brewing logic, effects, sounds, welcome, tutorial, Luna
public/assets/          sprites and sounds
tests/                  node --test suite
amplify.yml             Amplify build settings
```

## Credits

| Asset | Creator | Source |
| --- | --- | --- |
| Potion and spark sprites (recoloured to pastel) | Brysiaa | [Pixel potions 16x16](https://brysiaa.itch.io/pixel-potions-16x16-px) |
| Sleeping black cat | Toffeecraft | [Cat Sleeping Animation FREE](https://toffeecraft.itch.io/cat-sleeping-animation-free) |
| Cat meow, pop | Dragon Studio | [Pixabay](https://pixabay.com/sound-effects/) |
| Sparkle sounds | humordome, koiroylers, shidenbeatsmusic | [Pixabay](https://pixabay.com/sound-effects/) |
| Fonts | Jersey 10, Atkinson Hyperlegible | [Google Fonts](https://fonts.google.com/) |

The cauldron, window, shelves, plant, books and candle are hand-coded pixel art. Sprites and sounds
belong to their creators and are not licensed for reuse from this repository.

## Contact

- Email: sarahchowdhurycontact@gmail.com
- GitHub: [sarah-chowdhury4](https://github.com/sarah-chowdhury4)
- LinkedIn: [sarah--chowdhury](https://www.linkedin.com/in/sarah--chowdhury)
