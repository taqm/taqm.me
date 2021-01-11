/* eslint-disable */

const fs = require('fs');
const path = require('path');

const matter = require('gray-matter');

const postsDir = path.resolve(__dirname, '../posts');
const files = fs.readdirSync(postsDir);

files.forEach((fp) => {
  const data = matter.read(path.join(postsDir, fp)).data
  if (data.description) {
    return;
  }
  console.warn(`not found description: slug = ${fp}`);
});
