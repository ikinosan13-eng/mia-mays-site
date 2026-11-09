Nunito (variable, wght 400–800) и Caveat (600) — self-host, один woff2 на семейство: ASCII + «» … — + базовая кириллица.
Источник: github.com/google/fonts (ofl/nunito, ofl/caveat). Лицензия: SIL Open Font License 1.1 — https://openfontlicense.org
Сборка (fonttools + brotli):
  fonttools varLib.instancer Nunito[wght].ttf wght=400:800 -o n.ttf
  pyftsubset n.ttf --unicodes="U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2010-2027,U+2030-203A,U+2116,U+2122,U+2190-2193,U+2212" --flavor=woff2 --layout-features=kern,liga,calt,locl,tnum,lnum --output-file=nunito.woff2
  fonttools varLib.instancer Caveat[wght].ttf wght=600 -o c.ttf
  pyftsubset c.ttf --unicodes="U+0020-007E,U+00A0,U+00AB,U+00B7,U+00BB,U+0401,U+0410-044F,U+0451,U+2013-2014,U+2019,U+201C-201E,U+2026,U+2116,U+2661,U+2665" --flavor=woff2 --layout-features=kern --output-file=caveat.woff2
