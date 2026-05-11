# USER STORIES RÉELLES — L'Atelier / AURA v5
*8 personas issus du cercle réel du founder — tissu artistique et associatif toulousain*

---

> **Méthode :** Les galères et besoins sont inférés de la logique métier du codebase et du contexte décrit. Les sections `[À INTERVIEWER PAR HAROLD]` signalent les points qui nécessitent une validation directe avec la personne.

---

## Persona 1 — L'Artiste Plasticien (vendeur d'œuvres + compta)

**Profil :** Peintre ou sculpteur indépendant, statut micro-entrepreneur ou artiste-auteur, vend en galerie et en direct, a un comptable une fois par an.

**Sa galère actuelle :**
Il jongle entre un carnet papier pour les ventes, un tableur Excel bricolé pour la compta, et Instagram pour montrer son travail. Chaque fin d'année, il passe 2 semaines à reconstituer son année fiscale pour son comptable. Il ne sait jamais en temps réel si son mois a été bon ou mauvais. Il oublie de provisionner les cotisations URSSAF et se retrouve à devoir payer d'un coup en janvier.

**Ce qu'il fait avec l'app (geste par geste) :**
- Il ouvre l'app après chaque vente, tape le montant, le nom de l'acheteur, et l'app calcule automatiquement sa réserve URSSAF (22% du revenu pro)
- Il prend en photo son justificatif de dépense matériel avec l'OCR Gemini → les champs se remplissent seuls
- Il ajoute ses œuvres en cours dans la galerie avec photo, prix, statut "en cours / terminé / vendu"
- Depuis le dashboard `/dashboard`, il voit en un coup d'œil : CA brut, réserve constituée, net estimé

**Le moment "ah ouais c'est cool" :**
Quand il réalise que la "Réserve" sur son dashboard a grossi automatiquement au fil des mois et qu'il n'a plus la surprise désagréable de janvier. Le chiffre est là, mis de côté mentalement, sans effort.

**Ce qui lui manque encore dans l'app actuelle :**
- ❌ Pas d'export PDF de sa compta (pour envoyer au comptable — voir `FEATURES_GAP.md` #11)
- ❌ Pas de récap mensuel automatique par mail (voir #12)
- 🚧 La galerie ne montre pas le total de CA par œuvre vendue (il faut aller dans Finances pour voir)
- ❌ Pas de mini-CRM acheteurs : il ne peut pas retrouver facilement "qui a acheté quoi"

---

## Persona 2 — L'Organisateur de Concerts Métal

**Profil :** Gère une asso loi 1901, organise 4–6 concerts/an dans des bars et salles de Toulouse, fait venir des groupes locaux et nationaux.

**Sa galère actuelle :**
Il communique via un groupe WhatsApp de 40 personnes, un Google Sheets pour les budgets, et Facebook Events pour les annonces publiques. Le jour J, il ne sait pas combien de personnes ont prévu de venir. La billetterie est gérée via HelloAsso ou Eventbrite avec des frais. Trouver de nouveaux groupes locaux = chercher sur Instagram pendant des heures.

**Ce qu'il fait avec l'app (geste par geste) :**
- Il crée une épingle sur la carte : type "Performance", adresse du bar, date du concert
- Il poste dans le salon "Broadcast" de son asso pour annoncer la date aux membres inscrits
- Il voit dans la section Réseau les artistes de Toulouse et peut les contacter directement

**Le moment "ah ouais c'est cool" :**
Quand il clique sur un profil artiste dans le réseau, voit ses œuvres (ou ses references musicales [À INTERVIEWER PAR HAROLD]), son Instagram, et peut le suivre — tout en restant dans l'app sans jongler entre 5 réseaux différents.

**Ce qui lui manque encore dans l'app actuelle :**
- ❌ Pas de bouton "J'y vais" sur les épingles carte (il ne peut pas estimer le public)
- ❌ Pas de génération de visuel Instagram pour l'event (voir #2)
- ❌ La page `/events` est un stub total — ses vrais événements ne peuvent pas y être créés
- ❌ Pas de billetterie intégrée (hors scope probable, mais fort besoin)

---

## Persona 3 — L'Animatrice d'Ateliers de Couture Itinérants

**Profil :** Gère une asso, anime des ateliers dans différents lieux (MJC, résidences, espaces associatifs), ses adhérentes se déplacent avec elle.

**Sa galère actuelle :**
Elle envoie des emails à une liste de diffusion pour annoncer le prochain atelier, souvent dans un lieu différent à chaque fois. Les inscriptions se font par email retour. Elle gère un fichier Excel de 60 adhérentes avec leur statut de paiement. Elle perd du temps à relancer les cotisations impayées chaque septembre.

**Ce qu'il fait avec l'app (geste par geste) :**
- Elle crée un atelier itinérant via `/ateliers` [BLOQUÉ - page stub]
- Elle épingle le lieu sur la carte : type "Atelier Ouvert", avec l'adresse du jour
- Elle gère ses 60 adhérentes dans `/members` : statut actif/inactif, montant de cotisation, date d'adhésion

**Le moment "ah ouais c'est cool" :**
Quand elle réalise que la liste des membres avec leur statut de paiement est accessible en 2 secondes depuis son téléphone, avant même de démarrer l'atelier — elle sait qui a payé sa cotisation et qui est en retard.

**Ce qui lui manque encore dans l'app actuelle :**
- ❌ La page `/ateliers` est entièrement hardcodée — elle ne peut pas créer ses propres ateliers
- ❌ Pas de système d'inscription aux ateliers depuis le front
- ❌ Pas de notification push "nouvel atelier annoncé" pour ses membres (voir #8)
- [À INTERVIEWER PAR HAROLD] : Est-ce qu'elle veut gérer les paiements de cotisation depuis l'app ?

---

## Persona 4 — Le Radionaute (voisin de bureau qui fait de la radio)

**Profil :** Animateur/producteur sur une radio associative ou webradio toulousaine (type Radio FMR, Radio Mon Amour, etc.), produit des émissions culturelles.

**Sa galère actuelle :**
Son émission existe sur les ondes mais a peu de visibilité en dehors des auditeurs habituels. Il annonce ses émissions sur sa page Facebook personnelle. Quand il invite un artiste local, il doit chercher ses coordonnées via des connaissances communes.

**Ce qu'il fait avec l'app (geste par geste) :**
- Il crée un profil "Artiste" (la radio comme discipline) [À INTERVIEWER PAR HAROLD : a-t-il besoin d'un rôle "media" distinct ?]
- Il ajoute une épingle sur la carte : type "Performance" (ou "Radio" si la feature existe), avec la fréquence et le lien streaming
- Il suit les artistes locaux dans le réseau pour les inviter dans son émission

**Le moment "ah ouais c'est cool" :**
Quand un artiste qu'il vient de suivre sur l'app lui envoie un message direct pour proposer une interview — sans passer par Instagram DM ou email.
[À INTERVIEWER PAR HAROLD : utilise-t-il vraiment les DM de l'app, ou préfère-t-il un lien vers ses réseaux ?]

**Ce qui lui manque encore dans l'app actuelle :**
- ❌ Pas de type de pin "Radio" sur la carte (seulement exposition/performance/atelier/flash)
- ❌ Pas de champ "fréquence FM" ou "lien streaming" sur le profil
- ❌ Pas de messagerie directe entre utilisateurs (voir `FEATURES_GAP.md` — non listé mais critique)

---

## Persona 5 — L'Asso qui fait passer des Artistes en Radio

**Profil :** Association qui organise des sessions de passage radio pour artistes locaux (partenariats avec radios associatives), gère le planning et les relations artistes/radios.

**Sa galère actuelle :**
Coordonne par email et tableur : quel artiste passe à quelle radio, à quelle date, pour quelle durée. Les artistes ne savent pas toujours quand leur passage est diffusé en rediff.

**Ce qu'il fait avec l'app :**
- Crée des événements "Passage Radio" sur la carte (épingle sur la station de radio)
- Gère ses artistes partenaires dans la liste des membres
- Utilise le salon Broadcast pour annoncer les passages à venir

**Le moment "ah ouais c'est cool" :**
Quand elle voit tous ses passages radio de l'année sur la carte, avec les artistes liés à chaque épingle — une visualisation qu'elle n'avait jamais eu avant.

**Ce qui lui manque encore dans l'app actuelle :**
- ❌ Pas de lien "j'ai joué pour / ils ont joué chez nous" (graphe des collaborations, voir #14)
- ❌ Pas de type d'événement spécifique "Passage Radio"
- [À INTERVIEWER PAR HAROLD] : Les artistes qu'elle fait passer sont-ils inscrits sur l'app ou juste dans son CRM ?

---

## Persona 6 — L'Asso de DJs et Événements

**Profil :** Collectif qui gère des DJs, organise des soirées dans des clubs/bars/espaces culturels, production d'événements musicaux électroniques.

**Sa galère actuelle :**
Gère les bookings DJs sur WhatsApp, les événements sur Facebook et Resident Advisor. Pas de CRM des lieux partenaires. Difficile de savoir quels DJs sont disponibles à quelle date.

**Ce qu'il fait avec l'app :**
- Épingle ses soirées sur la carte (type "Performance")
- Liste ses DJs comme membres de l'asso
- Suit les artistes / autres assos sur le réseau pour découvrir des collaborations potentielles

**Le moment "ah ouais c'est cool" :**
Quand il découvre un artiste qui a épinglé une "Rencontre Flash" au même endroit que lui — et qu'il peut le suivre et voir son profil en 2 clics.

**Ce qui lui manque encore dans l'app actuelle :**
- ❌ Pas d'agenda consolidé des soirées (la carte est géographique, pas calendaire)
- ❌ Pas de "Page Aujourd'hui à Toulouse" (voir #7)
- ❌ Pas de génération de visuel pour les stories Instagram (voir #2)

---

## Persona 7 — L'Asso de Maraude / Aide aux SDF

**Profil :** Association solidaire qui organise des maraudes nocturnes, distribution de repas, orientation vers les services sociaux. Profil très différent des précédents — non artistique, mais fait partie du tissu associatif local.

**Sa galère actuelle :**
Coordonne les bénévoles par groupe Signal. Pas de gestion de membres formelle. Les maraudes ne sont pas cartographiées. Difficile de recruter de nouveaux bénévoles en dehors du bouche-à-oreille.

**Ce qu'il fait avec l'app :**
[À INTERVIEWER PAR HAROLD — ce persona est très différent des autres. Est-ce que L'Atelier est pertinent pour ce cas d'usage ? La carte et le réseau pourraient servir pour signaler des besoins ponctuels, mais le core de l'app est artistique/culturel. À valider avec Harold.]

**Le moment "ah ouais c'est cool" :**
[À INTERVIEWER PAR HAROLD]

**Ce qui lui manque :**
- L'app n'a pas de concept de "cause sociale" ou "aide solidaire" dans ses types d'activités
- Une épingle "Maraude ce soir" sur la carte pourrait être utile pour mobiliser des bénévoles de dernière minute — c'est proche du concept "Rencontre Flash"

---

## Persona 8 — L'Asso de Logement pour Artistes (résidence)

**Profil :** Association qui gère des logements-ateliers pour artistes en résidence (type Maison des Arts, résidence artistique), sélectionne des artistes sur dossier, organise des temps de restitution.

**Sa galère actuelle :**
Reçoit les dossiers de candidature par email, gère la sélection sur tableur. Les résidents actuels sont peu visibles à l'extérieur. La logistique des temps forts (vernissages, journées portes ouvertes) est gérée via Mailchimp + Facebook.

**Ce qu'il fait avec l'app :**
- Crée son profil Association avec le nom de la résidence
- Liste ses résidents actuels comme membres
- Épingle les événements de restitution (vernissages, portes ouvertes) sur la carte : type "Atelier Ouvert"
- Suit et met en avant les artistes résidents dans le réseau

**Le moment "ah ouais c'est cool" :**
Quand un artiste candidat à la résidence découvre l'asso sur la carte, voit les derniers vernissages épinglés, les profils des résidents, et peut suivre l'asso — tout ça avant même d'envoyer son dossier.

**Ce qui lui manque encore dans l'app actuelle :**
- ❌ Pas d'annuaire des résidences sans inscription obligatoire (voir #6)
- ❌ Pas d'affiliations entre assos (résidence ↔ partenaires institutionnels, voir #9)
- ❌ Pas de page "Candidater" / formulaire de dossier (hors scope probable)
- [À INTERVIEWER PAR HAROLD] : Est-ce que l'asso veut que ses résidents aient leurs propres profils artistes liés à l'asso sur la carte ?
