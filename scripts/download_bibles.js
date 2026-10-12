const fs = require('fs');
const path = require('path');
const https = require('https');

const API_BASE = 'https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles';
const GITHUB_API_BASE = 'https://api.github.com/repos/wldeh/bible-api/contents/bibles';
const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'bibles');

// Puedes añadir más versiones aquí (mira el bibles.json que se descargó)
const VERSIONS_TO_DOWNLOAD = [
  'es-pddpt', // Palabra de Dios para ti
  // 'en-asv',
];

function fetchJson(url, isGitHubApi = false) {
  return new Promise((resolve, reject) => {
    const options = isGitHubApi ? {
      headers: {
        'User-Agent': 'Node.js-Bible-Downloader',
        'Accept': 'application/vnd.github.v3+json'
      }
    } : {};

    https.get(url, options, (res) => {
      if (res.statusCode !== 200) {
        if (res.statusCode === 404) return resolve(null); // No existe
        return reject(new Error(`Failed to fetch ${url}: ${res.statusCode}`));
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function downloadBook(versionId, bookName, bookId) {
  const bookData = {
    id: bookId,
    name: bookName,
    chapters: []
  };

  let chapterNum = 1;
  let batchSize = 20; // Pedir 20 capítulos a la vez (JsDelivr es un CDN, lo soporta perfecto)
  let keepGoing = true;

  while (keepGoing) {
    const promises = [];
    for (let i = 0; i < batchSize; i++) {
      const url = `${API_BASE}/${versionId}/books/${encodeURIComponent(bookName)}/chapters/${chapterNum + i}.json`;
      promises.push(
        fetchJson(url).then(res => ({ num: chapterNum + i, data: res }))
      );
    }

    const results = await Promise.all(promises);
    
    for (const res of results) {
      if (!res.data || !res.data.data) {
        keepGoing = false; // Se encontró un 404, llegamos al límite de capítulos
      } else {
        bookData.chapters.push({
          chapter: res.num,
          verses: res.data.data.map(v => ({
            number: parseInt(v.verse, 10),
            text: v.text
          }))
        });
      }
    }
    chapterNum += batchSize;
  }
  return bookData;
}

async function downloadBibleVersion(versionId) {
  console.log(`\n🚀 Iniciando descarga ULTRARRÁPIDA de la versión: ${versionId}`);
  
  console.log(`  -> Obteniendo lista de libros...`);
  const booksUrl = `${GITHUB_API_BASE}/${versionId}/books`;
  const booksData = await fetchJson(booksUrl, true);
  
  if (!booksData || !Array.isArray(booksData)) {
    console.error(`  ✗ Error: No se pudo obtener la lista de libros para ${versionId}.`);
    return;
  }
  
  const books = booksData.filter(b => b.type === 'dir').map(b => b.name);
  console.log(`  -> Se encontraron ${books.length} libros. Comenzando descarga concurrente...`);

  const bibleData = {
    id: versionId,
    books: []
  };

  // Procesar libros con concurrencia (ej. 5 libros a la vez)
  const CONCURRENT_BOOKS = 5;
  for (let i = 0; i < books.length; i += CONCURRENT_BOOKS) {
    const batch = books.slice(i, i + CONCURRENT_BOOKS);
    process.stdout.write(`  ⏳ Procesando libros ${i + 1} a ${i + batch.length} de ${books.length}... `);
    
    const promises = batch.map((bookName, index) => 
      downloadBook(versionId, bookName, i + index + 1)
    );
    
    const booksResults = await Promise.all(promises);
    
    // Filtrar libros vacíos y agregarlos en orden
    for (const bookResult of booksResults) {
      if (bookResult.chapters.length > 0) {
        bibleData.books.push(bookResult);
      }
    }
    process.stdout.write(`✓\n`);
  }

  // Ordenar libros por ID para garantizar el orden correcto de la Biblia
  bibleData.books.sort((a, b) => a.id - b.id);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const destPath = path.join(OUTPUT_DIR, `${versionId}.json`);
  fs.writeFileSync(destPath, JSON.stringify(bibleData), 'utf8');
  console.log(`\n🎉 Versión ${versionId} guardada en ${destPath} (${(fs.statSync(destPath).size / 1024 / 1024).toFixed(2)} MB)`);
}

async function main() {
  for (const version of VERSIONS_TO_DOWNLOAD) {
    await downloadBibleVersion(version);
  }
  console.log('\nProceso finalizado. Puedes subir estos archivos a tu backend local, o agregarlos directo al SQLite.');
}

main().catch(console.error);
