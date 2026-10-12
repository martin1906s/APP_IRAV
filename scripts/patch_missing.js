const fs = require('fs');
const path = require('path');
const https = require('https');

const versions = {
  'RV1960': 'RV1960',
  'NVI': 'NVI',
  'NTV': 'NTV', // Might not exist on bolls, let's fallback to RVR or just try
  'PDT': 'PDT'
};

async function fetchChapter(version, bookId, chapter) {
  return new Promise((resolve) => {
    https.get(`https://bolls.life/get-text/${version}/${bookId}/${chapter}/`, {
      headers: { 'User-Agent': 'node' }
    }, (res) => {
      if (res.statusCode !== 200) {
        return resolve(null);
      }
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(d);
          // Convert bolls format to our format
          const verses = parsed.map(v => ({
            number: v.verse,
            text: v.text.replace(/<[^>]+>/g, '') // strip html
          }));
          resolve(verses);
        } catch(e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function run() {
  for (const [fileKey, bollsId] of Object.entries(versions)) {
    const p = path.join(__dirname, '..', 'assets', 'bible', `${fileKey}.json`);
    if (!fs.existsSync(p)) continue;

    console.log(`Patching ${fileKey}.json...`);
    let data = require(p);
    let patchedCount = 0;

    for (const bookId in data) {
      for (const chapter in data[bookId]) {
        if (data[bookId][chapter].length === 0) {
          console.log(`Missing ${fileKey} - Book ${bookId}, Chap ${chapter}... Fetching...`);
          
          let verses = await fetchChapter(bollsId, bookId, chapter);
          if (verses && verses.length > 0) {
            data[bookId][chapter] = verses;
            patchedCount++;
            console.log(`  ✓ Fixed!`);
          } else {
            // Fallback to RVR if bolls fails
            const rvr = require(path.join(__dirname, '..', 'assets', 'bible', 'RVR.json'));
            if (rvr[bookId] && rvr[bookId][chapter] && rvr[bookId][chapter].length > 0) {
               data[bookId][chapter] = rvr[bookId][chapter];
               patchedCount++;
               console.log(`  ✓ Fixed from RVR fallback`);
            }
          }
          // Sleep a bit to not hammer
          await new Promise(r => setTimeout(r, 200));
        }
      }
    }

    if (patchedCount > 0) {
      fs.writeFileSync(p, JSON.stringify(data), 'utf8');
      console.log(`Saved ${patchedCount} patched chapters to ${fileKey}.json`);
    } else {
      console.log(`No missing chapters patched for ${fileKey}.`);
    }
  }
}

run();
