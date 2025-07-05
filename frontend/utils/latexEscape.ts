// utils/latexEscape.ts

/**
 * Escapes special LaTeX characters to prevent compilation errors
 * @param text - The text to escape
 * @returns The escaped text safe for LaTeX compilation
 */
export function escapeLatex(text: string): string {
  if (!text) return '';
  
  let escapedText = text;
  
  // Order matters here - backslash must be first
  escapedText = escapedText.replace(/\\/g, '\\textbackslash{}');
  escapedText = escapedText.replace(/&/g, '\\&');
  escapedText = escapedText.replace(/%/g, '\\%');
  escapedText = escapedText.replace(/\$/g, '\\$');
  escapedText = escapedText.replace(/#/g, '\\#');
  escapedText = escapedText.replace(/_/g, '\\_');
  escapedText = escapedText.replace(/{/g, '\\{');
  escapedText = escapedText.replace(/}/g, '\\}');
  escapedText = escapedText.replace(/~/g, '\\textasciitilde{}');
  escapedText = escapedText.replace(/\^/g, '\\textasciicircum{}');
  escapedText = escapedText.replace(/</g, '\\textless{}');
  escapedText = escapedText.replace(/>/g, '\\textgreater{}');
  
  // Handle quotes and special formatting
  escapedText = escapedText.replace(/"/g, "''");
  escapedText = escapedText.replace(/'/g, "'");
  
  return escapedText;
}

/**
 * Sanitizes text for use in LaTeX section headers
 */
export function sanitizeForHeader(text: string): string {
  return escapeLatex(text).replace(/\n/g, ' ').trim();
}

/**
 * Formats a list of items for LaTeX
 */
export function formatLatexList(items: string[], escape: boolean = true): string {
  if (!items || items.length === 0) return '';
  
  const processedItems = escape ? items.map(escapeLatex) : items;
  return processedItems.join(', ');
}
