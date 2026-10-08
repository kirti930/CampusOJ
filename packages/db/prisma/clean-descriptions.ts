import * as fs from 'fs';
import * as path from 'path';

function main() {
  const dataPath = path.join(__dirname, 'data', 'curated-sheet-problems.json');
  const catalog = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  let cleaned = 0;
  for (const item of catalog) {
    if (
      item.description.includes('The algorithm processes the input elements') ||
      item.description.includes('Given the challenge under') ||
      item.description.includes('Given the level order traversal array') ||
      item.description.includes('Given a graph with `n` vertices') ||
      item.description.includes('Solve the problem:') ||
      item.description.includes('optimal state evaluation')
    ) {
      let paramsDisplay = '';
      if (item.paramTypes) {
        paramsDisplay = item.paramTypes.map((t: string, i: number) => `arg${i} = ...`).join(', ');
      }

      item.description = `## ${item.title}\n\nSolve the problem: **${item.title}**.\n\n### Examples\n\n**Example 1:**\n\`\`\`text\nInput: ${paramsDisplay}\nOutput: ...\n\`\`\`\n\n### Constraints\n- constraints here`;
      cleaned++;
    }
  }

  fs.writeFileSync(dataPath, JSON.stringify(catalog, null, 2));
  console.log(`Cleaned ${cleaned} dummy descriptions in curated-sheet-problems.json`);
}

main();
