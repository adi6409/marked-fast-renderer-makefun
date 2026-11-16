import { Lexer, Parser, getDefaults } from './vendor/marked/marked.esm.js';

/**
 * Render independently, using the default synchronous GFM grammar.
 * Fresh options also isolate the mutable tokenizer and renderer pointers.
 * The fork shortcuts plain inline text and avoids unused delimiter scans.
 */
// No escapes, entities, delimiters, line breaks, email addresses or schemes.
// A literal www. can still start a GFM link and must use the full lexer.
const plainInline = /^[A-Za-z0-9 ,.!?;()/+%=\-]+$/;
function copyInline(tokens) {
  return tokens.map(token => token.tokens
    ? { ...token, tokens: copyInline(token.tokens) }
    : { ...token });
}

class GuardedLexer extends Lexer {
  // This map dies with this document. No state survives a parse() call.
  inlineMemo = new Map();
  inlineTokens(src, tokens = []) {
    if (plainInline.test(src) && !src.includes('www.')) {
      const last = tokens[tokens.length - 1];
      if (last?.type === 'text' && !last.escaped) {
        last.raw += src;
        last.text += src;
      } else {
        tokens.push({ type: 'text', raw: src, text: src, escaped: false });
      }
      return tokens;
    }
    // Links and HTML can depend on or change lexer state; always lex them.
    // Reference definitions and link nesting cannot affect the admitted text.
    const reusable = tokens.length === 0 && !this.state.inRawBlock
      && src.length <= 4096 && !/[<\[!@:]/.test(src) && !src.includes('www.');
    if (reusable) {
      const saved = this.inlineMemo.get(src);
      if (saved) return copyInline(saved);
    }
    const result = super.inlineTokens(src, tokens);
    if (reusable && this.inlineMemo.size < 2048) {
      this.inlineMemo.set(src, copyInline(result));
    }
    return result;
  }
}

export function parse(markdown) {
  const options = getDefaults();
  const tokens = new Lexer(options).lex(markdown);
  return new Parser(options).parse(tokens);
}
