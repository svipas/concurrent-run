const Color = {
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
  bold: text => colorizedText(Color.Bold, text),
  grey: text => colorizedText(Color.Grey, text),
  red: text => colorizedText(Color.Red, text),
  green: text => colorizedText(Color.Green, text)
};

module.exports = { color };
