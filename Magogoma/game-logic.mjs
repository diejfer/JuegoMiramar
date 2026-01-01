const INSEPARABLE_CLUSTERS = new Set([
  "bl",
  "br",
  "cl",
  "cr",
  "dr",
  "fl",
  "fr",
  "gl",
  "gr",
  "pl",
  "pr",
  "tr",
  "ch",
  "ll",
  "rr",
]);

export function normalizeWord(word) {
  return word
    .toLowerCase()
    .trim()
    .replace(/[á]/g, "a")
    .replace(/[é]/g, "e")
    .replace(/[í]/g, "i")
    .replace(/[ó]/g, "o")
    .replace(/[úü]/g, "u");
}

function isVowel(char) {
  return "aeiouáéíóúü".includes(char);
}

function isStrongVowel(char) {
  return "aáeéoóíú".includes(char);
}

function isWeakVowel(char) {
  return "iuü".includes(char);
}

function shouldFormDiphthong(vowelA, vowelB) {
  if (isStrongVowel(vowelA) && isStrongVowel(vowelB)) {
    return false;
  }
  if (isWeakVowel(vowelA) && isWeakVowel(vowelB)) {
    return true;
  }
  if (isStrongVowel(vowelA) && isWeakVowel(vowelB)) {
    return true;
  }
  if (isWeakVowel(vowelA) && isStrongVowel(vowelB)) {
    return true;
  }
  return false;
}

function splitCluster(cluster) {
  if (cluster.length === 1) {
    return { left: "", right: cluster };
  }
  if (cluster.length === 2) {
    if (INSEPARABLE_CLUSTERS.has(cluster)) {
      return { left: "", right: cluster };
    }
    return { left: cluster[0], right: cluster.slice(1) };
  }
  if (cluster.length === 3) {
    const lastTwo = cluster.slice(1);
    if (INSEPARABLE_CLUSTERS.has(lastTwo)) {
      return { left: cluster[0], right: lastTwo };
    }
    return { left: cluster.slice(0, 2), right: cluster.slice(2) };
  }
  return { left: cluster.slice(0, 2), right: cluster.slice(2) };
}

export function splitSyllables(word) {
  const clean = word.toLowerCase();
  const syllables = [];
  let index = 0;

  while (index < clean.length) {
    let syllable = "";
    while (index < clean.length && !isVowel(clean[index])) {
      syllable += clean[index];
      index += 1;
    }

    if (index >= clean.length) {
      if (syllable) {
        syllables.push(syllable);
      }
      break;
    }

    syllable += clean[index];
    if (
      index + 1 < clean.length &&
      isVowel(clean[index + 1]) &&
      shouldFormDiphthong(clean[index], clean[index + 1])
    ) {
      syllable += clean[index + 1];
      index += 2;
    } else {
      index += 1;
    }

    let cluster = "";
    let lookahead = index;
    while (lookahead < clean.length && !isVowel(clean[lookahead])) {
      cluster += clean[lookahead];
      lookahead += 1;
    }

    if (cluster.length === 0) {
      syllables.push(syllable);
      continue;
    }

    const { left } = splitCluster(cluster);
    syllable += left;
    syllables.push(syllable);
    index += left.length;
  }

  return syllables.filter(Boolean);
}

export function classifyWord(word) {
  const syllables = splitSyllables(word);
  const syllableCount = syllables.length;
  const type = syllableCount % 2 === 0 ? "GOMA" : "MAGO";
  return { syllables, type, syllableCount };
}

export function validateWord(word) {
  const trimmed = word.trim();
  if (trimmed.length < 2) {
    return { valid: false, reason: "Debe tener al menos 2 letras." };
  }
  const normalized = trimmed.toLowerCase();
  if (!/^[a-záéíóúüñ]+$/i.test(normalized)) {
    return { valid: false, reason: "Solo letras del español." };
  }
  const classification = classifyWord(normalized);
  return {
    valid: true,
    normalized: normalizeWord(normalized),
    syllables: classification.syllables,
    type: classification.type,
  };
}

export function shouldEndGame(responses) {
  return !responses.some((response) => response.valid);
}
