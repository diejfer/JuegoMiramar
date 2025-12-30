/**
 * Melómano - Rock Nacional Argentino
 * Colección de 12 canciones icónicas del rock argentino
 */

const ROCK_NACIONAL_CARDS = [
  {
    id: 1,
    category: "Rock Nacional Argentino",
    lyrics: "Y ya sé que el humo se vino, para comunicar _____ extraños. Por eso estoy aquí, _____ que llegaste por el bien.",
    word1: { answer: "planes", position: 1 },
    word2: { answer: "fumando", position: 2 },
    questions: [
      { q: "¿Cómo se llama la canción?", a: "De Música Ligera" },
      { q: "¿A qué banda pertenece?", a: "Soda Stereo" },
      { q: "¿Quién era el vocalista de la banda?", a: "Gustavo Cerati" },
      { q: "¿En qué ciudad se formó Soda Stereo?", a: "Buenos Aires" }
    ],
    videoLink: "https://www.youtube.com/watch?v=NuZPvPEqJrE"
  },
  {
    id: 2,
    category: "Rock Nacional Argentino",
    lyrics: "De los dinosaurios la _____ no está aquí, es una _____ más, en la Tierra del Amor.",
    word1: { answer: "tristeza", position: 1 },
    word2: { answer: "historia", position: 2 },
    questions: [
      { q: "¿Cómo se llama la canción?", a: "Los Dinosaurios" },
      { q: "¿Quién es el artista?", a: "Charly García" },
      { q: "¿De qué banda fue líder antes de su carrera solista?", a: "Sui Generis" },
      { q: "¿De qué año es la canción?", a: "1983" }
    ],
    videoLink: "https://www.youtube.com/watch?v=WLUOKu4UFGU"
  },
  {
    id: 3,
    category: "Rock Nacional Argentino",
    lyrics: "No voy a olvidarme más de todo lo que _____ por ti. Más de lo que _____ jamás por nadie.",
    word1: { answer: "sufrí", position: 1 },
    word2: { answer: "haré", position: 2 },
    questions: [
      { q: "¿Cómo se llama la canción?", a: "Seguir Viviendo Sin Tu Amor" },
      { q: "¿Quién es el artista?", a: "Luis Alberto Spinetta" },
      { q: "¿Con qué apodo se conocía a Spinetta?", a: "El Flaco" },
      { q: "¿Con qué banda grabó esta canción?", a: "Invisible" }
    ],
    videoLink: "https://www.youtube.com/watch?v=lz1mWWx_BN4"
  },
  {
    id: 4,
    category: "Rock Nacional Argentino",
    lyrics: "Muchacha, ojos de _____, se va, está sola y no sé qué _____ bien.",
    word1: { answer: "papel", position: 1 },
    word2: { answer: "decir", position: 2 },
    questions: [
      { q: "¿Cómo se llama la canción?", a: "Muchacha (Ojos de Papel)" },
      { q: "¿A qué banda pertenece?", a: "Almendra" },
      { q: "¿Qué otra canción icónica tiene Almendra?", a: "Ana no duerme" },
      { q: "¿De qué año es la canción?", a: "1969" }
    ],
    videoLink: "https://www.youtube.com/watch?v=o_2m4d_PUuE"
  },
  {
    id: 5,
    category: "Rock Nacional Argentino",
    lyrics: "Estoy muy solo y _____, ya no tengo ni esperanza. Todo es muy _____, para olvidar mi mala suerte.",
    word1: { answer: "triste", position: 1 },
    word2: { answer: "raro", position: 2 },
    questions: [
      { q: "¿Cómo se llama la canción?", a: "La Balsa" },
      { q: "¿A qué banda pertenece?", a: "Los Gatos" },
      { q: "¿Quién compuso La Balsa?", a: "Litto Nebbia" },
      { q: "¿De qué año es?", a: "1967" }
    ],
    videoLink: "https://www.youtube.com/watch?v=dMFhiYJdWdk"
  },
  {
    id: 6,
    category: "Rock Nacional Argentino",
    lyrics: "El cielo puede _____, o puedo yo llorar. Es lo mismo, _____ vez.",
    word1: { answer: "esperar", position: 1 },
    word2: { answer: "otra", position: 2 },
    questions: [
      { q: "¿Cómo se llama la canción?", a: "Canción Para Mi Muerte" },
      { q: "¿A qué banda pertenece?", a: "Sui Generis" },
      { q: "¿Dónde fue el concierto de despedida de Sui Generis?", a: "Luna Park" },
      { q: "¿De qué año es?", a: "1972" }
    ],
    videoLink: "https://www.youtube.com/watch?v=l8vdUB-Iou8"
  },
  {
    id: 7,
    category: "Rock Nacional Argentino",
    lyrics: "Si hablamos de matar, mis palabras _____, no hace mucho tiempo, que cayó el León _____.",
    word1: { answer: "matan", position: 1 },
    word2: { answer: "Santillán", position: 2 },
    questions: [
      { q: "¿Cómo se llama la canción?", a: "Matador" },
      { q: "¿A qué banda pertenece?", a: "Los Fabulosos Cadillacs" },
      { q: "¿Quién era el vocalista de Los Fabulosos Cadillacs?", a: "Vicentico" },
      { q: "¿A quién está dedicada la canción?", a: "Víctor Jara" }
    ],
    videoLink: "https://www.youtube.com/watch?v=q43wzP6A1CM"
  },
  {
    id: 8,
    category: "Rock Nacional Argentino",
    lyrics: "Es más fácil llegar que _____, crua-chan, que escapar. Es más fácil el _____ de tu edad que escapar.",
    word1: { answer: "quedarse", position: 1 },
    word2: { answer: "vino", position: 2 },
    questions: [
      { q: "¿Cómo se llama la canción?", a: "Crua-Chan" },
      { q: "¿A qué banda pertenece?", a: "Divididos" },
      { q: "¿De qué banda surgieron Divididos?", a: "Sumo" },
      { q: "¿Quién es el líder de Divididos?", a: "Ricardo Mollo" }
    ],
    videoLink: "https://www.youtube.com/watch?v=4yO_HnJPL7c"
  },
  {
    id: 9,
    category: "Rock Nacional Argentino",
    lyrics: "Hoy puede ser un gran día, plantéatelo así. _____ las botas de _____ y busca en tu interior.",
    word1: { answer: "Aprovecharlo", position: 1 },
    word2: { answer: "agua", position: 2 },
    questions: [
      { q: "¿Cómo se llama la canción?", a: "Seminare" },
      { q: "¿A qué banda pertenece?", a: "Pescado Rabioso" },
      { q: "¿Quién era el líder?", a: "Luis Alberto Spinetta" },
      { q: "¿Cuántas bandas formó Spinetta en su carrera?", a: "Cinco" }
    ],
    videoLink: "https://www.youtube.com/watch?v=_AcSmJLCy-Y"
  },
  {
    id: 10,
    category: "Rock Nacional Argentino",
    lyrics: "Despierto y no estás, una _____ más. Sé que vendrás, cuando pase el _____.",
    word1: { answer: "vez", position: 1 },
    word2: { answer: "temblor", position: 2 },
    questions: [
      { q: "¿Cómo se llama la canción?", a: "Cuando Pase el Temblor" },
      { q: "¿A qué banda pertenece?", a: "Soda Stereo" },
      { q: "¿Cuántos integrantes tenía Soda Stereo?", a: "Tres" },
      { q: "¿En qué año se separó definitivamente la banda?", a: "2010" }
    ],
    videoLink: "https://www.youtube.com/watch?v=4lxMCCzk5mQ"
  },
  {
    id: 11,
    category: "Rock Nacional Argentino",
    lyrics: "Quién va a quererme así si tengo _____ de destruir. No sé cómo _____, prefiero la diversión.",
    word1: { answer: "ganas", position: 1 },
    word2: { answer: "vivir", position: 2 },
    questions: [
      { q: "¿Cómo se llama la canción?", a: "Demoliendo Hoteles" },
      { q: "¿Quién es el artista?", a: "Charly García" },
      { q: "¿En qué hotel tocó Charly en los 80?", a: "Bauen" },
      { q: "¿De qué año es?", a: "1984" }
    ],
    videoLink: "https://www.youtube.com/watch?v=AbeWgkBl3P4"
  },
  {
    id: 12,
    category: "Rock Nacional Argentino",
    lyrics: "Dulce _____ de Lucifer, oh nene. Dime qué se siente _____ el mal.",
    word1: { answer: "condena", position: 1 },
    word2: { answer: "pisar", position: 2 },
    questions: [
      { q: "¿Cómo se llama la canción?", a: "Luzbelito" },
      { q: "¿A qué banda pertenece?", a: "Patricio Rey y sus Redonditos de Ricota" },
      { q: "¿Cómo se conoce a los fans de Los Redondos?", a: "Ricoteros" },
      { q: "¿Quién era el cantante?", a: "Indio Solari" }
    ],
    videoLink: "https://www.youtube.com/watch?v=P9IbhR8pYSo"
  }
];

// Exponer el array globalmente para que game.js pueda accederlo
window.ROCK_NACIONAL_CARDS = ROCK_NACIONAL_CARDS;
