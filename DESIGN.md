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

Huit salles conservées : cinq principalement au sol et trois à plateformes. Leur identité est indépendante de leur ordre, défini par `ROOM_ORDER`.

## Progression de difficulté

La difficulté augmente par les surprises à mémoriser, les pièges combinés et la longueur du trajet à refaire. La vitesse, la hauteur de saut et le délai d'effondrement restent constants. Aucun avertissement visuel n'est ajouté.

1. **Premier piège** : un trou caché raccourci, puis un seul obstacle visible, éloigné. Apprendre le principe sans enchaînement exigeant.
2. **Premier parcours en hauteur** : plateformes larges et un seul plafond piégé, avec davantage de temps pour quitter sa trajectoire.
3. **Appuis trompeurs** : plateforme traversable puis plateforme qui fuit, avec des surfaces de récupération larges.
4. **Fausse sécurité au sol** : plusieurs trous et un dernier sol qui s'ouvre près de la sortie.
5. **Surprises combinées** : obstacles visibles, pics surgissants et bloc tombant. Il faut désormais anticiper ou s'arrêter après avoir appris le piège.
6. **Mauvais réflexes** : sauter peut déclencher une embuscade, alors que les autres sections exigent de sauter. Mémoriser les exceptions.
7. **Parcours trompeur composé** : fuite, faux appui et disparition avant l'atterrissage.
8. **Final aller-retour** : la porte revient au départ et une ancienne portion sûre du sol devient piégée sur le retour.

Cette courbe est une intention de conception ; son ressenti doit être ajusté à partir des essais du joueur, et ne se déduit pas du seul fait que les tests trouvent un chemin gagnant.

Vérification : `node tests/game.cjs`. Les parcours enregistrés rejouent les huit salles sans mort ; les tests ciblés couvrent les effondrements, les faux appuis et le retour à la porte.
