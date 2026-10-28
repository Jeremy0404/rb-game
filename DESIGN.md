# Direction du jeu

Petit jeu 2D à trois commandes : gauche, droite, saut. Aucun dialogue.

Le plaisir recherché est la découverte d'un piège, la mort puis le nouvel essai en connaissant son fonctionnement. La précision et les cycles à synchroniser ne doivent pas devenir le sujet principal.

- Conserver les salles existantes ; ajouter et intercaler de nouvelles salles pour varier.
- Alterner sols qui se trouent, pics surprises, chutes d'objets, fausses surfaces et quelques passages à plateformes obligatoires.
- Aucune indication préalable de fragilité : ni fissure, couleur, tremblement, transparence, barre ni compte à rebours. Les surfaces intactes ont la même apparence.
- Effondrement rapide ; zones d'atterrissage généreuses. Des pièges déterministes permettent d'apprendre après une mort.
- Une porte qui fuit doit imposer un vrai trajet à refaire. La salle correspondante renvoie la porte au départ et interdit de gagner en la croisant pendant son déplacement.
- Redémarrage rapide au début de la salle.

## Version actuelle

Huit salles : cinq principalement au sol et trois à plateformes. Les quatre salles initiales sont conservées aux positions 1, 2, 4 et 6, avec des corrections de collisions et d'espacement. Les salles 3, 5, 7 et 8 ajoutent des pièges différents.

Vérification : `node tests/game.cjs`. Les parcours enregistrés rejouent les huit salles sans mort ; les tests ciblés couvrent les effondrements, les faux appuis et le retour à la porte.
