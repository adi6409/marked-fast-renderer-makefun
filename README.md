# Guarded markdown renderer

Dependency-free ES module targeting marked 18.1.3 default HTML semantics.
`parse.js` exports `parse(markdown)`; `main.ts` implements the kit's JSON driver.

The parser in `vendor/marked/marked.esm.js` is a modified fork of the local
kit's marked 18.1.3, not an independently authored Markdown grammar. Its
original LICENSE and NOTICE are preserved beside it. Root code and dispatch
optimizations are newly authored for this entry. The upstream NOTICE describes
the original artifact; this fork adds character guards before inline tokenizer
calls. These guards skip impossible matches without changing token precedence.
The default-only inline path also skips delimiter bookkeeping when no emphasis
or strikethrough marker exists, and emits simple ASCII prose as one text token.
The fork is intended for this default-options API, not custom marked extensions.

Each call creates its own lexer, parser and options. No case output, block,
or input-derived result is retained across calls. No runtime dependencies,
network access, installation, clock reads, or scratch files are needed.
