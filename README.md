# grist-ub-mailmerge-widget

Widget de publipostage pour Grist permettant de générer des fiches à partir des enregistrements d’une table liée.

## Fonctionnalités

* Mapping libre des champs (sections, lignes, libellés, colonnes associées).
* Mise en page configurable (titres, couleurs, polices, tailles, espacements, logo).
* Aperçu A4 en temps réel.
* Navigation entre enregistrements (ligne active + précédent/suivant).
* Export PDF de la fiche courante, de toutes les fiches, ou un fichier par enregistrement.

## Persistance des réglages

Les paramètres du widget (mapping, style, structure des sections) sont sauvegardés dans le navigateur via `localStorage`.

Cette approche évite les erreurs liées aux APIs d’options Grist dans certains contextes d’exécution de widgets par URL.

## Intégration Grist

Le widget utilise :

* `grist.ready({ requiredAccess: 'read table' })`
* `grist.onRecord()`
* `grist.onRecords()`

Il ne dépend pas de `grist.onOptions`, `grist.setOption`, `grist.setOptions`, `grist.getOption`, `grist.getOptions`, `grist.docApi` ou `grist.widgetApi`.

## Installation dans Grist

1. Ajouter un widget personnalisé dans un document Grist.
2. Choisir une table source.
3. Renseigner l’URL du widget.
4. Lier la vue pour transmettre la ligne active.

## Usage

### 1) Configurer le modèle

* Ajouter/supprimer des sections.
* Ajouter/supprimer des lignes.
* Associer chaque ligne à une colonne Grist.
* Personnaliser les libellés affichés.

### 2) Ajuster la mise en page

* Définir titre et sous-titre.
* Choisir les couleurs et polices.
* Ajuster tailles, marges et espacements.
* Choisir le mode logo (URL, import local, sans logo).

### 3) Générer et exporter

* Vérifier l’aperçu de la ligne active.
* Naviguer entre les enregistrements.
* Imprimer la fiche ou exporter en PDF.

## Structure du projet

```text
/
├── index.html
├── widget.js
└── README.md
```

## Technologies

* HTML5
* CSS3
* JavaScript (Vanilla)
* API Widgets Grist

## Compatibilité

* Grist (vue liée)
* Navigateurs modernes (Chrome, Edge)

## Licence

MIT License
