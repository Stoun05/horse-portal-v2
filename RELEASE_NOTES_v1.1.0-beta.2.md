# v1.1.0-beta.2 — Web portal

## Üýtgetmeler
- Akýol, Kanun, Gyrat, Hanbeg, Miras, Polatly, Ruhybelent we Toýly atlarynyň katalog surat ýollary birikdirildi.
- Wideo / Suratlar bölümi GitHub-da `public/horses/` astynda ýerleşýän suratlary we wideolary okaýar.
- Her at üçin `public/horses/<slug>/photos/` we `public/horses/<slug>/videos/` gurluşy goldanylýar.
- Öňki `public/horses/<slug>.webp` ýa-da `.png` faýllary hem goldanylýar.
- Täze media faýllary GitHub raw salgysy arkaly görkezilýär; täzelenen GitHub sanawy açylanda alynýar.
- Brauzerdäki ýerli media IndexedDB-de saklanmagyny dowam etdirýär.
- Statiki eksport bilen sazlaşmaýan server API aýryldy.

## Çäklendirmeler
- Akhan üçin esasy at pasporty katalogda entek döredilmedi; diňe media faýllary at boýunça görkezilýär.
- GitHub media sanawy internet we GitHub API elýeterliligine bagly.
- Brauzerden Media goş arkaly ýüklenýän faýllar merkezi sinhronizasiýa edilmeýär.
- Taslamanyň barlanan package.json içinde Electron/Windows installer build ýok; bu wersiýa web üçin.
- Media faýllary GitHub-a aýratyn ýüklenýär. GitHub-da boş papkalar saklanmaýar.

## GitHub-da media üçin gurluş
```
public/horses/akhan/photos/akhan-01.webp
public/horses/akhan/videos/akhan-01.mp4
```

## Synag
Vercel-de bu release commitiniň build netijesi aýratyn tassyklanmaly.
