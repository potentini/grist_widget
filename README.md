# grist-ub-mailmerge-widget

Widget de publipostage avancé pour [Grist](https://www.getgrist.com?utm_source=chatgpt.com) permettant de générer des fiches, comptes-rendus ou documents institutionnels à partir des enregistrements d’une table.

Le widget propose :

* un système libre de mapping des champs ;
* une mise en page configurable ;
* un aperçu temps réel ;
* l’export PDF ;
* la navigation entre enregistrements ;
* la génération multi-documents.

Ce projet a été conçu initialement pour des usages de gouvernance et de pilotage institutionnel à l’université de Bordeaux, mais peut être réutilisé pour tout besoin de publipostage dans Grist.

---

# Fonctionnalités

## Mapping libre des champs

Le widget permet :

* d’ajouter/supprimer des sections ;
* d’ajouter/supprimer des lignes ;
* d’associer librement les colonnes Grist aux champs affichés ;
* de personnaliser les libellés affichés.

## Mise en page configurable

Possibilité de configurer :

* titre du document ;
* sous-titre ;
* couleurs ;
* polices ;
* tailles de texte ;
* espacement vertical ;
* taille du logo ;
* largeur du document.

## Gestion du logo

Trois modes disponibles :

* logo par URL ;
* logo local importé ;
* sans logo.

## Aperçu temps réel

Le document est rendu instantanément dans une prévisualisation A4.

## Navigation entre enregistrements

Le widget peut :

* suivre la ligne active Grist ;
* naviguer entre les enregistrements ;
* afficher les données liées à une vue source.

## Export PDF

Export possible :

* de la fiche courante ;
* de plusieurs fiches dans un PDF unique ;
* d’un PDF par enregistrement.

## Persistance des réglages

Les mappings et paramètres peuvent être sauvegardés :

* via les options Grist (`grist.setOption`) lorsque le widget est hébergé ;
* ou via `localStorage` dans le Custom Widget Builder.

---

# Captures d’écran

*Ajouter ici vos captures du widget.*

---

# Installation

## Option 1 — GitHub Pages (recommandé)

1. Forker ou cloner le dépôt.
2. Activer GitHub Pages dans :

   * `Settings`
   * `Pages`
3. Choisir :

   * Branch : `main`
   * Folder : `/root`
4. Récupérer l’URL GitHub Pages.

Exemple :

```text
https://mon-compte.github.io/grist-ub-mailmerge-widget/
```

5. Dans Grist :

   * Ajouter un widget personnalisé ;
   * Sélectionner une table source ;
   * Coller l’URL GitHub Pages.

---

## Option 2 — Custom Widget Builder

Le widget peut également être testé directement dans le Custom Widget Builder de Grist.

Limites connues :

* certaines fonctions de liaison entre vues peuvent être indisponibles ;
* les options Grist (`setOption`, `onOptions`) peuvent être partiellement supportées ;
* la persistance utilise alors `localStorage`.

---

# Structure du projet

```text
/
├── index.html
├── widget.js
├── README.md
└── assets/
```

---

# Technologies utilisées

* HTML5
* CSS3
* JavaScript Vanilla
* API Widgets Grist

API utilisée :

```html
https://docs.getgrist.com/grist-plugin-api.js
```

---

# Fonctionnement avec Grist

Le widget utilise principalement :

* `grist.ready()`
* `grist.onRecord()`
* `grist.onRecords()`
* `grist.setOption()`
* `grist.onOptions()`

---

# Roadmap

## Prévu

* templates multiples ;
* export DOCX ;
* mode paysage ;
* pagination avancée ;
* champs conditionnels ;
* répétition automatique de blocs ;
* en-têtes/pieds de page ;
* signature électronique ;
* thèmes prédéfinis ;
* support markdown/rich text ;
* images dynamiques depuis les colonnes Grist.

## Idées futures

* génération automatique de comptes-rendus ;
* fusion multi-tables ;
* publipostage emailing ;
* export ZIP ;
* génération batch planifiée.

---

# Compatibilité

Testé avec :

* Grist SaaS ;
* Custom Widget Builder ;
* Chrome ;
* Edge.

---

# Licence

MIT License

---

# Auteur

Projet développé par C M 
