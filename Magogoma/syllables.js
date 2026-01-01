/**
 * Utilidades para división de sílabas en español
 */

/**
 * Divide una palabra en sílabas siguiendo las reglas del español
 * @param {string} palabra - La palabra a dividir
 * @returns {string[]} - Array de sílabas
 */
function dividirEnSilabas(palabra) {
  if (!palabra) return [];

  palabra = palabra.toLowerCase().trim();

  // Definir vocales
  const vocales = 'aeiouáéíóúü';
  const vocalesFuertes = 'aeoáéó';
  const vocalesDebiles = 'iuíú';

  const esVocal = (letra) => vocales.includes(letra);
  const esConsonante = (letra) => /[bcdfghjklmnñpqrstvwxyz]/.test(letra);
  const esVocalFuerte = (letra) => vocalesFuertes.includes(letra);
  const esVocalDebil = (letra) => vocalesDebiles.includes(letra);

  const silabas = [];
  let silaba = '';

  for (let i = 0; i < palabra.length; i++) {
    const letra = palabra[i];
    silaba += letra;

    // Si es la última letra, agregar la sílaba
    if (i === palabra.length - 1) {
      silabas.push(silaba);
      break;
    }

    const siguiente = palabra[i + 1];
    const despuesSiguiente = palabra[i + 2];

    // Regla 1: Vocal + Consonante + Vocal -> separar
    if (esVocal(letra) && esConsonante(siguiente)) {
      // Verificar si hay dos consonantes juntas
      if (despuesSiguiente && esConsonante(despuesSiguiente)) {
        const tercera = palabra[i + 3];

        // Grupos consonánticos que van juntos (bl, br, cl, cr, dr, fl, fr, gl, gr, pl, pr, tr)
        const gruposInseparables = ['bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'tr', 'ch', 'll', 'rr'];
        const grupo = siguiente + despuesSiguiente;

        if (gruposInseparables.includes(grupo)) {
          // El grupo va junto a la siguiente sílaba
          silabas.push(silaba);
          silaba = '';
        } else {
          // Separar entre las dos consonantes
          silaba += siguiente;
          silabas.push(silaba);
          silaba = '';
          i++; // Saltar la consonante que ya agregamos
        }
      } else if (despuesSiguiente && esVocal(despuesSiguiente)) {
        // Una sola consonante entre vocales -> va con la siguiente vocal
        silabas.push(silaba);
        silaba = '';
      }
    }
    // Regla 2: Hiatos (dos vocales fuertes juntas se separan)
    else if (esVocalFuerte(letra) && esVocalFuerte(siguiente)) {
      silabas.push(silaba);
      silaba = '';
    }
    // Regla 3: Vocal fuerte + vocal débil acentuada -> separar
    else if (esVocalFuerte(letra) && 'íú'.includes(siguiente)) {
      silabas.push(silaba);
      silaba = '';
    }
    // Regla 4: Vocal débil acentuada + vocal fuerte -> separar
    else if ('íú'.includes(letra) && esVocal(siguiente)) {
      silabas.push(silaba);
      silaba = '';
    }
  }

  return silabas.filter(s => s.length > 0);
}

/**
 * Determina si una palabra es "mago" o "goma" según su número de sílabas
 * @param {string} palabra - La palabra a evaluar
 * @returns {string} - "mago" si tiene sílabas impares, "goma" si tiene pares
 */
function esMagoOGoma(palabra) {
  const silabas = dividirEnSilabas(palabra);
  const numSilabas = silabas.length;

  // Impar = mago, Par = goma
  return numSilabas % 2 === 1 ? 'mago' : 'goma';
}

/**
 * Valida si una palabra existe (para este juego, cualquier palabra de 2+ letras es válida)
 * En una versión más avanzada, podrías usar una API o diccionario
 * @param {string} palabra - La palabra a validar
 * @returns {boolean} - true si es válida
 */
function esPalabraValida(palabra) {
  if (!palabra) return false;

  palabra = palabra.trim();

  // Debe tener al menos 2 letras
  if (palabra.length < 2) return false;

  // Solo debe contener letras
  if (!/^[a-záéíóúüñ]+$/i.test(palabra)) return false;

  return true;
}
