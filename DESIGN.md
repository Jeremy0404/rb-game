# Direction du jeu

Petit jeu 2D à trois commandes : gauche, droite, saut. Aucun dialogue.

Le plaisir recherché est la découverte d'un piège, la mort puis le nouvel essai en connaissant son fonctionnement. La précision et les cycles à synchroniser ne doivent pas devenir le sujet principal.

- Conserver les salles existantes ; ajouter et intercaler de nouvelles salles pour varier.
- Alterner sols qui se trouent, pics surprises, chutes d'objets, fausses surfaces et quelques passages à plateformes obligatoires.
- Aucune indication préalable de fragilité : ni fissure, couleur, tremblement, transparence, barre ni compte à rebours. Les surfaces intactes ont la même apparence.
- Effondrement rapide ; zones d'atterrissage généreuses. Des pièges déterministes permettent d'apprendre après une mort.
- Une porte qui fuit doit imposer un vrai trajet à refaire. La salle correspondante renvoie la porte au départ et interdit de gagner en la croisant pendant son déplacement.
- Redémarrage rapide au début de la salle.
- Un piège doit avoir une conséquence réelle : un joueur qui vise l'ancien emplacement ou tombe au centre d'une fausse plateforme doit rater son atterrissage. Un autre appui directement dessous ne doit pas le sauver automatiquement. Conserver un trajet gagnant après apprentissage.

## Version actuelle

Huit salles conservées : cinq principalement au sol et trois à plateformes. Leur identité est indépendante de leur ordre, défini par `ROOM_ORDER`.

## Progression de difficulté

La difficulté augmente par les surprises à mémoriser, les pièges combinés et la longueur du trajet à refaire. La vitesse, la hauteur de saut et le délai d'effondrement restent constants. Aucun avertissement visuel n'est ajouté.

1. **Premier piège** : un trou caché raccourci, puis un seul obstacle visible, éloigné. Apprendre le principe sans enchaînement exigeant.
2. **Premier parcours en hauteur** : plateformes larges, première scie verticale lente et plafond piégé avec davantage de temps pour quitter sa trajectoire.
3. **Appuis trompeurs** : faux appui au-dessus du vide, chemin inférieur décalé et plateforme qui fuit de 110 pixels. Le dernier appui est nécessaire pour monter à la sortie.
4. **Fausse sécurité au sol** : plusieurs trous, une scie verticale lente et un dernier sol qui s'ouvre près de la sortie.
5. **Surprises combinées** : obstacles visibles, pics surgissants et trou visible de 85 pixels. Le bloc tombe sur le rebord juste avant le trou, où le joueur est tenté de s'arrêter.
6. **Mauvais réflexes** : sauter peut déclencher une embuscade, alors que les autres sections exigent de sauter. Une scie traverse horizontalement à 1 050 pixels/seconde au premier passage d'un seuil ; elle quitte ensuite la salle.
7. **Parcours trompeur composé** : fuite de 110 pixels, faux appui et disparition avant l'atterrissage. Les appuis inférieurs sont décalés pour demander un choix de trajectoire et éviter les sauvetages automatiques.
8. **Final en trois trajets** : aller à droite, retour à gauche, puis troisième passage à droite. La porte repart à sa position initiale lorsque le joueur revient presque au départ. Le retour ouvre un premier trou ; le troisième trajet conserve ce trou, en ouvre un autre et déclenche une scie horizontale à 1 150 pixels/seconde. La porte ne valide la victoire qu'une fois revenue à droite au troisième trajet. Une mort réinitialise les trois étapes.

Les scies lentes ont une course verticale de 48 pixels. Les scies rapides sont des embuscades déterministes déclenchées par le joueur, pas des passages aléatoires. Le dessin et la collision circulaire partagent la même position et le même rayon.

Cette courbe est une intention de conception ; son ressenti doit être ajusté à partir des essais du joueur, et ne se déduit pas du seul fait que les tests trouvent un chemin gagnant.

Vérification : `node tests/game.cjs`. Les parcours enregistrés rejouent les huit salles sans mort ; les tests ciblés couvrent les effondrements, les faux appuis et le retour à la porte.
