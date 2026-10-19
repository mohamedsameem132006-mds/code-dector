/**
 * Language Detector Utility
 * Supports Python, JavaScript, TypeScript, Java, C, C++, PHP, HTML, CSS, SQL, C#, Go, Ruby, Rust, Kotlin, Swift, and JSON.
 * Returns { language, confidence, isSupported, heuristics }
 */

const EXTENSION_MAP = {
  '.py': 'python',
  '.js': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.java': 'java',
  '.c': 'c',
  '.h': 'c',
  '.cpp': 'cpp',
  '.cc': 'cpp',
  '.cxx': 'cpp',
  '.hpp': 'cpp',
  '.php': 'php',
  '.html': 'html',
  '.htm': 'html',
  '.css': 'css',
  '.sql': 'sql',
  '.cs': 'csharp',
  '.go': 'go',
  '.rb': 'ruby',
  '.rs': 'rust',
  '.kt': 'kotlin',
  '.kts': 'kotlin',
  '.swift': 'swift',
  '.json': 'json'
};

const SUPPORTED_LANGUAGES = [
  'python', 'javascript', 'typescript', 'java', 'c', 'cpp',
  'php', 'html', 'css', 'sql', 'csharp', 'go', 'ruby',
  'rust', 'kotlin', 'swift', 'json'
];

function detectLanguage(code = '', filename = '') {
  const cleanCode = code.trim();
  
  // 1. File extension match
  if (filename) {
    const extMatch = filename.toLowerCase().match(/\.[a-z0-9]+$/);
    if (extMatch && EXTENSION_MAP[extMatch[0]]) {
      return {
        language: EXTENSION_MAP[extMatch[0]],
        confidence: 0.98,
        isSupported: true,
        source: 'filename_extension'
      };
    }
  }

  // 2. JSON check
  if ((cleanCode.startsWith('{') && cleanCode.endsWith('}')) ||
      (cleanCode.startsWith('[') && cleanCode.endsWith(']'))) {
    try {
      JSON.parse(cleanCode);
      return { language: 'json', confidence: 0.95, isSupported: true, source: 'json_parser' };
    } catch {
      // not pure valid json, continue heuristics
    }
  }

  // 3. HTML check
  if (/<(!DOCTYPE\s+html|html|head|body|div|span|script|style)/i.test(cleanCode)) {
    return { language: 'html', confidence: 0.92, isSupported: true, source: 'html_tags' };
  }

  // 4. SQL check
  if (/\b(SELECT\s+.*?\s+FROM|INSERT\s+INTO|UPDATE\s+.*?\s+SET|DELETE\s+FROM|CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE)\b/i.test(cleanCode)) {
    return { language: 'sql', confidence: 0.90, isSupported: true, source: 'sql_keywords' };
  }

  // 5. CSS check
  if (/[a-zA-Z0-9_#-]+\s*\{[^}]*?(?:color|margin|padding|background|display|font-size|border):/i.test(cleanCode)) {
    return { language: 'css', confidence: 0.88, isSupported: true, source: 'css_rules' };
  }

  // 6. PHP check
  if (/<\?php/i.test(cleanCode) || /\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*\s*=/i.test(cleanCode)) {
    return { language: 'php', confidence: 0.90, isSupported: true, source: 'php_syntax' };
  }

  // 7. Python check
  if (/\b(def\s+[a-zA-Z_]\w*\s*\(|import\s+[a-zA-Z_]|from\s+[a-zA-Z_]\w*\s+import|if\s+__name__\s*==\s*['"]__main__['"]|elif\s+|print\(|None|True|False)\b/.test(cleanCode) &&
      !cleanCode.includes('{') && !cleanCode.includes(';')) {
    return { language: 'python', confidence: 0.92, isSupported: true, source: 'python_keywords' };
  }
  if (/\b(def\s+[a-zA-Z_]\w*\s*\(.*?:\s*$|elif\s+.*?:|class\s+\w+.*?:)/m.test(cleanCode)) {
    return { language: 'python', confidence: 0.90, isSupported: true, source: 'python_colon_syntax' };
  }

  // 8. Go check
  if (/\b(package\s+\w+|import\s+\([^)]+\)|func\s+(?:\([^)]+\)\s+)?[a-zA-Z_]\w*\(|fmt\.Print)/.test(cleanCode)) {
    return { language: 'go', confidence: 0.92, isSupported: true, source: 'go_keywords' };
  }

  // 9. Rust check
  if (/\b(fn\s+[a-zA-Z_]\w*\s*\(|let\s+mut\s+|impl\s+|pub\s+fn|println!\()/.test(cleanCode)) {
    return { language: 'rust', confidence: 0.92, isSupported: true, source: 'rust_keywords' };
  }

  // 10. Java check
  if (/\b(public\s+class\s+\w+|public\s+static\s+void\s+main|System\.out\.println)/.test(cleanCode)) {
    return { language: 'java', confidence: 0.95, isSupported: true, source: 'java_signature' };
  }

  // 11. C# check
  if (/\b(using\s+System|namespace\s+\w+|Console\.WriteLine)/.test(cleanCode)) {
    return { language: 'csharp', confidence: 0.92, isSupported: true, source: 'csharp_keywords' };
  }

  // 12. C / C++ check
  if (/#include\s*<[a-z0-9_.]+>/i.test(cleanCode)) {
    if (/#include\s*<iostream>|std::cout|std::vector|class\s+\w+\s*\{/i.test(cleanCode)) {
      return { language: 'cpp', confidence: 0.92, isSupported: true, source: 'cpp_headers' };
    }
    return { language: 'c', confidence: 0.90, isSupported: true, source: 'c_headers' };
  }

  // 13. Ruby check
  if (/\b(def\s+[a-zA-Z_]\w*|puts\s+|require\s+['"]|attr_accessor|elsif\s+)/.test(cleanCode) && /\bend\b/.test(cleanCode)) {
    return { language: 'ruby', confidence: 0.88, isSupported: true, source: 'ruby_keywords' };
  }

  // 14. Kotlin check
  if (/\b(fun\s+[a-zA-Z_]\w*\s*\(|val\s+\w+\s*:\s*\w+|var\s+\w+\s*:\s*\w+|println\()/.test(cleanCode)) {
    return { language: 'kotlin', confidence: 0.85, isSupported: true, source: 'kotlin_keywords' };
  }

  // 15. Swift check
  if (/\b(func\s+[a-zA-Z_]\w*|import\s+UIKit|import\s+Foundation|let\s+\w+\s*=\s*|var\s+\w+\s*=\s*)/.test(cleanCode)) {
    return { language: 'swift', confidence: 0.82, isSupported: true, source: 'swift_keywords' };
  }

  // 16. TypeScript vs JavaScript
  if (/:\s*(string|number|boolean|any|void|never|unknown|Promise<[a-zA-Z_]+>)|interface\s+\w+\s*\{|type\s+\w+\s*=|as\s+[a-zA-Z_]+/.test(cleanCode)) {
    return { language: 'typescript', confidence: 0.88, isSupported: true, source: 'ts_type_annotations' };
  }
  if (/\b(const|let|var|function|console\.log|document\.|window\.|export\s+default|require\()/i.test(cleanCode)) {
    return { language: 'javascript', confidence: 0.85, isSupported: true, source: 'js_keywords' };
  }

  // Fallback
  return {
    language: 'javascript',
    confidence: 0.50,
    isSupported: true,
    source: 'default_fallback'
  };
}

module.exports = {
  detectLanguage,
  SUPPORTED_LANGUAGES,
  EXTENSION_MAP
};
