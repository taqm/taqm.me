/* eslint-disable */

const fs = require('fs');
const path = require('path');

const matter = require('gray-matter');

const postsDir = path.resolve(__dirname, '../posts');
const files = fs.readdirSync(postsDir);
const data = files.map((fp) => matter.read(path.join(postsDir, fp)).data);

const count = data.reduce((acc, { tags }) => {
  if (!tags) return acc;
  for (const tag of tags) {
    acc[tag] = (acc[tag] || 0) + 1;
  }
  return acc;
}, {});

// キーの昇順
console.log(
  Object.entries(count).sort((lhs, rhs) => (lhs[0] > rhs[0] ? 1 : -1)),
);
