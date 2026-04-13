export function parseAiMessageContent(rawContent: any): string {
  if (typeof rawContent !== "string") {
    return rawContent || "";
  }

  if (!rawContent) {
    return "";
  }

  let parsedContent = rawContent;

  if (parsedContent.includes('"content"')) {
    try {
      // Try parsing as a single JSON object first
      const parsed = JSON.parse(parsedContent);
      if (parsed && typeof parsed.content === "string") {
        parsedContent = parsed.content;
      }
    } catch {
      // If it fails, it might be multiple concatenated JSON strings.
      // E.g. {"content": "hello"}\n{"content": "world"}
      // Use regex to extract the "content" values.
      try {
        const matches = [...parsedContent.matchAll(/"content"\s*:\s*"((?:[^"\\]|\\.)*)"/g)];
        if (matches.length > 0) {
          parsedContent = matches.map(match => {
            try {
              // Re-parse the matched string to handle escaped characters like \n, \t, etc.
              return JSON.parse('"' + match[1] + '"');
            } catch {
              return match[1];
            }
          }).join('');
        }
      } catch (e) {
        // Fallback to original content
      }
    }
  }

  // Ensure any lingering literal "\n" strings (e.g. from backend raw storage) are unescaped
  parsedContent = parsedContent.replace(/\\n/g, "\n");

  return parsedContent;
}
