# Climbing portfolio refinements

## What will change

- Cycle through the interest drawings automatically, drawing each in turn. Clicking an interest immediately draws it and restarts the cycle from that selection.
- Add a subtle recessed bolt hole to the centre of every climbing hold without changing the minimalist palette.
- Make hold placement deterministic so reloading produces the same wall, and prevent ordinary resizing from reshuffling the holds.
- Add two small climber silhouettes standing on the summit in the sunset scene.
- Replace the simple progress dash with a slim stacked-mountain route. Its warm line draws upward with climb progress using GSAP, while retaining the percentage.
- Support optional links per project. Linked projects get a compact box directly above the description; projects without links remain unchanged.

## Project links

- **Web Design:** Lake It or Leave It
- **Climbing Board:** project document
- **Video Editing:** two video links
- **Design of an SMP:** project document

All links open safely in a new tab.

## Technical details

- Use a seeded number generator for stable hold geometry and keep the generated layout in a ref across resize measurements.
- Animate the mountain route through SVG stroke progress with GSAP and respect reduced-motion preferences.
- Extend the project data with an optional labelled `links` list, then render it within the existing draggable story stack.
- Preserve the current black, chalk, and warm-orange visual system and existing climbing controls.

## Verification

- Check automatic and clicked interest transitions.
- Reload and resize at desktop widths to confirm holds remain stable and avoid content.
- Climb from bottom to top to verify mountain drawing and summit silhouettes.
- Open every supplied project link and confirm unlinked projects show no link box.
