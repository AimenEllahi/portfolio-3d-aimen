# Portfolio audit — 21 October 2026

Checked the optimized Next.js build in desktop Chromium (1280 × 720), iPhone 15 emulation, a 390 × 844 viewport, and reduced motion mode. Also checked the home page, `/configurator`, `/web3`, section links, color selection, and a downloaded build file. Browser emulation does not establish frame rates on a physical phone.

## Fixed in this pass

- Hero name was too dark and spaced far apart on phones. It now has readable text, a clear work link, an accessible heading, and a static loading fallback.
- The fixed WebGL canvas obscured navigation and hero copy in the production browser. Screen blending preserves the text layer.
- Navigation scrolled without updating the URL; direct `/#about` and `/#contact` links could stall or land incorrectly. Links now preserve hashes and land below the header. Browser scroll restoration is preserved.
- The custom desktop cursor covered content. The system cursor is restored.
- The blurred portrait required hover or press and hold to reveal. The portrait is now visible immediately.
- The mobile configurator did not explain that its parts list scrolls sideways. It now does.
- Configurator “Save” and “Request Quote” had no actions. The page now downloads build JSON and opens a prefilled quote email. The color controls were tested on an emulated phone.
- Artificial loading delays were removed. The home page defers the car viewer until nearby and pauses it, the hero scene, and the shader when offscreen. Mobile rendering uses a lower pixel ratio.
- Audio initialization no longer runs on scroll or mouse movement. The configurator interaction is clear of console warnings.
- Added a skip link, visible keyboard focus, reduced motion behavior, darker theme metadata, route titles, and a way back from `/web3`.
- The desktop project card link becomes visible on keyboard focus. The inactive stacked cards cannot receive keyboard focus before reveal.
- The unused “coming soon” chat bubble is hidden on phones, where it covered content.

## Still worth addressing

1. **Chat endpoint before launch:** `src/app/api/chat/route.ts` is uncommitted work and was not edited. It validates only the last message; earlier messages can carry arbitrary roles and lengths. Add validation for every turn, a request size limit, a timeout, and rate limiting before connecting the teaser to this public API. The chat context also has a LinkedIn URL that differs from the contact page.
2. **Configurator load:** `public/models/car.glb` is 13 MB. The full configurator route loads about 489 kB of first load JavaScript, and its environment map comes from GitHub. Compress the model and textures, consider a small mobile asset, and host the HDR locally. Test frame time on a physical low power phone.
3. **Unfinished Web3 content:** `/web3` offers “Code Examples” and “Live Demo” tabs that only show placeholder text. Add real examples or remove those tabs before linking the page publicly.
4. **Some helper copy remains dim:** labels in `src/components/ui/VoronoiShaderSection.tsx` and mobile configurator hints use white at 20–40% opacity. Raise contrast for any text needed to use the feature.
5. **Project evidence:** the selected work cards contain descriptions and links but no visual previews. A consistent image or short still from each project would make the portfolio easier to scan.
6. **Image optimization:** production logged a recommendation to install `sharp`. The current profile image is small; install it if server image transformations become a measurable bottleneck.

The production build, type check, and lint pass. Direct section links, an iPhone sized layout without horizontal overflow, reduced motion, color selection, and JSON download were verified in a browser.
