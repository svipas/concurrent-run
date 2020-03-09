const bold = [1, 22];
const grey = [90, 39];
const green = [32, 39];
const red = [31, 39];

function colorizeText(colors: number[], text: string) {
  const start = `\u001B[${colors[0]}m`;
  const end = `\u001B[${colors[1]}m`;
  return `${start}${text}${end}`;
}

export const color = {
  bold: (text: string) => colorizeText(bold, text),
  grey: (text: string) => colorizeText(grey, text),
  red: (text: string) => colorizeText(red, text),
  green: (text: string) => colorizeText(green, text)
};
