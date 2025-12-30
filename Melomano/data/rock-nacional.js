/**
 * Melómano - Rock Nacional Argentino
 * Colección de 12 canciones icónicas del rock argentino
 */

const ROCK_NACIONAL_CARDS = [
  {
    "id": 1,
    "category": "Rock Nacional Argentino",
    "lyrics": "Estoy muy _____ y triste... mundo _____",
    "word1": { "answer": "solo", "position": 1 },
    "word2": { "answer": "abandonado", "position": 2 },
    "questions": [
      { "q": "Tema", "a": "la balsa" },
      { "q": "Banda", "a": "los gatos" },
      { "q": "Artista", "a": "litto nebbia" },
      { "q": "Año", "a": "1967" },
      { "q": "Ciudad", "a": "rosario" }
    ],
    "videoLink": "https://www.youtube.com/watch?v=Z4yjtVp8Qcc"
  },
  {
    "id": 2,
    "category": "Rock Nacional Argentino",
    "lyrics": "Muchacha, ojos de _____... hasta el _____",
    "word1": { "answer": "papel", "position": 1 },
    "word2": { "answer": "alba", "position": 2 },
    "questions": [
      { "q": "Tema", "a": "muchacha" },
      { "q": "Banda", "a": "almendra" },
      { "q": "Artista", "a": "luis alberto spinetta" },
      { "q": "Año", "a": "1969" },
      { "q": "Album", "a": "almendra" }
    ],
    "videoLink": "https://www.youtube.com/watch?v=3d7axPF9o84"
  },
  {
    "id": 3,
    "category": "Rock Nacional Argentino",
    "lyrics": "Jugo de _____ ... no es para _____",
    "word1": { "answer": "tomate", "position": 1 },
    "word2": { "answer": "vos", "position": 2 },
    "questions": [
      { "q": "Tema", "a": "jugo de tomate frio" },
      { "q": "Banda", "a": "manal" },
      { "q": "Artista", "a": "javier martinez" },
      { "q": "Año", "a": "1970" },
      { "q": "Ciudad", "a": "buenos aires" }
    ],
    "videoLink": "https://www.youtube.com/watch?v=RCnlgvPp0Nk"
  },
  {
    "id": 4,
    "category": "Rock Nacional Argentino",
    "lyrics": "Todo tiene un _____... nada puede _____",
    "word1": { "answer": "final", "position": 1 },
    "word2": { "answer": "escapar", "position": 2 },
    "questions": [
      { "q": "Tema", "a": "presente" },
      { "q": "Banda", "a": "vox dei" },
      { "q": "Artista", "a": "ricardo soule" },
      { "q": "Año", "a": "1970" },
      { "q": "Decada", "a": "70" }
    ],
    "videoLink": "https://www.youtube.com/watch?v=xz5a1DoAmqA"
  },
  {
    "id": 5,
    "category": "Rock Nacional Argentino",
    "lyrics": "El oso vivia en el _____... sin _____",
    "word1": { "answer": "bosque", "position": 1 },
    "word2": { "answer": "parar", "position": 2 },
    "questions": [
      { "q": "Tema", "a": "el oso" },
      { "q": "Banda", "a": "moris" },
      { "q": "Artista", "a": "moris" },
      { "q": "Año", "a": "1969" },
      { "q": "Decada", "a": "60" }
    ],
    "videoLink": "https://www.youtube.com/watch?v=YW6VwSEpSt8"
  },
  {
    "id": 6,
    "category": "Rock Nacional Argentino",
    "lyrics": "Hubo un tiempo que fue _____... libre de _____",
    "word1": { "answer": "hermoso", "position": 1 },
    "word2": { "answer": "verdad", "position": 2 },
    "questions": [
      { "q": "Tema", "a": "cancion para mi muerte" },
      { "q": "Banda", "a": "sui generis" },
      { "q": "Artista", "a": "charly garcia" },
      { "q": "Año", "a": "1972" },
      { "q": "Album", "a": "vida" }
    ],
    "videoLink": "https://www.youtube.com/watch?v=K5J5jGT5B0k"
  },
  {
    "id": 7,
    "category": "Rock Nacional Argentino",
    "lyrics": "Detras de las _____... te ruego que _____",
    "word1": { "answer": "paredes", "position": 1 },
    "word2": { "answer": "respires", "position": 2 },
    "questions": [
      { "q": "Tema", "a": "rasguna las piedras" },
      { "q": "Banda", "a": "sui generis" },
      { "q": "Artista", "a": "charly garcia" },
      { "q": "Año", "a": "1973" },
      { "q": "Album", "a": "confesiones de invierno" }
    ],
    "videoLink": "https://www.youtube.com/watch?v=L6B8dIR3MJY"
  },
  {
    "id": 8,
    "category": "Rock Nacional Argentino",
    "lyrics": "No te _____ ya mas... las horas _____",
    "word1": { "answer": "apures", "position": 1 },
    "word2": { "answer": "bajan", "position": 2 },
    "questions": [
      { "q": "Tema", "a": "bajan" },
      { "q": "Banda", "a": "pescado rabioso" },
      { "q": "Artista", "a": "luis alberto spinetta" },
      { "q": "Año", "a": "1973" },
      { "q": "Album", "a": "artaud" }
    ],
    "videoLink": "https://www.youtube.com/watch?v=1xZ0W6uMU6A"
  },
  {
    "id": 9,
    "category": "Rock Nacional Argentino",
    "lyrics": "Quiero ver, quiero _____... excepto _____",
    "word1": { "answer": "entrar", "position": 1 },
    "word2": { "answer": "amarte", "position": 2 },
    "questions": [
      { "q": "Tema", "a": "seminare" },
      { "q": "Banda", "a": "seru giran" },
      { "q": "Artista", "a": "charly garcia" },
      { "q": "Año", "a": "1978" },
      { "q": "Bajista", "a": "pedro aznar" }
    ],
    "videoLink": "https://www.youtube.com/watch?v=JJ89rpj-u5w"
  },
  {
    "id": 10,
    "category": "Rock Nacional Argentino",
    "lyrics": "Los amigos del _____... pueden _____",
    "word1": { "answer": "barrio", "position": 1 },
    "word2": { "answer": "desaparecer", "position": 2 },
    "questions": [
      { "q": "Tema", "a": "los dinosaurios" },
      { "q": "Banda", "a": "charly garcia" },
      { "q": "Artista", "a": "charly garcia" },
      { "q": "Año", "a": "1983" },
      { "q": "Album", "a": "clics modernos" }
    ],
    "videoLink": "https://www.youtube.com/watch?v=r1klNkoHtk8"
  },

  { "id": 11, "category": "Rock Nacional Argentino", "lyrics": "Estoy al borde de la _____... se me va la _____", "word1": { "answer": "cornisa", "position": 1 }, "word2": { "answer": "vida", "position": 2 }, "questions": [ { "q": "Tema", "a": "rezo por vos" }, { "q": "Artista", "a": "charly garcia" }, { "q": "Duo", "a": "spinetta" }, { "q": "Año", "a": "1985" }, { "q": "Decada", "a": "80" } ], "videoLink": "https://www.youtube.com/watch?v=_gFsaWJiB2Q" },
  { "id": 12, "category": "Rock Nacional Argentino", "lyrics": "Cerca de la _____... el pueblo pide _____", "word1": { "answer": "revolucion", "position": 1 }, "word2": { "answer": "sangre", "position": 2 }, "questions": [ { "q": "Tema", "a": "cerca de la revolucion" }, { "q": "Artista", "a": "charly garcia" }, { "q": "Album", "a": "piano bar" }, { "q": "Año", "a": "1984" }, { "q": "Decada", "a": "80" } ], "videoLink": "https://www.youtube.com/watch?v=JfmVvD_34X4" },
  { "id": 13, "category": "Rock Nacional Argentino", "lyrics": "De aquel amor de musica _____... nada nos _____", "word1": { "answer": "ligera", "position": 1 }, "word2": { "answer": "libra", "position": 2 }, "questions": [ { "q": "Tema", "a": "de musica ligera" }, { "q": "Banda", "a": "soda stereo" }, { "q": "Artista", "a": "gustavo cerati" }, { "q": "Año", "a": "1990" }, { "q": "Baterista", "a": "charly alberti" } ], "videoLink": "https://www.youtube.com/results?search_query=soda+stereo+de+musica+ligera" },
  { "id": 14, "category": "Rock Nacional Argentino", "lyrics": "Yo te prefiero... fuera de _____, _____", "word1": { "answer": "foco", "position": 1 }, "word2": { "answer": "inalcanzable", "position": 2 }, "questions": [ { "q": "Tema", "a": "persiana americana" }, { "q": "Banda", "a": "soda stereo" }, { "q": "Artista", "a": "gustavo cerati" }, { "q": "Año", "a": "1986" }, { "q": "Bajista", "a": "zeta bosio" } ], "videoLink": "https://www.youtube.com/results?search_query=soda+stereo+persiana+americana" },
  { "id": 15, "category": "Rock Nacional Argentino", "lyrics": "Me veras _____... ciudad de la _____", "word1": { "answer": "volar", "position": 1 }, "word2": { "answer": "furia", "position": 2 }, "questions": [ { "q": "Tema", "a": "en la ciudad de la furia" }, { "q": "Banda", "a": "soda stereo" }, { "q": "Artista", "a": "gustavo cerati" }, { "q": "Año", "a": "1988" }, { "q": "Album", "a": "doble vida" } ], "videoLink": "https://www.youtube.com/results?search_query=soda+stereo+ciudad+de+la+furia" },
  { "id": 16, "category": "Rock Nacional Argentino", "lyrics": "Cuando pase el _____... caminare entre las _____", "word1": { "answer": "temblor", "position": 1 }, "word2": { "answer": "piedras", "position": 2 }, "questions": [ { "q": "Tema", "a": "cuando pase el temblor" }, { "q": "Banda", "a": "soda stereo" }, { "q": "Artista", "a": "gustavo cerati" }, { "q": "Año", "a": "1985" }, { "q": "Album", "a": "nada personal" } ], "videoLink": "https://www.youtube.com/results?search_query=soda+stereo+cuando+pase+el+temblor" },
  { "id": 17, "category": "Rock Nacional Argentino", "lyrics": "Ella durmio al calor... yo desperte queriendo _____", "word1": { "answer": "sonarla", "position": 1 }, "word2": { "answer": "flores", "position": 2 }, "questions": [ { "q": "Tema", "a": "de musica ligera" }, { "q": "Album", "a": "cancion animal" }, { "q": "Bajista", "a": "zeta bosio" }, { "q": "Año", "a": "1990" }, { "q": "Decada", "a": "90" } ], "videoLink": "https://www.youtube.com/results?search_query=cancion+animal+de+musica+ligera" },

  { "id": 18, "category": "Rock Nacional Argentino", "lyrics": "La otra noche te _____... mil _____", "word1": { "answer": "espere", "position": 1 }, "word2": { "answer": "horas", "position": 2 }, "questions": [ { "q": "Tema", "a": "mil horas" }, { "q": "Banda", "a": "los abuelos de la nada" }, { "q": "Artista", "a": "miguel abuelo" }, { "q": "Año", "a": "1983" }, { "q": "Autor", "a": "andres calamaro" } ], "videoLink": "https://www.youtube.com/results?search_query=los+abuelos+de+la+nada+mil+horas" },
  { "id": 19, "category": "Rock Nacional Argentino", "lyrics": "Estoy rodeado de viejos _____... todo _____", "word1": { "answer": "vinagres", "position": 1 }, "word2": { "answer": "alrededor", "position": 2 }, "questions": [ { "q": "Tema", "a": "los viejos vinagres" }, { "q": "Banda", "a": "sumo" }, { "q": "Artista", "a": "luca prodan" }, { "q": "Año", "a": "1985" }, { "q": "Bajista", "a": "diego arnedo" } ], "videoLink": "https://www.youtube.com/results?search_query=sumo+los+viejos+vinagres" },
  { "id": 20, "category": "Rock Nacional Argentino", "lyrics": "No lo _____... se _____", "word1": { "answer": "sone", "position": 1 }, "word2": { "answer": "cayo", "position": 2 }, "questions": [ { "q": "Tema", "a": "ji ji ji" }, { "q": "Banda", "a": "redondos" }, { "q": "Artista", "a": "indio solari" }, { "q": "Año", "a": "1986" }, { "q": "Guitarrista", "a": "skay beilinson" } ], "videoLink": "https://www.youtube.com/results?search_query=patricio+rey+ji+ji+ji" },

  { "id": 21, "category": "Rock Nacional Argentino", "lyrics": "He _____ y he _____... un arbol he plantado", "word1": { "answer": "muerto", "position": 1 }, "word2": { "answer": "resucitado", "position": 2 }, "questions": [ { "q": "Tema", "a": "mariposa tecknicolor" }, { "q": "Artista", "a": "fito paez" }, { "q": "Año", "a": "1994" }, { "q": "Album", "a": "circo beat" }, { "q": "Ciudad", "a": "rosario" } ], "videoLink": "https://www.youtube.com/results?search_query=fito+paez+mariposa+tecknicolor" },
  { "id": 22, "category": "Rock Nacional Argentino", "lyrics": "El amor despues del _____... rayo de _____", "word1": { "answer": "amor", "position": 1 }, "word2": { "answer": "sol", "position": 2 }, "questions": [ { "q": "Tema", "a": "el amor despues del amor" }, { "q": "Artista", "a": "fito paez" }, { "q": "Año", "a": "1992" }, { "q": "Album", "a": "el amor despues del amor" }, { "q": "Decada", "a": "90" } ], "videoLink": "https://www.youtube.com/results?search_query=fito+paez+el+amor+despues+del+amor" },
  { "id": 23, "category": "Rock Nacional Argentino", "lyrics": "Se besan por primera vez... _____ y _____", "word1": { "answer": "11", "position": 1 }, "word2": { "answer": "6", "position": 2 }, "questions": [ { "q": "Tema", "a": "11 y 6" }, { "q": "Artista", "a": "fito paez" }, { "q": "Año", "a": "1985" }, { "q": "Album", "a": "giros" }, { "q": "Ciudad", "a": "rosario" } ], "videoLink": "https://www.youtube.com/results?search_query=fito+paez+11+y+6" },
  { "id": 24, "category": "Rock Nacional Argentino", "lyrics": "Me estas haciendo _____... un poquito mas", "word1": { "answer": "feliz", "position": 1 }, "word2": { "answer": "hoy", "position": 2 }, "questions": [ { "q": "Tema", "a": "brillante sobre el mic" }, { "q": "Artista", "a": "fabiana cantilo" }, { "q": "Año", "a": "1991" }, { "q": "Decada", "a": "90" }, { "q": "Ciudad", "a": "buenos aires" } ], "videoLink": "https://www.youtube.com/results?search_query=fabiana+cantilo+brillante+sobre+el+mic" },
  { "id": 25, "category": "Rock Nacional Argentino", "lyrics": "Flaca, no me _____ tus _____", "word1": { "answer": "claves", "position": 1 }, "word2": { "answer": "punales", "position": 2 }, "questions": [ { "q": "Tema", "a": "flaca" }, { "q": "Artista", "a": "andres calamaro" }, { "q": "Año", "a": "1997" }, { "q": "Album", "a": "alta suciedad" }, { "q": "Decada", "a": "90" } ], "videoLink": "https://www.youtube.com/results?search_query=andres+calamaro+flaca" },

  { "id": 26, "category": "Rock Nacional Argentino", "lyrics": "Lo dejare todo por esta _____... abrace la _____", "word1": { "answer": "soledad", "position": 1 }, "word2": { "answer": "cruz", "position": 2 }, "questions": [ { "q": "Tema", "a": "rezo por vos" }, { "q": "Duo", "a": "spinetta" }, { "q": "Artista", "a": "charly garcia" }, { "q": "Año", "a": "1985" }, { "q": "Decada", "a": "80" } ], "videoLink": "https://www.youtube.com/results?search_query=rezo+por+vos+spinetta+garcia" },
  { "id": 27, "category": "Rock Nacional Argentino", "lyrics": "Seguir viviendo sin tu _____... todo se podra _____", "word1": { "answer": "amor", "position": 1 }, "word2": { "answer": "elegir", "position": 2 }, "questions": [ { "q": "Tema", "a": "seguir viviendo sin tu amor" }, { "q": "Artista", "a": "luis alberto spinetta" }, { "q": "Año", "a": "1991" }, { "q": "Album", "a": "peluson of milk" }, { "q": "Decada", "a": "90" } ], "videoLink": "https://www.youtube.com/results?search_query=spinetta+seguir+viviendo+sin+tu+amor" },
  { "id": 28, "category": "Rock Nacional Argentino", "lyrics": "La rubia tarada... bronceada, aburrida, _____", "word1": { "answer": "carente", "position": 1 }, "word2": { "answer": "de", "position": 2 }, "questions": [ { "q": "Tema", "a": "la rubia tarada" }, { "q": "Banda", "a": "sumo" }, { "q": "Artista", "a": "luca prodan" }, { "q": "Año", "a": "1985" }, { "q": "Decada", "a": "80" } ], "videoLink": "https://www.youtube.com/results?search_query=sumo+la+rubia+tarada" },
  { "id": 29, "category": "Rock Nacional Argentino", "lyrics": "Me gusta ese tajo... que no se puede _____", "word1": { "answer": "explicar", "position": 1 }, "word2": { "answer": "hoy", "position": 2 }, "questions": [ { "q": "Tema", "a": "me gusta" }, { "q": "Banda", "a": "sumo" }, { "q": "Artista", "a": "luca prodan" }, { "q": "Año", "a": "1987" }, { "q": "Decada", "a": "80" } ], "videoLink": "https://www.youtube.com/results?search_query=sumo+me+gusta" },
  { "id": 30, "category": "Rock Nacional Argentino", "lyrics": "Ella es menor... pecado _____", "word1": { "answer": "mortal", "position": 1 }, "word2": { "answer": "normal", "position": 2 }, "questions": [ { "q": "Tema", "a": "nos siguen pegando abajo" }, { "q": "Artista", "a": "charly garcia" }, { "q": "Año", "a": "1983" }, { "q": "Album", "a": "clics modernos" }, { "q": "Decada", "a": "80" } ], "videoLink": "https://www.youtube.com/results?search_query=charly+garcia+nos+siguen+pegando+abajo" },

  { "id": 31, "category": "Rock Nacional Argentino", "lyrics": "Que suene mi _____... estalle mi _____", "word1": { "answer": "guitarra", "position": 1 }, "word2": { "answer": "corazon", "position": 2 }, "questions": [ { "q": "Tema", "a": "la guitarra" }, { "q": "Banda", "a": "los autenticos decadentes" }, { "q": "Año", "a": "1995" }, { "q": "Decada", "a": "90" }, { "q": "Genero", "a": "ska" } ], "videoLink": "https://www.youtube.com/results?search_query=autenticos+decadentes+la+guitarra" },
  { "id": 32, "category": "Rock Nacional Argentino", "lyrics": "Te vi llegar... tiraste el _____ y el _____", "word1": { "answer": "pinguino", "position": 1 }, "word2": { "answer": "sifon", "position": 2 }, "questions": [ { "q": "Tema", "a": "loco" }, { "q": "Banda", "a": "los autenticos decadentes" }, { "q": "Año", "a": "1989" }, { "q": "Decada", "a": "80" }, { "q": "Album", "a": "el milagro argentino" } ], "videoLink": "https://www.youtube.com/results?search_query=autenticos+decadentes+loco+tu+forma+de+ser" },
  { "id": 33, "category": "Rock Nacional Argentino", "lyrics": "Viento de _____... sangre _____", "word1": { "answer": "libertad", "position": 1 }, "word2": { "answer": "latina", "position": 2 }, "questions": [ { "q": "Tema", "a": "matador" }, { "q": "Banda", "a": "los fabulosos cadillacs" }, { "q": "Artista", "a": "vicentico" }, { "q": "Año", "a": "1993" }, { "q": "Decada", "a": "90" } ], "videoLink": "https://www.youtube.com/results?search_query=los+fabulosos+cadillacs+matador" },
  { "id": 34, "category": "Rock Nacional Argentino", "lyrics": "Siguiendo la luna... no voy a _____", "word1": { "answer": "parar", "position": 1 }, "word2": { "answer": "hoy", "position": 2 }, "questions": [ { "q": "Tema", "a": "siguiendo la luna" }, { "q": "Banda", "a": "los fabulosos cadillacs" }, { "q": "Artista", "a": "vicentico" }, { "q": "Año", "a": "1991" }, { "q": "Decada", "a": "90" } ], "videoLink": "https://www.youtube.com/results?search_query=los+fabulosos+cadillacs+siguiendo+la+luna" },
  { "id": 35, "category": "Rock Nacional Argentino", "lyrics": "Lamento _____... y yo estoy aqui, borracho y _____", "word1": { "answer": "boliviano", "position": 1 }, "word2": { "answer": "loco", "position": 2 }, "questions": [ { "q": "Tema", "a": "lamento boliviano" }, { "q": "Banda", "a": "enanitos verdes" }, { "q": "Artista", "a": "marciano cantero" }, { "q": "Año", "a": "1994" }, { "q": "Decada", "a": "90" } ], "videoLink": "https://www.youtube.com/results?search_query=enanitos+verdes+lamento+boliviano" },

  { "id": 36, "category": "Rock Nacional Argentino", "lyrics": "Soy el que nunca aprendio... como debe vivir el _____", "word1": { "answer": "humano", "position": 1 }, "word2": { "answer": "rebelde", "position": 2 }, "questions": [ { "q": "Tema", "a": "el revelde" }, { "q": "Banda", "a": "la renga" }, { "q": "Artista", "a": "chizzo" }, { "q": "Año", "a": "1998" }, { "q": "Decada", "a": "90" } ], "videoLink": "https://www.youtube.com/results?search_query=la+renga+el+revelde" },
  { "id": 37, "category": "Rock Nacional Argentino", "lyrics": "Panic show... yo soy el _____, yo soy el _____", "word1": { "answer": "rey", "position": 1 }, "word2": { "answer": "leon", "position": 2 }, "questions": [ { "q": "Tema", "a": "panic show" }, { "q": "Banda", "a": "la renga" }, { "q": "Artista", "a": "chizzo" }, { "q": "Año", "a": "2000" }, { "q": "Decada", "a": "00" } ], "videoLink": "https://www.youtube.com/results?search_query=la+renga+panic+show" },
  { "id": 38, "category": "Rock Nacional Argentino", "lyrics": "Tan solo... y me voy quedando _____", "word1": { "answer": "solo", "position": 1 }, "word2": { "answer": "hoy", "position": 2 }, "questions": [ { "q": "Tema", "a": "tan solo" }, { "q": "Banda", "a": "los piojos" }, { "q": "Artista", "a": "ciro" }, { "q": "Año", "a": "1992" }, { "q": "Decada", "a": "90" } ], "videoLink": "https://www.youtube.com/results?search_query=los+piojos+tan+solo" },
  { "id": 39, "category": "Rock Nacional Argentino", "lyrics": "Y ahora que estoy _____... me acuerdo de _____", "word1": { "answer": "aqui", "position": 1 }, "word2": { "answer": "vos", "position": 2 }, "questions": [ { "q": "Tema", "a": "verano del 92" }, { "q": "Banda", "a": "los piojos" }, { "q": "Artista", "a": "ciro" }, { "q": "Año", "a": "2000" }, { "q": "Decada", "a": "00" } ], "videoLink": "https://www.youtube.com/results?search_query=los+piojos+verano+del+92" }
 
];

// Exponer el array globalmente para que game.js pueda accederlo
window.ROCK_NACIONAL_CARDS = ROCK_NACIONAL_CARDS;
