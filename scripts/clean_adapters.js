const fs = require('fs');
const file = 'd:/APP_IRAV/src/infrastructure/adapters/supabase/SupabaseAdapters.ts';
let content = fs.readFileSync(file, 'utf8');

// 1. Ensure imports at top
if (!content.includes('base64-arraybuffer')) {
  content = "import * as Crypto from 'expo-crypto';\nimport { decode } from 'base64-arraybuffer';\nimport { getStoredUser } from '../../api/authStore';\n" + content;
}

// 2. Remove duplicate snippet
const cutIndex = content.indexOf('      return [];\r\n    }\r\n    return (data || []).map(item => {');
const altCutIndex = content.indexOf('      return [];\n    }\n    return (data || []).map(item => {');
const targetIdx = cutIndex !== -1 ? cutIndex : altCutIndex;

if (targetIdx !== -1) {
  const endIdx = content.indexOf('export class SupabaseHighlightAdapter {', targetIdx);
  if (endIdx !== -1) {
    content = content.substring(0, targetIdx) + content.substring(endIdx);
    console.log('Duplicate section successfully removed!');
  }
}

fs.writeFileSync(file, content, 'utf8');
console.log('SupabaseAdapters.ts processed cleanly!');
