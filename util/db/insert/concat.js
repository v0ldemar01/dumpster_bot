'use strict';
const fs = require('fs');
const readline = require('readline');
const fileStream = fs.createReadStream('./goods.txt');
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity,
});

(async () => {
  for await (const line of rl) {
    if (line == "}") {
      console.log(line + ",");
      continue;
    }
    if (!line.includes("more items")) console.log(line);
  }
})();
