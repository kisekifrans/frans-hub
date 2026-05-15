export interface KeyDef {
  id: string;
  label: string;
  codes: string[];
  width?: number;
}

export const KEYBOARD_ROWS: KeyDef[][] = [
  [
    { id: "Backquote", label: "`", codes: ["`", "~"] },
    { id: "Digit1", label: "1", codes: ["1", "!"] },
    { id: "Digit2", label: "2", codes: ["2", "@"] },
    { id: "Digit3", label: "3", codes: ["3", "#"] },
    { id: "Digit4", label: "4", codes: ["4", "$"] },
    { id: "Digit5", label: "5", codes: ["5", "%"] },
    { id: "Digit6", label: "6", codes: ["6", "^"] },
    { id: "Digit7", label: "7", codes: ["7", "&"] },
    { id: "Digit8", label: "8", codes: ["8", "*"] },
    { id: "Digit9", label: "9", codes: ["9", "("] },
    { id: "Digit0", label: "0", codes: ["0", ")"] },
    { id: "Minus", label: "-", codes: ["-", "_"] },
    { id: "Equal", label: "=", codes: ["=", "+"] },
    { id: "Backspace", label: "⌫", codes: ["Backspace"], width: 1.6 },
  ],
  [
    { id: "Tab", label: "Tab", codes: ["Tab"], width: 1.3 },
    { id: "KeyQ", label: "Q", codes: ["q", "Q"] },
    { id: "KeyW", label: "W", codes: ["w", "W"] },
    { id: "KeyE", label: "E", codes: ["e", "E"] },
    { id: "KeyR", label: "R", codes: ["r", "R"] },
    { id: "KeyT", label: "T", codes: ["t", "T"] },
    { id: "KeyY", label: "Y", codes: ["y", "Y"] },
    { id: "KeyU", label: "U", codes: ["u", "U"] },
    { id: "KeyI", label: "I", codes: ["i", "I"] },
    { id: "KeyO", label: "O", codes: ["o", "O"] },
    { id: "KeyP", label: "P", codes: ["p", "P"] },
    { id: "BracketLeft", label: "[", codes: ["[", "{"] },
    { id: "BracketRight", label: "]", codes: ["]", "}"] },
    { id: "Backslash", label: "\\", codes: ["\\", "|"], width: 1.3 },
  ],
  [
    { id: "CapsLock", label: "Caps", codes: ["CapsLock"], width: 1.5 },
    { id: "KeyA", label: "A", codes: ["a", "A"] },
    { id: "KeyS", label: "S", codes: ["s", "S"] },
    { id: "KeyD", label: "D", codes: ["d", "D"] },
    { id: "KeyF", label: "F", codes: ["f", "F"] },
    { id: "KeyG", label: "G", codes: ["g", "G"] },
    { id: "KeyH", label: "H", codes: ["h", "H"] },
    { id: "KeyJ", label: "J", codes: ["j", "J"] },
    { id: "KeyK", label: "K", codes: ["k", "K"] },
    { id: "KeyL", label: "L", codes: ["l", "L"] },
    { id: "Semicolon", label: ";", codes: [";", ":"] },
    { id: "Quote", label: "'", codes: ["'", '"'] },
    { id: "Enter", label: "Enter", codes: ["Enter"], width: 1.7 },
  ],
  [
    { id: "ShiftLeft", label: "Shift", codes: ["Shift"], width: 1.8 },
    { id: "KeyZ", label: "Z", codes: ["z", "Z"] },
    { id: "KeyX", label: "X", codes: ["x", "X"] },
    { id: "KeyC", label: "C", codes: ["c", "C"] },
    { id: "KeyV", label: "V", codes: ["v", "V"] },
    { id: "KeyB", label: "B", codes: ["b", "B"] },
    { id: "KeyN", label: "N", codes: ["n", "N"] },
    { id: "KeyM", label: "M", codes: ["m", "M"] },
    { id: "Comma", label: ",", codes: [",", "<"] },
    { id: "Period", label: ".", codes: [".", ">"] },
    { id: "Slash", label: "/", codes: ["/", "?"] },
    { id: "ShiftRight", label: "Shift", codes: ["Shift"], width: 1.8 },
  ],
  [
    { id: "Space", label: "Space", codes: [" ", "Space"], width: 6.2 },
  ],
];

const CHAR_TO_KEY = new Map<string, string>();

for (const row of KEYBOARD_ROWS) {
  for (const key of row) {
    for (const code of key.codes) {
      CHAR_TO_KEY.set(code, key.id);
    }
  }
}

CHAR_TO_KEY.set("\n", "Enter");
CHAR_TO_KEY.set("\t", "Tab");

export function charToKeyId(char: string): string | null {
  if (!char) return "Space";
  return CHAR_TO_KEY.get(char) ?? CHAR_TO_KEY.get(char.toLowerCase()) ?? null;
}
