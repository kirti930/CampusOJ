const fs = require('fs');
const path = require('path');

const report = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'placeholder-report.json')));
const byTopic = {};

report.placeholders.forEach((p) => {
  const topic = p.tags && p.tags[0] ? p.tags[0] : 'other';
  if (!byTopic[topic]) byTopic[topic] = [];
  byTopic[topic].push({ title: p.title, slug: p.slug });
});

for (const [topic, list] of Object.entries(byTopic)) {
  console.log(`\n=== Topic: ${topic} (${list.length}) ===`);
  list.forEach((item) => console.log(`  - "${item.title}" -> "${item.slug}"`));
}
