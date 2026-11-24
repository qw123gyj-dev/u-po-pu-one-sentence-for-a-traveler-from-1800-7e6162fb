// One Sentence for a Traveler from 1800
//
// This program holds a single sentence that explains the modern
// internet to a person who has just arrived from the year 1800.
//
// The sentence uses only pictures that person already knows:
// libraries, printing presses, the post, town criers, letters,
// glass, wires, and the speed of a breath or a flash of lightning.
//
// Rules the sentence must obey:
//   - it stands alone, as exactly one sentence;
//   - it ends in a single period, with no other terminator;
//   - it is at most 200 characters long;
//   - it is one line, with no leading or trailing whitespace;
//   - it uses none of a short list of words coined after 1800.
//
// When the sentence passes every check, the program writes it to
// entry.txt inside the output directory, reads the file back, and
// verifies that what landed on disk matches the sentence exactly.
//
// Run it with:
//   MAKEFUN_OUTPUT_DIR=/tmp/traveler-out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ------------------------------------------------------------------
// The sentence
// ------------------------------------------------------------------

// One sentence, and one sentence only. Every image in it — the
// library, the post house, the wire, the letter, the breath —
// would have been familiar to a traveler in the year 1800.
const SENTENCE =
  "Imagine every library, printing press, and post house joined " +
  "by thin wires, so a letter you write at home reaches any town " +
  "crier, scholar, or friend across the world in a breath.";

// ------------------------------------------------------------------
// Words coined after 1800
// ------------------------------------------------------------------

// A short, deliberate list. The point is not to catch every new
// word ever coined; it is to keep out the plain modern names for
// the thing being explained, which would mean nothing in 1800.
const BANNED_WORDS: readonly string[] = [
  "internet",
  "computer",
  "online",
  "electric",
  "electricity",
  "telephone",
  "television",
  "radio",
  "website",
  "email",
  "digital",
  "smartphone",
];

// ------------------------------------------------------------------
// Validation
// ------------------------------------------------------------------

// Fail loudly. A sentence that breaks a rule is not an entry, so
// the program throws rather than writing a flawed file.
function fail(reason: string): never {
  throw new Error(`Invalid sentence: ${reason}`);
}

// Check the sentence against every rule, in a fixed order, so the
// first problem found is the one reported.
function validate(sentence: string): void {
  // It must not be empty or only whitespace.
  if (sentence.trim().length === 0) {
    fail("the sentence is blank");
  }

  // It must be a single line: no newlines or carriage returns.
  if (sentence.includes("\n") || sentence.includes("\r")) {
    fail("the sentence spans more than one line");
  }

  // It must carry no leading or trailing whitespace, so the file
  // on disk is exactly the sentence and nothing else.
  if (sentence !== sentence.trim()) {
    fail("the sentence has leading or trailing whitespace");
  }

  // It must fit the gate: at most 200 characters.
  if (sentence.length > 200) {
    fail(`the sentence is ${sentence.length} characters, over 200`);
  }

  // It must end in a period.
  if (!sentence.endsWith(".")) {
    fail("the sentence does not end in a period");
  }

  // That final period must be the only sentence terminator in
  // the whole sentence: no earlier period, and no question or
  // exclamation marks hiding a second sentence inside the first.
  const terminators = sentence.match(/[.!?]/g) ?? [];
  if (terminators.length !== 1) {
    fail(`found ${terminators.length} sentence terminators, need 1`);
  }

  // It must use no word coined after 1800 from the banned list.
  // Compare whole words, in lower case, so that a banned string
  // inside a longer innocent word does not cause a false alarm.
  const words = sentence.toLowerCase().match(/[a-z]+/g) ?? [];
  for (const word of words) {
    if (BANNED_WORDS.includes(word)) {
      fail(`the word "${word}" was coined after 1800`);
    }
  }
}

// ------------------------------------------------------------------
// Writing the entry
// ------------------------------------------------------------------

// Resolve the output directory the same way every make.fun
// program does: an explicit environment override, or /output.
function outputPath(): string {
  const dir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
  mkdirSync(dir, { recursive: true });
  return join(dir, "entry.txt");
}

// Write the sentence, then read it back and compare character
// for character. Only a verified file counts as success.
function writeEntry(sentence: string): string {
  const path = outputPath();
  writeFileSync(path, sentence, "utf8");
  const onDisk = readFileSync(path, "utf8");
  if (onDisk !== sentence) {
    fail("the file on disk does not match the sentence exactly");
  }
  return path;
}

// ------------------------------------------------------------------
// Main
// ------------------------------------------------------------------

function main(): void {
  validate(SENTENCE);
  const path = writeEntry(SENTENCE);
  console.log(SENTENCE);
  console.log(`Characters: ${SENTENCE.length}`);
  console.log(`Written to: ${path}`);
}

main();
