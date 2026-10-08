const fs = require('fs');
const path = require('path');

const report = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'placeholder-report.json')));
console.log('Total placeholders:', report.placeholders.length);
report.placeholders.forEach((p, idx) => {
  console.log(`${idx + 1}. [${p.slug}] "${p.title}"`);
});
