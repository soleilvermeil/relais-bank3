import type { Product } from "@/data/catalog";

export type ProductReview = {
  rating: 1 | 2 | 3 | 4 | 5;
  en: {
    title: string;
    body: string;
  };
  fr: {
    title: string;
    body: string;
  };
};

export const productReviewsById: Partial<Record<Product["id"], ProductReview[]>> = {
  "lap-chipnest-student-14": [
    {
      rating: 5,
      en: {
        title: "Honestly impressed by this one",
        body: "I use it every day for work and it has been excellent so far. It starts fast, stays smooth, and I actually enjoy typing on it.",
      },
      fr: {
        title: "Franchement impressionné par ce modèle",
        body: "Je l'utilise tous les jours pour le travail et, pour l'instant, il est excellent. Il démarre vite, reste fluide, et j'aime vraiment taper dessus.",
      },
    },
  ],
  "lap-chipnest-basic-15": [
    {
      rating: 2,
      en: {
        title: "I regret buying this one",
        body: "I only use it for basic stuff, and even then it feels slow. With a few tabs open it starts lagging, and for me the battery life is really disappointing.",
      },
      fr: {
        title: "Je regrette cet achat",
        body: "Je l'utilise seulement pour des choses basiques, et même là il paraît lent. Avec quelques onglets ouverts il rame, et l'autonomie me déçoit vraiment.",
      },
    },
  ],
  "lap-chipnest-flex-14": [
    {
      rating: 4,
      en: {
        title: "Good value, with a few limits",
        body: "I think this is a good laptop for school and everyday office tasks. The screen is pleasant, but it slows down a bit when I push multitasking too far.",
      },
      fr: {
        title: "Bon rapport qualité-prix, avec des limites",
        body: "Pour moi c'est un bon portable pour les cours et la bureautique du quotidien. L'écran est agréable, mais il ralentit quand je pousse trop le multitâche.",
      },
    },
  ],
  "lap-novaforge-pro-16": [
    {
      rating: 5,
      en: {
        title: "Best laptop I have used for work",
        body: "I run heavy apps all day and this machine stays fast and stable. For me it just works, every single day.",
      },
      fr: {
        title: "Le meilleur portable que j'ai eu pour le boulot",
        body: "Je lance des applis lourdes toute la journée et il reste rapide et stable. Pour moi, il fait juste le job, tous les jours.",
      },
    },
  ],
  "lap-novaforge-studio-air": [
    {
      rating: 2,
      en: {
        title: "Looks premium, performs badly",
        body: "I wanted to love it because the build looks great. In real use, battery drain is rough and I keep hearing the fan for tasks that should be easy.",
      },
      fr: {
        title: "Aspect premium, performances mauvaises",
        body: "Je voulais l'aimer parce qu'il est très beau. En usage réel, la batterie descend vite et j'entends le ventilateur pour des tâches simples.",
      },
    },
  ],
  "lap-novaforge-everyday-14": [
    {
      rating: 4,
      en: {
        title: "Solid daily laptop",
        body: "I use this for normal productivity and it feels reliable and quick enough. My only complaint is the limited ports.",
      },
      fr: {
        title: "Portable solide au quotidien",
        body: "Je m'en sers pour de la productivité classique et il est fiable, assez rapide. Mon seul vrai reproche, c'est le nombre limité de ports.",
      },
    },
  ],
  "lap-voltedge-zen-15": [
    {
      rating: 4,
      en: {
        title: "Good mid-range pick",
        body: "I am happy with the performance for work and media, and the build feels sturdy. It does get a bit loud under heavier load.",
      },
      fr: {
        title: "Bon choix milieu de gamme",
        body: "Je suis content des perfs pour le travail et les médias, et la construction semble solide. Il devient un peu bruyant sous forte charge.",
      },
    },
  ],
  "lap-voltedge-work-15": [
    {
      rating: 3,
      en: {
        title: "Meh, does the minimum",
        body: "For me it is okay for browser tabs and documents, nothing more. App switching feels slow and the speakers are pretty average.",
      },
      fr: {
        title: "Bof, il fait le minimum",
        body: "Pour moi il passe pour des onglets web et des documents, sans plus. Le passage entre applis est lent et les haut-parleurs sont très moyens.",
      },
    },
  ],
  "lap-voltedge-lite-14": [
    {
      rating: 3,
      en: {
        title: "Light but only average",
        body: "I like how easy it is to carry around. Performance is just okay, and it starts struggling when I open too many things.",
      },
      fr: {
        title: "Léger mais seulement moyen",
        body: "J'aime son format facile à transporter. Les performances sont juste correctes, et il galère quand j'ouvre trop de choses.",
      },
    },
  ],
  "lap-luminakey-show-16": [
    {
      rating: 5,
      en: {
        title: "Fantastic screen and speed",
        body: "I bought it for work and movies, and it has been excellent at both. The screen is beautiful and everything feels fast.",
      },
      fr: {
        title: "Écran incroyable et super rapide",
        body: "Je l'ai acheté pour le boulot et les films, et il est excellent dans les deux cas. L'écran est superbe et tout est fluide.",
      },
    },
  ],
  "lap-luminakey-glide-13": [
    {
      rating: 3,
      en: {
        title: "Nice size, underwhelming power",
        body: "I love the compact format and the screen is nice to read. Still, for the price, I expected better real-world speed.",
      },
      fr: {
        title: "Bon format, puissance décevante",
        body: "J'adore le format compact et l'écran est agréable à lire. Mais à ce prix, j'attendais mieux en vitesse réelle.",
      },
    },
  ],
  "lap-luminakey-pulse-14": [
    {
      rating: 4,
      en: {
        title: "Good all-round laptop",
        body: "I have had a good experience overall: responsive for daily tasks and solid build quality. It just gets fingerprint marks very quickly.",
      },
      fr: {
        title: "Bon portable polyvalent",
        body: "Globalement j'ai une bonne expérience : réactif au quotidien et bien construit. Il prend juste les traces de doigts très vite.",
      },
    },
  ],
  "hea-auricle-go-wired": [
    {
      rating: 5,
      en: {
        title: "Great for calls all day",
        body: "I use it for meetings every day and voices sound clear on both sides. Comfort is excellent even after long calls.",
      },
      fr: {
        title: "Excellent pour les appels toute la journée",
        body: "Je l'utilise pour mes réunions tous les jours et les voix sont claires des deux côtés. Le confort reste excellent même après de longs appels.",
      },
    },
  ],
  "hea-auricle-quiet-pro": [
    {
      rating: 5,
      en: {
        title: "Worth it for me",
        body: "I was skeptical, but this headset is excellent. Sound is detailed, call quality is stable, and I keep reaching for it.",
      },
      fr: {
        title: "Pour moi, il vaut le prix",
        body: "J'étais sceptique, mais ce casque est excellent. Le son est détaillé, les appels sont stables, et je reviens toujours à celui-ci.",
      },
    },
  ],
  "hea-auricle-desk-one": [
    {
      rating: 4,
      en: {
        title: "Very good office headset",
        body: "I wear it for long remote-work days and it stays comfortable. The microphone is reliable, though the buttons could feel more precise.",
      },
      fr: {
        title: "Très bon casque pour le bureau",
        body: "Je le porte pendant de longues journées en télétravail et il reste confortable. Le micro est fiable, même si les boutons pourraient être plus précis.",
      },
    },
  ],
  "hea-tinbuzz-pocket": [
    {
      rating: 2,
      en: {
        title: "Only okay in emergencies",
        body: "I can pair it quickly, but that is about the only positive for me. Connection drops happen too often and outside noise comes through a lot.",
      },
      fr: {
        title: "Acceptable seulement en dépannage",
        body: "Je peux l'appairer vite, mais c'est presque son seul point positif. Les coupures arrivent trop souvent et le bruit extérieur passe beaucoup.",
      },
    },
  ],
  "hea-tinbuzz-elite-900": [
    {
      rating: 2,
      en: {
        title: "Really poor for the price",
        body: "I expected much better at this price point. Battery life is weak and people often tell me my mic sounds inconsistent.",
      },
      fr: {
        title: "Vraiment mauvais pour ce prix",
        body: "J'attendais beaucoup mieux à ce niveau de prix. L'autonomie est faible et on me dit souvent que mon micro sonne de façon inégale.",
      },
    },
  ],
  "hea-tinbuzz-wire-one": [
    {
      rating: 3,
      en: {
        title: "Cheap and just okay",
        body: "I use it for casual listening and it gets the job done. Once I raise the volume, the sound gets muddy fast.",
      },
      fr: {
        title: "Pas cher et juste correct",
        body: "Je l'utilise pour une écoute tranquille et il fait le minimum. Dès que je monte le volume, le son devient vite brouillon.",
      },
    },
  ],
  "hea-soundweave-open-60": [
    {
      rating: 4,
      en: {
        title: "Good comfort for the price",
        body: "For me this is a good balance of comfort and sound quality. The only downside is a bit of leakage when I play loud music.",
      },
      fr: {
        title: "Bon confort pour le prix",
        body: "Pour moi c'est un bon équilibre entre confort et qualité sonore. Le seul défaut : un peu de fuite quand je mets la musique fort.",
      },
    },
  ],
  "hea-soundweave-pod-air": [
    {
      rating: 3,
      en: {
        title: "Convenient but nothing special",
        body: "I like the size and day-to-day convenience. Fit can be hit or miss when I move around a lot.",
      },
      fr: {
        title: "Pratique mais sans plus",
        body: "J'aime le format et la praticité au quotidien. Le maintien peut être aléatoire quand je bouge beaucoup.",
      },
    },
  ],
  "hea-soundweave-bass-hd": [
    {
      rating: 2,
      en: {
        title: "Too many issues for me",
        body: "I wanted to like the punchy sound, but comfort drops quickly in longer sessions. Calls are inconsistent and that kills it for me.",
      },
      fr: {
        title: "Trop de problèmes pour moi",
        body: "Je voulais aimer le son bien punchy, mais le confort chute vite sur les longues sessions. Les appels sont inconstants et ça me bloque.",
      },
    },
  ],
  "hea-pulseline-fit-s": [
    {
      rating: 4,
      en: {
        title: "Good for commuting and workouts",
        body: "I like the secure fit and clear calls while moving around. Charging is a bit slower than I expected.",
      },
      fr: {
        title: "Bon pour les trajets et le sport",
        body: "J'aime le maintien solide et les appels clairs en mouvement. La recharge est juste un peu plus lente que prevu.",
      },
    },
  ],
  "hea-pulseline-office": [
    {
      rating: 4,
      en: {
        title: "Reliable for office use",
        body: "I use it for calls all week and it has been good and stable. The case is a little bulky in my bag.",
      },
      fr: {
        title: "Fiable pour un usage bureau",
        body: "Je m'en sers toute la semaine pour les appels et c'est stable. Le boitier est juste un peu encombrant dans mon sac.",
      },
    },
  ],
  "hea-pulseline-anc-go": [
    {
      rating: 2,
      en: {
        title: "Not good enough",
        body: "I wanted a simple headset, but this one frustrates me. Noise control is weak and connection stability is below average.",
      },
      fr: {
        title: "Pas assez bon",
        body: "Je voulais un casque simple, mais celui-ci me frustre. La réduction de bruit est faible et la stabilité de connexion est en dessous de la moyenne.",
      },
    },
  ],
  "usb-quickbyte-flash-128": [
    {
      rating: 4,
      en: {
        title: "Good everyday USB stick",
        body: "I have used it for regular backups and it has been reliable. It is fast enough for my needs, but the shell picks up scratches quickly.",
      },
      fr: {
        title: "Bonne clé USB au quotidien",
        body: "Je l'ai utilisée pour des sauvegardes régulières et elle reste fiable. C'est assez rapide pour moi, mais la coque se raye vite.",
      },
    },
  ],
  "usb-quickbyte-economy-32": [
    {
      rating: 2,
      en: {
        title: "Too slow in real use",
        body: "It is cheap, yes, but I feel the trade-off every time I copy larger folders. Write speed drops a lot and it becomes annoying.",
      },
      fr: {
        title: "Trop lente en usage réel",
        body: "Oui, elle n'est pas chère, mais je sens le compromis à chaque copie de gros dossiers. La vitesse d'écriture chute beaucoup et ça devient pénible.",
      },
    },
  ],
  "usb-quickbyte-pro-64": [
    {
      rating: 4,
      en: {
        title: "Solid value for storage",
        body: "I have had a good experience with normal file transfers and backups. Speeds can fluctuate on long writes, but overall it does the job well.",
      },
      fr: {
        title: "Bonne valeur pour le stockage",
        body: "J'ai une bonne expérience sur les transferts normaux et les sauvegardes. Les vitesses fluctuent un peu sur les longues écritures, mais globalement elle fait le job.",
      },
    },
  ],
  "usb-arkive-titanium-512": [
    {
      rating: 5,
      en: {
        title: "Excellent for large backups",
        body: "I use this for big archives and it has been excellent. It feels reliable, fast enough, and very stable in long sessions.",
      },
      fr: {
        title: "Excellente pour les grosses sauvegardes",
        body: "Je l'utilise pour de grosses archives et elle est excellente. Elle paraît fiable, assez rapide, et très stable sur les longues sessions.",
      },
    },
  ],
  "usb-arkive-slim-256": [
    {
      rating: 2,
      en: {
        title: "Nice design, bad consistency",
        body: "I like the compact form and premium look. Performance gets inconsistent once it warms up, and that is a deal breaker for me.",
      },
      fr: {
        title: "Beau design, mauvaise constance",
        body: "J'aime le format compact et l'aspect premium. Les performances deviennent inégales quand elle chauffe, et pour moi c'est éliminatoire.",
      },
    },
  ],
  "usb-arkive-desk-128": [
    {
      rating: 4,
      en: {
        title: "Reliable backup stick",
        body: "I keep this one on my desk and it has been dependable for daily transfers. It is simple to use, even if bundled tools are very basic.",
      },
      fr: {
        title: "Clé de sauvegarde fiable",
        body: "Je la garde sur mon bureau et elle est fiable pour les transferts quotidiens. Elle est simple à utiliser, même si les outils fournis sont très basiques.",
      },
    },
  ],
  "usb-datariver-swift-128": [
    {
      rating: 4,
      en: {
        title: "Consistent in daily use",
        body: "I move mixed files all the time and this one stays pretty stable. My only complaint is that the cap could fit more tightly.",
      },
      fr: {
        title: "Constante au quotidien",
        body: "Je transfère des fichiers variés tout le temps et elle reste assez stable. Mon seul reproche : le capuchon pourrait tenir plus fermement.",
      },
    },
  ],
  "usb-datariver-go-32": [
    {
      rating: 3,
      en: {
        title: "Works, but feels average",
        body: "I use it for simple files and it works fine. For bigger transfers it feels slower than I would like.",
      },
      fr: {
        title: "Fonctionne, mais reste moyenne",
        body: "Je l'utilise pour des fichiers simples et ca marche bien. Sur des transferts plus gros, je la trouve plus lente que je voudrais.",
      },
    },
  ],
  "usb-datariver-max-256": [
    {
      rating: 4,
      en: {
        title: "Good mid-tier option",
        body: "Capacity is useful and transfer speed is stable enough for my backups. The exterior marks pretty quickly in a pocket.",
      },
      fr: {
        title: "Bonne option milieu de gamme",
        body: "La capacité est utile et la vitesse de transfert est assez stable pour mes sauvegardes. L'extérieur se marque vite dans la poche.",
      },
    },
  ],
  "usb-neovault-shield-128": [
    {
      rating: 4,
      en: {
        title: "Sturdy and dependable",
        body: "I like how solid it feels and I have had no surprises in daily use. I just wish it had a built-in encryption option.",
      },
      fr: {
        title: "Solide et fiable",
        body: "J'aime la sensation de robustesse et je n'ai eu aucune mauvaise surprise au quotidien. Je voudrais juste une option de chiffrement intégrée.",
      },
    },
  ],
  "usb-neovault-micro-64": [
    {
      rating: 2,
      en: {
        title: "Tiny, but too unreliable",
        body: "The small size is convenient, but that is where the positives end for me. Transfers become inconsistent, especially with many small files.",
      },
      fr: {
        title: "Minuscule, mais trop peu fiable",
        body: "La petite taille est pratique, mais c'est là que les points positifs s'arrêtent pour moi. Les transferts deviennent inconstants, surtout avec beaucoup de petits fichiers.",
      },
    },
  ],
  "usb-neovault-twin-256": [
    {
      rating: 3,
      en: {
        title: "Useful idea, mixed results",
        body: "I like the dual-use concept and it is handy in practice. Speed can be bursty on longer sessions, so it feels a bit inconsistent.",
      },
      fr: {
        title: "Bonne idée, résultat mitigé",
        body: "J'aime le concept double usage et c'est pratique en vrai. La vitesse peut être irrégulière sur les longues sessions, donc ça manque un peu de constance.",
      },
    },
  ],
  "bik-smoothroll-commuter-7": [
    {
      rating: 5,
      en: {
        title: "Excellent city bike",
        body: "I ride it every day in traffic and it feels excellent. Handling is stable, braking is smooth, and I always feel in control.",
      },
      fr: {
        title: "Excellent vélo de ville",
        body: "Je roule avec tous les jours en trafic et il est excellent. Le comportement est stable, le freinage progressif, et je me sens toujours en contrôle.",
      },
    },
  ],
  "bik-smoothroll-gravel-x": [
    {
      rating: 5,
      en: {
        title: "Absolute joy to ride",
        body: "I have done long rides with it and it is excellent from start to finish. The ride feels smooth, planted, and confidence-inspiring.",
      },
      fr: {
        title: "Un vrai plaisir à rouler",
        body: "J'ai fait de longues sorties avec et c'est excellent du début à la fin. Le vélo est fluide, stable, et donne confiance.",
      },
    },
  ],
  "bik-smoothroll-city-lite": [
    {
      rating: 4,
      en: {
        title: "Good commuter bike",
        body: "For me it is a good city commuter with comfortable handling. I needed a small tune-up after delivery, then it was fine.",
      },
      fr: {
        title: "Bon vélo pour les trajets quotidiens",
        body: "Pour moi c'est un bon vélo de ville avec une conduite confortable. J'ai dû faire un petit réglage après livraison, puis c'était nickel.",
      },
    },
  ],
  "bik-creakwheel-street": [
    {
      rating: 2,
      en: {
        title: "Not a good experience",
        body: "I can use it for short rides, but that is about it. Gear shifts feel rough and I do not trust the braking in wet conditions.",
      },
      fr: {
        title: "Mauvaise expérience",
        body: "Je peux l'utiliser pour de petits trajets, pas plus. Les changements de vitesse sont brusques et je n'ai pas confiance dans le freinage sous la pluie.",
      },
    },
  ],
  "bik-creakwheel-carbon-air": [
    {
      rating: 2,
      en: {
        title: "Way below expectations",
        body: "At this price I expected a lot more. It looks good, but reliability and component quality feel inconsistent in real use.",
      },
      fr: {
        title: "Très loin des attentes",
        body: "À ce prix, j'attendais beaucoup plus. Il est beau, mais la fiabilité et la qualité des composants sont inégales en usage réel.",
      },
    },
  ],
  "bik-creakwheel-path-8": [
    {
      rating: 2,
      en: {
        title: "I would skip this one",
        body: "I can handle it in city traffic, but overall it feels rough and noisy. The drivetrain and stock tires never gave me real confidence.",
      },
      fr: {
        title: "Je passerais mon tour",
        body: "Je peux le gérer en ville, mais globalement il est rugueux et bruyant. La transmission et les pneus d'origine ne m'ont jamais inspiré confiance.",
      },
    },
  ],
  "bik-northspan-tour-9": [
    {
      rating: 4,
      en: {
        title: "Good touring choice",
        body: "I find it stable and predictable on mixed routes, which I really like. On very long rides, the saddle gets less comfortable for me.",
      },
      fr: {
        title: "Bon choix pour la rando",
        body: "Je le trouve stable et prévisible sur des parcours mixtes, ce que j'aime beaucoup. Sur les très longues sorties, la selle devient moins confortable pour moi.",
      },
    },
  ],
  "bik-northspan-kids-24": [
    {
      rating: 4,
      en: {
        title: "Great option for families",
        body: "In my experience it is easy to steer and feels reassuring for younger riders. It is a bit heavy, but still a good choice overall.",
      },
      fr: {
        title: "Très bon choix pour les familles",
        body: "D'après mon expérience, il est facile à diriger et rassurant pour les jeunes cyclistes. Il est un peu lourd, mais reste un bon choix globalement.",
      },
    },
  ],
  "bik-northspan-trail-10": [
    {
      rating: 3,
      en: {
        title: "Okay, not amazing",
        body: "I would call it decent: handling is predictable and it does the job. Climbing feels average and nothing really stands out.",
      },
      fr: {
        title: "Correct, sans plus",
        body: "Je dirais qu'il est correct : la conduite est prévisible et il fait le travail. En montée c'est moyen, et rien ne ressort vraiment.",
      },
    },
  ],
  "bik-gridline-fix-one": [
    {
      rating: 4,
      en: {
        title: "Simple and good for city rides",
        body: "I like the quick steering and easy handling in daily commutes. I just wish it had more mounting points for accessories.",
      },
      fr: {
        title: "Simple et efficace en ville",
        body: "J'aime la direction vive et la maniabilité facile pour les trajets quotidiens. Je voudrais juste plus de points de fixation pour les accessoires.",
      },
    },
  ],
  "bik-gridline-fold-lite": [
    {
      rating: 3,
      en: {
        title: "Practical but only average",
        body: "The folding format is genuinely practical for small spaces. Ride comfort drops pretty quickly on rough roads.",
      },
      fr: {
        title: "Pratique mais seulement moyen",
        body: "Le format pliant est vraiment pratique pour les petits espaces. Le confort chute assez vite sur routes dégradées.",
      },
    },
  ],
  "bik-gridline-speed-11": [
    {
      rating: 4,
      en: {
        title: "Good speed and control",
        body: "I feel confident riding this one faster than my previous bike. Control is good overall, but mine needed small setup adjustments out of the box.",
      },
      fr: {
        title: "Bonne vitesse et bon contrôle",
        body: "Je me sens en confiance pour rouler plus vite qu'avec mon ancien vélo. Le contrôle est bon globalement, mais le mien a demandé quelques réglages à la sortie du carton.",
      },
    },
  ],
};
