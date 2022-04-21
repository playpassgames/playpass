export function getRandomWord (random) {
    return WORDS[Math.floor(WORDS.length * random)];
}

export function isValidWord (word) {
    // TODO(2022-04-19): Binary search
    return WORDS.indexOf(word.toUpperCase()) >= 0;
}

const WORDS = [
    "EAGLE",
    "EMU",
    "FALCON",
    "FLAMINGO",
    "HAWK",
    "MACAW",
    "OSTRICH",
    "PARROT",
    "PENGUIN",
    "RAVEN",
    "SPARROW",
    "TOUCAN",
    "VULTURE",
];
