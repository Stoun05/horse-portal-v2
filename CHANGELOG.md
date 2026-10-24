# Changelog

## [1.1.0-beta.1] — 2026-10-24 (beta candidate)

### Added
- Akhan horse record in the catalog, based on documented facts.
- Electron desktop offline store, encrypted local data operations and sync components.
- Searchable horse picker in the media gallery.

### Changed
- Compact media empty state and dynamic horse counts.
- Horse passport presentation and catalogue navigation.
- Windows installer versioning and artifact names now use the package version.

### Known limitations
- Media files live in browser IndexedDB and are not synchronized across devices.
- Normal web catalogue uses localStorage; encrypted Electron offline store is a separate data path.
- Desktop sign-in/offline grants require configured backend and trusted public signing key.
- Windows installer and real Windows restart/persistence smoke tests must pass before publishing this beta as verified.

### Validation
- Web branch, local server and offline module CI succeeded on pre-release commit 6e42818.
- Windows installer for this specific beta must be verified separately.
