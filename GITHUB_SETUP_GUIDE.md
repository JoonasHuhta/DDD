# 🚀 Projektin siirtäminen GitHubiin

Olen luonut sinulle `.gitignore`-tiedoston valmiiksi, jotta turhat tiedostot (kuten `node_modules`) eivät päädy GitHubiin. Tässä helpot askeleet projektin tallentamiseen:

## Vaihe 1: Lataa ja asenna Git
Jos sinulla ei ole vielä Gitiä asennettuna:
1. Lataa se osoitteesta: [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Asenna se oletusasetuksilla.

## Vaihe 2: Luo uusi repository GitHubissa
1. Kirjaudu sisään [GitHubiin](https://github.com/).
2. Klikkaa **"+"** -> **"New repository"**.
3. Anna nimeksi esim. `Dopamine-Dealer-Dan`.
4. Älä rasti "Add a README file" (koska meillä on se jo).
5. Klikkaa **"Create repository"**.

## Vaihe 3: Alusta Git ja lähetä koodi
Avaa terminaali tässä projektikansiossa (VS Codessa `Terminal` -> `New Terminal`) ja aja nämä komennot:

```bash
# 1. Alusta git
git init

# 2. Lisää kaikki tiedostot (muista luomani .gitignore!)
git add .

# 3. Tee ensimmäinen tallennus (commit)
git commit -m "Initial commit: Mobile optimized and audio fixed"

# 4. Vaihda päähaara nimeksi main
git branch -M main

# 5. Yhdistä GitHubiin (Kopioi tämä rivi GitHub-sivultasi!)
git remote add origin https://github.com/KÄYTTÄJÄNIMESI/Dopamine-Dealer-Dan.git

# 6. Lähetä koodi!
git push -u origin main
```

## Vaihe 4: Myöhemmin tehtävät päivitykset
Kun teen uusia muutoksia ja haluat ne GitHubiin:
```bash
git add .
git commit -m "Lisätty uusia ominaisuuksia"
git push
```

---
**Vinkki:** Jos haluat helpomman tavan, lataa [GitHub Desktop](https://desktop.github.com/). Se on visuaalinen ohjelma, jolla voit hoitaa saman ilman komentoja.
