# Atçylyk Portal — Design branch reconciliation

Base: `main` (commit `a7d3e8ddc81aa8a77e528c69f7b4719330c9f154`).
Target: `integration/design-update`.

## Scope
This branch is an isolated design integration workspace. Do not merge old branches blindly into main: the sources have diverged and may overwrite newer UI or asset-path fixes.

| Source branch | Intended design work | Review before porting |
| --- | --- | --- |
| `agent/catalog-redesign` | Horse catalog cards, search/filter presentation | `app/atlar/page.tsx` already changed in main |
| `agent/readable-tree-dashboard` | Pedigree/dashboard readability and CSS | Main has newer interactive pedigree; `app/seljerme/page.tsx` and `app/tohumçylyk/page.tsx` match source blob |
| `agent/aba-annayew-haa-logo` | Logo asset | Compare `public/logo.png` against current brand assets |
| `agent/fix-passport-links-and-contrast` | Passport links and contrast | `app/globals.css` matches source; verify links manually |
| `agent/passport-photo-editor` | Passport photograph editing | Main passport is longer and includes additional editing controls; do not replace wholesale |
| `agent/horse-stories-and-collections` | Horse collections UI | Main already contains `HorseCollectionPage`; retain newer asset handling |
| `agent/functional-settings` | Settings UI and permissions | `lib/usePortalSettings.ts` matches source blob; server-side authorization remains separate |

## Integration rules
1. Preserve the current `main` UI and do not overwrite whole components with older versions.
2. Extract only still-missing, demonstrably useful design changes into small commits.
3. Run `npm ci`, `npm run lint`, and `npm run build`.
4. Check catalog, pedigree, passport, settings, responsive layout, media paths and collection pages manually in a preview.
5. Merge this branch to `main` only after the test results and review are recorded.

## Status
- [x] Branch created from main.
- [x] Source branch comparison initiated.
- [ ] Remaining visual deltas extracted and selectively applied.
- [ ] CI/build and manual preview verified.
- [ ] Approved merge into main.

**No source branches are deleted. No merge into main has been performed.**
