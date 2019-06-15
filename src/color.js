const Colors = {
  Bold: [1, 22],
  Grey: [90, 39],
  Green: [32, 39],
  Red: [31, 39]
};

function colorizedText(colors, text) {
  const start = `\u001B[${colors[0]}m`;
  const end = `\u001B[${colors[1]}m`;
  return `${start}${text}${end}`;
}

const color = {
  bold: text => colorizedText(Colors.Bold, text),
  grey: text => colorizedText(Colors.Grey, text),
  red: text => colorizedText(Colors.Red, text),
  green: text => colorizedText(Colors.Green, text)
};

module.exports = { color };
