"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key2 of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key2) && key2 !== except)
          __defProp(to, key2, { get: () => from[key2], enumerable: !(desc = __getOwnPropDesc(from, key2)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/highlight.js/lib/core.js
  var require_core = __commonJS({
    "node_modules/highlight.js/lib/core.js"(exports, module) {
      function deepFreeze(obj) {
        if (obj instanceof Map) {
          obj.clear = obj.delete = obj.set = function() {
            throw new Error("map is read-only");
          };
        } else if (obj instanceof Set) {
          obj.add = obj.clear = obj.delete = function() {
            throw new Error("set is read-only");
          };
        }
        Object.freeze(obj);
        Object.getOwnPropertyNames(obj).forEach((name) => {
          const prop = obj[name];
          const type = typeof prop;
          if ((type === "object" || type === "function") && !Object.isFrozen(prop)) {
            deepFreeze(prop);
          }
        });
        return obj;
      }
      var Response = class {
        /**
         * @param {CompiledMode} mode
         */
        constructor(mode) {
          if (mode.data === void 0) mode.data = {};
          this.data = mode.data;
          this.isMatchIgnored = false;
        }
        ignoreMatch() {
          this.isMatchIgnored = true;
        }
      };
      function escapeHTML(value) {
        return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
      }
      function inherit$1(original, ...objects) {
        const result = /* @__PURE__ */ Object.create(null);
        for (const key2 in original) {
          result[key2] = original[key2];
        }
        objects.forEach(function(obj) {
          for (const key2 in obj) {
            result[key2] = obj[key2];
          }
        });
        return (
          /** @type {T} */
          result
        );
      }
      var SPAN_CLOSE = "</span>";
      var emitsWrappingTags = (node) => {
        return !!node.scope;
      };
      var scopeToCSSClass = (name, { prefix }) => {
        if (name.startsWith("language:")) {
          return name.replace("language:", "language-");
        }
        if (name.includes(".")) {
          const pieces = name.split(".");
          return [
            `${prefix}${pieces.shift()}`,
            ...pieces.map((x, i) => `${x}${"_".repeat(i + 1)}`)
          ].join(" ");
        }
        return `${prefix}${name}`;
      };
      var HTMLRenderer = class {
        /**
         * Creates a new HTMLRenderer
         *
         * @param {Tree} parseTree - the parse tree (must support `walk` API)
         * @param {{classPrefix: string}} options
         */
        constructor(parseTree, options) {
          this.buffer = "";
          this.classPrefix = options.classPrefix;
          parseTree.walk(this);
        }
        /**
         * Adds texts to the output stream
         *
         * @param {string} text */
        addText(text) {
          this.buffer += escapeHTML(text);
        }
        /**
         * Adds a node open to the output stream (if needed)
         *
         * @param {Node} node */
        openNode(node) {
          if (!emitsWrappingTags(node)) return;
          const className = scopeToCSSClass(
            node.scope,
            { prefix: this.classPrefix }
          );
          this.span(className);
        }
        /**
         * Adds a node close to the output stream (if needed)
         *
         * @param {Node} node */
        closeNode(node) {
          if (!emitsWrappingTags(node)) return;
          this.buffer += SPAN_CLOSE;
        }
        /**
         * returns the accumulated buffer
        */
        value() {
          return this.buffer;
        }
        // helpers
        /**
         * Builds a span element
         *
         * @param {string} className */
        span(className) {
          this.buffer += `<span class="${className}">`;
        }
      };
      var newNode = (opts = {}) => {
        const result = { children: [] };
        Object.assign(result, opts);
        return result;
      };
      var TokenTree = class _TokenTree {
        constructor() {
          this.rootNode = newNode();
          this.stack = [this.rootNode];
        }
        get top() {
          return this.stack[this.stack.length - 1];
        }
        get root() {
          return this.rootNode;
        }
        /** @param {Node} node */
        add(node) {
          this.top.children.push(node);
        }
        /** @param {string} scope */
        openNode(scope) {
          const node = newNode({ scope });
          this.add(node);
          this.stack.push(node);
        }
        closeNode() {
          if (this.stack.length > 1) {
            return this.stack.pop();
          }
          return void 0;
        }
        closeAllNodes() {
          while (this.closeNode()) ;
        }
        toJSON() {
          return JSON.stringify(this.rootNode, null, 4);
        }
        /**
         * @typedef { import("./html_renderer").Renderer } Renderer
         * @param {Renderer} builder
         */
        walk(builder) {
          return this.constructor._walk(builder, this.rootNode);
        }
        /**
         * @param {Renderer} builder
         * @param {Node} node
         */
        static _walk(builder, node) {
          if (typeof node === "string") {
            builder.addText(node);
          } else if (node.children) {
            builder.openNode(node);
            node.children.forEach((child) => this._walk(builder, child));
            builder.closeNode(node);
          }
          return builder;
        }
        /**
         * @param {Node} node
         */
        static _collapse(node) {
          if (typeof node === "string") return;
          if (!node.children) return;
          if (node.children.every((el) => typeof el === "string")) {
            node.children = [node.children.join("")];
          } else {
            node.children.forEach((child) => {
              _TokenTree._collapse(child);
            });
          }
        }
      };
      var TokenTreeEmitter = class extends TokenTree {
        /**
         * @param {*} options
         */
        constructor(options) {
          super();
          this.options = options;
        }
        /**
         * @param {string} text
         */
        addText(text) {
          if (text === "") {
            return;
          }
          this.add(text);
        }
        /** @param {string} scope */
        startScope(scope) {
          this.openNode(scope);
        }
        endScope() {
          this.closeNode();
        }
        /**
         * @param {Emitter & {root: DataNode}} emitter
         * @param {string} name
         */
        __addSublanguage(emitter, name) {
          const node = emitter.root;
          if (name) node.scope = `language:${name}`;
          this.add(node);
        }
        toHTML() {
          const renderer = new HTMLRenderer(this, this.options);
          return renderer.value();
        }
        finalize() {
          this.closeAllNodes();
          return true;
        }
      };
      function source(re) {
        if (!re) return null;
        if (typeof re === "string") return re;
        return re.source;
      }
      function lookahead(re) {
        return concat("(?=", re, ")");
      }
      function anyNumberOfTimes(re) {
        return concat("(?:", re, ")*");
      }
      function optional(re) {
        return concat("(?:", re, ")?");
      }
      function concat(...args) {
        const joined = args.map((x) => source(x)).join("");
        return joined;
      }
      function stripOptionsFromArgs(args) {
        const opts = args[args.length - 1];
        if (typeof opts === "object" && opts.constructor === Object) {
          args.splice(args.length - 1, 1);
          return opts;
        } else {
          return {};
        }
      }
      function either(...args) {
        const opts = stripOptionsFromArgs(args);
        const joined = "(" + (opts.capture ? "" : "?:") + args.map((x) => source(x)).join("|") + ")";
        return joined;
      }
      function countMatchGroups(re) {
        return new RegExp(re.toString() + "|").exec("").length - 1;
      }
      function startsWith(re, lexeme) {
        const match = re && re.exec(lexeme);
        return match && match.index === 0;
      }
      var BACKREF_RE = /\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./;
      function _rewriteBackreferences(regexps, { joinWith }) {
        let numCaptures = 0;
        return regexps.map((regex) => {
          numCaptures += 1;
          const offset = numCaptures;
          let re = source(regex);
          let out = "";
          while (re.length > 0) {
            const match = BACKREF_RE.exec(re);
            if (!match) {
              out += re;
              break;
            }
            out += re.substring(0, match.index);
            re = re.substring(match.index + match[0].length);
            if (match[0][0] === "\\" && match[1]) {
              out += "\\" + String(Number(match[1]) + offset);
            } else {
              out += match[0];
              if (match[0] === "(") {
                numCaptures++;
              }
            }
          }
          return out;
        }).map((re) => `(${re})`).join(joinWith);
      }
      var MATCH_NOTHING_RE = /\b\B/;
      var IDENT_RE = "[a-zA-Z]\\w*";
      var UNDERSCORE_IDENT_RE = "[a-zA-Z_]\\w*";
      var NUMBER_RE = "\\b\\d+(\\.\\d+)?";
      var C_NUMBER_RE = "(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)";
      var BINARY_NUMBER_RE = "\\b(0b[01]+)";
      var RE_STARTERS_RE = "!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~";
      var SHEBANG = (opts = {}) => {
        const beginShebang = /^#![ ]*\//;
        if (opts.binary) {
          opts.begin = concat(
            beginShebang,
            /.*\b/,
            opts.binary,
            /\b.*/
          );
        }
        return inherit$1({
          scope: "meta",
          begin: beginShebang,
          end: /$/,
          relevance: 0,
          /** @type {ModeCallback} */
          "on:begin": (m, resp) => {
            if (m.index !== 0) resp.ignoreMatch();
          }
        }, opts);
      };
      var BACKSLASH_ESCAPE = {
        begin: "\\\\[\\s\\S]",
        relevance: 0
      };
      var APOS_STRING_MODE = {
        scope: "string",
        begin: "'",
        end: "'",
        illegal: "\\n",
        contains: [BACKSLASH_ESCAPE]
      };
      var QUOTE_STRING_MODE = {
        scope: "string",
        begin: '"',
        end: '"',
        illegal: "\\n",
        contains: [BACKSLASH_ESCAPE]
      };
      var PHRASAL_WORDS_MODE = {
        begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/
      };
      var COMMENT = function(begin, end, modeOptions = {}) {
        const mode = inherit$1(
          {
            scope: "comment",
            begin,
            end,
            contains: []
          },
          modeOptions
        );
        mode.contains.push({
          scope: "doctag",
          // hack to avoid the space from being included. the space is necessary to
          // match here to prevent the plain text rule below from gobbling up doctags
          begin: "[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)",
          end: /(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,
          excludeBegin: true,
          relevance: 0
        });
        const ENGLISH_WORD = either(
          // list of common 1 and 2 letter words in English
          "I",
          "a",
          "is",
          "so",
          "us",
          "to",
          "at",
          "if",
          "in",
          "it",
          "on",
          // note: this is not an exhaustive list of contractions, just popular ones
          /[A-Za-z]+['](d|ve|re|ll|t|s|n)/,
          // contractions - can't we'd they're let's, etc
          /[A-Za-z]+[-][a-z]+/,
          // `no-way`, etc.
          /[A-Za-z][a-z]{2,}/
          // allow capitalized words at beginning of sentences
        );
        mode.contains.push(
          {
            // TODO: how to include ", (, ) without breaking grammars that use these for
            // comment delimiters?
            // begin: /[ ]+([()"]?([A-Za-z'-]{3,}|is|a|I|so|us|[tT][oO]|at|if|in|it|on)[.]?[()":]?([.][ ]|[ ]|\))){3}/
            // ---
            // this tries to find sequences of 3 english words in a row (without any
            // "programming" type syntax) this gives us a strong signal that we've
            // TRULY found a comment - vs perhaps scanning with the wrong language.
            // It's possible to find something that LOOKS like the start of the
            // comment - but then if there is no readable text - good chance it is a
            // false match and not a comment.
            //
            // for a visual example please see:
            // https://github.com/highlightjs/highlight.js/issues/2827
            begin: concat(
              /[ ]+/,
              // necessary to prevent us gobbling up doctags like /* @author Bob Mcgill */
              "(",
              ENGLISH_WORD,
              /[.]?[:]?([.][ ]|[ ])/,
              "){3}"
            )
            // look for 3 words in a row
          }
        );
        return mode;
      };
      var C_LINE_COMMENT_MODE = COMMENT("//", "$");
      var C_BLOCK_COMMENT_MODE = COMMENT("/\\*", "\\*/");
      var HASH_COMMENT_MODE = COMMENT("#", "$");
      var NUMBER_MODE = {
        scope: "number",
        begin: NUMBER_RE,
        relevance: 0
      };
      var C_NUMBER_MODE = {
        scope: "number",
        begin: C_NUMBER_RE,
        relevance: 0
      };
      var BINARY_NUMBER_MODE = {
        scope: "number",
        begin: BINARY_NUMBER_RE,
        relevance: 0
      };
      var REGEXP_MODE = {
        scope: "regexp",
        begin: /\/(?=[^/\n]*\/)/,
        end: /\/[gimuy]*/,
        contains: [
          BACKSLASH_ESCAPE,
          {
            begin: /\[/,
            end: /\]/,
            relevance: 0,
            contains: [BACKSLASH_ESCAPE]
          }
        ]
      };
      var TITLE_MODE = {
        scope: "title",
        begin: IDENT_RE,
        relevance: 0
      };
      var UNDERSCORE_TITLE_MODE = {
        scope: "title",
        begin: UNDERSCORE_IDENT_RE,
        relevance: 0
      };
      var METHOD_GUARD = {
        // excludes method names from keyword processing
        begin: "\\.\\s*" + UNDERSCORE_IDENT_RE,
        relevance: 0
      };
      var END_SAME_AS_BEGIN = function(mode) {
        return Object.assign(
          mode,
          {
            /** @type {ModeCallback} */
            "on:begin": (m, resp) => {
              resp.data._beginMatch = m[1];
            },
            /** @type {ModeCallback} */
            "on:end": (m, resp) => {
              if (resp.data._beginMatch !== m[1]) resp.ignoreMatch();
            }
          }
        );
      };
      var MODES = /* @__PURE__ */ Object.freeze({
        __proto__: null,
        APOS_STRING_MODE,
        BACKSLASH_ESCAPE,
        BINARY_NUMBER_MODE,
        BINARY_NUMBER_RE,
        COMMENT,
        C_BLOCK_COMMENT_MODE,
        C_LINE_COMMENT_MODE,
        C_NUMBER_MODE,
        C_NUMBER_RE,
        END_SAME_AS_BEGIN,
        HASH_COMMENT_MODE,
        IDENT_RE,
        MATCH_NOTHING_RE,
        METHOD_GUARD,
        NUMBER_MODE,
        NUMBER_RE,
        PHRASAL_WORDS_MODE,
        QUOTE_STRING_MODE,
        REGEXP_MODE,
        RE_STARTERS_RE,
        SHEBANG,
        TITLE_MODE,
        UNDERSCORE_IDENT_RE,
        UNDERSCORE_TITLE_MODE
      });
      function skipIfHasPrecedingDot(match, response) {
        const before = match.input[match.index - 1];
        if (before === ".") {
          response.ignoreMatch();
        }
      }
      function scopeClassName(mode, _parent) {
        if (mode.className !== void 0) {
          mode.scope = mode.className;
          delete mode.className;
        }
      }
      function beginKeywords(mode, parent) {
        if (!parent) return;
        if (!mode.beginKeywords) return;
        mode.begin = "\\b(" + mode.beginKeywords.split(" ").join("|") + ")(?!\\.)(?=\\b|\\s)";
        mode.__beforeBegin = skipIfHasPrecedingDot;
        mode.keywords = mode.keywords || mode.beginKeywords;
        delete mode.beginKeywords;
        if (mode.relevance === void 0) mode.relevance = 0;
      }
      function compileIllegal(mode, _parent) {
        if (!Array.isArray(mode.illegal)) return;
        mode.illegal = either(...mode.illegal);
      }
      function compileMatch(mode, _parent) {
        if (!mode.match) return;
        if (mode.begin || mode.end) throw new Error("begin & end are not supported with match");
        mode.begin = mode.match;
        delete mode.match;
      }
      function compileRelevance(mode, _parent) {
        if (mode.relevance === void 0) mode.relevance = 1;
      }
      var beforeMatchExt = (mode, parent) => {
        if (!mode.beforeMatch) return;
        if (mode.starts) throw new Error("beforeMatch cannot be used with starts");
        const originalMode = Object.assign({}, mode);
        Object.keys(mode).forEach((key2) => {
          delete mode[key2];
        });
        mode.keywords = originalMode.keywords;
        mode.begin = concat(originalMode.beforeMatch, lookahead(originalMode.begin));
        mode.starts = {
          relevance: 0,
          contains: [
            Object.assign(originalMode, { endsParent: true })
          ]
        };
        mode.relevance = 0;
        delete originalMode.beforeMatch;
      };
      var COMMON_KEYWORDS = [
        "of",
        "and",
        "for",
        "in",
        "not",
        "or",
        "if",
        "then",
        "parent",
        // common variable name
        "list",
        // common variable name
        "value"
        // common variable name
      ];
      var DEFAULT_KEYWORD_SCOPE = "keyword";
      function compileKeywords(rawKeywords, caseInsensitive, scopeName = DEFAULT_KEYWORD_SCOPE) {
        const compiledKeywords = /* @__PURE__ */ Object.create(null);
        if (typeof rawKeywords === "string") {
          compileList(scopeName, rawKeywords.split(" "));
        } else if (Array.isArray(rawKeywords)) {
          compileList(scopeName, rawKeywords);
        } else {
          Object.keys(rawKeywords).forEach(function(scopeName2) {
            Object.assign(
              compiledKeywords,
              compileKeywords(rawKeywords[scopeName2], caseInsensitive, scopeName2)
            );
          });
        }
        return compiledKeywords;
        function compileList(scopeName2, keywordList) {
          if (caseInsensitive) {
            keywordList = keywordList.map((x) => x.toLowerCase());
          }
          keywordList.forEach(function(keyword) {
            const pair = keyword.split("|");
            compiledKeywords[pair[0]] = [scopeName2, scoreForKeyword(pair[0], pair[1])];
          });
        }
      }
      function scoreForKeyword(keyword, providedScore) {
        if (providedScore) {
          return Number(providedScore);
        }
        return commonKeyword(keyword) ? 0 : 1;
      }
      function commonKeyword(keyword) {
        return COMMON_KEYWORDS.includes(keyword.toLowerCase());
      }
      var seenDeprecations = {};
      var error2 = (message) => {
        console.error(message);
      };
      var warn = (message, ...args) => {
        console.log(`WARN: ${message}`, ...args);
      };
      var deprecated = (version2, message) => {
        if (seenDeprecations[`${version2}/${message}`]) return;
        console.log(`Deprecated as of ${version2}. ${message}`);
        seenDeprecations[`${version2}/${message}`] = true;
      };
      var MultiClassError = new Error();
      function remapScopeNames(mode, regexes, { key: key2 }) {
        let offset = 0;
        const scopeNames = mode[key2];
        const emit = {};
        const positions = {};
        for (let i = 1; i <= regexes.length; i++) {
          positions[i + offset] = scopeNames[i];
          emit[i + offset] = true;
          offset += countMatchGroups(regexes[i - 1]);
        }
        mode[key2] = positions;
        mode[key2]._emit = emit;
        mode[key2]._multi = true;
      }
      function beginMultiClass(mode) {
        if (!Array.isArray(mode.begin)) return;
        if (mode.skip || mode.excludeBegin || mode.returnBegin) {
          error2("skip, excludeBegin, returnBegin not compatible with beginScope: {}");
          throw MultiClassError;
        }
        if (typeof mode.beginScope !== "object" || mode.beginScope === null) {
          error2("beginScope must be object");
          throw MultiClassError;
        }
        remapScopeNames(mode, mode.begin, { key: "beginScope" });
        mode.begin = _rewriteBackreferences(mode.begin, { joinWith: "" });
      }
      function endMultiClass(mode) {
        if (!Array.isArray(mode.end)) return;
        if (mode.skip || mode.excludeEnd || mode.returnEnd) {
          error2("skip, excludeEnd, returnEnd not compatible with endScope: {}");
          throw MultiClassError;
        }
        if (typeof mode.endScope !== "object" || mode.endScope === null) {
          error2("endScope must be object");
          throw MultiClassError;
        }
        remapScopeNames(mode, mode.end, { key: "endScope" });
        mode.end = _rewriteBackreferences(mode.end, { joinWith: "" });
      }
      function scopeSugar(mode) {
        if (mode.scope && typeof mode.scope === "object" && mode.scope !== null) {
          mode.beginScope = mode.scope;
          delete mode.scope;
        }
      }
      function MultiClass(mode) {
        scopeSugar(mode);
        if (typeof mode.beginScope === "string") {
          mode.beginScope = { _wrap: mode.beginScope };
        }
        if (typeof mode.endScope === "string") {
          mode.endScope = { _wrap: mode.endScope };
        }
        beginMultiClass(mode);
        endMultiClass(mode);
      }
      function compileLanguage(language) {
        function langRe(value, global) {
          return new RegExp(
            source(value),
            "m" + (language.case_insensitive ? "i" : "") + (language.unicodeRegex ? "u" : "") + (global ? "g" : "")
          );
        }
        class MultiRegex {
          constructor() {
            this.matchIndexes = {};
            this.regexes = [];
            this.matchAt = 1;
            this.position = 0;
          }
          // @ts-ignore
          addRule(re, opts) {
            opts.position = this.position++;
            this.matchIndexes[this.matchAt] = opts;
            this.regexes.push([opts, re]);
            this.matchAt += countMatchGroups(re) + 1;
          }
          compile() {
            if (this.regexes.length === 0) {
              this.exec = () => null;
            }
            const terminators = this.regexes.map((el) => el[1]);
            this.matcherRe = langRe(_rewriteBackreferences(terminators, { joinWith: "|" }), true);
            this.lastIndex = 0;
          }
          /** @param {string} s */
          exec(s) {
            this.matcherRe.lastIndex = this.lastIndex;
            const match = this.matcherRe.exec(s);
            if (!match) {
              return null;
            }
            const i = match.findIndex((el, i2) => i2 > 0 && el !== void 0);
            const matchData = this.matchIndexes[i];
            match.splice(0, i);
            return Object.assign(match, matchData);
          }
        }
        class ResumableMultiRegex {
          constructor() {
            this.rules = [];
            this.multiRegexes = [];
            this.count = 0;
            this.lastIndex = 0;
            this.regexIndex = 0;
          }
          // @ts-ignore
          getMatcher(index) {
            if (this.multiRegexes[index]) return this.multiRegexes[index];
            const matcher = new MultiRegex();
            this.rules.slice(index).forEach(([re, opts]) => matcher.addRule(re, opts));
            matcher.compile();
            this.multiRegexes[index] = matcher;
            return matcher;
          }
          resumingScanAtSamePosition() {
            return this.regexIndex !== 0;
          }
          considerAll() {
            this.regexIndex = 0;
          }
          // @ts-ignore
          addRule(re, opts) {
            this.rules.push([re, opts]);
            if (opts.type === "begin") this.count++;
          }
          /** @param {string} s */
          exec(s) {
            const m = this.getMatcher(this.regexIndex);
            m.lastIndex = this.lastIndex;
            let result = m.exec(s);
            if (this.resumingScanAtSamePosition()) {
              if (result && result.index === this.lastIndex) ;
              else {
                const m2 = this.getMatcher(0);
                m2.lastIndex = this.lastIndex + 1;
                result = m2.exec(s);
              }
            }
            if (result) {
              this.regexIndex += result.position + 1;
              if (this.regexIndex === this.count) {
                this.considerAll();
              }
            }
            return result;
          }
        }
        function buildModeRegex(mode) {
          const mm = new ResumableMultiRegex();
          mode.contains.forEach((term) => mm.addRule(term.begin, { rule: term, type: "begin" }));
          if (mode.terminatorEnd) {
            mm.addRule(mode.terminatorEnd, { type: "end" });
          }
          if (mode.illegal) {
            mm.addRule(mode.illegal, { type: "illegal" });
          }
          return mm;
        }
        function compileMode(mode, parent) {
          const cmode = (
            /** @type CompiledMode */
            mode
          );
          if (mode.isCompiled) return cmode;
          [
            scopeClassName,
            // do this early so compiler extensions generally don't have to worry about
            // the distinction between match/begin
            compileMatch,
            MultiClass,
            beforeMatchExt
          ].forEach((ext) => ext(mode, parent));
          language.compilerExtensions.forEach((ext) => ext(mode, parent));
          mode.__beforeBegin = null;
          [
            beginKeywords,
            // do this later so compiler extensions that come earlier have access to the
            // raw array if they wanted to perhaps manipulate it, etc.
            compileIllegal,
            // default to 1 relevance if not specified
            compileRelevance
          ].forEach((ext) => ext(mode, parent));
          mode.isCompiled = true;
          let keywordPattern = null;
          if (typeof mode.keywords === "object" && mode.keywords.$pattern) {
            mode.keywords = Object.assign({}, mode.keywords);
            keywordPattern = mode.keywords.$pattern;
            delete mode.keywords.$pattern;
          }
          keywordPattern = keywordPattern || /\w+/;
          if (mode.keywords) {
            mode.keywords = compileKeywords(mode.keywords, language.case_insensitive);
          }
          cmode.keywordPatternRe = langRe(keywordPattern, true);
          if (parent) {
            if (!mode.begin) mode.begin = /\B|\b/;
            cmode.beginRe = langRe(cmode.begin);
            if (!mode.end && !mode.endsWithParent) mode.end = /\B|\b/;
            if (mode.end) cmode.endRe = langRe(cmode.end);
            cmode.terminatorEnd = source(cmode.end) || "";
            if (mode.endsWithParent && parent.terminatorEnd) {
              cmode.terminatorEnd += (mode.end ? "|" : "") + parent.terminatorEnd;
            }
          }
          if (mode.illegal) cmode.illegalRe = langRe(
            /** @type {RegExp | string} */
            mode.illegal
          );
          if (!mode.contains) mode.contains = [];
          mode.contains = [].concat(...mode.contains.map(function(c) {
            return expandOrCloneMode(c === "self" ? mode : c);
          }));
          mode.contains.forEach(function(c) {
            compileMode(
              /** @type Mode */
              c,
              cmode
            );
          });
          if (mode.starts) {
            compileMode(mode.starts, parent);
          }
          cmode.matcher = buildModeRegex(cmode);
          return cmode;
        }
        if (!language.compilerExtensions) language.compilerExtensions = [];
        if (language.contains && language.contains.includes("self")) {
          throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");
        }
        language.classNameAliases = inherit$1(language.classNameAliases || {});
        return compileMode(
          /** @type Mode */
          language
        );
      }
      function dependencyOnParent(mode) {
        if (!mode) return false;
        return mode.endsWithParent || dependencyOnParent(mode.starts);
      }
      function expandOrCloneMode(mode) {
        if (mode.variants && !mode.cachedVariants) {
          mode.cachedVariants = mode.variants.map(function(variant) {
            return inherit$1(mode, { variants: null }, variant);
          });
        }
        if (mode.cachedVariants) {
          return mode.cachedVariants;
        }
        if (dependencyOnParent(mode)) {
          return inherit$1(mode, { starts: mode.starts ? inherit$1(mode.starts) : null });
        }
        if (Object.isFrozen(mode)) {
          return inherit$1(mode);
        }
        return mode;
      }
      var version = "11.11.1";
      var HTMLInjectionError = class extends Error {
        constructor(reason, html) {
          super(reason);
          this.name = "HTMLInjectionError";
          this.html = html;
        }
      };
      var escape = escapeHTML;
      var inherit = inherit$1;
      var NO_MATCH = /* @__PURE__ */ Symbol("nomatch");
      var MAX_KEYWORD_HITS = 7;
      var HLJS = function(hljs) {
        const languages = /* @__PURE__ */ Object.create(null);
        const aliases = /* @__PURE__ */ Object.create(null);
        const plugins = [];
        let SAFE_MODE = true;
        const LANGUAGE_NOT_FOUND = "Could not find the language '{}', did you forget to load/include a language module?";
        const PLAINTEXT_LANGUAGE = { disableAutodetect: true, name: "Plain text", contains: [] };
        let options = {
          ignoreUnescapedHTML: false,
          throwUnescapedHTML: false,
          noHighlightRe: /^(no-?highlight)$/i,
          languageDetectRe: /\blang(?:uage)?-([\w-]+)\b/i,
          classPrefix: "hljs-",
          cssSelector: "pre code",
          languages: null,
          // beta configuration options, subject to change, welcome to discuss
          // https://github.com/highlightjs/highlight.js/issues/1086
          __emitter: TokenTreeEmitter
        };
        function shouldNotHighlight(languageName) {
          return options.noHighlightRe.test(languageName);
        }
        function blockLanguage(block) {
          let classes = block.className + " ";
          classes += block.parentNode ? block.parentNode.className : "";
          const match = options.languageDetectRe.exec(classes);
          if (match) {
            const language = getLanguage(match[1]);
            if (!language) {
              warn(LANGUAGE_NOT_FOUND.replace("{}", match[1]));
              warn("Falling back to no-highlight mode for this block.", block);
            }
            return language ? match[1] : "no-highlight";
          }
          return classes.split(/\s+/).find((_class) => shouldNotHighlight(_class) || getLanguage(_class));
        }
        function highlight2(codeOrLanguageName, optionsOrCode, ignoreIllegals) {
          let code = "";
          let languageName = "";
          if (typeof optionsOrCode === "object") {
            code = codeOrLanguageName;
            ignoreIllegals = optionsOrCode.ignoreIllegals;
            languageName = optionsOrCode.language;
          } else {
            deprecated("10.7.0", "highlight(lang, code, ...args) has been deprecated.");
            deprecated("10.7.0", "Please use highlight(code, options) instead.\nhttps://github.com/highlightjs/highlight.js/issues/2277");
            languageName = codeOrLanguageName;
            code = optionsOrCode;
          }
          if (ignoreIllegals === void 0) {
            ignoreIllegals = true;
          }
          const context = {
            code,
            language: languageName
          };
          fire("before:highlight", context);
          const result = context.result ? context.result : _highlight(context.language, context.code, ignoreIllegals);
          result.code = context.code;
          fire("after:highlight", result);
          return result;
        }
        function _highlight(languageName, codeToHighlight, ignoreIllegals, continuation) {
          const keywordHits = /* @__PURE__ */ Object.create(null);
          function keywordData(mode, matchText) {
            return mode.keywords[matchText];
          }
          function processKeywords() {
            if (!top.keywords) {
              emitter.addText(modeBuffer);
              return;
            }
            let lastIndex = 0;
            top.keywordPatternRe.lastIndex = 0;
            let match = top.keywordPatternRe.exec(modeBuffer);
            let buf = "";
            while (match) {
              buf += modeBuffer.substring(lastIndex, match.index);
              const word = language.case_insensitive ? match[0].toLowerCase() : match[0];
              const data = keywordData(top, word);
              if (data) {
                const [kind, keywordRelevance] = data;
                emitter.addText(buf);
                buf = "";
                keywordHits[word] = (keywordHits[word] || 0) + 1;
                if (keywordHits[word] <= MAX_KEYWORD_HITS) relevance += keywordRelevance;
                if (kind.startsWith("_")) {
                  buf += match[0];
                } else {
                  const cssClass = language.classNameAliases[kind] || kind;
                  emitKeyword(match[0], cssClass);
                }
              } else {
                buf += match[0];
              }
              lastIndex = top.keywordPatternRe.lastIndex;
              match = top.keywordPatternRe.exec(modeBuffer);
            }
            buf += modeBuffer.substring(lastIndex);
            emitter.addText(buf);
          }
          function processSubLanguage() {
            if (modeBuffer === "") return;
            let result2 = null;
            if (typeof top.subLanguage === "string") {
              if (!languages[top.subLanguage]) {
                emitter.addText(modeBuffer);
                return;
              }
              result2 = _highlight(top.subLanguage, modeBuffer, true, continuations[top.subLanguage]);
              continuations[top.subLanguage] = /** @type {CompiledMode} */
              result2._top;
            } else {
              result2 = highlightAuto(modeBuffer, top.subLanguage.length ? top.subLanguage : null);
            }
            if (top.relevance > 0) {
              relevance += result2.relevance;
            }
            emitter.__addSublanguage(result2._emitter, result2.language);
          }
          function processBuffer() {
            if (top.subLanguage != null) {
              processSubLanguage();
            } else {
              processKeywords();
            }
            modeBuffer = "";
          }
          function emitKeyword(keyword, scope) {
            if (keyword === "") return;
            emitter.startScope(scope);
            emitter.addText(keyword);
            emitter.endScope();
          }
          function emitMultiClass(scope, match) {
            let i = 1;
            const max = match.length - 1;
            while (i <= max) {
              if (!scope._emit[i]) {
                i++;
                continue;
              }
              const klass = language.classNameAliases[scope[i]] || scope[i];
              const text = match[i];
              if (klass) {
                emitKeyword(text, klass);
              } else {
                modeBuffer = text;
                processKeywords();
                modeBuffer = "";
              }
              i++;
            }
          }
          function startNewMode(mode, match) {
            if (mode.scope && typeof mode.scope === "string") {
              emitter.openNode(language.classNameAliases[mode.scope] || mode.scope);
            }
            if (mode.beginScope) {
              if (mode.beginScope._wrap) {
                emitKeyword(modeBuffer, language.classNameAliases[mode.beginScope._wrap] || mode.beginScope._wrap);
                modeBuffer = "";
              } else if (mode.beginScope._multi) {
                emitMultiClass(mode.beginScope, match);
                modeBuffer = "";
              }
            }
            top = Object.create(mode, { parent: { value: top } });
            return top;
          }
          function endOfMode(mode, match, matchPlusRemainder) {
            let matched = startsWith(mode.endRe, matchPlusRemainder);
            if (matched) {
              if (mode["on:end"]) {
                const resp = new Response(mode);
                mode["on:end"](match, resp);
                if (resp.isMatchIgnored) matched = false;
              }
              if (matched) {
                while (mode.endsParent && mode.parent) {
                  mode = mode.parent;
                }
                return mode;
              }
            }
            if (mode.endsWithParent) {
              return endOfMode(mode.parent, match, matchPlusRemainder);
            }
          }
          function doIgnore(lexeme) {
            if (top.matcher.regexIndex === 0) {
              modeBuffer += lexeme[0];
              return 1;
            } else {
              resumeScanAtSamePosition = true;
              return 0;
            }
          }
          function doBeginMatch(match) {
            const lexeme = match[0];
            const newMode = match.rule;
            const resp = new Response(newMode);
            const beforeCallbacks = [newMode.__beforeBegin, newMode["on:begin"]];
            for (const cb of beforeCallbacks) {
              if (!cb) continue;
              cb(match, resp);
              if (resp.isMatchIgnored) return doIgnore(lexeme);
            }
            if (newMode.skip) {
              modeBuffer += lexeme;
            } else {
              if (newMode.excludeBegin) {
                modeBuffer += lexeme;
              }
              processBuffer();
              if (!newMode.returnBegin && !newMode.excludeBegin) {
                modeBuffer = lexeme;
              }
            }
            startNewMode(newMode, match);
            return newMode.returnBegin ? 0 : lexeme.length;
          }
          function doEndMatch(match) {
            const lexeme = match[0];
            const matchPlusRemainder = codeToHighlight.substring(match.index);
            const endMode = endOfMode(top, match, matchPlusRemainder);
            if (!endMode) {
              return NO_MATCH;
            }
            const origin = top;
            if (top.endScope && top.endScope._wrap) {
              processBuffer();
              emitKeyword(lexeme, top.endScope._wrap);
            } else if (top.endScope && top.endScope._multi) {
              processBuffer();
              emitMultiClass(top.endScope, match);
            } else if (origin.skip) {
              modeBuffer += lexeme;
            } else {
              if (!(origin.returnEnd || origin.excludeEnd)) {
                modeBuffer += lexeme;
              }
              processBuffer();
              if (origin.excludeEnd) {
                modeBuffer = lexeme;
              }
            }
            do {
              if (top.scope) {
                emitter.closeNode();
              }
              if (!top.skip && !top.subLanguage) {
                relevance += top.relevance;
              }
              top = top.parent;
            } while (top !== endMode.parent);
            if (endMode.starts) {
              startNewMode(endMode.starts, match);
            }
            return origin.returnEnd ? 0 : lexeme.length;
          }
          function processContinuations() {
            const list = [];
            for (let current = top; current !== language; current = current.parent) {
              if (current.scope) {
                list.unshift(current.scope);
              }
            }
            list.forEach((item) => emitter.openNode(item));
          }
          let lastMatch = {};
          function processLexeme(textBeforeMatch, match) {
            const lexeme = match && match[0];
            modeBuffer += textBeforeMatch;
            if (lexeme == null) {
              processBuffer();
              return 0;
            }
            if (lastMatch.type === "begin" && match.type === "end" && lastMatch.index === match.index && lexeme === "") {
              modeBuffer += codeToHighlight.slice(match.index, match.index + 1);
              if (!SAFE_MODE) {
                const err = new Error(`0 width match regex (${languageName})`);
                err.languageName = languageName;
                err.badRule = lastMatch.rule;
                throw err;
              }
              return 1;
            }
            lastMatch = match;
            if (match.type === "begin") {
              return doBeginMatch(match);
            } else if (match.type === "illegal" && !ignoreIllegals) {
              const err = new Error('Illegal lexeme "' + lexeme + '" for mode "' + (top.scope || "<unnamed>") + '"');
              err.mode = top;
              throw err;
            } else if (match.type === "end") {
              const processed = doEndMatch(match);
              if (processed !== NO_MATCH) {
                return processed;
              }
            }
            if (match.type === "illegal" && lexeme === "") {
              modeBuffer += "\n";
              return 1;
            }
            if (iterations > 1e5 && iterations > match.index * 3) {
              const err = new Error("potential infinite loop, way more iterations than matches");
              throw err;
            }
            modeBuffer += lexeme;
            return lexeme.length;
          }
          const language = getLanguage(languageName);
          if (!language) {
            error2(LANGUAGE_NOT_FOUND.replace("{}", languageName));
            throw new Error('Unknown language: "' + languageName + '"');
          }
          const md = compileLanguage(language);
          let result = "";
          let top = continuation || md;
          const continuations = {};
          const emitter = new options.__emitter(options);
          processContinuations();
          let modeBuffer = "";
          let relevance = 0;
          let index = 0;
          let iterations = 0;
          let resumeScanAtSamePosition = false;
          try {
            if (!language.__emitTokens) {
              top.matcher.considerAll();
              for (; ; ) {
                iterations++;
                if (resumeScanAtSamePosition) {
                  resumeScanAtSamePosition = false;
                } else {
                  top.matcher.considerAll();
                }
                top.matcher.lastIndex = index;
                const match = top.matcher.exec(codeToHighlight);
                if (!match) break;
                const beforeMatch = codeToHighlight.substring(index, match.index);
                const processedCount = processLexeme(beforeMatch, match);
                index = match.index + processedCount;
              }
              processLexeme(codeToHighlight.substring(index));
            } else {
              language.__emitTokens(codeToHighlight, emitter);
            }
            emitter.finalize();
            result = emitter.toHTML();
            return {
              language: languageName,
              value: result,
              relevance,
              illegal: false,
              _emitter: emitter,
              _top: top
            };
          } catch (err) {
            if (err.message && err.message.includes("Illegal")) {
              return {
                language: languageName,
                value: escape(codeToHighlight),
                illegal: true,
                relevance: 0,
                _illegalBy: {
                  message: err.message,
                  index,
                  context: codeToHighlight.slice(index - 100, index + 100),
                  mode: err.mode,
                  resultSoFar: result
                },
                _emitter: emitter
              };
            } else if (SAFE_MODE) {
              return {
                language: languageName,
                value: escape(codeToHighlight),
                illegal: false,
                relevance: 0,
                errorRaised: err,
                _emitter: emitter,
                _top: top
              };
            } else {
              throw err;
            }
          }
        }
        function justTextHighlightResult(code) {
          const result = {
            value: escape(code),
            illegal: false,
            relevance: 0,
            _top: PLAINTEXT_LANGUAGE,
            _emitter: new options.__emitter(options)
          };
          result._emitter.addText(code);
          return result;
        }
        function highlightAuto(code, languageSubset) {
          languageSubset = languageSubset || options.languages || Object.keys(languages);
          const plaintext = justTextHighlightResult(code);
          const results = languageSubset.filter(getLanguage).filter(autoDetection).map(
            (name) => _highlight(name, code, false)
          );
          results.unshift(plaintext);
          const sorted = results.sort((a, b) => {
            if (a.relevance !== b.relevance) return b.relevance - a.relevance;
            if (a.language && b.language) {
              if (getLanguage(a.language).supersetOf === b.language) {
                return 1;
              } else if (getLanguage(b.language).supersetOf === a.language) {
                return -1;
              }
            }
            return 0;
          });
          const [best, secondBest] = sorted;
          const result = best;
          result.secondBest = secondBest;
          return result;
        }
        function updateClassName(element, currentLang, resultLang) {
          const language = currentLang && aliases[currentLang] || resultLang;
          element.classList.add("hljs");
          element.classList.add(`language-${language}`);
        }
        function highlightElement(element) {
          let node = null;
          const language = blockLanguage(element);
          if (shouldNotHighlight(language)) return;
          fire(
            "before:highlightElement",
            { el: element, language }
          );
          if (element.dataset.highlighted) {
            console.log("Element previously highlighted. To highlight again, first unset `dataset.highlighted`.", element);
            return;
          }
          if (element.children.length > 0) {
            if (!options.ignoreUnescapedHTML) {
              console.warn("One of your code blocks includes unescaped HTML. This is a potentially serious security risk.");
              console.warn("https://github.com/highlightjs/highlight.js/wiki/security");
              console.warn("The element with unescaped HTML:");
              console.warn(element);
            }
            if (options.throwUnescapedHTML) {
              const err = new HTMLInjectionError(
                "One of your code blocks includes unescaped HTML.",
                element.innerHTML
              );
              throw err;
            }
          }
          node = element;
          const text = node.textContent;
          const result = language ? highlight2(text, { language, ignoreIllegals: true }) : highlightAuto(text);
          element.innerHTML = result.value;
          element.dataset.highlighted = "yes";
          updateClassName(element, language, result.language);
          element.result = {
            language: result.language,
            // TODO: remove with version 11.0
            re: result.relevance,
            relevance: result.relevance
          };
          if (result.secondBest) {
            element.secondBest = {
              language: result.secondBest.language,
              relevance: result.secondBest.relevance
            };
          }
          fire("after:highlightElement", { el: element, result, text });
        }
        function configure(userOptions) {
          options = inherit(options, userOptions);
        }
        const initHighlighting = () => {
          highlightAll();
          deprecated("10.6.0", "initHighlighting() deprecated.  Use highlightAll() now.");
        };
        function initHighlightingOnLoad() {
          highlightAll();
          deprecated("10.6.0", "initHighlightingOnLoad() deprecated.  Use highlightAll() now.");
        }
        let wantsHighlight = false;
        function highlightAll() {
          function boot() {
            highlightAll();
          }
          if (document.readyState === "loading") {
            if (!wantsHighlight) {
              window.addEventListener("DOMContentLoaded", boot, false);
            }
            wantsHighlight = true;
            return;
          }
          const blocks = document.querySelectorAll(options.cssSelector);
          blocks.forEach(highlightElement);
        }
        function registerLanguage(languageName, languageDefinition) {
          let lang = null;
          try {
            lang = languageDefinition(hljs);
          } catch (error$1) {
            error2("Language definition for '{}' could not be registered.".replace("{}", languageName));
            if (!SAFE_MODE) {
              throw error$1;
            } else {
              error2(error$1);
            }
            lang = PLAINTEXT_LANGUAGE;
          }
          if (!lang.name) lang.name = languageName;
          languages[languageName] = lang;
          lang.rawDefinition = languageDefinition.bind(null, hljs);
          if (lang.aliases) {
            registerAliases(lang.aliases, { languageName });
          }
        }
        function unregisterLanguage(languageName) {
          delete languages[languageName];
          for (const alias of Object.keys(aliases)) {
            if (aliases[alias] === languageName) {
              delete aliases[alias];
            }
          }
        }
        function listLanguages() {
          return Object.keys(languages);
        }
        function getLanguage(name) {
          name = (name || "").toLowerCase();
          return languages[name] || languages[aliases[name]];
        }
        function registerAliases(aliasList, { languageName }) {
          if (typeof aliasList === "string") {
            aliasList = [aliasList];
          }
          aliasList.forEach((alias) => {
            aliases[alias.toLowerCase()] = languageName;
          });
        }
        function autoDetection(name) {
          const lang = getLanguage(name);
          return lang && !lang.disableAutodetect;
        }
        function upgradePluginAPI(plugin) {
          if (plugin["before:highlightBlock"] && !plugin["before:highlightElement"]) {
            plugin["before:highlightElement"] = (data) => {
              plugin["before:highlightBlock"](
                Object.assign({ block: data.el }, data)
              );
            };
          }
          if (plugin["after:highlightBlock"] && !plugin["after:highlightElement"]) {
            plugin["after:highlightElement"] = (data) => {
              plugin["after:highlightBlock"](
                Object.assign({ block: data.el }, data)
              );
            };
          }
        }
        function addPlugin(plugin) {
          upgradePluginAPI(plugin);
          plugins.push(plugin);
        }
        function removePlugin(plugin) {
          const index = plugins.indexOf(plugin);
          if (index !== -1) {
            plugins.splice(index, 1);
          }
        }
        function fire(event, args) {
          const cb = event;
          plugins.forEach(function(plugin) {
            if (plugin[cb]) {
              plugin[cb](args);
            }
          });
        }
        function deprecateHighlightBlock(el) {
          deprecated("10.7.0", "highlightBlock will be removed entirely in v12.0");
          deprecated("10.7.0", "Please use highlightElement now.");
          return highlightElement(el);
        }
        Object.assign(hljs, {
          highlight: highlight2,
          highlightAuto,
          highlightAll,
          highlightElement,
          // TODO: Remove with v12 API
          highlightBlock: deprecateHighlightBlock,
          configure,
          initHighlighting,
          initHighlightingOnLoad,
          registerLanguage,
          unregisterLanguage,
          listLanguages,
          getLanguage,
          registerAliases,
          autoDetection,
          inherit,
          addPlugin,
          removePlugin
        });
        hljs.debugMode = function() {
          SAFE_MODE = false;
        };
        hljs.safeMode = function() {
          SAFE_MODE = true;
        };
        hljs.versionString = version;
        hljs.regex = {
          concat,
          lookahead,
          either,
          optional,
          anyNumberOfTimes
        };
        for (const key2 in MODES) {
          if (typeof MODES[key2] === "object") {
            deepFreeze(MODES[key2]);
          }
        }
        Object.assign(hljs, MODES);
        return hljs;
      };
      var highlight = HLJS({});
      highlight.newInstance = () => HLJS({});
      module.exports = highlight;
      highlight.HighlightJS = highlight;
      highlight.default = highlight;
    }
  });

  // node_modules/highlight.js/lib/languages/cpp.js
  var require_cpp = __commonJS({
    "node_modules/highlight.js/lib/languages/cpp.js"(exports, module) {
      function cpp(hljs) {
        const regex = hljs.regex;
        const C_LINE_COMMENT_MODE = hljs.COMMENT("//", "$", { contains: [{ begin: /\\\n/ }] });
        const DECLTYPE_AUTO_RE = "decltype\\(auto\\)";
        const NAMESPACE_RE = "[a-zA-Z_]\\w*::";
        const TEMPLATE_ARGUMENT_RE = "<[^<>]+>";
        const FUNCTION_TYPE_RE = "(?!struct)(" + DECLTYPE_AUTO_RE + "|" + regex.optional(NAMESPACE_RE) + "[a-zA-Z_]\\w*" + regex.optional(TEMPLATE_ARGUMENT_RE) + ")";
        const CPP_PRIMITIVE_TYPES = {
          className: "type",
          begin: "\\b[a-z\\d_]*_t\\b"
        };
        const CHARACTER_ESCAPES = "\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4,8}|[0-7]{3}|\\S)";
        const STRINGS = {
          className: "string",
          variants: [
            {
              begin: '(u8?|U|L)?"',
              end: '"',
              illegal: "\\n",
              contains: [hljs.BACKSLASH_ESCAPE]
            },
            {
              begin: "(u8?|U|L)?'(" + CHARACTER_ESCAPES + "|.)",
              end: "'",
              illegal: "."
            },
            hljs.END_SAME_AS_BEGIN({
              begin: /(?:u8?|U|L)?R"([^()\\ ]{0,16})\(/,
              end: /\)([^()\\ ]{0,16})"/
            })
          ]
        };
        const NUMBERS = {
          className: "number",
          variants: [
            // Floating-point literal.
            {
              begin: "[+-]?(?:(?:[0-9](?:'?[0-9])*\\.(?:[0-9](?:'?[0-9])*)?|\\.[0-9](?:'?[0-9])*)(?:[Ee][+-]?[0-9](?:'?[0-9])*)?|[0-9](?:'?[0-9])*[Ee][+-]?[0-9](?:'?[0-9])*|0[Xx](?:[0-9A-Fa-f](?:'?[0-9A-Fa-f])*(?:\\.(?:[0-9A-Fa-f](?:'?[0-9A-Fa-f])*)?)?|\\.[0-9A-Fa-f](?:'?[0-9A-Fa-f])*)[Pp][+-]?[0-9](?:'?[0-9])*)(?:[Ff](?:16|32|64|128)?|(BF|bf)16|[Ll]|)"
            },
            // Integer literal.
            {
              begin: "[+-]?\\b(?:0[Bb][01](?:'?[01])*|0[Xx][0-9A-Fa-f](?:'?[0-9A-Fa-f])*|0(?:'?[0-7])*|[1-9](?:'?[0-9])*)(?:[Uu](?:LL?|ll?)|[Uu][Zz]?|(?:LL?|ll?)[Uu]?|[Zz][Uu]|)"
              // Note: there are user-defined literal suffixes too, but perhaps having the custom suffix not part of the
              // literal highlight actually makes it stand out more.
            }
          ],
          relevance: 0
        };
        const PREPROCESSOR = {
          className: "meta",
          begin: /#\s*[a-z]+\b/,
          end: /$/,
          keywords: { keyword: "if else elif endif define undef warning error line pragma _Pragma ifdef ifndef include" },
          contains: [
            {
              begin: /\\\n/,
              relevance: 0
            },
            hljs.inherit(STRINGS, { className: "string" }),
            {
              className: "string",
              begin: /<.*?>/
            },
            C_LINE_COMMENT_MODE,
            hljs.C_BLOCK_COMMENT_MODE
          ]
        };
        const TITLE_MODE = {
          className: "title",
          begin: regex.optional(NAMESPACE_RE) + hljs.IDENT_RE,
          relevance: 0
        };
        const FUNCTION_TITLE = regex.optional(NAMESPACE_RE) + hljs.IDENT_RE + "\\s*\\(";
        const RESERVED_KEYWORDS = [
          "alignas",
          "alignof",
          "and",
          "and_eq",
          "asm",
          "atomic_cancel",
          "atomic_commit",
          "atomic_noexcept",
          "auto",
          "bitand",
          "bitor",
          "break",
          "case",
          "catch",
          "class",
          "co_await",
          "co_return",
          "co_yield",
          "compl",
          "concept",
          "const_cast|10",
          "consteval",
          "constexpr",
          "constinit",
          "continue",
          "decltype",
          "default",
          "delete",
          "do",
          "dynamic_cast|10",
          "else",
          "enum",
          "explicit",
          "export",
          "extern",
          "false",
          "final",
          "for",
          "friend",
          "goto",
          "if",
          "import",
          "inline",
          "module",
          "mutable",
          "namespace",
          "new",
          "noexcept",
          "not",
          "not_eq",
          "nullptr",
          "operator",
          "or",
          "or_eq",
          "override",
          "private",
          "protected",
          "public",
          "reflexpr",
          "register",
          "reinterpret_cast|10",
          "requires",
          "return",
          "sizeof",
          "static_assert",
          "static_cast|10",
          "struct",
          "switch",
          "synchronized",
          "template",
          "this",
          "thread_local",
          "throw",
          "transaction_safe",
          "transaction_safe_dynamic",
          "true",
          "try",
          "typedef",
          "typeid",
          "typename",
          "union",
          "using",
          "virtual",
          "volatile",
          "while",
          "xor",
          "xor_eq"
        ];
        const RESERVED_TYPES = [
          "bool",
          "char",
          "char16_t",
          "char32_t",
          "char8_t",
          "double",
          "float",
          "int",
          "long",
          "short",
          "void",
          "wchar_t",
          "unsigned",
          "signed",
          "const",
          "static"
        ];
        const TYPE_HINTS = [
          "any",
          "auto_ptr",
          "barrier",
          "binary_semaphore",
          "bitset",
          "complex",
          "condition_variable",
          "condition_variable_any",
          "counting_semaphore",
          "deque",
          "false_type",
          "flat_map",
          "flat_set",
          "future",
          "imaginary",
          "initializer_list",
          "istringstream",
          "jthread",
          "latch",
          "lock_guard",
          "multimap",
          "multiset",
          "mutex",
          "optional",
          "ostringstream",
          "packaged_task",
          "pair",
          "promise",
          "priority_queue",
          "queue",
          "recursive_mutex",
          "recursive_timed_mutex",
          "scoped_lock",
          "set",
          "shared_future",
          "shared_lock",
          "shared_mutex",
          "shared_timed_mutex",
          "shared_ptr",
          "stack",
          "string_view",
          "stringstream",
          "timed_mutex",
          "thread",
          "true_type",
          "tuple",
          "unique_lock",
          "unique_ptr",
          "unordered_map",
          "unordered_multimap",
          "unordered_multiset",
          "unordered_set",
          "variant",
          "vector",
          "weak_ptr",
          "wstring",
          "wstring_view"
        ];
        const FUNCTION_HINTS = [
          "abort",
          "abs",
          "acos",
          "apply",
          "as_const",
          "asin",
          "atan",
          "atan2",
          "calloc",
          "ceil",
          "cerr",
          "cin",
          "clog",
          "cos",
          "cosh",
          "cout",
          "declval",
          "endl",
          "exchange",
          "exit",
          "exp",
          "fabs",
          "floor",
          "fmod",
          "forward",
          "fprintf",
          "fputs",
          "free",
          "frexp",
          "fscanf",
          "future",
          "invoke",
          "isalnum",
          "isalpha",
          "iscntrl",
          "isdigit",
          "isgraph",
          "islower",
          "isprint",
          "ispunct",
          "isspace",
          "isupper",
          "isxdigit",
          "labs",
          "launder",
          "ldexp",
          "log",
          "log10",
          "make_pair",
          "make_shared",
          "make_shared_for_overwrite",
          "make_tuple",
          "make_unique",
          "malloc",
          "memchr",
          "memcmp",
          "memcpy",
          "memset",
          "modf",
          "move",
          "pow",
          "printf",
          "putchar",
          "puts",
          "realloc",
          "scanf",
          "sin",
          "sinh",
          "snprintf",
          "sprintf",
          "sqrt",
          "sscanf",
          "std",
          "stderr",
          "stdin",
          "stdout",
          "strcat",
          "strchr",
          "strcmp",
          "strcpy",
          "strcspn",
          "strlen",
          "strncat",
          "strncmp",
          "strncpy",
          "strpbrk",
          "strrchr",
          "strspn",
          "strstr",
          "swap",
          "tan",
          "tanh",
          "terminate",
          "to_underlying",
          "tolower",
          "toupper",
          "vfprintf",
          "visit",
          "vprintf",
          "vsprintf"
        ];
        const LITERALS = [
          "NULL",
          "false",
          "nullopt",
          "nullptr",
          "true"
        ];
        const BUILT_IN = ["_Pragma"];
        const CPP_KEYWORDS = {
          type: RESERVED_TYPES,
          keyword: RESERVED_KEYWORDS,
          literal: LITERALS,
          built_in: BUILT_IN,
          _type_hints: TYPE_HINTS
        };
        const FUNCTION_DISPATCH = {
          className: "function.dispatch",
          relevance: 0,
          keywords: {
            // Only for relevance, not highlighting.
            _hint: FUNCTION_HINTS
          },
          begin: regex.concat(
            /\b/,
            /(?!decltype)/,
            /(?!if)/,
            /(?!for)/,
            /(?!switch)/,
            /(?!while)/,
            hljs.IDENT_RE,
            regex.lookahead(/(<[^<>]+>|)\s*\(/)
          )
        };
        const EXPRESSION_CONTAINS = [
          FUNCTION_DISPATCH,
          PREPROCESSOR,
          CPP_PRIMITIVE_TYPES,
          C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          NUMBERS,
          STRINGS
        ];
        const EXPRESSION_CONTEXT = {
          // This mode covers expression context where we can't expect a function
          // definition and shouldn't highlight anything that looks like one:
          // `return some()`, `else if()`, `(x*sum(1, 2))`
          variants: [
            {
              begin: /=/,
              end: /;/
            },
            {
              begin: /\(/,
              end: /\)/
            },
            {
              beginKeywords: "new throw return else",
              end: /;/
            }
          ],
          keywords: CPP_KEYWORDS,
          contains: EXPRESSION_CONTAINS.concat([
            {
              begin: /\(/,
              end: /\)/,
              keywords: CPP_KEYWORDS,
              contains: EXPRESSION_CONTAINS.concat(["self"]),
              relevance: 0
            }
          ]),
          relevance: 0
        };
        const FUNCTION_DECLARATION = {
          className: "function",
          begin: "(" + FUNCTION_TYPE_RE + "[\\*&\\s]+)+" + FUNCTION_TITLE,
          returnBegin: true,
          end: /[{;=]/,
          excludeEnd: true,
          keywords: CPP_KEYWORDS,
          illegal: /[^\w\s\*&:<>.]/,
          contains: [
            {
              // to prevent it from being confused as the function title
              begin: DECLTYPE_AUTO_RE,
              keywords: CPP_KEYWORDS,
              relevance: 0
            },
            {
              begin: FUNCTION_TITLE,
              returnBegin: true,
              contains: [TITLE_MODE],
              relevance: 0
            },
            // needed because we do not have look-behind on the below rule
            // to prevent it from grabbing the final : in a :: pair
            {
              begin: /::/,
              relevance: 0
            },
            // initializers
            {
              begin: /:/,
              endsWithParent: true,
              contains: [
                STRINGS,
                NUMBERS
              ]
            },
            // allow for multiple declarations, e.g.:
            // extern void f(int), g(char);
            {
              relevance: 0,
              match: /,/
            },
            {
              className: "params",
              begin: /\(/,
              end: /\)/,
              keywords: CPP_KEYWORDS,
              relevance: 0,
              contains: [
                C_LINE_COMMENT_MODE,
                hljs.C_BLOCK_COMMENT_MODE,
                STRINGS,
                NUMBERS,
                CPP_PRIMITIVE_TYPES,
                // Count matching parentheses.
                {
                  begin: /\(/,
                  end: /\)/,
                  keywords: CPP_KEYWORDS,
                  relevance: 0,
                  contains: [
                    "self",
                    C_LINE_COMMENT_MODE,
                    hljs.C_BLOCK_COMMENT_MODE,
                    STRINGS,
                    NUMBERS,
                    CPP_PRIMITIVE_TYPES
                  ]
                }
              ]
            },
            CPP_PRIMITIVE_TYPES,
            C_LINE_COMMENT_MODE,
            hljs.C_BLOCK_COMMENT_MODE,
            PREPROCESSOR
          ]
        };
        return {
          name: "C++",
          aliases: [
            "cc",
            "c++",
            "h++",
            "hpp",
            "hh",
            "hxx",
            "cxx"
          ],
          keywords: CPP_KEYWORDS,
          illegal: "</",
          classNameAliases: { "function.dispatch": "built_in" },
          contains: [].concat(
            EXPRESSION_CONTEXT,
            FUNCTION_DECLARATION,
            FUNCTION_DISPATCH,
            EXPRESSION_CONTAINS,
            [
              PREPROCESSOR,
              {
                // containers: ie, `vector <int> rooms (9);`
                begin: "\\b(deque|list|queue|priority_queue|pair|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array|tuple|optional|variant|function|flat_map|flat_set)\\s*<(?!<)",
                end: ">",
                keywords: CPP_KEYWORDS,
                contains: [
                  "self",
                  CPP_PRIMITIVE_TYPES
                ]
              },
              {
                begin: hljs.IDENT_RE + "::",
                keywords: CPP_KEYWORDS
              },
              {
                match: [
                  // extra complexity to deal with `enum class` and `enum struct`
                  /\b(?:enum(?:\s+(?:class|struct))?|class|struct|union)/,
                  /\s+/,
                  /\w+/
                ],
                className: {
                  1: "keyword",
                  3: "title.class"
                }
              }
            ]
          )
        };
      }
      module.exports = cpp;
    }
  });

  // node_modules/highlight.js/lib/languages/xml.js
  var require_xml = __commonJS({
    "node_modules/highlight.js/lib/languages/xml.js"(exports, module) {
      function xml(hljs) {
        const regex = hljs.regex;
        const TAG_NAME_RE = regex.concat(/[\p{L}_]/u, regex.optional(/[\p{L}0-9_.-]*:/u), /[\p{L}0-9_.-]*/u);
        const XML_IDENT_RE = /[\p{L}0-9._:-]+/u;
        const XML_ENTITIES = {
          className: "symbol",
          begin: /&[a-z]+;|&#[0-9]+;|&#x[a-f0-9]+;/
        };
        const XML_META_KEYWORDS = {
          begin: /\s/,
          contains: [
            {
              className: "keyword",
              begin: /#?[a-z_][a-z1-9_-]+/,
              illegal: /\n/
            }
          ]
        };
        const XML_META_PAR_KEYWORDS = hljs.inherit(XML_META_KEYWORDS, {
          begin: /\(/,
          end: /\)/
        });
        const APOS_META_STRING_MODE = hljs.inherit(hljs.APOS_STRING_MODE, { className: "string" });
        const QUOTE_META_STRING_MODE = hljs.inherit(hljs.QUOTE_STRING_MODE, { className: "string" });
        const TAG_INTERNALS = {
          endsWithParent: true,
          illegal: /</,
          relevance: 0,
          contains: [
            {
              className: "attr",
              begin: XML_IDENT_RE,
              relevance: 0
            },
            {
              begin: /=\s*/,
              relevance: 0,
              contains: [
                {
                  className: "string",
                  endsParent: true,
                  variants: [
                    {
                      begin: /"/,
                      end: /"/,
                      contains: [XML_ENTITIES]
                    },
                    {
                      begin: /'/,
                      end: /'/,
                      contains: [XML_ENTITIES]
                    },
                    { begin: /[^\s"'=<>`]+/ }
                  ]
                }
              ]
            }
          ]
        };
        return {
          name: "HTML, XML",
          aliases: [
            "html",
            "xhtml",
            "rss",
            "atom",
            "xjb",
            "xsd",
            "xsl",
            "plist",
            "wsf",
            "svg"
          ],
          case_insensitive: true,
          unicodeRegex: true,
          contains: [
            {
              className: "meta",
              begin: /<![a-z]/,
              end: />/,
              relevance: 10,
              contains: [
                XML_META_KEYWORDS,
                QUOTE_META_STRING_MODE,
                APOS_META_STRING_MODE,
                XML_META_PAR_KEYWORDS,
                {
                  begin: /\[/,
                  end: /\]/,
                  contains: [
                    {
                      className: "meta",
                      begin: /<![a-z]/,
                      end: />/,
                      contains: [
                        XML_META_KEYWORDS,
                        XML_META_PAR_KEYWORDS,
                        QUOTE_META_STRING_MODE,
                        APOS_META_STRING_MODE
                      ]
                    }
                  ]
                }
              ]
            },
            hljs.COMMENT(
              /<!--/,
              /-->/,
              { relevance: 10 }
            ),
            {
              begin: /<!\[CDATA\[/,
              end: /\]\]>/,
              relevance: 10
            },
            XML_ENTITIES,
            // xml processing instructions
            {
              className: "meta",
              end: /\?>/,
              variants: [
                {
                  begin: /<\?xml/,
                  relevance: 10,
                  contains: [
                    QUOTE_META_STRING_MODE
                  ]
                },
                {
                  begin: /<\?[a-z][a-z0-9]+/
                }
              ]
            },
            {
              className: "tag",
              /*
              The lookahead pattern (?=...) ensures that 'begin' only matches
              '<style' as a single word, followed by a whitespace or an
              ending bracket.
              */
              begin: /<style(?=\s|>)/,
              end: />/,
              keywords: { name: "style" },
              contains: [TAG_INTERNALS],
              starts: {
                end: /<\/style>/,
                returnEnd: true,
                subLanguage: [
                  "css",
                  "xml"
                ]
              }
            },
            {
              className: "tag",
              // See the comment in the <style tag about the lookahead pattern
              begin: /<script(?=\s|>)/,
              end: />/,
              keywords: { name: "script" },
              contains: [TAG_INTERNALS],
              starts: {
                end: /<\/script>/,
                returnEnd: true,
                subLanguage: [
                  "javascript",
                  "handlebars",
                  "xml"
                ]
              }
            },
            // we need this for now for jSX
            {
              className: "tag",
              begin: /<>|<\/>/
            },
            // open tag
            {
              className: "tag",
              begin: regex.concat(
                /</,
                regex.lookahead(regex.concat(
                  TAG_NAME_RE,
                  // <tag/>
                  // <tag>
                  // <tag ...
                  regex.either(/\/>/, />/, /\s/)
                ))
              ),
              end: /\/?>/,
              contains: [
                {
                  className: "name",
                  begin: TAG_NAME_RE,
                  relevance: 0,
                  starts: TAG_INTERNALS
                }
              ]
            },
            // close tag
            {
              className: "tag",
              begin: regex.concat(
                /<\//,
                regex.lookahead(regex.concat(
                  TAG_NAME_RE,
                  />/
                ))
              ),
              contains: [
                {
                  className: "name",
                  begin: TAG_NAME_RE,
                  relevance: 0
                },
                {
                  begin: />/,
                  relevance: 0,
                  endsParent: true
                }
              ]
            }
          ]
        };
      }
      module.exports = xml;
    }
  });

  // node_modules/highlight.js/lib/languages/awk.js
  var require_awk = __commonJS({
    "node_modules/highlight.js/lib/languages/awk.js"(exports, module) {
      function awk(hljs) {
        const VARIABLE = {
          className: "variable",
          variants: [
            { begin: /\$[\w\d#@][\w\d_]*/ },
            { begin: /\$\{(.*?)\}/ }
          ]
        };
        const KEYWORDS = "BEGIN END if else while do for in break continue delete next nextfile function func exit|10";
        const STRING = {
          className: "string",
          contains: [hljs.BACKSLASH_ESCAPE],
          variants: [
            {
              begin: /(u|b)?r?'''/,
              end: /'''/,
              relevance: 10
            },
            {
              begin: /(u|b)?r?"""/,
              end: /"""/,
              relevance: 10
            },
            {
              begin: /(u|r|ur)'/,
              end: /'/,
              relevance: 10
            },
            {
              begin: /(u|r|ur)"/,
              end: /"/,
              relevance: 10
            },
            {
              begin: /(b|br)'/,
              end: /'/
            },
            {
              begin: /(b|br)"/,
              end: /"/
            },
            hljs.APOS_STRING_MODE,
            hljs.QUOTE_STRING_MODE
          ]
        };
        return {
          name: "Awk",
          keywords: { keyword: KEYWORDS },
          contains: [
            VARIABLE,
            STRING,
            hljs.REGEXP_MODE,
            hljs.HASH_COMMENT_MODE,
            hljs.NUMBER_MODE
          ]
        };
      }
      module.exports = awk;
    }
  });

  // node_modules/highlight.js/lib/languages/bash.js
  var require_bash = __commonJS({
    "node_modules/highlight.js/lib/languages/bash.js"(exports, module) {
      function bash(hljs) {
        const regex = hljs.regex;
        const VAR = {};
        const BRACED_VAR = {
          begin: /\$\{/,
          end: /\}/,
          contains: [
            "self",
            {
              begin: /:-/,
              contains: [VAR]
            }
            // default values
          ]
        };
        Object.assign(VAR, {
          className: "variable",
          variants: [
            { begin: regex.concat(
              /\$[\w\d#@][\w\d_]*/,
              // negative look-ahead tries to avoid matching patterns that are not
              // Perl at all like $ident$, @ident@, etc.
              `(?![\\w\\d])(?![$])`
            ) },
            BRACED_VAR
          ]
        });
        const SUBST = {
          className: "subst",
          begin: /\$\(/,
          end: /\)/,
          contains: [hljs.BACKSLASH_ESCAPE]
        };
        const COMMENT = hljs.inherit(
          hljs.COMMENT(),
          {
            match: [
              /(^|\s)/,
              /#.*$/
            ],
            scope: {
              2: "comment"
            }
          }
        );
        const HERE_DOC = {
          begin: /<<-?\s*(?=\w+)/,
          starts: { contains: [
            hljs.END_SAME_AS_BEGIN({
              begin: /(\w+)/,
              end: /(\w+)/,
              className: "string"
            })
          ] }
        };
        const QUOTE_STRING = {
          className: "string",
          begin: /"/,
          end: /"/,
          contains: [
            hljs.BACKSLASH_ESCAPE,
            VAR,
            SUBST
          ]
        };
        SUBST.contains.push(QUOTE_STRING);
        const ESCAPED_QUOTE = {
          match: /\\"/
        };
        const APOS_STRING = {
          className: "string",
          begin: /'/,
          end: /'/
        };
        const ESCAPED_APOS = {
          match: /\\'/
        };
        const ARITHMETIC = {
          begin: /\$?\(\(/,
          end: /\)\)/,
          contains: [
            {
              begin: /\d+#[0-9a-f]+/,
              className: "number"
            },
            hljs.NUMBER_MODE,
            VAR
          ]
        };
        const SH_LIKE_SHELLS = [
          "fish",
          "bash",
          "zsh",
          "sh",
          "csh",
          "ksh",
          "tcsh",
          "dash",
          "scsh"
        ];
        const KNOWN_SHEBANG = hljs.SHEBANG({
          binary: `(${SH_LIKE_SHELLS.join("|")})`,
          relevance: 10
        });
        const FUNCTION = {
          className: "function",
          begin: /\w[\w\d_]*\s*\(\s*\)\s*\{/,
          returnBegin: true,
          contains: [hljs.inherit(hljs.TITLE_MODE, { begin: /\w[\w\d_]*/ })],
          relevance: 0
        };
        const KEYWORDS = [
          "if",
          "then",
          "else",
          "elif",
          "fi",
          "time",
          "for",
          "while",
          "until",
          "in",
          "do",
          "done",
          "case",
          "esac",
          "coproc",
          "function",
          "select"
        ];
        const LITERALS = [
          "true",
          "false"
        ];
        const PATH_MODE = { match: /(\/[a-z._-]+)+/ };
        const SHELL_BUILT_INS = [
          "break",
          "cd",
          "continue",
          "eval",
          "exec",
          "exit",
          "export",
          "getopts",
          "hash",
          "pwd",
          "readonly",
          "return",
          "shift",
          "test",
          "times",
          "trap",
          "umask",
          "unset"
        ];
        const BASH_BUILT_INS = [
          "alias",
          "bind",
          "builtin",
          "caller",
          "command",
          "declare",
          "echo",
          "enable",
          "help",
          "let",
          "local",
          "logout",
          "mapfile",
          "printf",
          "read",
          "readarray",
          "source",
          "sudo",
          "type",
          "typeset",
          "ulimit",
          "unalias"
        ];
        const ZSH_BUILT_INS = [
          "autoload",
          "bg",
          "bindkey",
          "bye",
          "cap",
          "chdir",
          "clone",
          "comparguments",
          "compcall",
          "compctl",
          "compdescribe",
          "compfiles",
          "compgroups",
          "compquote",
          "comptags",
          "comptry",
          "compvalues",
          "dirs",
          "disable",
          "disown",
          "echotc",
          "echoti",
          "emulate",
          "fc",
          "fg",
          "float",
          "functions",
          "getcap",
          "getln",
          "history",
          "integer",
          "jobs",
          "kill",
          "limit",
          "log",
          "noglob",
          "popd",
          "print",
          "pushd",
          "pushln",
          "rehash",
          "sched",
          "setcap",
          "setopt",
          "stat",
          "suspend",
          "ttyctl",
          "unfunction",
          "unhash",
          "unlimit",
          "unsetopt",
          "vared",
          "wait",
          "whence",
          "where",
          "which",
          "zcompile",
          "zformat",
          "zftp",
          "zle",
          "zmodload",
          "zparseopts",
          "zprof",
          "zpty",
          "zregexparse",
          "zsocket",
          "zstyle",
          "ztcp"
        ];
        const GNU_CORE_UTILS = [
          "chcon",
          "chgrp",
          "chown",
          "chmod",
          "cp",
          "dd",
          "df",
          "dir",
          "dircolors",
          "ln",
          "ls",
          "mkdir",
          "mkfifo",
          "mknod",
          "mktemp",
          "mv",
          "realpath",
          "rm",
          "rmdir",
          "shred",
          "sync",
          "touch",
          "truncate",
          "vdir",
          "b2sum",
          "base32",
          "base64",
          "cat",
          "cksum",
          "comm",
          "csplit",
          "cut",
          "expand",
          "fmt",
          "fold",
          "head",
          "join",
          "md5sum",
          "nl",
          "numfmt",
          "od",
          "paste",
          "ptx",
          "pr",
          "sha1sum",
          "sha224sum",
          "sha256sum",
          "sha384sum",
          "sha512sum",
          "shuf",
          "sort",
          "split",
          "sum",
          "tac",
          "tail",
          "tr",
          "tsort",
          "unexpand",
          "uniq",
          "wc",
          "arch",
          "basename",
          "chroot",
          "date",
          "dirname",
          "du",
          "echo",
          "env",
          "expr",
          "factor",
          // "false", // keyword literal already
          "groups",
          "hostid",
          "id",
          "link",
          "logname",
          "nice",
          "nohup",
          "nproc",
          "pathchk",
          "pinky",
          "printenv",
          "printf",
          "pwd",
          "readlink",
          "runcon",
          "seq",
          "sleep",
          "stat",
          "stdbuf",
          "stty",
          "tee",
          "test",
          "timeout",
          // "true", // keyword literal already
          "tty",
          "uname",
          "unlink",
          "uptime",
          "users",
          "who",
          "whoami",
          "yes"
        ];
        return {
          name: "Bash",
          aliases: [
            "sh",
            "zsh"
          ],
          keywords: {
            $pattern: /\b[a-z][a-z0-9._-]+\b/,
            keyword: KEYWORDS,
            literal: LITERALS,
            built_in: [
              ...SHELL_BUILT_INS,
              ...BASH_BUILT_INS,
              // Shell modifiers
              "set",
              "shopt",
              ...ZSH_BUILT_INS,
              ...GNU_CORE_UTILS
            ]
          },
          contains: [
            KNOWN_SHEBANG,
            // to catch known shells and boost relevancy
            hljs.SHEBANG(),
            // to catch unknown shells but still highlight the shebang
            FUNCTION,
            ARITHMETIC,
            COMMENT,
            HERE_DOC,
            PATH_MODE,
            QUOTE_STRING,
            ESCAPED_QUOTE,
            APOS_STRING,
            ESCAPED_APOS,
            VAR
          ]
        };
      }
      module.exports = bash;
    }
  });

  // node_modules/highlight.js/lib/languages/c.js
  var require_c = __commonJS({
    "node_modules/highlight.js/lib/languages/c.js"(exports, module) {
      function c(hljs) {
        const regex = hljs.regex;
        const C_LINE_COMMENT_MODE = hljs.COMMENT("//", "$", { contains: [{ begin: /\\\n/ }] });
        const DECLTYPE_AUTO_RE = "decltype\\(auto\\)";
        const NAMESPACE_RE = "[a-zA-Z_]\\w*::";
        const TEMPLATE_ARGUMENT_RE = "<[^<>]+>";
        const FUNCTION_TYPE_RE = "(" + DECLTYPE_AUTO_RE + "|" + regex.optional(NAMESPACE_RE) + "[a-zA-Z_]\\w*" + regex.optional(TEMPLATE_ARGUMENT_RE) + ")";
        const TYPES = {
          className: "type",
          variants: [
            { begin: "\\b[a-z\\d_]*_t\\b" },
            { match: /\batomic_[a-z]{3,6}\b/ }
          ]
        };
        const CHARACTER_ESCAPES = "\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4,8}|[0-7]{3}|\\S)";
        const STRINGS = {
          className: "string",
          variants: [
            {
              begin: '(u8?|U|L)?"',
              end: '"',
              illegal: "\\n",
              contains: [hljs.BACKSLASH_ESCAPE]
            },
            {
              begin: "(u8?|U|L)?'(" + CHARACTER_ESCAPES + "|.)",
              end: "'",
              illegal: "."
            },
            hljs.END_SAME_AS_BEGIN({
              begin: /(?:u8?|U|L)?R"([^()\\ ]{0,16})\(/,
              end: /\)([^()\\ ]{0,16})"/
            })
          ]
        };
        const NUMBERS = {
          className: "number",
          variants: [
            { match: /\b(0b[01']+)/ },
            { match: /(-?)\b([\d']+(\.[\d']*)?|\.[\d']+)((ll|LL|l|L)(u|U)?|(u|U)(ll|LL|l|L)?|f|F|b|B)/ },
            { match: /(-?)\b(0[xX][a-fA-F0-9]+(?:'[a-fA-F0-9]+)*(?:\.[a-fA-F0-9]*(?:'[a-fA-F0-9]*)*)?(?:[pP][-+]?[0-9]+)?(l|L)?(u|U)?)/ },
            { match: /(-?)\b\d+(?:'\d+)*(?:\.\d*(?:'\d*)*)?(?:[eE][-+]?\d+)?/ }
          ],
          relevance: 0
        };
        const PREPROCESSOR = {
          className: "meta",
          begin: /#\s*[a-z]+\b/,
          end: /$/,
          keywords: { keyword: "if else elif endif define undef warning error line pragma _Pragma ifdef ifndef elifdef elifndef include" },
          contains: [
            {
              begin: /\\\n/,
              relevance: 0
            },
            hljs.inherit(STRINGS, { className: "string" }),
            {
              className: "string",
              begin: /<.*?>/
            },
            C_LINE_COMMENT_MODE,
            hljs.C_BLOCK_COMMENT_MODE
          ]
        };
        const TITLE_MODE = {
          className: "title",
          begin: regex.optional(NAMESPACE_RE) + hljs.IDENT_RE,
          relevance: 0
        };
        const FUNCTION_TITLE = regex.optional(NAMESPACE_RE) + hljs.IDENT_RE + "\\s*\\(";
        const C_KEYWORDS = [
          "asm",
          "auto",
          "break",
          "case",
          "continue",
          "default",
          "do",
          "else",
          "enum",
          "extern",
          "for",
          "fortran",
          "goto",
          "if",
          "inline",
          "register",
          "restrict",
          "return",
          "sizeof",
          "typeof",
          "typeof_unqual",
          "struct",
          "switch",
          "typedef",
          "union",
          "volatile",
          "while",
          "_Alignas",
          "_Alignof",
          "_Atomic",
          "_Generic",
          "_Noreturn",
          "_Static_assert",
          "_Thread_local",
          // aliases
          "alignas",
          "alignof",
          "noreturn",
          "static_assert",
          "thread_local",
          // not a C keyword but is, for all intents and purposes, treated exactly like one.
          "_Pragma"
        ];
        const C_TYPES = [
          "float",
          "double",
          "signed",
          "unsigned",
          "int",
          "short",
          "long",
          "char",
          "void",
          "_Bool",
          "_BitInt",
          "_Complex",
          "_Imaginary",
          "_Decimal32",
          "_Decimal64",
          "_Decimal96",
          "_Decimal128",
          "_Decimal64x",
          "_Decimal128x",
          "_Float16",
          "_Float32",
          "_Float64",
          "_Float128",
          "_Float32x",
          "_Float64x",
          "_Float128x",
          // modifiers
          "const",
          "static",
          "constexpr",
          // aliases
          "complex",
          "bool",
          "imaginary"
        ];
        const KEYWORDS = {
          keyword: C_KEYWORDS,
          type: C_TYPES,
          literal: "true false NULL",
          // TODO: apply hinting work similar to what was done in cpp.js
          built_in: "std string wstring cin cout cerr clog stdin stdout stderr stringstream istringstream ostringstream auto_ptr deque list queue stack vector map set pair bitset multiset multimap unordered_set unordered_map unordered_multiset unordered_multimap priority_queue make_pair array shared_ptr abort terminate abs acos asin atan2 atan calloc ceil cosh cos exit exp fabs floor fmod fprintf fputs free frexp fscanf future isalnum isalpha iscntrl isdigit isgraph islower isprint ispunct isspace isupper isxdigit tolower toupper labs ldexp log10 log malloc realloc memchr memcmp memcpy memset modf pow printf putchar puts scanf sinh sin snprintf sprintf sqrt sscanf strcat strchr strcmp strcpy strcspn strlen strncat strncmp strncpy strpbrk strrchr strspn strstr tanh tan vfprintf vprintf vsprintf endl initializer_list unique_ptr"
        };
        const EXPRESSION_CONTAINS = [
          PREPROCESSOR,
          TYPES,
          C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          NUMBERS,
          STRINGS
        ];
        const EXPRESSION_CONTEXT = {
          // This mode covers expression context where we can't expect a function
          // definition and shouldn't highlight anything that looks like one:
          // `return some()`, `else if()`, `(x*sum(1, 2))`
          variants: [
            {
              begin: /=/,
              end: /;/
            },
            {
              begin: /\(/,
              end: /\)/
            },
            {
              beginKeywords: "new throw return else",
              end: /;/
            }
          ],
          keywords: KEYWORDS,
          contains: EXPRESSION_CONTAINS.concat([
            {
              begin: /\(/,
              end: /\)/,
              keywords: KEYWORDS,
              contains: EXPRESSION_CONTAINS.concat(["self"]),
              relevance: 0
            }
          ]),
          relevance: 0
        };
        const FUNCTION_DECLARATION = {
          begin: "(" + FUNCTION_TYPE_RE + "[\\*&\\s]+)+" + FUNCTION_TITLE,
          returnBegin: true,
          end: /[{;=]/,
          excludeEnd: true,
          keywords: KEYWORDS,
          illegal: /[^\w\s\*&:<>.]/,
          contains: [
            {
              // to prevent it from being confused as the function title
              begin: DECLTYPE_AUTO_RE,
              keywords: KEYWORDS,
              relevance: 0
            },
            {
              begin: FUNCTION_TITLE,
              returnBegin: true,
              contains: [hljs.inherit(TITLE_MODE, { className: "title.function" })],
              relevance: 0
            },
            // allow for multiple declarations, e.g.:
            // extern void f(int), g(char);
            {
              relevance: 0,
              match: /,/
            },
            {
              className: "params",
              begin: /\(/,
              end: /\)/,
              keywords: KEYWORDS,
              relevance: 0,
              contains: [
                C_LINE_COMMENT_MODE,
                hljs.C_BLOCK_COMMENT_MODE,
                STRINGS,
                NUMBERS,
                TYPES,
                // Count matching parentheses.
                {
                  begin: /\(/,
                  end: /\)/,
                  keywords: KEYWORDS,
                  relevance: 0,
                  contains: [
                    "self",
                    C_LINE_COMMENT_MODE,
                    hljs.C_BLOCK_COMMENT_MODE,
                    STRINGS,
                    NUMBERS,
                    TYPES
                  ]
                }
              ]
            },
            TYPES,
            C_LINE_COMMENT_MODE,
            hljs.C_BLOCK_COMMENT_MODE,
            PREPROCESSOR
          ]
        };
        return {
          name: "C",
          aliases: ["h"],
          keywords: KEYWORDS,
          // Until differentiations are added between `c` and `cpp`, `c` will
          // not be auto-detected to avoid auto-detect conflicts between C and C++
          disableAutodetect: true,
          illegal: "</",
          contains: [].concat(
            EXPRESSION_CONTEXT,
            FUNCTION_DECLARATION,
            EXPRESSION_CONTAINS,
            [
              PREPROCESSOR,
              {
                begin: hljs.IDENT_RE + "::",
                keywords: KEYWORDS
              },
              {
                className: "class",
                beginKeywords: "enum class struct union",
                end: /[{;:<>=]/,
                contains: [
                  { beginKeywords: "final class struct" },
                  hljs.TITLE_MODE
                ]
              }
            ]
          ),
          exports: {
            preprocessor: PREPROCESSOR,
            strings: STRINGS,
            keywords: KEYWORDS
          }
        };
      }
      module.exports = c;
    }
  });

  // node_modules/highlight.js/lib/languages/clojure.js
  var require_clojure = __commonJS({
    "node_modules/highlight.js/lib/languages/clojure.js"(exports, module) {
      function clojure(hljs) {
        const SYMBOLSTART = "a-zA-Z_\\-!.?+*=<>&'";
        const SYMBOL_RE = "[#]?[" + SYMBOLSTART + "][" + SYMBOLSTART + "0-9/;:$#]*";
        const globals = "def defonce defprotocol defstruct defmulti defmethod defn- defn defmacro deftype defrecord";
        const keywords = {
          $pattern: SYMBOL_RE,
          built_in: (
            // Clojure keywords
            globals + " cond apply if-not if-let if not not= =|0 <|0 >|0 <=|0 >=|0 ==|0 +|0 /|0 *|0 -|0 rem quot neg? pos? delay? symbol? keyword? true? false? integer? empty? coll? list? set? ifn? fn? associative? sequential? sorted? counted? reversible? number? decimal? class? distinct? isa? float? rational? reduced? ratio? odd? even? char? seq? vector? string? map? nil? contains? zero? instance? not-every? not-any? libspec? -> ->> .. . inc compare do dotimes mapcat take remove take-while drop letfn drop-last take-last drop-while while intern condp case reduced cycle split-at split-with repeat replicate iterate range merge zipmap declare line-seq sort comparator sort-by dorun doall nthnext nthrest partition eval doseq await await-for let agent atom send send-off release-pending-sends add-watch mapv filterv remove-watch agent-error restart-agent set-error-handler error-handler set-error-mode! error-mode shutdown-agents quote var fn loop recur throw try monitor-enter monitor-exit macroexpand macroexpand-1 for dosync and or when when-not when-let comp juxt partial sequence memoize constantly complement identity assert peek pop doto proxy first rest cons cast coll last butlast sigs reify second ffirst fnext nfirst nnext meta with-meta ns in-ns create-ns import refer keys select-keys vals key val rseq name namespace promise into transient persistent! conj! assoc! dissoc! pop! disj! use class type num float double short byte boolean bigint biginteger bigdec print-method print-dup throw-if printf format load compile get-in update-in pr pr-on newline flush read slurp read-line subvec with-open memfn time re-find re-groups rand-int rand mod locking assert-valid-fdecl alias resolve ref deref refset swap! reset! set-validator! compare-and-set! alter-meta! reset-meta! commute get-validator alter ref-set ref-history-count ref-min-history ref-max-history ensure sync io! new next conj set! to-array future future-call into-array aset gen-class reduce map filter find empty hash-map hash-set sorted-map sorted-map-by sorted-set sorted-set-by vec vector seq flatten reverse assoc dissoc list disj get union difference intersection extend extend-type extend-protocol int nth delay count concat chunk chunk-buffer chunk-append chunk-first chunk-rest max min dec unchecked-inc-int unchecked-inc unchecked-dec-inc unchecked-dec unchecked-negate unchecked-add-int unchecked-add unchecked-subtract-int unchecked-subtract chunk-next chunk-cons chunked-seq? prn vary-meta lazy-seq spread list* str find-keyword keyword symbol gensym force rationalize"
          )
        };
        const SYMBOL = {
          begin: SYMBOL_RE,
          relevance: 0
        };
        const NUMBER = {
          scope: "number",
          relevance: 0,
          variants: [
            { match: /[-+]?0[xX][0-9a-fA-F]+N?/ },
            // hexadecimal                 // 0x2a
            { match: /[-+]?0[0-7]+N?/ },
            // octal                       // 052
            { match: /[-+]?[1-9][0-9]?[rR][0-9a-zA-Z]+N?/ },
            // variable radix from 2 to 36 // 2r101010, 8r52, 36r16
            { match: /[-+]?[0-9]+\/[0-9]+N?/ },
            // ratio                       // 1/2
            { match: /[-+]?[0-9]+((\.[0-9]*([eE][+-]?[0-9]+)?M?)|([eE][+-]?[0-9]+M?|M))/ },
            // float        // 0.42 4.2E-1M 42E1 42M
            { match: /[-+]?([1-9][0-9]*|0)N?/ }
            // int (don't match leading 0) // 42 42N
          ]
        };
        const CHARACTER = {
          scope: "character",
          variants: [
            { match: /\\o[0-3]?[0-7]{1,2}/ },
            // Unicode Octal 0 - 377
            { match: /\\u[0-9a-fA-F]{4}/ },
            // Unicode Hex 0000 - FFFF
            { match: /\\(newline|space|tab|formfeed|backspace|return)/ },
            // special characters
            {
              match: /\\\S/,
              relevance: 0
            }
            // any non-whitespace char
          ]
        };
        const REGEX = {
          scope: "regex",
          begin: /#"/,
          end: /"/,
          contains: [hljs.BACKSLASH_ESCAPE]
        };
        const STRING = hljs.inherit(hljs.QUOTE_STRING_MODE, { illegal: null });
        const COMMA = {
          scope: "punctuation",
          match: /,/,
          relevance: 0
        };
        const COMMENT = hljs.COMMENT(
          ";",
          "$",
          { relevance: 0 }
        );
        const LITERAL = {
          className: "literal",
          begin: /\b(true|false|nil)\b/
        };
        const COLLECTION = {
          begin: "\\[|(#::?" + SYMBOL_RE + ")?\\{",
          end: "[\\]\\}]",
          relevance: 0
        };
        const KEY = {
          className: "symbol",
          begin: "[:]{1,2}" + SYMBOL_RE
        };
        const LIST = {
          begin: "\\(",
          end: "\\)"
        };
        const BODY = {
          endsWithParent: true,
          relevance: 0
        };
        const NAME = {
          keywords,
          className: "name",
          begin: SYMBOL_RE,
          relevance: 0,
          starts: BODY
        };
        const DEFAULT_CONTAINS = [
          COMMA,
          LIST,
          CHARACTER,
          REGEX,
          STRING,
          COMMENT,
          KEY,
          COLLECTION,
          NUMBER,
          LITERAL,
          SYMBOL
        ];
        const GLOBAL = {
          beginKeywords: globals,
          keywords: {
            $pattern: SYMBOL_RE,
            keyword: globals
          },
          end: '(\\[|#|\\d|"|:|\\{|\\)|\\(|$)',
          contains: [
            {
              className: "title",
              begin: SYMBOL_RE,
              relevance: 0,
              excludeEnd: true,
              // we can only have a single title
              endsParent: true
            }
          ].concat(DEFAULT_CONTAINS)
        };
        LIST.contains = [
          GLOBAL,
          NAME,
          BODY
        ];
        BODY.contains = DEFAULT_CONTAINS;
        COLLECTION.contains = DEFAULT_CONTAINS;
        return {
          name: "Clojure",
          aliases: [
            "clj",
            "edn"
          ],
          illegal: /\S/,
          contains: [
            COMMA,
            LIST,
            CHARACTER,
            REGEX,
            STRING,
            COMMENT,
            KEY,
            COLLECTION,
            NUMBER,
            LITERAL
          ]
        };
      }
      module.exports = clojure;
    }
  });

  // node_modules/highlight.js/lib/languages/crystal.js
  var require_crystal = __commonJS({
    "node_modules/highlight.js/lib/languages/crystal.js"(exports, module) {
      function crystal(hljs) {
        const INT_SUFFIX = "(_?[ui](8|16|32|64|128))?";
        const FLOAT_SUFFIX = "(_?f(32|64))?";
        const CRYSTAL_IDENT_RE = "[a-zA-Z_]\\w*[!?=]?";
        const CRYSTAL_METHOD_RE = "[a-zA-Z_]\\w*[!?=]?|[-+~]@|<<|>>|[=!]~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~|]|//|//=|&[-+*]=?|&\\*\\*|\\[\\][=?]?";
        const CRYSTAL_PATH_RE = "[A-Za-z_]\\w*(::\\w+)*(\\?|!)?";
        const CRYSTAL_KEYWORDS = {
          $pattern: CRYSTAL_IDENT_RE,
          keyword: "abstract alias annotation as as? asm begin break case class def do else elsif end ensure enum extend for fun if include instance_sizeof is_a? lib macro module next nil? of out pointerof private protected rescue responds_to? return require select self sizeof struct super then type typeof union uninitialized unless until verbatim when while with yield __DIR__ __END_LINE__ __FILE__ __LINE__",
          literal: "false nil true"
        };
        const SUBST = {
          className: "subst",
          begin: /#\{/,
          end: /\}/,
          keywords: CRYSTAL_KEYWORDS
        };
        const VARIABLE = {
          // negative-look forward attemps to prevent false matches like:
          // @ident@ or $ident$ that might indicate this is not ruby at all
          className: "variable",
          begin: `(\\$\\W)|((\\$|@@?)(\\w+))(?=[^@$?])(?![A-Za-z])(?![@$?'])`
        };
        const EXPANSION = {
          className: "template-variable",
          variants: [
            {
              begin: "\\{\\{",
              end: "\\}\\}"
            },
            {
              begin: "\\{%",
              end: "%\\}"
            }
          ],
          keywords: CRYSTAL_KEYWORDS
        };
        function recursiveParen(begin, end) {
          const contains = [
            {
              begin,
              end
            }
          ];
          contains[0].contains = contains;
          return contains;
        }
        const STRING = {
          className: "string",
          contains: [
            hljs.BACKSLASH_ESCAPE,
            SUBST
          ],
          variants: [
            {
              begin: /'/,
              end: /'/
            },
            {
              begin: /"/,
              end: /"/
            },
            {
              begin: /`/,
              end: /`/
            },
            {
              begin: "%[Qwi]?\\(",
              end: "\\)",
              contains: recursiveParen("\\(", "\\)")
            },
            {
              begin: "%[Qwi]?\\[",
              end: "\\]",
              contains: recursiveParen("\\[", "\\]")
            },
            {
              begin: "%[Qwi]?\\{",
              end: /\}/,
              contains: recursiveParen(/\{/, /\}/)
            },
            {
              begin: "%[Qwi]?<",
              end: ">",
              contains: recursiveParen("<", ">")
            },
            {
              begin: "%[Qwi]?\\|",
              end: "\\|"
            },
            {
              begin: /<<-\w+$/,
              end: /^\s*\w+$/
            }
          ],
          relevance: 0
        };
        const Q_STRING = {
          className: "string",
          variants: [
            {
              begin: "%q\\(",
              end: "\\)",
              contains: recursiveParen("\\(", "\\)")
            },
            {
              begin: "%q\\[",
              end: "\\]",
              contains: recursiveParen("\\[", "\\]")
            },
            {
              begin: "%q\\{",
              end: /\}/,
              contains: recursiveParen(/\{/, /\}/)
            },
            {
              begin: "%q<",
              end: ">",
              contains: recursiveParen("<", ">")
            },
            {
              begin: "%q\\|",
              end: "\\|"
            },
            {
              begin: /<<-'\w+'$/,
              end: /^\s*\w+$/
            }
          ],
          relevance: 0
        };
        const REGEXP = {
          begin: "(?!%\\})(" + hljs.RE_STARTERS_RE + "|\\n|\\b(case|if|select|unless|until|when|while)\\b)\\s*",
          keywords: "case if select unless until when while",
          contains: [
            {
              className: "regexp",
              contains: [
                hljs.BACKSLASH_ESCAPE,
                SUBST
              ],
              variants: [
                {
                  begin: "//[a-z]*",
                  relevance: 0
                },
                {
                  begin: "/(?!\\/)",
                  end: "/[a-z]*"
                }
              ]
            }
          ],
          relevance: 0
        };
        const REGEXP2 = {
          className: "regexp",
          contains: [
            hljs.BACKSLASH_ESCAPE,
            SUBST
          ],
          variants: [
            {
              begin: "%r\\(",
              end: "\\)",
              contains: recursiveParen("\\(", "\\)")
            },
            {
              begin: "%r\\[",
              end: "\\]",
              contains: recursiveParen("\\[", "\\]")
            },
            {
              begin: "%r\\{",
              end: /\}/,
              contains: recursiveParen(/\{/, /\}/)
            },
            {
              begin: "%r<",
              end: ">",
              contains: recursiveParen("<", ">")
            },
            {
              begin: "%r\\|",
              end: "\\|"
            }
          ],
          relevance: 0
        };
        const ATTRIBUTE = {
          className: "meta",
          begin: "@\\[",
          end: "\\]",
          contains: [hljs.inherit(hljs.QUOTE_STRING_MODE, { className: "string" })]
        };
        const CRYSTAL_DEFAULT_CONTAINS = [
          EXPANSION,
          STRING,
          Q_STRING,
          REGEXP2,
          REGEXP,
          ATTRIBUTE,
          VARIABLE,
          hljs.HASH_COMMENT_MODE,
          {
            className: "class",
            beginKeywords: "class module struct",
            end: "$|;",
            illegal: /=/,
            contains: [
              hljs.HASH_COMMENT_MODE,
              hljs.inherit(hljs.TITLE_MODE, { begin: CRYSTAL_PATH_RE }),
              {
                // relevance booster for inheritance
                begin: "<"
              }
            ]
          },
          {
            className: "class",
            beginKeywords: "lib enum union",
            end: "$|;",
            illegal: /=/,
            contains: [
              hljs.HASH_COMMENT_MODE,
              hljs.inherit(hljs.TITLE_MODE, { begin: CRYSTAL_PATH_RE })
            ]
          },
          {
            beginKeywords: "annotation",
            end: "$|;",
            illegal: /=/,
            contains: [
              hljs.HASH_COMMENT_MODE,
              hljs.inherit(hljs.TITLE_MODE, { begin: CRYSTAL_PATH_RE })
            ],
            relevance: 2
          },
          {
            className: "function",
            beginKeywords: "def",
            end: /\B\b/,
            contains: [
              hljs.inherit(hljs.TITLE_MODE, {
                begin: CRYSTAL_METHOD_RE,
                endsParent: true
              })
            ]
          },
          {
            className: "function",
            beginKeywords: "fun macro",
            end: /\B\b/,
            contains: [
              hljs.inherit(hljs.TITLE_MODE, {
                begin: CRYSTAL_METHOD_RE,
                endsParent: true
              })
            ],
            relevance: 2
          },
          {
            className: "symbol",
            begin: hljs.UNDERSCORE_IDENT_RE + "(!|\\?)?:",
            relevance: 0
          },
          {
            className: "symbol",
            begin: ":",
            contains: [
              STRING,
              { begin: CRYSTAL_METHOD_RE }
            ],
            relevance: 0
          },
          {
            className: "number",
            variants: [
              { begin: "\\b0b([01_]+)" + INT_SUFFIX },
              { begin: "\\b0o([0-7_]+)" + INT_SUFFIX },
              { begin: "\\b0x([A-Fa-f0-9_]+)" + INT_SUFFIX },
              { begin: "\\b([1-9][0-9_]*[0-9]|[0-9])(\\.[0-9][0-9_]*)?([eE]_?[-+]?[0-9_]*)?" + FLOAT_SUFFIX + "(?!_)" },
              { begin: "\\b([1-9][0-9_]*|0)" + INT_SUFFIX }
            ],
            relevance: 0
          }
        ];
        SUBST.contains = CRYSTAL_DEFAULT_CONTAINS;
        EXPANSION.contains = CRYSTAL_DEFAULT_CONTAINS.slice(1);
        return {
          name: "Crystal",
          aliases: ["cr"],
          keywords: CRYSTAL_KEYWORDS,
          contains: CRYSTAL_DEFAULT_CONTAINS
        };
      }
      module.exports = crystal;
    }
  });

  // node_modules/highlight.js/lib/languages/csharp.js
  var require_csharp = __commonJS({
    "node_modules/highlight.js/lib/languages/csharp.js"(exports, module) {
      function csharp(hljs) {
        const BUILT_IN_KEYWORDS = [
          "bool",
          "byte",
          "char",
          "decimal",
          "delegate",
          "double",
          "dynamic",
          "enum",
          "float",
          "int",
          "long",
          "nint",
          "nuint",
          "object",
          "sbyte",
          "short",
          "string",
          "ulong",
          "uint",
          "ushort"
        ];
        const FUNCTION_MODIFIERS = [
          "public",
          "private",
          "protected",
          "static",
          "internal",
          "protected",
          "abstract",
          "async",
          "extern",
          "override",
          "unsafe",
          "virtual",
          "new",
          "sealed",
          "partial"
        ];
        const LITERAL_KEYWORDS = [
          "default",
          "false",
          "null",
          "true"
        ];
        const NORMAL_KEYWORDS = [
          "abstract",
          "as",
          "base",
          "break",
          "case",
          "catch",
          "class",
          "const",
          "continue",
          "do",
          "else",
          "event",
          "explicit",
          "extern",
          "finally",
          "fixed",
          "for",
          "foreach",
          "goto",
          "if",
          "implicit",
          "in",
          "interface",
          "internal",
          "is",
          "lock",
          "namespace",
          "new",
          "operator",
          "out",
          "override",
          "params",
          "private",
          "protected",
          "public",
          "readonly",
          "record",
          "ref",
          "return",
          "scoped",
          "sealed",
          "sizeof",
          "stackalloc",
          "static",
          "struct",
          "switch",
          "this",
          "throw",
          "try",
          "typeof",
          "unchecked",
          "unsafe",
          "using",
          "virtual",
          "void",
          "volatile",
          "while"
        ];
        const CONTEXTUAL_KEYWORDS = [
          "add",
          "alias",
          "and",
          "ascending",
          "args",
          "async",
          "await",
          "by",
          "descending",
          "dynamic",
          "equals",
          "file",
          "from",
          "get",
          "global",
          "group",
          "init",
          "into",
          "join",
          "let",
          "nameof",
          "not",
          "notnull",
          "on",
          "or",
          "orderby",
          "partial",
          "record",
          "remove",
          "required",
          "scoped",
          "select",
          "set",
          "unmanaged",
          "value|0",
          "var",
          "when",
          "where",
          "with",
          "yield"
        ];
        const KEYWORDS = {
          keyword: NORMAL_KEYWORDS.concat(CONTEXTUAL_KEYWORDS),
          built_in: BUILT_IN_KEYWORDS,
          literal: LITERAL_KEYWORDS
        };
        const TITLE_MODE = hljs.inherit(hljs.TITLE_MODE, { begin: "[a-zA-Z](\\.?\\w)*" });
        const NUMBERS = {
          className: "number",
          variants: [
            { begin: "\\b(0b[01']+)" },
            { begin: "(-?)\\b([\\d']+(\\.[\\d']*)?|\\.[\\d']+)(u|U|l|L|ul|UL|f|F|b|B)" },
            { begin: "(-?)(\\b0[xX][a-fA-F0-9']+|(\\b[\\d']+(\\.[\\d']*)?|\\.[\\d']+)([eE][-+]?[\\d']+)?)" }
          ],
          relevance: 0
        };
        const RAW_STRING = {
          className: "string",
          begin: /"""("*)(?!")(.|\n)*?"""\1/,
          relevance: 1
        };
        const VERBATIM_STRING = {
          className: "string",
          begin: '@"',
          end: '"',
          contains: [{ begin: '""' }]
        };
        const VERBATIM_STRING_NO_LF = hljs.inherit(VERBATIM_STRING, { illegal: /\n/ });
        const SUBST = {
          className: "subst",
          begin: /\{/,
          end: /\}/,
          keywords: KEYWORDS
        };
        const SUBST_NO_LF = hljs.inherit(SUBST, { illegal: /\n/ });
        const INTERPOLATED_STRING = {
          className: "string",
          begin: /\$"/,
          end: '"',
          illegal: /\n/,
          contains: [
            { begin: /\{\{/ },
            { begin: /\}\}/ },
            hljs.BACKSLASH_ESCAPE,
            SUBST_NO_LF
          ]
        };
        const INTERPOLATED_VERBATIM_STRING = {
          className: "string",
          begin: /\$@"/,
          end: '"',
          contains: [
            { begin: /\{\{/ },
            { begin: /\}\}/ },
            { begin: '""' },
            SUBST
          ]
        };
        const INTERPOLATED_VERBATIM_STRING_NO_LF = hljs.inherit(INTERPOLATED_VERBATIM_STRING, {
          illegal: /\n/,
          contains: [
            { begin: /\{\{/ },
            { begin: /\}\}/ },
            { begin: '""' },
            SUBST_NO_LF
          ]
        });
        SUBST.contains = [
          INTERPOLATED_VERBATIM_STRING,
          INTERPOLATED_STRING,
          VERBATIM_STRING,
          hljs.APOS_STRING_MODE,
          hljs.QUOTE_STRING_MODE,
          NUMBERS,
          hljs.C_BLOCK_COMMENT_MODE
        ];
        SUBST_NO_LF.contains = [
          INTERPOLATED_VERBATIM_STRING_NO_LF,
          INTERPOLATED_STRING,
          VERBATIM_STRING_NO_LF,
          hljs.APOS_STRING_MODE,
          hljs.QUOTE_STRING_MODE,
          NUMBERS,
          hljs.inherit(hljs.C_BLOCK_COMMENT_MODE, { illegal: /\n/ })
        ];
        const STRING = { variants: [
          RAW_STRING,
          INTERPOLATED_VERBATIM_STRING,
          INTERPOLATED_STRING,
          VERBATIM_STRING,
          hljs.APOS_STRING_MODE,
          hljs.QUOTE_STRING_MODE
        ] };
        const GENERIC_MODIFIER = {
          begin: "<",
          end: ">",
          contains: [
            { beginKeywords: "in out" },
            TITLE_MODE
          ]
        };
        const TYPE_IDENT_RE = hljs.IDENT_RE + "(<" + hljs.IDENT_RE + "(\\s*,\\s*" + hljs.IDENT_RE + ")*>)?(\\[\\])?";
        const AT_IDENTIFIER = {
          // prevents expressions like `@class` from incorrect flagging
          // `class` as a keyword
          begin: "@" + hljs.IDENT_RE,
          relevance: 0
        };
        return {
          name: "C#",
          aliases: [
            "cs",
            "c#"
          ],
          keywords: KEYWORDS,
          illegal: /::/,
          contains: [
            hljs.COMMENT(
              "///",
              "$",
              {
                returnBegin: true,
                contains: [
                  {
                    className: "doctag",
                    variants: [
                      {
                        begin: "///",
                        relevance: 0
                      },
                      { begin: "<!--|-->" },
                      {
                        begin: "</?",
                        end: ">"
                      }
                    ]
                  }
                ]
              }
            ),
            hljs.C_LINE_COMMENT_MODE,
            hljs.C_BLOCK_COMMENT_MODE,
            {
              className: "meta",
              begin: "#",
              end: "$",
              keywords: { keyword: "if else elif endif define undef warning error line region endregion pragma checksum" }
            },
            STRING,
            NUMBERS,
            {
              beginKeywords: "class interface",
              relevance: 0,
              end: /[{;=]/,
              illegal: /[^\s:,]/,
              contains: [
                { beginKeywords: "where class" },
                TITLE_MODE,
                GENERIC_MODIFIER,
                hljs.C_LINE_COMMENT_MODE,
                hljs.C_BLOCK_COMMENT_MODE
              ]
            },
            {
              beginKeywords: "namespace",
              relevance: 0,
              end: /[{;=]/,
              illegal: /[^\s:]/,
              contains: [
                TITLE_MODE,
                hljs.C_LINE_COMMENT_MODE,
                hljs.C_BLOCK_COMMENT_MODE
              ]
            },
            {
              beginKeywords: "record",
              relevance: 0,
              end: /[{;=]/,
              illegal: /[^\s:]/,
              contains: [
                TITLE_MODE,
                GENERIC_MODIFIER,
                hljs.C_LINE_COMMENT_MODE,
                hljs.C_BLOCK_COMMENT_MODE
              ]
            },
            {
              // [Attributes("")]
              className: "meta",
              begin: "^\\s*\\[(?=[\\w])",
              excludeBegin: true,
              end: "\\]",
              excludeEnd: true,
              contains: [
                {
                  className: "string",
                  begin: /"/,
                  end: /"/
                }
              ]
            },
            {
              // Expression keywords prevent 'keyword Name(...)' from being
              // recognized as a function definition
              beginKeywords: "new return throw await else",
              relevance: 0
            },
            {
              className: "function",
              begin: "(" + TYPE_IDENT_RE + "\\s+)+" + hljs.IDENT_RE + "\\s*(<[^=]+>\\s*)?\\(",
              returnBegin: true,
              end: /\s*[{;=]/,
              excludeEnd: true,
              keywords: KEYWORDS,
              contains: [
                // prevents these from being highlighted `title`
                {
                  beginKeywords: FUNCTION_MODIFIERS.join(" "),
                  relevance: 0
                },
                {
                  begin: hljs.IDENT_RE + "\\s*(<[^=]+>\\s*)?\\(",
                  returnBegin: true,
                  contains: [
                    hljs.TITLE_MODE,
                    GENERIC_MODIFIER
                  ],
                  relevance: 0
                },
                { match: /\(\)/ },
                {
                  className: "params",
                  begin: /\(/,
                  end: /\)/,
                  excludeBegin: true,
                  excludeEnd: true,
                  keywords: KEYWORDS,
                  relevance: 0,
                  contains: [
                    STRING,
                    NUMBERS,
                    hljs.C_BLOCK_COMMENT_MODE
                  ]
                },
                hljs.C_LINE_COMMENT_MODE,
                hljs.C_BLOCK_COMMENT_MODE
              ]
            },
            AT_IDENTIFIER
          ]
        };
      }
      module.exports = csharp;
    }
  });

  // node_modules/highlight.js/lib/languages/csp.js
  var require_csp = __commonJS({
    "node_modules/highlight.js/lib/languages/csp.js"(exports, module) {
      function csp(hljs) {
        const KEYWORDS = [
          "base-uri",
          "child-src",
          "connect-src",
          "default-src",
          "font-src",
          "form-action",
          "frame-ancestors",
          "frame-src",
          "img-src",
          "manifest-src",
          "media-src",
          "object-src",
          "plugin-types",
          "report-uri",
          "sandbox",
          "script-src",
          "style-src",
          "trusted-types",
          "unsafe-hashes",
          "worker-src"
        ];
        return {
          name: "CSP",
          case_insensitive: false,
          keywords: {
            $pattern: "[a-zA-Z][a-zA-Z0-9_-]*",
            keyword: KEYWORDS
          },
          contains: [
            {
              className: "string",
              begin: "'",
              end: "'"
            },
            {
              className: "attribute",
              begin: "^Content",
              end: ":",
              excludeEnd: true
            }
          ]
        };
      }
      module.exports = csp;
    }
  });

  // node_modules/highlight.js/lib/languages/css.js
  var require_css = __commonJS({
    "node_modules/highlight.js/lib/languages/css.js"(exports, module) {
      var MODES = (hljs) => {
        return {
          IMPORTANT: {
            scope: "meta",
            begin: "!important"
          },
          BLOCK_COMMENT: hljs.C_BLOCK_COMMENT_MODE,
          HEXCOLOR: {
            scope: "number",
            begin: /#(([0-9a-fA-F]{3,4})|(([0-9a-fA-F]{2}){3,4}))\b/
          },
          FUNCTION_DISPATCH: {
            className: "built_in",
            begin: /[\w-]+(?=\()/
          },
          ATTRIBUTE_SELECTOR_MODE: {
            scope: "selector-attr",
            begin: /\[/,
            end: /\]/,
            illegal: "$",
            contains: [
              hljs.APOS_STRING_MODE,
              hljs.QUOTE_STRING_MODE
            ]
          },
          CSS_NUMBER_MODE: {
            scope: "number",
            begin: hljs.NUMBER_RE + "(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",
            relevance: 0
          },
          CSS_VARIABLE: {
            className: "attr",
            begin: /--[A-Za-z_][A-Za-z0-9_-]*/
          }
        };
      };
      var HTML_TAGS = [
        "a",
        "abbr",
        "address",
        "article",
        "aside",
        "audio",
        "b",
        "blockquote",
        "body",
        "button",
        "canvas",
        "caption",
        "cite",
        "code",
        "dd",
        "del",
        "details",
        "dfn",
        "div",
        "dl",
        "dt",
        "em",
        "fieldset",
        "figcaption",
        "figure",
        "footer",
        "form",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "header",
        "hgroup",
        "html",
        "i",
        "iframe",
        "img",
        "input",
        "ins",
        "kbd",
        "label",
        "legend",
        "li",
        "main",
        "mark",
        "menu",
        "nav",
        "object",
        "ol",
        "optgroup",
        "option",
        "p",
        "picture",
        "q",
        "quote",
        "samp",
        "section",
        "select",
        "source",
        "span",
        "strong",
        "summary",
        "sup",
        "table",
        "tbody",
        "td",
        "textarea",
        "tfoot",
        "th",
        "thead",
        "time",
        "tr",
        "ul",
        "var",
        "video"
      ];
      var SVG_TAGS = [
        "defs",
        "g",
        "marker",
        "mask",
        "pattern",
        "svg",
        "switch",
        "symbol",
        "feBlend",
        "feColorMatrix",
        "feComponentTransfer",
        "feComposite",
        "feConvolveMatrix",
        "feDiffuseLighting",
        "feDisplacementMap",
        "feFlood",
        "feGaussianBlur",
        "feImage",
        "feMerge",
        "feMorphology",
        "feOffset",
        "feSpecularLighting",
        "feTile",
        "feTurbulence",
        "linearGradient",
        "radialGradient",
        "stop",
        "circle",
        "ellipse",
        "image",
        "line",
        "path",
        "polygon",
        "polyline",
        "rect",
        "text",
        "use",
        "textPath",
        "tspan",
        "foreignObject",
        "clipPath"
      ];
      var TAGS = [
        ...HTML_TAGS,
        ...SVG_TAGS
      ];
      var MEDIA_FEATURES = [
        "any-hover",
        "any-pointer",
        "aspect-ratio",
        "color",
        "color-gamut",
        "color-index",
        "device-aspect-ratio",
        "device-height",
        "device-width",
        "display-mode",
        "forced-colors",
        "grid",
        "height",
        "hover",
        "inverted-colors",
        "monochrome",
        "orientation",
        "overflow-block",
        "overflow-inline",
        "pointer",
        "prefers-color-scheme",
        "prefers-contrast",
        "prefers-reduced-motion",
        "prefers-reduced-transparency",
        "resolution",
        "scan",
        "scripting",
        "update",
        "width",
        // TODO: find a better solution?
        "min-width",
        "max-width",
        "min-height",
        "max-height"
      ].sort().reverse();
      var PSEUDO_CLASSES = [
        "active",
        "any-link",
        "blank",
        "checked",
        "current",
        "default",
        "defined",
        "dir",
        // dir()
        "disabled",
        "drop",
        "empty",
        "enabled",
        "first",
        "first-child",
        "first-of-type",
        "fullscreen",
        "future",
        "focus",
        "focus-visible",
        "focus-within",
        "has",
        // has()
        "host",
        // host or host()
        "host-context",
        // host-context()
        "hover",
        "indeterminate",
        "in-range",
        "invalid",
        "is",
        // is()
        "lang",
        // lang()
        "last-child",
        "last-of-type",
        "left",
        "link",
        "local-link",
        "not",
        // not()
        "nth-child",
        // nth-child()
        "nth-col",
        // nth-col()
        "nth-last-child",
        // nth-last-child()
        "nth-last-col",
        // nth-last-col()
        "nth-last-of-type",
        //nth-last-of-type()
        "nth-of-type",
        //nth-of-type()
        "only-child",
        "only-of-type",
        "optional",
        "out-of-range",
        "past",
        "placeholder-shown",
        "read-only",
        "read-write",
        "required",
        "right",
        "root",
        "scope",
        "target",
        "target-within",
        "user-invalid",
        "valid",
        "visited",
        "where"
        // where()
      ].sort().reverse();
      var PSEUDO_ELEMENTS = [
        "after",
        "backdrop",
        "before",
        "cue",
        "cue-region",
        "first-letter",
        "first-line",
        "grammar-error",
        "marker",
        "part",
        "placeholder",
        "selection",
        "slotted",
        "spelling-error"
      ].sort().reverse();
      var ATTRIBUTES = [
        "accent-color",
        "align-content",
        "align-items",
        "align-self",
        "alignment-baseline",
        "all",
        "anchor-name",
        "animation",
        "animation-composition",
        "animation-delay",
        "animation-direction",
        "animation-duration",
        "animation-fill-mode",
        "animation-iteration-count",
        "animation-name",
        "animation-play-state",
        "animation-range",
        "animation-range-end",
        "animation-range-start",
        "animation-timeline",
        "animation-timing-function",
        "appearance",
        "aspect-ratio",
        "backdrop-filter",
        "backface-visibility",
        "background",
        "background-attachment",
        "background-blend-mode",
        "background-clip",
        "background-color",
        "background-image",
        "background-origin",
        "background-position",
        "background-position-x",
        "background-position-y",
        "background-repeat",
        "background-size",
        "baseline-shift",
        "block-size",
        "border",
        "border-block",
        "border-block-color",
        "border-block-end",
        "border-block-end-color",
        "border-block-end-style",
        "border-block-end-width",
        "border-block-start",
        "border-block-start-color",
        "border-block-start-style",
        "border-block-start-width",
        "border-block-style",
        "border-block-width",
        "border-bottom",
        "border-bottom-color",
        "border-bottom-left-radius",
        "border-bottom-right-radius",
        "border-bottom-style",
        "border-bottom-width",
        "border-collapse",
        "border-color",
        "border-end-end-radius",
        "border-end-start-radius",
        "border-image",
        "border-image-outset",
        "border-image-repeat",
        "border-image-slice",
        "border-image-source",
        "border-image-width",
        "border-inline",
        "border-inline-color",
        "border-inline-end",
        "border-inline-end-color",
        "border-inline-end-style",
        "border-inline-end-width",
        "border-inline-start",
        "border-inline-start-color",
        "border-inline-start-style",
        "border-inline-start-width",
        "border-inline-style",
        "border-inline-width",
        "border-left",
        "border-left-color",
        "border-left-style",
        "border-left-width",
        "border-radius",
        "border-right",
        "border-right-color",
        "border-right-style",
        "border-right-width",
        "border-spacing",
        "border-start-end-radius",
        "border-start-start-radius",
        "border-style",
        "border-top",
        "border-top-color",
        "border-top-left-radius",
        "border-top-right-radius",
        "border-top-style",
        "border-top-width",
        "border-width",
        "bottom",
        "box-align",
        "box-decoration-break",
        "box-direction",
        "box-flex",
        "box-flex-group",
        "box-lines",
        "box-ordinal-group",
        "box-orient",
        "box-pack",
        "box-shadow",
        "box-sizing",
        "break-after",
        "break-before",
        "break-inside",
        "caption-side",
        "caret-color",
        "clear",
        "clip",
        "clip-path",
        "clip-rule",
        "color",
        "color-interpolation",
        "color-interpolation-filters",
        "color-profile",
        "color-rendering",
        "color-scheme",
        "column-count",
        "column-fill",
        "column-gap",
        "column-rule",
        "column-rule-color",
        "column-rule-style",
        "column-rule-width",
        "column-span",
        "column-width",
        "columns",
        "contain",
        "contain-intrinsic-block-size",
        "contain-intrinsic-height",
        "contain-intrinsic-inline-size",
        "contain-intrinsic-size",
        "contain-intrinsic-width",
        "container",
        "container-name",
        "container-type",
        "content",
        "content-visibility",
        "counter-increment",
        "counter-reset",
        "counter-set",
        "cue",
        "cue-after",
        "cue-before",
        "cursor",
        "cx",
        "cy",
        "direction",
        "display",
        "dominant-baseline",
        "empty-cells",
        "enable-background",
        "field-sizing",
        "fill",
        "fill-opacity",
        "fill-rule",
        "filter",
        "flex",
        "flex-basis",
        "flex-direction",
        "flex-flow",
        "flex-grow",
        "flex-shrink",
        "flex-wrap",
        "float",
        "flood-color",
        "flood-opacity",
        "flow",
        "font",
        "font-display",
        "font-family",
        "font-feature-settings",
        "font-kerning",
        "font-language-override",
        "font-optical-sizing",
        "font-palette",
        "font-size",
        "font-size-adjust",
        "font-smooth",
        "font-smoothing",
        "font-stretch",
        "font-style",
        "font-synthesis",
        "font-synthesis-position",
        "font-synthesis-small-caps",
        "font-synthesis-style",
        "font-synthesis-weight",
        "font-variant",
        "font-variant-alternates",
        "font-variant-caps",
        "font-variant-east-asian",
        "font-variant-emoji",
        "font-variant-ligatures",
        "font-variant-numeric",
        "font-variant-position",
        "font-variation-settings",
        "font-weight",
        "forced-color-adjust",
        "gap",
        "glyph-orientation-horizontal",
        "glyph-orientation-vertical",
        "grid",
        "grid-area",
        "grid-auto-columns",
        "grid-auto-flow",
        "grid-auto-rows",
        "grid-column",
        "grid-column-end",
        "grid-column-start",
        "grid-gap",
        "grid-row",
        "grid-row-end",
        "grid-row-start",
        "grid-template",
        "grid-template-areas",
        "grid-template-columns",
        "grid-template-rows",
        "hanging-punctuation",
        "height",
        "hyphenate-character",
        "hyphenate-limit-chars",
        "hyphens",
        "icon",
        "image-orientation",
        "image-rendering",
        "image-resolution",
        "ime-mode",
        "initial-letter",
        "initial-letter-align",
        "inline-size",
        "inset",
        "inset-area",
        "inset-block",
        "inset-block-end",
        "inset-block-start",
        "inset-inline",
        "inset-inline-end",
        "inset-inline-start",
        "isolation",
        "justify-content",
        "justify-items",
        "justify-self",
        "kerning",
        "left",
        "letter-spacing",
        "lighting-color",
        "line-break",
        "line-height",
        "line-height-step",
        "list-style",
        "list-style-image",
        "list-style-position",
        "list-style-type",
        "margin",
        "margin-block",
        "margin-block-end",
        "margin-block-start",
        "margin-bottom",
        "margin-inline",
        "margin-inline-end",
        "margin-inline-start",
        "margin-left",
        "margin-right",
        "margin-top",
        "margin-trim",
        "marker",
        "marker-end",
        "marker-mid",
        "marker-start",
        "marks",
        "mask",
        "mask-border",
        "mask-border-mode",
        "mask-border-outset",
        "mask-border-repeat",
        "mask-border-slice",
        "mask-border-source",
        "mask-border-width",
        "mask-clip",
        "mask-composite",
        "mask-image",
        "mask-mode",
        "mask-origin",
        "mask-position",
        "mask-repeat",
        "mask-size",
        "mask-type",
        "masonry-auto-flow",
        "math-depth",
        "math-shift",
        "math-style",
        "max-block-size",
        "max-height",
        "max-inline-size",
        "max-width",
        "min-block-size",
        "min-height",
        "min-inline-size",
        "min-width",
        "mix-blend-mode",
        "nav-down",
        "nav-index",
        "nav-left",
        "nav-right",
        "nav-up",
        "none",
        "normal",
        "object-fit",
        "object-position",
        "offset",
        "offset-anchor",
        "offset-distance",
        "offset-path",
        "offset-position",
        "offset-rotate",
        "opacity",
        "order",
        "orphans",
        "outline",
        "outline-color",
        "outline-offset",
        "outline-style",
        "outline-width",
        "overflow",
        "overflow-anchor",
        "overflow-block",
        "overflow-clip-margin",
        "overflow-inline",
        "overflow-wrap",
        "overflow-x",
        "overflow-y",
        "overlay",
        "overscroll-behavior",
        "overscroll-behavior-block",
        "overscroll-behavior-inline",
        "overscroll-behavior-x",
        "overscroll-behavior-y",
        "padding",
        "padding-block",
        "padding-block-end",
        "padding-block-start",
        "padding-bottom",
        "padding-inline",
        "padding-inline-end",
        "padding-inline-start",
        "padding-left",
        "padding-right",
        "padding-top",
        "page",
        "page-break-after",
        "page-break-before",
        "page-break-inside",
        "paint-order",
        "pause",
        "pause-after",
        "pause-before",
        "perspective",
        "perspective-origin",
        "place-content",
        "place-items",
        "place-self",
        "pointer-events",
        "position",
        "position-anchor",
        "position-visibility",
        "print-color-adjust",
        "quotes",
        "r",
        "resize",
        "rest",
        "rest-after",
        "rest-before",
        "right",
        "rotate",
        "row-gap",
        "ruby-align",
        "ruby-position",
        "scale",
        "scroll-behavior",
        "scroll-margin",
        "scroll-margin-block",
        "scroll-margin-block-end",
        "scroll-margin-block-start",
        "scroll-margin-bottom",
        "scroll-margin-inline",
        "scroll-margin-inline-end",
        "scroll-margin-inline-start",
        "scroll-margin-left",
        "scroll-margin-right",
        "scroll-margin-top",
        "scroll-padding",
        "scroll-padding-block",
        "scroll-padding-block-end",
        "scroll-padding-block-start",
        "scroll-padding-bottom",
        "scroll-padding-inline",
        "scroll-padding-inline-end",
        "scroll-padding-inline-start",
        "scroll-padding-left",
        "scroll-padding-right",
        "scroll-padding-top",
        "scroll-snap-align",
        "scroll-snap-stop",
        "scroll-snap-type",
        "scroll-timeline",
        "scroll-timeline-axis",
        "scroll-timeline-name",
        "scrollbar-color",
        "scrollbar-gutter",
        "scrollbar-width",
        "shape-image-threshold",
        "shape-margin",
        "shape-outside",
        "shape-rendering",
        "speak",
        "speak-as",
        "src",
        // @font-face
        "stop-color",
        "stop-opacity",
        "stroke",
        "stroke-dasharray",
        "stroke-dashoffset",
        "stroke-linecap",
        "stroke-linejoin",
        "stroke-miterlimit",
        "stroke-opacity",
        "stroke-width",
        "tab-size",
        "table-layout",
        "text-align",
        "text-align-all",
        "text-align-last",
        "text-anchor",
        "text-combine-upright",
        "text-decoration",
        "text-decoration-color",
        "text-decoration-line",
        "text-decoration-skip",
        "text-decoration-skip-ink",
        "text-decoration-style",
        "text-decoration-thickness",
        "text-emphasis",
        "text-emphasis-color",
        "text-emphasis-position",
        "text-emphasis-style",
        "text-indent",
        "text-justify",
        "text-orientation",
        "text-overflow",
        "text-rendering",
        "text-shadow",
        "text-size-adjust",
        "text-transform",
        "text-underline-offset",
        "text-underline-position",
        "text-wrap",
        "text-wrap-mode",
        "text-wrap-style",
        "timeline-scope",
        "top",
        "touch-action",
        "transform",
        "transform-box",
        "transform-origin",
        "transform-style",
        "transition",
        "transition-behavior",
        "transition-delay",
        "transition-duration",
        "transition-property",
        "transition-timing-function",
        "translate",
        "unicode-bidi",
        "user-modify",
        "user-select",
        "vector-effect",
        "vertical-align",
        "view-timeline",
        "view-timeline-axis",
        "view-timeline-inset",
        "view-timeline-name",
        "view-transition-name",
        "visibility",
        "voice-balance",
        "voice-duration",
        "voice-family",
        "voice-pitch",
        "voice-range",
        "voice-rate",
        "voice-stress",
        "voice-volume",
        "white-space",
        "white-space-collapse",
        "widows",
        "width",
        "will-change",
        "word-break",
        "word-spacing",
        "word-wrap",
        "writing-mode",
        "x",
        "y",
        "z-index",
        "zoom"
      ].sort().reverse();
      function css(hljs) {
        const regex = hljs.regex;
        const modes = MODES(hljs);
        const VENDOR_PREFIX = { begin: /-(webkit|moz|ms|o)-(?=[a-z])/ };
        const AT_MODIFIERS = "and or not only";
        const AT_PROPERTY_RE = /@-?\w[\w]*(-\w+)*/;
        const IDENT_RE = "[a-zA-Z-][a-zA-Z0-9_-]*";
        const STRINGS = [
          hljs.APOS_STRING_MODE,
          hljs.QUOTE_STRING_MODE
        ];
        return {
          name: "CSS",
          case_insensitive: true,
          illegal: /[=|'\$]/,
          keywords: { keyframePosition: "from to" },
          classNameAliases: {
            // for visual continuity with `tag {}` and because we
            // don't have a great class for this?
            keyframePosition: "selector-tag"
          },
          contains: [
            modes.BLOCK_COMMENT,
            VENDOR_PREFIX,
            // to recognize keyframe 40% etc which are outside the scope of our
            // attribute value mode
            modes.CSS_NUMBER_MODE,
            {
              className: "selector-id",
              begin: /#[A-Za-z0-9_-]+/,
              relevance: 0
            },
            {
              className: "selector-class",
              begin: "\\." + IDENT_RE,
              relevance: 0
            },
            modes.ATTRIBUTE_SELECTOR_MODE,
            {
              className: "selector-pseudo",
              variants: [
                { begin: ":(" + PSEUDO_CLASSES.join("|") + ")" },
                { begin: ":(:)?(" + PSEUDO_ELEMENTS.join("|") + ")" }
              ]
            },
            // we may actually need this (12/2020)
            // { // pseudo-selector params
            //   begin: /\(/,
            //   end: /\)/,
            //   contains: [ hljs.CSS_NUMBER_MODE ]
            // },
            modes.CSS_VARIABLE,
            {
              className: "attribute",
              begin: "\\b(" + ATTRIBUTES.join("|") + ")\\b"
            },
            // attribute values
            {
              begin: /:/,
              end: /[;}{]/,
              contains: [
                modes.BLOCK_COMMENT,
                modes.HEXCOLOR,
                modes.IMPORTANT,
                modes.CSS_NUMBER_MODE,
                ...STRINGS,
                // needed to highlight these as strings and to avoid issues with
                // illegal characters that might be inside urls that would tigger the
                // languages illegal stack
                {
                  begin: /(url|data-uri)\(/,
                  end: /\)/,
                  relevance: 0,
                  // from keywords
                  keywords: { built_in: "url data-uri" },
                  contains: [
                    ...STRINGS,
                    {
                      className: "string",
                      // any character other than `)` as in `url()` will be the start
                      // of a string, which ends with `)` (from the parent mode)
                      begin: /[^)]/,
                      endsWithParent: true,
                      excludeEnd: true
                    }
                  ]
                },
                modes.FUNCTION_DISPATCH
              ]
            },
            {
              begin: regex.lookahead(/@/),
              end: "[{;]",
              relevance: 0,
              illegal: /:/,
              // break on Less variables @var: ...
              contains: [
                {
                  className: "keyword",
                  begin: AT_PROPERTY_RE
                },
                {
                  begin: /\s/,
                  endsWithParent: true,
                  excludeEnd: true,
                  relevance: 0,
                  keywords: {
                    $pattern: /[a-z-]+/,
                    keyword: AT_MODIFIERS,
                    attribute: MEDIA_FEATURES.join(" ")
                  },
                  contains: [
                    {
                      begin: /[a-z-]+(?=:)/,
                      className: "attribute"
                    },
                    ...STRINGS,
                    modes.CSS_NUMBER_MODE
                  ]
                }
              ]
            },
            {
              className: "selector-tag",
              begin: "\\b(" + TAGS.join("|") + ")\\b"
            }
          ]
        };
      }
      module.exports = css;
    }
  });

  // node_modules/highlight.js/lib/languages/markdown.js
  var require_markdown = __commonJS({
    "node_modules/highlight.js/lib/languages/markdown.js"(exports, module) {
      function markdown(hljs) {
        const regex = hljs.regex;
        const INLINE_HTML = {
          begin: /<\/?[A-Za-z_]/,
          end: ">",
          subLanguage: "xml",
          relevance: 0
        };
        const HORIZONTAL_RULE = {
          begin: "^[-\\*]{3,}",
          end: "$"
        };
        const CODE = {
          className: "code",
          variants: [
            // TODO: fix to allow these to work with sublanguage also
            { begin: "(`{3,})[^`](.|\\n)*?\\1`*[ ]*" },
            { begin: "(~{3,})[^~](.|\\n)*?\\1~*[ ]*" },
            // needed to allow markdown as a sublanguage to work
            {
              begin: "```",
              end: "```+[ ]*$"
            },
            {
              begin: "~~~",
              end: "~~~+[ ]*$"
            },
            { begin: "`.+?`" },
            {
              begin: "(?=^( {4}|\\t))",
              // use contains to gobble up multiple lines to allow the block to be whatever size
              // but only have a single open/close tag vs one per line
              contains: [
                {
                  begin: "^( {4}|\\t)",
                  end: "(\\n)$"
                }
              ],
              relevance: 0
            }
          ]
        };
        const LIST = {
          className: "bullet",
          begin: "^[ 	]*([*+-]|(\\d+\\.))(?=\\s+)",
          end: "\\s+",
          excludeEnd: true
        };
        const LINK_REFERENCE = {
          begin: /^\[[^\n]+\]:/,
          returnBegin: true,
          contains: [
            {
              className: "symbol",
              begin: /\[/,
              end: /\]/,
              excludeBegin: true,
              excludeEnd: true
            },
            {
              className: "link",
              begin: /:\s*/,
              end: /$/,
              excludeBegin: true
            }
          ]
        };
        const URL_SCHEME = /[A-Za-z][A-Za-z0-9+.-]*/;
        const LINK = {
          variants: [
            // too much like nested array access in so many languages
            // to have any real relevance
            {
              begin: /\[.+?\]\[.*?\]/,
              relevance: 0
            },
            // popular internet URLs
            {
              begin: /\[.+?\]\(((data|javascript|mailto):|(?:http|ftp)s?:\/\/).*?\)/,
              relevance: 2
            },
            {
              begin: regex.concat(/\[.+?\]\(/, URL_SCHEME, /:\/\/.*?\)/),
              relevance: 2
            },
            // relative urls
            {
              begin: /\[.+?\]\([./?&#].*?\)/,
              relevance: 1
            },
            // whatever else, lower relevance (might not be a link at all)
            {
              begin: /\[.*?\]\(.*?\)/,
              relevance: 0
            }
          ],
          returnBegin: true,
          contains: [
            {
              // empty strings for alt or link text
              match: /\[(?=\])/
            },
            {
              className: "string",
              relevance: 0,
              begin: "\\[",
              end: "\\]",
              excludeBegin: true,
              returnEnd: true
            },
            {
              className: "link",
              relevance: 0,
              begin: "\\]\\(",
              end: "\\)",
              excludeBegin: true,
              excludeEnd: true
            },
            {
              className: "symbol",
              relevance: 0,
              begin: "\\]\\[",
              end: "\\]",
              excludeBegin: true,
              excludeEnd: true
            }
          ]
        };
        const BOLD = {
          className: "strong",
          contains: [],
          // defined later
          variants: [
            {
              begin: /_{2}(?!\s)/,
              end: /_{2}/
            },
            {
              begin: /\*{2}(?!\s)/,
              end: /\*{2}/
            }
          ]
        };
        const ITALIC = {
          className: "emphasis",
          contains: [],
          // defined later
          variants: [
            {
              begin: /\*(?![*\s])/,
              end: /\*/
            },
            {
              begin: /_(?![_\s])/,
              end: /_/,
              relevance: 0
            }
          ]
        };
        const BOLD_WITHOUT_ITALIC = hljs.inherit(BOLD, { contains: [] });
        const ITALIC_WITHOUT_BOLD = hljs.inherit(ITALIC, { contains: [] });
        BOLD.contains.push(ITALIC_WITHOUT_BOLD);
        ITALIC.contains.push(BOLD_WITHOUT_ITALIC);
        let CONTAINABLE = [
          INLINE_HTML,
          LINK
        ];
        [
          BOLD,
          ITALIC,
          BOLD_WITHOUT_ITALIC,
          ITALIC_WITHOUT_BOLD
        ].forEach((m) => {
          m.contains = m.contains.concat(CONTAINABLE);
        });
        CONTAINABLE = CONTAINABLE.concat(BOLD, ITALIC);
        const HEADER = {
          className: "section",
          variants: [
            {
              begin: "^#{1,6}",
              end: "$",
              contains: CONTAINABLE
            },
            {
              begin: "(?=^.+?\\n[=-]{2,}$)",
              contains: [
                { begin: "^[=-]*$" },
                {
                  begin: "^",
                  end: "\\n",
                  contains: CONTAINABLE
                }
              ]
            }
          ]
        };
        const BLOCKQUOTE = {
          className: "quote",
          begin: "^>\\s+",
          contains: CONTAINABLE,
          end: "$"
        };
        const ENTITY = {
          //https://spec.commonmark.org/0.31.2/#entity-references
          scope: "literal",
          match: /&([a-zA-Z0-9]+|#[0-9]{1,7}|#[Xx][0-9a-fA-F]{1,6});/
        };
        return {
          name: "Markdown",
          aliases: [
            "md",
            "mkdown",
            "mkd"
          ],
          contains: [
            HEADER,
            INLINE_HTML,
            LIST,
            BOLD,
            ITALIC,
            BLOCKQUOTE,
            CODE,
            HORIZONTAL_RULE,
            LINK,
            LINK_REFERENCE,
            ENTITY
          ]
        };
      }
      module.exports = markdown;
    }
  });

  // node_modules/highlight.js/lib/languages/dart.js
  var require_dart = __commonJS({
    "node_modules/highlight.js/lib/languages/dart.js"(exports, module) {
      function dart(hljs) {
        const SUBST = {
          className: "subst",
          variants: [{ begin: "\\$[A-Za-z0-9_]+" }]
        };
        const BRACED_SUBST = {
          className: "subst",
          variants: [
            {
              begin: /\$\{/,
              end: /\}/
            }
          ],
          keywords: "true false null this is new super"
        };
        const NUMBER = {
          className: "number",
          relevance: 0,
          variants: [
            { match: /\b[0-9][0-9_]*(\.[0-9][0-9_]*)?([eE][+-]?[0-9][0-9_]*)?\b/ },
            { match: /\b0[xX][0-9A-Fa-f][0-9A-Fa-f_]*\b/ }
          ]
        };
        const STRING = {
          className: "string",
          variants: [
            {
              begin: "r'''",
              end: "'''"
            },
            {
              begin: 'r"""',
              end: '"""'
            },
            {
              begin: "r'",
              end: "'",
              illegal: "\\n"
            },
            {
              begin: 'r"',
              end: '"',
              illegal: "\\n"
            },
            {
              begin: "'''",
              end: "'''",
              contains: [
                hljs.BACKSLASH_ESCAPE,
                SUBST,
                BRACED_SUBST
              ]
            },
            {
              begin: '"""',
              end: '"""',
              contains: [
                hljs.BACKSLASH_ESCAPE,
                SUBST,
                BRACED_SUBST
              ]
            },
            {
              begin: "'",
              end: "'",
              illegal: "\\n",
              contains: [
                hljs.BACKSLASH_ESCAPE,
                SUBST,
                BRACED_SUBST
              ]
            },
            {
              begin: '"',
              end: '"',
              illegal: "\\n",
              contains: [
                hljs.BACKSLASH_ESCAPE,
                SUBST,
                BRACED_SUBST
              ]
            }
          ]
        };
        BRACED_SUBST.contains = [
          NUMBER,
          STRING
        ];
        const BUILT_IN_TYPES = [
          // dart:core
          "Comparable",
          "DateTime",
          "Duration",
          "Function",
          "Iterable",
          "Iterator",
          "List",
          "Map",
          "Match",
          "Object",
          "Pattern",
          "RegExp",
          "Set",
          "Stopwatch",
          "String",
          "StringBuffer",
          "StringSink",
          "Symbol",
          "Type",
          "Uri",
          "bool",
          "double",
          "int",
          "num",
          // dart:html
          "Element",
          "ElementList"
        ];
        const NULLABLE_BUILT_IN_TYPES = BUILT_IN_TYPES.map((e) => `${e}?`);
        const BASIC_KEYWORDS = [
          "abstract",
          "as",
          "assert",
          "async",
          "await",
          "base",
          "break",
          "case",
          "catch",
          "class",
          "const",
          "continue",
          "covariant",
          "default",
          "deferred",
          "do",
          "dynamic",
          "else",
          "enum",
          "export",
          "extends",
          "extension",
          "external",
          "factory",
          "false",
          "final",
          "finally",
          "for",
          "Function",
          "get",
          "hide",
          "if",
          "implements",
          "import",
          "in",
          "interface",
          "is",
          "late",
          "library",
          "mixin",
          "new",
          "null",
          "on",
          "operator",
          "part",
          "required",
          "rethrow",
          "return",
          "sealed",
          "set",
          "show",
          "static",
          "super",
          "switch",
          "sync",
          "this",
          "throw",
          "true",
          "try",
          "typedef",
          "var",
          "void",
          "when",
          "while",
          "with",
          "yield"
        ];
        const KEYWORDS = {
          keyword: BASIC_KEYWORDS,
          built_in: BUILT_IN_TYPES.concat(NULLABLE_BUILT_IN_TYPES).concat([
            // dart:core
            "Never",
            "Null",
            "dynamic",
            "print",
            // dart:html
            "document",
            "querySelector",
            "querySelectorAll",
            "window"
          ]),
          $pattern: /[A-Za-z][A-Za-z0-9_]*\??/
        };
        return {
          name: "Dart",
          keywords: KEYWORDS,
          contains: [
            STRING,
            hljs.COMMENT(
              /\/\*\*(?!\/)/,
              /\*\//,
              {
                subLanguage: "markdown",
                relevance: 0
              }
            ),
            hljs.COMMENT(
              /\/{3,} ?/,
              /$/,
              { contains: [
                {
                  subLanguage: "markdown",
                  begin: ".",
                  end: "$",
                  relevance: 0
                }
              ] }
            ),
            hljs.C_LINE_COMMENT_MODE,
            hljs.C_BLOCK_COMMENT_MODE,
            {
              className: "class",
              beginKeywords: "class interface",
              end: /\{/,
              excludeEnd: true,
              contains: [
                { beginKeywords: "extends implements" },
                hljs.UNDERSCORE_TITLE_MODE
              ]
            },
            NUMBER,
            {
              className: "meta",
              begin: "@[A-Za-z]+"
            },
            {
              begin: "=>"
              // No markup, just a relevance booster
            }
          ]
        };
      }
      module.exports = dart;
    }
  });

  // node_modules/highlight.js/lib/languages/diff.js
  var require_diff = __commonJS({
    "node_modules/highlight.js/lib/languages/diff.js"(exports, module) {
      function diff(hljs) {
        const regex = hljs.regex;
        return {
          name: "Diff",
          aliases: ["patch"],
          contains: [
            {
              className: "meta",
              relevance: 10,
              match: regex.either(
                /^@@ +-\d+,\d+ +\+\d+,\d+ +@@/,
                /^\*\*\* +\d+,\d+ +\*\*\*\*$/,
                /^--- +\d+,\d+ +----$/
              )
            },
            {
              className: "comment",
              variants: [
                {
                  begin: regex.either(
                    /Index: /,
                    /^index/,
                    /={3,}/,
                    /^-{3}/,
                    /^\*{3} /,
                    /^\+{3}/,
                    /^diff --git/
                  ),
                  end: /$/
                },
                { match: /^\*{15}$/ }
              ]
            },
            {
              className: "addition",
              begin: /^\+/,
              end: /$/
            },
            {
              className: "deletion",
              begin: /^-/,
              end: /$/
            },
            {
              className: "addition",
              begin: /^!/,
              end: /$/
            }
          ]
        };
      }
      module.exports = diff;
    }
  });

  // node_modules/highlight.js/lib/languages/dockerfile.js
  var require_dockerfile = __commonJS({
    "node_modules/highlight.js/lib/languages/dockerfile.js"(exports, module) {
      function dockerfile(hljs) {
        const KEYWORDS = [
          "from",
          "maintainer",
          "expose",
          "env",
          "arg",
          "user",
          "onbuild",
          "stopsignal"
        ];
        return {
          name: "Dockerfile",
          aliases: ["docker"],
          case_insensitive: true,
          keywords: KEYWORDS,
          contains: [
            hljs.HASH_COMMENT_MODE,
            hljs.APOS_STRING_MODE,
            hljs.QUOTE_STRING_MODE,
            hljs.NUMBER_MODE,
            {
              beginKeywords: "run cmd entrypoint volume add copy workdir label healthcheck shell",
              starts: {
                end: /[^\\]$/,
                subLanguage: "bash"
              }
            }
          ],
          illegal: "</"
        };
      }
      module.exports = dockerfile;
    }
  });

  // node_modules/highlight.js/lib/languages/elixir.js
  var require_elixir = __commonJS({
    "node_modules/highlight.js/lib/languages/elixir.js"(exports, module) {
      function elixir(hljs) {
        const regex = hljs.regex;
        const ELIXIR_IDENT_RE = "[a-zA-Z_][a-zA-Z0-9_.]*(!|\\?)?";
        const ELIXIR_METHOD_RE = "[a-zA-Z_]\\w*[!?=]?|[-+~]@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?";
        const KEYWORDS = [
          "after",
          "alias",
          "and",
          "case",
          "catch",
          "cond",
          "defstruct",
          "defguard",
          "do",
          "else",
          "end",
          "fn",
          "for",
          "if",
          "import",
          "in",
          "not",
          "or",
          "quote",
          "raise",
          "receive",
          "require",
          "reraise",
          "rescue",
          "try",
          "unless",
          "unquote",
          "unquote_splicing",
          "use",
          "when",
          "with|0"
        ];
        const LITERALS = [
          "false",
          "nil",
          "true"
        ];
        const KWS = {
          $pattern: ELIXIR_IDENT_RE,
          keyword: KEYWORDS,
          literal: LITERALS
        };
        const SUBST = {
          className: "subst",
          begin: /#\{/,
          end: /\}/,
          keywords: KWS
        };
        const NUMBER = {
          className: "number",
          begin: "(\\b0o[0-7_]+)|(\\b0b[01_]+)|(\\b0x[0-9a-fA-F_]+)|(-?\\b[0-9][0-9_]*(\\.[0-9_]+([eE][-+]?[0-9]+)?)?)",
          relevance: 0
        };
        const ESCAPES_RE = /\\[\s\S]/;
        const BACKSLASH_ESCAPE = {
          match: ESCAPES_RE,
          scope: "char.escape",
          relevance: 0
        };
        const SIGIL_DELIMITERS = `[/|([{<"']`;
        const SIGIL_DELIMITER_MODES = [
          {
            begin: /"/,
            end: /"/
          },
          {
            begin: /'/,
            end: /'/
          },
          {
            begin: /\//,
            end: /\//
          },
          {
            begin: /\|/,
            end: /\|/
          },
          {
            begin: /\(/,
            end: /\)/
          },
          {
            begin: /\[/,
            end: /\]/
          },
          {
            begin: /\{/,
            end: /\}/
          },
          {
            begin: /</,
            end: />/
          }
        ];
        const escapeSigilEnd = (end) => {
          return {
            scope: "char.escape",
            begin: regex.concat(/\\/, end),
            relevance: 0
          };
        };
        const LOWERCASE_SIGIL = {
          className: "string",
          begin: "~[a-z](?=" + SIGIL_DELIMITERS + ")",
          contains: SIGIL_DELIMITER_MODES.map((x) => hljs.inherit(
            x,
            { contains: [
              escapeSigilEnd(x.end),
              BACKSLASH_ESCAPE,
              SUBST
            ] }
          ))
        };
        const UPCASE_SIGIL = {
          className: "string",
          begin: "~[A-Z](?=" + SIGIL_DELIMITERS + ")",
          contains: SIGIL_DELIMITER_MODES.map((x) => hljs.inherit(
            x,
            { contains: [escapeSigilEnd(x.end)] }
          ))
        };
        const REGEX_SIGIL = {
          className: "regex",
          variants: [
            {
              begin: "~r(?=" + SIGIL_DELIMITERS + ")",
              contains: SIGIL_DELIMITER_MODES.map((x) => hljs.inherit(
                x,
                {
                  end: regex.concat(x.end, /[uismxfU]{0,7}/),
                  contains: [
                    escapeSigilEnd(x.end),
                    BACKSLASH_ESCAPE,
                    SUBST
                  ]
                }
              ))
            },
            {
              begin: "~R(?=" + SIGIL_DELIMITERS + ")",
              contains: SIGIL_DELIMITER_MODES.map(
                (x) => hljs.inherit(
                  x,
                  {
                    end: regex.concat(x.end, /[uismxfU]{0,7}/),
                    contains: [escapeSigilEnd(x.end)]
                  }
                )
              )
            }
          ]
        };
        const STRING = {
          className: "string",
          contains: [
            hljs.BACKSLASH_ESCAPE,
            SUBST
          ],
          variants: [
            {
              begin: /"""/,
              end: /"""/
            },
            {
              begin: /'''/,
              end: /'''/
            },
            {
              begin: /~S"""/,
              end: /"""/,
              contains: []
              // override default
            },
            {
              begin: /~S"/,
              end: /"/,
              contains: []
              // override default
            },
            {
              begin: /~S'''/,
              end: /'''/,
              contains: []
              // override default
            },
            {
              begin: /~S'/,
              end: /'/,
              contains: []
              // override default
            },
            {
              begin: /'/,
              end: /'/
            },
            {
              begin: /"/,
              end: /"/
            }
          ]
        };
        const FUNCTION = {
          className: "function",
          beginKeywords: "def defp defmacro defmacrop",
          end: /\B\b/,
          // the mode is ended by the title
          contains: [
            hljs.inherit(hljs.TITLE_MODE, {
              begin: ELIXIR_IDENT_RE,
              endsParent: true
            })
          ]
        };
        const CLASS = hljs.inherit(FUNCTION, {
          className: "class",
          beginKeywords: "defimpl defmodule defprotocol defrecord",
          end: /\bdo\b|$|;/
        });
        const ELIXIR_DEFAULT_CONTAINS = [
          STRING,
          REGEX_SIGIL,
          UPCASE_SIGIL,
          LOWERCASE_SIGIL,
          hljs.HASH_COMMENT_MODE,
          CLASS,
          FUNCTION,
          { begin: "::" },
          {
            className: "symbol",
            begin: ":(?![\\s:])",
            contains: [
              STRING,
              { begin: ELIXIR_METHOD_RE }
            ],
            relevance: 0
          },
          {
            className: "symbol",
            begin: ELIXIR_IDENT_RE + ":(?!:)",
            relevance: 0
          },
          {
            // Usage of a module, struct, etc.
            className: "title.class",
            begin: /(\b[A-Z][a-zA-Z0-9_]+)/,
            relevance: 0
          },
          NUMBER,
          {
            className: "variable",
            begin: "(\\$\\W)|((\\$|@@?)(\\w+))"
          }
          // -> has been removed, capnproto always uses this grammar construct
        ];
        SUBST.contains = ELIXIR_DEFAULT_CONTAINS;
        return {
          name: "Elixir",
          aliases: [
            "ex",
            "exs"
          ],
          keywords: KWS,
          contains: ELIXIR_DEFAULT_CONTAINS
        };
      }
      module.exports = elixir;
    }
  });

  // node_modules/highlight.js/lib/languages/elm.js
  var require_elm = __commonJS({
    "node_modules/highlight.js/lib/languages/elm.js"(exports, module) {
      function elm(hljs) {
        const COMMENT = { variants: [
          hljs.COMMENT("--", "$"),
          hljs.COMMENT(
            /\{-/,
            /-\}/,
            { contains: ["self"] }
          )
        ] };
        const CONSTRUCTOR = {
          className: "type",
          begin: "\\b[A-Z][\\w']*",
          // TODO: other constructors (built-in, infix).
          relevance: 0
        };
        const LIST = {
          begin: "\\(",
          end: "\\)",
          illegal: '"',
          contains: [
            {
              className: "type",
              begin: "\\b[A-Z][\\w]*(\\((\\.\\.|,|\\w+)\\))?"
            },
            COMMENT
          ]
        };
        const RECORD = {
          begin: /\{/,
          end: /\}/,
          contains: LIST.contains
        };
        const CHARACTER = {
          className: "string",
          begin: "'\\\\?.",
          end: "'",
          illegal: "."
        };
        const KEYWORDS = [
          "let",
          "in",
          "if",
          "then",
          "else",
          "case",
          "of",
          "where",
          "module",
          "import",
          "exposing",
          "type",
          "alias",
          "as",
          "infix",
          "infixl",
          "infixr",
          "port",
          "effect",
          "command",
          "subscription"
        ];
        return {
          name: "Elm",
          keywords: KEYWORDS,
          contains: [
            // Top-level constructions.
            {
              beginKeywords: "port effect module",
              end: "exposing",
              keywords: "port effect module where command subscription exposing",
              contains: [
                LIST,
                COMMENT
              ],
              illegal: "\\W\\.|;"
            },
            {
              begin: "import",
              end: "$",
              keywords: "import as exposing",
              contains: [
                LIST,
                COMMENT
              ],
              illegal: "\\W\\.|;"
            },
            {
              begin: "type",
              end: "$",
              keywords: "type alias",
              contains: [
                CONSTRUCTOR,
                LIST,
                RECORD,
                COMMENT
              ]
            },
            {
              beginKeywords: "infix infixl infixr",
              end: "$",
              contains: [
                hljs.C_NUMBER_MODE,
                COMMENT
              ]
            },
            {
              begin: "port",
              end: "$",
              keywords: "port",
              contains: [COMMENT]
            },
            // Literals and names.
            CHARACTER,
            hljs.QUOTE_STRING_MODE,
            hljs.C_NUMBER_MODE,
            CONSTRUCTOR,
            hljs.inherit(hljs.TITLE_MODE, { begin: "^[_a-z][\\w']*" }),
            COMMENT,
            {
              // No markup, relevance booster
              begin: "->|<-"
            }
          ],
          illegal: /;/
        };
      }
      module.exports = elm;
    }
  });

  // node_modules/highlight.js/lib/languages/ruby.js
  var require_ruby = __commonJS({
    "node_modules/highlight.js/lib/languages/ruby.js"(exports, module) {
      function ruby(hljs) {
        const regex = hljs.regex;
        const RUBY_METHOD_RE = "([a-zA-Z_]\\w*[!?=]?|[-+~]@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?)";
        const CLASS_NAME_RE = regex.either(
          /\b([A-Z]+[a-z0-9]+)+/,
          // ends in caps
          /\b([A-Z]+[a-z0-9]+)+[A-Z]+/
        );
        const CLASS_NAME_WITH_NAMESPACE_RE = regex.concat(CLASS_NAME_RE, /(::\w+)*/);
        const PSEUDO_KWS = [
          "include",
          "extend",
          "prepend",
          "public",
          "private",
          "protected",
          "raise",
          "throw"
        ];
        const RUBY_KEYWORDS = {
          "variable.constant": [
            "__FILE__",
            "__LINE__",
            "__ENCODING__"
          ],
          "variable.language": [
            "self",
            "super"
          ],
          keyword: [
            "alias",
            "and",
            "begin",
            "BEGIN",
            "break",
            "case",
            "class",
            "defined",
            "do",
            "else",
            "elsif",
            "end",
            "END",
            "ensure",
            "for",
            "if",
            "in",
            "module",
            "next",
            "not",
            "or",
            "redo",
            "require",
            "rescue",
            "retry",
            "return",
            "then",
            "undef",
            "unless",
            "until",
            "when",
            "while",
            "yield",
            ...PSEUDO_KWS
          ],
          built_in: [
            "proc",
            "lambda",
            "attr_accessor",
            "attr_reader",
            "attr_writer",
            "define_method",
            "private_constant",
            "module_function"
          ],
          literal: [
            "true",
            "false",
            "nil"
          ]
        };
        const YARDOCTAG = {
          className: "doctag",
          begin: "@[A-Za-z]+"
        };
        const IRB_OBJECT = {
          begin: "#<",
          end: ">"
        };
        const COMMENT_MODES = [
          hljs.COMMENT(
            "#",
            "$",
            { contains: [YARDOCTAG] }
          ),
          hljs.COMMENT(
            "^=begin",
            "^=end",
            {
              contains: [YARDOCTAG],
              relevance: 10
            }
          ),
          hljs.COMMENT("^__END__", hljs.MATCH_NOTHING_RE)
        ];
        const SUBST = {
          className: "subst",
          begin: /#\{/,
          end: /\}/,
          keywords: RUBY_KEYWORDS
        };
        const STRING = {
          className: "string",
          contains: [
            hljs.BACKSLASH_ESCAPE,
            SUBST
          ],
          variants: [
            {
              begin: /'/,
              end: /'/
            },
            {
              begin: /"/,
              end: /"/
            },
            {
              begin: /`/,
              end: /`/
            },
            {
              begin: /%[qQwWx]?\(/,
              end: /\)/
            },
            {
              begin: /%[qQwWx]?\[/,
              end: /\]/
            },
            {
              begin: /%[qQwWx]?\{/,
              end: /\}/
            },
            {
              begin: /%[qQwWx]?</,
              end: />/
            },
            {
              begin: /%[qQwWx]?\//,
              end: /\//
            },
            {
              begin: /%[qQwWx]?%/,
              end: /%/
            },
            {
              begin: /%[qQwWx]?-/,
              end: /-/
            },
            {
              begin: /%[qQwWx]?\|/,
              end: /\|/
            },
            // in the following expressions, \B in the beginning suppresses recognition of ?-sequences
            // where ? is the last character of a preceding identifier, as in: `func?4`
            { begin: /\B\?(\\\d{1,3})/ },
            { begin: /\B\?(\\x[A-Fa-f0-9]{1,2})/ },
            { begin: /\B\?(\\u\{?[A-Fa-f0-9]{1,6}\}?)/ },
            { begin: /\B\?(\\M-\\C-|\\M-\\c|\\c\\M-|\\M-|\\C-\\M-)[\x20-\x7e]/ },
            { begin: /\B\?\\(c|C-)[\x20-\x7e]/ },
            { begin: /\B\?\\?\S/ },
            // heredocs
            {
              // this guard makes sure that we have an entire heredoc and not a false
              // positive (auto-detect, etc.)
              begin: regex.concat(
                /<<[-~]?'?/,
                regex.lookahead(/(\w+)(?=\W)[^\n]*\n(?:[^\n]*\n)*?\s*\1\b/)
              ),
              contains: [
                hljs.END_SAME_AS_BEGIN({
                  begin: /(\w+)/,
                  end: /(\w+)/,
                  contains: [
                    hljs.BACKSLASH_ESCAPE,
                    SUBST
                  ]
                })
              ]
            }
          ]
        };
        const decimal = "[1-9](_?[0-9])*|0";
        const digits = "[0-9](_?[0-9])*";
        const NUMBER = {
          className: "number",
          relevance: 0,
          variants: [
            // decimal integer/float, optionally exponential or rational, optionally imaginary
            { begin: `\\b(${decimal})(\\.(${digits}))?([eE][+-]?(${digits})|r)?i?\\b` },
            // explicit decimal/binary/octal/hexadecimal integer,
            // optionally rational and/or imaginary
            { begin: "\\b0[dD][0-9](_?[0-9])*r?i?\\b" },
            { begin: "\\b0[bB][0-1](_?[0-1])*r?i?\\b" },
            { begin: "\\b0[oO][0-7](_?[0-7])*r?i?\\b" },
            { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*r?i?\\b" },
            // 0-prefixed implicit octal integer, optionally rational and/or imaginary
            { begin: "\\b0(_?[0-7])+r?i?\\b" }
          ]
        };
        const PARAMS = {
          variants: [
            {
              match: /\(\)/
            },
            {
              className: "params",
              begin: /\(/,
              end: /(?=\))/,
              excludeBegin: true,
              endsParent: true,
              keywords: RUBY_KEYWORDS
            }
          ]
        };
        const INCLUDE_EXTEND = {
          match: [
            /(include|extend)\s+/,
            CLASS_NAME_WITH_NAMESPACE_RE
          ],
          scope: {
            2: "title.class"
          },
          keywords: RUBY_KEYWORDS
        };
        const CLASS_DEFINITION = {
          variants: [
            {
              match: [
                /class\s+/,
                CLASS_NAME_WITH_NAMESPACE_RE,
                /\s+<\s+/,
                CLASS_NAME_WITH_NAMESPACE_RE
              ]
            },
            {
              match: [
                /\b(class|module)\s+/,
                CLASS_NAME_WITH_NAMESPACE_RE
              ]
            }
          ],
          scope: {
            2: "title.class",
            4: "title.class.inherited"
          },
          keywords: RUBY_KEYWORDS
        };
        const UPPER_CASE_CONSTANT = {
          relevance: 0,
          match: /\b[A-Z][A-Z_0-9]+\b/,
          className: "variable.constant"
        };
        const METHOD_DEFINITION = {
          match: [
            /def/,
            /\s+/,
            RUBY_METHOD_RE
          ],
          scope: {
            1: "keyword",
            3: "title.function"
          },
          contains: [
            PARAMS
          ]
        };
        const OBJECT_CREATION = {
          relevance: 0,
          match: [
            CLASS_NAME_WITH_NAMESPACE_RE,
            /\.new[. (]/
          ],
          scope: {
            1: "title.class"
          }
        };
        const CLASS_REFERENCE = {
          relevance: 0,
          match: CLASS_NAME_RE,
          scope: "title.class"
        };
        const RUBY_DEFAULT_CONTAINS = [
          STRING,
          CLASS_DEFINITION,
          INCLUDE_EXTEND,
          OBJECT_CREATION,
          UPPER_CASE_CONSTANT,
          CLASS_REFERENCE,
          METHOD_DEFINITION,
          {
            // swallow namespace qualifiers before symbols
            begin: hljs.IDENT_RE + "::"
          },
          {
            className: "symbol",
            begin: hljs.UNDERSCORE_IDENT_RE + "(!|\\?)?:",
            relevance: 0
          },
          {
            className: "symbol",
            begin: ":(?!\\s)",
            contains: [
              STRING,
              { begin: RUBY_METHOD_RE }
            ],
            relevance: 0
          },
          NUMBER,
          {
            // negative-look forward attempts to prevent false matches like:
            // @ident@ or $ident$ that might indicate this is not ruby at all
            className: "variable",
            begin: `(\\$\\W)|((\\$|@@?)(\\w+))(?=[^@$?])(?![A-Za-z])(?![@$?'])`
          },
          {
            className: "params",
            begin: /\|(?!=)/,
            end: /\|/,
            excludeBegin: true,
            excludeEnd: true,
            relevance: 0,
            // this could be a lot of things (in other languages) other than params
            keywords: RUBY_KEYWORDS
          },
          {
            // regexp container
            begin: "(" + hljs.RE_STARTERS_RE + "|unless)\\s*",
            keywords: "unless",
            contains: [
              {
                className: "regexp",
                contains: [
                  hljs.BACKSLASH_ESCAPE,
                  SUBST
                ],
                illegal: /\n/,
                variants: [
                  {
                    begin: "/",
                    end: "/[a-z]*"
                  },
                  {
                    begin: /%r\{/,
                    end: /\}[a-z]*/
                  },
                  {
                    begin: "%r\\(",
                    end: "\\)[a-z]*"
                  },
                  {
                    begin: "%r!",
                    end: "![a-z]*"
                  },
                  {
                    begin: "%r\\[",
                    end: "\\][a-z]*"
                  }
                ]
              }
            ].concat(IRB_OBJECT, COMMENT_MODES),
            relevance: 0
          }
        ].concat(IRB_OBJECT, COMMENT_MODES);
        SUBST.contains = RUBY_DEFAULT_CONTAINS;
        PARAMS.contains = RUBY_DEFAULT_CONTAINS;
        const SIMPLE_PROMPT = "[>?]>";
        const DEFAULT_PROMPT = "[\\w#]+\\(\\w+\\):\\d+:\\d+[>*]";
        const RVM_PROMPT = "(\\w+-)?\\d+\\.\\d+\\.\\d+(p\\d+)?[^\\d][^>]+>";
        const IRB_DEFAULT = [
          {
            begin: /^\s*=>/,
            starts: {
              end: "$",
              contains: RUBY_DEFAULT_CONTAINS
            }
          },
          {
            className: "meta.prompt",
            begin: "^(" + SIMPLE_PROMPT + "|" + DEFAULT_PROMPT + "|" + RVM_PROMPT + ")(?=[ ])",
            starts: {
              end: "$",
              keywords: RUBY_KEYWORDS,
              contains: RUBY_DEFAULT_CONTAINS
            }
          }
        ];
        COMMENT_MODES.unshift(IRB_OBJECT);
        return {
          name: "Ruby",
          aliases: [
            "rb",
            "gemspec",
            "podspec",
            "thor",
            "irb"
          ],
          keywords: RUBY_KEYWORDS,
          illegal: /\/\*/,
          contains: [hljs.SHEBANG({ binary: "ruby" })].concat(IRB_DEFAULT).concat(COMMENT_MODES).concat(RUBY_DEFAULT_CONTAINS)
        };
      }
      module.exports = ruby;
    }
  });

  // node_modules/highlight.js/lib/languages/erlang.js
  var require_erlang = __commonJS({
    "node_modules/highlight.js/lib/languages/erlang.js"(exports, module) {
      function erlang(hljs) {
        const BASIC_ATOM_RE = "[a-z'][a-zA-Z0-9_']*";
        const FUNCTION_NAME_RE = "(" + BASIC_ATOM_RE + ":" + BASIC_ATOM_RE + "|" + BASIC_ATOM_RE + ")";
        const ERLANG_RESERVED = {
          keyword: "after and andalso|10 band begin bnot bor bsl bzr bxor case catch cond div end fun if let not of orelse|10 query receive rem try when xor maybe else",
          literal: "false true"
        };
        const COMMENT = hljs.COMMENT("%", "$");
        const NUMBER = {
          className: "number",
          begin: "\\b(\\d+(_\\d+)*#[a-fA-F0-9]+(_[a-fA-F0-9]+)*|\\d+(_\\d+)*(\\.\\d+(_\\d+)*)?([eE][-+]?\\d+)?)",
          relevance: 0
        };
        const NAMED_FUN = { begin: "fun\\s+" + BASIC_ATOM_RE + "/\\d+" };
        const FUNCTION_CALL = {
          begin: FUNCTION_NAME_RE + "\\(",
          end: "\\)",
          returnBegin: true,
          relevance: 0,
          contains: [
            {
              begin: FUNCTION_NAME_RE,
              relevance: 0
            },
            {
              begin: "\\(",
              end: "\\)",
              endsWithParent: true,
              returnEnd: true,
              relevance: 0
              // "contains" defined later
            }
          ]
        };
        const TUPLE = {
          begin: /\{/,
          end: /\}/,
          relevance: 0
          // "contains" defined later
        };
        const VAR1 = {
          begin: "\\b_([A-Z][A-Za-z0-9_]*)?",
          relevance: 0
        };
        const VAR2 = {
          begin: "[A-Z][a-zA-Z0-9_]*",
          relevance: 0
        };
        const RECORD_ACCESS = {
          begin: "#" + hljs.UNDERSCORE_IDENT_RE,
          relevance: 0,
          returnBegin: true,
          contains: [
            {
              begin: "#" + hljs.UNDERSCORE_IDENT_RE,
              relevance: 0
            },
            {
              begin: /\{/,
              end: /\}/,
              relevance: 0
              // "contains" defined later
            }
          ]
        };
        const CHAR_LITERAL = {
          scope: "string",
          match: /\$(\\([^0-9]|[0-9]{1,3}|)|.)/
        };
        const TRIPLE_QUOTE = {
          scope: "string",
          match: /"""("*)(?!")[\s\S]*?"""\1/
        };
        const SIGIL = {
          scope: "string",
          contains: [hljs.BACKSLASH_ESCAPE],
          variants: [
            { match: /~\w?"""("*)(?!")[\s\S]*?"""\1/ },
            { begin: /~\w?\(/, end: /\)/ },
            { begin: /~\w?\[/, end: /\]/ },
            { begin: /~\w?{/, end: /}/ },
            { begin: /~\w?</, end: />/ },
            { begin: /~\w?\//, end: /\// },
            { begin: /~\w?\|/, end: /\|/ },
            { begin: /~\w?'/, end: /'/ },
            { begin: /~\w?"/, end: /"/ },
            { begin: /~\w?`/, end: /`/ },
            { begin: /~\w?#/, end: /#/ }
          ]
        };
        const BLOCK_STATEMENTS = {
          beginKeywords: "fun receive if try case maybe",
          end: "end",
          keywords: ERLANG_RESERVED
        };
        BLOCK_STATEMENTS.contains = [
          COMMENT,
          NAMED_FUN,
          hljs.inherit(hljs.APOS_STRING_MODE, { className: "" }),
          BLOCK_STATEMENTS,
          FUNCTION_CALL,
          SIGIL,
          TRIPLE_QUOTE,
          hljs.QUOTE_STRING_MODE,
          NUMBER,
          TUPLE,
          VAR1,
          VAR2,
          RECORD_ACCESS,
          CHAR_LITERAL
        ];
        const BASIC_MODES = [
          COMMENT,
          NAMED_FUN,
          BLOCK_STATEMENTS,
          FUNCTION_CALL,
          SIGIL,
          TRIPLE_QUOTE,
          hljs.QUOTE_STRING_MODE,
          NUMBER,
          TUPLE,
          VAR1,
          VAR2,
          RECORD_ACCESS,
          CHAR_LITERAL
        ];
        FUNCTION_CALL.contains[1].contains = BASIC_MODES;
        TUPLE.contains = BASIC_MODES;
        RECORD_ACCESS.contains[1].contains = BASIC_MODES;
        const DIRECTIVES = [
          "-module",
          "-record",
          "-undef",
          "-export",
          "-ifdef",
          "-ifndef",
          "-author",
          "-copyright",
          "-doc",
          "-moduledoc",
          "-vsn",
          "-import",
          "-include",
          "-include_lib",
          "-compile",
          "-define",
          "-else",
          "-endif",
          "-file",
          "-behaviour",
          "-behavior",
          "-spec",
          "-on_load",
          "-nifs"
        ];
        const PARAMS = {
          className: "params",
          begin: "\\(",
          end: "\\)",
          contains: BASIC_MODES
        };
        return {
          name: "Erlang",
          aliases: ["erl"],
          keywords: ERLANG_RESERVED,
          illegal: "(</|\\*=|\\+=|-=|/\\*|\\*/|\\(\\*|\\*\\))",
          contains: [
            {
              className: "function",
              begin: "^" + BASIC_ATOM_RE + "\\s*\\(",
              end: "->",
              returnBegin: true,
              illegal: "\\(|#|//|/\\*|\\\\|:|;",
              contains: [
                PARAMS,
                hljs.inherit(hljs.TITLE_MODE, { begin: BASIC_ATOM_RE })
              ],
              starts: {
                end: ";|\\.",
                keywords: ERLANG_RESERVED,
                contains: BASIC_MODES
              }
            },
            COMMENT,
            {
              begin: "^-",
              end: "\\.",
              relevance: 0,
              excludeEnd: true,
              returnBegin: true,
              keywords: {
                $pattern: "-" + hljs.IDENT_RE,
                keyword: DIRECTIVES.map((x) => `${x}|1.5`).join(" ")
              },
              contains: [
                PARAMS,
                SIGIL,
                TRIPLE_QUOTE,
                hljs.QUOTE_STRING_MODE
              ]
            },
            NUMBER,
            SIGIL,
            TRIPLE_QUOTE,
            hljs.QUOTE_STRING_MODE,
            RECORD_ACCESS,
            VAR1,
            VAR2,
            TUPLE,
            CHAR_LITERAL,
            { begin: /\.$/ }
            // relevance booster
          ]
        };
      }
      module.exports = erlang;
    }
  });

  // node_modules/highlight.js/lib/languages/fsharp.js
  var require_fsharp = __commonJS({
    "node_modules/highlight.js/lib/languages/fsharp.js"(exports, module) {
      function escape(value) {
        return new RegExp(value.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "m");
      }
      function source(re) {
        if (!re) return null;
        if (typeof re === "string") return re;
        return re.source;
      }
      function lookahead(re) {
        return concat("(?=", re, ")");
      }
      function concat(...args) {
        const joined = args.map((x) => source(x)).join("");
        return joined;
      }
      function stripOptionsFromArgs(args) {
        const opts = args[args.length - 1];
        if (typeof opts === "object" && opts.constructor === Object) {
          args.splice(args.length - 1, 1);
          return opts;
        } else {
          return {};
        }
      }
      function either(...args) {
        const opts = stripOptionsFromArgs(args);
        const joined = "(" + (opts.capture ? "" : "?:") + args.map((x) => source(x)).join("|") + ")";
        return joined;
      }
      function fsharp(hljs) {
        const KEYWORDS = [
          "abstract",
          "and",
          "as",
          "assert",
          "base",
          "begin",
          "class",
          "default",
          "delegate",
          "do",
          "done",
          "downcast",
          "downto",
          "elif",
          "else",
          "end",
          "exception",
          "extern",
          // "false", // literal
          "finally",
          "fixed",
          "for",
          "fun",
          "function",
          "global",
          "if",
          "in",
          "inherit",
          "inline",
          "interface",
          "internal",
          "lazy",
          "let",
          "match",
          "member",
          "module",
          "mutable",
          "namespace",
          "new",
          // "not", // built_in
          // "null", // literal
          "of",
          "open",
          "or",
          "override",
          "private",
          "public",
          "rec",
          "return",
          "static",
          "struct",
          "then",
          "to",
          // "true", // literal
          "try",
          "type",
          "upcast",
          "use",
          "val",
          "void",
          "when",
          "while",
          "with",
          "yield"
        ];
        const BANG_KEYWORD_MODE = {
          // monad builder keywords (matches before non-bang keywords)
          scope: "keyword",
          match: /\b(yield|return|let|do|match|use)!/
        };
        const PREPROCESSOR_KEYWORDS = [
          "if",
          "else",
          "endif",
          "line",
          "nowarn",
          "light",
          "r",
          "i",
          "I",
          "load",
          "time",
          "help",
          "quit"
        ];
        const LITERALS = [
          "true",
          "false",
          "null",
          "Some",
          "None",
          "Ok",
          "Error",
          "infinity",
          "infinityf",
          "nan",
          "nanf"
        ];
        const SPECIAL_IDENTIFIERS = [
          "__LINE__",
          "__SOURCE_DIRECTORY__",
          "__SOURCE_FILE__"
        ];
        const KNOWN_TYPES = [
          // basic types
          "bool",
          "byte",
          "sbyte",
          "int8",
          "int16",
          "int32",
          "uint8",
          "uint16",
          "uint32",
          "int",
          "uint",
          "int64",
          "uint64",
          "nativeint",
          "unativeint",
          "decimal",
          "float",
          "double",
          "float32",
          "single",
          "char",
          "string",
          "unit",
          "bigint",
          // other native types or lowercase aliases
          "option",
          "voption",
          "list",
          "array",
          "seq",
          "byref",
          "exn",
          "inref",
          "nativeptr",
          "obj",
          "outref",
          "voidptr",
          // other important FSharp types
          "Result"
        ];
        const BUILTINS = [
          // Somewhat arbitrary list of builtin functions and values.
          // Most of them are declared in Microsoft.FSharp.Core
          // I tried to stay relevant by adding only the most idiomatic
          // and most used symbols that are not already declared as types.
          "not",
          "ref",
          "raise",
          "reraise",
          "dict",
          "readOnlyDict",
          "set",
          "get",
          "enum",
          "sizeof",
          "typeof",
          "typedefof",
          "nameof",
          "nullArg",
          "invalidArg",
          "invalidOp",
          "id",
          "fst",
          "snd",
          "ignore",
          "lock",
          "using",
          "box",
          "unbox",
          "tryUnbox",
          "printf",
          "printfn",
          "sprintf",
          "eprintf",
          "eprintfn",
          "fprintf",
          "fprintfn",
          "failwith",
          "failwithf"
        ];
        const ALL_KEYWORDS = {
          keyword: KEYWORDS,
          literal: LITERALS,
          built_in: BUILTINS,
          "variable.constant": SPECIAL_IDENTIFIERS
        };
        const ML_COMMENT = hljs.COMMENT(/\(\*(?!\))/, /\*\)/, {
          contains: ["self"]
        });
        const COMMENT = {
          variants: [
            ML_COMMENT,
            hljs.C_LINE_COMMENT_MODE
          ]
        };
        const IDENTIFIER_RE = /[a-zA-Z_](\w|')*/;
        const QUOTED_IDENTIFIER = {
          scope: "variable",
          begin: /``/,
          end: /``/
        };
        const BEGIN_GENERIC_TYPE_SYMBOL_RE = /\B('|\^)/;
        const GENERIC_TYPE_SYMBOL = {
          scope: "symbol",
          variants: [
            // the type name is a quoted identifier:
            { match: concat(BEGIN_GENERIC_TYPE_SYMBOL_RE, /``.*?``/) },
            // the type name is a normal identifier (we don't use IDENTIFIER_RE because there cannot be another apostrophe here):
            { match: concat(BEGIN_GENERIC_TYPE_SYMBOL_RE, hljs.UNDERSCORE_IDENT_RE) }
          ],
          relevance: 0
        };
        const makeOperatorMode = function({ includeEqual }) {
          let allOperatorChars;
          if (includeEqual)
            allOperatorChars = "!%&*+-/<=>@^|~?";
          else
            allOperatorChars = "!%&*+-/<>@^|~?";
          const OPERATOR_CHARS = Array.from(allOperatorChars);
          const OPERATOR_CHAR_RE = concat("[", ...OPERATOR_CHARS.map(escape), "]");
          const OPERATOR_CHAR_OR_DOT_RE = either(OPERATOR_CHAR_RE, /\./);
          const OPERATOR_FIRST_CHAR_OF_MULTIPLE_RE = concat(OPERATOR_CHAR_OR_DOT_RE, lookahead(OPERATOR_CHAR_OR_DOT_RE));
          const SYMBOLIC_OPERATOR_RE = either(
            concat(OPERATOR_FIRST_CHAR_OF_MULTIPLE_RE, OPERATOR_CHAR_OR_DOT_RE, "*"),
            // Matches at least 2 chars operators
            concat(OPERATOR_CHAR_RE, "+")
            // Matches at least one char operators
          );
          return {
            scope: "operator",
            match: either(
              // symbolic operators:
              SYMBOLIC_OPERATOR_RE,
              // other symbolic keywords:
              // Type casting and conversion operators:
              /:\?>/,
              /:\?/,
              /:>/,
              /:=/,
              // Reference cell assignment
              /::?/,
              // : or ::
              /\$/
            ),
            // A single $ can be used as an operator
            relevance: 0
          };
        };
        const OPERATOR = makeOperatorMode({ includeEqual: true });
        const OPERATOR_WITHOUT_EQUAL = makeOperatorMode({ includeEqual: false });
        const makeTypeAnnotationMode = function(prefix, prefixScope) {
          return {
            begin: concat(
              // a type annotation is a
              prefix,
              // should be a colon or the 'of' keyword
              lookahead(
                // that has to be followed by
                concat(
                  /\s*/,
                  // optional space
                  either(
                    // then either of:
                    /\w/,
                    // word
                    /'/,
                    // generic type name
                    /\^/,
                    // generic type name
                    /#/,
                    // flexible type name
                    /``/,
                    // quoted type name
                    /\(/,
                    // parens type expression
                    /{\|/
                    // anonymous type annotation
                  )
                )
              )
            ),
            beginScope: prefixScope,
            // BUG: because ending with \n is necessary for some cases, multi-line type annotations are not properly supported.
            // Examples where \n is required at the end:
            // - abstract member definitions in classes: abstract Property : int * string
            // - return type annotations: let f f' = f' () : returnTypeAnnotation
            // - record fields definitions: { A : int \n B : string }
            end: lookahead(
              either(
                /\n/,
                /=/
              )
            ),
            relevance: 0,
            // we need the known types, and we need the type constraint keywords and literals. e.g.: when 'a : null
            keywords: hljs.inherit(ALL_KEYWORDS, { type: KNOWN_TYPES }),
            contains: [
              COMMENT,
              GENERIC_TYPE_SYMBOL,
              hljs.inherit(QUOTED_IDENTIFIER, { scope: null }),
              // match to avoid strange patterns inside that may break the parsing
              OPERATOR_WITHOUT_EQUAL
            ]
          };
        };
        const TYPE_ANNOTATION = makeTypeAnnotationMode(/:/, "operator");
        const DISCRIMINATED_UNION_TYPE_ANNOTATION = makeTypeAnnotationMode(/\bof\b/, "keyword");
        const TYPE_DECLARATION = {
          begin: [
            /(^|\s+)/,
            // prevents matching the following: `match s.stype with`
            /type/,
            /\s+/,
            IDENTIFIER_RE
          ],
          beginScope: {
            2: "keyword",
            4: "title.class"
          },
          end: lookahead(/\(|=|$/),
          keywords: ALL_KEYWORDS,
          // match keywords in type constraints. e.g.: when 'a : null
          contains: [
            COMMENT,
            hljs.inherit(QUOTED_IDENTIFIER, { scope: null }),
            // match to avoid strange patterns inside that may break the parsing
            GENERIC_TYPE_SYMBOL,
            {
              // For visual consistency, highlight type brackets as operators.
              scope: "operator",
              match: /<|>/
            },
            TYPE_ANNOTATION
            // generic types can have constraints, which are type annotations. e.g. type MyType<'T when 'T : delegate<obj * string>> =
          ]
        };
        const COMPUTATION_EXPRESSION = {
          // computation expressions:
          scope: "computation-expression",
          // BUG: might conflict with record deconstruction. e.g. let f { Name = name } = name // will highlight f
          match: /\b[_a-z]\w*(?=\s*\{)/
        };
        const PREPROCESSOR = {
          // preprocessor directives and fsi commands:
          begin: [
            /^\s*/,
            concat(/#/, either(...PREPROCESSOR_KEYWORDS)),
            /\b/
          ],
          beginScope: { 2: "meta" },
          end: lookahead(/\s|$/)
        };
        const NUMBER = {
          variants: [
            hljs.BINARY_NUMBER_MODE,
            hljs.C_NUMBER_MODE
          ]
        };
        const QUOTED_STRING = {
          scope: "string",
          begin: /"/,
          end: /"/,
          contains: [
            hljs.BACKSLASH_ESCAPE
          ]
        };
        const VERBATIM_STRING = {
          scope: "string",
          begin: /@"/,
          end: /"/,
          contains: [
            {
              match: /""/
              // escaped "
            },
            hljs.BACKSLASH_ESCAPE
          ]
        };
        const TRIPLE_QUOTED_STRING = {
          scope: "string",
          begin: /"""/,
          end: /"""/,
          relevance: 2
        };
        const SUBST = {
          scope: "subst",
          begin: /\{/,
          end: /\}/,
          keywords: ALL_KEYWORDS
        };
        const INTERPOLATED_STRING = {
          scope: "string",
          begin: /\$"/,
          end: /"/,
          contains: [
            {
              match: /\{\{/
              // escaped {
            },
            {
              match: /\}\}/
              // escaped }
            },
            hljs.BACKSLASH_ESCAPE,
            SUBST
          ]
        };
        const INTERPOLATED_VERBATIM_STRING = {
          scope: "string",
          begin: /(\$@|@\$)"/,
          end: /"/,
          contains: [
            {
              match: /\{\{/
              // escaped {
            },
            {
              match: /\}\}/
              // escaped }
            },
            {
              match: /""/
            },
            hljs.BACKSLASH_ESCAPE,
            SUBST
          ]
        };
        const INTERPOLATED_TRIPLE_QUOTED_STRING = {
          scope: "string",
          begin: /\$"""/,
          end: /"""/,
          contains: [
            {
              match: /\{\{/
              // escaped {
            },
            {
              match: /\}\}/
              // escaped }
            },
            SUBST
          ],
          relevance: 2
        };
        const CHAR_LITERAL = {
          scope: "string",
          match: concat(
            /'/,
            either(
              /[^\\']/,
              // either a single non escaped char...
              /\\(?:.|\d{3}|x[a-fA-F\d]{2}|u[a-fA-F\d]{4}|U[a-fA-F\d]{8})/
              // ...or an escape sequence
            ),
            /'/
          )
        };
        SUBST.contains = [
          INTERPOLATED_VERBATIM_STRING,
          INTERPOLATED_STRING,
          VERBATIM_STRING,
          QUOTED_STRING,
          CHAR_LITERAL,
          BANG_KEYWORD_MODE,
          COMMENT,
          QUOTED_IDENTIFIER,
          TYPE_ANNOTATION,
          COMPUTATION_EXPRESSION,
          PREPROCESSOR,
          NUMBER,
          GENERIC_TYPE_SYMBOL,
          OPERATOR
        ];
        const STRING = {
          variants: [
            INTERPOLATED_TRIPLE_QUOTED_STRING,
            INTERPOLATED_VERBATIM_STRING,
            INTERPOLATED_STRING,
            TRIPLE_QUOTED_STRING,
            VERBATIM_STRING,
            QUOTED_STRING,
            CHAR_LITERAL
          ]
        };
        return {
          name: "F#",
          aliases: [
            "fs",
            "f#"
          ],
          keywords: ALL_KEYWORDS,
          illegal: /\/\*/,
          classNameAliases: {
            "computation-expression": "keyword"
          },
          contains: [
            BANG_KEYWORD_MODE,
            STRING,
            COMMENT,
            QUOTED_IDENTIFIER,
            TYPE_DECLARATION,
            {
              // e.g. [<Attributes("")>] or [<``module``: MyCustomAttributeThatWorksOnModules>]
              // or [<Sealed; NoEquality; NoComparison; CompiledName("FSharpAsync`1")>]
              scope: "meta",
              begin: /\[</,
              end: />\]/,
              relevance: 2,
              contains: [
                QUOTED_IDENTIFIER,
                // can contain any constant value
                TRIPLE_QUOTED_STRING,
                VERBATIM_STRING,
                QUOTED_STRING,
                CHAR_LITERAL,
                NUMBER
              ]
            },
            DISCRIMINATED_UNION_TYPE_ANNOTATION,
            TYPE_ANNOTATION,
            COMPUTATION_EXPRESSION,
            PREPROCESSOR,
            NUMBER,
            GENERIC_TYPE_SYMBOL,
            OPERATOR
          ]
        };
      }
      module.exports = fsharp;
    }
  });

  // node_modules/highlight.js/lib/languages/go.js
  var require_go = __commonJS({
    "node_modules/highlight.js/lib/languages/go.js"(exports, module) {
      function go(hljs) {
        const LITERALS = [
          "true",
          "false",
          "iota",
          "nil"
        ];
        const BUILT_INS = [
          "append",
          "cap",
          "close",
          "complex",
          "copy",
          "imag",
          "len",
          "make",
          "new",
          "panic",
          "print",
          "println",
          "real",
          "recover",
          "delete"
        ];
        const TYPES = [
          "bool",
          "byte",
          "complex64",
          "complex128",
          "error",
          "float32",
          "float64",
          "int8",
          "int16",
          "int32",
          "int64",
          "string",
          "uint8",
          "uint16",
          "uint32",
          "uint64",
          "int",
          "uint",
          "uintptr",
          "rune"
        ];
        const KWS = [
          "break",
          "case",
          "chan",
          "const",
          "continue",
          "default",
          "defer",
          "else",
          "fallthrough",
          "for",
          "func",
          "go",
          "goto",
          "if",
          "import",
          "interface",
          "map",
          "package",
          "range",
          "return",
          "select",
          "struct",
          "switch",
          "type",
          "var"
        ];
        const KEYWORDS = {
          keyword: KWS,
          type: TYPES,
          literal: LITERALS,
          built_in: BUILT_INS
        };
        return {
          name: "Go",
          aliases: ["golang"],
          keywords: KEYWORDS,
          illegal: "</",
          contains: [
            hljs.C_LINE_COMMENT_MODE,
            hljs.C_BLOCK_COMMENT_MODE,
            {
              className: "string",
              variants: [
                hljs.QUOTE_STRING_MODE,
                hljs.APOS_STRING_MODE,
                {
                  begin: "`",
                  end: "`"
                }
              ]
            },
            {
              className: "number",
              variants: [
                {
                  match: /-?\b0[xX]\.[a-fA-F0-9](_?[a-fA-F0-9])*[pP][+-]?\d(_?\d)*i?/,
                  // hex without a present digit before . (making a digit afterwards required)
                  relevance: 0
                },
                {
                  match: /-?\b0[xX](_?[a-fA-F0-9])+((\.([a-fA-F0-9](_?[a-fA-F0-9])*)?)?[pP][+-]?\d(_?\d)*)?i?/,
                  // hex with a present digit before . (making a digit afterwards optional)
                  relevance: 0
                },
                {
                  match: /-?\b0[oO](_?[0-7])*i?/,
                  // leading 0o octal
                  relevance: 0
                },
                {
                  match: /-?\.\d(_?\d)*([eE][+-]?\d(_?\d)*)?i?/,
                  // decimal without a present digit before . (making a digit afterwards required)
                  relevance: 0
                },
                {
                  match: /-?\b\d(_?\d)*(\.(\d(_?\d)*)?)?([eE][+-]?\d(_?\d)*)?i?/,
                  // decimal with a present digit before . (making a digit afterwards optional)
                  relevance: 0
                }
              ]
            },
            {
              begin: /:=/
              // relevance booster
            },
            {
              className: "function",
              beginKeywords: "func",
              end: "\\s*(\\{|$)",
              excludeEnd: true,
              contains: [
                hljs.TITLE_MODE,
                {
                  className: "params",
                  begin: /\(/,
                  end: /\)/,
                  endsParent: true,
                  keywords: KEYWORDS,
                  illegal: /["']/
                }
              ]
            }
          ]
        };
      }
      module.exports = go;
    }
  });

  // node_modules/highlight.js/lib/languages/gradle.js
  var require_gradle = __commonJS({
    "node_modules/highlight.js/lib/languages/gradle.js"(exports, module) {
      function gradle(hljs) {
        const KEYWORDS = [
          "task",
          "project",
          "allprojects",
          "subprojects",
          "artifacts",
          "buildscript",
          "configurations",
          "dependencies",
          "repositories",
          "sourceSets",
          "description",
          "delete",
          "from",
          "into",
          "include",
          "exclude",
          "source",
          "classpath",
          "destinationDir",
          "includes",
          "options",
          "sourceCompatibility",
          "targetCompatibility",
          "group",
          "flatDir",
          "doLast",
          "doFirst",
          "flatten",
          "todir",
          "fromdir",
          "ant",
          "def",
          "abstract",
          "break",
          "case",
          "catch",
          "continue",
          "default",
          "do",
          "else",
          "extends",
          "final",
          "finally",
          "for",
          "if",
          "implements",
          "instanceof",
          "native",
          "new",
          "private",
          "protected",
          "public",
          "return",
          "static",
          "switch",
          "synchronized",
          "throw",
          "throws",
          "transient",
          "try",
          "volatile",
          "while",
          "strictfp",
          "package",
          "import",
          "false",
          "null",
          "super",
          "this",
          "true",
          "antlrtask",
          "checkstyle",
          "codenarc",
          "copy",
          "boolean",
          "byte",
          "char",
          "class",
          "double",
          "float",
          "int",
          "interface",
          "long",
          "short",
          "void",
          "compile",
          "runTime",
          "file",
          "fileTree",
          "abs",
          "any",
          "append",
          "asList",
          "asWritable",
          "call",
          "collect",
          "compareTo",
          "count",
          "div",
          "dump",
          "each",
          "eachByte",
          "eachFile",
          "eachLine",
          "every",
          "find",
          "findAll",
          "flatten",
          "getAt",
          "getErr",
          "getIn",
          "getOut",
          "getText",
          "grep",
          "immutable",
          "inject",
          "inspect",
          "intersect",
          "invokeMethods",
          "isCase",
          "join",
          "leftShift",
          "minus",
          "multiply",
          "newInputStream",
          "newOutputStream",
          "newPrintWriter",
          "newReader",
          "newWriter",
          "next",
          "plus",
          "pop",
          "power",
          "previous",
          "print",
          "println",
          "push",
          "putAt",
          "read",
          "readBytes",
          "readLines",
          "reverse",
          "reverseEach",
          "round",
          "size",
          "sort",
          "splitEachLine",
          "step",
          "subMap",
          "times",
          "toInteger",
          "toList",
          "tokenize",
          "upto",
          "waitForOrKill",
          "withPrintWriter",
          "withReader",
          "withStream",
          "withWriter",
          "withWriterAppend",
          "write",
          "writeLine"
        ];
        return {
          name: "Gradle",
          case_insensitive: true,
          keywords: KEYWORDS,
          contains: [
            hljs.C_LINE_COMMENT_MODE,
            hljs.C_BLOCK_COMMENT_MODE,
            hljs.APOS_STRING_MODE,
            hljs.QUOTE_STRING_MODE,
            hljs.NUMBER_MODE,
            hljs.REGEXP_MODE
          ]
        };
      }
      module.exports = gradle;
    }
  });

  // node_modules/highlight.js/lib/languages/groovy.js
  var require_groovy = __commonJS({
    "node_modules/highlight.js/lib/languages/groovy.js"(exports, module) {
      function variants(variants2, obj = {}) {
        obj.variants = variants2;
        return obj;
      }
      function groovy(hljs) {
        const regex = hljs.regex;
        const IDENT_RE = "[A-Za-z0-9_$]+";
        const COMMENT = variants([
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          hljs.COMMENT(
            "/\\*\\*",
            "\\*/",
            {
              relevance: 0,
              contains: [
                {
                  // eat up @'s in emails to prevent them to be recognized as doctags
                  begin: /\w+@/,
                  relevance: 0
                },
                {
                  className: "doctag",
                  begin: "@[A-Za-z]+"
                }
              ]
            }
          )
        ]);
        const REGEXP = {
          className: "regexp",
          begin: /~?\/[^\/\n]+\//,
          contains: [hljs.BACKSLASH_ESCAPE]
        };
        const NUMBER = variants([
          hljs.BINARY_NUMBER_MODE,
          hljs.C_NUMBER_MODE
        ]);
        const STRING = variants(
          [
            {
              begin: /"""/,
              end: /"""/
            },
            {
              begin: /'''/,
              end: /'''/
            },
            {
              begin: "\\$/",
              end: "/\\$",
              relevance: 10
            },
            hljs.APOS_STRING_MODE,
            hljs.QUOTE_STRING_MODE
          ],
          { className: "string" }
        );
        const CLASS_DEFINITION = {
          match: [
            /(class|interface|trait|enum|record|extends|implements)/,
            /\s+/,
            hljs.UNDERSCORE_IDENT_RE
          ],
          scope: {
            1: "keyword",
            3: "title.class"
          }
        };
        const TYPES = [
          "byte",
          "short",
          "char",
          "int",
          "long",
          "boolean",
          "float",
          "double",
          "void"
        ];
        const KEYWORDS = [
          // groovy specific keywords
          "def",
          "as",
          "in",
          "assert",
          "trait",
          // common keywords with Java
          "abstract",
          "static",
          "volatile",
          "transient",
          "public",
          "private",
          "protected",
          "synchronized",
          "final",
          "class",
          "interface",
          "enum",
          "if",
          "else",
          "for",
          "while",
          "switch",
          "case",
          "break",
          "default",
          "continue",
          "throw",
          "throws",
          "try",
          "catch",
          "finally",
          "implements",
          "extends",
          "new",
          "import",
          "package",
          "return",
          "instanceof",
          "var"
        ];
        return {
          name: "Groovy",
          keywords: {
            "variable.language": "this super",
            literal: "true false null",
            type: TYPES,
            keyword: KEYWORDS
          },
          contains: [
            hljs.SHEBANG({
              binary: "groovy",
              relevance: 10
            }),
            COMMENT,
            STRING,
            REGEXP,
            NUMBER,
            CLASS_DEFINITION,
            {
              className: "meta",
              begin: "@[A-Za-z]+",
              relevance: 0
            },
            {
              // highlight map keys and named parameters as attrs
              className: "attr",
              begin: IDENT_RE + "[ 	]*:",
              relevance: 0
            },
            {
              // catch middle element of the ternary operator
              // to avoid highlight it as a label, named parameter, or map key
              begin: /\?/,
              end: /:/,
              relevance: 0,
              contains: [
                COMMENT,
                STRING,
                REGEXP,
                NUMBER,
                "self"
              ]
            },
            {
              // highlight labeled statements
              className: "symbol",
              begin: "^[ 	]*" + regex.lookahead(IDENT_RE + ":"),
              excludeBegin: true,
              end: IDENT_RE + ":",
              relevance: 0
            }
          ],
          illegal: /#|<\//
        };
      }
      module.exports = groovy;
    }
  });

  // node_modules/highlight.js/lib/languages/handlebars.js
  var require_handlebars = __commonJS({
    "node_modules/highlight.js/lib/languages/handlebars.js"(exports, module) {
      function handlebars(hljs) {
        const regex = hljs.regex;
        const BUILT_INS = {
          $pattern: /[\w.\/]+/,
          built_in: [
            "action",
            "bindattr",
            "collection",
            "component",
            "concat",
            "debugger",
            "each",
            "each-in",
            "get",
            "hash",
            "if",
            "in",
            "input",
            "link-to",
            "loc",
            "log",
            "lookup",
            "mut",
            "outlet",
            "partial",
            "query-params",
            "render",
            "template",
            "textarea",
            "unbound",
            "unless",
            "view",
            "with",
            "yield"
          ]
        };
        const LITERALS = {
          $pattern: /[\w.\/]+/,
          literal: [
            "true",
            "false",
            "undefined",
            "null"
          ]
        };
        const DOUBLE_QUOTED_ID_REGEX = /""|"[^"]+"/;
        const SINGLE_QUOTED_ID_REGEX = /''|'[^']+'/;
        const BRACKET_QUOTED_ID_REGEX = /\[\]|\[[^\]]+\]/;
        const PLAIN_ID_REGEX = /[^\s!"#%&'()*+,.\/;<=>@\[\\\]^`{|}~]+/;
        const PATH_DELIMITER_REGEX = /(\.|\/)/;
        const ANY_ID = regex.either(
          DOUBLE_QUOTED_ID_REGEX,
          SINGLE_QUOTED_ID_REGEX,
          BRACKET_QUOTED_ID_REGEX,
          PLAIN_ID_REGEX
        );
        const IDENTIFIER_REGEX = regex.concat(
          regex.optional(/\.|\.\/|\//),
          // relative or absolute path
          ANY_ID,
          regex.anyNumberOfTimes(regex.concat(
            PATH_DELIMITER_REGEX,
            ANY_ID
          ))
        );
        const HASH_PARAM_REGEX = regex.concat(
          "(",
          BRACKET_QUOTED_ID_REGEX,
          "|",
          PLAIN_ID_REGEX,
          ")(?==)"
        );
        const HELPER_NAME_OR_PATH_EXPRESSION = { begin: IDENTIFIER_REGEX };
        const HELPER_PARAMETER = hljs.inherit(HELPER_NAME_OR_PATH_EXPRESSION, { keywords: LITERALS });
        const SUB_EXPRESSION = {
          begin: /\(/,
          end: /\)/
          // the "contains" is added below when all necessary sub-modes are defined
        };
        const HASH = {
          // fka "attribute-assignment", parameters of the form 'key=value'
          className: "attr",
          begin: HASH_PARAM_REGEX,
          relevance: 0,
          starts: {
            begin: /=/,
            end: /=/,
            starts: { contains: [
              hljs.NUMBER_MODE,
              hljs.QUOTE_STRING_MODE,
              hljs.APOS_STRING_MODE,
              HELPER_PARAMETER,
              SUB_EXPRESSION
            ] }
          }
        };
        const BLOCK_PARAMS = {
          // parameters of the form '{{#with x as | y |}}...{{/with}}'
          begin: /as\s+\|/,
          keywords: { keyword: "as" },
          end: /\|/,
          contains: [
            {
              // define sub-mode in order to prevent highlighting of block-parameter named "as"
              begin: /\w+/
            }
          ]
        };
        const HELPER_PARAMETERS = {
          contains: [
            hljs.NUMBER_MODE,
            hljs.QUOTE_STRING_MODE,
            hljs.APOS_STRING_MODE,
            BLOCK_PARAMS,
            HASH,
            HELPER_PARAMETER,
            SUB_EXPRESSION
          ],
          returnEnd: true
          // the property "end" is defined through inheritance when the mode is used. If depends
          // on the surrounding mode, but "endsWithParent" does not work here (i.e. it includes the
          // end-token of the surrounding mode)
        };
        const SUB_EXPRESSION_CONTENTS = hljs.inherit(HELPER_NAME_OR_PATH_EXPRESSION, {
          className: "name",
          keywords: BUILT_INS,
          starts: hljs.inherit(HELPER_PARAMETERS, { end: /\)/ })
        });
        SUB_EXPRESSION.contains = [SUB_EXPRESSION_CONTENTS];
        const OPENING_BLOCK_MUSTACHE_CONTENTS = hljs.inherit(HELPER_NAME_OR_PATH_EXPRESSION, {
          keywords: BUILT_INS,
          className: "name",
          starts: hljs.inherit(HELPER_PARAMETERS, { end: /\}\}/ })
        });
        const CLOSING_BLOCK_MUSTACHE_CONTENTS = hljs.inherit(HELPER_NAME_OR_PATH_EXPRESSION, {
          keywords: BUILT_INS,
          className: "name"
        });
        const BASIC_MUSTACHE_CONTENTS = hljs.inherit(HELPER_NAME_OR_PATH_EXPRESSION, {
          className: "name",
          keywords: BUILT_INS,
          starts: hljs.inherit(HELPER_PARAMETERS, { end: /\}\}/ })
        });
        const ESCAPE_MUSTACHE_WITH_PRECEEDING_BACKSLASH = {
          begin: /\\\{\{/,
          skip: true
        };
        const PREVENT_ESCAPE_WITH_ANOTHER_PRECEEDING_BACKSLASH = {
          begin: /\\\\(?=\{\{)/,
          skip: true
        };
        return {
          name: "Handlebars",
          aliases: [
            "hbs",
            "html.hbs",
            "html.handlebars",
            "htmlbars"
          ],
          case_insensitive: true,
          subLanguage: "xml",
          contains: [
            ESCAPE_MUSTACHE_WITH_PRECEEDING_BACKSLASH,
            PREVENT_ESCAPE_WITH_ANOTHER_PRECEEDING_BACKSLASH,
            hljs.COMMENT(/\{\{!--/, /--\}\}/),
            hljs.COMMENT(/\{\{!/, /\}\}/),
            {
              // open raw block "{{{{raw}}}} content not evaluated {{{{/raw}}}}"
              className: "template-tag",
              begin: /\{\{\{\{(?!\/)/,
              end: /\}\}\}\}/,
              contains: [OPENING_BLOCK_MUSTACHE_CONTENTS],
              starts: {
                end: /\{\{\{\{\//,
                returnEnd: true,
                subLanguage: "xml"
              }
            },
            {
              // close raw block
              className: "template-tag",
              begin: /\{\{\{\{\//,
              end: /\}\}\}\}/,
              contains: [CLOSING_BLOCK_MUSTACHE_CONTENTS]
            },
            {
              // open block statement
              className: "template-tag",
              begin: /\{\{#/,
              end: /\}\}/,
              contains: [OPENING_BLOCK_MUSTACHE_CONTENTS]
            },
            {
              className: "template-tag",
              begin: /\{\{(?=else\}\})/,
              end: /\}\}/,
              keywords: "else"
            },
            {
              className: "template-tag",
              begin: /\{\{(?=else if)/,
              end: /\}\}/,
              keywords: "else if"
            },
            {
              // closing block statement
              className: "template-tag",
              begin: /\{\{\//,
              end: /\}\}/,
              contains: [CLOSING_BLOCK_MUSTACHE_CONTENTS]
            },
            {
              // template variable or helper-call that is NOT html-escaped
              className: "template-variable",
              begin: /\{\{\{/,
              end: /\}\}\}/,
              contains: [BASIC_MUSTACHE_CONTENTS]
            },
            {
              // template variable or helper-call that is html-escaped
              className: "template-variable",
              begin: /\{\{/,
              end: /\}\}/,
              contains: [BASIC_MUSTACHE_CONTENTS]
            }
          ]
        };
      }
      module.exports = handlebars;
    }
  });

  // node_modules/highlight.js/lib/languages/haskell.js
  var require_haskell = __commonJS({
    "node_modules/highlight.js/lib/languages/haskell.js"(exports, module) {
      function haskell(hljs) {
        const decimalDigits = "([0-9]_*)+";
        const hexDigits = "([0-9a-fA-F]_*)+";
        const binaryDigits = "([01]_*)+";
        const octalDigits = "([0-7]_*)+";
        const ascSymbol = "[!#$%&*+.\\/<=>?@\\\\^~-]";
        const uniSymbol = "(\\p{S}|\\p{P})";
        const special = "[(),;\\[\\]`|{}]";
        const symbol = `(${ascSymbol}|(?!(${special}|[_:"']))${uniSymbol})`;
        const COMMENT = { variants: [
          // Double dash forms a valid comment only if it's not part of legal lexeme.
          // See: Haskell 98 report: https://www.haskell.org/onlinereport/lexemes.html
          //
          // The commented code does the job, but we can't use negative lookbehind,
          // due to poor support by Safari browser.
          // > hljs.COMMENT(`(?<!${symbol})--+(?!${symbol})`, '$'),
          // So instead, we'll add a no-markup rule before the COMMENT rule in the rules list
          // to match the problematic infix operators that contain double dash.
          hljs.COMMENT("--+", "$"),
          hljs.COMMENT(
            /\{-/,
            /-\}/,
            { contains: ["self"] }
          )
        ] };
        const PRAGMA = {
          className: "meta",
          begin: /\{-#/,
          end: /#-\}/
        };
        const PREPROCESSOR = {
          className: "meta",
          begin: "^#",
          end: "$"
        };
        const CONSTRUCTOR = {
          className: "type",
          begin: "\\b[A-Z][\\w']*",
          // TODO: other constructors (build-in, infix).
          relevance: 0
        };
        const LIST = {
          begin: "\\(",
          end: "\\)",
          illegal: '"',
          contains: [
            PRAGMA,
            PREPROCESSOR,
            {
              className: "type",
              begin: "\\b[A-Z][\\w]*(\\((\\.\\.|,|\\w+)\\))?"
            },
            hljs.inherit(hljs.TITLE_MODE, { begin: "[_a-z][\\w']*" }),
            COMMENT
          ]
        };
        const RECORD = {
          begin: /\{/,
          end: /\}/,
          contains: LIST.contains
        };
        const NUMBER = {
          className: "number",
          relevance: 0,
          variants: [
            // decimal floating-point-literal (subsumes decimal-literal)
            { match: `\\b(${decimalDigits})(\\.(${decimalDigits}))?([eE][+-]?(${decimalDigits}))?\\b` },
            // hexadecimal floating-point-literal (subsumes hexadecimal-literal)
            { match: `\\b0[xX]_*(${hexDigits})(\\.(${hexDigits}))?([pP][+-]?(${decimalDigits}))?\\b` },
            // octal-literal
            { match: `\\b0[oO](${octalDigits})\\b` },
            // binary-literal
            { match: `\\b0[bB](${binaryDigits})\\b` }
          ]
        };
        return {
          name: "Haskell",
          aliases: ["hs"],
          keywords: "let in if then else case of where do module import hiding qualified type data newtype deriving class instance as default infix infixl infixr foreign export ccall stdcall cplusplus jvm dotnet safe unsafe family forall mdo proc rec",
          unicodeRegex: true,
          contains: [
            // Top-level constructions.
            {
              beginKeywords: "module",
              end: "where",
              keywords: "module where",
              contains: [
                LIST,
                COMMENT
              ],
              illegal: "\\W\\.|;"
            },
            {
              begin: "\\bimport\\b",
              end: "$",
              keywords: "import qualified as hiding",
              contains: [
                LIST,
                COMMENT
              ],
              illegal: "\\W\\.|;"
            },
            {
              className: "class",
              begin: "^(\\s*)?(class|instance)\\b",
              end: "where",
              keywords: "class family instance where",
              contains: [
                CONSTRUCTOR,
                LIST,
                COMMENT
              ]
            },
            {
              className: "class",
              begin: "\\b(data|(new)?type)\\b",
              end: "$",
              keywords: "data family type newtype deriving",
              contains: [
                PRAGMA,
                CONSTRUCTOR,
                LIST,
                RECORD,
                COMMENT
              ]
            },
            {
              beginKeywords: "default",
              end: "$",
              contains: [
                CONSTRUCTOR,
                LIST,
                COMMENT
              ]
            },
            {
              beginKeywords: "infix infixl infixr",
              end: "$",
              contains: [
                hljs.C_NUMBER_MODE,
                COMMENT
              ]
            },
            {
              begin: "\\bforeign\\b",
              end: "$",
              keywords: "foreign import export ccall stdcall cplusplus jvm dotnet safe unsafe",
              contains: [
                CONSTRUCTOR,
                hljs.QUOTE_STRING_MODE,
                COMMENT
              ]
            },
            {
              className: "meta",
              begin: "#!\\/usr\\/bin\\/env runhaskell",
              end: "$"
            },
            // "Whitespaces".
            PRAGMA,
            PREPROCESSOR,
            // Literals and names.
            // Single characters.
            {
              scope: "string",
              begin: /'(?=\\?.')/,
              end: /'/,
              contains: [
                {
                  scope: "char.escape",
                  match: /\\./
                }
              ]
            },
            hljs.QUOTE_STRING_MODE,
            NUMBER,
            CONSTRUCTOR,
            hljs.inherit(hljs.TITLE_MODE, { begin: "^[_a-z][\\w']*" }),
            // No markup, prevents infix operators from being recognized as comments.
            { begin: `(?!-)${symbol}--+|--+(?!-)${symbol}` },
            COMMENT,
            {
              // No markup, relevance booster
              begin: "->|<-"
            }
          ]
        };
      }
      module.exports = haskell;
    }
  });

  // node_modules/highlight.js/lib/languages/ini.js
  var require_ini = __commonJS({
    "node_modules/highlight.js/lib/languages/ini.js"(exports, module) {
      function ini(hljs) {
        const regex = hljs.regex;
        const NUMBERS = {
          className: "number",
          relevance: 0,
          variants: [
            { begin: /([+-]+)?[\d]+_[\d_]+/ },
            { begin: hljs.NUMBER_RE }
          ]
        };
        const COMMENTS = hljs.COMMENT();
        COMMENTS.variants = [
          {
            begin: /;/,
            end: /$/
          },
          {
            begin: /#/,
            end: /$/
          }
        ];
        const VARIABLES = {
          className: "variable",
          variants: [
            { begin: /\$[\w\d"][\w\d_]*/ },
            { begin: /\$\{(.*?)\}/ }
          ]
        };
        const LITERALS = {
          className: "literal",
          begin: /\bon|off|true|false|yes|no\b/
        };
        const STRINGS = {
          className: "string",
          contains: [hljs.BACKSLASH_ESCAPE],
          variants: [
            {
              begin: "'''",
              end: "'''",
              relevance: 10
            },
            {
              begin: '"""',
              end: '"""',
              relevance: 10
            },
            {
              begin: '"',
              end: '"'
            },
            {
              begin: "'",
              end: "'"
            }
          ]
        };
        const ARRAY = {
          begin: /\[/,
          end: /\]/,
          contains: [
            COMMENTS,
            LITERALS,
            VARIABLES,
            STRINGS,
            NUMBERS,
            "self"
          ],
          relevance: 0
        };
        const BARE_KEY = /[A-Za-z0-9_-]+/;
        const QUOTED_KEY_DOUBLE_QUOTE = /"(\\"|[^"])*"/;
        const QUOTED_KEY_SINGLE_QUOTE = /'[^']*'/;
        const ANY_KEY = regex.either(
          BARE_KEY,
          QUOTED_KEY_DOUBLE_QUOTE,
          QUOTED_KEY_SINGLE_QUOTE
        );
        const DOTTED_KEY = regex.concat(
          ANY_KEY,
          "(\\s*\\.\\s*",
          ANY_KEY,
          ")*",
          regex.lookahead(/\s*=\s*[^#\s]/)
        );
        return {
          name: "TOML, also INI",
          aliases: ["toml"],
          case_insensitive: true,
          illegal: /\S/,
          contains: [
            COMMENTS,
            {
              className: "section",
              begin: /\[+/,
              end: /\]+/
            },
            {
              begin: DOTTED_KEY,
              className: "attr",
              starts: {
                end: /$/,
                contains: [
                  COMMENTS,
                  ARRAY,
                  LITERALS,
                  VARIABLES,
                  STRINGS,
                  NUMBERS
                ]
              }
            }
          ]
        };
      }
      module.exports = ini;
    }
  });

  // node_modules/highlight.js/lib/languages/java.js
  var require_java = __commonJS({
    "node_modules/highlight.js/lib/languages/java.js"(exports, module) {
      var decimalDigits = "[0-9](_*[0-9])*";
      var frac = `\\.(${decimalDigits})`;
      var hexDigits = "[0-9a-fA-F](_*[0-9a-fA-F])*";
      var NUMERIC = {
        className: "number",
        variants: [
          // DecimalFloatingPointLiteral
          // including ExponentPart
          { begin: `(\\b(${decimalDigits})((${frac})|\\.)?|(${frac}))[eE][+-]?(${decimalDigits})[fFdD]?\\b` },
          // excluding ExponentPart
          { begin: `\\b(${decimalDigits})((${frac})[fFdD]?\\b|\\.([fFdD]\\b)?)` },
          { begin: `(${frac})[fFdD]?\\b` },
          { begin: `\\b(${decimalDigits})[fFdD]\\b` },
          // HexadecimalFloatingPointLiteral
          { begin: `\\b0[xX]((${hexDigits})\\.?|(${hexDigits})?\\.(${hexDigits}))[pP][+-]?(${decimalDigits})[fFdD]?\\b` },
          // DecimalIntegerLiteral
          { begin: "\\b(0|[1-9](_*[0-9])*)[lL]?\\b" },
          // HexIntegerLiteral
          { begin: `\\b0[xX](${hexDigits})[lL]?\\b` },
          // OctalIntegerLiteral
          { begin: "\\b0(_*[0-7])*[lL]?\\b" },
          // BinaryIntegerLiteral
          { begin: "\\b0[bB][01](_*[01])*[lL]?\\b" }
        ],
        relevance: 0
      };
      function recurRegex(re, substitution, depth) {
        if (depth === -1) return "";
        return re.replace(substitution, (_) => {
          return recurRegex(re, substitution, depth - 1);
        });
      }
      function java(hljs) {
        const regex = hljs.regex;
        const JAVA_IDENT_RE = "[\xC0-\u02B8a-zA-Z_$][\xC0-\u02B8a-zA-Z_$0-9]*";
        const GENERIC_IDENT_RE = JAVA_IDENT_RE + recurRegex("(?:<" + JAVA_IDENT_RE + "~~~(?:\\s*,\\s*" + JAVA_IDENT_RE + "~~~)*>)?", /~~~/g, 2);
        const MAIN_KEYWORDS = [
          "synchronized",
          "abstract",
          "private",
          "var",
          "static",
          "if",
          "const ",
          "for",
          "while",
          "strictfp",
          "finally",
          "protected",
          "import",
          "native",
          "final",
          "void",
          "enum",
          "else",
          "break",
          "transient",
          "catch",
          "instanceof",
          "volatile",
          "case",
          "assert",
          "package",
          "default",
          "public",
          "try",
          "switch",
          "continue",
          "throws",
          "protected",
          "public",
          "private",
          "module",
          "requires",
          "exports",
          "do",
          "sealed",
          "yield",
          "permits",
          "goto",
          "when"
        ];
        const BUILT_INS = [
          "super",
          "this"
        ];
        const LITERALS = [
          "false",
          "true",
          "null"
        ];
        const TYPES = [
          "char",
          "boolean",
          "long",
          "float",
          "int",
          "byte",
          "short",
          "double"
        ];
        const KEYWORDS = {
          keyword: MAIN_KEYWORDS,
          literal: LITERALS,
          type: TYPES,
          built_in: BUILT_INS
        };
        const ANNOTATION = {
          className: "meta",
          begin: "@" + JAVA_IDENT_RE,
          contains: [
            {
              begin: /\(/,
              end: /\)/,
              contains: ["self"]
              // allow nested () inside our annotation
            }
          ]
        };
        const PARAMS = {
          className: "params",
          begin: /\(/,
          end: /\)/,
          keywords: KEYWORDS,
          relevance: 0,
          contains: [hljs.C_BLOCK_COMMENT_MODE],
          endsParent: true
        };
        return {
          name: "Java",
          aliases: ["jsp"],
          keywords: KEYWORDS,
          illegal: /<\/|#/,
          contains: [
            hljs.COMMENT(
              "/\\*\\*",
              "\\*/",
              {
                relevance: 0,
                contains: [
                  {
                    // eat up @'s in emails to prevent them to be recognized as doctags
                    begin: /\w+@/,
                    relevance: 0
                  },
                  {
                    className: "doctag",
                    begin: "@[A-Za-z]+"
                  }
                ]
              }
            ),
            // relevance boost
            {
              begin: /import java\.[a-z]+\./,
              keywords: "import",
              relevance: 2
            },
            hljs.C_LINE_COMMENT_MODE,
            hljs.C_BLOCK_COMMENT_MODE,
            {
              begin: /"""/,
              end: /"""/,
              className: "string",
              contains: [hljs.BACKSLASH_ESCAPE]
            },
            hljs.APOS_STRING_MODE,
            hljs.QUOTE_STRING_MODE,
            {
              match: [
                /\b(?:class|interface|enum|extends|implements|new)/,
                /\s+/,
                JAVA_IDENT_RE
              ],
              className: {
                1: "keyword",
                3: "title.class"
              }
            },
            {
              // Exceptions for hyphenated keywords
              match: /non-sealed/,
              scope: "keyword"
            },
            {
              begin: [
                regex.concat(/(?!else)/, JAVA_IDENT_RE),
                /\s+/,
                JAVA_IDENT_RE,
                /\s+/,
                /=(?!=)/
              ],
              className: {
                1: "type",
                3: "variable",
                5: "operator"
              }
            },
            {
              begin: [
                /record/,
                /\s+/,
                JAVA_IDENT_RE
              ],
              className: {
                1: "keyword",
                3: "title.class"
              },
              contains: [
                PARAMS,
                hljs.C_LINE_COMMENT_MODE,
                hljs.C_BLOCK_COMMENT_MODE
              ]
            },
            {
              // Expression keywords prevent 'keyword Name(...)' from being
              // recognized as a function definition
              beginKeywords: "new throw return else",
              relevance: 0
            },
            {
              begin: [
                "(?:" + GENERIC_IDENT_RE + "\\s+)",
                hljs.UNDERSCORE_IDENT_RE,
                /\s*(?=\()/
              ],
              className: { 2: "title.function" },
              keywords: KEYWORDS,
              contains: [
                {
                  className: "params",
                  begin: /\(/,
                  end: /\)/,
                  keywords: KEYWORDS,
                  relevance: 0,
                  contains: [
                    ANNOTATION,
                    hljs.APOS_STRING_MODE,
                    hljs.QUOTE_STRING_MODE,
                    NUMERIC,
                    hljs.C_BLOCK_COMMENT_MODE
                  ]
                },
                hljs.C_LINE_COMMENT_MODE,
                hljs.C_BLOCK_COMMENT_MODE
              ]
            },
            NUMERIC,
            ANNOTATION
          ]
        };
      }
      module.exports = java;
    }
  });

  // node_modules/highlight.js/lib/languages/javascript.js
  var require_javascript = __commonJS({
    "node_modules/highlight.js/lib/languages/javascript.js"(exports, module) {
      var IDENT_RE = "[A-Za-z$_][0-9A-Za-z$_]*";
      var KEYWORDS = [
        "as",
        // for exports
        "in",
        "of",
        "if",
        "for",
        "while",
        "finally",
        "var",
        "new",
        "function",
        "do",
        "return",
        "void",
        "else",
        "break",
        "catch",
        "instanceof",
        "with",
        "throw",
        "case",
        "default",
        "try",
        "switch",
        "continue",
        "typeof",
        "delete",
        "let",
        "yield",
        "const",
        "class",
        // JS handles these with a special rule
        // "get",
        // "set",
        "debugger",
        "async",
        "await",
        "static",
        "import",
        "from",
        "export",
        "extends",
        // It's reached stage 3, which is "recommended for implementation":
        "using"
      ];
      var LITERALS = [
        "true",
        "false",
        "null",
        "undefined",
        "NaN",
        "Infinity"
      ];
      var TYPES = [
        // Fundamental objects
        "Object",
        "Function",
        "Boolean",
        "Symbol",
        // numbers and dates
        "Math",
        "Date",
        "Number",
        "BigInt",
        // text
        "String",
        "RegExp",
        // Indexed collections
        "Array",
        "Float32Array",
        "Float64Array",
        "Int8Array",
        "Uint8Array",
        "Uint8ClampedArray",
        "Int16Array",
        "Int32Array",
        "Uint16Array",
        "Uint32Array",
        "BigInt64Array",
        "BigUint64Array",
        // Keyed collections
        "Set",
        "Map",
        "WeakSet",
        "WeakMap",
        // Structured data
        "ArrayBuffer",
        "SharedArrayBuffer",
        "Atomics",
        "DataView",
        "JSON",
        // Control abstraction objects
        "Promise",
        "Generator",
        "GeneratorFunction",
        "AsyncFunction",
        // Reflection
        "Reflect",
        "Proxy",
        // Internationalization
        "Intl",
        // WebAssembly
        "WebAssembly"
      ];
      var ERROR_TYPES = [
        "Error",
        "EvalError",
        "InternalError",
        "RangeError",
        "ReferenceError",
        "SyntaxError",
        "TypeError",
        "URIError"
      ];
      var BUILT_IN_GLOBALS = [
        "setInterval",
        "setTimeout",
        "clearInterval",
        "clearTimeout",
        "require",
        "exports",
        "eval",
        "isFinite",
        "isNaN",
        "parseFloat",
        "parseInt",
        "decodeURI",
        "decodeURIComponent",
        "encodeURI",
        "encodeURIComponent",
        "escape",
        "unescape"
      ];
      var BUILT_IN_VARIABLES = [
        "arguments",
        "this",
        "super",
        "console",
        "window",
        "document",
        "localStorage",
        "sessionStorage",
        "module",
        "global"
        // Node.js
      ];
      var BUILT_INS = [].concat(
        BUILT_IN_GLOBALS,
        TYPES,
        ERROR_TYPES
      );
      function javascript(hljs) {
        const regex = hljs.regex;
        const hasClosingTag = (match, { after }) => {
          const tag = "</" + match[0].slice(1);
          const pos = match.input.indexOf(tag, after);
          return pos !== -1;
        };
        const IDENT_RE$1 = IDENT_RE;
        const FRAGMENT = {
          begin: "<>",
          end: "</>"
        };
        const XML_SELF_CLOSING = /<[A-Za-z0-9\\._:-]+\s*\/>/;
        const XML_TAG = {
          begin: /<[A-Za-z0-9\\._:-]+/,
          end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
          /**
           * @param {RegExpMatchArray} match
           * @param {CallbackResponse} response
           */
          isTrulyOpeningTag: (match, response) => {
            const afterMatchIndex = match[0].length + match.index;
            const nextChar = match.input[afterMatchIndex];
            if (
              // HTML should not include another raw `<` inside a tag
              // nested type?
              // `<Array<Array<number>>`, etc.
              nextChar === "<" || // the , gives away that this is not HTML
              // `<T, A extends keyof T, V>`
              nextChar === ","
            ) {
              response.ignoreMatch();
              return;
            }
            if (nextChar === ">") {
              if (!hasClosingTag(match, { after: afterMatchIndex })) {
                response.ignoreMatch();
              }
            }
            let m;
            const afterMatch = match.input.substring(afterMatchIndex);
            if (m = afterMatch.match(/^\s*=/)) {
              response.ignoreMatch();
              return;
            }
            if (m = afterMatch.match(/^\s+extends\s+/)) {
              if (m.index === 0) {
                response.ignoreMatch();
                return;
              }
            }
          }
        };
        const KEYWORDS$1 = {
          $pattern: IDENT_RE,
          keyword: KEYWORDS,
          literal: LITERALS,
          built_in: BUILT_INS,
          "variable.language": BUILT_IN_VARIABLES
        };
        const decimalDigits = "[0-9](_?[0-9])*";
        const frac = `\\.(${decimalDigits})`;
        const decimalInteger = `0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*`;
        const NUMBER = {
          className: "number",
          variants: [
            // DecimalLiteral
            { begin: `(\\b(${decimalInteger})((${frac})|\\.)?|(${frac}))[eE][+-]?(${decimalDigits})\\b` },
            { begin: `\\b(${decimalInteger})\\b((${frac})\\b|\\.)?|(${frac})\\b` },
            // DecimalBigIntegerLiteral
            { begin: `\\b(0|[1-9](_?[0-9])*)n\\b` },
            // NonDecimalIntegerLiteral
            { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
            { begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
            { begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },
            // LegacyOctalIntegerLiteral (does not include underscore separators)
            // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
            { begin: "\\b0[0-7]+n?\\b" }
          ],
          relevance: 0
        };
        const SUBST = {
          className: "subst",
          begin: "\\$\\{",
          end: "\\}",
          keywords: KEYWORDS$1,
          contains: []
          // defined later
        };
        const HTML_TEMPLATE = {
          begin: ".?html`",
          end: "",
          starts: {
            end: "`",
            returnEnd: false,
            contains: [
              hljs.BACKSLASH_ESCAPE,
              SUBST
            ],
            subLanguage: "xml"
          }
        };
        const CSS_TEMPLATE = {
          begin: ".?css`",
          end: "",
          starts: {
            end: "`",
            returnEnd: false,
            contains: [
              hljs.BACKSLASH_ESCAPE,
              SUBST
            ],
            subLanguage: "css"
          }
        };
        const GRAPHQL_TEMPLATE = {
          begin: ".?gql`",
          end: "",
          starts: {
            end: "`",
            returnEnd: false,
            contains: [
              hljs.BACKSLASH_ESCAPE,
              SUBST
            ],
            subLanguage: "graphql"
          }
        };
        const TEMPLATE_STRING = {
          className: "string",
          begin: "`",
          end: "`",
          contains: [
            hljs.BACKSLASH_ESCAPE,
            SUBST
          ]
        };
        const JSDOC_COMMENT = hljs.COMMENT(
          /\/\*\*(?!\/)/,
          "\\*/",
          {
            relevance: 0,
            contains: [
              {
                begin: "(?=@[A-Za-z]+)",
                relevance: 0,
                contains: [
                  {
                    className: "doctag",
                    begin: "@[A-Za-z]+"
                  },
                  {
                    className: "type",
                    begin: "\\{",
                    end: "\\}",
                    excludeEnd: true,
                    excludeBegin: true,
                    relevance: 0
                  },
                  {
                    className: "variable",
                    begin: IDENT_RE$1 + "(?=\\s*(-)|$)",
                    endsParent: true,
                    relevance: 0
                  },
                  // eat spaces (not newlines) so we can find
                  // types or variables
                  {
                    begin: /(?=[^\n])\s/,
                    relevance: 0
                  }
                ]
              }
            ]
          }
        );
        const COMMENT = {
          className: "comment",
          variants: [
            JSDOC_COMMENT,
            hljs.C_BLOCK_COMMENT_MODE,
            hljs.C_LINE_COMMENT_MODE
          ]
        };
        const SUBST_INTERNALS = [
          hljs.APOS_STRING_MODE,
          hljs.QUOTE_STRING_MODE,
          HTML_TEMPLATE,
          CSS_TEMPLATE,
          GRAPHQL_TEMPLATE,
          TEMPLATE_STRING,
          // Skip numbers when they are part of a variable name
          { match: /\$\d+/ },
          NUMBER
          // This is intentional:
          // See https://github.com/highlightjs/highlight.js/issues/3288
          // hljs.REGEXP_MODE
        ];
        SUBST.contains = SUBST_INTERNALS.concat({
          // we need to pair up {} inside our subst to prevent
          // it from ending too early by matching another }
          begin: /\{/,
          end: /\}/,
          keywords: KEYWORDS$1,
          contains: [
            "self"
          ].concat(SUBST_INTERNALS)
        });
        const SUBST_AND_COMMENTS = [].concat(COMMENT, SUBST.contains);
        const PARAMS_CONTAINS = SUBST_AND_COMMENTS.concat([
          // eat recursive parens in sub expressions
          {
            begin: /(\s*)\(/,
            end: /\)/,
            keywords: KEYWORDS$1,
            contains: ["self"].concat(SUBST_AND_COMMENTS)
          }
        ]);
        const PARAMS = {
          className: "params",
          // convert this to negative lookbehind in v12
          begin: /(\s*)\(/,
          // to match the parms with
          end: /\)/,
          excludeBegin: true,
          excludeEnd: true,
          keywords: KEYWORDS$1,
          contains: PARAMS_CONTAINS
        };
        const CLASS_OR_EXTENDS = {
          variants: [
            // class Car extends vehicle
            {
              match: [
                /class/,
                /\s+/,
                IDENT_RE$1,
                /\s+/,
                /extends/,
                /\s+/,
                regex.concat(IDENT_RE$1, "(", regex.concat(/\./, IDENT_RE$1), ")*")
              ],
              scope: {
                1: "keyword",
                3: "title.class",
                5: "keyword",
                7: "title.class.inherited"
              }
            },
            // class Car
            {
              match: [
                /class/,
                /\s+/,
                IDENT_RE$1
              ],
              scope: {
                1: "keyword",
                3: "title.class"
              }
            }
          ]
        };
        const CLASS_REFERENCE = {
          relevance: 0,
          match: regex.either(
            // Hard coded exceptions
            /\bJSON/,
            // Float32Array, OutT
            /\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,
            // CSSFactory, CSSFactoryT
            /\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,
            // FPs, FPsT
            /\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/
            // P
            // single letters are not highlighted
            // BLAH
            // this will be flagged as a UPPER_CASE_CONSTANT instead
          ),
          className: "title.class",
          keywords: {
            _: [
              // se we still get relevance credit for JS library classes
              ...TYPES,
              ...ERROR_TYPES
            ]
          }
        };
        const USE_STRICT = {
          label: "use_strict",
          className: "meta",
          relevance: 10,
          begin: /^\s*['"]use (strict|asm)['"]/
        };
        const FUNCTION_DEFINITION = {
          variants: [
            {
              match: [
                /function/,
                /\s+/,
                IDENT_RE$1,
                /(?=\s*\()/
              ]
            },
            // anonymous function
            {
              match: [
                /function/,
                /\s*(?=\()/
              ]
            }
          ],
          className: {
            1: "keyword",
            3: "title.function"
          },
          label: "func.def",
          contains: [PARAMS],
          illegal: /%/
        };
        const UPPER_CASE_CONSTANT = {
          relevance: 0,
          match: /\b[A-Z][A-Z_0-9]+\b/,
          className: "variable.constant"
        };
        function noneOf(list) {
          return regex.concat("(?!", list.join("|"), ")");
        }
        const FUNCTION_CALL = {
          match: regex.concat(
            /\b/,
            noneOf([
              ...BUILT_IN_GLOBALS,
              "super",
              "import"
            ].map((x) => `${x}\\s*\\(`)),
            IDENT_RE$1,
            regex.lookahead(/\s*\(/)
          ),
          className: "title.function",
          relevance: 0
        };
        const PROPERTY_ACCESS = {
          begin: regex.concat(/\./, regex.lookahead(
            regex.concat(IDENT_RE$1, /(?![0-9A-Za-z$_(])/)
          )),
          end: IDENT_RE$1,
          excludeBegin: true,
          keywords: "prototype",
          className: "property",
          relevance: 0
        };
        const GETTER_OR_SETTER = {
          match: [
            /get|set/,
            /\s+/,
            IDENT_RE$1,
            /(?=\()/
          ],
          className: {
            1: "keyword",
            3: "title.function"
          },
          contains: [
            {
              // eat to avoid empty params
              begin: /\(\)/
            },
            PARAMS
          ]
        };
        const FUNC_LEAD_IN_RE = "(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|" + hljs.UNDERSCORE_IDENT_RE + ")\\s*=>";
        const FUNCTION_VARIABLE = {
          match: [
            /const|var|let/,
            /\s+/,
            IDENT_RE$1,
            /\s*/,
            /=\s*/,
            /(async\s*)?/,
            // async is optional
            regex.lookahead(FUNC_LEAD_IN_RE)
          ],
          keywords: "async",
          className: {
            1: "keyword",
            3: "title.function"
          },
          contains: [
            PARAMS
          ]
        };
        return {
          name: "JavaScript",
          aliases: ["js", "jsx", "mjs", "cjs"],
          keywords: KEYWORDS$1,
          // this will be extended by TypeScript
          exports: { PARAMS_CONTAINS, CLASS_REFERENCE },
          illegal: /#(?![$_A-z])/,
          contains: [
            hljs.SHEBANG({
              label: "shebang",
              binary: "node",
              relevance: 5
            }),
            USE_STRICT,
            hljs.APOS_STRING_MODE,
            hljs.QUOTE_STRING_MODE,
            HTML_TEMPLATE,
            CSS_TEMPLATE,
            GRAPHQL_TEMPLATE,
            TEMPLATE_STRING,
            COMMENT,
            // Skip numbers when they are part of a variable name
            { match: /\$\d+/ },
            NUMBER,
            CLASS_REFERENCE,
            {
              scope: "attr",
              match: IDENT_RE$1 + regex.lookahead(":"),
              relevance: 0
            },
            FUNCTION_VARIABLE,
            {
              // "value" container
              begin: "(" + hljs.RE_STARTERS_RE + "|\\b(case|return|throw)\\b)\\s*",
              keywords: "return throw case",
              relevance: 0,
              contains: [
                COMMENT,
                hljs.REGEXP_MODE,
                {
                  className: "function",
                  // we have to count the parens to make sure we actually have the
                  // correct bounding ( ) before the =>.  There could be any number of
                  // sub-expressions inside also surrounded by parens.
                  begin: FUNC_LEAD_IN_RE,
                  returnBegin: true,
                  end: "\\s*=>",
                  contains: [
                    {
                      className: "params",
                      variants: [
                        {
                          begin: hljs.UNDERSCORE_IDENT_RE,
                          relevance: 0
                        },
                        {
                          className: null,
                          begin: /\(\s*\)/,
                          skip: true
                        },
                        {
                          begin: /(\s*)\(/,
                          end: /\)/,
                          excludeBegin: true,
                          excludeEnd: true,
                          keywords: KEYWORDS$1,
                          contains: PARAMS_CONTAINS
                        }
                      ]
                    }
                  ]
                },
                {
                  // could be a comma delimited list of params to a function call
                  begin: /,/,
                  relevance: 0
                },
                {
                  match: /\s+/,
                  relevance: 0
                },
                {
                  // JSX
                  variants: [
                    { begin: FRAGMENT.begin, end: FRAGMENT.end },
                    { match: XML_SELF_CLOSING },
                    {
                      begin: XML_TAG.begin,
                      // we carefully check the opening tag to see if it truly
                      // is a tag and not a false positive
                      "on:begin": XML_TAG.isTrulyOpeningTag,
                      end: XML_TAG.end
                    }
                  ],
                  subLanguage: "xml",
                  contains: [
                    {
                      begin: XML_TAG.begin,
                      end: XML_TAG.end,
                      skip: true,
                      contains: ["self"]
                    }
                  ]
                }
              ]
            },
            FUNCTION_DEFINITION,
            {
              // prevent this from getting swallowed up by function
              // since they appear "function like"
              beginKeywords: "while if switch catch for"
            },
            {
              // we have to count the parens to make sure we actually have the correct
              // bounding ( ).  There could be any number of sub-expressions inside
              // also surrounded by parens.
              begin: "\\b(?!function)" + hljs.UNDERSCORE_IDENT_RE + "\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{",
              // end parens
              returnBegin: true,
              label: "func.def",
              contains: [
                PARAMS,
                hljs.inherit(hljs.TITLE_MODE, { begin: IDENT_RE$1, className: "title.function" })
              ]
            },
            // catch ... so it won't trigger the property rule below
            {
              match: /\.\.\./,
              relevance: 0
            },
            PROPERTY_ACCESS,
            // hack: prevents detection of keywords in some circumstances
            // .keyword()
            // $keyword = x
            {
              match: "\\$" + IDENT_RE$1,
              relevance: 0
            },
            {
              match: [/\bconstructor(?=\s*\()/],
              className: { 1: "title.function" },
              contains: [PARAMS]
            },
            FUNCTION_CALL,
            UPPER_CASE_CONSTANT,
            CLASS_OR_EXTENDS,
            GETTER_OR_SETTER,
            {
              match: /\$[(.]/
              // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
            }
          ]
        };
      }
      module.exports = javascript;
    }
  });

  // node_modules/highlight.js/lib/languages/json.js
  var require_json = __commonJS({
    "node_modules/highlight.js/lib/languages/json.js"(exports, module) {
      function json(hljs) {
        const ATTRIBUTE = {
          className: "attr",
          begin: /"(\\.|[^\\"\r\n])*"(?=\s*:)/,
          relevance: 1.01
        };
        const PUNCTUATION = {
          match: /[{}[\],:]/,
          className: "punctuation",
          relevance: 0
        };
        const LITERALS = [
          "true",
          "false",
          "null"
        ];
        const LITERALS_MODE = {
          scope: "literal",
          beginKeywords: LITERALS.join(" ")
        };
        return {
          name: "JSON",
          aliases: ["jsonc"],
          keywords: {
            literal: LITERALS
          },
          contains: [
            ATTRIBUTE,
            PUNCTUATION,
            hljs.QUOTE_STRING_MODE,
            LITERALS_MODE,
            hljs.C_NUMBER_MODE,
            hljs.C_LINE_COMMENT_MODE,
            hljs.C_BLOCK_COMMENT_MODE
          ],
          illegal: "\\S"
        };
      }
      module.exports = json;
    }
  });

  // node_modules/highlight.js/lib/languages/kotlin.js
  var require_kotlin = __commonJS({
    "node_modules/highlight.js/lib/languages/kotlin.js"(exports, module) {
      var decimalDigits = "[0-9](_*[0-9])*";
      var frac = `\\.(${decimalDigits})`;
      var hexDigits = "[0-9a-fA-F](_*[0-9a-fA-F])*";
      var NUMERIC = {
        className: "number",
        variants: [
          // DecimalFloatingPointLiteral
          // including ExponentPart
          { begin: `(\\b(${decimalDigits})((${frac})|\\.)?|(${frac}))[eE][+-]?(${decimalDigits})[fFdD]?\\b` },
          // excluding ExponentPart
          { begin: `\\b(${decimalDigits})((${frac})[fFdD]?\\b|\\.([fFdD]\\b)?)` },
          { begin: `(${frac})[fFdD]?\\b` },
          { begin: `\\b(${decimalDigits})[fFdD]\\b` },
          // HexadecimalFloatingPointLiteral
          { begin: `\\b0[xX]((${hexDigits})\\.?|(${hexDigits})?\\.(${hexDigits}))[pP][+-]?(${decimalDigits})[fFdD]?\\b` },
          // DecimalIntegerLiteral
          { begin: "\\b(0|[1-9](_*[0-9])*)[lL]?\\b" },
          // HexIntegerLiteral
          { begin: `\\b0[xX](${hexDigits})[lL]?\\b` },
          // OctalIntegerLiteral
          { begin: "\\b0(_*[0-7])*[lL]?\\b" },
          // BinaryIntegerLiteral
          { begin: "\\b0[bB][01](_*[01])*[lL]?\\b" }
        ],
        relevance: 0
      };
      function kotlin(hljs) {
        const KEYWORDS = {
          keyword: "abstract as val var vararg get set class object open private protected public noinline crossinline dynamic final enum if else do while for when throw try catch finally import package is in fun override companion reified inline lateinit init interface annotation data sealed internal infix operator out by constructor super tailrec where const inner suspend typealias external expect actual",
          built_in: "Byte Short Char Int Long Boolean Float Double Void Unit Nothing",
          literal: "true false null"
        };
        const KEYWORDS_WITH_LABEL = {
          className: "keyword",
          begin: /\b(break|continue|return|this)\b/,
          starts: { contains: [
            {
              className: "symbol",
              begin: /@\w+/
            }
          ] }
        };
        const LABEL = {
          className: "symbol",
          begin: hljs.UNDERSCORE_IDENT_RE + "@"
        };
        const SUBST = {
          className: "subst",
          begin: /\$\{/,
          end: /\}/,
          contains: [hljs.C_NUMBER_MODE]
        };
        const VARIABLE = {
          className: "variable",
          begin: "\\$" + hljs.UNDERSCORE_IDENT_RE
        };
        const STRING = {
          className: "string",
          variants: [
            {
              begin: '"""',
              end: '"""(?=[^"])',
              contains: [
                VARIABLE,
                SUBST
              ]
            },
            // Can't use built-in modes easily, as we want to use STRING in the meta
            // context as 'meta-string' and there's no syntax to remove explicitly set
            // classNames in built-in modes.
            {
              begin: "'",
              end: "'",
              illegal: /\n/,
              contains: [hljs.BACKSLASH_ESCAPE]
            },
            {
              begin: '"',
              end: '"',
              illegal: /\n/,
              contains: [
                hljs.BACKSLASH_ESCAPE,
                VARIABLE,
                SUBST
              ]
            }
          ]
        };
        SUBST.contains.push(STRING);
        const ANNOTATION_USE_SITE = {
          className: "meta",
          begin: "@(?:file|property|field|get|set|receiver|param|setparam|delegate)\\s*:(?:\\s*" + hljs.UNDERSCORE_IDENT_RE + ")?"
        };
        const ANNOTATION = {
          className: "meta",
          begin: "@" + hljs.UNDERSCORE_IDENT_RE,
          contains: [
            {
              begin: /\(/,
              end: /\)/,
              contains: [
                hljs.inherit(STRING, { className: "string" }),
                "self"
              ]
            }
          ]
        };
        const KOTLIN_NUMBER_MODE = NUMERIC;
        const KOTLIN_NESTED_COMMENT = hljs.COMMENT(
          "/\\*",
          "\\*/",
          { contains: [hljs.C_BLOCK_COMMENT_MODE] }
        );
        const KOTLIN_PAREN_TYPE = { variants: [
          {
            className: "type",
            begin: hljs.UNDERSCORE_IDENT_RE
          },
          {
            begin: /\(/,
            end: /\)/,
            contains: []
            // defined later
          }
        ] };
        const KOTLIN_PAREN_TYPE2 = KOTLIN_PAREN_TYPE;
        KOTLIN_PAREN_TYPE2.variants[1].contains = [KOTLIN_PAREN_TYPE];
        KOTLIN_PAREN_TYPE.variants[1].contains = [KOTLIN_PAREN_TYPE2];
        return {
          name: "Kotlin",
          aliases: [
            "kt",
            "kts"
          ],
          keywords: KEYWORDS,
          contains: [
            hljs.COMMENT(
              "/\\*\\*",
              "\\*/",
              {
                relevance: 0,
                contains: [
                  {
                    className: "doctag",
                    begin: "@[A-Za-z]+"
                  }
                ]
              }
            ),
            hljs.C_LINE_COMMENT_MODE,
            KOTLIN_NESTED_COMMENT,
            KEYWORDS_WITH_LABEL,
            LABEL,
            ANNOTATION_USE_SITE,
            ANNOTATION,
            {
              className: "function",
              beginKeywords: "fun",
              end: "[(]|$",
              returnBegin: true,
              excludeEnd: true,
              keywords: KEYWORDS,
              relevance: 5,
              contains: [
                {
                  begin: hljs.UNDERSCORE_IDENT_RE + "\\s*\\(",
                  returnBegin: true,
                  relevance: 0,
                  contains: [hljs.UNDERSCORE_TITLE_MODE]
                },
                {
                  className: "type",
                  begin: /</,
                  end: />/,
                  keywords: "reified",
                  relevance: 0
                },
                {
                  className: "params",
                  begin: /\(/,
                  end: /\)/,
                  endsParent: true,
                  keywords: KEYWORDS,
                  relevance: 0,
                  contains: [
                    {
                      begin: /:/,
                      end: /[=,\/]/,
                      endsWithParent: true,
                      contains: [
                        KOTLIN_PAREN_TYPE,
                        hljs.C_LINE_COMMENT_MODE,
                        KOTLIN_NESTED_COMMENT
                      ],
                      relevance: 0
                    },
                    hljs.C_LINE_COMMENT_MODE,
                    KOTLIN_NESTED_COMMENT,
                    ANNOTATION_USE_SITE,
                    ANNOTATION,
                    STRING,
                    hljs.C_NUMBER_MODE
                  ]
                },
                KOTLIN_NESTED_COMMENT
              ]
            },
            {
              begin: [
                /class|interface|trait/,
                /\s+/,
                hljs.UNDERSCORE_IDENT_RE
              ],
              beginScope: {
                3: "title.class"
              },
              keywords: "class interface trait",
              end: /[:\{(]|$/,
              excludeEnd: true,
              illegal: "extends implements",
              contains: [
                { beginKeywords: "public protected internal private constructor" },
                hljs.UNDERSCORE_TITLE_MODE,
                {
                  className: "type",
                  begin: /</,
                  end: />/,
                  excludeBegin: true,
                  excludeEnd: true,
                  relevance: 0
                },
                {
                  className: "type",
                  begin: /[,:]\s*/,
                  end: /[<\(,){\s]|$/,
                  excludeBegin: true,
                  returnEnd: true
                },
                ANNOTATION_USE_SITE,
                ANNOTATION
              ]
            },
            STRING,
            {
              className: "meta",
              begin: "^#!/usr/bin/env",
              end: "$",
              illegal: "\n"
            },
            KOTLIN_NUMBER_MODE
          ]
        };
      }
      module.exports = kotlin;
    }
  });

  // node_modules/highlight.js/lib/languages/less.js
  var require_less = __commonJS({
    "node_modules/highlight.js/lib/languages/less.js"(exports, module) {
      var MODES = (hljs) => {
        return {
          IMPORTANT: {
            scope: "meta",
            begin: "!important"
          },
          BLOCK_COMMENT: hljs.C_BLOCK_COMMENT_MODE,
          HEXCOLOR: {
            scope: "number",
            begin: /#(([0-9a-fA-F]{3,4})|(([0-9a-fA-F]{2}){3,4}))\b/
          },
          FUNCTION_DISPATCH: {
            className: "built_in",
            begin: /[\w-]+(?=\()/
          },
          ATTRIBUTE_SELECTOR_MODE: {
            scope: "selector-attr",
            begin: /\[/,
            end: /\]/,
            illegal: "$",
            contains: [
              hljs.APOS_STRING_MODE,
              hljs.QUOTE_STRING_MODE
            ]
          },
          CSS_NUMBER_MODE: {
            scope: "number",
            begin: hljs.NUMBER_RE + "(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",
            relevance: 0
          },
          CSS_VARIABLE: {
            className: "attr",
            begin: /--[A-Za-z_][A-Za-z0-9_-]*/
          }
        };
      };
      var HTML_TAGS = [
        "a",
        "abbr",
        "address",
        "article",
        "aside",
        "audio",
        "b",
        "blockquote",
        "body",
        "button",
        "canvas",
        "caption",
        "cite",
        "code",
        "dd",
        "del",
        "details",
        "dfn",
        "div",
        "dl",
        "dt",
        "em",
        "fieldset",
        "figcaption",
        "figure",
        "footer",
        "form",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "header",
        "hgroup",
        "html",
        "i",
        "iframe",
        "img",
        "input",
        "ins",
        "kbd",
        "label",
        "legend",
        "li",
        "main",
        "mark",
        "menu",
        "nav",
        "object",
        "ol",
        "optgroup",
        "option",
        "p",
        "picture",
        "q",
        "quote",
        "samp",
        "section",
        "select",
        "source",
        "span",
        "strong",
        "summary",
        "sup",
        "table",
        "tbody",
        "td",
        "textarea",
        "tfoot",
        "th",
        "thead",
        "time",
        "tr",
        "ul",
        "var",
        "video"
      ];
      var SVG_TAGS = [
        "defs",
        "g",
        "marker",
        "mask",
        "pattern",
        "svg",
        "switch",
        "symbol",
        "feBlend",
        "feColorMatrix",
        "feComponentTransfer",
        "feComposite",
        "feConvolveMatrix",
        "feDiffuseLighting",
        "feDisplacementMap",
        "feFlood",
        "feGaussianBlur",
        "feImage",
        "feMerge",
        "feMorphology",
        "feOffset",
        "feSpecularLighting",
        "feTile",
        "feTurbulence",
        "linearGradient",
        "radialGradient",
        "stop",
        "circle",
        "ellipse",
        "image",
        "line",
        "path",
        "polygon",
        "polyline",
        "rect",
        "text",
        "use",
        "textPath",
        "tspan",
        "foreignObject",
        "clipPath"
      ];
      var TAGS = [
        ...HTML_TAGS,
        ...SVG_TAGS
      ];
      var MEDIA_FEATURES = [
        "any-hover",
        "any-pointer",
        "aspect-ratio",
        "color",
        "color-gamut",
        "color-index",
        "device-aspect-ratio",
        "device-height",
        "device-width",
        "display-mode",
        "forced-colors",
        "grid",
        "height",
        "hover",
        "inverted-colors",
        "monochrome",
        "orientation",
        "overflow-block",
        "overflow-inline",
        "pointer",
        "prefers-color-scheme",
        "prefers-contrast",
        "prefers-reduced-motion",
        "prefers-reduced-transparency",
        "resolution",
        "scan",
        "scripting",
        "update",
        "width",
        // TODO: find a better solution?
        "min-width",
        "max-width",
        "min-height",
        "max-height"
      ].sort().reverse();
      var PSEUDO_CLASSES = [
        "active",
        "any-link",
        "blank",
        "checked",
        "current",
        "default",
        "defined",
        "dir",
        // dir()
        "disabled",
        "drop",
        "empty",
        "enabled",
        "first",
        "first-child",
        "first-of-type",
        "fullscreen",
        "future",
        "focus",
        "focus-visible",
        "focus-within",
        "has",
        // has()
        "host",
        // host or host()
        "host-context",
        // host-context()
        "hover",
        "indeterminate",
        "in-range",
        "invalid",
        "is",
        // is()
        "lang",
        // lang()
        "last-child",
        "last-of-type",
        "left",
        "link",
        "local-link",
        "not",
        // not()
        "nth-child",
        // nth-child()
        "nth-col",
        // nth-col()
        "nth-last-child",
        // nth-last-child()
        "nth-last-col",
        // nth-last-col()
        "nth-last-of-type",
        //nth-last-of-type()
        "nth-of-type",
        //nth-of-type()
        "only-child",
        "only-of-type",
        "optional",
        "out-of-range",
        "past",
        "placeholder-shown",
        "read-only",
        "read-write",
        "required",
        "right",
        "root",
        "scope",
        "target",
        "target-within",
        "user-invalid",
        "valid",
        "visited",
        "where"
        // where()
      ].sort().reverse();
      var PSEUDO_ELEMENTS = [
        "after",
        "backdrop",
        "before",
        "cue",
        "cue-region",
        "first-letter",
        "first-line",
        "grammar-error",
        "marker",
        "part",
        "placeholder",
        "selection",
        "slotted",
        "spelling-error"
      ].sort().reverse();
      var ATTRIBUTES = [
        "accent-color",
        "align-content",
        "align-items",
        "align-self",
        "alignment-baseline",
        "all",
        "anchor-name",
        "animation",
        "animation-composition",
        "animation-delay",
        "animation-direction",
        "animation-duration",
        "animation-fill-mode",
        "animation-iteration-count",
        "animation-name",
        "animation-play-state",
        "animation-range",
        "animation-range-end",
        "animation-range-start",
        "animation-timeline",
        "animation-timing-function",
        "appearance",
        "aspect-ratio",
        "backdrop-filter",
        "backface-visibility",
        "background",
        "background-attachment",
        "background-blend-mode",
        "background-clip",
        "background-color",
        "background-image",
        "background-origin",
        "background-position",
        "background-position-x",
        "background-position-y",
        "background-repeat",
        "background-size",
        "baseline-shift",
        "block-size",
        "border",
        "border-block",
        "border-block-color",
        "border-block-end",
        "border-block-end-color",
        "border-block-end-style",
        "border-block-end-width",
        "border-block-start",
        "border-block-start-color",
        "border-block-start-style",
        "border-block-start-width",
        "border-block-style",
        "border-block-width",
        "border-bottom",
        "border-bottom-color",
        "border-bottom-left-radius",
        "border-bottom-right-radius",
        "border-bottom-style",
        "border-bottom-width",
        "border-collapse",
        "border-color",
        "border-end-end-radius",
        "border-end-start-radius",
        "border-image",
        "border-image-outset",
        "border-image-repeat",
        "border-image-slice",
        "border-image-source",
        "border-image-width",
        "border-inline",
        "border-inline-color",
        "border-inline-end",
        "border-inline-end-color",
        "border-inline-end-style",
        "border-inline-end-width",
        "border-inline-start",
        "border-inline-start-color",
        "border-inline-start-style",
        "border-inline-start-width",
        "border-inline-style",
        "border-inline-width",
        "border-left",
        "border-left-color",
        "border-left-style",
        "border-left-width",
        "border-radius",
        "border-right",
        "border-right-color",
        "border-right-style",
        "border-right-width",
        "border-spacing",
        "border-start-end-radius",
        "border-start-start-radius",
        "border-style",
        "border-top",
        "border-top-color",
        "border-top-left-radius",
        "border-top-right-radius",
        "border-top-style",
        "border-top-width",
        "border-width",
        "bottom",
        "box-align",
        "box-decoration-break",
        "box-direction",
        "box-flex",
        "box-flex-group",
        "box-lines",
        "box-ordinal-group",
        "box-orient",
        "box-pack",
        "box-shadow",
        "box-sizing",
        "break-after",
        "break-before",
        "break-inside",
        "caption-side",
        "caret-color",
        "clear",
        "clip",
        "clip-path",
        "clip-rule",
        "color",
        "color-interpolation",
        "color-interpolation-filters",
        "color-profile",
        "color-rendering",
        "color-scheme",
        "column-count",
        "column-fill",
        "column-gap",
        "column-rule",
        "column-rule-color",
        "column-rule-style",
        "column-rule-width",
        "column-span",
        "column-width",
        "columns",
        "contain",
        "contain-intrinsic-block-size",
        "contain-intrinsic-height",
        "contain-intrinsic-inline-size",
        "contain-intrinsic-size",
        "contain-intrinsic-width",
        "container",
        "container-name",
        "container-type",
        "content",
        "content-visibility",
        "counter-increment",
        "counter-reset",
        "counter-set",
        "cue",
        "cue-after",
        "cue-before",
        "cursor",
        "cx",
        "cy",
        "direction",
        "display",
        "dominant-baseline",
        "empty-cells",
        "enable-background",
        "field-sizing",
        "fill",
        "fill-opacity",
        "fill-rule",
        "filter",
        "flex",
        "flex-basis",
        "flex-direction",
        "flex-flow",
        "flex-grow",
        "flex-shrink",
        "flex-wrap",
        "float",
        "flood-color",
        "flood-opacity",
        "flow",
        "font",
        "font-display",
        "font-family",
        "font-feature-settings",
        "font-kerning",
        "font-language-override",
        "font-optical-sizing",
        "font-palette",
        "font-size",
        "font-size-adjust",
        "font-smooth",
        "font-smoothing",
        "font-stretch",
        "font-style",
        "font-synthesis",
        "font-synthesis-position",
        "font-synthesis-small-caps",
        "font-synthesis-style",
        "font-synthesis-weight",
        "font-variant",
        "font-variant-alternates",
        "font-variant-caps",
        "font-variant-east-asian",
        "font-variant-emoji",
        "font-variant-ligatures",
        "font-variant-numeric",
        "font-variant-position",
        "font-variation-settings",
        "font-weight",
        "forced-color-adjust",
        "gap",
        "glyph-orientation-horizontal",
        "glyph-orientation-vertical",
        "grid",
        "grid-area",
        "grid-auto-columns",
        "grid-auto-flow",
        "grid-auto-rows",
        "grid-column",
        "grid-column-end",
        "grid-column-start",
        "grid-gap",
        "grid-row",
        "grid-row-end",
        "grid-row-start",
        "grid-template",
        "grid-template-areas",
        "grid-template-columns",
        "grid-template-rows",
        "hanging-punctuation",
        "height",
        "hyphenate-character",
        "hyphenate-limit-chars",
        "hyphens",
        "icon",
        "image-orientation",
        "image-rendering",
        "image-resolution",
        "ime-mode",
        "initial-letter",
        "initial-letter-align",
        "inline-size",
        "inset",
        "inset-area",
        "inset-block",
        "inset-block-end",
        "inset-block-start",
        "inset-inline",
        "inset-inline-end",
        "inset-inline-start",
        "isolation",
        "justify-content",
        "justify-items",
        "justify-self",
        "kerning",
        "left",
        "letter-spacing",
        "lighting-color",
        "line-break",
        "line-height",
        "line-height-step",
        "list-style",
        "list-style-image",
        "list-style-position",
        "list-style-type",
        "margin",
        "margin-block",
        "margin-block-end",
        "margin-block-start",
        "margin-bottom",
        "margin-inline",
        "margin-inline-end",
        "margin-inline-start",
        "margin-left",
        "margin-right",
        "margin-top",
        "margin-trim",
        "marker",
        "marker-end",
        "marker-mid",
        "marker-start",
        "marks",
        "mask",
        "mask-border",
        "mask-border-mode",
        "mask-border-outset",
        "mask-border-repeat",
        "mask-border-slice",
        "mask-border-source",
        "mask-border-width",
        "mask-clip",
        "mask-composite",
        "mask-image",
        "mask-mode",
        "mask-origin",
        "mask-position",
        "mask-repeat",
        "mask-size",
        "mask-type",
        "masonry-auto-flow",
        "math-depth",
        "math-shift",
        "math-style",
        "max-block-size",
        "max-height",
        "max-inline-size",
        "max-width",
        "min-block-size",
        "min-height",
        "min-inline-size",
        "min-width",
        "mix-blend-mode",
        "nav-down",
        "nav-index",
        "nav-left",
        "nav-right",
        "nav-up",
        "none",
        "normal",
        "object-fit",
        "object-position",
        "offset",
        "offset-anchor",
        "offset-distance",
        "offset-path",
        "offset-position",
        "offset-rotate",
        "opacity",
        "order",
        "orphans",
        "outline",
        "outline-color",
        "outline-offset",
        "outline-style",
        "outline-width",
        "overflow",
        "overflow-anchor",
        "overflow-block",
        "overflow-clip-margin",
        "overflow-inline",
        "overflow-wrap",
        "overflow-x",
        "overflow-y",
        "overlay",
        "overscroll-behavior",
        "overscroll-behavior-block",
        "overscroll-behavior-inline",
        "overscroll-behavior-x",
        "overscroll-behavior-y",
        "padding",
        "padding-block",
        "padding-block-end",
        "padding-block-start",
        "padding-bottom",
        "padding-inline",
        "padding-inline-end",
        "padding-inline-start",
        "padding-left",
        "padding-right",
        "padding-top",
        "page",
        "page-break-after",
        "page-break-before",
        "page-break-inside",
        "paint-order",
        "pause",
        "pause-after",
        "pause-before",
        "perspective",
        "perspective-origin",
        "place-content",
        "place-items",
        "place-self",
        "pointer-events",
        "position",
        "position-anchor",
        "position-visibility",
        "print-color-adjust",
        "quotes",
        "r",
        "resize",
        "rest",
        "rest-after",
        "rest-before",
        "right",
        "rotate",
        "row-gap",
        "ruby-align",
        "ruby-position",
        "scale",
        "scroll-behavior",
        "scroll-margin",
        "scroll-margin-block",
        "scroll-margin-block-end",
        "scroll-margin-block-start",
        "scroll-margin-bottom",
        "scroll-margin-inline",
        "scroll-margin-inline-end",
        "scroll-margin-inline-start",
        "scroll-margin-left",
        "scroll-margin-right",
        "scroll-margin-top",
        "scroll-padding",
        "scroll-padding-block",
        "scroll-padding-block-end",
        "scroll-padding-block-start",
        "scroll-padding-bottom",
        "scroll-padding-inline",
        "scroll-padding-inline-end",
        "scroll-padding-inline-start",
        "scroll-padding-left",
        "scroll-padding-right",
        "scroll-padding-top",
        "scroll-snap-align",
        "scroll-snap-stop",
        "scroll-snap-type",
        "scroll-timeline",
        "scroll-timeline-axis",
        "scroll-timeline-name",
        "scrollbar-color",
        "scrollbar-gutter",
        "scrollbar-width",
        "shape-image-threshold",
        "shape-margin",
        "shape-outside",
        "shape-rendering",
        "speak",
        "speak-as",
        "src",
        // @font-face
        "stop-color",
        "stop-opacity",
        "stroke",
        "stroke-dasharray",
        "stroke-dashoffset",
        "stroke-linecap",
        "stroke-linejoin",
        "stroke-miterlimit",
        "stroke-opacity",
        "stroke-width",
        "tab-size",
        "table-layout",
        "text-align",
        "text-align-all",
        "text-align-last",
        "text-anchor",
        "text-combine-upright",
        "text-decoration",
        "text-decoration-color",
        "text-decoration-line",
        "text-decoration-skip",
        "text-decoration-skip-ink",
        "text-decoration-style",
        "text-decoration-thickness",
        "text-emphasis",
        "text-emphasis-color",
        "text-emphasis-position",
        "text-emphasis-style",
        "text-indent",
        "text-justify",
        "text-orientation",
        "text-overflow",
        "text-rendering",
        "text-shadow",
        "text-size-adjust",
        "text-transform",
        "text-underline-offset",
        "text-underline-position",
        "text-wrap",
        "text-wrap-mode",
        "text-wrap-style",
        "timeline-scope",
        "top",
        "touch-action",
        "transform",
        "transform-box",
        "transform-origin",
        "transform-style",
        "transition",
        "transition-behavior",
        "transition-delay",
        "transition-duration",
        "transition-property",
        "transition-timing-function",
        "translate",
        "unicode-bidi",
        "user-modify",
        "user-select",
        "vector-effect",
        "vertical-align",
        "view-timeline",
        "view-timeline-axis",
        "view-timeline-inset",
        "view-timeline-name",
        "view-transition-name",
        "visibility",
        "voice-balance",
        "voice-duration",
        "voice-family",
        "voice-pitch",
        "voice-range",
        "voice-rate",
        "voice-stress",
        "voice-volume",
        "white-space",
        "white-space-collapse",
        "widows",
        "width",
        "will-change",
        "word-break",
        "word-spacing",
        "word-wrap",
        "writing-mode",
        "x",
        "y",
        "z-index",
        "zoom"
      ].sort().reverse();
      var PSEUDO_SELECTORS = PSEUDO_CLASSES.concat(PSEUDO_ELEMENTS).sort().reverse();
      function less(hljs) {
        const modes = MODES(hljs);
        const PSEUDO_SELECTORS$1 = PSEUDO_SELECTORS;
        const AT_MODIFIERS = "and or not only";
        const IDENT_RE = "[\\w-]+";
        const INTERP_IDENT_RE = "(" + IDENT_RE + "|@\\{" + IDENT_RE + "\\})";
        const RULES = [];
        const VALUE_MODES = [];
        const STRING_MODE = function(c) {
          return {
            // Less strings are not multiline (also include '~' for more consistent coloring of "escaped" strings)
            className: "string",
            begin: "~?" + c + ".*?" + c
          };
        };
        const IDENT_MODE = function(name, begin, relevance) {
          return {
            className: name,
            begin,
            relevance
          };
        };
        const AT_KEYWORDS = {
          $pattern: /[a-z-]+/,
          keyword: AT_MODIFIERS,
          attribute: MEDIA_FEATURES.join(" ")
        };
        const PARENS_MODE = {
          // used only to properly balance nested parens inside mixin call, def. arg list
          begin: "\\(",
          end: "\\)",
          contains: VALUE_MODES,
          keywords: AT_KEYWORDS,
          relevance: 0
        };
        VALUE_MODES.push(
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          STRING_MODE("'"),
          STRING_MODE('"'),
          modes.CSS_NUMBER_MODE,
          // fixme: it does not include dot for numbers like .5em :(
          {
            begin: "(url|data-uri)\\(",
            starts: {
              className: "string",
              end: "[\\)\\n]",
              excludeEnd: true
            }
          },
          modes.HEXCOLOR,
          PARENS_MODE,
          IDENT_MODE("variable", "@@?" + IDENT_RE, 10),
          IDENT_MODE("variable", "@\\{" + IDENT_RE + "\\}"),
          IDENT_MODE("built_in", "~?`[^`]*?`"),
          // inline javascript (or whatever host language) *multiline* string
          {
            // @media features (it’s here to not duplicate things in AT_RULE_MODE with extra PARENS_MODE overriding):
            className: "attribute",
            begin: IDENT_RE + "\\s*:",
            end: ":",
            returnBegin: true,
            excludeEnd: true
          },
          modes.IMPORTANT,
          { beginKeywords: "and not" },
          modes.FUNCTION_DISPATCH
        );
        const VALUE_WITH_RULESETS = VALUE_MODES.concat({
          begin: /\{/,
          end: /\}/,
          contains: RULES
        });
        const MIXIN_GUARD_MODE = {
          beginKeywords: "when",
          endsWithParent: true,
          contains: [{ beginKeywords: "and not" }].concat(VALUE_MODES)
          // using this form to override VALUE’s 'function' match
        };
        const RULE_MODE = {
          begin: INTERP_IDENT_RE + "\\s*:",
          returnBegin: true,
          end: /[;}]/,
          relevance: 0,
          contains: [
            { begin: /-(webkit|moz|ms|o)-/ },
            modes.CSS_VARIABLE,
            {
              className: "attribute",
              begin: "\\b(" + ATTRIBUTES.join("|") + ")\\b",
              end: /(?=:)/,
              starts: {
                endsWithParent: true,
                illegal: "[<=$]",
                relevance: 0,
                contains: VALUE_MODES
              }
            }
          ]
        };
        const AT_RULE_MODE = {
          className: "keyword",
          begin: "@(import|media|charset|font-face|(-[a-z]+-)?keyframes|supports|document|namespace|page|viewport|host)\\b",
          starts: {
            end: "[;{}]",
            keywords: AT_KEYWORDS,
            returnEnd: true,
            contains: VALUE_MODES,
            relevance: 0
          }
        };
        const VAR_RULE_MODE = {
          className: "variable",
          variants: [
            // using more strict pattern for higher relevance to increase chances of Less detection.
            // this is *the only* Less specific statement used in most of the sources, so...
            // (we’ll still often loose to the css-parser unless there's '//' comment,
            // simply because 1 variable just can't beat 99 properties :)
            {
              begin: "@" + IDENT_RE + "\\s*:",
              relevance: 15
            },
            { begin: "@" + IDENT_RE }
          ],
          starts: {
            end: "[;}]",
            returnEnd: true,
            contains: VALUE_WITH_RULESETS
          }
        };
        const SELECTOR_MODE = {
          // first parse unambiguous selectors (i.e. those not starting with tag)
          // then fall into the scary lookahead-discriminator variant.
          // this mode also handles mixin definitions and calls
          variants: [
            {
              begin: "[\\.#:&\\[>]",
              end: "[;{}]"
              // mixin calls end with ';'
            },
            {
              begin: INTERP_IDENT_RE,
              end: /\{/
            }
          ],
          returnBegin: true,
          returnEnd: true,
          illegal: `[<='$"]`,
          relevance: 0,
          contains: [
            hljs.C_LINE_COMMENT_MODE,
            hljs.C_BLOCK_COMMENT_MODE,
            MIXIN_GUARD_MODE,
            IDENT_MODE("keyword", "all\\b"),
            IDENT_MODE("variable", "@\\{" + IDENT_RE + "\\}"),
            // otherwise it’s identified as tag
            {
              begin: "\\b(" + TAGS.join("|") + ")\\b",
              className: "selector-tag"
            },
            modes.CSS_NUMBER_MODE,
            IDENT_MODE("selector-tag", INTERP_IDENT_RE, 0),
            IDENT_MODE("selector-id", "#" + INTERP_IDENT_RE),
            IDENT_MODE("selector-class", "\\." + INTERP_IDENT_RE, 0),
            IDENT_MODE("selector-tag", "&", 0),
            modes.ATTRIBUTE_SELECTOR_MODE,
            {
              className: "selector-pseudo",
              begin: ":(" + PSEUDO_CLASSES.join("|") + ")"
            },
            {
              className: "selector-pseudo",
              begin: ":(:)?(" + PSEUDO_ELEMENTS.join("|") + ")"
            },
            {
              begin: /\(/,
              end: /\)/,
              relevance: 0,
              contains: VALUE_WITH_RULESETS
            },
            // argument list of parametric mixins
            { begin: "!important" },
            // eat !important after mixin call or it will be colored as tag
            modes.FUNCTION_DISPATCH
          ]
        };
        const PSEUDO_SELECTOR_MODE = {
          begin: IDENT_RE + `:(:)?(${PSEUDO_SELECTORS$1.join("|")})`,
          returnBegin: true,
          contains: [SELECTOR_MODE]
        };
        RULES.push(
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          AT_RULE_MODE,
          VAR_RULE_MODE,
          PSEUDO_SELECTOR_MODE,
          RULE_MODE,
          SELECTOR_MODE,
          MIXIN_GUARD_MODE,
          modes.FUNCTION_DISPATCH
        );
        return {
          name: "Less",
          case_insensitive: true,
          illegal: `[=>'/<($"]`,
          contains: RULES
        };
      }
      module.exports = less;
    }
  });

  // node_modules/highlight.js/lib/languages/lisp.js
  var require_lisp = __commonJS({
    "node_modules/highlight.js/lib/languages/lisp.js"(exports, module) {
      function lisp(hljs) {
        const LISP_IDENT_RE = "[a-zA-Z_\\-+\\*\\/<=>&#][a-zA-Z0-9_\\-+*\\/<=>&#!]*";
        const MEC_RE = "\\|[^]*?\\|";
        const LISP_SIMPLE_NUMBER_RE = "(-|\\+)?\\d+(\\.\\d+|\\/\\d+)?((d|e|f|l|s|D|E|F|L|S)(\\+|-)?\\d+)?";
        const LITERAL = {
          className: "literal",
          begin: "\\b(t{1}|nil)\\b"
        };
        const NUMBER = {
          className: "number",
          variants: [
            {
              begin: LISP_SIMPLE_NUMBER_RE,
              relevance: 0
            },
            { begin: "#(b|B)[0-1]+(/[0-1]+)?" },
            { begin: "#(o|O)[0-7]+(/[0-7]+)?" },
            { begin: "#(x|X)[0-9a-fA-F]+(/[0-9a-fA-F]+)?" },
            {
              begin: "#(c|C)\\(" + LISP_SIMPLE_NUMBER_RE + " +" + LISP_SIMPLE_NUMBER_RE,
              end: "\\)"
            }
          ]
        };
        const STRING = hljs.inherit(hljs.QUOTE_STRING_MODE, { illegal: null });
        const COMMENT = hljs.COMMENT(
          ";",
          "$",
          { relevance: 0 }
        );
        const VARIABLE = {
          begin: "\\*",
          end: "\\*"
        };
        const KEYWORD = {
          className: "symbol",
          begin: "[:&]" + LISP_IDENT_RE
        };
        const IDENT = {
          begin: LISP_IDENT_RE,
          relevance: 0
        };
        const MEC = { begin: MEC_RE };
        const QUOTED_LIST = {
          begin: "\\(",
          end: "\\)",
          contains: [
            "self",
            LITERAL,
            STRING,
            NUMBER,
            IDENT
          ]
        };
        const QUOTED = {
          contains: [
            NUMBER,
            STRING,
            VARIABLE,
            KEYWORD,
            QUOTED_LIST,
            IDENT
          ],
          variants: [
            {
              begin: "['`]\\(",
              end: "\\)"
            },
            {
              begin: "\\(quote ",
              end: "\\)",
              keywords: { name: "quote" }
            },
            { begin: "'" + MEC_RE }
          ]
        };
        const QUOTED_ATOM = { variants: [
          { begin: "'" + LISP_IDENT_RE },
          { begin: "#'" + LISP_IDENT_RE + "(::" + LISP_IDENT_RE + ")*" }
        ] };
        const LIST = {
          begin: "\\(\\s*",
          end: "\\)"
        };
        const BODY = {
          endsWithParent: true,
          relevance: 0
        };
        LIST.contains = [
          {
            className: "name",
            variants: [
              {
                begin: LISP_IDENT_RE,
                relevance: 0
              },
              { begin: MEC_RE }
            ]
          },
          BODY
        ];
        BODY.contains = [
          QUOTED,
          QUOTED_ATOM,
          LIST,
          LITERAL,
          NUMBER,
          STRING,
          COMMENT,
          VARIABLE,
          KEYWORD,
          MEC,
          IDENT
        ];
        return {
          name: "Lisp",
          illegal: /\S/,
          contains: [
            NUMBER,
            hljs.SHEBANG(),
            LITERAL,
            STRING,
            COMMENT,
            QUOTED,
            QUOTED_ATOM,
            LIST,
            IDENT
          ]
        };
      }
      module.exports = lisp;
    }
  });

  // node_modules/highlight.js/lib/languages/lua.js
  var require_lua = __commonJS({
    "node_modules/highlight.js/lib/languages/lua.js"(exports, module) {
      function lua(hljs) {
        const OPENING_LONG_BRACKET = "\\[=*\\[";
        const CLOSING_LONG_BRACKET = "\\]=*\\]";
        const LONG_BRACKETS = {
          begin: OPENING_LONG_BRACKET,
          end: CLOSING_LONG_BRACKET,
          contains: ["self"]
        };
        const COMMENTS = [
          hljs.COMMENT("--(?!" + OPENING_LONG_BRACKET + ")", "$"),
          hljs.COMMENT(
            "--" + OPENING_LONG_BRACKET,
            CLOSING_LONG_BRACKET,
            {
              contains: [LONG_BRACKETS],
              relevance: 10
            }
          )
        ];
        return {
          name: "Lua",
          aliases: ["pluto"],
          keywords: {
            $pattern: hljs.UNDERSCORE_IDENT_RE,
            literal: "true false nil",
            keyword: "and break do else elseif end for goto if in local not or repeat return then until while",
            built_in: (
              // Metatags and globals:
              "_G _ENV _VERSION __index __newindex __mode __call __metatable __tostring __len __gc __add __sub __mul __div __mod __pow __concat __unm __eq __lt __le assert collectgarbage dofile error getfenv getmetatable ipairs load loadfile loadstring module next pairs pcall print rawequal rawget rawset require select setfenv setmetatable tonumber tostring type unpack xpcall arg self coroutine resume yield status wrap create running debug getupvalue debug sethook getmetatable gethook setmetatable setlocal traceback setfenv getinfo setupvalue getlocal getregistry getfenv io lines write close flush open output type read stderr stdin input stdout popen tmpfile math log max acos huge ldexp pi cos tanh pow deg tan cosh sinh random randomseed frexp ceil floor rad abs sqrt modf asin min mod fmod log10 atan2 exp sin atan os exit setlocale date getenv difftime remove time clock tmpname rename execute package preload loadlib loaded loaders cpath config path seeall string sub upper len gfind rep find match char dump gmatch reverse byte format gsub lower table setn insert getn foreachi maxn foreach concat sort remove"
            )
          },
          contains: COMMENTS.concat([
            {
              className: "function",
              beginKeywords: "function",
              end: "\\)",
              contains: [
                hljs.inherit(hljs.TITLE_MODE, { begin: "([_a-zA-Z]\\w*\\.)*([_a-zA-Z]\\w*:)?[_a-zA-Z]\\w*" }),
                {
                  className: "params",
                  begin: "\\(",
                  endsWithParent: true,
                  contains: COMMENTS
                }
              ].concat(COMMENTS)
            },
            hljs.C_NUMBER_MODE,
            hljs.APOS_STRING_MODE,
            hljs.QUOTE_STRING_MODE,
            {
              className: "string",
              begin: OPENING_LONG_BRACKET,
              end: CLOSING_LONG_BRACKET,
              contains: [LONG_BRACKETS],
              relevance: 5
            }
          ])
        };
      }
      module.exports = lua;
    }
  });

  // node_modules/highlight.js/lib/languages/makefile.js
  var require_makefile = __commonJS({
    "node_modules/highlight.js/lib/languages/makefile.js"(exports, module) {
      function makefile(hljs) {
        const VARIABLE = {
          className: "variable",
          variants: [
            {
              begin: "\\$\\(" + hljs.UNDERSCORE_IDENT_RE + "\\)",
              contains: [hljs.BACKSLASH_ESCAPE]
            },
            { begin: /\$[@%<?\^\+\*]/ }
          ]
        };
        const QUOTE_STRING = {
          className: "string",
          begin: /"/,
          end: /"/,
          contains: [
            hljs.BACKSLASH_ESCAPE,
            VARIABLE
          ]
        };
        const FUNC = {
          className: "variable",
          begin: /\$\([\w-]+\s/,
          end: /\)/,
          keywords: { built_in: "subst patsubst strip findstring filter filter-out sort word wordlist firstword lastword dir notdir suffix basename addsuffix addprefix join wildcard realpath abspath error warning shell origin flavor foreach if or and call eval file value" },
          contains: [
            VARIABLE,
            QUOTE_STRING
            // Added QUOTE_STRING as they can be a part of functions
          ]
        };
        const ASSIGNMENT = { begin: "^" + hljs.UNDERSCORE_IDENT_RE + "\\s*(?=[:+?]?=)" };
        const META = {
          className: "meta",
          begin: /^\.PHONY:/,
          end: /$/,
          keywords: {
            $pattern: /[\.\w]+/,
            keyword: ".PHONY"
          }
        };
        const TARGET = {
          className: "section",
          begin: /^[^\s]+:/,
          end: /$/,
          contains: [VARIABLE]
        };
        return {
          name: "Makefile",
          aliases: [
            "mk",
            "mak",
            "make"
          ],
          keywords: {
            $pattern: /[\w-]+/,
            keyword: "define endef undefine ifdef ifndef ifeq ifneq else endif include -include sinclude override export unexport private vpath"
          },
          contains: [
            hljs.HASH_COMMENT_MODE,
            VARIABLE,
            QUOTE_STRING,
            FUNC,
            ASSIGNMENT,
            META,
            TARGET
          ]
        };
      }
      module.exports = makefile;
    }
  });

  // node_modules/highlight.js/lib/languages/perl.js
  var require_perl = __commonJS({
    "node_modules/highlight.js/lib/languages/perl.js"(exports, module) {
      function perl(hljs) {
        const regex = hljs.regex;
        const KEYWORDS = [
          "abs",
          "accept",
          "alarm",
          "and",
          "atan2",
          "bind",
          "binmode",
          "bless",
          "break",
          "caller",
          "chdir",
          "chmod",
          "chomp",
          "chop",
          "chown",
          "chr",
          "chroot",
          "class",
          "close",
          "closedir",
          "connect",
          "continue",
          "cos",
          "crypt",
          "dbmclose",
          "dbmopen",
          "defined",
          "delete",
          "die",
          "do",
          "dump",
          "each",
          "else",
          "elsif",
          "endgrent",
          "endhostent",
          "endnetent",
          "endprotoent",
          "endpwent",
          "endservent",
          "eof",
          "eval",
          "exec",
          "exists",
          "exit",
          "exp",
          "fcntl",
          "field",
          "fileno",
          "flock",
          "for",
          "foreach",
          "fork",
          "format",
          "formline",
          "getc",
          "getgrent",
          "getgrgid",
          "getgrnam",
          "gethostbyaddr",
          "gethostbyname",
          "gethostent",
          "getlogin",
          "getnetbyaddr",
          "getnetbyname",
          "getnetent",
          "getpeername",
          "getpgrp",
          "getpriority",
          "getprotobyname",
          "getprotobynumber",
          "getprotoent",
          "getpwent",
          "getpwnam",
          "getpwuid",
          "getservbyname",
          "getservbyport",
          "getservent",
          "getsockname",
          "getsockopt",
          "given",
          "glob",
          "gmtime",
          "goto",
          "grep",
          "gt",
          "hex",
          "if",
          "index",
          "int",
          "ioctl",
          "join",
          "keys",
          "kill",
          "last",
          "lc",
          "lcfirst",
          "length",
          "link",
          "listen",
          "local",
          "localtime",
          "log",
          "lstat",
          "lt",
          "ma",
          "map",
          "method",
          "mkdir",
          "msgctl",
          "msgget",
          "msgrcv",
          "msgsnd",
          "my",
          "ne",
          "next",
          "no",
          "not",
          "oct",
          "open",
          "opendir",
          "or",
          "ord",
          "our",
          "pack",
          "package",
          "pipe",
          "pop",
          "pos",
          "print",
          "printf",
          "prototype",
          "push",
          "q|0",
          "qq",
          "quotemeta",
          "qw",
          "qx",
          "rand",
          "read",
          "readdir",
          "readline",
          "readlink",
          "readpipe",
          "recv",
          "redo",
          "ref",
          "rename",
          "require",
          "reset",
          "return",
          "reverse",
          "rewinddir",
          "rindex",
          "rmdir",
          "say",
          "scalar",
          "seek",
          "seekdir",
          "select",
          "semctl",
          "semget",
          "semop",
          "send",
          "setgrent",
          "sethostent",
          "setnetent",
          "setpgrp",
          "setpriority",
          "setprotoent",
          "setpwent",
          "setservent",
          "setsockopt",
          "shift",
          "shmctl",
          "shmget",
          "shmread",
          "shmwrite",
          "shutdown",
          "sin",
          "sleep",
          "socket",
          "socketpair",
          "sort",
          "splice",
          "split",
          "sprintf",
          "sqrt",
          "srand",
          "stat",
          "state",
          "study",
          "sub",
          "substr",
          "symlink",
          "syscall",
          "sysopen",
          "sysread",
          "sysseek",
          "system",
          "syswrite",
          "tell",
          "telldir",
          "tie",
          "tied",
          "time",
          "times",
          "tr",
          "truncate",
          "uc",
          "ucfirst",
          "umask",
          "undef",
          "unless",
          "unlink",
          "unpack",
          "unshift",
          "untie",
          "until",
          "use",
          "utime",
          "values",
          "vec",
          "wait",
          "waitpid",
          "wantarray",
          "warn",
          "when",
          "while",
          "write",
          "x|0",
          "xor",
          "y|0"
        ];
        const REGEX_MODIFIERS = /[dualxmsipngr]{0,12}/;
        const PERL_KEYWORDS = {
          $pattern: /[\w.]+/,
          keyword: KEYWORDS.join(" ")
        };
        const SUBST = {
          className: "subst",
          begin: "[$@]\\{",
          end: "\\}",
          keywords: PERL_KEYWORDS
        };
        const METHOD = {
          begin: /->\{/,
          end: /\}/
          // contains defined later
        };
        const ATTR = {
          scope: "attr",
          match: /\s+:\s*\w+(\s*\(.*?\))?/
        };
        const VAR = {
          scope: "variable",
          variants: [
            { begin: /\$\d/ },
            {
              begin: regex.concat(
                /[$%@](?!")(\^\w\b|#\w+(::\w+)*|\{\w+\}|\w+(::\w*)*)/,
                // negative look-ahead tries to avoid matching patterns that are not
                // Perl at all like $ident$, @ident@, etc.
                `(?![A-Za-z])(?![@$%])`
              )
            },
            {
              // Only $= is a special Perl variable and one can't declare @= or %=.
              begin: /[$%@](?!")[^\s\w{=]|\$=/,
              relevance: 0
            }
          ],
          contains: [ATTR]
        };
        const NUMBER = {
          className: "number",
          variants: [
            // decimal numbers:
            // include the case where a number starts with a dot (eg. .9), and
            // the leading 0? avoids mixing the first and second match on 0.x cases
            { match: /0?\.[0-9][0-9_]+\b/ },
            // include the special versioned number (eg. v5.38)
            { match: /\bv?(0|[1-9][0-9_]*(\.[0-9_]+)?|[1-9][0-9_]*)\b/ },
            // non-decimal numbers:
            { match: /\b0[0-7][0-7_]*\b/ },
            { match: /\b0x[0-9a-fA-F][0-9a-fA-F_]*\b/ },
            { match: /\b0b[0-1][0-1_]*\b/ }
          ],
          relevance: 0
        };
        const STRING_CONTAINS = [
          hljs.BACKSLASH_ESCAPE,
          SUBST,
          VAR
        ];
        const REGEX_DELIMS = [
          /!/,
          /\//,
          /\|/,
          /\?/,
          /'/,
          /"/,
          // valid but infrequent and weird
          /#/
          // valid but infrequent and weird
        ];
        const PAIRED_DOUBLE_RE = (prefix, open, close = "\\1") => {
          const middle = close === "\\1" ? close : regex.concat(close, open);
          return regex.concat(
            regex.concat("(?:", prefix, ")"),
            open,
            /(?:\\.|[^\\\/])*?/,
            middle,
            /(?:\\.|[^\\\/])*?/,
            close,
            REGEX_MODIFIERS
          );
        };
        const PAIRED_RE = (prefix, open, close) => {
          return regex.concat(
            regex.concat("(?:", prefix, ")"),
            open,
            /(?:\\.|[^\\\/])*?/,
            close,
            REGEX_MODIFIERS
          );
        };
        const PERL_DEFAULT_CONTAINS = [
          VAR,
          hljs.HASH_COMMENT_MODE,
          hljs.COMMENT(
            /^=\w/,
            /=cut/,
            { endsWithParent: true }
          ),
          METHOD,
          {
            className: "string",
            contains: STRING_CONTAINS,
            variants: [
              {
                begin: "q[qwxr]?\\s*\\(",
                end: "\\)",
                relevance: 5
              },
              {
                begin: "q[qwxr]?\\s*\\[",
                end: "\\]",
                relevance: 5
              },
              {
                begin: "q[qwxr]?\\s*\\{",
                end: "\\}",
                relevance: 5
              },
              {
                begin: "q[qwxr]?\\s*\\|",
                end: "\\|",
                relevance: 5
              },
              {
                begin: "q[qwxr]?\\s*<",
                end: ">",
                relevance: 5
              },
              {
                begin: "qw\\s+q",
                end: "q",
                relevance: 5
              },
              {
                begin: "'",
                end: "'",
                contains: [hljs.BACKSLASH_ESCAPE]
              },
              {
                begin: '"',
                end: '"'
              },
              {
                begin: "`",
                end: "`",
                contains: [hljs.BACKSLASH_ESCAPE]
              },
              {
                begin: /\{\w+\}/,
                relevance: 0
              },
              {
                begin: "-?\\w+\\s*=>",
                relevance: 0
              }
            ]
          },
          NUMBER,
          {
            // regexp container
            begin: "(\\/\\/|" + hljs.RE_STARTERS_RE + "|\\b(split|return|print|reverse|grep)\\b)\\s*",
            keywords: "split return print reverse grep",
            relevance: 0,
            contains: [
              hljs.HASH_COMMENT_MODE,
              {
                className: "regexp",
                variants: [
                  // allow matching common delimiters
                  { begin: PAIRED_DOUBLE_RE("s|tr|y", regex.either(...REGEX_DELIMS, { capture: true })) },
                  // and then paired delmis
                  { begin: PAIRED_DOUBLE_RE("s|tr|y", "\\(", "\\)") },
                  { begin: PAIRED_DOUBLE_RE("s|tr|y", "\\[", "\\]") },
                  { begin: PAIRED_DOUBLE_RE("s|tr|y", "\\{", "\\}") }
                ],
                relevance: 2
              },
              {
                className: "regexp",
                variants: [
                  {
                    // could be a comment in many languages so do not count
                    // as relevant
                    begin: /(m|qr)\/\//,
                    relevance: 0
                  },
                  // prefix is optional with /regex/
                  { begin: PAIRED_RE("(?:m|qr)?", /\//, /\//) },
                  // allow matching common delimiters
                  { begin: PAIRED_RE("m|qr", regex.either(...REGEX_DELIMS, { capture: true }), /\1/) },
                  // allow common paired delmins
                  { begin: PAIRED_RE("m|qr", /\(/, /\)/) },
                  { begin: PAIRED_RE("m|qr", /\[/, /\]/) },
                  { begin: PAIRED_RE("m|qr", /\{/, /\}/) }
                ]
              }
            ]
          },
          {
            className: "function",
            beginKeywords: "sub method",
            end: "(\\s*\\(.*?\\))?[;{]",
            excludeEnd: true,
            relevance: 5,
            contains: [hljs.TITLE_MODE, ATTR]
          },
          {
            className: "class",
            beginKeywords: "class",
            end: "[;{]",
            excludeEnd: true,
            relevance: 5,
            contains: [hljs.TITLE_MODE, ATTR, NUMBER]
          },
          {
            begin: "-\\w\\b",
            relevance: 0
          },
          {
            begin: "^__DATA__$",
            end: "^__END__$",
            subLanguage: "mojolicious",
            contains: [
              {
                begin: "^@@.*",
                end: "$",
                className: "comment"
              }
            ]
          }
        ];
        SUBST.contains = PERL_DEFAULT_CONTAINS;
        METHOD.contains = PERL_DEFAULT_CONTAINS;
        return {
          name: "Perl",
          aliases: [
            "pl",
            "pm"
          ],
          keywords: PERL_KEYWORDS,
          contains: PERL_DEFAULT_CONTAINS
        };
      }
      module.exports = perl;
    }
  });

  // node_modules/highlight.js/lib/languages/nginx.js
  var require_nginx = __commonJS({
    "node_modules/highlight.js/lib/languages/nginx.js"(exports, module) {
      function nginx(hljs) {
        const regex = hljs.regex;
        const VAR = {
          className: "variable",
          variants: [
            { begin: /\$\d+/ },
            { begin: /\$\{\w+\}/ },
            { begin: regex.concat(/[$@]/, hljs.UNDERSCORE_IDENT_RE) }
          ]
        };
        const LITERALS = [
          "on",
          "off",
          "yes",
          "no",
          "true",
          "false",
          "none",
          "blocked",
          "debug",
          "info",
          "notice",
          "warn",
          "error",
          "crit",
          "select",
          "break",
          "last",
          "permanent",
          "redirect",
          "kqueue",
          "rtsig",
          "epoll",
          "poll",
          "/dev/poll"
        ];
        const DEFAULT = {
          endsWithParent: true,
          keywords: {
            $pattern: /[a-z_]{2,}|\/dev\/poll/,
            literal: LITERALS
          },
          relevance: 0,
          illegal: "=>",
          contains: [
            hljs.HASH_COMMENT_MODE,
            {
              className: "string",
              contains: [
                hljs.BACKSLASH_ESCAPE,
                VAR
              ],
              variants: [
                {
                  begin: /"/,
                  end: /"/
                },
                {
                  begin: /'/,
                  end: /'/
                }
              ]
            },
            // this swallows entire URLs to avoid detecting numbers within
            {
              begin: "([a-z]+):/",
              end: "\\s",
              endsWithParent: true,
              excludeEnd: true,
              contains: [VAR]
            },
            {
              className: "regexp",
              contains: [
                hljs.BACKSLASH_ESCAPE,
                VAR
              ],
              variants: [
                {
                  begin: "\\s\\^",
                  end: "\\s|\\{|;",
                  returnEnd: true
                },
                // regexp locations (~, ~*)
                {
                  begin: "~\\*?\\s+",
                  end: "\\s|\\{|;",
                  returnEnd: true
                },
                // *.example.com
                { begin: "\\*(\\.[a-z\\-]+)+" },
                // sub.example.*
                { begin: "([a-z\\-]+\\.)+\\*" }
              ]
            },
            // IP
            {
              className: "number",
              begin: "\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}(:\\d{1,5})?\\b"
            },
            // units
            {
              className: "number",
              begin: "\\b\\d+[kKmMgGdshdwy]?\\b",
              relevance: 0
            },
            VAR
          ]
        };
        return {
          name: "Nginx config",
          aliases: ["nginxconf"],
          contains: [
            hljs.HASH_COMMENT_MODE,
            {
              beginKeywords: "upstream location",
              end: /;|\{/,
              contains: DEFAULT.contains,
              keywords: { section: "upstream location" }
            },
            {
              className: "section",
              begin: regex.concat(hljs.UNDERSCORE_IDENT_RE + regex.lookahead(/\s+\{/)),
              relevance: 0
            },
            {
              begin: regex.lookahead(hljs.UNDERSCORE_IDENT_RE + "\\s"),
              end: ";|\\{",
              contains: [
                {
                  className: "attribute",
                  begin: hljs.UNDERSCORE_IDENT_RE,
                  starts: DEFAULT
                }
              ],
              relevance: 0
            }
          ],
          illegal: "[^\\s\\}\\{]"
        };
      }
      module.exports = nginx;
    }
  });

  // node_modules/highlight.js/lib/languages/objectivec.js
  var require_objectivec = __commonJS({
    "node_modules/highlight.js/lib/languages/objectivec.js"(exports, module) {
      function objectivec(hljs) {
        const API_CLASS = {
          className: "built_in",
          begin: "\\b(AV|CA|CF|CG|CI|CL|CM|CN|CT|MK|MP|MTK|MTL|NS|SCN|SK|UI|WK|XC)\\w+"
        };
        const IDENTIFIER_RE = /[a-zA-Z@][a-zA-Z0-9_]*/;
        const TYPES = [
          "int",
          "float",
          "char",
          "unsigned",
          "signed",
          "short",
          "long",
          "double",
          "wchar_t",
          "unichar",
          "void",
          "bool",
          "BOOL",
          "id|0",
          "_Bool"
        ];
        const KWS = [
          "while",
          "export",
          "sizeof",
          "typedef",
          "const",
          "struct",
          "for",
          "union",
          "volatile",
          "static",
          "mutable",
          "if",
          "do",
          "return",
          "goto",
          "enum",
          "else",
          "break",
          "extern",
          "asm",
          "case",
          "default",
          "register",
          "explicit",
          "typename",
          "switch",
          "continue",
          "inline",
          "readonly",
          "assign",
          "readwrite",
          "self",
          "@synchronized",
          "id",
          "typeof",
          "nonatomic",
          "IBOutlet",
          "IBAction",
          "strong",
          "weak",
          "copy",
          "in",
          "out",
          "inout",
          "bycopy",
          "byref",
          "oneway",
          "__strong",
          "__weak",
          "__block",
          "__autoreleasing",
          "@private",
          "@protected",
          "@public",
          "@try",
          "@property",
          "@end",
          "@throw",
          "@catch",
          "@finally",
          "@autoreleasepool",
          "@synthesize",
          "@dynamic",
          "@selector",
          "@optional",
          "@required",
          "@encode",
          "@package",
          "@import",
          "@defs",
          "@compatibility_alias",
          "__bridge",
          "__bridge_transfer",
          "__bridge_retained",
          "__bridge_retain",
          "__covariant",
          "__contravariant",
          "__kindof",
          "_Nonnull",
          "_Nullable",
          "_Null_unspecified",
          "__FUNCTION__",
          "__PRETTY_FUNCTION__",
          "__attribute__",
          "getter",
          "setter",
          "retain",
          "unsafe_unretained",
          "nonnull",
          "nullable",
          "null_unspecified",
          "null_resettable",
          "class",
          "instancetype",
          "NS_DESIGNATED_INITIALIZER",
          "NS_UNAVAILABLE",
          "NS_REQUIRES_SUPER",
          "NS_RETURNS_INNER_POINTER",
          "NS_INLINE",
          "NS_AVAILABLE",
          "NS_DEPRECATED",
          "NS_ENUM",
          "NS_OPTIONS",
          "NS_SWIFT_UNAVAILABLE",
          "NS_ASSUME_NONNULL_BEGIN",
          "NS_ASSUME_NONNULL_END",
          "NS_REFINED_FOR_SWIFT",
          "NS_SWIFT_NAME",
          "NS_SWIFT_NOTHROW",
          "NS_DURING",
          "NS_HANDLER",
          "NS_ENDHANDLER",
          "NS_VALUERETURN",
          "NS_VOIDRETURN"
        ];
        const LITERALS = [
          "false",
          "true",
          "FALSE",
          "TRUE",
          "nil",
          "YES",
          "NO",
          "NULL"
        ];
        const BUILT_INS = [
          "dispatch_once_t",
          "dispatch_queue_t",
          "dispatch_sync",
          "dispatch_async",
          "dispatch_once"
        ];
        const KEYWORDS = {
          "variable.language": [
            "this",
            "super"
          ],
          $pattern: IDENTIFIER_RE,
          keyword: KWS,
          literal: LITERALS,
          built_in: BUILT_INS,
          type: TYPES
        };
        const CLASS_KEYWORDS = {
          $pattern: IDENTIFIER_RE,
          keyword: [
            "@interface",
            "@class",
            "@protocol",
            "@implementation"
          ]
        };
        return {
          name: "Objective-C",
          aliases: [
            "mm",
            "objc",
            "obj-c",
            "obj-c++",
            "objective-c++"
          ],
          keywords: KEYWORDS,
          illegal: "</",
          contains: [
            API_CLASS,
            hljs.C_LINE_COMMENT_MODE,
            hljs.C_BLOCK_COMMENT_MODE,
            hljs.C_NUMBER_MODE,
            hljs.QUOTE_STRING_MODE,
            hljs.APOS_STRING_MODE,
            {
              className: "string",
              variants: [
                {
                  begin: '@"',
                  end: '"',
                  illegal: "\\n",
                  contains: [hljs.BACKSLASH_ESCAPE]
                }
              ]
            },
            {
              className: "meta",
              begin: /#\s*[a-z]+\b/,
              end: /$/,
              keywords: { keyword: "if else elif endif define undef warning error line pragma ifdef ifndef include" },
              contains: [
                {
                  begin: /\\\n/,
                  relevance: 0
                },
                hljs.inherit(hljs.QUOTE_STRING_MODE, { className: "string" }),
                {
                  className: "string",
                  begin: /<.*?>/,
                  end: /$/,
                  illegal: "\\n"
                },
                hljs.C_LINE_COMMENT_MODE,
                hljs.C_BLOCK_COMMENT_MODE
              ]
            },
            {
              className: "class",
              begin: "(" + CLASS_KEYWORDS.keyword.join("|") + ")\\b",
              end: /(\{|$)/,
              excludeEnd: true,
              keywords: CLASS_KEYWORDS,
              contains: [hljs.UNDERSCORE_TITLE_MODE]
            },
            {
              begin: "\\." + hljs.UNDERSCORE_IDENT_RE,
              relevance: 0
            }
          ]
        };
      }
      module.exports = objectivec;
    }
  });

  // node_modules/highlight.js/lib/languages/pgsql.js
  var require_pgsql = __commonJS({
    "node_modules/highlight.js/lib/languages/pgsql.js"(exports, module) {
      function pgsql(hljs) {
        const COMMENT_MODE = hljs.COMMENT("--", "$");
        const UNQUOTED_IDENT = "[a-zA-Z_][a-zA-Z_0-9$]*";
        const DOLLAR_STRING = "\\$([a-zA-Z_]?|[a-zA-Z_][a-zA-Z_0-9]*)\\$";
        const LABEL = "<<\\s*" + UNQUOTED_IDENT + "\\s*>>";
        const SQL_KW = (
          // https://www.postgresql.org/docs/11/static/sql-keywords-appendix.html
          // https://www.postgresql.org/docs/11/static/sql-commands.html
          // SQL commands (starting words)
          "ABORT ALTER ANALYZE BEGIN CALL CHECKPOINT|10 CLOSE CLUSTER COMMENT COMMIT COPY CREATE DEALLOCATE DECLARE DELETE DISCARD DO DROP END EXECUTE EXPLAIN FETCH GRANT IMPORT INSERT LISTEN LOAD LOCK MOVE NOTIFY PREPARE REASSIGN|10 REFRESH REINDEX RELEASE RESET REVOKE ROLLBACK SAVEPOINT SECURITY SELECT SET SHOW START TRUNCATE UNLISTEN|10 UPDATE VACUUM|10 VALUES AGGREGATE COLLATION CONVERSION|10 DATABASE DEFAULT PRIVILEGES DOMAIN TRIGGER EXTENSION FOREIGN WRAPPER|10 TABLE FUNCTION GROUP LANGUAGE LARGE OBJECT MATERIALIZED VIEW OPERATOR CLASS FAMILY POLICY PUBLICATION|10 ROLE RULE SCHEMA SEQUENCE SERVER STATISTICS SUBSCRIPTION SYSTEM TABLESPACE CONFIGURATION DICTIONARY PARSER TEMPLATE TYPE USER MAPPING PREPARED ACCESS METHOD CAST AS TRANSFORM TRANSACTION OWNED TO INTO SESSION AUTHORIZATION INDEX PROCEDURE ASSERTION ALL ANALYSE AND ANY ARRAY ASC ASYMMETRIC|10 BOTH CASE CHECK COLLATE COLUMN CONCURRENTLY|10 CONSTRAINT CROSS DEFERRABLE RANGE DESC DISTINCT ELSE EXCEPT FOR FREEZE|10 FROM FULL HAVING ILIKE IN INITIALLY INNER INTERSECT IS ISNULL JOIN LATERAL LEADING LIKE LIMIT NATURAL NOT NOTNULL NULL OFFSET ON ONLY OR ORDER OUTER OVERLAPS PLACING PRIMARY REFERENCES RETURNING SIMILAR SOME SYMMETRIC TABLESAMPLE THEN TRAILING UNION UNIQUE USING VARIADIC|10 VERBOSE WHEN WHERE WINDOW WITH BY RETURNS INOUT OUT SETOF|10 IF STRICT CURRENT CONTINUE OWNER LOCATION OVER PARTITION WITHIN BETWEEN ESCAPE EXTERNAL INVOKER DEFINER WORK RENAME VERSION CONNECTION CONNECT TABLES TEMP TEMPORARY FUNCTIONS SEQUENCES TYPES SCHEMAS OPTION CASCADE RESTRICT ADD ADMIN EXISTS VALID VALIDATE ENABLE DISABLE REPLICA|10 ALWAYS PASSING COLUMNS PATH REF VALUE OVERRIDING IMMUTABLE STABLE VOLATILE BEFORE AFTER EACH ROW PROCEDURAL ROUTINE NO HANDLER VALIDATOR OPTIONS STORAGE OIDS|10 WITHOUT INHERIT DEPENDS CALLED INPUT LEAKPROOF|10 COST ROWS NOWAIT SEARCH UNTIL ENCRYPTED|10 PASSWORD CONFLICT|10 INSTEAD INHERITS CHARACTERISTICS WRITE CURSOR ALSO STATEMENT SHARE EXCLUSIVE INLINE ISOLATION REPEATABLE READ COMMITTED SERIALIZABLE UNCOMMITTED LOCAL GLOBAL SQL PROCEDURES RECURSIVE SNAPSHOT ROLLUP CUBE TRUSTED|10 INCLUDE FOLLOWING PRECEDING UNBOUNDED RANGE GROUPS UNENCRYPTED|10 SYSID FORMAT DELIMITER HEADER QUOTE ENCODING FILTER OFF FORCE_QUOTE FORCE_NOT_NULL FORCE_NULL COSTS BUFFERS TIMING SUMMARY DISABLE_PAGE_SKIPPING RESTART CYCLE GENERATED IDENTITY DEFERRED IMMEDIATE LEVEL LOGGED UNLOGGED OF NOTHING NONE EXCLUDE ATTRIBUTE USAGE ROUTINES TRUE FALSE NAN INFINITY "
        );
        const ROLE_ATTRS = (
          // only those not in keywrods already
          "SUPERUSER NOSUPERUSER CREATEDB NOCREATEDB CREATEROLE NOCREATEROLE INHERIT NOINHERIT LOGIN NOLOGIN REPLICATION NOREPLICATION BYPASSRLS NOBYPASSRLS "
        );
        const PLPGSQL_KW = "ALIAS BEGIN CONSTANT DECLARE END EXCEPTION RETURN PERFORM|10 RAISE GET DIAGNOSTICS STACKED|10 FOREACH LOOP ELSIF EXIT WHILE REVERSE SLICE DEBUG LOG INFO NOTICE WARNING ASSERT OPEN ";
        const TYPES = (
          // https://www.postgresql.org/docs/11/static/datatype.html
          "BIGINT INT8 BIGSERIAL SERIAL8 BIT VARYING VARBIT BOOLEAN BOOL BOX BYTEA CHARACTER CHAR VARCHAR CIDR CIRCLE DATE DOUBLE PRECISION FLOAT8 FLOAT INET INTEGER INT INT4 INTERVAL JSON JSONB LINE LSEG|10 MACADDR MACADDR8 MONEY NUMERIC DEC DECIMAL PATH POINT POLYGON REAL FLOAT4 SMALLINT INT2 SMALLSERIAL|10 SERIAL2|10 SERIAL|10 SERIAL4|10 TEXT TIME ZONE TIMETZ|10 TIMESTAMP TIMESTAMPTZ|10 TSQUERY|10 TSVECTOR|10 TXID_SNAPSHOT|10 UUID XML NATIONAL NCHAR INT4RANGE|10 INT8RANGE|10 NUMRANGE|10 TSRANGE|10 TSTZRANGE|10 DATERANGE|10 ANYELEMENT ANYARRAY ANYNONARRAY ANYENUM ANYRANGE CSTRING INTERNAL RECORD PG_DDL_COMMAND VOID UNKNOWN OPAQUE REFCURSOR NAME OID REGPROC|10 REGPROCEDURE|10 REGOPER|10 REGOPERATOR|10 REGCLASS|10 REGTYPE|10 REGROLE|10 REGNAMESPACE|10 REGCONFIG|10 REGDICTIONARY|10 "
        );
        const TYPES_RE = TYPES.trim().split(" ").map(function(val) {
          return val.split("|")[0];
        }).join("|");
        const SQL_BI = "CURRENT_TIME CURRENT_TIMESTAMP CURRENT_USER CURRENT_CATALOG|10 CURRENT_DATE LOCALTIME LOCALTIMESTAMP CURRENT_ROLE|10 CURRENT_SCHEMA|10 SESSION_USER PUBLIC ";
        const PLPGSQL_BI = "FOUND NEW OLD TG_NAME|10 TG_WHEN|10 TG_LEVEL|10 TG_OP|10 TG_RELID|10 TG_RELNAME|10 TG_TABLE_NAME|10 TG_TABLE_SCHEMA|10 TG_NARGS|10 TG_ARGV|10 TG_EVENT|10 TG_TAG|10 ROW_COUNT RESULT_OID|10 PG_CONTEXT|10 RETURNED_SQLSTATE COLUMN_NAME CONSTRAINT_NAME PG_DATATYPE_NAME|10 MESSAGE_TEXT TABLE_NAME SCHEMA_NAME PG_EXCEPTION_DETAIL|10 PG_EXCEPTION_HINT|10 PG_EXCEPTION_CONTEXT|10 ";
        const PLPGSQL_EXCEPTIONS = (
          // exceptions https://www.postgresql.org/docs/current/static/errcodes-appendix.html
          "SQLSTATE SQLERRM|10 SUCCESSFUL_COMPLETION WARNING DYNAMIC_RESULT_SETS_RETURNED IMPLICIT_ZERO_BIT_PADDING NULL_VALUE_ELIMINATED_IN_SET_FUNCTION PRIVILEGE_NOT_GRANTED PRIVILEGE_NOT_REVOKED STRING_DATA_RIGHT_TRUNCATION DEPRECATED_FEATURE NO_DATA NO_ADDITIONAL_DYNAMIC_RESULT_SETS_RETURNED SQL_STATEMENT_NOT_YET_COMPLETE CONNECTION_EXCEPTION CONNECTION_DOES_NOT_EXIST CONNECTION_FAILURE SQLCLIENT_UNABLE_TO_ESTABLISH_SQLCONNECTION SQLSERVER_REJECTED_ESTABLISHMENT_OF_SQLCONNECTION TRANSACTION_RESOLUTION_UNKNOWN PROTOCOL_VIOLATION TRIGGERED_ACTION_EXCEPTION FEATURE_NOT_SUPPORTED INVALID_TRANSACTION_INITIATION LOCATOR_EXCEPTION INVALID_LOCATOR_SPECIFICATION INVALID_GRANTOR INVALID_GRANT_OPERATION INVALID_ROLE_SPECIFICATION DIAGNOSTICS_EXCEPTION STACKED_DIAGNOSTICS_ACCESSED_WITHOUT_ACTIVE_HANDLER CASE_NOT_FOUND CARDINALITY_VIOLATION DATA_EXCEPTION ARRAY_SUBSCRIPT_ERROR CHARACTER_NOT_IN_REPERTOIRE DATETIME_FIELD_OVERFLOW DIVISION_BY_ZERO ERROR_IN_ASSIGNMENT ESCAPE_CHARACTER_CONFLICT INDICATOR_OVERFLOW INTERVAL_FIELD_OVERFLOW INVALID_ARGUMENT_FOR_LOGARITHM INVALID_ARGUMENT_FOR_NTILE_FUNCTION INVALID_ARGUMENT_FOR_NTH_VALUE_FUNCTION INVALID_ARGUMENT_FOR_POWER_FUNCTION INVALID_ARGUMENT_FOR_WIDTH_BUCKET_FUNCTION INVALID_CHARACTER_VALUE_FOR_CAST INVALID_DATETIME_FORMAT INVALID_ESCAPE_CHARACTER INVALID_ESCAPE_OCTET INVALID_ESCAPE_SEQUENCE NONSTANDARD_USE_OF_ESCAPE_CHARACTER INVALID_INDICATOR_PARAMETER_VALUE INVALID_PARAMETER_VALUE INVALID_REGULAR_EXPRESSION INVALID_ROW_COUNT_IN_LIMIT_CLAUSE INVALID_ROW_COUNT_IN_RESULT_OFFSET_CLAUSE INVALID_TABLESAMPLE_ARGUMENT INVALID_TABLESAMPLE_REPEAT INVALID_TIME_ZONE_DISPLACEMENT_VALUE INVALID_USE_OF_ESCAPE_CHARACTER MOST_SPECIFIC_TYPE_MISMATCH NULL_VALUE_NOT_ALLOWED NULL_VALUE_NO_INDICATOR_PARAMETER NUMERIC_VALUE_OUT_OF_RANGE SEQUENCE_GENERATOR_LIMIT_EXCEEDED STRING_DATA_LENGTH_MISMATCH STRING_DATA_RIGHT_TRUNCATION SUBSTRING_ERROR TRIM_ERROR UNTERMINATED_C_STRING ZERO_LENGTH_CHARACTER_STRING FLOATING_POINT_EXCEPTION INVALID_TEXT_REPRESENTATION INVALID_BINARY_REPRESENTATION BAD_COPY_FILE_FORMAT UNTRANSLATABLE_CHARACTER NOT_AN_XML_DOCUMENT INVALID_XML_DOCUMENT INVALID_XML_CONTENT INVALID_XML_COMMENT INVALID_XML_PROCESSING_INSTRUCTION INTEGRITY_CONSTRAINT_VIOLATION RESTRICT_VIOLATION NOT_NULL_VIOLATION FOREIGN_KEY_VIOLATION UNIQUE_VIOLATION CHECK_VIOLATION EXCLUSION_VIOLATION INVALID_CURSOR_STATE INVALID_TRANSACTION_STATE ACTIVE_SQL_TRANSACTION BRANCH_TRANSACTION_ALREADY_ACTIVE HELD_CURSOR_REQUIRES_SAME_ISOLATION_LEVEL INAPPROPRIATE_ACCESS_MODE_FOR_BRANCH_TRANSACTION INAPPROPRIATE_ISOLATION_LEVEL_FOR_BRANCH_TRANSACTION NO_ACTIVE_SQL_TRANSACTION_FOR_BRANCH_TRANSACTION READ_ONLY_SQL_TRANSACTION SCHEMA_AND_DATA_STATEMENT_MIXING_NOT_SUPPORTED NO_ACTIVE_SQL_TRANSACTION IN_FAILED_SQL_TRANSACTION IDLE_IN_TRANSACTION_SESSION_TIMEOUT INVALID_SQL_STATEMENT_NAME TRIGGERED_DATA_CHANGE_VIOLATION INVALID_AUTHORIZATION_SPECIFICATION INVALID_PASSWORD DEPENDENT_PRIVILEGE_DESCRIPTORS_STILL_EXIST DEPENDENT_OBJECTS_STILL_EXIST INVALID_TRANSACTION_TERMINATION SQL_ROUTINE_EXCEPTION FUNCTION_EXECUTED_NO_RETURN_STATEMENT MODIFYING_SQL_DATA_NOT_PERMITTED PROHIBITED_SQL_STATEMENT_ATTEMPTED READING_SQL_DATA_NOT_PERMITTED INVALID_CURSOR_NAME EXTERNAL_ROUTINE_EXCEPTION CONTAINING_SQL_NOT_PERMITTED MODIFYING_SQL_DATA_NOT_PERMITTED PROHIBITED_SQL_STATEMENT_ATTEMPTED READING_SQL_DATA_NOT_PERMITTED EXTERNAL_ROUTINE_INVOCATION_EXCEPTION INVALID_SQLSTATE_RETURNED NULL_VALUE_NOT_ALLOWED TRIGGER_PROTOCOL_VIOLATED SRF_PROTOCOL_VIOLATED EVENT_TRIGGER_PROTOCOL_VIOLATED SAVEPOINT_EXCEPTION INVALID_SAVEPOINT_SPECIFICATION INVALID_CATALOG_NAME INVALID_SCHEMA_NAME TRANSACTION_ROLLBACK TRANSACTION_INTEGRITY_CONSTRAINT_VIOLATION SERIALIZATION_FAILURE STATEMENT_COMPLETION_UNKNOWN DEADLOCK_DETECTED SYNTAX_ERROR_OR_ACCESS_RULE_VIOLATION SYNTAX_ERROR INSUFFICIENT_PRIVILEGE CANNOT_COERCE GROUPING_ERROR WINDOWING_ERROR INVALID_RECURSION INVALID_FOREIGN_KEY INVALID_NAME NAME_TOO_LONG RESERVED_NAME DATATYPE_MISMATCH INDETERMINATE_DATATYPE COLLATION_MISMATCH INDETERMINATE_COLLATION WRONG_OBJECT_TYPE GENERATED_ALWAYS UNDEFINED_COLUMN UNDEFINED_FUNCTION UNDEFINED_TABLE UNDEFINED_PARAMETER UNDEFINED_OBJECT DUPLICATE_COLUMN DUPLICATE_CURSOR DUPLICATE_DATABASE DUPLICATE_FUNCTION DUPLICATE_PREPARED_STATEMENT DUPLICATE_SCHEMA DUPLICATE_TABLE DUPLICATE_ALIAS DUPLICATE_OBJECT AMBIGUOUS_COLUMN AMBIGUOUS_FUNCTION AMBIGUOUS_PARAMETER AMBIGUOUS_ALIAS INVALID_COLUMN_REFERENCE INVALID_COLUMN_DEFINITION INVALID_CURSOR_DEFINITION INVALID_DATABASE_DEFINITION INVALID_FUNCTION_DEFINITION INVALID_PREPARED_STATEMENT_DEFINITION INVALID_SCHEMA_DEFINITION INVALID_TABLE_DEFINITION INVALID_OBJECT_DEFINITION WITH_CHECK_OPTION_VIOLATION INSUFFICIENT_RESOURCES DISK_FULL OUT_OF_MEMORY TOO_MANY_CONNECTIONS CONFIGURATION_LIMIT_EXCEEDED PROGRAM_LIMIT_EXCEEDED STATEMENT_TOO_COMPLEX TOO_MANY_COLUMNS TOO_MANY_ARGUMENTS OBJECT_NOT_IN_PREREQUISITE_STATE OBJECT_IN_USE CANT_CHANGE_RUNTIME_PARAM LOCK_NOT_AVAILABLE OPERATOR_INTERVENTION QUERY_CANCELED ADMIN_SHUTDOWN CRASH_SHUTDOWN CANNOT_CONNECT_NOW DATABASE_DROPPED SYSTEM_ERROR IO_ERROR UNDEFINED_FILE DUPLICATE_FILE SNAPSHOT_TOO_OLD CONFIG_FILE_ERROR LOCK_FILE_EXISTS FDW_ERROR FDW_COLUMN_NAME_NOT_FOUND FDW_DYNAMIC_PARAMETER_VALUE_NEEDED FDW_FUNCTION_SEQUENCE_ERROR FDW_INCONSISTENT_DESCRIPTOR_INFORMATION FDW_INVALID_ATTRIBUTE_VALUE FDW_INVALID_COLUMN_NAME FDW_INVALID_COLUMN_NUMBER FDW_INVALID_DATA_TYPE FDW_INVALID_DATA_TYPE_DESCRIPTORS FDW_INVALID_DESCRIPTOR_FIELD_IDENTIFIER FDW_INVALID_HANDLE FDW_INVALID_OPTION_INDEX FDW_INVALID_OPTION_NAME FDW_INVALID_STRING_LENGTH_OR_BUFFER_LENGTH FDW_INVALID_STRING_FORMAT FDW_INVALID_USE_OF_NULL_POINTER FDW_TOO_MANY_HANDLES FDW_OUT_OF_MEMORY FDW_NO_SCHEMAS FDW_OPTION_NAME_NOT_FOUND FDW_REPLY_HANDLE FDW_SCHEMA_NOT_FOUND FDW_TABLE_NOT_FOUND FDW_UNABLE_TO_CREATE_EXECUTION FDW_UNABLE_TO_CREATE_REPLY FDW_UNABLE_TO_ESTABLISH_CONNECTION PLPGSQL_ERROR RAISE_EXCEPTION NO_DATA_FOUND TOO_MANY_ROWS ASSERT_FAILURE INTERNAL_ERROR DATA_CORRUPTED INDEX_CORRUPTED "
        );
        const FUNCTIONS = (
          // https://www.postgresql.org/docs/11/static/functions-aggregate.html
          "ARRAY_AGG AVG BIT_AND BIT_OR BOOL_AND BOOL_OR COUNT EVERY JSON_AGG JSONB_AGG JSON_OBJECT_AGG JSONB_OBJECT_AGG MAX MIN MODE STRING_AGG SUM XMLAGG CORR COVAR_POP COVAR_SAMP REGR_AVGX REGR_AVGY REGR_COUNT REGR_INTERCEPT REGR_R2 REGR_SLOPE REGR_SXX REGR_SXY REGR_SYY STDDEV STDDEV_POP STDDEV_SAMP VARIANCE VAR_POP VAR_SAMP PERCENTILE_CONT PERCENTILE_DISC ROW_NUMBER RANK DENSE_RANK PERCENT_RANK CUME_DIST NTILE LAG LEAD FIRST_VALUE LAST_VALUE NTH_VALUE NUM_NONNULLS NUM_NULLS ABS CBRT CEIL CEILING DEGREES DIV EXP FLOOR LN LOG MOD PI POWER RADIANS ROUND SCALE SIGN SQRT TRUNC WIDTH_BUCKET RANDOM SETSEED ACOS ACOSD ASIN ASIND ATAN ATAND ATAN2 ATAN2D COS COSD COT COTD SIN SIND TAN TAND BIT_LENGTH CHAR_LENGTH CHARACTER_LENGTH LOWER OCTET_LENGTH OVERLAY POSITION SUBSTRING TREAT TRIM UPPER ASCII BTRIM CHR CONCAT CONCAT_WS CONVERT CONVERT_FROM CONVERT_TO DECODE ENCODE INITCAP LEFT LENGTH LPAD LTRIM MD5 PARSE_IDENT PG_CLIENT_ENCODING QUOTE_IDENT|10 QUOTE_LITERAL|10 QUOTE_NULLABLE|10 REGEXP_MATCH REGEXP_MATCHES REGEXP_REPLACE REGEXP_SPLIT_TO_ARRAY REGEXP_SPLIT_TO_TABLE REPEAT REPLACE REVERSE RIGHT RPAD RTRIM SPLIT_PART STRPOS SUBSTR TO_ASCII TO_HEX TRANSLATE OCTET_LENGTH GET_BIT GET_BYTE SET_BIT SET_BYTE TO_CHAR TO_DATE TO_NUMBER TO_TIMESTAMP AGE CLOCK_TIMESTAMP|10 DATE_PART DATE_TRUNC ISFINITE JUSTIFY_DAYS JUSTIFY_HOURS JUSTIFY_INTERVAL MAKE_DATE MAKE_INTERVAL|10 MAKE_TIME MAKE_TIMESTAMP|10 MAKE_TIMESTAMPTZ|10 NOW STATEMENT_TIMESTAMP|10 TIMEOFDAY TRANSACTION_TIMESTAMP|10 ENUM_FIRST ENUM_LAST ENUM_RANGE AREA CENTER DIAMETER HEIGHT ISCLOSED ISOPEN NPOINTS PCLOSE POPEN RADIUS WIDTH BOX BOUND_BOX CIRCLE LINE LSEG PATH POLYGON ABBREV BROADCAST HOST HOSTMASK MASKLEN NETMASK NETWORK SET_MASKLEN TEXT INET_SAME_FAMILY INET_MERGE MACADDR8_SET7BIT ARRAY_TO_TSVECTOR GET_CURRENT_TS_CONFIG NUMNODE PLAINTO_TSQUERY PHRASETO_TSQUERY WEBSEARCH_TO_TSQUERY QUERYTREE SETWEIGHT STRIP TO_TSQUERY TO_TSVECTOR JSON_TO_TSVECTOR JSONB_TO_TSVECTOR TS_DELETE TS_FILTER TS_HEADLINE TS_RANK TS_RANK_CD TS_REWRITE TSQUERY_PHRASE TSVECTOR_TO_ARRAY TSVECTOR_UPDATE_TRIGGER TSVECTOR_UPDATE_TRIGGER_COLUMN XMLCOMMENT XMLCONCAT XMLELEMENT XMLFOREST XMLPI XMLROOT XMLEXISTS XML_IS_WELL_FORMED XML_IS_WELL_FORMED_DOCUMENT XML_IS_WELL_FORMED_CONTENT XPATH XPATH_EXISTS XMLTABLE XMLNAMESPACES TABLE_TO_XML TABLE_TO_XMLSCHEMA TABLE_TO_XML_AND_XMLSCHEMA QUERY_TO_XML QUERY_TO_XMLSCHEMA QUERY_TO_XML_AND_XMLSCHEMA CURSOR_TO_XML CURSOR_TO_XMLSCHEMA SCHEMA_TO_XML SCHEMA_TO_XMLSCHEMA SCHEMA_TO_XML_AND_XMLSCHEMA DATABASE_TO_XML DATABASE_TO_XMLSCHEMA DATABASE_TO_XML_AND_XMLSCHEMA XMLATTRIBUTES TO_JSON TO_JSONB ARRAY_TO_JSON ROW_TO_JSON JSON_BUILD_ARRAY JSONB_BUILD_ARRAY JSON_BUILD_OBJECT JSONB_BUILD_OBJECT JSON_OBJECT JSONB_OBJECT JSON_ARRAY_LENGTH JSONB_ARRAY_LENGTH JSON_EACH JSONB_EACH JSON_EACH_TEXT JSONB_EACH_TEXT JSON_EXTRACT_PATH JSONB_EXTRACT_PATH JSON_OBJECT_KEYS JSONB_OBJECT_KEYS JSON_POPULATE_RECORD JSONB_POPULATE_RECORD JSON_POPULATE_RECORDSET JSONB_POPULATE_RECORDSET JSON_ARRAY_ELEMENTS JSONB_ARRAY_ELEMENTS JSON_ARRAY_ELEMENTS_TEXT JSONB_ARRAY_ELEMENTS_TEXT JSON_TYPEOF JSONB_TYPEOF JSON_TO_RECORD JSONB_TO_RECORD JSON_TO_RECORDSET JSONB_TO_RECORDSET JSON_STRIP_NULLS JSONB_STRIP_NULLS JSONB_SET JSONB_INSERT JSONB_PRETTY CURRVAL LASTVAL NEXTVAL SETVAL COALESCE NULLIF GREATEST LEAST ARRAY_APPEND ARRAY_CAT ARRAY_NDIMS ARRAY_DIMS ARRAY_FILL ARRAY_LENGTH ARRAY_LOWER ARRAY_POSITION ARRAY_POSITIONS ARRAY_PREPEND ARRAY_REMOVE ARRAY_REPLACE ARRAY_TO_STRING ARRAY_UPPER CARDINALITY STRING_TO_ARRAY UNNEST ISEMPTY LOWER_INC UPPER_INC LOWER_INF UPPER_INF RANGE_MERGE GENERATE_SERIES GENERATE_SUBSCRIPTS CURRENT_DATABASE CURRENT_QUERY CURRENT_SCHEMA|10 CURRENT_SCHEMAS|10 INET_CLIENT_ADDR INET_CLIENT_PORT INET_SERVER_ADDR INET_SERVER_PORT ROW_SECURITY_ACTIVE FORMAT_TYPE TO_REGCLASS TO_REGPROC TO_REGPROCEDURE TO_REGOPER TO_REGOPERATOR TO_REGTYPE TO_REGNAMESPACE TO_REGROLE COL_DESCRIPTION OBJ_DESCRIPTION SHOBJ_DESCRIPTION TXID_CURRENT TXID_CURRENT_IF_ASSIGNED TXID_CURRENT_SNAPSHOT TXID_SNAPSHOT_XIP TXID_SNAPSHOT_XMAX TXID_SNAPSHOT_XMIN TXID_VISIBLE_IN_SNAPSHOT TXID_STATUS CURRENT_SETTING SET_CONFIG BRIN_SUMMARIZE_NEW_VALUES BRIN_SUMMARIZE_RANGE BRIN_DESUMMARIZE_RANGE GIN_CLEAN_PENDING_LIST SUPPRESS_REDUNDANT_UPDATES_TRIGGER LO_FROM_BYTEA LO_PUT LO_GET LO_CREAT LO_CREATE LO_UNLINK LO_IMPORT LO_EXPORT LOREAD LOWRITE GROUPING CAST "
        );
        const FUNCTIONS_RE = FUNCTIONS.trim().split(" ").map(function(val) {
          return val.split("|")[0];
        }).join("|");
        return {
          name: "PostgreSQL",
          aliases: [
            "postgres",
            "postgresql"
          ],
          supersetOf: "sql",
          case_insensitive: true,
          keywords: {
            keyword: SQL_KW + PLPGSQL_KW + ROLE_ATTRS,
            built_in: SQL_BI + PLPGSQL_BI + PLPGSQL_EXCEPTIONS
          },
          // Forbid some cunstructs from other languages to improve autodetect. In fact
          // "[a-z]:" is legal (as part of array slice), but improbabal.
          illegal: /:==|\W\s*\(\*|(^|\s)\$[a-z]|\{\{|[a-z]:\s*$|\.\.\.|TO:|DO:/,
          contains: [
            // special handling of some words, which are reserved only in some contexts
            {
              className: "keyword",
              variants: [
                { begin: /\bTEXT\s*SEARCH\b/ },
                { begin: /\b(PRIMARY|FOREIGN|FOR(\s+NO)?)\s+KEY\b/ },
                { begin: /\bPARALLEL\s+(UNSAFE|RESTRICTED|SAFE)\b/ },
                { begin: /\bSTORAGE\s+(PLAIN|EXTERNAL|EXTENDED|MAIN)\b/ },
                { begin: /\bMATCH\s+(FULL|PARTIAL|SIMPLE)\b/ },
                { begin: /\bNULLS\s+(FIRST|LAST)\b/ },
                { begin: /\bEVENT\s+TRIGGER\b/ },
                { begin: /\b(MAPPING|OR)\s+REPLACE\b/ },
                { begin: /\b(FROM|TO)\s+(PROGRAM|STDIN|STDOUT)\b/ },
                { begin: /\b(SHARE|EXCLUSIVE)\s+MODE\b/ },
                { begin: /\b(LEFT|RIGHT)\s+(OUTER\s+)?JOIN\b/ },
                { begin: /\b(FETCH|MOVE)\s+(NEXT|PRIOR|FIRST|LAST|ABSOLUTE|RELATIVE|FORWARD|BACKWARD)\b/ },
                { begin: /\bPRESERVE\s+ROWS\b/ },
                { begin: /\bDISCARD\s+PLANS\b/ },
                { begin: /\bREFERENCING\s+(OLD|NEW)\b/ },
                { begin: /\bSKIP\s+LOCKED\b/ },
                { begin: /\bGROUPING\s+SETS\b/ },
                { begin: /\b(BINARY|INSENSITIVE|SCROLL|NO\s+SCROLL)\s+(CURSOR|FOR)\b/ },
                { begin: /\b(WITH|WITHOUT)\s+HOLD\b/ },
                { begin: /\bWITH\s+(CASCADED|LOCAL)\s+CHECK\s+OPTION\b/ },
                { begin: /\bEXCLUDE\s+(TIES|NO\s+OTHERS)\b/ },
                { begin: /\bFORMAT\s+(TEXT|XML|JSON|YAML)\b/ },
                { begin: /\bSET\s+((SESSION|LOCAL)\s+)?NAMES\b/ },
                { begin: /\bIS\s+(NOT\s+)?UNKNOWN\b/ },
                { begin: /\bSECURITY\s+LABEL\b/ },
                { begin: /\bSTANDALONE\s+(YES|NO|NO\s+VALUE)\b/ },
                { begin: /\bWITH\s+(NO\s+)?DATA\b/ },
                { begin: /\b(FOREIGN|SET)\s+DATA\b/ },
                { begin: /\bSET\s+(CATALOG|CONSTRAINTS)\b/ },
                { begin: /\b(WITH|FOR)\s+ORDINALITY\b/ },
                { begin: /\bIS\s+(NOT\s+)?DOCUMENT\b/ },
                { begin: /\bXML\s+OPTION\s+(DOCUMENT|CONTENT)\b/ },
                { begin: /\b(STRIP|PRESERVE)\s+WHITESPACE\b/ },
                { begin: /\bNO\s+(ACTION|MAXVALUE|MINVALUE)\b/ },
                { begin: /\bPARTITION\s+BY\s+(RANGE|LIST|HASH)\b/ },
                { begin: /\bAT\s+TIME\s+ZONE\b/ },
                { begin: /\bGRANTED\s+BY\b/ },
                { begin: /\bRETURN\s+(QUERY|NEXT)\b/ },
                { begin: /\b(ATTACH|DETACH)\s+PARTITION\b/ },
                { begin: /\bFORCE\s+ROW\s+LEVEL\s+SECURITY\b/ },
                { begin: /\b(INCLUDING|EXCLUDING)\s+(COMMENTS|CONSTRAINTS|DEFAULTS|IDENTITY|INDEXES|STATISTICS|STORAGE|ALL)\b/ },
                { begin: /\bAS\s+(ASSIGNMENT|IMPLICIT|PERMISSIVE|RESTRICTIVE|ENUM|RANGE)\b/ }
              ]
            },
            // functions named as keywords, followed by '('
            {
              begin: /\b(FORMAT|FAMILY|VERSION)\s*\(/
              // keywords: { built_in: 'FORMAT FAMILY VERSION' }
            },
            // INCLUDE ( ... ) in index_parameters in CREATE TABLE
            {
              begin: /\bINCLUDE\s*\(/,
              keywords: "INCLUDE"
            },
            // not highlight RANGE if not in frame_clause (not 100% correct, but seems satisfactory)
            { begin: /\bRANGE(?!\s*(BETWEEN|UNBOUNDED|CURRENT|[-0-9]+))/ },
            // disable highlighting in commands CREATE AGGREGATE/COLLATION/DATABASE/OPERTOR/TEXT SEARCH .../TYPE
            // and in PL/pgSQL RAISE ... USING
            { begin: /\b(VERSION|OWNER|TEMPLATE|TABLESPACE|CONNECTION\s+LIMIT|PROCEDURE|RESTRICT|JOIN|PARSER|COPY|START|END|COLLATION|INPUT|ANALYZE|STORAGE|LIKE|DEFAULT|DELIMITER|ENCODING|COLUMN|CONSTRAINT|TABLE|SCHEMA)\s*=/ },
            // PG_smth; HAS_some_PRIVILEGE
            {
              // className: 'built_in',
              begin: /\b(PG_\w+?|HAS_[A-Z_]+_PRIVILEGE)\b/,
              relevance: 10
            },
            // extract
            {
              begin: /\bEXTRACT\s*\(/,
              end: /\bFROM\b/,
              returnEnd: true,
              keywords: {
                // built_in: 'EXTRACT',
                type: "CENTURY DAY DECADE DOW DOY EPOCH HOUR ISODOW ISOYEAR MICROSECONDS MILLENNIUM MILLISECONDS MINUTE MONTH QUARTER SECOND TIMEZONE TIMEZONE_HOUR TIMEZONE_MINUTE WEEK YEAR"
              }
            },
            // xmlelement, xmlpi - special NAME
            {
              begin: /\b(XMLELEMENT|XMLPI)\s*\(\s*NAME/,
              keywords: {
                // built_in: 'XMLELEMENT XMLPI',
                keyword: "NAME"
              }
            },
            // xmlparse, xmlserialize
            {
              begin: /\b(XMLPARSE|XMLSERIALIZE)\s*\(\s*(DOCUMENT|CONTENT)/,
              keywords: {
                // built_in: 'XMLPARSE XMLSERIALIZE',
                keyword: "DOCUMENT CONTENT"
              }
            },
            // Sequences. We actually skip everything between CACHE|INCREMENT|MAXVALUE|MINVALUE and
            // nearest following numeric constant. Without with trick we find a lot of "keywords"
            // in 'avrasm' autodetection test...
            {
              beginKeywords: "CACHE INCREMENT MAXVALUE MINVALUE",
              end: hljs.C_NUMBER_RE,
              returnEnd: true,
              keywords: "BY CACHE INCREMENT MAXVALUE MINVALUE"
            },
            // WITH|WITHOUT TIME ZONE as part of datatype
            {
              className: "type",
              begin: /\b(WITH|WITHOUT)\s+TIME\s+ZONE\b/
            },
            // INTERVAL optional fields
            {
              className: "type",
              begin: /\bINTERVAL\s+(YEAR|MONTH|DAY|HOUR|MINUTE|SECOND)(\s+TO\s+(MONTH|HOUR|MINUTE|SECOND))?\b/
            },
            // Pseudo-types which allowed only as return type
            {
              begin: /\bRETURNS\s+(LANGUAGE_HANDLER|TRIGGER|EVENT_TRIGGER|FDW_HANDLER|INDEX_AM_HANDLER|TSM_HANDLER)\b/,
              keywords: {
                keyword: "RETURNS",
                type: "LANGUAGE_HANDLER TRIGGER EVENT_TRIGGER FDW_HANDLER INDEX_AM_HANDLER TSM_HANDLER"
              }
            },
            // Known functions - only when followed by '('
            {
              begin: "\\b(" + FUNCTIONS_RE + ")\\s*\\("
              // keywords: { built_in: FUNCTIONS }
            },
            // Types
            {
              begin: "\\.(" + TYPES_RE + ")\\b"
              // prevent highlight as type, say, 'oid' in 'pgclass.oid'
            },
            {
              begin: "\\b(" + TYPES_RE + ")\\s+PATH\\b",
              // in XMLTABLE
              keywords: {
                keyword: "PATH",
                // hopefully no one would use PATH type in XMLTABLE...
                type: TYPES.replace("PATH ", "")
              }
            },
            {
              className: "type",
              begin: "\\b(" + TYPES_RE + ")\\b"
            },
            // Strings, see https://www.postgresql.org/docs/11/static/sql-syntax-lexical.html#SQL-SYNTAX-CONSTANTS
            {
              className: "string",
              begin: "'",
              end: "'",
              contains: [{ begin: "''" }]
            },
            {
              className: "string",
              begin: "(e|E|u&|U&)'",
              end: "'",
              contains: [{ begin: "\\\\." }],
              relevance: 10
            },
            hljs.END_SAME_AS_BEGIN({
              begin: DOLLAR_STRING,
              end: DOLLAR_STRING,
              contains: [
                {
                  // actually we want them all except SQL; listed are those with known implementations
                  // and XML + JSON just in case
                  subLanguage: [
                    "pgsql",
                    "perl",
                    "python",
                    "tcl",
                    "r",
                    "lua",
                    "java",
                    "php",
                    "ruby",
                    "bash",
                    "scheme",
                    "xml",
                    "json"
                  ],
                  endsWithParent: true
                }
              ]
            }),
            // identifiers in quotes
            {
              begin: '"',
              end: '"',
              contains: [{ begin: '""' }]
            },
            // numbers
            hljs.C_NUMBER_MODE,
            // comments
            hljs.C_BLOCK_COMMENT_MODE,
            COMMENT_MODE,
            // PL/pgSQL staff
            // %ROWTYPE, %TYPE, $n
            {
              className: "meta",
              variants: [
                {
                  // %TYPE, %ROWTYPE
                  begin: "%(ROW)?TYPE",
                  relevance: 10
                },
                {
                  // $n
                  begin: "\\$\\d+"
                },
                {
                  // #compiler option
                  begin: "^#\\w",
                  end: "$"
                }
              ]
            },
            // <<labeles>>
            {
              className: "symbol",
              begin: LABEL,
              relevance: 10
            }
          ]
        };
      }
      module.exports = pgsql;
    }
  });

  // node_modules/highlight.js/lib/languages/php.js
  var require_php = __commonJS({
    "node_modules/highlight.js/lib/languages/php.js"(exports, module) {
      function php(hljs) {
        const regex = hljs.regex;
        const NOT_PERL_ETC = /(?![A-Za-z0-9])(?![$])/;
        const IDENT_RE = regex.concat(
          /[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/,
          NOT_PERL_ETC
        );
        const PASCAL_CASE_CLASS_NAME_RE = regex.concat(
          /(\\?[A-Z][a-z0-9_\x7f-\xff]+|\\?[A-Z]+(?=[A-Z][a-z0-9_\x7f-\xff])){1,}/,
          NOT_PERL_ETC
        );
        const UPCASE_NAME_RE = regex.concat(
          /[A-Z]+/,
          NOT_PERL_ETC
        );
        const VARIABLE = {
          scope: "variable",
          match: "\\$+" + IDENT_RE
        };
        const PREPROCESSOR = {
          scope: "meta",
          variants: [
            { begin: /<\?php/, relevance: 10 },
            // boost for obvious PHP
            { begin: /<\?=/ },
            // less relevant per PSR-1 which says not to use short-tags
            { begin: /<\?/, relevance: 0.1 },
            { begin: /\?>/ }
            // end php tag
          ]
        };
        const SUBST = {
          scope: "subst",
          variants: [
            { begin: /\$\w+/ },
            {
              begin: /\{\$/,
              end: /\}/
            }
          ]
        };
        const SINGLE_QUOTED = hljs.inherit(hljs.APOS_STRING_MODE, { illegal: null });
        const DOUBLE_QUOTED = hljs.inherit(hljs.QUOTE_STRING_MODE, {
          illegal: null,
          contains: hljs.QUOTE_STRING_MODE.contains.concat(SUBST)
        });
        const HEREDOC = {
          begin: /<<<[ \t]*(?:(\w+)|"(\w+)")\n/,
          end: /[ \t]*(\w+)\b/,
          contains: hljs.QUOTE_STRING_MODE.contains.concat(SUBST),
          "on:begin": (m, resp) => {
            resp.data._beginMatch = m[1] || m[2];
          },
          "on:end": (m, resp) => {
            if (resp.data._beginMatch !== m[1]) resp.ignoreMatch();
          }
        };
        const NOWDOC = hljs.END_SAME_AS_BEGIN({
          begin: /<<<[ \t]*'(\w+)'\n/,
          end: /[ \t]*(\w+)\b/
        });
        const WHITESPACE = "[ 	\n]";
        const STRING = {
          scope: "string",
          variants: [
            DOUBLE_QUOTED,
            SINGLE_QUOTED,
            HEREDOC,
            NOWDOC
          ]
        };
        const NUMBER = {
          scope: "number",
          variants: [
            { begin: `\\b0[bB][01]+(?:_[01]+)*\\b` },
            // Binary w/ underscore support
            { begin: `\\b0[oO][0-7]+(?:_[0-7]+)*\\b` },
            // Octals w/ underscore support
            { begin: `\\b0[xX][\\da-fA-F]+(?:_[\\da-fA-F]+)*\\b` },
            // Hex w/ underscore support
            // Decimals w/ underscore support, with optional fragments and scientific exponent (e) suffix.
            { begin: `(?:\\b\\d+(?:_\\d+)*(\\.(?:\\d+(?:_\\d+)*))?|\\B\\.\\d+)(?:[eE][+-]?\\d+)?` }
          ],
          relevance: 0
        };
        const LITERALS = [
          "false",
          "null",
          "true"
        ];
        const KWS = [
          // Magic constants:
          // <https://www.php.net/manual/en/language.constants.predefined.php>
          "__CLASS__",
          "__DIR__",
          "__FILE__",
          "__FUNCTION__",
          "__COMPILER_HALT_OFFSET__",
          "__LINE__",
          "__METHOD__",
          "__NAMESPACE__",
          "__TRAIT__",
          // Function that look like language construct or language construct that look like function:
          // List of keywords that may not require parenthesis
          "die",
          "echo",
          "exit",
          "include",
          "include_once",
          "print",
          "require",
          "require_once",
          // These are not language construct (function) but operate on the currently-executing function and can access the current symbol table
          // 'compact extract func_get_arg func_get_args func_num_args get_called_class get_parent_class ' +
          // Other keywords:
          // <https://www.php.net/manual/en/reserved.php>
          // <https://www.php.net/manual/en/language.types.type-juggling.php>
          "array",
          "abstract",
          "and",
          "as",
          "binary",
          "bool",
          "boolean",
          "break",
          "callable",
          "case",
          "catch",
          "class",
          "clone",
          "const",
          "continue",
          "declare",
          "default",
          "do",
          "double",
          "else",
          "elseif",
          "empty",
          "enddeclare",
          "endfor",
          "endforeach",
          "endif",
          "endswitch",
          "endwhile",
          "enum",
          "eval",
          "extends",
          "final",
          "finally",
          "float",
          "for",
          "foreach",
          "from",
          "global",
          "goto",
          "if",
          "implements",
          "instanceof",
          "insteadof",
          "int",
          "integer",
          "interface",
          "isset",
          "iterable",
          "list",
          "match|0",
          "mixed",
          "new",
          "never",
          "object",
          "or",
          "private",
          "protected",
          "public",
          "readonly",
          "real",
          "return",
          "string",
          "switch",
          "throw",
          "trait",
          "try",
          "unset",
          "use",
          "var",
          "void",
          "while",
          "xor",
          "yield"
        ];
        const BUILT_INS = [
          // Standard PHP library:
          // <https://www.php.net/manual/en/book.spl.php>
          "Error|0",
          "AppendIterator",
          "ArgumentCountError",
          "ArithmeticError",
          "ArrayIterator",
          "ArrayObject",
          "AssertionError",
          "BadFunctionCallException",
          "BadMethodCallException",
          "CachingIterator",
          "CallbackFilterIterator",
          "CompileError",
          "Countable",
          "DirectoryIterator",
          "DivisionByZeroError",
          "DomainException",
          "EmptyIterator",
          "ErrorException",
          "Exception",
          "FilesystemIterator",
          "FilterIterator",
          "GlobIterator",
          "InfiniteIterator",
          "InvalidArgumentException",
          "IteratorIterator",
          "LengthException",
          "LimitIterator",
          "LogicException",
          "MultipleIterator",
          "NoRewindIterator",
          "OutOfBoundsException",
          "OutOfRangeException",
          "OuterIterator",
          "OverflowException",
          "ParentIterator",
          "ParseError",
          "RangeException",
          "RecursiveArrayIterator",
          "RecursiveCachingIterator",
          "RecursiveCallbackFilterIterator",
          "RecursiveDirectoryIterator",
          "RecursiveFilterIterator",
          "RecursiveIterator",
          "RecursiveIteratorIterator",
          "RecursiveRegexIterator",
          "RecursiveTreeIterator",
          "RegexIterator",
          "RuntimeException",
          "SeekableIterator",
          "SplDoublyLinkedList",
          "SplFileInfo",
          "SplFileObject",
          "SplFixedArray",
          "SplHeap",
          "SplMaxHeap",
          "SplMinHeap",
          "SplObjectStorage",
          "SplObserver",
          "SplPriorityQueue",
          "SplQueue",
          "SplStack",
          "SplSubject",
          "SplTempFileObject",
          "TypeError",
          "UnderflowException",
          "UnexpectedValueException",
          "UnhandledMatchError",
          // Reserved interfaces:
          // <https://www.php.net/manual/en/reserved.interfaces.php>
          "ArrayAccess",
          "BackedEnum",
          "Closure",
          "Fiber",
          "Generator",
          "Iterator",
          "IteratorAggregate",
          "Serializable",
          "Stringable",
          "Throwable",
          "Traversable",
          "UnitEnum",
          "WeakReference",
          "WeakMap",
          // Reserved classes:
          // <https://www.php.net/manual/en/reserved.classes.php>
          "Directory",
          "__PHP_Incomplete_Class",
          "parent",
          "php_user_filter",
          "self",
          "static",
          "stdClass"
        ];
        const dualCase = (items) => {
          const result = [];
          items.forEach((item) => {
            result.push(item);
            if (item.toLowerCase() === item) {
              result.push(item.toUpperCase());
            } else {
              result.push(item.toLowerCase());
            }
          });
          return result;
        };
        const KEYWORDS = {
          keyword: KWS,
          literal: dualCase(LITERALS),
          built_in: BUILT_INS
        };
        const normalizeKeywords = (items) => {
          return items.map((item) => {
            return item.replace(/\|\d+$/, "");
          });
        };
        const CONSTRUCTOR_CALL = { variants: [
          {
            match: [
              /new/,
              regex.concat(WHITESPACE, "+"),
              // to prevent built ins from being confused as the class constructor call
              regex.concat("(?!", normalizeKeywords(BUILT_INS).join("\\b|"), "\\b)"),
              PASCAL_CASE_CLASS_NAME_RE
            ],
            scope: {
              1: "keyword",
              4: "title.class"
            }
          }
        ] };
        const CONSTANT_REFERENCE = regex.concat(IDENT_RE, "\\b(?!\\()");
        const LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON = { variants: [
          {
            match: [
              regex.concat(
                /::/,
                regex.lookahead(/(?!class\b)/)
              ),
              CONSTANT_REFERENCE
            ],
            scope: { 2: "variable.constant" }
          },
          {
            match: [
              /::/,
              /class/
            ],
            scope: { 2: "variable.language" }
          },
          {
            match: [
              PASCAL_CASE_CLASS_NAME_RE,
              regex.concat(
                /::/,
                regex.lookahead(/(?!class\b)/)
              ),
              CONSTANT_REFERENCE
            ],
            scope: {
              1: "title.class",
              3: "variable.constant"
            }
          },
          {
            match: [
              PASCAL_CASE_CLASS_NAME_RE,
              regex.concat(
                "::",
                regex.lookahead(/(?!class\b)/)
              )
            ],
            scope: { 1: "title.class" }
          },
          {
            match: [
              PASCAL_CASE_CLASS_NAME_RE,
              /::/,
              /class/
            ],
            scope: {
              1: "title.class",
              3: "variable.language"
            }
          }
        ] };
        const NAMED_ARGUMENT = {
          scope: "attr",
          match: regex.concat(IDENT_RE, regex.lookahead(":"), regex.lookahead(/(?!::)/))
        };
        const PARAMS_MODE = {
          relevance: 0,
          begin: /\(/,
          end: /\)/,
          keywords: KEYWORDS,
          contains: [
            NAMED_ARGUMENT,
            VARIABLE,
            LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
            hljs.C_BLOCK_COMMENT_MODE,
            STRING,
            NUMBER,
            CONSTRUCTOR_CALL
          ]
        };
        const FUNCTION_INVOKE = {
          relevance: 0,
          match: [
            /\b/,
            // to prevent keywords from being confused as the function title
            regex.concat("(?!fn\\b|function\\b|", normalizeKeywords(KWS).join("\\b|"), "|", normalizeKeywords(BUILT_INS).join("\\b|"), "\\b)"),
            IDENT_RE,
            regex.concat(WHITESPACE, "*"),
            regex.lookahead(/(?=\()/)
          ],
          scope: { 3: "title.function.invoke" },
          contains: [PARAMS_MODE]
        };
        PARAMS_MODE.contains.push(FUNCTION_INVOKE);
        const ATTRIBUTE_CONTAINS = [
          NAMED_ARGUMENT,
          LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
          hljs.C_BLOCK_COMMENT_MODE,
          STRING,
          NUMBER,
          CONSTRUCTOR_CALL
        ];
        const ATTRIBUTES = {
          begin: regex.concat(
            /#\[\s*\\?/,
            regex.either(
              PASCAL_CASE_CLASS_NAME_RE,
              UPCASE_NAME_RE
            )
          ),
          beginScope: "meta",
          end: /]/,
          endScope: "meta",
          keywords: {
            literal: LITERALS,
            keyword: [
              "new",
              "array"
            ]
          },
          contains: [
            {
              begin: /\[/,
              end: /]/,
              keywords: {
                literal: LITERALS,
                keyword: [
                  "new",
                  "array"
                ]
              },
              contains: [
                "self",
                ...ATTRIBUTE_CONTAINS
              ]
            },
            ...ATTRIBUTE_CONTAINS,
            {
              scope: "meta",
              variants: [
                { match: PASCAL_CASE_CLASS_NAME_RE },
                { match: UPCASE_NAME_RE }
              ]
            }
          ]
        };
        return {
          case_insensitive: false,
          keywords: KEYWORDS,
          contains: [
            ATTRIBUTES,
            hljs.HASH_COMMENT_MODE,
            hljs.COMMENT("//", "$"),
            hljs.COMMENT(
              "/\\*",
              "\\*/",
              { contains: [
                {
                  scope: "doctag",
                  match: "@[A-Za-z]+"
                }
              ] }
            ),
            {
              match: /__halt_compiler\(\);/,
              keywords: "__halt_compiler",
              starts: {
                scope: "comment",
                end: hljs.MATCH_NOTHING_RE,
                contains: [
                  {
                    match: /\?>/,
                    scope: "meta",
                    endsParent: true
                  }
                ]
              }
            },
            PREPROCESSOR,
            {
              scope: "variable.language",
              match: /\$this\b/
            },
            VARIABLE,
            FUNCTION_INVOKE,
            LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
            {
              match: [
                /const/,
                /\s/,
                IDENT_RE
              ],
              scope: {
                1: "keyword",
                3: "variable.constant"
              }
            },
            CONSTRUCTOR_CALL,
            {
              scope: "function",
              relevance: 0,
              beginKeywords: "fn function",
              end: /[;{]/,
              excludeEnd: true,
              illegal: "[$%\\[]",
              contains: [
                { beginKeywords: "use" },
                hljs.UNDERSCORE_TITLE_MODE,
                {
                  begin: "=>",
                  // No markup, just a relevance booster
                  endsParent: true
                },
                {
                  scope: "params",
                  begin: "\\(",
                  end: "\\)",
                  excludeBegin: true,
                  excludeEnd: true,
                  keywords: KEYWORDS,
                  contains: [
                    "self",
                    ATTRIBUTES,
                    VARIABLE,
                    LEFT_AND_RIGHT_SIDE_OF_DOUBLE_COLON,
                    hljs.C_BLOCK_COMMENT_MODE,
                    STRING,
                    NUMBER
                  ]
                }
              ]
            },
            {
              scope: "class",
              variants: [
                {
                  beginKeywords: "enum",
                  illegal: /[($"]/
                },
                {
                  beginKeywords: "class interface trait",
                  illegal: /[:($"]/
                }
              ],
              relevance: 0,
              end: /\{/,
              excludeEnd: true,
              contains: [
                { beginKeywords: "extends implements" },
                hljs.UNDERSCORE_TITLE_MODE
              ]
            },
            // both use and namespace still use "old style" rules (vs multi-match)
            // because the namespace name can include `\` and we still want each
            // element to be treated as its own *individual* title
            {
              beginKeywords: "namespace",
              relevance: 0,
              end: ";",
              illegal: /[.']/,
              contains: [hljs.inherit(hljs.UNDERSCORE_TITLE_MODE, { scope: "title.class" })]
            },
            {
              beginKeywords: "use",
              relevance: 0,
              end: ";",
              contains: [
                // TODO: title.function vs title.class
                {
                  match: /\b(as|const|function)\b/,
                  scope: "keyword"
                },
                // TODO: could be title.class or title.function
                hljs.UNDERSCORE_TITLE_MODE
              ]
            },
            STRING,
            NUMBER
          ]
        };
      }
      module.exports = php;
    }
  });

  // node_modules/highlight.js/lib/languages/plaintext.js
  var require_plaintext = __commonJS({
    "node_modules/highlight.js/lib/languages/plaintext.js"(exports, module) {
      function plaintext(hljs) {
        return {
          name: "Plain text",
          aliases: [
            "text",
            "txt"
          ],
          disableAutodetect: true
        };
      }
      module.exports = plaintext;
    }
  });

  // node_modules/highlight.js/lib/languages/powershell.js
  var require_powershell = __commonJS({
    "node_modules/highlight.js/lib/languages/powershell.js"(exports, module) {
      function powershell(hljs) {
        const TYPES = [
          "string",
          "char",
          "byte",
          "int",
          "long",
          "bool",
          "decimal",
          "single",
          "double",
          "DateTime",
          "xml",
          "array",
          "hashtable",
          "void"
        ];
        const VALID_VERBS = "Add|Clear|Close|Copy|Enter|Exit|Find|Format|Get|Hide|Join|Lock|Move|New|Open|Optimize|Pop|Push|Redo|Remove|Rename|Reset|Resize|Search|Select|Set|Show|Skip|Split|Step|Switch|Undo|Unlock|Watch|Backup|Checkpoint|Compare|Compress|Convert|ConvertFrom|ConvertTo|Dismount|Edit|Expand|Export|Group|Import|Initialize|Limit|Merge|Mount|Out|Publish|Restore|Save|Sync|Unpublish|Update|Approve|Assert|Build|Complete|Confirm|Deny|Deploy|Disable|Enable|Install|Invoke|Register|Request|Restart|Resume|Start|Stop|Submit|Suspend|Uninstall|Unregister|Wait|Debug|Measure|Ping|Repair|Resolve|Test|Trace|Connect|Disconnect|Read|Receive|Send|Write|Block|Grant|Protect|Revoke|Unblock|Unprotect|Use|ForEach|Sort|Tee|Where";
        const COMPARISON_OPERATORS = "-and|-as|-band|-bnot|-bor|-bxor|-casesensitive|-ccontains|-ceq|-cge|-cgt|-cle|-clike|-clt|-cmatch|-cne|-cnotcontains|-cnotlike|-cnotmatch|-contains|-creplace|-csplit|-eq|-exact|-f|-file|-ge|-gt|-icontains|-ieq|-ige|-igt|-ile|-ilike|-ilt|-imatch|-in|-ine|-inotcontains|-inotlike|-inotmatch|-ireplace|-is|-isnot|-isplit|-join|-le|-like|-lt|-match|-ne|-not|-notcontains|-notin|-notlike|-notmatch|-or|-regex|-replace|-shl|-shr|-split|-wildcard|-xor";
        const KEYWORDS = {
          $pattern: /-?[A-z\.\-]+\b/,
          keyword: "if else foreach return do while until elseif begin for trap data dynamicparam end break throw param continue finally in switch exit filter try process catch hidden static parameter",
          // "echo" relevance has been set to 0 to avoid auto-detect conflicts with shell transcripts
          built_in: "ac asnp cat cd CFS chdir clc clear clhy cli clp cls clv cnsn compare copy cp cpi cpp curl cvpa dbp del diff dir dnsn ebp echo|0 epal epcsv epsn erase etsn exsn fc fhx fl ft fw gal gbp gc gcb gci gcm gcs gdr gerr ghy gi gin gjb gl gm gmo gp gps gpv group gsn gsnp gsv gtz gu gv gwmi h history icm iex ihy ii ipal ipcsv ipmo ipsn irm ise iwmi iwr kill lp ls man md measure mi mount move mp mv nal ndr ni nmo npssc nsn nv ogv oh popd ps pushd pwd r rbp rcjb rcsn rd rdr ren ri rjb rm rmdir rmo rni rnp rp rsn rsnp rujb rv rvpa rwmi sajb sal saps sasv sbp sc scb select set shcm si sl sleep sls sort sp spjb spps spsv start stz sujb sv swmi tee trcm type wget where wjb write"
          // TODO: 'validate[A-Z]+' can't work in keywords
        };
        const TITLE_NAME_RE = /\w[\w\d]*((-)[\w\d]+)*/;
        const BACKTICK_ESCAPE = {
          begin: "`[\\s\\S]",
          relevance: 0
        };
        const VAR = {
          className: "variable",
          variants: [
            { begin: /\$\B/ },
            {
              className: "keyword",
              begin: /\$this/
            },
            { begin: /\$[\w\d][\w\d_:]*/ }
          ]
        };
        const LITERAL = {
          className: "literal",
          begin: /\$(null|true|false)\b/
        };
        const QUOTE_STRING = {
          className: "string",
          variants: [
            {
              begin: /"/,
              end: /"/
            },
            {
              begin: /@"/,
              end: /^"@/
            }
          ],
          contains: [
            BACKTICK_ESCAPE,
            VAR,
            {
              className: "variable",
              begin: /\$[A-z]/,
              end: /[^A-z]/
            }
          ]
        };
        const APOS_STRING = {
          className: "string",
          variants: [
            {
              begin: /'/,
              end: /'/
            },
            {
              begin: /@'/,
              end: /^'@/
            }
          ]
        };
        const PS_HELPTAGS = {
          className: "doctag",
          variants: [
            /* no paramater help tags */
            { begin: /\.(synopsis|description|example|inputs|outputs|notes|link|component|role|functionality)/ },
            /* one parameter help tags */
            { begin: /\.(parameter|forwardhelptargetname|forwardhelpcategory|remotehelprunspace|externalhelp)\s+\S+/ }
          ]
        };
        const PS_COMMENT = hljs.inherit(
          hljs.COMMENT(null, null),
          {
            variants: [
              /* single-line comment */
              {
                begin: /#/,
                end: /$/
              },
              /* multi-line comment */
              {
                begin: /<#/,
                end: /#>/
              }
            ],
            contains: [PS_HELPTAGS]
          }
        );
        const CMDLETS = {
          className: "built_in",
          variants: [{ begin: "(".concat(VALID_VERBS, ")+(-)[\\w\\d]+") }]
        };
        const PS_CLASS = {
          className: "class",
          beginKeywords: "class enum",
          end: /\s*[{]/,
          excludeEnd: true,
          relevance: 0,
          contains: [hljs.TITLE_MODE]
        };
        const PS_FUNCTION = {
          className: "function",
          begin: /function\s+/,
          end: /\s*\{|$/,
          excludeEnd: true,
          returnBegin: true,
          relevance: 0,
          contains: [
            {
              begin: "function",
              relevance: 0,
              className: "keyword"
            },
            {
              className: "title",
              begin: TITLE_NAME_RE,
              relevance: 0
            },
            {
              begin: /\(/,
              end: /\)/,
              className: "params",
              relevance: 0,
              contains: [VAR]
            }
            // CMDLETS
          ]
        };
        const PS_USING = {
          begin: /using\s/,
          end: /$/,
          returnBegin: true,
          contains: [
            QUOTE_STRING,
            APOS_STRING,
            {
              className: "keyword",
              begin: /(using|assembly|command|module|namespace|type)/
            }
          ]
        };
        const PS_ARGUMENTS = { variants: [
          // PS literals are pretty verbose so it's a good idea to accent them a bit.
          {
            className: "operator",
            begin: "(".concat(COMPARISON_OPERATORS, ")\\b")
          },
          {
            className: "literal",
            begin: /(-){1,2}[\w\d-]+/,
            relevance: 0
          }
        ] };
        const HASH_SIGNS = {
          className: "selector-tag",
          begin: /@\B/,
          relevance: 0
        };
        const PS_METHODS = {
          className: "function",
          begin: /\[.*\]\s*[\w]+[ ]??\(/,
          end: /$/,
          returnBegin: true,
          relevance: 0,
          contains: [
            {
              className: "keyword",
              begin: "(".concat(
                KEYWORDS.keyword.toString().replace(
                  /\s/g,
                  "|"
                ),
                ")\\b"
              ),
              endsParent: true,
              relevance: 0
            },
            hljs.inherit(hljs.TITLE_MODE, { endsParent: true })
          ]
        };
        const GENTLEMANS_SET = [
          // STATIC_MEMBER,
          PS_METHODS,
          PS_COMMENT,
          BACKTICK_ESCAPE,
          hljs.NUMBER_MODE,
          QUOTE_STRING,
          APOS_STRING,
          // PS_NEW_OBJECT_TYPE,
          CMDLETS,
          VAR,
          LITERAL,
          HASH_SIGNS
        ];
        const PS_TYPE = {
          begin: /\[/,
          end: /\]/,
          excludeBegin: true,
          excludeEnd: true,
          relevance: 0,
          contains: [].concat(
            "self",
            GENTLEMANS_SET,
            {
              begin: "(" + TYPES.join("|") + ")",
              className: "built_in",
              relevance: 0
            },
            {
              className: "type",
              begin: /[\.\w\d]+/,
              relevance: 0
            }
          )
        };
        PS_METHODS.contains.unshift(PS_TYPE);
        return {
          name: "PowerShell",
          aliases: [
            "pwsh",
            "ps",
            "ps1"
          ],
          case_insensitive: true,
          keywords: KEYWORDS,
          contains: GENTLEMANS_SET.concat(
            PS_CLASS,
            PS_FUNCTION,
            PS_USING,
            PS_ARGUMENTS,
            PS_TYPE
          )
        };
      }
      module.exports = powershell;
    }
  });

  // node_modules/highlight.js/lib/languages/properties.js
  var require_properties = __commonJS({
    "node_modules/highlight.js/lib/languages/properties.js"(exports, module) {
      function properties(hljs) {
        const WS0 = "[ \\t\\f]*";
        const WS1 = "[ \\t\\f]+";
        const EQUAL_DELIM = WS0 + "[:=]" + WS0;
        const WS_DELIM = WS1;
        const DELIM = "(" + EQUAL_DELIM + "|" + WS_DELIM + ")";
        const KEY = "([^\\\\:= \\t\\f\\n]|\\\\.)+";
        const DELIM_AND_VALUE = {
          // skip DELIM
          end: DELIM,
          relevance: 0,
          starts: {
            // value: everything until end of line (again, taking into account backslashes)
            className: "string",
            end: /$/,
            relevance: 0,
            contains: [
              { begin: "\\\\\\\\" },
              { begin: "\\\\\\n" }
            ]
          }
        };
        return {
          name: ".properties",
          disableAutodetect: true,
          case_insensitive: true,
          illegal: /\S/,
          contains: [
            hljs.COMMENT("^\\s*[!#]", "$"),
            // key: everything until whitespace or = or : (taking into account backslashes)
            // case of a key-value pair
            {
              returnBegin: true,
              variants: [
                { begin: KEY + EQUAL_DELIM },
                { begin: KEY + WS_DELIM }
              ],
              contains: [
                {
                  className: "attr",
                  begin: KEY,
                  endsParent: true
                }
              ],
              starts: DELIM_AND_VALUE
            },
            // case of an empty key
            {
              className: "attr",
              begin: KEY + WS0 + "$"
            }
          ]
        };
      }
      module.exports = properties;
    }
  });

  // node_modules/highlight.js/lib/languages/protobuf.js
  var require_protobuf = __commonJS({
    "node_modules/highlight.js/lib/languages/protobuf.js"(exports, module) {
      function protobuf(hljs) {
        const KEYWORDS = [
          "package",
          "import",
          "option",
          "optional",
          "required",
          "repeated",
          "group",
          "oneof"
        ];
        const TYPES = [
          "double",
          "float",
          "int32",
          "int64",
          "uint32",
          "uint64",
          "sint32",
          "sint64",
          "fixed32",
          "fixed64",
          "sfixed32",
          "sfixed64",
          "bool",
          "string",
          "bytes"
        ];
        const CLASS_DEFINITION = {
          match: [
            /(message|enum|service)\s+/,
            hljs.IDENT_RE
          ],
          scope: {
            1: "keyword",
            2: "title.class"
          }
        };
        return {
          name: "Protocol Buffers",
          aliases: ["proto"],
          keywords: {
            keyword: KEYWORDS,
            type: TYPES,
            literal: [
              "true",
              "false"
            ]
          },
          contains: [
            hljs.QUOTE_STRING_MODE,
            hljs.NUMBER_MODE,
            hljs.C_LINE_COMMENT_MODE,
            hljs.C_BLOCK_COMMENT_MODE,
            CLASS_DEFINITION,
            {
              className: "function",
              beginKeywords: "rpc",
              end: /[{;]/,
              excludeEnd: true,
              keywords: "rpc returns"
            },
            {
              // match enum items (relevance)
              // BLAH = ...;
              begin: /^\s*[A-Z_]+(?=\s*=[^\n]+;$)/
            }
          ]
        };
      }
      module.exports = protobuf;
    }
  });

  // node_modules/highlight.js/lib/languages/python.js
  var require_python = __commonJS({
    "node_modules/highlight.js/lib/languages/python.js"(exports, module) {
      function python(hljs) {
        const regex = hljs.regex;
        const IDENT_RE = /[\p{XID_Start}_]\p{XID_Continue}*/u;
        const RESERVED_WORDS = [
          "and",
          "as",
          "assert",
          "async",
          "await",
          "break",
          "case",
          "class",
          "continue",
          "def",
          "del",
          "elif",
          "else",
          "except",
          "finally",
          "for",
          "from",
          "global",
          "if",
          "import",
          "in",
          "is",
          "lambda",
          "match",
          "nonlocal|10",
          "not",
          "or",
          "pass",
          "raise",
          "return",
          "try",
          "while",
          "with",
          "yield"
        ];
        const BUILT_INS = [
          "__import__",
          "abs",
          "all",
          "any",
          "ascii",
          "bin",
          "bool",
          "breakpoint",
          "bytearray",
          "bytes",
          "callable",
          "chr",
          "classmethod",
          "compile",
          "complex",
          "delattr",
          "dict",
          "dir",
          "divmod",
          "enumerate",
          "eval",
          "exec",
          "filter",
          "float",
          "format",
          "frozenset",
          "getattr",
          "globals",
          "hasattr",
          "hash",
          "help",
          "hex",
          "id",
          "input",
          "int",
          "isinstance",
          "issubclass",
          "iter",
          "len",
          "list",
          "locals",
          "map",
          "max",
          "memoryview",
          "min",
          "next",
          "object",
          "oct",
          "open",
          "ord",
          "pow",
          "print",
          "property",
          "range",
          "repr",
          "reversed",
          "round",
          "set",
          "setattr",
          "slice",
          "sorted",
          "staticmethod",
          "str",
          "sum",
          "super",
          "tuple",
          "type",
          "vars",
          "zip"
        ];
        const LITERALS = [
          "__debug__",
          "Ellipsis",
          "False",
          "None",
          "NotImplemented",
          "True"
        ];
        const TYPES = [
          "Any",
          "Callable",
          "Coroutine",
          "Dict",
          "List",
          "Literal",
          "Generic",
          "Optional",
          "Sequence",
          "Set",
          "Tuple",
          "Type",
          "Union"
        ];
        const KEYWORDS = {
          $pattern: /[A-Za-z]\w+|__\w+__/,
          keyword: RESERVED_WORDS,
          built_in: BUILT_INS,
          literal: LITERALS,
          type: TYPES
        };
        const PROMPT = {
          className: "meta",
          begin: /^(>>>|\.\.\.) /
        };
        const SUBST = {
          className: "subst",
          begin: /\{/,
          end: /\}/,
          keywords: KEYWORDS,
          illegal: /#/
        };
        const LITERAL_BRACKET = {
          begin: /\{\{/,
          relevance: 0
        };
        const STRING = {
          className: "string",
          contains: [hljs.BACKSLASH_ESCAPE],
          variants: [
            {
              begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?'''/,
              end: /'''/,
              contains: [
                hljs.BACKSLASH_ESCAPE,
                PROMPT
              ],
              relevance: 10
            },
            {
              begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?"""/,
              end: /"""/,
              contains: [
                hljs.BACKSLASH_ESCAPE,
                PROMPT
              ],
              relevance: 10
            },
            {
              begin: /([fF][rR]|[rR][fF]|[fF])'''/,
              end: /'''/,
              contains: [
                hljs.BACKSLASH_ESCAPE,
                PROMPT,
                LITERAL_BRACKET,
                SUBST
              ]
            },
            {
              begin: /([fF][rR]|[rR][fF]|[fF])"""/,
              end: /"""/,
              contains: [
                hljs.BACKSLASH_ESCAPE,
                PROMPT,
                LITERAL_BRACKET,
                SUBST
              ]
            },
            {
              begin: /([uU]|[rR])'/,
              end: /'/,
              relevance: 10
            },
            {
              begin: /([uU]|[rR])"/,
              end: /"/,
              relevance: 10
            },
            {
              begin: /([bB]|[bB][rR]|[rR][bB])'/,
              end: /'/
            },
            {
              begin: /([bB]|[bB][rR]|[rR][bB])"/,
              end: /"/
            },
            {
              begin: /([fF][rR]|[rR][fF]|[fF])'/,
              end: /'/,
              contains: [
                hljs.BACKSLASH_ESCAPE,
                LITERAL_BRACKET,
                SUBST
              ]
            },
            {
              begin: /([fF][rR]|[rR][fF]|[fF])"/,
              end: /"/,
              contains: [
                hljs.BACKSLASH_ESCAPE,
                LITERAL_BRACKET,
                SUBST
              ]
            },
            hljs.APOS_STRING_MODE,
            hljs.QUOTE_STRING_MODE
          ]
        };
        const digitpart = "[0-9](_?[0-9])*";
        const pointfloat = `(\\b(${digitpart}))?\\.(${digitpart})|\\b(${digitpart})\\.`;
        const lookahead = `\\b|${RESERVED_WORDS.join("|")}`;
        const NUMBER = {
          className: "number",
          relevance: 0,
          variants: [
            // exponentfloat, pointfloat
            // https://docs.python.org/3.9/reference/lexical_analysis.html#floating-point-literals
            // optionally imaginary
            // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
            // Note: no leading \b because floats can start with a decimal point
            // and we don't want to mishandle e.g. `fn(.5)`,
            // no trailing \b for pointfloat because it can end with a decimal point
            // and we don't want to mishandle e.g. `0..hex()`; this should be safe
            // because both MUST contain a decimal point and so cannot be confused with
            // the interior part of an identifier
            {
              begin: `(\\b(${digitpart})|(${pointfloat}))[eE][+-]?(${digitpart})[jJ]?(?=${lookahead})`
            },
            {
              begin: `(${pointfloat})[jJ]?`
            },
            // decinteger, bininteger, octinteger, hexinteger
            // https://docs.python.org/3.9/reference/lexical_analysis.html#integer-literals
            // optionally "long" in Python 2
            // https://docs.python.org/2.7/reference/lexical_analysis.html#integer-and-long-integer-literals
            // decinteger is optionally imaginary
            // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
            {
              begin: `\\b([1-9](_?[0-9])*|0+(_?0)*)[lLjJ]?(?=${lookahead})`
            },
            {
              begin: `\\b0[bB](_?[01])+[lL]?(?=${lookahead})`
            },
            {
              begin: `\\b0[oO](_?[0-7])+[lL]?(?=${lookahead})`
            },
            {
              begin: `\\b0[xX](_?[0-9a-fA-F])+[lL]?(?=${lookahead})`
            },
            // imagnumber (digitpart-based)
            // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
            {
              begin: `\\b(${digitpart})[jJ](?=${lookahead})`
            }
          ]
        };
        const COMMENT_TYPE = {
          className: "comment",
          begin: regex.lookahead(/# type:/),
          end: /$/,
          keywords: KEYWORDS,
          contains: [
            {
              // prevent keywords from coloring `type`
              begin: /# type:/
            },
            // comment within a datatype comment includes no keywords
            {
              begin: /#/,
              end: /\b\B/,
              endsWithParent: true
            }
          ]
        };
        const PARAMS = {
          className: "params",
          variants: [
            // Exclude params in functions without params
            {
              className: "",
              begin: /\(\s*\)/,
              skip: true
            },
            {
              begin: /\(/,
              end: /\)/,
              excludeBegin: true,
              excludeEnd: true,
              keywords: KEYWORDS,
              contains: [
                "self",
                PROMPT,
                NUMBER,
                STRING,
                hljs.HASH_COMMENT_MODE
              ]
            }
          ]
        };
        SUBST.contains = [
          STRING,
          NUMBER,
          PROMPT
        ];
        return {
          name: "Python",
          aliases: [
            "py",
            "gyp",
            "ipython"
          ],
          unicodeRegex: true,
          keywords: KEYWORDS,
          illegal: /(<\/|\?)|=>/,
          contains: [
            PROMPT,
            NUMBER,
            {
              // very common convention
              scope: "variable.language",
              match: /\bself\b/
            },
            {
              // eat "if" prior to string so that it won't accidentally be
              // labeled as an f-string
              beginKeywords: "if",
              relevance: 0
            },
            { match: /\bor\b/, scope: "keyword" },
            STRING,
            COMMENT_TYPE,
            hljs.HASH_COMMENT_MODE,
            {
              match: [
                /\bdef/,
                /\s+/,
                IDENT_RE
              ],
              scope: {
                1: "keyword",
                3: "title.function"
              },
              contains: [PARAMS]
            },
            {
              variants: [
                {
                  match: [
                    /\bclass/,
                    /\s+/,
                    IDENT_RE,
                    /\s*/,
                    /\(\s*/,
                    IDENT_RE,
                    /\s*\)/
                  ]
                },
                {
                  match: [
                    /\bclass/,
                    /\s+/,
                    IDENT_RE
                  ]
                }
              ],
              scope: {
                1: "keyword",
                3: "title.class",
                6: "title.class.inherited"
              }
            },
            {
              className: "meta",
              begin: /^[\t ]*@/,
              end: /(?=#)|$/,
              contains: [
                NUMBER,
                PARAMS,
                STRING
              ]
            }
          ]
        };
      }
      module.exports = python;
    }
  });

  // node_modules/highlight.js/lib/languages/rust.js
  var require_rust = __commonJS({
    "node_modules/highlight.js/lib/languages/rust.js"(exports, module) {
      function rust(hljs) {
        const regex = hljs.regex;
        const RAW_IDENTIFIER = /(r#)?/;
        const UNDERSCORE_IDENT_RE = regex.concat(RAW_IDENTIFIER, hljs.UNDERSCORE_IDENT_RE);
        const IDENT_RE = regex.concat(RAW_IDENTIFIER, hljs.IDENT_RE);
        const FUNCTION_INVOKE = {
          className: "title.function.invoke",
          relevance: 0,
          begin: regex.concat(
            /\b/,
            /(?!let|for|while|if|else|match\b)/,
            IDENT_RE,
            regex.lookahead(/\s*\(/)
          )
        };
        const NUMBER_SUFFIX = "([ui](8|16|32|64|128|size)|f(32|64))?";
        const KEYWORDS = [
          "abstract",
          "as",
          "async",
          "await",
          "become",
          "box",
          "break",
          "const",
          "continue",
          "crate",
          "do",
          "dyn",
          "else",
          "enum",
          "extern",
          "false",
          "final",
          "fn",
          "for",
          "if",
          "impl",
          "in",
          "let",
          "loop",
          "macro",
          "match",
          "mod",
          "move",
          "mut",
          "override",
          "priv",
          "pub",
          "ref",
          "return",
          "self",
          "Self",
          "static",
          "struct",
          "super",
          "trait",
          "true",
          "try",
          "type",
          "typeof",
          "union",
          "unsafe",
          "unsized",
          "use",
          "virtual",
          "where",
          "while",
          "yield"
        ];
        const LITERALS = [
          "true",
          "false",
          "Some",
          "None",
          "Ok",
          "Err"
        ];
        const BUILTINS = [
          // functions
          "drop ",
          // traits
          "Copy",
          "Send",
          "Sized",
          "Sync",
          "Drop",
          "Fn",
          "FnMut",
          "FnOnce",
          "ToOwned",
          "Clone",
          "Debug",
          "PartialEq",
          "PartialOrd",
          "Eq",
          "Ord",
          "AsRef",
          "AsMut",
          "Into",
          "From",
          "Default",
          "Iterator",
          "Extend",
          "IntoIterator",
          "DoubleEndedIterator",
          "ExactSizeIterator",
          "SliceConcatExt",
          "ToString",
          // macros
          "assert!",
          "assert_eq!",
          "bitflags!",
          "bytes!",
          "cfg!",
          "col!",
          "concat!",
          "concat_idents!",
          "debug_assert!",
          "debug_assert_eq!",
          "env!",
          "eprintln!",
          "panic!",
          "file!",
          "format!",
          "format_args!",
          "include_bytes!",
          "include_str!",
          "line!",
          "local_data_key!",
          "module_path!",
          "option_env!",
          "print!",
          "println!",
          "select!",
          "stringify!",
          "try!",
          "unimplemented!",
          "unreachable!",
          "vec!",
          "write!",
          "writeln!",
          "macro_rules!",
          "assert_ne!",
          "debug_assert_ne!"
        ];
        const TYPES = [
          "i8",
          "i16",
          "i32",
          "i64",
          "i128",
          "isize",
          "u8",
          "u16",
          "u32",
          "u64",
          "u128",
          "usize",
          "f32",
          "f64",
          "str",
          "char",
          "bool",
          "Box",
          "Option",
          "Result",
          "String",
          "Vec"
        ];
        return {
          name: "Rust",
          aliases: ["rs"],
          keywords: {
            $pattern: hljs.IDENT_RE + "!?",
            type: TYPES,
            keyword: KEYWORDS,
            literal: LITERALS,
            built_in: BUILTINS
          },
          illegal: "</",
          contains: [
            hljs.C_LINE_COMMENT_MODE,
            hljs.COMMENT("/\\*", "\\*/", { contains: ["self"] }),
            hljs.inherit(hljs.QUOTE_STRING_MODE, {
              begin: /b?"/,
              illegal: null
            }),
            {
              className: "symbol",
              // negative lookahead to avoid matching `'`
              begin: /'[a-zA-Z_][a-zA-Z0-9_]*(?!')/
            },
            {
              scope: "string",
              variants: [
                { begin: /b?r(#*)"(.|\n)*?"\1(?!#)/ },
                {
                  begin: /b?'/,
                  end: /'/,
                  contains: [
                    {
                      scope: "char.escape",
                      match: /\\('|\w|x\w{2}|u\w{4}|U\w{8})/
                    }
                  ]
                }
              ]
            },
            {
              className: "number",
              variants: [
                { begin: "\\b0b([01_]+)" + NUMBER_SUFFIX },
                { begin: "\\b0o([0-7_]+)" + NUMBER_SUFFIX },
                { begin: "\\b0x([A-Fa-f0-9_]+)" + NUMBER_SUFFIX },
                { begin: "\\b(\\d[\\d_]*(\\.[0-9_]+)?([eE][+-]?[0-9_]+)?)" + NUMBER_SUFFIX }
              ],
              relevance: 0
            },
            {
              begin: [
                /fn/,
                /\s+/,
                UNDERSCORE_IDENT_RE
              ],
              className: {
                1: "keyword",
                3: "title.function"
              }
            },
            {
              className: "meta",
              begin: "#!?\\[",
              end: "\\]",
              contains: [
                {
                  className: "string",
                  begin: /"/,
                  end: /"/,
                  contains: [
                    hljs.BACKSLASH_ESCAPE
                  ]
                }
              ]
            },
            {
              begin: [
                /let/,
                /\s+/,
                /(?:mut\s+)?/,
                UNDERSCORE_IDENT_RE
              ],
              className: {
                1: "keyword",
                3: "keyword",
                4: "variable"
              }
            },
            // must come before impl/for rule later
            {
              begin: [
                /for/,
                /\s+/,
                UNDERSCORE_IDENT_RE,
                /\s+/,
                /in/
              ],
              className: {
                1: "keyword",
                3: "variable",
                5: "keyword"
              }
            },
            {
              begin: [
                /type/,
                /\s+/,
                UNDERSCORE_IDENT_RE
              ],
              className: {
                1: "keyword",
                3: "title.class"
              }
            },
            {
              begin: [
                /(?:trait|enum|struct|union|impl|for)/,
                /\s+/,
                UNDERSCORE_IDENT_RE
              ],
              className: {
                1: "keyword",
                3: "title.class"
              }
            },
            {
              begin: hljs.IDENT_RE + "::",
              keywords: {
                keyword: "Self",
                built_in: BUILTINS,
                type: TYPES
              }
            },
            {
              className: "punctuation",
              begin: "->"
            },
            FUNCTION_INVOKE
          ]
        };
      }
      module.exports = rust;
    }
  });

  // node_modules/highlight.js/lib/languages/scala.js
  var require_scala = __commonJS({
    "node_modules/highlight.js/lib/languages/scala.js"(exports, module) {
      function scala(hljs) {
        const regex = hljs.regex;
        const ANNOTATION = {
          className: "meta",
          begin: "@[A-Za-z]+"
        };
        const SUBST = {
          className: "subst",
          variants: [
            { begin: "\\$[A-Za-z0-9_]+" },
            {
              begin: /\$\{/,
              end: /\}/
            }
          ]
        };
        const STRING = {
          className: "string",
          variants: [
            {
              begin: '"""',
              end: '"""'
            },
            {
              begin: '"',
              end: '"',
              illegal: "\\n",
              contains: [hljs.BACKSLASH_ESCAPE]
            },
            {
              begin: '[a-z]+"',
              end: '"',
              illegal: "\\n",
              contains: [
                hljs.BACKSLASH_ESCAPE,
                SUBST
              ]
            },
            {
              className: "string",
              begin: '[a-z]+"""',
              end: '"""',
              contains: [SUBST],
              relevance: 10
            }
          ]
        };
        const TYPE = {
          className: "type",
          begin: "\\b[A-Z][A-Za-z0-9_]*",
          relevance: 0
        };
        const NAME = {
          className: "title",
          begin: /[^0-9\n\t "'(),.`{}\[\]:;][^\n\t "'(),.`{}\[\]:;]+|[^0-9\n\t "'(),.`{}\[\]:;=]/,
          relevance: 0
        };
        const CLASS = {
          className: "class",
          beginKeywords: "class object trait type",
          end: /[:={\[\n;]/,
          excludeEnd: true,
          contains: [
            hljs.C_LINE_COMMENT_MODE,
            hljs.C_BLOCK_COMMENT_MODE,
            {
              beginKeywords: "extends with",
              relevance: 10
            },
            {
              begin: /\[/,
              end: /\]/,
              excludeBegin: true,
              excludeEnd: true,
              relevance: 0,
              contains: [
                TYPE,
                hljs.C_LINE_COMMENT_MODE,
                hljs.C_BLOCK_COMMENT_MODE
              ]
            },
            {
              className: "params",
              begin: /\(/,
              end: /\)/,
              excludeBegin: true,
              excludeEnd: true,
              relevance: 0,
              contains: [
                TYPE,
                hljs.C_LINE_COMMENT_MODE,
                hljs.C_BLOCK_COMMENT_MODE
              ]
            },
            NAME
          ]
        };
        const METHOD = {
          className: "function",
          beginKeywords: "def",
          end: regex.lookahead(/[:={\[(\n;]/),
          contains: [NAME]
        };
        const EXTENSION = {
          begin: [
            /^\s*/,
            // Is first token on the line
            "extension",
            /\s+(?=[[(])/
            // followed by at least one space and `[` or `(`
          ],
          beginScope: { 2: "keyword" }
        };
        const END = {
          begin: [
            /^\s*/,
            // Is first token on the line
            /end/,
            /\s+/,
            /(extension\b)?/
            // `extension` is the only marker that follows an `end` that cannot be captured by another rule.
          ],
          beginScope: {
            2: "keyword",
            4: "keyword"
          }
        };
        const INLINE_MODES = [
          { match: /\.inline\b/ },
          {
            begin: /\binline(?=\s)/,
            keywords: "inline"
          }
        ];
        const USING_PARAM_CLAUSE = {
          begin: [
            /\(\s*/,
            // Opening `(` of a parameter or argument list
            /using/,
            /\s+(?!\))/
            // Spaces not followed by `)`
          ],
          beginScope: { 2: "keyword" }
        };
        const DIRECTIVE_VALUE = {
          className: "string",
          begin: /\S+/
        };
        const USING_DIRECTIVE = {
          begin: [
            "//>",
            /\s+/,
            /using/,
            /\s+/,
            /\S+/
          ],
          beginScope: {
            1: "comment",
            3: "keyword",
            5: "type"
          },
          end: /$/,
          contains: [
            DIRECTIVE_VALUE
          ]
        };
        return {
          name: "Scala",
          keywords: {
            literal: "true false null",
            keyword: "type yield lazy override def with val var sealed abstract private trait object if then forSome for while do throw finally protected extends import final return else break new catch super class case package default try this match continue throws implicit export enum given transparent"
          },
          contains: [
            USING_DIRECTIVE,
            hljs.C_LINE_COMMENT_MODE,
            hljs.C_BLOCK_COMMENT_MODE,
            STRING,
            TYPE,
            METHOD,
            CLASS,
            hljs.C_NUMBER_MODE,
            EXTENSION,
            END,
            ...INLINE_MODES,
            USING_PARAM_CLAUSE,
            ANNOTATION
          ]
        };
      }
      module.exports = scala;
    }
  });

  // node_modules/highlight.js/lib/languages/scss.js
  var require_scss = __commonJS({
    "node_modules/highlight.js/lib/languages/scss.js"(exports, module) {
      var MODES = (hljs) => {
        return {
          IMPORTANT: {
            scope: "meta",
            begin: "!important"
          },
          BLOCK_COMMENT: hljs.C_BLOCK_COMMENT_MODE,
          HEXCOLOR: {
            scope: "number",
            begin: /#(([0-9a-fA-F]{3,4})|(([0-9a-fA-F]{2}){3,4}))\b/
          },
          FUNCTION_DISPATCH: {
            className: "built_in",
            begin: /[\w-]+(?=\()/
          },
          ATTRIBUTE_SELECTOR_MODE: {
            scope: "selector-attr",
            begin: /\[/,
            end: /\]/,
            illegal: "$",
            contains: [
              hljs.APOS_STRING_MODE,
              hljs.QUOTE_STRING_MODE
            ]
          },
          CSS_NUMBER_MODE: {
            scope: "number",
            begin: hljs.NUMBER_RE + "(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",
            relevance: 0
          },
          CSS_VARIABLE: {
            className: "attr",
            begin: /--[A-Za-z_][A-Za-z0-9_-]*/
          }
        };
      };
      var HTML_TAGS = [
        "a",
        "abbr",
        "address",
        "article",
        "aside",
        "audio",
        "b",
        "blockquote",
        "body",
        "button",
        "canvas",
        "caption",
        "cite",
        "code",
        "dd",
        "del",
        "details",
        "dfn",
        "div",
        "dl",
        "dt",
        "em",
        "fieldset",
        "figcaption",
        "figure",
        "footer",
        "form",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "header",
        "hgroup",
        "html",
        "i",
        "iframe",
        "img",
        "input",
        "ins",
        "kbd",
        "label",
        "legend",
        "li",
        "main",
        "mark",
        "menu",
        "nav",
        "object",
        "ol",
        "optgroup",
        "option",
        "p",
        "picture",
        "q",
        "quote",
        "samp",
        "section",
        "select",
        "source",
        "span",
        "strong",
        "summary",
        "sup",
        "table",
        "tbody",
        "td",
        "textarea",
        "tfoot",
        "th",
        "thead",
        "time",
        "tr",
        "ul",
        "var",
        "video"
      ];
      var SVG_TAGS = [
        "defs",
        "g",
        "marker",
        "mask",
        "pattern",
        "svg",
        "switch",
        "symbol",
        "feBlend",
        "feColorMatrix",
        "feComponentTransfer",
        "feComposite",
        "feConvolveMatrix",
        "feDiffuseLighting",
        "feDisplacementMap",
        "feFlood",
        "feGaussianBlur",
        "feImage",
        "feMerge",
        "feMorphology",
        "feOffset",
        "feSpecularLighting",
        "feTile",
        "feTurbulence",
        "linearGradient",
        "radialGradient",
        "stop",
        "circle",
        "ellipse",
        "image",
        "line",
        "path",
        "polygon",
        "polyline",
        "rect",
        "text",
        "use",
        "textPath",
        "tspan",
        "foreignObject",
        "clipPath"
      ];
      var TAGS = [
        ...HTML_TAGS,
        ...SVG_TAGS
      ];
      var MEDIA_FEATURES = [
        "any-hover",
        "any-pointer",
        "aspect-ratio",
        "color",
        "color-gamut",
        "color-index",
        "device-aspect-ratio",
        "device-height",
        "device-width",
        "display-mode",
        "forced-colors",
        "grid",
        "height",
        "hover",
        "inverted-colors",
        "monochrome",
        "orientation",
        "overflow-block",
        "overflow-inline",
        "pointer",
        "prefers-color-scheme",
        "prefers-contrast",
        "prefers-reduced-motion",
        "prefers-reduced-transparency",
        "resolution",
        "scan",
        "scripting",
        "update",
        "width",
        // TODO: find a better solution?
        "min-width",
        "max-width",
        "min-height",
        "max-height"
      ].sort().reverse();
      var PSEUDO_CLASSES = [
        "active",
        "any-link",
        "blank",
        "checked",
        "current",
        "default",
        "defined",
        "dir",
        // dir()
        "disabled",
        "drop",
        "empty",
        "enabled",
        "first",
        "first-child",
        "first-of-type",
        "fullscreen",
        "future",
        "focus",
        "focus-visible",
        "focus-within",
        "has",
        // has()
        "host",
        // host or host()
        "host-context",
        // host-context()
        "hover",
        "indeterminate",
        "in-range",
        "invalid",
        "is",
        // is()
        "lang",
        // lang()
        "last-child",
        "last-of-type",
        "left",
        "link",
        "local-link",
        "not",
        // not()
        "nth-child",
        // nth-child()
        "nth-col",
        // nth-col()
        "nth-last-child",
        // nth-last-child()
        "nth-last-col",
        // nth-last-col()
        "nth-last-of-type",
        //nth-last-of-type()
        "nth-of-type",
        //nth-of-type()
        "only-child",
        "only-of-type",
        "optional",
        "out-of-range",
        "past",
        "placeholder-shown",
        "read-only",
        "read-write",
        "required",
        "right",
        "root",
        "scope",
        "target",
        "target-within",
        "user-invalid",
        "valid",
        "visited",
        "where"
        // where()
      ].sort().reverse();
      var PSEUDO_ELEMENTS = [
        "after",
        "backdrop",
        "before",
        "cue",
        "cue-region",
        "first-letter",
        "first-line",
        "grammar-error",
        "marker",
        "part",
        "placeholder",
        "selection",
        "slotted",
        "spelling-error"
      ].sort().reverse();
      var ATTRIBUTES = [
        "accent-color",
        "align-content",
        "align-items",
        "align-self",
        "alignment-baseline",
        "all",
        "anchor-name",
        "animation",
        "animation-composition",
        "animation-delay",
        "animation-direction",
        "animation-duration",
        "animation-fill-mode",
        "animation-iteration-count",
        "animation-name",
        "animation-play-state",
        "animation-range",
        "animation-range-end",
        "animation-range-start",
        "animation-timeline",
        "animation-timing-function",
        "appearance",
        "aspect-ratio",
        "backdrop-filter",
        "backface-visibility",
        "background",
        "background-attachment",
        "background-blend-mode",
        "background-clip",
        "background-color",
        "background-image",
        "background-origin",
        "background-position",
        "background-position-x",
        "background-position-y",
        "background-repeat",
        "background-size",
        "baseline-shift",
        "block-size",
        "border",
        "border-block",
        "border-block-color",
        "border-block-end",
        "border-block-end-color",
        "border-block-end-style",
        "border-block-end-width",
        "border-block-start",
        "border-block-start-color",
        "border-block-start-style",
        "border-block-start-width",
        "border-block-style",
        "border-block-width",
        "border-bottom",
        "border-bottom-color",
        "border-bottom-left-radius",
        "border-bottom-right-radius",
        "border-bottom-style",
        "border-bottom-width",
        "border-collapse",
        "border-color",
        "border-end-end-radius",
        "border-end-start-radius",
        "border-image",
        "border-image-outset",
        "border-image-repeat",
        "border-image-slice",
        "border-image-source",
        "border-image-width",
        "border-inline",
        "border-inline-color",
        "border-inline-end",
        "border-inline-end-color",
        "border-inline-end-style",
        "border-inline-end-width",
        "border-inline-start",
        "border-inline-start-color",
        "border-inline-start-style",
        "border-inline-start-width",
        "border-inline-style",
        "border-inline-width",
        "border-left",
        "border-left-color",
        "border-left-style",
        "border-left-width",
        "border-radius",
        "border-right",
        "border-right-color",
        "border-right-style",
        "border-right-width",
        "border-spacing",
        "border-start-end-radius",
        "border-start-start-radius",
        "border-style",
        "border-top",
        "border-top-color",
        "border-top-left-radius",
        "border-top-right-radius",
        "border-top-style",
        "border-top-width",
        "border-width",
        "bottom",
        "box-align",
        "box-decoration-break",
        "box-direction",
        "box-flex",
        "box-flex-group",
        "box-lines",
        "box-ordinal-group",
        "box-orient",
        "box-pack",
        "box-shadow",
        "box-sizing",
        "break-after",
        "break-before",
        "break-inside",
        "caption-side",
        "caret-color",
        "clear",
        "clip",
        "clip-path",
        "clip-rule",
        "color",
        "color-interpolation",
        "color-interpolation-filters",
        "color-profile",
        "color-rendering",
        "color-scheme",
        "column-count",
        "column-fill",
        "column-gap",
        "column-rule",
        "column-rule-color",
        "column-rule-style",
        "column-rule-width",
        "column-span",
        "column-width",
        "columns",
        "contain",
        "contain-intrinsic-block-size",
        "contain-intrinsic-height",
        "contain-intrinsic-inline-size",
        "contain-intrinsic-size",
        "contain-intrinsic-width",
        "container",
        "container-name",
        "container-type",
        "content",
        "content-visibility",
        "counter-increment",
        "counter-reset",
        "counter-set",
        "cue",
        "cue-after",
        "cue-before",
        "cursor",
        "cx",
        "cy",
        "direction",
        "display",
        "dominant-baseline",
        "empty-cells",
        "enable-background",
        "field-sizing",
        "fill",
        "fill-opacity",
        "fill-rule",
        "filter",
        "flex",
        "flex-basis",
        "flex-direction",
        "flex-flow",
        "flex-grow",
        "flex-shrink",
        "flex-wrap",
        "float",
        "flood-color",
        "flood-opacity",
        "flow",
        "font",
        "font-display",
        "font-family",
        "font-feature-settings",
        "font-kerning",
        "font-language-override",
        "font-optical-sizing",
        "font-palette",
        "font-size",
        "font-size-adjust",
        "font-smooth",
        "font-smoothing",
        "font-stretch",
        "font-style",
        "font-synthesis",
        "font-synthesis-position",
        "font-synthesis-small-caps",
        "font-synthesis-style",
        "font-synthesis-weight",
        "font-variant",
        "font-variant-alternates",
        "font-variant-caps",
        "font-variant-east-asian",
        "font-variant-emoji",
        "font-variant-ligatures",
        "font-variant-numeric",
        "font-variant-position",
        "font-variation-settings",
        "font-weight",
        "forced-color-adjust",
        "gap",
        "glyph-orientation-horizontal",
        "glyph-orientation-vertical",
        "grid",
        "grid-area",
        "grid-auto-columns",
        "grid-auto-flow",
        "grid-auto-rows",
        "grid-column",
        "grid-column-end",
        "grid-column-start",
        "grid-gap",
        "grid-row",
        "grid-row-end",
        "grid-row-start",
        "grid-template",
        "grid-template-areas",
        "grid-template-columns",
        "grid-template-rows",
        "hanging-punctuation",
        "height",
        "hyphenate-character",
        "hyphenate-limit-chars",
        "hyphens",
        "icon",
        "image-orientation",
        "image-rendering",
        "image-resolution",
        "ime-mode",
        "initial-letter",
        "initial-letter-align",
        "inline-size",
        "inset",
        "inset-area",
        "inset-block",
        "inset-block-end",
        "inset-block-start",
        "inset-inline",
        "inset-inline-end",
        "inset-inline-start",
        "isolation",
        "justify-content",
        "justify-items",
        "justify-self",
        "kerning",
        "left",
        "letter-spacing",
        "lighting-color",
        "line-break",
        "line-height",
        "line-height-step",
        "list-style",
        "list-style-image",
        "list-style-position",
        "list-style-type",
        "margin",
        "margin-block",
        "margin-block-end",
        "margin-block-start",
        "margin-bottom",
        "margin-inline",
        "margin-inline-end",
        "margin-inline-start",
        "margin-left",
        "margin-right",
        "margin-top",
        "margin-trim",
        "marker",
        "marker-end",
        "marker-mid",
        "marker-start",
        "marks",
        "mask",
        "mask-border",
        "mask-border-mode",
        "mask-border-outset",
        "mask-border-repeat",
        "mask-border-slice",
        "mask-border-source",
        "mask-border-width",
        "mask-clip",
        "mask-composite",
        "mask-image",
        "mask-mode",
        "mask-origin",
        "mask-position",
        "mask-repeat",
        "mask-size",
        "mask-type",
        "masonry-auto-flow",
        "math-depth",
        "math-shift",
        "math-style",
        "max-block-size",
        "max-height",
        "max-inline-size",
        "max-width",
        "min-block-size",
        "min-height",
        "min-inline-size",
        "min-width",
        "mix-blend-mode",
        "nav-down",
        "nav-index",
        "nav-left",
        "nav-right",
        "nav-up",
        "none",
        "normal",
        "object-fit",
        "object-position",
        "offset",
        "offset-anchor",
        "offset-distance",
        "offset-path",
        "offset-position",
        "offset-rotate",
        "opacity",
        "order",
        "orphans",
        "outline",
        "outline-color",
        "outline-offset",
        "outline-style",
        "outline-width",
        "overflow",
        "overflow-anchor",
        "overflow-block",
        "overflow-clip-margin",
        "overflow-inline",
        "overflow-wrap",
        "overflow-x",
        "overflow-y",
        "overlay",
        "overscroll-behavior",
        "overscroll-behavior-block",
        "overscroll-behavior-inline",
        "overscroll-behavior-x",
        "overscroll-behavior-y",
        "padding",
        "padding-block",
        "padding-block-end",
        "padding-block-start",
        "padding-bottom",
        "padding-inline",
        "padding-inline-end",
        "padding-inline-start",
        "padding-left",
        "padding-right",
        "padding-top",
        "page",
        "page-break-after",
        "page-break-before",
        "page-break-inside",
        "paint-order",
        "pause",
        "pause-after",
        "pause-before",
        "perspective",
        "perspective-origin",
        "place-content",
        "place-items",
        "place-self",
        "pointer-events",
        "position",
        "position-anchor",
        "position-visibility",
        "print-color-adjust",
        "quotes",
        "r",
        "resize",
        "rest",
        "rest-after",
        "rest-before",
        "right",
        "rotate",
        "row-gap",
        "ruby-align",
        "ruby-position",
        "scale",
        "scroll-behavior",
        "scroll-margin",
        "scroll-margin-block",
        "scroll-margin-block-end",
        "scroll-margin-block-start",
        "scroll-margin-bottom",
        "scroll-margin-inline",
        "scroll-margin-inline-end",
        "scroll-margin-inline-start",
        "scroll-margin-left",
        "scroll-margin-right",
        "scroll-margin-top",
        "scroll-padding",
        "scroll-padding-block",
        "scroll-padding-block-end",
        "scroll-padding-block-start",
        "scroll-padding-bottom",
        "scroll-padding-inline",
        "scroll-padding-inline-end",
        "scroll-padding-inline-start",
        "scroll-padding-left",
        "scroll-padding-right",
        "scroll-padding-top",
        "scroll-snap-align",
        "scroll-snap-stop",
        "scroll-snap-type",
        "scroll-timeline",
        "scroll-timeline-axis",
        "scroll-timeline-name",
        "scrollbar-color",
        "scrollbar-gutter",
        "scrollbar-width",
        "shape-image-threshold",
        "shape-margin",
        "shape-outside",
        "shape-rendering",
        "speak",
        "speak-as",
        "src",
        // @font-face
        "stop-color",
        "stop-opacity",
        "stroke",
        "stroke-dasharray",
        "stroke-dashoffset",
        "stroke-linecap",
        "stroke-linejoin",
        "stroke-miterlimit",
        "stroke-opacity",
        "stroke-width",
        "tab-size",
        "table-layout",
        "text-align",
        "text-align-all",
        "text-align-last",
        "text-anchor",
        "text-combine-upright",
        "text-decoration",
        "text-decoration-color",
        "text-decoration-line",
        "text-decoration-skip",
        "text-decoration-skip-ink",
        "text-decoration-style",
        "text-decoration-thickness",
        "text-emphasis",
        "text-emphasis-color",
        "text-emphasis-position",
        "text-emphasis-style",
        "text-indent",
        "text-justify",
        "text-orientation",
        "text-overflow",
        "text-rendering",
        "text-shadow",
        "text-size-adjust",
        "text-transform",
        "text-underline-offset",
        "text-underline-position",
        "text-wrap",
        "text-wrap-mode",
        "text-wrap-style",
        "timeline-scope",
        "top",
        "touch-action",
        "transform",
        "transform-box",
        "transform-origin",
        "transform-style",
        "transition",
        "transition-behavior",
        "transition-delay",
        "transition-duration",
        "transition-property",
        "transition-timing-function",
        "translate",
        "unicode-bidi",
        "user-modify",
        "user-select",
        "vector-effect",
        "vertical-align",
        "view-timeline",
        "view-timeline-axis",
        "view-timeline-inset",
        "view-timeline-name",
        "view-transition-name",
        "visibility",
        "voice-balance",
        "voice-duration",
        "voice-family",
        "voice-pitch",
        "voice-range",
        "voice-rate",
        "voice-stress",
        "voice-volume",
        "white-space",
        "white-space-collapse",
        "widows",
        "width",
        "will-change",
        "word-break",
        "word-spacing",
        "word-wrap",
        "writing-mode",
        "x",
        "y",
        "z-index",
        "zoom"
      ].sort().reverse();
      function scss(hljs) {
        const modes = MODES(hljs);
        const PSEUDO_ELEMENTS$1 = PSEUDO_ELEMENTS;
        const PSEUDO_CLASSES$1 = PSEUDO_CLASSES;
        const AT_IDENTIFIER = "@[a-z-]+";
        const AT_MODIFIERS = "and or not only";
        const IDENT_RE = "[a-zA-Z-][a-zA-Z0-9_-]*";
        const VARIABLE = {
          className: "variable",
          begin: "(\\$" + IDENT_RE + ")\\b",
          relevance: 0
        };
        return {
          name: "SCSS",
          case_insensitive: true,
          illegal: "[=/|']",
          contains: [
            hljs.C_LINE_COMMENT_MODE,
            hljs.C_BLOCK_COMMENT_MODE,
            // to recognize keyframe 40% etc which are outside the scope of our
            // attribute value mode
            modes.CSS_NUMBER_MODE,
            {
              className: "selector-id",
              begin: "#[A-Za-z0-9_-]+",
              relevance: 0
            },
            {
              className: "selector-class",
              begin: "\\.[A-Za-z0-9_-]+",
              relevance: 0
            },
            modes.ATTRIBUTE_SELECTOR_MODE,
            {
              className: "selector-tag",
              begin: "\\b(" + TAGS.join("|") + ")\\b",
              // was there, before, but why?
              relevance: 0
            },
            {
              className: "selector-pseudo",
              begin: ":(" + PSEUDO_CLASSES$1.join("|") + ")"
            },
            {
              className: "selector-pseudo",
              begin: ":(:)?(" + PSEUDO_ELEMENTS$1.join("|") + ")"
            },
            VARIABLE,
            {
              // pseudo-selector params
              begin: /\(/,
              end: /\)/,
              contains: [modes.CSS_NUMBER_MODE]
            },
            modes.CSS_VARIABLE,
            {
              className: "attribute",
              begin: "\\b(" + ATTRIBUTES.join("|") + ")\\b"
            },
            { begin: "\\b(whitespace|wait|w-resize|visible|vertical-text|vertical-ideographic|uppercase|upper-roman|upper-alpha|underline|transparent|top|thin|thick|text|text-top|text-bottom|tb-rl|table-header-group|table-footer-group|sw-resize|super|strict|static|square|solid|small-caps|separate|se-resize|scroll|s-resize|rtl|row-resize|ridge|right|repeat|repeat-y|repeat-x|relative|progress|pointer|overline|outside|outset|oblique|nowrap|not-allowed|normal|none|nw-resize|no-repeat|no-drop|newspaper|ne-resize|n-resize|move|middle|medium|ltr|lr-tb|lowercase|lower-roman|lower-alpha|loose|list-item|line|line-through|line-edge|lighter|left|keep-all|justify|italic|inter-word|inter-ideograph|inside|inset|inline|inline-block|inherit|inactive|ideograph-space|ideograph-parenthesis|ideograph-numeric|ideograph-alpha|horizontal|hidden|help|hand|groove|fixed|ellipsis|e-resize|double|dotted|distribute|distribute-space|distribute-letter|distribute-all-lines|disc|disabled|default|decimal|dashed|crosshair|collapse|col-resize|circle|char|center|capitalize|break-word|break-all|bottom|both|bolder|bold|block|bidi-override|below|baseline|auto|always|all-scroll|absolute|table|table-cell)\\b" },
            {
              begin: /:/,
              end: /[;}{]/,
              relevance: 0,
              contains: [
                modes.BLOCK_COMMENT,
                VARIABLE,
                modes.HEXCOLOR,
                modes.CSS_NUMBER_MODE,
                hljs.QUOTE_STRING_MODE,
                hljs.APOS_STRING_MODE,
                modes.IMPORTANT,
                modes.FUNCTION_DISPATCH
              ]
            },
            // matching these here allows us to treat them more like regular CSS
            // rules so everything between the {} gets regular rule highlighting,
            // which is what we want for page and font-face
            {
              begin: "@(page|font-face)",
              keywords: {
                $pattern: AT_IDENTIFIER,
                keyword: "@page @font-face"
              }
            },
            {
              begin: "@",
              end: "[{;]",
              returnBegin: true,
              keywords: {
                $pattern: /[a-z-]+/,
                keyword: AT_MODIFIERS,
                attribute: MEDIA_FEATURES.join(" ")
              },
              contains: [
                {
                  begin: AT_IDENTIFIER,
                  className: "keyword"
                },
                {
                  begin: /[a-z-]+(?=:)/,
                  className: "attribute"
                },
                VARIABLE,
                hljs.QUOTE_STRING_MODE,
                hljs.APOS_STRING_MODE,
                modes.HEXCOLOR,
                modes.CSS_NUMBER_MODE
              ]
            },
            modes.FUNCTION_DISPATCH
          ]
        };
      }
      module.exports = scss;
    }
  });

  // node_modules/highlight.js/lib/languages/shell.js
  var require_shell = __commonJS({
    "node_modules/highlight.js/lib/languages/shell.js"(exports, module) {
      function shell(hljs) {
        return {
          name: "Shell Session",
          aliases: [
            "console",
            "shellsession"
          ],
          contains: [
            {
              className: "meta.prompt",
              // We cannot add \s (spaces) in the regular expression otherwise it will be too broad and produce unexpected result.
              // For instance, in the following example, it would match "echo /path/to/home >" as a prompt:
              // echo /path/to/home > t.exe
              begin: /^\s{0,3}[/~\w\d[\]()@-]*[>%$#][ ]?/,
              starts: {
                end: /[^\\](?=\s*$)/,
                subLanguage: "bash"
              }
            }
          ]
        };
      }
      module.exports = shell;
    }
  });

  // node_modules/highlight.js/lib/languages/sql.js
  var require_sql = __commonJS({
    "node_modules/highlight.js/lib/languages/sql.js"(exports, module) {
      function sql(hljs) {
        const regex = hljs.regex;
        const COMMENT_MODE = hljs.COMMENT("--", "$");
        const STRING = {
          scope: "string",
          variants: [
            {
              begin: /'/,
              end: /'/,
              contains: [{ match: /''/ }]
            }
          ]
        };
        const QUOTED_IDENTIFIER = {
          begin: /"/,
          end: /"/,
          contains: [{ match: /""/ }]
        };
        const LITERALS = [
          "true",
          "false",
          // Not sure it's correct to call NULL literal, and clauses like IS [NOT] NULL look strange that way.
          // "null",
          "unknown"
        ];
        const MULTI_WORD_TYPES = [
          "double precision",
          "large object",
          "with timezone",
          "without timezone"
        ];
        const TYPES = [
          "bigint",
          "binary",
          "blob",
          "boolean",
          "char",
          "character",
          "clob",
          "date",
          "dec",
          "decfloat",
          "decimal",
          "float",
          "int",
          "integer",
          "interval",
          "nchar",
          "nclob",
          "national",
          "numeric",
          "real",
          "row",
          "smallint",
          "time",
          "timestamp",
          "varchar",
          "varying",
          // modifier (character varying)
          "varbinary"
        ];
        const NON_RESERVED_WORDS = [
          "add",
          "asc",
          "collation",
          "desc",
          "final",
          "first",
          "last",
          "view"
        ];
        const RESERVED_WORDS = [
          "abs",
          "acos",
          "all",
          "allocate",
          "alter",
          "and",
          "any",
          "are",
          "array",
          "array_agg",
          "array_max_cardinality",
          "as",
          "asensitive",
          "asin",
          "asymmetric",
          "at",
          "atan",
          "atomic",
          "authorization",
          "avg",
          "begin",
          "begin_frame",
          "begin_partition",
          "between",
          "bigint",
          "binary",
          "blob",
          "boolean",
          "both",
          "by",
          "call",
          "called",
          "cardinality",
          "cascaded",
          "case",
          "cast",
          "ceil",
          "ceiling",
          "char",
          "char_length",
          "character",
          "character_length",
          "check",
          "classifier",
          "clob",
          "close",
          "coalesce",
          "collate",
          "collect",
          "column",
          "commit",
          "condition",
          "connect",
          "constraint",
          "contains",
          "convert",
          "copy",
          "corr",
          "corresponding",
          "cos",
          "cosh",
          "count",
          "covar_pop",
          "covar_samp",
          "create",
          "cross",
          "cube",
          "cume_dist",
          "current",
          "current_catalog",
          "current_date",
          "current_default_transform_group",
          "current_path",
          "current_role",
          "current_row",
          "current_schema",
          "current_time",
          "current_timestamp",
          "current_path",
          "current_role",
          "current_transform_group_for_type",
          "current_user",
          "cursor",
          "cycle",
          "date",
          "day",
          "deallocate",
          "dec",
          "decimal",
          "decfloat",
          "declare",
          "default",
          "define",
          "delete",
          "dense_rank",
          "deref",
          "describe",
          "deterministic",
          "disconnect",
          "distinct",
          "double",
          "drop",
          "dynamic",
          "each",
          "element",
          "else",
          "empty",
          "end",
          "end_frame",
          "end_partition",
          "end-exec",
          "equals",
          "escape",
          "every",
          "except",
          "exec",
          "execute",
          "exists",
          "exp",
          "external",
          "extract",
          "false",
          "fetch",
          "filter",
          "first_value",
          "float",
          "floor",
          "for",
          "foreign",
          "frame_row",
          "free",
          "from",
          "full",
          "function",
          "fusion",
          "get",
          "global",
          "grant",
          "group",
          "grouping",
          "groups",
          "having",
          "hold",
          "hour",
          "identity",
          "in",
          "indicator",
          "initial",
          "inner",
          "inout",
          "insensitive",
          "insert",
          "int",
          "integer",
          "intersect",
          "intersection",
          "interval",
          "into",
          "is",
          "join",
          "json_array",
          "json_arrayagg",
          "json_exists",
          "json_object",
          "json_objectagg",
          "json_query",
          "json_table",
          "json_table_primitive",
          "json_value",
          "lag",
          "language",
          "large",
          "last_value",
          "lateral",
          "lead",
          "leading",
          "left",
          "like",
          "like_regex",
          "listagg",
          "ln",
          "local",
          "localtime",
          "localtimestamp",
          "log",
          "log10",
          "lower",
          "match",
          "match_number",
          "match_recognize",
          "matches",
          "max",
          "member",
          "merge",
          "method",
          "min",
          "minute",
          "mod",
          "modifies",
          "module",
          "month",
          "multiset",
          "national",
          "natural",
          "nchar",
          "nclob",
          "new",
          "no",
          "none",
          "normalize",
          "not",
          "nth_value",
          "ntile",
          "null",
          "nullif",
          "numeric",
          "octet_length",
          "occurrences_regex",
          "of",
          "offset",
          "old",
          "omit",
          "on",
          "one",
          "only",
          "open",
          "or",
          "order",
          "out",
          "outer",
          "over",
          "overlaps",
          "overlay",
          "parameter",
          "partition",
          "pattern",
          "per",
          "percent",
          "percent_rank",
          "percentile_cont",
          "percentile_disc",
          "period",
          "portion",
          "position",
          "position_regex",
          "power",
          "precedes",
          "precision",
          "prepare",
          "primary",
          "procedure",
          "ptf",
          "range",
          "rank",
          "reads",
          "real",
          "recursive",
          "ref",
          "references",
          "referencing",
          "regr_avgx",
          "regr_avgy",
          "regr_count",
          "regr_intercept",
          "regr_r2",
          "regr_slope",
          "regr_sxx",
          "regr_sxy",
          "regr_syy",
          "release",
          "result",
          "return",
          "returns",
          "revoke",
          "right",
          "rollback",
          "rollup",
          "row",
          "row_number",
          "rows",
          "running",
          "savepoint",
          "scope",
          "scroll",
          "search",
          "second",
          "seek",
          "select",
          "sensitive",
          "session_user",
          "set",
          "show",
          "similar",
          "sin",
          "sinh",
          "skip",
          "smallint",
          "some",
          "specific",
          "specifictype",
          "sql",
          "sqlexception",
          "sqlstate",
          "sqlwarning",
          "sqrt",
          "start",
          "static",
          "stddev_pop",
          "stddev_samp",
          "submultiset",
          "subset",
          "substring",
          "substring_regex",
          "succeeds",
          "sum",
          "symmetric",
          "system",
          "system_time",
          "system_user",
          "table",
          "tablesample",
          "tan",
          "tanh",
          "then",
          "time",
          "timestamp",
          "timezone_hour",
          "timezone_minute",
          "to",
          "trailing",
          "translate",
          "translate_regex",
          "translation",
          "treat",
          "trigger",
          "trim",
          "trim_array",
          "true",
          "truncate",
          "uescape",
          "union",
          "unique",
          "unknown",
          "unnest",
          "update",
          "upper",
          "user",
          "using",
          "value",
          "values",
          "value_of",
          "var_pop",
          "var_samp",
          "varbinary",
          "varchar",
          "varying",
          "versioning",
          "when",
          "whenever",
          "where",
          "width_bucket",
          "window",
          "with",
          "within",
          "without",
          "year"
        ];
        const RESERVED_FUNCTIONS = [
          "abs",
          "acos",
          "array_agg",
          "asin",
          "atan",
          "avg",
          "cast",
          "ceil",
          "ceiling",
          "coalesce",
          "corr",
          "cos",
          "cosh",
          "count",
          "covar_pop",
          "covar_samp",
          "cume_dist",
          "dense_rank",
          "deref",
          "element",
          "exp",
          "extract",
          "first_value",
          "floor",
          "json_array",
          "json_arrayagg",
          "json_exists",
          "json_object",
          "json_objectagg",
          "json_query",
          "json_table",
          "json_table_primitive",
          "json_value",
          "lag",
          "last_value",
          "lead",
          "listagg",
          "ln",
          "log",
          "log10",
          "lower",
          "max",
          "min",
          "mod",
          "nth_value",
          "ntile",
          "nullif",
          "percent_rank",
          "percentile_cont",
          "percentile_disc",
          "position",
          "position_regex",
          "power",
          "rank",
          "regr_avgx",
          "regr_avgy",
          "regr_count",
          "regr_intercept",
          "regr_r2",
          "regr_slope",
          "regr_sxx",
          "regr_sxy",
          "regr_syy",
          "row_number",
          "sin",
          "sinh",
          "sqrt",
          "stddev_pop",
          "stddev_samp",
          "substring",
          "substring_regex",
          "sum",
          "tan",
          "tanh",
          "translate",
          "translate_regex",
          "treat",
          "trim",
          "trim_array",
          "unnest",
          "upper",
          "value_of",
          "var_pop",
          "var_samp",
          "width_bucket"
        ];
        const POSSIBLE_WITHOUT_PARENS = [
          "current_catalog",
          "current_date",
          "current_default_transform_group",
          "current_path",
          "current_role",
          "current_schema",
          "current_transform_group_for_type",
          "current_user",
          "session_user",
          "system_time",
          "system_user",
          "current_time",
          "localtime",
          "current_timestamp",
          "localtimestamp"
        ];
        const COMBOS = [
          "create table",
          "insert into",
          "primary key",
          "foreign key",
          "not null",
          "alter table",
          "add constraint",
          "grouping sets",
          "on overflow",
          "character set",
          "respect nulls",
          "ignore nulls",
          "nulls first",
          "nulls last",
          "depth first",
          "breadth first"
        ];
        const FUNCTIONS = RESERVED_FUNCTIONS;
        const KEYWORDS = [
          ...RESERVED_WORDS,
          ...NON_RESERVED_WORDS
        ].filter((keyword) => {
          return !RESERVED_FUNCTIONS.includes(keyword);
        });
        const VARIABLE = {
          scope: "variable",
          match: /@[a-z0-9][a-z0-9_]*/
        };
        const OPERATOR = {
          scope: "operator",
          match: /[-+*/=%^~]|&&?|\|\|?|!=?|<(?:=>?|<|>)?|>[>=]?/,
          relevance: 0
        };
        const FUNCTION_CALL = {
          match: regex.concat(/\b/, regex.either(...FUNCTIONS), /\s*\(/),
          relevance: 0,
          keywords: { built_in: FUNCTIONS }
        };
        function kws_to_regex(list) {
          return regex.concat(
            /\b/,
            regex.either(...list.map((kw) => {
              return kw.replace(/\s+/, "\\s+");
            })),
            /\b/
          );
        }
        const MULTI_WORD_KEYWORDS = {
          scope: "keyword",
          match: kws_to_regex(COMBOS),
          relevance: 0
        };
        function reduceRelevancy(list, {
          exceptions,
          when
        } = {}) {
          const qualifyFn = when;
          exceptions = exceptions || [];
          return list.map((item) => {
            if (item.match(/\|\d+$/) || exceptions.includes(item)) {
              return item;
            } else if (qualifyFn(item)) {
              return `${item}|0`;
            } else {
              return item;
            }
          });
        }
        return {
          name: "SQL",
          case_insensitive: true,
          // does not include {} or HTML tags `</`
          illegal: /[{}]|<\//,
          keywords: {
            $pattern: /\b[\w\.]+/,
            keyword: reduceRelevancy(KEYWORDS, { when: (x) => x.length < 3 }),
            literal: LITERALS,
            type: TYPES,
            built_in: POSSIBLE_WITHOUT_PARENS
          },
          contains: [
            {
              scope: "type",
              match: kws_to_regex(MULTI_WORD_TYPES)
            },
            MULTI_WORD_KEYWORDS,
            FUNCTION_CALL,
            VARIABLE,
            STRING,
            QUOTED_IDENTIFIER,
            hljs.C_NUMBER_MODE,
            hljs.C_BLOCK_COMMENT_MODE,
            COMMENT_MODE,
            OPERATOR
          ]
        };
      }
      module.exports = sql;
    }
  });

  // node_modules/highlight.js/lib/languages/swift.js
  var require_swift = __commonJS({
    "node_modules/highlight.js/lib/languages/swift.js"(exports, module) {
      function source(re) {
        if (!re) return null;
        if (typeof re === "string") return re;
        return re.source;
      }
      function lookahead(re) {
        return concat("(?=", re, ")");
      }
      function concat(...args) {
        const joined = args.map((x) => source(x)).join("");
        return joined;
      }
      function stripOptionsFromArgs(args) {
        const opts = args[args.length - 1];
        if (typeof opts === "object" && opts.constructor === Object) {
          args.splice(args.length - 1, 1);
          return opts;
        } else {
          return {};
        }
      }
      function either(...args) {
        const opts = stripOptionsFromArgs(args);
        const joined = "(" + (opts.capture ? "" : "?:") + args.map((x) => source(x)).join("|") + ")";
        return joined;
      }
      var keywordWrapper = (keyword) => concat(
        /\b/,
        keyword,
        /\w$/.test(keyword) ? /\b/ : /\B/
      );
      var dotKeywords = [
        "Protocol",
        // contextual
        "Type"
        // contextual
      ].map(keywordWrapper);
      var optionalDotKeywords = [
        "init",
        "self"
      ].map(keywordWrapper);
      var keywordTypes = [
        "Any",
        "Self"
      ];
      var keywords = [
        // strings below will be fed into the regular `keywords` engine while regex
        // will result in additional modes being created to scan for those keywords to
        // avoid conflicts with other rules
        "actor",
        "any",
        // contextual
        "associatedtype",
        "async",
        "await",
        /as\?/,
        // operator
        /as!/,
        // operator
        "as",
        // operator
        "borrowing",
        // contextual
        "break",
        "case",
        "catch",
        "class",
        "consume",
        // contextual
        "consuming",
        // contextual
        "continue",
        "convenience",
        // contextual
        "copy",
        // contextual
        "default",
        "defer",
        "deinit",
        "didSet",
        // contextual
        "distributed",
        "do",
        "dynamic",
        // contextual
        "each",
        "else",
        "enum",
        "extension",
        "fallthrough",
        /fileprivate\(set\)/,
        "fileprivate",
        "final",
        // contextual
        "for",
        "func",
        "get",
        // contextual
        "guard",
        "if",
        "import",
        "indirect",
        // contextual
        "infix",
        // contextual
        /init\?/,
        /init!/,
        "inout",
        /internal\(set\)/,
        "internal",
        "in",
        "is",
        // operator
        "isolated",
        // contextual
        "nonisolated",
        // contextual
        "lazy",
        // contextual
        "let",
        "macro",
        "mutating",
        // contextual
        "nonmutating",
        // contextual
        /open\(set\)/,
        // contextual
        "open",
        // contextual
        "operator",
        "optional",
        // contextual
        "override",
        // contextual
        "package",
        "postfix",
        // contextual
        "precedencegroup",
        "prefix",
        // contextual
        /private\(set\)/,
        "private",
        "protocol",
        /public\(set\)/,
        "public",
        "repeat",
        "required",
        // contextual
        "rethrows",
        "return",
        "set",
        // contextual
        "some",
        // contextual
        "static",
        "struct",
        "subscript",
        "super",
        "switch",
        "throws",
        "throw",
        /try\?/,
        // operator
        /try!/,
        // operator
        "try",
        // operator
        "typealias",
        /unowned\(safe\)/,
        // contextual
        /unowned\(unsafe\)/,
        // contextual
        "unowned",
        // contextual
        "var",
        "weak",
        // contextual
        "where",
        "while",
        "willSet"
        // contextual
      ];
      var literals = [
        "false",
        "nil",
        "true"
      ];
      var precedencegroupKeywords = [
        "assignment",
        "associativity",
        "higherThan",
        "left",
        "lowerThan",
        "none",
        "right"
      ];
      var numberSignKeywords = [
        "#colorLiteral",
        "#column",
        "#dsohandle",
        "#else",
        "#elseif",
        "#endif",
        "#error",
        "#file",
        "#fileID",
        "#fileLiteral",
        "#filePath",
        "#function",
        "#if",
        "#imageLiteral",
        "#keyPath",
        "#line",
        "#selector",
        "#sourceLocation",
        "#warning"
      ];
      var builtIns = [
        "abs",
        "all",
        "any",
        "assert",
        "assertionFailure",
        "debugPrint",
        "dump",
        "fatalError",
        "getVaList",
        "isKnownUniquelyReferenced",
        "max",
        "min",
        "numericCast",
        "pointwiseMax",
        "pointwiseMin",
        "precondition",
        "preconditionFailure",
        "print",
        "readLine",
        "repeatElement",
        "sequence",
        "stride",
        "swap",
        "swift_unboxFromSwiftValueWithType",
        "transcode",
        "type",
        "unsafeBitCast",
        "unsafeDowncast",
        "withExtendedLifetime",
        "withUnsafeMutablePointer",
        "withUnsafePointer",
        "withVaList",
        "withoutActuallyEscaping",
        "zip"
      ];
      var operatorHead = either(
        /[/=\-+!*%<>&|^~?]/,
        /[\u00A1-\u00A7]/,
        /[\u00A9\u00AB]/,
        /[\u00AC\u00AE]/,
        /[\u00B0\u00B1]/,
        /[\u00B6\u00BB\u00BF\u00D7\u00F7]/,
        /[\u2016-\u2017]/,
        /[\u2020-\u2027]/,
        /[\u2030-\u203E]/,
        /[\u2041-\u2053]/,
        /[\u2055-\u205E]/,
        /[\u2190-\u23FF]/,
        /[\u2500-\u2775]/,
        /[\u2794-\u2BFF]/,
        /[\u2E00-\u2E7F]/,
        /[\u3001-\u3003]/,
        /[\u3008-\u3020]/,
        /[\u3030]/
      );
      var operatorCharacter = either(
        operatorHead,
        /[\u0300-\u036F]/,
        /[\u1DC0-\u1DFF]/,
        /[\u20D0-\u20FF]/,
        /[\uFE00-\uFE0F]/,
        /[\uFE20-\uFE2F]/
        // TODO: The following characters are also allowed, but the regex isn't supported yet.
        // /[\u{E0100}-\u{E01EF}]/u
      );
      var operator = concat(operatorHead, operatorCharacter, "*");
      var identifierHead = either(
        /[a-zA-Z_]/,
        /[\u00A8\u00AA\u00AD\u00AF\u00B2-\u00B5\u00B7-\u00BA]/,
        /[\u00BC-\u00BE\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]/,
        /[\u0100-\u02FF\u0370-\u167F\u1681-\u180D\u180F-\u1DBF]/,
        /[\u1E00-\u1FFF]/,
        /[\u200B-\u200D\u202A-\u202E\u203F-\u2040\u2054\u2060-\u206F]/,
        /[\u2070-\u20CF\u2100-\u218F\u2460-\u24FF\u2776-\u2793]/,
        /[\u2C00-\u2DFF\u2E80-\u2FFF]/,
        /[\u3004-\u3007\u3021-\u302F\u3031-\u303F\u3040-\uD7FF]/,
        /[\uF900-\uFD3D\uFD40-\uFDCF\uFDF0-\uFE1F\uFE30-\uFE44]/,
        /[\uFE47-\uFEFE\uFF00-\uFFFD]/
        // Should be /[\uFE47-\uFFFD]/, but we have to exclude FEFF.
        // The following characters are also allowed, but the regexes aren't supported yet.
        // /[\u{10000}-\u{1FFFD}\u{20000-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}]/u,
        // /[\u{50000}-\u{5FFFD}\u{60000-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}]/u,
        // /[\u{90000}-\u{9FFFD}\u{A0000-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}]/u,
        // /[\u{D0000}-\u{DFFFD}\u{E0000-\u{EFFFD}]/u
      );
      var identifierCharacter = either(
        identifierHead,
        /\d/,
        /[\u0300-\u036F\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]/
      );
      var identifier = concat(identifierHead, identifierCharacter, "*");
      var typeIdentifier = concat(/[A-Z]/, identifierCharacter, "*");
      var keywordAttributes = [
        "attached",
        "autoclosure",
        concat(/convention\(/, either("swift", "block", "c"), /\)/),
        "discardableResult",
        "dynamicCallable",
        "dynamicMemberLookup",
        "escaping",
        "freestanding",
        "frozen",
        "GKInspectable",
        "IBAction",
        "IBDesignable",
        "IBInspectable",
        "IBOutlet",
        "IBSegueAction",
        "inlinable",
        "main",
        "nonobjc",
        "NSApplicationMain",
        "NSCopying",
        "NSManaged",
        concat(/objc\(/, identifier, /\)/),
        "objc",
        "objcMembers",
        "propertyWrapper",
        "requires_stored_property_inits",
        "resultBuilder",
        "Sendable",
        "testable",
        "UIApplicationMain",
        "unchecked",
        "unknown",
        "usableFromInline",
        "warn_unqualified_access"
      ];
      var availabilityKeywords = [
        "iOS",
        "iOSApplicationExtension",
        "macOS",
        "macOSApplicationExtension",
        "macCatalyst",
        "macCatalystApplicationExtension",
        "watchOS",
        "watchOSApplicationExtension",
        "tvOS",
        "tvOSApplicationExtension",
        "swift"
      ];
      function swift(hljs) {
        const WHITESPACE = {
          match: /\s+/,
          relevance: 0
        };
        const BLOCK_COMMENT = hljs.COMMENT(
          "/\\*",
          "\\*/",
          { contains: ["self"] }
        );
        const COMMENTS = [
          hljs.C_LINE_COMMENT_MODE,
          BLOCK_COMMENT
        ];
        const DOT_KEYWORD = {
          match: [
            /\./,
            either(...dotKeywords, ...optionalDotKeywords)
          ],
          className: { 2: "keyword" }
        };
        const KEYWORD_GUARD = {
          // Consume .keyword to prevent highlighting properties and methods as keywords.
          match: concat(/\./, either(...keywords)),
          relevance: 0
        };
        const PLAIN_KEYWORDS = keywords.filter((kw) => typeof kw === "string").concat(["_|0"]);
        const REGEX_KEYWORDS = keywords.filter((kw) => typeof kw !== "string").concat(keywordTypes).map(keywordWrapper);
        const KEYWORD = { variants: [
          {
            className: "keyword",
            match: either(...REGEX_KEYWORDS, ...optionalDotKeywords)
          }
        ] };
        const KEYWORDS = {
          $pattern: either(
            /\b\w+/,
            // regular keywords
            /#\w+/
            // number keywords
          ),
          keyword: PLAIN_KEYWORDS.concat(numberSignKeywords),
          literal: literals
        };
        const KEYWORD_MODES = [
          DOT_KEYWORD,
          KEYWORD_GUARD,
          KEYWORD
        ];
        const BUILT_IN_GUARD = {
          // Consume .built_in to prevent highlighting properties and methods.
          match: concat(/\./, either(...builtIns)),
          relevance: 0
        };
        const BUILT_IN = {
          className: "built_in",
          match: concat(/\b/, either(...builtIns), /(?=\()/)
        };
        const BUILT_INS = [
          BUILT_IN_GUARD,
          BUILT_IN
        ];
        const OPERATOR_GUARD = {
          // Prevent -> from being highlighting as an operator.
          match: /->/,
          relevance: 0
        };
        const OPERATOR = {
          className: "operator",
          relevance: 0,
          variants: [
            { match: operator },
            {
              // dot-operator: only operators that start with a dot are allowed to use dots as
              // characters (..., ...<, .*, etc). So there rule here is: a dot followed by one or more
              // characters that may also include dots.
              match: `\\.(\\.|${operatorCharacter})+`
            }
          ]
        };
        const OPERATORS = [
          OPERATOR_GUARD,
          OPERATOR
        ];
        const decimalDigits = "([0-9]_*)+";
        const hexDigits = "([0-9a-fA-F]_*)+";
        const NUMBER = {
          className: "number",
          relevance: 0,
          variants: [
            // decimal floating-point-literal (subsumes decimal-literal)
            { match: `\\b(${decimalDigits})(\\.(${decimalDigits}))?([eE][+-]?(${decimalDigits}))?\\b` },
            // hexadecimal floating-point-literal (subsumes hexadecimal-literal)
            { match: `\\b0x(${hexDigits})(\\.(${hexDigits}))?([pP][+-]?(${decimalDigits}))?\\b` },
            // octal-literal
            { match: /\b0o([0-7]_*)+\b/ },
            // binary-literal
            { match: /\b0b([01]_*)+\b/ }
          ]
        };
        const ESCAPED_CHARACTER = (rawDelimiter = "") => ({
          className: "subst",
          variants: [
            { match: concat(/\\/, rawDelimiter, /[0\\tnr"']/) },
            { match: concat(/\\/, rawDelimiter, /u\{[0-9a-fA-F]{1,8}\}/) }
          ]
        });
        const ESCAPED_NEWLINE = (rawDelimiter = "") => ({
          className: "subst",
          match: concat(/\\/, rawDelimiter, /[\t ]*(?:[\r\n]|\r\n)/)
        });
        const INTERPOLATION = (rawDelimiter = "") => ({
          className: "subst",
          label: "interpol",
          begin: concat(/\\/, rawDelimiter, /\(/),
          end: /\)/
        });
        const MULTILINE_STRING = (rawDelimiter = "") => ({
          begin: concat(rawDelimiter, /"""/),
          end: concat(/"""/, rawDelimiter),
          contains: [
            ESCAPED_CHARACTER(rawDelimiter),
            ESCAPED_NEWLINE(rawDelimiter),
            INTERPOLATION(rawDelimiter)
          ]
        });
        const SINGLE_LINE_STRING = (rawDelimiter = "") => ({
          begin: concat(rawDelimiter, /"/),
          end: concat(/"/, rawDelimiter),
          contains: [
            ESCAPED_CHARACTER(rawDelimiter),
            INTERPOLATION(rawDelimiter)
          ]
        });
        const STRING = {
          className: "string",
          variants: [
            MULTILINE_STRING(),
            MULTILINE_STRING("#"),
            MULTILINE_STRING("##"),
            MULTILINE_STRING("###"),
            SINGLE_LINE_STRING(),
            SINGLE_LINE_STRING("#"),
            SINGLE_LINE_STRING("##"),
            SINGLE_LINE_STRING("###")
          ]
        };
        const REGEXP_CONTENTS = [
          hljs.BACKSLASH_ESCAPE,
          {
            begin: /\[/,
            end: /\]/,
            relevance: 0,
            contains: [hljs.BACKSLASH_ESCAPE]
          }
        ];
        const BARE_REGEXP_LITERAL = {
          begin: /\/[^\s](?=[^/\n]*\/)/,
          end: /\//,
          contains: REGEXP_CONTENTS
        };
        const EXTENDED_REGEXP_LITERAL = (rawDelimiter) => {
          const begin = concat(rawDelimiter, /\//);
          const end = concat(/\//, rawDelimiter);
          return {
            begin,
            end,
            contains: [
              ...REGEXP_CONTENTS,
              {
                scope: "comment",
                begin: `#(?!.*${end})`,
                end: /$/
              }
            ]
          };
        };
        const REGEXP = {
          scope: "regexp",
          variants: [
            EXTENDED_REGEXP_LITERAL("###"),
            EXTENDED_REGEXP_LITERAL("##"),
            EXTENDED_REGEXP_LITERAL("#"),
            BARE_REGEXP_LITERAL
          ]
        };
        const QUOTED_IDENTIFIER = { match: concat(/`/, identifier, /`/) };
        const IMPLICIT_PARAMETER = {
          className: "variable",
          match: /\$\d+/
        };
        const PROPERTY_WRAPPER_PROJECTION = {
          className: "variable",
          match: `\\$${identifierCharacter}+`
        };
        const IDENTIFIERS = [
          QUOTED_IDENTIFIER,
          IMPLICIT_PARAMETER,
          PROPERTY_WRAPPER_PROJECTION
        ];
        const AVAILABLE_ATTRIBUTE = {
          match: /(@|#(un)?)available/,
          scope: "keyword",
          starts: { contains: [
            {
              begin: /\(/,
              end: /\)/,
              keywords: availabilityKeywords,
              contains: [
                ...OPERATORS,
                NUMBER,
                STRING
              ]
            }
          ] }
        };
        const KEYWORD_ATTRIBUTE = {
          scope: "keyword",
          match: concat(/@/, either(...keywordAttributes), lookahead(either(/\(/, /\s+/)))
        };
        const USER_DEFINED_ATTRIBUTE = {
          scope: "meta",
          match: concat(/@/, identifier)
        };
        const ATTRIBUTES = [
          AVAILABLE_ATTRIBUTE,
          KEYWORD_ATTRIBUTE,
          USER_DEFINED_ATTRIBUTE
        ];
        const TYPE = {
          match: lookahead(/\b[A-Z]/),
          relevance: 0,
          contains: [
            {
              // Common Apple frameworks, for relevance boost
              className: "type",
              match: concat(/(AV|CA|CF|CG|CI|CL|CM|CN|CT|MK|MP|MTK|MTL|NS|SCN|SK|UI|WK|XC)/, identifierCharacter, "+")
            },
            {
              // Type identifier
              className: "type",
              match: typeIdentifier,
              relevance: 0
            },
            {
              // Optional type
              match: /[?!]+/,
              relevance: 0
            },
            {
              // Variadic parameter
              match: /\.\.\./,
              relevance: 0
            },
            {
              // Protocol composition
              match: concat(/\s+&\s+/, lookahead(typeIdentifier)),
              relevance: 0
            }
          ]
        };
        const GENERIC_ARGUMENTS = {
          begin: /</,
          end: />/,
          keywords: KEYWORDS,
          contains: [
            ...COMMENTS,
            ...KEYWORD_MODES,
            ...ATTRIBUTES,
            OPERATOR_GUARD,
            TYPE
          ]
        };
        TYPE.contains.push(GENERIC_ARGUMENTS);
        const TUPLE_ELEMENT_NAME = {
          match: concat(identifier, /\s*:/),
          keywords: "_|0",
          relevance: 0
        };
        const TUPLE = {
          begin: /\(/,
          end: /\)/,
          relevance: 0,
          keywords: KEYWORDS,
          contains: [
            "self",
            TUPLE_ELEMENT_NAME,
            ...COMMENTS,
            REGEXP,
            ...KEYWORD_MODES,
            ...BUILT_INS,
            ...OPERATORS,
            NUMBER,
            STRING,
            ...IDENTIFIERS,
            ...ATTRIBUTES,
            TYPE
          ]
        };
        const GENERIC_PARAMETERS = {
          begin: /</,
          end: />/,
          keywords: "repeat each",
          contains: [
            ...COMMENTS,
            TYPE
          ]
        };
        const FUNCTION_PARAMETER_NAME = {
          begin: either(
            lookahead(concat(identifier, /\s*:/)),
            lookahead(concat(identifier, /\s+/, identifier, /\s*:/))
          ),
          end: /:/,
          relevance: 0,
          contains: [
            {
              className: "keyword",
              match: /\b_\b/
            },
            {
              className: "params",
              match: identifier
            }
          ]
        };
        const FUNCTION_PARAMETERS = {
          begin: /\(/,
          end: /\)/,
          keywords: KEYWORDS,
          contains: [
            FUNCTION_PARAMETER_NAME,
            ...COMMENTS,
            ...KEYWORD_MODES,
            ...OPERATORS,
            NUMBER,
            STRING,
            ...ATTRIBUTES,
            TYPE,
            TUPLE
          ],
          endsParent: true,
          illegal: /["']/
        };
        const FUNCTION_OR_MACRO = {
          match: [
            /(func|macro)/,
            /\s+/,
            either(QUOTED_IDENTIFIER.match, identifier, operator)
          ],
          className: {
            1: "keyword",
            3: "title.function"
          },
          contains: [
            GENERIC_PARAMETERS,
            FUNCTION_PARAMETERS,
            WHITESPACE
          ],
          illegal: [
            /\[/,
            /%/
          ]
        };
        const INIT_SUBSCRIPT = {
          match: [
            /\b(?:subscript|init[?!]?)/,
            /\s*(?=[<(])/
          ],
          className: { 1: "keyword" },
          contains: [
            GENERIC_PARAMETERS,
            FUNCTION_PARAMETERS,
            WHITESPACE
          ],
          illegal: /\[|%/
        };
        const OPERATOR_DECLARATION = {
          match: [
            /operator/,
            /\s+/,
            operator
          ],
          className: {
            1: "keyword",
            3: "title"
          }
        };
        const PRECEDENCEGROUP = {
          begin: [
            /precedencegroup/,
            /\s+/,
            typeIdentifier
          ],
          className: {
            1: "keyword",
            3: "title"
          },
          contains: [TYPE],
          keywords: [
            ...precedencegroupKeywords,
            ...literals
          ],
          end: /}/
        };
        const CLASS_FUNC_DECLARATION = {
          match: [
            /class\b/,
            /\s+/,
            /func\b/,
            /\s+/,
            /\b[A-Za-z_][A-Za-z0-9_]*\b/
          ],
          scope: {
            1: "keyword",
            3: "keyword",
            5: "title.function"
          }
        };
        const CLASS_VAR_DECLARATION = {
          match: [
            /class\b/,
            /\s+/,
            /var\b/
          ],
          scope: {
            1: "keyword",
            3: "keyword"
          }
        };
        const TYPE_DECLARATION = {
          begin: [
            /(struct|protocol|class|extension|enum|actor)/,
            /\s+/,
            identifier,
            /\s*/
          ],
          beginScope: {
            1: "keyword",
            3: "title.class"
          },
          keywords: KEYWORDS,
          contains: [
            GENERIC_PARAMETERS,
            ...KEYWORD_MODES,
            {
              begin: /:/,
              end: /\{/,
              keywords: KEYWORDS,
              contains: [
                {
                  scope: "title.class.inherited",
                  match: typeIdentifier
                },
                ...KEYWORD_MODES
              ],
              relevance: 0
            }
          ]
        };
        for (const variant of STRING.variants) {
          const interpolation = variant.contains.find((mode) => mode.label === "interpol");
          interpolation.keywords = KEYWORDS;
          const submodes = [
            ...KEYWORD_MODES,
            ...BUILT_INS,
            ...OPERATORS,
            NUMBER,
            STRING,
            ...IDENTIFIERS
          ];
          interpolation.contains = [
            ...submodes,
            {
              begin: /\(/,
              end: /\)/,
              contains: [
                "self",
                ...submodes
              ]
            }
          ];
        }
        return {
          name: "Swift",
          keywords: KEYWORDS,
          contains: [
            ...COMMENTS,
            FUNCTION_OR_MACRO,
            INIT_SUBSCRIPT,
            CLASS_FUNC_DECLARATION,
            CLASS_VAR_DECLARATION,
            TYPE_DECLARATION,
            OPERATOR_DECLARATION,
            PRECEDENCEGROUP,
            {
              beginKeywords: "import",
              end: /$/,
              contains: [...COMMENTS],
              relevance: 0
            },
            REGEXP,
            ...KEYWORD_MODES,
            ...BUILT_INS,
            ...OPERATORS,
            NUMBER,
            STRING,
            ...IDENTIFIERS,
            ...ATTRIBUTES,
            TYPE,
            TUPLE
          ]
        };
      }
      module.exports = swift;
    }
  });

  // node_modules/highlight.js/lib/languages/yaml.js
  var require_yaml = __commonJS({
    "node_modules/highlight.js/lib/languages/yaml.js"(exports, module) {
      function yaml(hljs) {
        const LITERALS = "true false yes no null";
        const URI_CHARACTERS = "[\\w#;/?:@&=+$,.~*'()[\\]]+";
        const KEY = {
          className: "attr",
          variants: [
            // added brackets support and special char support
            { begin: /[\w*@][\w*@ :()\./-]*:(?=[ \t]|$)/ },
            {
              // double quoted keys - with brackets and special char support
              begin: /"[\w*@][\w*@ :()\./-]*":(?=[ \t]|$)/
            },
            {
              // single quoted keys - with brackets and special char support
              begin: /'[\w*@][\w*@ :()\./-]*':(?=[ \t]|$)/
            }
          ]
        };
        const TEMPLATE_VARIABLES = {
          className: "template-variable",
          variants: [
            {
              // jinja templates Ansible
              begin: /\{\{/,
              end: /\}\}/
            },
            {
              // Ruby i18n
              begin: /%\{/,
              end: /\}/
            }
          ]
        };
        const SINGLE_QUOTE_STRING = {
          className: "string",
          relevance: 0,
          begin: /'/,
          end: /'/,
          contains: [
            {
              match: /''/,
              scope: "char.escape",
              relevance: 0
            }
          ]
        };
        const STRING = {
          className: "string",
          relevance: 0,
          variants: [
            {
              begin: /"/,
              end: /"/
            },
            { begin: /\S+/ }
          ],
          contains: [
            hljs.BACKSLASH_ESCAPE,
            TEMPLATE_VARIABLES
          ]
        };
        const CONTAINER_STRING = hljs.inherit(STRING, { variants: [
          {
            begin: /'/,
            end: /'/,
            contains: [
              {
                begin: /''/,
                relevance: 0
              }
            ]
          },
          {
            begin: /"/,
            end: /"/
          },
          { begin: /[^\s,{}[\]]+/ }
        ] });
        const DATE_RE = "[0-9]{4}(-[0-9][0-9]){0,2}";
        const TIME_RE = "([Tt \\t][0-9][0-9]?(:[0-9][0-9]){2})?";
        const FRACTION_RE = "(\\.[0-9]*)?";
        const ZONE_RE = "([ \\t])*(Z|[-+][0-9][0-9]?(:[0-9][0-9])?)?";
        const TIMESTAMP = {
          className: "number",
          begin: "\\b" + DATE_RE + TIME_RE + FRACTION_RE + ZONE_RE + "\\b"
        };
        const VALUE_CONTAINER = {
          end: ",",
          endsWithParent: true,
          excludeEnd: true,
          keywords: LITERALS,
          relevance: 0
        };
        const OBJECT = {
          begin: /\{/,
          end: /\}/,
          contains: [VALUE_CONTAINER],
          illegal: "\\n",
          relevance: 0
        };
        const ARRAY = {
          begin: "\\[",
          end: "\\]",
          contains: [VALUE_CONTAINER],
          illegal: "\\n",
          relevance: 0
        };
        const MODES = [
          KEY,
          {
            className: "meta",
            begin: "^---\\s*$",
            relevance: 10
          },
          {
            // multi line string
            // Blocks start with a | or > followed by a newline
            //
            // Indentation of subsequent lines must be the same to
            // be considered part of the block
            className: "string",
            begin: "[\\|>]([1-9]?[+-])?[ ]*\\n( +)[^ ][^\\n]*\\n(\\2[^\\n]+\\n?)*"
          },
          {
            // Ruby/Rails erb
            begin: "<%[%=-]?",
            end: "[%-]?%>",
            subLanguage: "ruby",
            excludeBegin: true,
            excludeEnd: true,
            relevance: 0
          },
          {
            // named tags
            className: "type",
            begin: "!\\w+!" + URI_CHARACTERS
          },
          // https://yaml.org/spec/1.2/spec.html#id2784064
          {
            // verbatim tags
            className: "type",
            begin: "!<" + URI_CHARACTERS + ">"
          },
          {
            // primary tags
            className: "type",
            begin: "!" + URI_CHARACTERS
          },
          {
            // secondary tags
            className: "type",
            begin: "!!" + URI_CHARACTERS
          },
          {
            // fragment id &ref
            className: "meta",
            begin: "&" + hljs.UNDERSCORE_IDENT_RE + "$"
          },
          {
            // fragment reference *ref
            className: "meta",
            begin: "\\*" + hljs.UNDERSCORE_IDENT_RE + "$"
          },
          {
            // array listing
            className: "bullet",
            // TODO: remove |$ hack when we have proper look-ahead support
            begin: "-(?=[ ]|$)",
            relevance: 0
          },
          hljs.HASH_COMMENT_MODE,
          {
            beginKeywords: LITERALS,
            keywords: { literal: LITERALS }
          },
          TIMESTAMP,
          // numbers are any valid C-style number that
          // sit isolated from other words
          {
            className: "number",
            begin: hljs.C_NUMBER_RE + "\\b",
            relevance: 0
          },
          OBJECT,
          ARRAY,
          SINGLE_QUOTE_STRING,
          STRING
        ];
        const VALUE_MODES = [...MODES];
        VALUE_MODES.pop();
        VALUE_MODES.push(CONTAINER_STRING);
        VALUE_CONTAINER.contains = VALUE_MODES;
        return {
          name: "YAML",
          case_insensitive: true,
          aliases: ["yml"],
          contains: MODES
        };
      }
      module.exports = yaml;
    }
  });

  // node_modules/highlight.js/lib/languages/typescript.js
  var require_typescript = __commonJS({
    "node_modules/highlight.js/lib/languages/typescript.js"(exports, module) {
      var IDENT_RE = "[A-Za-z$_][0-9A-Za-z$_]*";
      var KEYWORDS = [
        "as",
        // for exports
        "in",
        "of",
        "if",
        "for",
        "while",
        "finally",
        "var",
        "new",
        "function",
        "do",
        "return",
        "void",
        "else",
        "break",
        "catch",
        "instanceof",
        "with",
        "throw",
        "case",
        "default",
        "try",
        "switch",
        "continue",
        "typeof",
        "delete",
        "let",
        "yield",
        "const",
        "class",
        // JS handles these with a special rule
        // "get",
        // "set",
        "debugger",
        "async",
        "await",
        "static",
        "import",
        "from",
        "export",
        "extends",
        // It's reached stage 3, which is "recommended for implementation":
        "using"
      ];
      var LITERALS = [
        "true",
        "false",
        "null",
        "undefined",
        "NaN",
        "Infinity"
      ];
      var TYPES = [
        // Fundamental objects
        "Object",
        "Function",
        "Boolean",
        "Symbol",
        // numbers and dates
        "Math",
        "Date",
        "Number",
        "BigInt",
        // text
        "String",
        "RegExp",
        // Indexed collections
        "Array",
        "Float32Array",
        "Float64Array",
        "Int8Array",
        "Uint8Array",
        "Uint8ClampedArray",
        "Int16Array",
        "Int32Array",
        "Uint16Array",
        "Uint32Array",
        "BigInt64Array",
        "BigUint64Array",
        // Keyed collections
        "Set",
        "Map",
        "WeakSet",
        "WeakMap",
        // Structured data
        "ArrayBuffer",
        "SharedArrayBuffer",
        "Atomics",
        "DataView",
        "JSON",
        // Control abstraction objects
        "Promise",
        "Generator",
        "GeneratorFunction",
        "AsyncFunction",
        // Reflection
        "Reflect",
        "Proxy",
        // Internationalization
        "Intl",
        // WebAssembly
        "WebAssembly"
      ];
      var ERROR_TYPES = [
        "Error",
        "EvalError",
        "InternalError",
        "RangeError",
        "ReferenceError",
        "SyntaxError",
        "TypeError",
        "URIError"
      ];
      var BUILT_IN_GLOBALS = [
        "setInterval",
        "setTimeout",
        "clearInterval",
        "clearTimeout",
        "require",
        "exports",
        "eval",
        "isFinite",
        "isNaN",
        "parseFloat",
        "parseInt",
        "decodeURI",
        "decodeURIComponent",
        "encodeURI",
        "encodeURIComponent",
        "escape",
        "unescape"
      ];
      var BUILT_IN_VARIABLES = [
        "arguments",
        "this",
        "super",
        "console",
        "window",
        "document",
        "localStorage",
        "sessionStorage",
        "module",
        "global"
        // Node.js
      ];
      var BUILT_INS = [].concat(
        BUILT_IN_GLOBALS,
        TYPES,
        ERROR_TYPES
      );
      function javascript(hljs) {
        const regex = hljs.regex;
        const hasClosingTag = (match, { after }) => {
          const tag = "</" + match[0].slice(1);
          const pos = match.input.indexOf(tag, after);
          return pos !== -1;
        };
        const IDENT_RE$1 = IDENT_RE;
        const FRAGMENT = {
          begin: "<>",
          end: "</>"
        };
        const XML_SELF_CLOSING = /<[A-Za-z0-9\\._:-]+\s*\/>/;
        const XML_TAG = {
          begin: /<[A-Za-z0-9\\._:-]+/,
          end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
          /**
           * @param {RegExpMatchArray} match
           * @param {CallbackResponse} response
           */
          isTrulyOpeningTag: (match, response) => {
            const afterMatchIndex = match[0].length + match.index;
            const nextChar = match.input[afterMatchIndex];
            if (
              // HTML should not include another raw `<` inside a tag
              // nested type?
              // `<Array<Array<number>>`, etc.
              nextChar === "<" || // the , gives away that this is not HTML
              // `<T, A extends keyof T, V>`
              nextChar === ","
            ) {
              response.ignoreMatch();
              return;
            }
            if (nextChar === ">") {
              if (!hasClosingTag(match, { after: afterMatchIndex })) {
                response.ignoreMatch();
              }
            }
            let m;
            const afterMatch = match.input.substring(afterMatchIndex);
            if (m = afterMatch.match(/^\s*=/)) {
              response.ignoreMatch();
              return;
            }
            if (m = afterMatch.match(/^\s+extends\s+/)) {
              if (m.index === 0) {
                response.ignoreMatch();
                return;
              }
            }
          }
        };
        const KEYWORDS$1 = {
          $pattern: IDENT_RE,
          keyword: KEYWORDS,
          literal: LITERALS,
          built_in: BUILT_INS,
          "variable.language": BUILT_IN_VARIABLES
        };
        const decimalDigits = "[0-9](_?[0-9])*";
        const frac = `\\.(${decimalDigits})`;
        const decimalInteger = `0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*`;
        const NUMBER = {
          className: "number",
          variants: [
            // DecimalLiteral
            { begin: `(\\b(${decimalInteger})((${frac})|\\.)?|(${frac}))[eE][+-]?(${decimalDigits})\\b` },
            { begin: `\\b(${decimalInteger})\\b((${frac})\\b|\\.)?|(${frac})\\b` },
            // DecimalBigIntegerLiteral
            { begin: `\\b(0|[1-9](_?[0-9])*)n\\b` },
            // NonDecimalIntegerLiteral
            { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
            { begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
            { begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },
            // LegacyOctalIntegerLiteral (does not include underscore separators)
            // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
            { begin: "\\b0[0-7]+n?\\b" }
          ],
          relevance: 0
        };
        const SUBST = {
          className: "subst",
          begin: "\\$\\{",
          end: "\\}",
          keywords: KEYWORDS$1,
          contains: []
          // defined later
        };
        const HTML_TEMPLATE = {
          begin: ".?html`",
          end: "",
          starts: {
            end: "`",
            returnEnd: false,
            contains: [
              hljs.BACKSLASH_ESCAPE,
              SUBST
            ],
            subLanguage: "xml"
          }
        };
        const CSS_TEMPLATE = {
          begin: ".?css`",
          end: "",
          starts: {
            end: "`",
            returnEnd: false,
            contains: [
              hljs.BACKSLASH_ESCAPE,
              SUBST
            ],
            subLanguage: "css"
          }
        };
        const GRAPHQL_TEMPLATE = {
          begin: ".?gql`",
          end: "",
          starts: {
            end: "`",
            returnEnd: false,
            contains: [
              hljs.BACKSLASH_ESCAPE,
              SUBST
            ],
            subLanguage: "graphql"
          }
        };
        const TEMPLATE_STRING = {
          className: "string",
          begin: "`",
          end: "`",
          contains: [
            hljs.BACKSLASH_ESCAPE,
            SUBST
          ]
        };
        const JSDOC_COMMENT = hljs.COMMENT(
          /\/\*\*(?!\/)/,
          "\\*/",
          {
            relevance: 0,
            contains: [
              {
                begin: "(?=@[A-Za-z]+)",
                relevance: 0,
                contains: [
                  {
                    className: "doctag",
                    begin: "@[A-Za-z]+"
                  },
                  {
                    className: "type",
                    begin: "\\{",
                    end: "\\}",
                    excludeEnd: true,
                    excludeBegin: true,
                    relevance: 0
                  },
                  {
                    className: "variable",
                    begin: IDENT_RE$1 + "(?=\\s*(-)|$)",
                    endsParent: true,
                    relevance: 0
                  },
                  // eat spaces (not newlines) so we can find
                  // types or variables
                  {
                    begin: /(?=[^\n])\s/,
                    relevance: 0
                  }
                ]
              }
            ]
          }
        );
        const COMMENT = {
          className: "comment",
          variants: [
            JSDOC_COMMENT,
            hljs.C_BLOCK_COMMENT_MODE,
            hljs.C_LINE_COMMENT_MODE
          ]
        };
        const SUBST_INTERNALS = [
          hljs.APOS_STRING_MODE,
          hljs.QUOTE_STRING_MODE,
          HTML_TEMPLATE,
          CSS_TEMPLATE,
          GRAPHQL_TEMPLATE,
          TEMPLATE_STRING,
          // Skip numbers when they are part of a variable name
          { match: /\$\d+/ },
          NUMBER
          // This is intentional:
          // See https://github.com/highlightjs/highlight.js/issues/3288
          // hljs.REGEXP_MODE
        ];
        SUBST.contains = SUBST_INTERNALS.concat({
          // we need to pair up {} inside our subst to prevent
          // it from ending too early by matching another }
          begin: /\{/,
          end: /\}/,
          keywords: KEYWORDS$1,
          contains: [
            "self"
          ].concat(SUBST_INTERNALS)
        });
        const SUBST_AND_COMMENTS = [].concat(COMMENT, SUBST.contains);
        const PARAMS_CONTAINS = SUBST_AND_COMMENTS.concat([
          // eat recursive parens in sub expressions
          {
            begin: /(\s*)\(/,
            end: /\)/,
            keywords: KEYWORDS$1,
            contains: ["self"].concat(SUBST_AND_COMMENTS)
          }
        ]);
        const PARAMS = {
          className: "params",
          // convert this to negative lookbehind in v12
          begin: /(\s*)\(/,
          // to match the parms with
          end: /\)/,
          excludeBegin: true,
          excludeEnd: true,
          keywords: KEYWORDS$1,
          contains: PARAMS_CONTAINS
        };
        const CLASS_OR_EXTENDS = {
          variants: [
            // class Car extends vehicle
            {
              match: [
                /class/,
                /\s+/,
                IDENT_RE$1,
                /\s+/,
                /extends/,
                /\s+/,
                regex.concat(IDENT_RE$1, "(", regex.concat(/\./, IDENT_RE$1), ")*")
              ],
              scope: {
                1: "keyword",
                3: "title.class",
                5: "keyword",
                7: "title.class.inherited"
              }
            },
            // class Car
            {
              match: [
                /class/,
                /\s+/,
                IDENT_RE$1
              ],
              scope: {
                1: "keyword",
                3: "title.class"
              }
            }
          ]
        };
        const CLASS_REFERENCE = {
          relevance: 0,
          match: regex.either(
            // Hard coded exceptions
            /\bJSON/,
            // Float32Array, OutT
            /\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,
            // CSSFactory, CSSFactoryT
            /\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,
            // FPs, FPsT
            /\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/
            // P
            // single letters are not highlighted
            // BLAH
            // this will be flagged as a UPPER_CASE_CONSTANT instead
          ),
          className: "title.class",
          keywords: {
            _: [
              // se we still get relevance credit for JS library classes
              ...TYPES,
              ...ERROR_TYPES
            ]
          }
        };
        const USE_STRICT = {
          label: "use_strict",
          className: "meta",
          relevance: 10,
          begin: /^\s*['"]use (strict|asm)['"]/
        };
        const FUNCTION_DEFINITION = {
          variants: [
            {
              match: [
                /function/,
                /\s+/,
                IDENT_RE$1,
                /(?=\s*\()/
              ]
            },
            // anonymous function
            {
              match: [
                /function/,
                /\s*(?=\()/
              ]
            }
          ],
          className: {
            1: "keyword",
            3: "title.function"
          },
          label: "func.def",
          contains: [PARAMS],
          illegal: /%/
        };
        const UPPER_CASE_CONSTANT = {
          relevance: 0,
          match: /\b[A-Z][A-Z_0-9]+\b/,
          className: "variable.constant"
        };
        function noneOf(list) {
          return regex.concat("(?!", list.join("|"), ")");
        }
        const FUNCTION_CALL = {
          match: regex.concat(
            /\b/,
            noneOf([
              ...BUILT_IN_GLOBALS,
              "super",
              "import"
            ].map((x) => `${x}\\s*\\(`)),
            IDENT_RE$1,
            regex.lookahead(/\s*\(/)
          ),
          className: "title.function",
          relevance: 0
        };
        const PROPERTY_ACCESS = {
          begin: regex.concat(/\./, regex.lookahead(
            regex.concat(IDENT_RE$1, /(?![0-9A-Za-z$_(])/)
          )),
          end: IDENT_RE$1,
          excludeBegin: true,
          keywords: "prototype",
          className: "property",
          relevance: 0
        };
        const GETTER_OR_SETTER = {
          match: [
            /get|set/,
            /\s+/,
            IDENT_RE$1,
            /(?=\()/
          ],
          className: {
            1: "keyword",
            3: "title.function"
          },
          contains: [
            {
              // eat to avoid empty params
              begin: /\(\)/
            },
            PARAMS
          ]
        };
        const FUNC_LEAD_IN_RE = "(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|" + hljs.UNDERSCORE_IDENT_RE + ")\\s*=>";
        const FUNCTION_VARIABLE = {
          match: [
            /const|var|let/,
            /\s+/,
            IDENT_RE$1,
            /\s*/,
            /=\s*/,
            /(async\s*)?/,
            // async is optional
            regex.lookahead(FUNC_LEAD_IN_RE)
          ],
          keywords: "async",
          className: {
            1: "keyword",
            3: "title.function"
          },
          contains: [
            PARAMS
          ]
        };
        return {
          name: "JavaScript",
          aliases: ["js", "jsx", "mjs", "cjs"],
          keywords: KEYWORDS$1,
          // this will be extended by TypeScript
          exports: { PARAMS_CONTAINS, CLASS_REFERENCE },
          illegal: /#(?![$_A-z])/,
          contains: [
            hljs.SHEBANG({
              label: "shebang",
              binary: "node",
              relevance: 5
            }),
            USE_STRICT,
            hljs.APOS_STRING_MODE,
            hljs.QUOTE_STRING_MODE,
            HTML_TEMPLATE,
            CSS_TEMPLATE,
            GRAPHQL_TEMPLATE,
            TEMPLATE_STRING,
            COMMENT,
            // Skip numbers when they are part of a variable name
            { match: /\$\d+/ },
            NUMBER,
            CLASS_REFERENCE,
            {
              scope: "attr",
              match: IDENT_RE$1 + regex.lookahead(":"),
              relevance: 0
            },
            FUNCTION_VARIABLE,
            {
              // "value" container
              begin: "(" + hljs.RE_STARTERS_RE + "|\\b(case|return|throw)\\b)\\s*",
              keywords: "return throw case",
              relevance: 0,
              contains: [
                COMMENT,
                hljs.REGEXP_MODE,
                {
                  className: "function",
                  // we have to count the parens to make sure we actually have the
                  // correct bounding ( ) before the =>.  There could be any number of
                  // sub-expressions inside also surrounded by parens.
                  begin: FUNC_LEAD_IN_RE,
                  returnBegin: true,
                  end: "\\s*=>",
                  contains: [
                    {
                      className: "params",
                      variants: [
                        {
                          begin: hljs.UNDERSCORE_IDENT_RE,
                          relevance: 0
                        },
                        {
                          className: null,
                          begin: /\(\s*\)/,
                          skip: true
                        },
                        {
                          begin: /(\s*)\(/,
                          end: /\)/,
                          excludeBegin: true,
                          excludeEnd: true,
                          keywords: KEYWORDS$1,
                          contains: PARAMS_CONTAINS
                        }
                      ]
                    }
                  ]
                },
                {
                  // could be a comma delimited list of params to a function call
                  begin: /,/,
                  relevance: 0
                },
                {
                  match: /\s+/,
                  relevance: 0
                },
                {
                  // JSX
                  variants: [
                    { begin: FRAGMENT.begin, end: FRAGMENT.end },
                    { match: XML_SELF_CLOSING },
                    {
                      begin: XML_TAG.begin,
                      // we carefully check the opening tag to see if it truly
                      // is a tag and not a false positive
                      "on:begin": XML_TAG.isTrulyOpeningTag,
                      end: XML_TAG.end
                    }
                  ],
                  subLanguage: "xml",
                  contains: [
                    {
                      begin: XML_TAG.begin,
                      end: XML_TAG.end,
                      skip: true,
                      contains: ["self"]
                    }
                  ]
                }
              ]
            },
            FUNCTION_DEFINITION,
            {
              // prevent this from getting swallowed up by function
              // since they appear "function like"
              beginKeywords: "while if switch catch for"
            },
            {
              // we have to count the parens to make sure we actually have the correct
              // bounding ( ).  There could be any number of sub-expressions inside
              // also surrounded by parens.
              begin: "\\b(?!function)" + hljs.UNDERSCORE_IDENT_RE + "\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{",
              // end parens
              returnBegin: true,
              label: "func.def",
              contains: [
                PARAMS,
                hljs.inherit(hljs.TITLE_MODE, { begin: IDENT_RE$1, className: "title.function" })
              ]
            },
            // catch ... so it won't trigger the property rule below
            {
              match: /\.\.\./,
              relevance: 0
            },
            PROPERTY_ACCESS,
            // hack: prevents detection of keywords in some circumstances
            // .keyword()
            // $keyword = x
            {
              match: "\\$" + IDENT_RE$1,
              relevance: 0
            },
            {
              match: [/\bconstructor(?=\s*\()/],
              className: { 1: "title.function" },
              contains: [PARAMS]
            },
            FUNCTION_CALL,
            UPPER_CASE_CONSTANT,
            CLASS_OR_EXTENDS,
            GETTER_OR_SETTER,
            {
              match: /\$[(.]/
              // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
            }
          ]
        };
      }
      function typescript(hljs) {
        const regex = hljs.regex;
        const tsLanguage = javascript(hljs);
        const IDENT_RE$1 = IDENT_RE;
        const TYPES2 = [
          "any",
          "void",
          "number",
          "boolean",
          "string",
          "object",
          "never",
          "symbol",
          "bigint",
          "unknown"
        ];
        const NAMESPACE = {
          begin: [
            /namespace/,
            /\s+/,
            hljs.IDENT_RE
          ],
          beginScope: {
            1: "keyword",
            3: "title.class"
          }
        };
        const INTERFACE = {
          beginKeywords: "interface",
          end: /\{/,
          excludeEnd: true,
          keywords: {
            keyword: "interface extends",
            built_in: TYPES2
          },
          contains: [tsLanguage.exports.CLASS_REFERENCE]
        };
        const USE_STRICT = {
          className: "meta",
          relevance: 10,
          begin: /^\s*['"]use strict['"]/
        };
        const TS_SPECIFIC_KEYWORDS = [
          "type",
          // "namespace",
          "interface",
          "public",
          "private",
          "protected",
          "implements",
          "declare",
          "abstract",
          "readonly",
          "enum",
          "override",
          "satisfies"
        ];
        const KEYWORDS$1 = {
          $pattern: IDENT_RE,
          keyword: KEYWORDS.concat(TS_SPECIFIC_KEYWORDS),
          literal: LITERALS,
          built_in: BUILT_INS.concat(TYPES2),
          "variable.language": BUILT_IN_VARIABLES
        };
        const DECORATOR = {
          className: "meta",
          begin: "@" + IDENT_RE$1
        };
        const swapMode = (mode, label, replacement) => {
          const indx = mode.contains.findIndex((m) => m.label === label);
          if (indx === -1) {
            throw new Error("can not find mode to replace");
          }
          mode.contains.splice(indx, 1, replacement);
        };
        Object.assign(tsLanguage.keywords, KEYWORDS$1);
        tsLanguage.exports.PARAMS_CONTAINS.push(DECORATOR);
        const ATTRIBUTE_HIGHLIGHT = tsLanguage.contains.find((c) => c.scope === "attr");
        const OPTIONAL_KEY_OR_ARGUMENT = Object.assign(
          {},
          ATTRIBUTE_HIGHLIGHT,
          { match: regex.concat(IDENT_RE$1, regex.lookahead(/\s*\?:/)) }
        );
        tsLanguage.exports.PARAMS_CONTAINS.push([
          tsLanguage.exports.CLASS_REFERENCE,
          // class reference for highlighting the params types
          ATTRIBUTE_HIGHLIGHT,
          // highlight the params key
          OPTIONAL_KEY_OR_ARGUMENT
          // Added for optional property assignment highlighting
        ]);
        tsLanguage.contains = tsLanguage.contains.concat([
          DECORATOR,
          NAMESPACE,
          INTERFACE,
          OPTIONAL_KEY_OR_ARGUMENT
          // Added for optional property assignment highlighting
        ]);
        swapMode(tsLanguage, "shebang", hljs.SHEBANG());
        swapMode(tsLanguage, "use_strict", USE_STRICT);
        const functionDeclaration = tsLanguage.contains.find((m) => m.label === "func.def");
        functionDeclaration.relevance = 0;
        Object.assign(tsLanguage, {
          name: "TypeScript",
          aliases: [
            "ts",
            "tsx",
            "mts",
            "cts"
          ]
        });
        return tsLanguage;
      }
      module.exports = typescript;
    }
  });

  // node_modules/diff2html/lib/ui/js/highlight.js-slim.js
  var require_highlight_js_slim = __commonJS({
    "node_modules/diff2html/lib/ui/js/highlight.js-slim.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.hljs = void 0;
      var core_1 = __importDefault(require_core());
      var cpp_1 = __importDefault(require_cpp());
      var xml_1 = __importDefault(require_xml());
      var awk_1 = __importDefault(require_awk());
      var bash_1 = __importDefault(require_bash());
      var c_1 = __importDefault(require_c());
      var clojure_1 = __importDefault(require_clojure());
      var crystal_1 = __importDefault(require_crystal());
      var csharp_1 = __importDefault(require_csharp());
      var csp_1 = __importDefault(require_csp());
      var css_1 = __importDefault(require_css());
      var markdown_1 = __importDefault(require_markdown());
      var dart_1 = __importDefault(require_dart());
      var diff_1 = __importDefault(require_diff());
      var dockerfile_1 = __importDefault(require_dockerfile());
      var elixir_1 = __importDefault(require_elixir());
      var elm_1 = __importDefault(require_elm());
      var ruby_1 = __importDefault(require_ruby());
      var erlang_1 = __importDefault(require_erlang());
      var fsharp_1 = __importDefault(require_fsharp());
      var go_1 = __importDefault(require_go());
      var gradle_1 = __importDefault(require_gradle());
      var groovy_1 = __importDefault(require_groovy());
      var handlebars_1 = __importDefault(require_handlebars());
      var haskell_1 = __importDefault(require_haskell());
      var ini_1 = __importDefault(require_ini());
      var java_1 = __importDefault(require_java());
      var javascript_1 = __importDefault(require_javascript());
      var json_1 = __importDefault(require_json());
      var kotlin_1 = __importDefault(require_kotlin());
      var less_1 = __importDefault(require_less());
      var lisp_1 = __importDefault(require_lisp());
      var lua_1 = __importDefault(require_lua());
      var makefile_1 = __importDefault(require_makefile());
      var perl_1 = __importDefault(require_perl());
      var nginx_1 = __importDefault(require_nginx());
      var objectivec_1 = __importDefault(require_objectivec());
      var pgsql_1 = __importDefault(require_pgsql());
      var php_1 = __importDefault(require_php());
      var plaintext_1 = __importDefault(require_plaintext());
      var powershell_1 = __importDefault(require_powershell());
      var properties_1 = __importDefault(require_properties());
      var protobuf_1 = __importDefault(require_protobuf());
      var python_1 = __importDefault(require_python());
      var rust_1 = __importDefault(require_rust());
      var scala_1 = __importDefault(require_scala());
      var scss_1 = __importDefault(require_scss());
      var shell_1 = __importDefault(require_shell());
      var sql_1 = __importDefault(require_sql());
      var swift_1 = __importDefault(require_swift());
      var yaml_1 = __importDefault(require_yaml());
      var typescript_1 = __importDefault(require_typescript());
      core_1.default.registerLanguage("cpp", cpp_1.default);
      core_1.default.registerLanguage("xml", xml_1.default);
      core_1.default.registerLanguage("awk", awk_1.default);
      core_1.default.registerLanguage("bash", bash_1.default);
      core_1.default.registerLanguage("c", c_1.default);
      core_1.default.registerLanguage("clojure", clojure_1.default);
      core_1.default.registerLanguage("crystal", crystal_1.default);
      core_1.default.registerLanguage("csharp", csharp_1.default);
      core_1.default.registerLanguage("csp", csp_1.default);
      core_1.default.registerLanguage("css", css_1.default);
      core_1.default.registerLanguage("markdown", markdown_1.default);
      core_1.default.registerLanguage("dart", dart_1.default);
      core_1.default.registerLanguage("diff", diff_1.default);
      core_1.default.registerLanguage("dockerfile", dockerfile_1.default);
      core_1.default.registerLanguage("elixir", elixir_1.default);
      core_1.default.registerLanguage("elm", elm_1.default);
      core_1.default.registerLanguage("ruby", ruby_1.default);
      core_1.default.registerLanguage("erlang", erlang_1.default);
      core_1.default.registerLanguage("fsharp", fsharp_1.default);
      core_1.default.registerLanguage("go", go_1.default);
      core_1.default.registerLanguage("gradle", gradle_1.default);
      core_1.default.registerLanguage("groovy", groovy_1.default);
      core_1.default.registerLanguage("handlebars", handlebars_1.default);
      core_1.default.registerLanguage("haskell", haskell_1.default);
      core_1.default.registerLanguage("ini", ini_1.default);
      core_1.default.registerLanguage("java", java_1.default);
      core_1.default.registerLanguage("javascript", javascript_1.default);
      core_1.default.registerLanguage("json", json_1.default);
      core_1.default.registerLanguage("kotlin", kotlin_1.default);
      core_1.default.registerLanguage("less", less_1.default);
      core_1.default.registerLanguage("lisp", lisp_1.default);
      core_1.default.registerLanguage("lua", lua_1.default);
      core_1.default.registerLanguage("makefile", makefile_1.default);
      core_1.default.registerLanguage("perl", perl_1.default);
      core_1.default.registerLanguage("nginx", nginx_1.default);
      core_1.default.registerLanguage("objectivec", objectivec_1.default);
      core_1.default.registerLanguage("pgsql", pgsql_1.default);
      core_1.default.registerLanguage("php", php_1.default);
      core_1.default.registerLanguage("plaintext", plaintext_1.default);
      core_1.default.registerLanguage("powershell", powershell_1.default);
      core_1.default.registerLanguage("properties", properties_1.default);
      core_1.default.registerLanguage("protobuf", protobuf_1.default);
      core_1.default.registerLanguage("python", python_1.default);
      core_1.default.registerLanguage("rust", rust_1.default);
      core_1.default.registerLanguage("scala", scala_1.default);
      core_1.default.registerLanguage("scss", scss_1.default);
      core_1.default.registerLanguage("shell", shell_1.default);
      core_1.default.registerLanguage("sql", sql_1.default);
      core_1.default.registerLanguage("swift", swift_1.default);
      core_1.default.registerLanguage("yaml", yaml_1.default);
      core_1.default.registerLanguage("typescript", typescript_1.default);
      exports.hljs = core_1.default;
    }
  });

  // node_modules/diff2html/lib/ui/js/highlight.js-helpers.js
  var require_highlight_js_helpers = __commonJS({
    "node_modules/diff2html/lib/ui/js/highlight.js-helpers.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.nodeStream = nodeStream;
      exports.mergeStreams = mergeStreams;
      exports.closeTags = closeTags;
      exports.getLanguage = getLanguage;
      function escapeHTML(value) {
        return value.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;");
      }
      function tag(node) {
        return node.nodeName.toLowerCase();
      }
      function nodeStream(node) {
        const result = [];
        const nodeStream2 = (node2, offset) => {
          for (let child = node2.firstChild; child; child = child.nextSibling) {
            if (child.nodeType === 3 && child.nodeValue !== null) {
              offset += child.nodeValue.length;
            } else if (child.nodeType === 1) {
              result.push({
                event: "start",
                offset,
                node: child
              });
              offset = nodeStream2(child, offset);
              if (!tag(child).match(/br|hr|img|input/)) {
                result.push({
                  event: "stop",
                  offset,
                  node: child
                });
              }
            }
          }
          return offset;
        };
        nodeStream2(node, 0);
        return result;
      }
      function mergeStreams(original, highlighted, value) {
        let processed = 0;
        let result = "";
        const nodeStack = [];
        function isElement(arg) {
          return arg !== null && (arg === null || arg === void 0 ? void 0 : arg.attributes) !== void 0;
        }
        function selectStream() {
          if (!original.length || !highlighted.length) {
            return original.length ? original : highlighted;
          }
          if (original[0].offset !== highlighted[0].offset) {
            return original[0].offset < highlighted[0].offset ? original : highlighted;
          }
          return highlighted[0].event === "start" ? original : highlighted;
        }
        function open(node) {
          if (!isElement(node)) {
            throw new Error("Node is not an Element");
          }
          result += `<${tag(node)} ${Array().map.call(node.attributes, (attr) => `${attr.nodeName}="${escapeHTML(attr.value).replace(/"/g, "&quot;")}"`).join(" ")}>`;
        }
        function close(node) {
          result += "</" + tag(node) + ">";
        }
        function render(event) {
          (event.event === "start" ? open : close)(event.node);
        }
        while (original.length || highlighted.length) {
          let stream = selectStream();
          result += escapeHTML(value.substring(processed, stream[0].offset));
          processed = stream[0].offset;
          if (stream === original) {
            nodeStack.reverse().forEach(close);
            do {
              render(stream.splice(0, 1)[0]);
              stream = selectStream();
            } while (stream === original && stream.length && stream[0].offset === processed);
            nodeStack.reverse().forEach(open);
          } else {
            if (stream[0].event === "start") {
              nodeStack.push(stream[0].node);
            } else {
              nodeStack.pop();
            }
            render(stream.splice(0, 1)[0]);
          }
        }
        return result + escapeHTML(value.substr(processed));
      }
      function closeTags(res) {
        const tokenStack = new Array();
        res.value = res.value.split("\n").map((line) => {
          const prepend = tokenStack.map((token) => `<span class="${token}">`).join("");
          const matches = line.matchAll(/(<span class="(.*?)">|<\/span>)/g);
          Array.from(matches).forEach((match) => {
            if (match[0] === "</span>")
              tokenStack.shift();
            else
              tokenStack.unshift(match[2]);
          });
          const append = "</span>".repeat(tokenStack.length);
          return prepend + line + append;
        }).join("\n");
        return res;
      }
      var languagesToExt = {
        "1c": "1c",
        abnf: "abnf",
        accesslog: "accesslog",
        as: "actionscript",
        adb: "ada",
        ada: "ada",
        ads: "ada",
        angelscript: "angelscript",
        apache: "apache",
        applescript: "applescript",
        scpt: "applescript",
        arcade: "arcade",
        cpp: "cpp",
        hpp: "cpp",
        arduino: "arduino",
        ino: "arduino",
        armasm: "armasm",
        arm: "armasm",
        xml: "xml",
        html: "xml",
        xhtml: "xml",
        rss: "xml",
        atom: "xml",
        xjb: "xml",
        xsd: "xml",
        xsl: "xml",
        plist: "xml",
        svg: "xml",
        asciidoc: "asciidoc",
        adoc: "asciidoc",
        asc: "asciidoc",
        aspectj: "aspectj",
        ahk: "autohotkey",
        ahkl: "autohotkey",
        au3: "autoit",
        avrasm: "avrasm",
        awk: "awk",
        axapta: "axapta",
        "x++": "axapta",
        bash: "bash",
        sh: "bash",
        zsh: "bash",
        b: "basic",
        bnf: "bnf",
        bf: "brainfuck",
        c: "c",
        h: "c",
        cats: "c",
        idc: "c",
        cal: "cal",
        capnproto: "capnproto",
        capnp: "capnproto",
        ceylon: "ceylon",
        clean: "clean",
        clj: "clojure",
        boot: "clojure",
        cl2: "clojure",
        cljc: "clojure",
        cljs: "clojure",
        "cljs.hl": "clojure",
        cljscm: "clojure",
        cljx: "clojure",
        hic: "clojure",
        "clojure-repl": "clojure-repl",
        cmake: "cmake",
        "cmake.in": "cmake",
        coffee: "coffeescript",
        _coffee: "coffeescript",
        cake: "coffeescript",
        cjsx: "coffeescript",
        iced: "coffeescript",
        cson: "coffeescript",
        coq: "coq",
        cos: "cos",
        cls: "cos",
        crmsh: "crmsh",
        crm: "crmsh",
        pcmk: "crmsh",
        cr: "crystal",
        cs: "csharp",
        csx: "csharp",
        csp: "csp",
        css: "css",
        d: "d",
        di: "d",
        md: "markdown",
        markdown: "markdown",
        mdown: "markdown",
        mdwn: "markdown",
        mkd: "markdown",
        mkdn: "markdown",
        mkdown: "markdown",
        ronn: "markdown",
        workbook: "markdown",
        dart: "dart",
        dpr: "delphi",
        dfm: "delphi",
        pas: "delphi",
        pascal: "delphi",
        diff: "diff",
        patch: "diff",
        django: "django",
        jinja: "django",
        dns: "dns",
        zone: "dns",
        bind: "dns",
        dockerfile: "dockerfile",
        docker: "dockerfile",
        dos: "dos",
        bat: "dos",
        cmd: "dos",
        dsconfig: "dsconfig",
        dts: "dts",
        dust: "dust",
        dst: "dust",
        ebnf: "ebnf",
        ex: "elixir",
        exs: "elixir",
        elm: "elm",
        rb: "ruby",
        builder: "ruby",
        eye: "ruby",
        gemspec: "ruby",
        god: "ruby",
        jbuilder: "ruby",
        mspec: "ruby",
        pluginspec: "ruby",
        podspec: "ruby",
        rabl: "ruby",
        rake: "ruby",
        rbuild: "ruby",
        rbw: "ruby",
        rbx: "ruby",
        ru: "ruby",
        ruby: "ruby",
        spec: "ruby",
        thor: "ruby",
        watchr: "ruby",
        erb: "erb",
        "erlang-repl": "erlang-repl",
        erl: "erlang",
        "app.src": "erlang",
        escript: "erlang",
        hrl: "erlang",
        xrl: "erlang",
        yrl: "erlang",
        excel: "excel",
        xls: "excel",
        xlsx: "excel",
        fix: "fix",
        flix: "flix",
        f90: "fortran",
        f: "fortran",
        f03: "fortran",
        f08: "fortran",
        f77: "fortran",
        f95: "fortran",
        for: "fortran",
        fpp: "fortran",
        fs: "fsharp",
        fsx: "fsharp",
        gams: "gams",
        gms: "gams",
        gauss: "gauss",
        gss: "gauss",
        gcode: "gcode",
        nc: "gcode",
        gherkin: "gherkin",
        glsl: "glsl",
        fp: "glsl",
        frag: "glsl",
        frg: "glsl",
        fsh: "glsl",
        fshader: "glsl",
        geo: "glsl",
        geom: "glsl",
        glslv: "glsl",
        gshader: "glsl",
        shader: "glsl",
        tesc: "glsl",
        tese: "glsl",
        vert: "glsl",
        vrx: "glsl",
        vsh: "glsl",
        vshader: "glsl",
        gml: "gml",
        go: "go",
        bal: "go",
        golo: "golo",
        gololang: "golo",
        gradle: "gradle",
        groovy: "groovy",
        grt: "groovy",
        gtpl: "groovy",
        gvy: "groovy",
        haml: "haml",
        "haml.deface": "haml",
        handlebars: "handlebars",
        hbs: "handlebars",
        "html.hbs": "handlebars",
        "html.handlebars": "handlebars",
        hs: "haskell",
        hsc: "haskell",
        idr: "haskell",
        purs: "haskell",
        hx: "haxe",
        hxsl: "haxe",
        hsp: "hsp",
        htmlbars: "htmlbars",
        http: "http",
        https: "http",
        hy: "hy",
        inform7: "inform7",
        i7: "inform7",
        ini: "ini",
        toml: "ini",
        cfg: "ini",
        prefs: "ini",
        irpf90: "irpf90",
        isbl: "isbl",
        java: "java",
        jsp: "java",
        js: "javascript",
        jsx: "javascript",
        _js: "javascript",
        bones: "javascript",
        es: "javascript",
        es6: "javascript",
        gs: "javascript",
        jake: "javascript",
        jsb: "javascript",
        jscad: "javascript",
        jsfl: "javascript",
        jsm: "javascript",
        jss: "javascript",
        mjs: "javascript",
        njs: "javascript",
        pac: "javascript",
        sjs: "javascript",
        ssjs: "javascript",
        xsjs: "javascript",
        xsjslib: "javascript",
        cfc: "javascript",
        "jboss-cli": "jboss-cli",
        json: "json",
        avsc: "json",
        geojson: "json",
        gltf: "json",
        "JSON-tmLanguage": "json",
        jsonl: "json",
        tfstate: "json",
        "tfstate.backup": "json",
        topojson: "json",
        webapp: "json",
        webmanifest: "json",
        jl: "julia",
        "julia-repl": "julia-repl",
        kt: "kotlin",
        ktm: "kotlin",
        kts: "kotlin",
        lasso: "lasso",
        lassoscript: "lasso",
        tex: "latex",
        ldif: "ldif",
        leaf: "leaf",
        less: "less",
        lisp: "lisp",
        factor: "lisp",
        livecodeserver: "livecodeserver",
        ls: "livescript",
        _ls: "livescript",
        llvm: "llvm",
        lsl: "lsl",
        lua: "lua",
        nse: "lua",
        p8: "lua",
        pd_lua: "lua",
        rbxs: "lua",
        wlua: "lua",
        mak: "makefile",
        make: "makefile",
        mk: "makefile",
        mkfile: "makefile",
        mathematica: "mathematica",
        mma: "mathematica",
        wl: "mathematica",
        matlab: "matlab",
        maxima: "maxima",
        mel: "mel",
        mercury: "mercury",
        mipsasm: "mipsasm",
        miz: "mizar",
        voc: "mizar",
        al: "perl",
        cgi: "perl",
        fcgi: "perl",
        perl: "perl",
        ph: "perl",
        plx: "perl",
        pl: "perl",
        pm: "perl",
        psgi: "perl",
        t: "perl",
        mojolicious: "mojolicious",
        monkey: "monkey",
        monkey2: "monkey",
        moonscript: "moonscript",
        moon: "moonscript",
        n1ql: "n1ql",
        nginxconf: "nginx",
        nim: "nim",
        nimrod: "nim",
        nix: "nix",
        nsi: "nsis",
        nsh: "nsis",
        m: "objectivec",
        objc: "objectivec",
        mm: "objectivec",
        "obj-c": "objectivec",
        "obj-c++": "objectivec",
        "objective-c++": "objectivec",
        fun: "ocaml",
        sig: "ocaml",
        ml: "ocaml",
        mli: "ocaml",
        eliom: "ocaml",
        eliomi: "ocaml",
        ml4: "ocaml",
        mll: "ocaml",
        mly: "ocaml",
        openscad: "openscad",
        oxygene: "oxygene",
        parser3: "parser3",
        pf: "pf",
        "pf.conf": "pf",
        pgsql: "pgsql",
        postgres: "pgsql",
        postgresql: "pgsql",
        php: "php",
        aw: "php",
        ctp: "php",
        inc: "php",
        php3: "php",
        php4: "php",
        php5: "php",
        phps: "php",
        phpt: "php",
        "php-template": "php-template",
        plaintext: "plaintext",
        txt: "plaintext",
        text: "plaintext",
        pony: "pony",
        ps: "powershell",
        ps1: "powershell",
        psd1: "powershell",
        psm1: "powershell",
        pde: "processing",
        profile: "profile",
        pro: "prolog",
        prolog: "prolog",
        yap: "prolog",
        properties: "properties",
        proto: "protobuf",
        puppet: "puppet",
        pp: "puppet",
        purebasic: "purebasic",
        py: "python",
        bzl: "python",
        gyp: "python",
        gypi: "python",
        lmi: "python",
        py3: "python",
        pyde: "python",
        pyi: "python",
        pyp: "python",
        pyt: "python",
        pyw: "python",
        rpy: "python",
        tac: "python",
        wsgi: "python",
        xpy: "python",
        "python-repl": "python-repl",
        pycon: "python-repl",
        q: "q",
        k: "q",
        kdb: "q",
        qml: "qml",
        r: "r",
        rd: "r",
        rsx: "r",
        reasonml: "reasonml",
        re: "reasonml",
        rib: "rib",
        roboconf: "roboconf",
        graph: "roboconf",
        instances: "roboconf",
        routeros: "routeros",
        rsl: "rsl",
        ruleslanguage: "ruleslanguage",
        rs: "rust",
        "rs.in": "rust",
        sas: "sas",
        scala: "scala",
        kojo: "scala",
        sbt: "scala",
        sc: "scala",
        scm: "scheme",
        sch: "scheme",
        sld: "scheme",
        sls: "scheme",
        sps: "scheme",
        ss: "scheme",
        rkt: "scheme",
        scilab: "scilab",
        scss: "scss",
        shell: "shell",
        smali: "smali",
        st: "smalltalk",
        sml: "sml",
        sqf: "sqf",
        sql: "sql",
        cql: "sql",
        ddl: "sql",
        mysql: "sql",
        prc: "sql",
        tab: "sql",
        udf: "sql",
        viw: "sql",
        stan: "stan",
        stanfuncs: "stan",
        stata: "stata",
        step21: "step21",
        step: "step21",
        stp: "step21",
        styl: "stylus",
        subunit: "subunit",
        swift: "swift",
        taggerscript: "taggerscript",
        yml: "yaml",
        mir: "yaml",
        reek: "yaml",
        rviz: "yaml",
        "sublime-syntax": "yaml",
        syntax: "yaml",
        yaml: "yaml",
        "yaml-tmlanguage": "yaml",
        "yml.mysql": "yaml",
        tap: "tap",
        tcl: "tcl",
        adp: "tcl",
        tm: "tcl",
        thrift: "thrift",
        tp: "tp",
        twig: "twig",
        craftcms: "twig",
        ts: "typescript",
        tsx: "typescript",
        vala: "vala",
        vbnet: "vbnet",
        vb: "vbnet",
        vbscript: "vbscript",
        vbs: "vbscript",
        "vbscript-html": "vbscript-html",
        v: "verilog",
        veo: "verilog",
        vhdl: "vhdl",
        vhd: "vhdl",
        vhf: "vhdl",
        vhi: "vhdl",
        vho: "vhdl",
        vhs: "vhdl",
        vht: "vhdl",
        vhw: "vhdl",
        vim: "vim",
        x86asm: "x86asm",
        xl: "xl",
        xquery: "xquery",
        xpath: "xquery",
        xq: "xquery",
        zephir: "zephir",
        zep: "zephir"
      };
      function getLanguage(fileExtension) {
        var _a;
        return (_a = languagesToExt[fileExtension]) !== null && _a !== void 0 ? _a : "plaintext";
      }
    }
  });

  // node_modules/diff2html/lib/types.js
  var require_types = __commonJS({
    "node_modules/diff2html/lib/types.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ColorSchemeType = exports.DiffStyleType = exports.LineMatchingType = exports.OutputFormatType = exports.LineType = void 0;
      var LineType;
      (function(LineType2) {
        LineType2["INSERT"] = "insert";
        LineType2["DELETE"] = "delete";
        LineType2["CONTEXT"] = "context";
      })(LineType || (exports.LineType = LineType = {}));
      exports.OutputFormatType = {
        LINE_BY_LINE: "line-by-line",
        SIDE_BY_SIDE: "side-by-side"
      };
      exports.LineMatchingType = {
        LINES: "lines",
        WORDS: "words",
        NONE: "none"
      };
      exports.DiffStyleType = {
        WORD: "word",
        CHAR: "char"
      };
      var ColorSchemeType;
      (function(ColorSchemeType2) {
        ColorSchemeType2["AUTO"] = "auto";
        ColorSchemeType2["DARK"] = "dark";
        ColorSchemeType2["LIGHT"] = "light";
      })(ColorSchemeType || (exports.ColorSchemeType = ColorSchemeType = {}));
    }
  });

  // node_modules/diff2html/lib/utils.js
  var require_utils = __commonJS({
    "node_modules/diff2html/lib/utils.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.escapeForRegExp = escapeForRegExp;
      exports.unifyPath = unifyPath;
      exports.hashCode = hashCode;
      exports.max = max;
      var specials = [
        "-",
        "[",
        "]",
        "/",
        "{",
        "}",
        "(",
        ")",
        "*",
        "+",
        "?",
        ".",
        "\\",
        "^",
        "$",
        "|"
      ];
      var regex = RegExp("[" + specials.join("\\") + "]", "g");
      function escapeForRegExp(str) {
        return str.replace(regex, "\\$&");
      }
      function unifyPath(path) {
        return path ? path.replace(/\\/g, "/") : path;
      }
      function hashCode(text) {
        let i, chr, len;
        let hash = 0;
        for (i = 0, len = text.length; i < len; i++) {
          chr = text.charCodeAt(i);
          hash = (hash << 5) - hash + chr;
          hash |= 0;
        }
        return hash;
      }
      function max(arr) {
        const length = arr.length;
        let max2 = -Infinity;
        for (let i = 0; i < length; i++) {
          max2 = Math.max(max2, arr[i]);
        }
        return max2;
      }
    }
  });

  // node_modules/diff2html/lib/diff-parser.js
  var require_diff_parser = __commonJS({
    "node_modules/diff2html/lib/diff-parser.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.parse = parse;
      var types_1 = require_types();
      var utils_1 = require_utils();
      function getExtension(filename, language) {
        const filenameParts = filename.split(".");
        return filenameParts.length > 1 ? filenameParts[filenameParts.length - 1] : language;
      }
      function startsWithAny(str, prefixes) {
        return prefixes.reduce((startsWith, prefix) => startsWith || str.startsWith(prefix), false);
      }
      var baseDiffFilenamePrefixes = ["a/", "b/", "i/", "w/", "c/", "o/"];
      function getFilename(line, linePrefix, extraPrefix) {
        const prefixes = extraPrefix !== void 0 ? [...baseDiffFilenamePrefixes, extraPrefix] : baseDiffFilenamePrefixes;
        const FilenameRegExp = linePrefix ? new RegExp(`^${(0, utils_1.escapeForRegExp)(linePrefix)} "?(.+?)"?$`) : new RegExp('^"?(.+?)"?$');
        const [, filename = ""] = FilenameRegExp.exec(line) || [];
        const matchingPrefix = prefixes.find((p) => filename.indexOf(p) === 0);
        const fnameWithoutPrefix = matchingPrefix ? filename.slice(matchingPrefix.length) : filename;
        return fnameWithoutPrefix.replace(/\s+\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)? [+-]\d{4}.*$/, "");
      }
      function getSrcFilename(line, srcPrefix) {
        return getFilename(line, "---", srcPrefix);
      }
      function getDstFilename(line, dstPrefix) {
        return getFilename(line, "+++", dstPrefix);
      }
      function parse(diffInput, config = {}) {
        const files = [];
        let currentFile = null;
        let currentBlock = null;
        let oldLine = null;
        let oldLine2 = null;
        let newLine = null;
        let possibleOldName = null;
        let possibleNewName = null;
        const oldFileNameHeader = "--- ";
        const newFileNameHeader = "+++ ";
        const hunkHeaderPrefix = "@@";
        const oldMode = /^old mode (\d{6})/;
        const newMode = /^new mode (\d{6})/;
        const deletedFileMode = /^deleted file mode (\d{6})/;
        const newFileMode = /^new file mode (\d{6})/;
        const copyFrom = /^copy from "?(.+)"?/;
        const copyTo = /^copy to "?(.+)"?/;
        const renameFrom = /^rename from "?(.+)"?/;
        const renameTo = /^rename to "?(.+)"?/;
        const similarityIndex = /^similarity index (\d+)%/;
        const dissimilarityIndex = /^dissimilarity index (\d+)%/;
        const index = /^index ([\da-z]+)\.\.([\da-z]+)\s*(\d{6})?/;
        const binaryFiles = /^Binary files (.*) and (.*) differ/;
        const binaryDiff = /^GIT binary patch/;
        const combinedIndex = /^index ([\da-z]+),([\da-z]+)\.\.([\da-z]+)/;
        const combinedMode = /^mode (\d{6}),(\d{6})\.\.(\d{6})/;
        const combinedNewFile = /^new file mode (\d{6})/;
        const combinedDeletedFile = /^deleted file mode (\d{6}),(\d{6})/;
        const diffLines = diffInput.replace(/\\ No newline at end of file/g, "").replace(/\r\n?/g, "\n").split("\n");
        function saveBlock() {
          if (currentBlock !== null && currentFile !== null) {
            currentFile.blocks.push(currentBlock);
            currentBlock = null;
          }
        }
        function saveFile() {
          if (currentFile !== null) {
            if (!currentFile.oldName && possibleOldName !== null) {
              currentFile.oldName = possibleOldName;
            }
            if (!currentFile.newName && possibleNewName !== null) {
              currentFile.newName = possibleNewName;
            }
            if (currentFile.newName) {
              files.push(currentFile);
              currentFile = null;
            }
          }
          possibleOldName = null;
          possibleNewName = null;
        }
        function startFile() {
          saveBlock();
          saveFile();
          currentFile = {
            blocks: [],
            deletedLines: 0,
            addedLines: 0
          };
        }
        function startBlock(line) {
          saveBlock();
          let values;
          if (currentFile !== null) {
            if (values = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@.*/.exec(line)) {
              currentFile.isCombined = false;
              oldLine = parseInt(values[1], 10);
              newLine = parseInt(values[2], 10);
            } else if (values = /^@@@ -(\d+)(?:,\d+)? -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@@.*/.exec(line)) {
              currentFile.isCombined = true;
              oldLine = parseInt(values[1], 10);
              oldLine2 = parseInt(values[2], 10);
              newLine = parseInt(values[3], 10);
            } else {
              if (line.startsWith(hunkHeaderPrefix)) {
                console.error("Failed to parse lines, starting in 0!");
              }
              oldLine = 0;
              newLine = 0;
              currentFile.isCombined = false;
            }
          }
          currentBlock = {
            lines: [],
            oldStartLine: oldLine,
            oldStartLine2: oldLine2,
            newStartLine: newLine,
            header: line
          };
        }
        function createLine(line) {
          if (currentFile === null || currentBlock === null || oldLine === null || newLine === null)
            return;
          const currentLine = {
            content: line
          };
          const addedPrefixes = currentFile.isCombined ? ["+ ", " +", "++"] : ["+"];
          const deletedPrefixes = currentFile.isCombined ? ["- ", " -", "--"] : ["-"];
          if (startsWithAny(line, addedPrefixes)) {
            currentFile.addedLines++;
            currentLine.type = types_1.LineType.INSERT;
            currentLine.oldNumber = void 0;
            currentLine.newNumber = newLine++;
          } else if (startsWithAny(line, deletedPrefixes)) {
            currentFile.deletedLines++;
            currentLine.type = types_1.LineType.DELETE;
            currentLine.oldNumber = oldLine++;
            currentLine.newNumber = void 0;
          } else {
            currentLine.type = types_1.LineType.CONTEXT;
            currentLine.oldNumber = oldLine++;
            currentLine.newNumber = newLine++;
          }
          currentBlock.lines.push(currentLine);
        }
        function existHunkHeader(line, lineIdx) {
          let idx = lineIdx;
          while (idx < diffLines.length - 3) {
            if (line.startsWith("diff")) {
              return false;
            }
            if (diffLines[idx].startsWith(oldFileNameHeader) && diffLines[idx + 1].startsWith(newFileNameHeader) && diffLines[idx + 2].startsWith(hunkHeaderPrefix)) {
              return true;
            }
            idx++;
          }
          return false;
        }
        diffLines.forEach((line, lineIndex) => {
          if (!line || line.startsWith("*")) {
            return;
          }
          let values;
          const prevLine = diffLines[lineIndex - 1];
          const nxtLine = diffLines[lineIndex + 1];
          const afterNxtLine = diffLines[lineIndex + 2];
          if (line.startsWith("diff --git") || line.startsWith("diff --combined")) {
            startFile();
            const gitDiffStart = /^diff --git "?([a-ciow]\/.+)"? "?([a-ciow]\/.+)"?/;
            if (values = gitDiffStart.exec(line)) {
              possibleOldName = getFilename(values[1], void 0, config.dstPrefix);
              possibleNewName = getFilename(values[2], void 0, config.srcPrefix);
            }
            if (currentFile === null) {
              throw new Error("Where is my file !!!");
            }
            currentFile.isGitDiff = true;
            return;
          }
          if (line.startsWith("Binary files") && !(currentFile === null || currentFile === void 0 ? void 0 : currentFile.isGitDiff)) {
            startFile();
            const unixDiffBinaryStart = /^Binary files "?([a-ciow]\/.+)"? and "?([a-ciow]\/.+)"? differ/;
            if (values = unixDiffBinaryStart.exec(line)) {
              possibleOldName = getFilename(values[1], void 0, config.dstPrefix);
              possibleNewName = getFilename(values[2], void 0, config.srcPrefix);
            }
            if (currentFile === null) {
              throw new Error("Where is my file !!!");
            }
            currentFile.isBinary = true;
            return;
          }
          if (!currentFile || !currentFile.isGitDiff && currentFile && line.startsWith(oldFileNameHeader) && nxtLine.startsWith(newFileNameHeader) && afterNxtLine.startsWith(hunkHeaderPrefix)) {
            startFile();
          }
          if (currentFile === null || currentFile === void 0 ? void 0 : currentFile.isTooBig) {
            return;
          }
          if (currentFile && (typeof config.diffMaxChanges === "number" && currentFile.addedLines + currentFile.deletedLines > config.diffMaxChanges || typeof config.diffMaxLineLength === "number" && line.length > config.diffMaxLineLength)) {
            currentFile.isTooBig = true;
            currentFile.addedLines = 0;
            currentFile.deletedLines = 0;
            currentFile.blocks = [];
            currentBlock = null;
            const message = typeof config.diffTooBigMessage === "function" ? config.diffTooBigMessage(files.length) : "Diff too big to be displayed";
            startBlock(message);
            return;
          }
          if (line.startsWith(oldFileNameHeader) && nxtLine.startsWith(newFileNameHeader) || line.startsWith(newFileNameHeader) && prevLine.startsWith(oldFileNameHeader)) {
            if (currentFile && !currentFile.oldName && line.startsWith("--- ") && (values = getSrcFilename(line, config.srcPrefix))) {
              currentFile.oldName = values;
              currentFile.language = getExtension(currentFile.oldName, currentFile.language);
              return;
            }
            if (currentFile && !currentFile.newName && line.startsWith("+++ ") && (values = getDstFilename(line, config.dstPrefix))) {
              currentFile.newName = values;
              currentFile.language = getExtension(currentFile.newName, currentFile.language);
              return;
            }
          }
          if (currentFile && (line.startsWith(hunkHeaderPrefix) || currentFile.isGitDiff && currentFile.oldName && currentFile.newName && !currentBlock)) {
            startBlock(line);
            return;
          }
          if (currentBlock && (line.startsWith("+") || line.startsWith("-") || line.startsWith(" "))) {
            createLine(line);
            return;
          }
          const doesNotExistHunkHeader = !existHunkHeader(line, lineIndex);
          if (currentFile === null) {
            throw new Error("Where is my file !!!");
          }
          if (values = oldMode.exec(line)) {
            currentFile.oldMode = values[1];
          } else if (values = newMode.exec(line)) {
            currentFile.newMode = values[1];
          } else if (values = deletedFileMode.exec(line)) {
            currentFile.deletedFileMode = values[1];
            currentFile.isDeleted = true;
          } else if (values = newFileMode.exec(line)) {
            currentFile.newFileMode = values[1];
            currentFile.isNew = true;
          } else if (values = copyFrom.exec(line)) {
            if (doesNotExistHunkHeader) {
              currentFile.oldName = values[1];
            }
            currentFile.isCopy = true;
          } else if (values = copyTo.exec(line)) {
            if (doesNotExistHunkHeader) {
              currentFile.newName = values[1];
            }
            currentFile.isCopy = true;
          } else if (values = renameFrom.exec(line)) {
            if (doesNotExistHunkHeader) {
              currentFile.oldName = values[1];
            }
            currentFile.isRename = true;
          } else if (values = renameTo.exec(line)) {
            if (doesNotExistHunkHeader) {
              currentFile.newName = values[1];
            }
            currentFile.isRename = true;
          } else if (values = binaryFiles.exec(line)) {
            currentFile.isBinary = true;
            currentFile.oldName = getFilename(values[1], void 0, config.srcPrefix);
            currentFile.newName = getFilename(values[2], void 0, config.dstPrefix);
            startBlock("Binary file");
          } else if (binaryDiff.test(line)) {
            currentFile.isBinary = true;
            startBlock(line);
          } else if (values = similarityIndex.exec(line)) {
            currentFile.unchangedPercentage = parseInt(values[1], 10);
          } else if (values = dissimilarityIndex.exec(line)) {
            currentFile.changedPercentage = parseInt(values[1], 10);
          } else if (values = index.exec(line)) {
            currentFile.checksumBefore = values[1];
            currentFile.checksumAfter = values[2];
            if (values[3])
              currentFile.mode = values[3];
          } else if (values = combinedIndex.exec(line)) {
            currentFile.checksumBefore = [values[2], values[3]];
            currentFile.checksumAfter = values[1];
          } else if (values = combinedMode.exec(line)) {
            currentFile.oldMode = [values[2], values[3]];
            currentFile.newMode = values[1];
          } else if (values = combinedNewFile.exec(line)) {
            currentFile.newFileMode = values[1];
            currentFile.isNew = true;
          } else if (values = combinedDeletedFile.exec(line)) {
            currentFile.deletedFileMode = values[1];
            currentFile.isDeleted = true;
          }
        });
        saveBlock();
        saveFile();
        return files;
      }
    }
  });

  // node_modules/diff/libcjs/diff/base.js
  var require_base = __commonJS({
    "node_modules/diff/libcjs/diff/base.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var Diff = (
        /** @class */
        (function() {
          function Diff2() {
          }
          Diff2.prototype.diff = function(oldStr, newStr, options) {
            if (options === void 0) {
              options = {};
            }
            var callback;
            if (typeof options === "function") {
              callback = options;
              options = {};
            } else if ("callback" in options) {
              callback = options.callback;
            }
            var oldString = this.castInput(oldStr, options);
            var newString = this.castInput(newStr, options);
            var oldTokens = this.removeEmpty(this.tokenize(oldString, options));
            var newTokens = this.removeEmpty(this.tokenize(newString, options));
            return this.diffWithOptionsObj(oldTokens, newTokens, options, callback);
          };
          Diff2.prototype.diffWithOptionsObj = function(oldTokens, newTokens, options, callback) {
            var _this = this;
            var _a;
            var done = function(value) {
              value = _this.postProcess(value, options);
              if (callback) {
                setTimeout(function() {
                  callback(value);
                }, 0);
                return void 0;
              } else {
                return value;
              }
            };
            var newLen = newTokens.length, oldLen = oldTokens.length;
            var editLength = 1;
            var maxEditLength = newLen + oldLen;
            if (options.maxEditLength != null) {
              maxEditLength = Math.min(maxEditLength, options.maxEditLength);
            }
            var maxExecutionTime = (_a = options.timeout) !== null && _a !== void 0 ? _a : Infinity;
            var abortAfterTimestamp = Date.now() + maxExecutionTime;
            var bestPath = [{ oldPos: -1, lastComponent: void 0 }];
            var newPos = this.extractCommon(bestPath[0], newTokens, oldTokens, 0, options);
            if (bestPath[0].oldPos + 1 >= oldLen && newPos + 1 >= newLen) {
              return done(this.buildValues(bestPath[0].lastComponent, newTokens, oldTokens));
            }
            var minDiagonalToConsider = -Infinity, maxDiagonalToConsider = Infinity;
            var execEditLength = function() {
              for (var diagonalPath = Math.max(minDiagonalToConsider, -editLength); diagonalPath <= Math.min(maxDiagonalToConsider, editLength); diagonalPath += 2) {
                var basePath = void 0;
                var removePath = bestPath[diagonalPath - 1], addPath = bestPath[diagonalPath + 1];
                if (removePath) {
                  bestPath[diagonalPath - 1] = void 0;
                }
                var canAdd = false;
                if (addPath) {
                  var addPathNewPos = addPath.oldPos - diagonalPath;
                  canAdd = addPath && 0 <= addPathNewPos && addPathNewPos < newLen;
                }
                var canRemove = removePath && removePath.oldPos + 1 < oldLen;
                if (!canAdd && !canRemove) {
                  bestPath[diagonalPath] = void 0;
                  continue;
                }
                if (!canRemove || canAdd && removePath.oldPos < addPath.oldPos) {
                  basePath = _this.addToPath(addPath, true, false, 0, options);
                } else {
                  basePath = _this.addToPath(removePath, false, true, 1, options);
                }
                newPos = _this.extractCommon(basePath, newTokens, oldTokens, diagonalPath, options);
                if (basePath.oldPos + 1 >= oldLen && newPos + 1 >= newLen) {
                  return done(_this.buildValues(basePath.lastComponent, newTokens, oldTokens)) || true;
                } else {
                  bestPath[diagonalPath] = basePath;
                  if (basePath.oldPos + 1 >= oldLen) {
                    maxDiagonalToConsider = Math.min(maxDiagonalToConsider, diagonalPath - 1);
                  }
                  if (newPos + 1 >= newLen) {
                    minDiagonalToConsider = Math.max(minDiagonalToConsider, diagonalPath + 1);
                  }
                }
              }
              editLength++;
            };
            if (callback) {
              (function exec() {
                setTimeout(function() {
                  if (editLength > maxEditLength || Date.now() > abortAfterTimestamp) {
                    return callback(void 0);
                  }
                  if (!execEditLength()) {
                    exec();
                  }
                }, 0);
              })();
            } else {
              while (editLength <= maxEditLength && Date.now() <= abortAfterTimestamp) {
                var ret = execEditLength();
                if (ret) {
                  return ret;
                }
              }
            }
          };
          Diff2.prototype.addToPath = function(path, added, removed, oldPosInc, options) {
            var last = path.lastComponent;
            if (last && !options.oneChangePerToken && last.added === added && last.removed === removed) {
              return {
                oldPos: path.oldPos + oldPosInc,
                lastComponent: { count: last.count + 1, added, removed, previousComponent: last.previousComponent }
              };
            } else {
              return {
                oldPos: path.oldPos + oldPosInc,
                lastComponent: { count: 1, added, removed, previousComponent: last }
              };
            }
          };
          Diff2.prototype.extractCommon = function(basePath, newTokens, oldTokens, diagonalPath, options) {
            var newLen = newTokens.length, oldLen = oldTokens.length;
            var oldPos = basePath.oldPos, newPos = oldPos - diagonalPath, commonCount = 0;
            while (newPos + 1 < newLen && oldPos + 1 < oldLen && this.equals(oldTokens[oldPos + 1], newTokens[newPos + 1], options)) {
              newPos++;
              oldPos++;
              commonCount++;
              if (options.oneChangePerToken) {
                basePath.lastComponent = { count: 1, previousComponent: basePath.lastComponent, added: false, removed: false };
              }
            }
            if (commonCount && !options.oneChangePerToken) {
              basePath.lastComponent = { count: commonCount, previousComponent: basePath.lastComponent, added: false, removed: false };
            }
            basePath.oldPos = oldPos;
            return newPos;
          };
          Diff2.prototype.equals = function(left, right, options) {
            if (options.comparator) {
              return options.comparator(left, right);
            } else {
              return left === right || !!options.ignoreCase && left.toLowerCase() === right.toLowerCase();
            }
          };
          Diff2.prototype.removeEmpty = function(array) {
            var ret = [];
            for (var i = 0; i < array.length; i++) {
              if (array[i]) {
                ret.push(array[i]);
              }
            }
            return ret;
          };
          Diff2.prototype.castInput = function(value, options) {
            return value;
          };
          Diff2.prototype.tokenize = function(value, options) {
            return Array.from(value);
          };
          Diff2.prototype.join = function(chars) {
            return chars.join("");
          };
          Diff2.prototype.postProcess = function(changeObjects, options) {
            return changeObjects;
          };
          Object.defineProperty(Diff2.prototype, "useLongestToken", {
            get: function() {
              return false;
            },
            enumerable: false,
            configurable: true
          });
          Diff2.prototype.buildValues = function(lastComponent, newTokens, oldTokens) {
            var components = [];
            var nextComponent;
            while (lastComponent) {
              components.push(lastComponent);
              nextComponent = lastComponent.previousComponent;
              delete lastComponent.previousComponent;
              lastComponent = nextComponent;
            }
            components.reverse();
            var componentLen = components.length;
            var componentPos = 0, newPos = 0, oldPos = 0;
            for (; componentPos < componentLen; componentPos++) {
              var component = components[componentPos];
              if (!component.removed) {
                if (!component.added && this.useLongestToken) {
                  var value = newTokens.slice(newPos, newPos + component.count);
                  value = value.map(function(value2, i) {
                    var oldValue = oldTokens[oldPos + i];
                    return oldValue.length > value2.length ? oldValue : value2;
                  });
                  component.value = this.join(value);
                } else {
                  component.value = this.join(newTokens.slice(newPos, newPos + component.count));
                }
                newPos += component.count;
                if (!component.added) {
                  oldPos += component.count;
                }
              } else {
                component.value = this.join(oldTokens.slice(oldPos, oldPos + component.count));
                oldPos += component.count;
              }
            }
            return components;
          };
          return Diff2;
        })()
      );
      exports.default = Diff;
    }
  });

  // node_modules/diff/libcjs/diff/character.js
  var require_character = __commonJS({
    "node_modules/diff/libcjs/diff/character.js"(exports) {
      "use strict";
      var __extends = exports && exports.__extends || /* @__PURE__ */ (function() {
        var extendStatics = function(d, b) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
          };
          return extendStatics(d, b);
        };
        return function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      })();
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.characterDiff = void 0;
      exports.diffChars = diffChars;
      var base_js_1 = require_base();
      var CharacterDiff = (
        /** @class */
        (function(_super) {
          __extends(CharacterDiff2, _super);
          function CharacterDiff2() {
            return _super !== null && _super.apply(this, arguments) || this;
          }
          return CharacterDiff2;
        })(base_js_1.default)
      );
      exports.characterDiff = new CharacterDiff();
      function diffChars(oldStr, newStr, options) {
        return exports.characterDiff.diff(oldStr, newStr, options);
      }
    }
  });

  // node_modules/diff/libcjs/util/string.js
  var require_string = __commonJS({
    "node_modules/diff/libcjs/util/string.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.longestCommonPrefix = longestCommonPrefix;
      exports.longestCommonSuffix = longestCommonSuffix;
      exports.replacePrefix = replacePrefix;
      exports.replaceSuffix = replaceSuffix;
      exports.removePrefix = removePrefix;
      exports.removeSuffix = removeSuffix;
      exports.maximumOverlap = maximumOverlap;
      exports.hasOnlyWinLineEndings = hasOnlyWinLineEndings;
      exports.hasOnlyUnixLineEndings = hasOnlyUnixLineEndings;
      exports.trailingWs = trailingWs;
      exports.leadingWs = leadingWs;
      function longestCommonPrefix(str1, str2) {
        var i;
        for (i = 0; i < str1.length && i < str2.length; i++) {
          if (str1[i] != str2[i]) {
            return str1.slice(0, i);
          }
        }
        return str1.slice(0, i);
      }
      function longestCommonSuffix(str1, str2) {
        var i;
        if (!str1 || !str2 || str1[str1.length - 1] != str2[str2.length - 1]) {
          return "";
        }
        for (i = 0; i < str1.length && i < str2.length; i++) {
          if (str1[str1.length - (i + 1)] != str2[str2.length - (i + 1)]) {
            return str1.slice(-i);
          }
        }
        return str1.slice(-i);
      }
      function replacePrefix(string, oldPrefix, newPrefix) {
        if (string.slice(0, oldPrefix.length) != oldPrefix) {
          throw Error("string ".concat(JSON.stringify(string), " doesn't start with prefix ").concat(JSON.stringify(oldPrefix), "; this is a bug"));
        }
        return newPrefix + string.slice(oldPrefix.length);
      }
      function replaceSuffix(string, oldSuffix, newSuffix) {
        if (!oldSuffix) {
          return string + newSuffix;
        }
        if (string.slice(-oldSuffix.length) != oldSuffix) {
          throw Error("string ".concat(JSON.stringify(string), " doesn't end with suffix ").concat(JSON.stringify(oldSuffix), "; this is a bug"));
        }
        return string.slice(0, -oldSuffix.length) + newSuffix;
      }
      function removePrefix(string, oldPrefix) {
        return replacePrefix(string, oldPrefix, "");
      }
      function removeSuffix(string, oldSuffix) {
        return replaceSuffix(string, oldSuffix, "");
      }
      function maximumOverlap(string1, string2) {
        return string2.slice(0, overlapCount(string1, string2));
      }
      function overlapCount(a, b) {
        var startA = 0;
        if (a.length > b.length) {
          startA = a.length - b.length;
        }
        var endB = b.length;
        if (a.length < b.length) {
          endB = a.length;
        }
        var map = Array(endB);
        var k = 0;
        map[0] = 0;
        for (var j = 1; j < endB; j++) {
          if (b[j] == b[k]) {
            map[j] = map[k];
          } else {
            map[j] = k;
          }
          while (k > 0 && b[j] != b[k]) {
            k = map[k];
          }
          if (b[j] == b[k]) {
            k++;
          }
        }
        k = 0;
        for (var i = startA; i < a.length; i++) {
          while (k > 0 && a[i] != b[k]) {
            k = map[k];
          }
          if (a[i] == b[k]) {
            k++;
          }
        }
        return k;
      }
      function hasOnlyWinLineEndings(string) {
        return string.includes("\r\n") && !string.startsWith("\n") && !string.match(/[^\r]\n/);
      }
      function hasOnlyUnixLineEndings(string) {
        return !string.includes("\r\n") && string.includes("\n");
      }
      function trailingWs(string) {
        var i;
        for (i = string.length - 1; i >= 0; i--) {
          if (!string[i].match(/\s/)) {
            break;
          }
        }
        return string.substring(i + 1);
      }
      function leadingWs(string) {
        var match = string.match(/^\s*/);
        return match ? match[0] : "";
      }
    }
  });

  // node_modules/diff/libcjs/diff/word.js
  var require_word = __commonJS({
    "node_modules/diff/libcjs/diff/word.js"(exports) {
      "use strict";
      var __extends = exports && exports.__extends || /* @__PURE__ */ (function() {
        var extendStatics = function(d, b) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
          };
          return extendStatics(d, b);
        };
        return function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      })();
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.wordsWithSpaceDiff = exports.wordDiff = void 0;
      exports.diffWords = diffWords;
      exports.diffWordsWithSpace = diffWordsWithSpace;
      var base_js_1 = require_base();
      var string_js_1 = require_string();
      var extendedWordChars = "a-zA-Z0-9_\\u{AD}\\u{C0}-\\u{D6}\\u{D8}-\\u{F6}\\u{F8}-\\u{2C6}\\u{2C8}-\\u{2D7}\\u{2DE}-\\u{2FF}\\u{1E00}-\\u{1EFF}";
      var tokenizeIncludingWhitespace = new RegExp("[".concat(extendedWordChars, "]+|\\s+|[^").concat(extendedWordChars, "]"), "ug");
      var WordDiff = (
        /** @class */
        (function(_super) {
          __extends(WordDiff2, _super);
          function WordDiff2() {
            return _super !== null && _super.apply(this, arguments) || this;
          }
          WordDiff2.prototype.equals = function(left, right, options) {
            if (options.ignoreCase) {
              left = left.toLowerCase();
              right = right.toLowerCase();
            }
            return left.trim() === right.trim();
          };
          WordDiff2.prototype.tokenize = function(value, options) {
            if (options === void 0) {
              options = {};
            }
            var parts;
            if (options.intlSegmenter) {
              var segmenter = options.intlSegmenter;
              if (segmenter.resolvedOptions().granularity != "word") {
                throw new Error('The segmenter passed must have a granularity of "word"');
              }
              parts = [];
              for (var _i = 0, _a = Array.from(segmenter.segment(value)); _i < _a.length; _i++) {
                var segmentObj = _a[_i];
                var segment = segmentObj.segment;
                if (parts.length && /\s/.test(parts[parts.length - 1]) && /\s/.test(segment)) {
                  parts[parts.length - 1] += segment;
                } else {
                  parts.push(segment);
                }
              }
            } else {
              parts = value.match(tokenizeIncludingWhitespace) || [];
            }
            var tokens = [];
            var prevPart = null;
            parts.forEach(function(part) {
              if (/\s/.test(part)) {
                if (prevPart == null) {
                  tokens.push(part);
                } else {
                  tokens.push(tokens.pop() + part);
                }
              } else if (prevPart != null && /\s/.test(prevPart)) {
                if (tokens[tokens.length - 1] == prevPart) {
                  tokens.push(tokens.pop() + part);
                } else {
                  tokens.push(prevPart + part);
                }
              } else {
                tokens.push(part);
              }
              prevPart = part;
            });
            return tokens;
          };
          WordDiff2.prototype.join = function(tokens) {
            return tokens.map(function(token, i) {
              if (i == 0) {
                return token;
              } else {
                return token.replace(/^\s+/, "");
              }
            }).join("");
          };
          WordDiff2.prototype.postProcess = function(changes, options) {
            if (!changes || options.oneChangePerToken) {
              return changes;
            }
            var lastKeep = null;
            var insertion = null;
            var deletion = null;
            changes.forEach(function(change) {
              if (change.added) {
                insertion = change;
              } else if (change.removed) {
                deletion = change;
              } else {
                if (insertion || deletion) {
                  dedupeWhitespaceInChangeObjects(lastKeep, deletion, insertion, change);
                }
                lastKeep = change;
                insertion = null;
                deletion = null;
              }
            });
            if (insertion || deletion) {
              dedupeWhitespaceInChangeObjects(lastKeep, deletion, insertion, null);
            }
            return changes;
          };
          return WordDiff2;
        })(base_js_1.default)
      );
      exports.wordDiff = new WordDiff();
      function diffWords(oldStr, newStr, options) {
        if ((options === null || options === void 0 ? void 0 : options.ignoreWhitespace) != null && !options.ignoreWhitespace) {
          return diffWordsWithSpace(oldStr, newStr, options);
        }
        return exports.wordDiff.diff(oldStr, newStr, options);
      }
      function dedupeWhitespaceInChangeObjects(startKeep, deletion, insertion, endKeep) {
        if (deletion && insertion) {
          var oldWsPrefix = (0, string_js_1.leadingWs)(deletion.value);
          var oldWsSuffix = (0, string_js_1.trailingWs)(deletion.value);
          var newWsPrefix = (0, string_js_1.leadingWs)(insertion.value);
          var newWsSuffix = (0, string_js_1.trailingWs)(insertion.value);
          if (startKeep) {
            var commonWsPrefix = (0, string_js_1.longestCommonPrefix)(oldWsPrefix, newWsPrefix);
            startKeep.value = (0, string_js_1.replaceSuffix)(startKeep.value, newWsPrefix, commonWsPrefix);
            deletion.value = (0, string_js_1.removePrefix)(deletion.value, commonWsPrefix);
            insertion.value = (0, string_js_1.removePrefix)(insertion.value, commonWsPrefix);
          }
          if (endKeep) {
            var commonWsSuffix = (0, string_js_1.longestCommonSuffix)(oldWsSuffix, newWsSuffix);
            endKeep.value = (0, string_js_1.replacePrefix)(endKeep.value, newWsSuffix, commonWsSuffix);
            deletion.value = (0, string_js_1.removeSuffix)(deletion.value, commonWsSuffix);
            insertion.value = (0, string_js_1.removeSuffix)(insertion.value, commonWsSuffix);
          }
        } else if (insertion) {
          if (startKeep) {
            var ws = (0, string_js_1.leadingWs)(insertion.value);
            insertion.value = insertion.value.substring(ws.length);
          }
          if (endKeep) {
            var ws = (0, string_js_1.leadingWs)(endKeep.value);
            endKeep.value = endKeep.value.substring(ws.length);
          }
        } else if (startKeep && endKeep) {
          var newWsFull = (0, string_js_1.leadingWs)(endKeep.value), delWsStart = (0, string_js_1.leadingWs)(deletion.value), delWsEnd = (0, string_js_1.trailingWs)(deletion.value);
          var newWsStart = (0, string_js_1.longestCommonPrefix)(newWsFull, delWsStart);
          deletion.value = (0, string_js_1.removePrefix)(deletion.value, newWsStart);
          var newWsEnd = (0, string_js_1.longestCommonSuffix)((0, string_js_1.removePrefix)(newWsFull, newWsStart), delWsEnd);
          deletion.value = (0, string_js_1.removeSuffix)(deletion.value, newWsEnd);
          endKeep.value = (0, string_js_1.replacePrefix)(endKeep.value, newWsFull, newWsEnd);
          startKeep.value = (0, string_js_1.replaceSuffix)(startKeep.value, newWsFull, newWsFull.slice(0, newWsFull.length - newWsEnd.length));
        } else if (endKeep) {
          var endKeepWsPrefix = (0, string_js_1.leadingWs)(endKeep.value);
          var deletionWsSuffix = (0, string_js_1.trailingWs)(deletion.value);
          var overlap = (0, string_js_1.maximumOverlap)(deletionWsSuffix, endKeepWsPrefix);
          deletion.value = (0, string_js_1.removeSuffix)(deletion.value, overlap);
        } else if (startKeep) {
          var startKeepWsSuffix = (0, string_js_1.trailingWs)(startKeep.value);
          var deletionWsPrefix = (0, string_js_1.leadingWs)(deletion.value);
          var overlap = (0, string_js_1.maximumOverlap)(startKeepWsSuffix, deletionWsPrefix);
          deletion.value = (0, string_js_1.removePrefix)(deletion.value, overlap);
        }
      }
      var WordsWithSpaceDiff = (
        /** @class */
        (function(_super) {
          __extends(WordsWithSpaceDiff2, _super);
          function WordsWithSpaceDiff2() {
            return _super !== null && _super.apply(this, arguments) || this;
          }
          WordsWithSpaceDiff2.prototype.tokenize = function(value) {
            var regex = new RegExp("(\\r?\\n)|[".concat(extendedWordChars, "]+|[^\\S\\n\\r]+|[^").concat(extendedWordChars, "]"), "ug");
            return value.match(regex) || [];
          };
          return WordsWithSpaceDiff2;
        })(base_js_1.default)
      );
      exports.wordsWithSpaceDiff = new WordsWithSpaceDiff();
      function diffWordsWithSpace(oldStr, newStr, options) {
        return exports.wordsWithSpaceDiff.diff(oldStr, newStr, options);
      }
    }
  });

  // node_modules/diff/libcjs/util/params.js
  var require_params = __commonJS({
    "node_modules/diff/libcjs/util/params.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.generateOptions = generateOptions;
      function generateOptions(options, defaults) {
        if (typeof options === "function") {
          defaults.callback = options;
        } else if (options) {
          for (var name in options) {
            if (Object.prototype.hasOwnProperty.call(options, name)) {
              defaults[name] = options[name];
            }
          }
        }
        return defaults;
      }
    }
  });

  // node_modules/diff/libcjs/diff/line.js
  var require_line = __commonJS({
    "node_modules/diff/libcjs/diff/line.js"(exports) {
      "use strict";
      var __extends = exports && exports.__extends || /* @__PURE__ */ (function() {
        var extendStatics = function(d, b) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
          };
          return extendStatics(d, b);
        };
        return function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      })();
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.lineDiff = void 0;
      exports.diffLines = diffLines;
      exports.diffTrimmedLines = diffTrimmedLines;
      exports.tokenize = tokenize2;
      var base_js_1 = require_base();
      var params_js_1 = require_params();
      var LineDiff = (
        /** @class */
        (function(_super) {
          __extends(LineDiff2, _super);
          function LineDiff2() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.tokenize = tokenize2;
            return _this;
          }
          LineDiff2.prototype.equals = function(left, right, options) {
            if (options.ignoreWhitespace) {
              if (!options.newlineIsToken || !left.includes("\n")) {
                left = left.trim();
              }
              if (!options.newlineIsToken || !right.includes("\n")) {
                right = right.trim();
              }
            } else if (options.ignoreNewlineAtEof && !options.newlineIsToken) {
              if (left.endsWith("\n")) {
                left = left.slice(0, -1);
              }
              if (right.endsWith("\n")) {
                right = right.slice(0, -1);
              }
            }
            return _super.prototype.equals.call(this, left, right, options);
          };
          return LineDiff2;
        })(base_js_1.default)
      );
      exports.lineDiff = new LineDiff();
      function diffLines(oldStr, newStr, options) {
        return exports.lineDiff.diff(oldStr, newStr, options);
      }
      function diffTrimmedLines(oldStr, newStr, options) {
        options = (0, params_js_1.generateOptions)(options, { ignoreWhitespace: true });
        return exports.lineDiff.diff(oldStr, newStr, options);
      }
      function tokenize2(value, options) {
        if (options.stripTrailingCr) {
          value = value.replace(/\r\n/g, "\n");
        }
        var retLines = [], linesAndNewlines = value.split(/(\n|\r\n)/);
        if (!linesAndNewlines[linesAndNewlines.length - 1]) {
          linesAndNewlines.pop();
        }
        for (var i = 0; i < linesAndNewlines.length; i++) {
          var line = linesAndNewlines[i];
          if (i % 2 && !options.newlineIsToken) {
            retLines[retLines.length - 1] += line;
          } else {
            retLines.push(line);
          }
        }
        return retLines;
      }
    }
  });

  // node_modules/diff/libcjs/diff/sentence.js
  var require_sentence = __commonJS({
    "node_modules/diff/libcjs/diff/sentence.js"(exports) {
      "use strict";
      var __extends = exports && exports.__extends || /* @__PURE__ */ (function() {
        var extendStatics = function(d, b) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
          };
          return extendStatics(d, b);
        };
        return function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      })();
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.sentenceDiff = void 0;
      exports.diffSentences = diffSentences;
      var base_js_1 = require_base();
      function isSentenceEndPunct(char) {
        return char == "." || char == "!" || char == "?";
      }
      var SentenceDiff = (
        /** @class */
        (function(_super) {
          __extends(SentenceDiff2, _super);
          function SentenceDiff2() {
            return _super !== null && _super.apply(this, arguments) || this;
          }
          SentenceDiff2.prototype.tokenize = function(value) {
            var _a;
            var result = [];
            var tokenStartI = 0;
            for (var i = 0; i < value.length; i++) {
              if (i == value.length - 1) {
                result.push(value.slice(tokenStartI));
                break;
              }
              if (isSentenceEndPunct(value[i]) && value[i + 1].match(/\s/)) {
                result.push(value.slice(tokenStartI, i + 1));
                i = tokenStartI = i + 1;
                while ((_a = value[i + 1]) === null || _a === void 0 ? void 0 : _a.match(/\s/)) {
                  i++;
                }
                result.push(value.slice(tokenStartI, i + 1));
                tokenStartI = i + 1;
              }
            }
            return result;
          };
          return SentenceDiff2;
        })(base_js_1.default)
      );
      exports.sentenceDiff = new SentenceDiff();
      function diffSentences(oldStr, newStr, options) {
        return exports.sentenceDiff.diff(oldStr, newStr, options);
      }
    }
  });

  // node_modules/diff/libcjs/diff/css.js
  var require_css2 = __commonJS({
    "node_modules/diff/libcjs/diff/css.js"(exports) {
      "use strict";
      var __extends = exports && exports.__extends || /* @__PURE__ */ (function() {
        var extendStatics = function(d, b) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
          };
          return extendStatics(d, b);
        };
        return function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      })();
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.cssDiff = void 0;
      exports.diffCss = diffCss;
      var base_js_1 = require_base();
      var CssDiff = (
        /** @class */
        (function(_super) {
          __extends(CssDiff2, _super);
          function CssDiff2() {
            return _super !== null && _super.apply(this, arguments) || this;
          }
          CssDiff2.prototype.tokenize = function(value) {
            return value.split(/([{}:;,]|\s+)/);
          };
          return CssDiff2;
        })(base_js_1.default)
      );
      exports.cssDiff = new CssDiff();
      function diffCss(oldStr, newStr, options) {
        return exports.cssDiff.diff(oldStr, newStr, options);
      }
    }
  });

  // node_modules/diff/libcjs/diff/json.js
  var require_json2 = __commonJS({
    "node_modules/diff/libcjs/diff/json.js"(exports) {
      "use strict";
      var __extends = exports && exports.__extends || /* @__PURE__ */ (function() {
        var extendStatics = function(d, b) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
          };
          return extendStatics(d, b);
        };
        return function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      })();
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.jsonDiff = void 0;
      exports.diffJson = diffJson;
      exports.canonicalize = canonicalize;
      var base_js_1 = require_base();
      var line_js_1 = require_line();
      var JsonDiff = (
        /** @class */
        (function(_super) {
          __extends(JsonDiff2, _super);
          function JsonDiff2() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.tokenize = line_js_1.tokenize;
            return _this;
          }
          Object.defineProperty(JsonDiff2.prototype, "useLongestToken", {
            get: function() {
              return true;
            },
            enumerable: false,
            configurable: true
          });
          JsonDiff2.prototype.castInput = function(value, options) {
            var undefinedReplacement = options.undefinedReplacement, _a = options.stringifyReplacer, stringifyReplacer = _a === void 0 ? function(k, v) {
              return typeof v === "undefined" ? undefinedReplacement : v;
            } : _a;
            return typeof value === "string" ? value : JSON.stringify(canonicalize(value, null, null, stringifyReplacer), null, "  ");
          };
          JsonDiff2.prototype.equals = function(left, right, options) {
            return _super.prototype.equals.call(this, left.replace(/,([\r\n])/g, "$1"), right.replace(/,([\r\n])/g, "$1"), options);
          };
          return JsonDiff2;
        })(base_js_1.default)
      );
      exports.jsonDiff = new JsonDiff();
      function diffJson(oldStr, newStr, options) {
        return exports.jsonDiff.diff(oldStr, newStr, options);
      }
      function canonicalize(obj, stack, replacementStack, replacer, key2) {
        stack = stack || [];
        replacementStack = replacementStack || [];
        if (replacer) {
          obj = replacer(key2 === void 0 ? "" : key2, obj);
        }
        var i;
        for (i = 0; i < stack.length; i += 1) {
          if (stack[i] === obj) {
            return replacementStack[i];
          }
        }
        var canonicalizedObj;
        if ("[object Array]" === Object.prototype.toString.call(obj)) {
          stack.push(obj);
          canonicalizedObj = new Array(obj.length);
          replacementStack.push(canonicalizedObj);
          for (i = 0; i < obj.length; i += 1) {
            canonicalizedObj[i] = canonicalize(obj[i], stack, replacementStack, replacer, String(i));
          }
          stack.pop();
          replacementStack.pop();
          return canonicalizedObj;
        }
        if (obj && obj.toJSON) {
          obj = obj.toJSON();
        }
        if (typeof obj === "object" && obj !== null) {
          stack.push(obj);
          canonicalizedObj = {};
          replacementStack.push(canonicalizedObj);
          var sortedKeys = [];
          var key_1;
          for (key_1 in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key_1)) {
              sortedKeys.push(key_1);
            }
          }
          sortedKeys.sort();
          for (i = 0; i < sortedKeys.length; i += 1) {
            key_1 = sortedKeys[i];
            canonicalizedObj[key_1] = canonicalize(obj[key_1], stack, replacementStack, replacer, key_1);
          }
          stack.pop();
          replacementStack.pop();
        } else {
          canonicalizedObj = obj;
        }
        return canonicalizedObj;
      }
    }
  });

  // node_modules/diff/libcjs/diff/array.js
  var require_array = __commonJS({
    "node_modules/diff/libcjs/diff/array.js"(exports) {
      "use strict";
      var __extends = exports && exports.__extends || /* @__PURE__ */ (function() {
        var extendStatics = function(d, b) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
            d2.__proto__ = b2;
          } || function(d2, b2) {
            for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
          };
          return extendStatics(d, b);
        };
        return function(d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          extendStatics(d, b);
          function __() {
            this.constructor = d;
          }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
      })();
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.arrayDiff = void 0;
      exports.diffArrays = diffArrays;
      var base_js_1 = require_base();
      var ArrayDiff = (
        /** @class */
        (function(_super) {
          __extends(ArrayDiff2, _super);
          function ArrayDiff2() {
            return _super !== null && _super.apply(this, arguments) || this;
          }
          ArrayDiff2.prototype.tokenize = function(value) {
            return value.slice();
          };
          ArrayDiff2.prototype.join = function(value) {
            return value;
          };
          ArrayDiff2.prototype.removeEmpty = function(value) {
            return value;
          };
          return ArrayDiff2;
        })(base_js_1.default)
      );
      exports.arrayDiff = new ArrayDiff();
      function diffArrays(oldArr, newArr, options) {
        return exports.arrayDiff.diff(oldArr, newArr, options);
      }
    }
  });

  // node_modules/diff/libcjs/patch/line-endings.js
  var require_line_endings = __commonJS({
    "node_modules/diff/libcjs/patch/line-endings.js"(exports) {
      "use strict";
      var __assign = exports && exports.__assign || function() {
        __assign = Object.assign || function(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
              t[p] = s[p];
          }
          return t;
        };
        return __assign.apply(this, arguments);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.unixToWin = unixToWin;
      exports.winToUnix = winToUnix;
      exports.isUnix = isUnix;
      exports.isWin = isWin;
      function unixToWin(patch) {
        if (Array.isArray(patch)) {
          return patch.map(function(p) {
            return unixToWin(p);
          });
        }
        return __assign(__assign({}, patch), { hunks: patch.hunks.map(function(hunk) {
          return __assign(__assign({}, hunk), { lines: hunk.lines.map(function(line, i) {
            var _a;
            return line.startsWith("\\") || line.endsWith("\r") || ((_a = hunk.lines[i + 1]) === null || _a === void 0 ? void 0 : _a.startsWith("\\")) ? line : line + "\r";
          }) });
        }) });
      }
      function winToUnix(patch) {
        if (Array.isArray(patch)) {
          return patch.map(function(p) {
            return winToUnix(p);
          });
        }
        return __assign(__assign({}, patch), { hunks: patch.hunks.map(function(hunk) {
          return __assign(__assign({}, hunk), { lines: hunk.lines.map(function(line) {
            return line.endsWith("\r") ? line.substring(0, line.length - 1) : line;
          }) });
        }) });
      }
      function isUnix(patch) {
        if (!Array.isArray(patch)) {
          patch = [patch];
        }
        return !patch.some(function(index) {
          return index.hunks.some(function(hunk) {
            return hunk.lines.some(function(line) {
              return !line.startsWith("\\") && line.endsWith("\r");
            });
          });
        });
      }
      function isWin(patch) {
        if (!Array.isArray(patch)) {
          patch = [patch];
        }
        return patch.some(function(index) {
          return index.hunks.some(function(hunk) {
            return hunk.lines.some(function(line) {
              return line.endsWith("\r");
            });
          });
        }) && patch.every(function(index) {
          return index.hunks.every(function(hunk) {
            return hunk.lines.every(function(line, i) {
              var _a;
              return line.startsWith("\\") || line.endsWith("\r") || ((_a = hunk.lines[i + 1]) === null || _a === void 0 ? void 0 : _a.startsWith("\\"));
            });
          });
        });
      }
    }
  });

  // node_modules/diff/libcjs/patch/parse.js
  var require_parse = __commonJS({
    "node_modules/diff/libcjs/patch/parse.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.parsePatch = parsePatch;
      function parsePatch(uniDiff) {
        var diffstr = uniDiff.split(/\n/), list = [];
        var i = 0;
        function parseIndex() {
          var index = {};
          list.push(index);
          while (i < diffstr.length) {
            var line = diffstr[i];
            if (/^(---|\+\+\+|@@)\s/.test(line)) {
              break;
            }
            var headerMatch = /^(?:Index:|diff(?: -r \w+)+)\s+/.exec(line);
            if (headerMatch) {
              index.index = line.substring(headerMatch[0].length).trim();
            }
            i++;
          }
          parseFileHeader(index);
          parseFileHeader(index);
          index.hunks = [];
          while (i < diffstr.length) {
            var line = diffstr[i];
            if (/^(Index:\s|diff\s|---\s|\+\+\+\s|===================================================================)/.test(line)) {
              break;
            } else if (/^@@/.test(line)) {
              index.hunks.push(parseHunk());
            } else if (line) {
              throw new Error("Unknown line " + (i + 1) + " " + JSON.stringify(line));
            } else {
              i++;
            }
          }
        }
        function parseFileHeader(index) {
          var fileHeaderMatch = /^(---|\+\+\+)\s+/.exec(diffstr[i]);
          if (fileHeaderMatch) {
            var prefix = fileHeaderMatch[1], data = diffstr[i].substring(3).trim().split("	", 2), header = (data[1] || "").trim();
            var fileName = data[0].replace(/\\\\/g, "\\");
            if (fileName.startsWith('"') && fileName.endsWith('"')) {
              fileName = fileName.substr(1, fileName.length - 2);
            }
            if (prefix === "---") {
              index.oldFileName = fileName;
              index.oldHeader = header;
            } else {
              index.newFileName = fileName;
              index.newHeader = header;
            }
            i++;
          }
        }
        function parseHunk() {
          var _a;
          var chunkHeaderIndex = i, chunkHeaderLine = diffstr[i++], chunkHeader = chunkHeaderLine.split(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
          var hunk = {
            oldStart: +chunkHeader[1],
            oldLines: typeof chunkHeader[2] === "undefined" ? 1 : +chunkHeader[2],
            newStart: +chunkHeader[3],
            newLines: typeof chunkHeader[4] === "undefined" ? 1 : +chunkHeader[4],
            lines: []
          };
          if (hunk.oldLines === 0) {
            hunk.oldStart += 1;
          }
          if (hunk.newLines === 0) {
            hunk.newStart += 1;
          }
          var addCount = 0, removeCount = 0;
          for (; i < diffstr.length && (removeCount < hunk.oldLines || addCount < hunk.newLines || ((_a = diffstr[i]) === null || _a === void 0 ? void 0 : _a.startsWith("\\"))); i++) {
            var operation = diffstr[i].length == 0 && i != diffstr.length - 1 ? " " : diffstr[i][0];
            if (operation === "+" || operation === "-" || operation === " " || operation === "\\") {
              hunk.lines.push(diffstr[i]);
              if (operation === "+") {
                addCount++;
              } else if (operation === "-") {
                removeCount++;
              } else if (operation === " ") {
                addCount++;
                removeCount++;
              }
            } else {
              throw new Error("Hunk at line ".concat(chunkHeaderIndex + 1, " contained invalid line ").concat(diffstr[i]));
            }
          }
          if (!addCount && hunk.newLines === 1) {
            hunk.newLines = 0;
          }
          if (!removeCount && hunk.oldLines === 1) {
            hunk.oldLines = 0;
          }
          if (addCount !== hunk.newLines) {
            throw new Error("Added line count did not match for hunk at line " + (chunkHeaderIndex + 1));
          }
          if (removeCount !== hunk.oldLines) {
            throw new Error("Removed line count did not match for hunk at line " + (chunkHeaderIndex + 1));
          }
          return hunk;
        }
        while (i < diffstr.length) {
          parseIndex();
        }
        return list;
      }
    }
  });

  // node_modules/diff/libcjs/util/distance-iterator.js
  var require_distance_iterator = __commonJS({
    "node_modules/diff/libcjs/util/distance-iterator.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.default = default_1;
      function default_1(start, minLine, maxLine) {
        var wantForward = true, backwardExhausted = false, forwardExhausted = false, localOffset = 1;
        return function iterator() {
          if (wantForward && !forwardExhausted) {
            if (backwardExhausted) {
              localOffset++;
            } else {
              wantForward = false;
            }
            if (start + localOffset <= maxLine) {
              return start + localOffset;
            }
            forwardExhausted = true;
          }
          if (!backwardExhausted) {
            if (!forwardExhausted) {
              wantForward = true;
            }
            if (minLine <= start - localOffset) {
              return start - localOffset++;
            }
            backwardExhausted = true;
            return iterator();
          }
          return void 0;
        };
      }
    }
  });

  // node_modules/diff/libcjs/patch/apply.js
  var require_apply = __commonJS({
    "node_modules/diff/libcjs/patch/apply.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.applyPatch = applyPatch;
      exports.applyPatches = applyPatches;
      var string_js_1 = require_string();
      var line_endings_js_1 = require_line_endings();
      var parse_js_1 = require_parse();
      var distance_iterator_js_1 = require_distance_iterator();
      function applyPatch(source, patch, options) {
        if (options === void 0) {
          options = {};
        }
        var patches;
        if (typeof patch === "string") {
          patches = (0, parse_js_1.parsePatch)(patch);
        } else if (Array.isArray(patch)) {
          patches = patch;
        } else {
          patches = [patch];
        }
        if (patches.length > 1) {
          throw new Error("applyPatch only works with a single input.");
        }
        return applyStructuredPatch(source, patches[0], options);
      }
      function applyStructuredPatch(source, patch, options) {
        if (options === void 0) {
          options = {};
        }
        if (options.autoConvertLineEndings || options.autoConvertLineEndings == null) {
          if ((0, string_js_1.hasOnlyWinLineEndings)(source) && (0, line_endings_js_1.isUnix)(patch)) {
            patch = (0, line_endings_js_1.unixToWin)(patch);
          } else if ((0, string_js_1.hasOnlyUnixLineEndings)(source) && (0, line_endings_js_1.isWin)(patch)) {
            patch = (0, line_endings_js_1.winToUnix)(patch);
          }
        }
        var lines = source.split("\n"), hunks = patch.hunks, compareLine = options.compareLine || (function(lineNumber, line2, operation, patchContent) {
          return line2 === patchContent;
        }), fuzzFactor = options.fuzzFactor || 0;
        var minLine = 0;
        if (fuzzFactor < 0 || !Number.isInteger(fuzzFactor)) {
          throw new Error("fuzzFactor must be a non-negative integer");
        }
        if (!hunks.length) {
          return source;
        }
        var prevLine = "", removeEOFNL = false, addEOFNL = false;
        for (var i = 0; i < hunks[hunks.length - 1].lines.length; i++) {
          var line = hunks[hunks.length - 1].lines[i];
          if (line[0] == "\\") {
            if (prevLine[0] == "+") {
              removeEOFNL = true;
            } else if (prevLine[0] == "-") {
              addEOFNL = true;
            }
          }
          prevLine = line;
        }
        if (removeEOFNL) {
          if (addEOFNL) {
            if (!fuzzFactor && lines[lines.length - 1] == "") {
              return false;
            }
          } else if (lines[lines.length - 1] == "") {
            lines.pop();
          } else if (!fuzzFactor) {
            return false;
          }
        } else if (addEOFNL) {
          if (lines[lines.length - 1] != "") {
            lines.push("");
          } else if (!fuzzFactor) {
            return false;
          }
        }
        function applyHunk(hunkLines, toPos2, maxErrors2, hunkLinesI, lastContextLineMatched, patchedLines, patchedLinesLength) {
          if (hunkLinesI === void 0) {
            hunkLinesI = 0;
          }
          if (lastContextLineMatched === void 0) {
            lastContextLineMatched = true;
          }
          if (patchedLines === void 0) {
            patchedLines = [];
          }
          if (patchedLinesLength === void 0) {
            patchedLinesLength = 0;
          }
          var nConsecutiveOldContextLines = 0;
          var nextContextLineMustMatch = false;
          for (; hunkLinesI < hunkLines.length; hunkLinesI++) {
            var hunkLine = hunkLines[hunkLinesI], operation = hunkLine.length > 0 ? hunkLine[0] : " ", content = hunkLine.length > 0 ? hunkLine.substr(1) : hunkLine;
            if (operation === "-") {
              if (compareLine(toPos2 + 1, lines[toPos2], operation, content)) {
                toPos2++;
                nConsecutiveOldContextLines = 0;
              } else {
                if (!maxErrors2 || lines[toPos2] == null) {
                  return null;
                }
                patchedLines[patchedLinesLength] = lines[toPos2];
                return applyHunk(hunkLines, toPos2 + 1, maxErrors2 - 1, hunkLinesI, false, patchedLines, patchedLinesLength + 1);
              }
            }
            if (operation === "+") {
              if (!lastContextLineMatched) {
                return null;
              }
              patchedLines[patchedLinesLength] = content;
              patchedLinesLength++;
              nConsecutiveOldContextLines = 0;
              nextContextLineMustMatch = true;
            }
            if (operation === " ") {
              nConsecutiveOldContextLines++;
              patchedLines[patchedLinesLength] = lines[toPos2];
              if (compareLine(toPos2 + 1, lines[toPos2], operation, content)) {
                patchedLinesLength++;
                lastContextLineMatched = true;
                nextContextLineMustMatch = false;
                toPos2++;
              } else {
                if (nextContextLineMustMatch || !maxErrors2) {
                  return null;
                }
                return lines[toPos2] && (applyHunk(hunkLines, toPos2 + 1, maxErrors2 - 1, hunkLinesI + 1, false, patchedLines, patchedLinesLength + 1) || applyHunk(hunkLines, toPos2 + 1, maxErrors2 - 1, hunkLinesI, false, patchedLines, patchedLinesLength + 1)) || applyHunk(hunkLines, toPos2, maxErrors2 - 1, hunkLinesI + 1, false, patchedLines, patchedLinesLength);
              }
            }
          }
          patchedLinesLength -= nConsecutiveOldContextLines;
          toPos2 -= nConsecutiveOldContextLines;
          patchedLines.length = patchedLinesLength;
          return {
            patchedLines,
            oldLineLastI: toPos2 - 1
          };
        }
        var resultLines = [];
        var prevHunkOffset = 0;
        for (var i = 0; i < hunks.length; i++) {
          var hunk = hunks[i];
          var hunkResult = void 0;
          var maxLine = lines.length - hunk.oldLines + fuzzFactor;
          var toPos = void 0;
          for (var maxErrors = 0; maxErrors <= fuzzFactor; maxErrors++) {
            toPos = hunk.oldStart + prevHunkOffset - 1;
            var iterator = (0, distance_iterator_js_1.default)(toPos, minLine, maxLine);
            for (; toPos !== void 0; toPos = iterator()) {
              hunkResult = applyHunk(hunk.lines, toPos, maxErrors);
              if (hunkResult) {
                break;
              }
            }
            if (hunkResult) {
              break;
            }
          }
          if (!hunkResult) {
            return false;
          }
          for (var i_1 = minLine; i_1 < toPos; i_1++) {
            resultLines.push(lines[i_1]);
          }
          for (var i_2 = 0; i_2 < hunkResult.patchedLines.length; i_2++) {
            var line = hunkResult.patchedLines[i_2];
            resultLines.push(line);
          }
          minLine = hunkResult.oldLineLastI + 1;
          prevHunkOffset = toPos + 1 - hunk.oldStart;
        }
        for (var i = minLine; i < lines.length; i++) {
          resultLines.push(lines[i]);
        }
        return resultLines.join("\n");
      }
      function applyPatches(uniDiff, options) {
        var spDiff = typeof uniDiff === "string" ? (0, parse_js_1.parsePatch)(uniDiff) : uniDiff;
        var currentIndex = 0;
        function processIndex() {
          var index = spDiff[currentIndex++];
          if (!index) {
            return options.complete();
          }
          options.loadFile(index, function(err, data) {
            if (err) {
              return options.complete(err);
            }
            var updatedContent = applyPatch(data, index, options);
            options.patched(index, updatedContent, function(err2) {
              if (err2) {
                return options.complete(err2);
              }
              processIndex();
            });
          });
        }
        processIndex();
      }
    }
  });

  // node_modules/diff/libcjs/patch/reverse.js
  var require_reverse = __commonJS({
    "node_modules/diff/libcjs/patch/reverse.js"(exports) {
      "use strict";
      var __assign = exports && exports.__assign || function() {
        __assign = Object.assign || function(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
              t[p] = s[p];
          }
          return t;
        };
        return __assign.apply(this, arguments);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.reversePatch = reversePatch;
      function reversePatch(structuredPatch) {
        if (Array.isArray(structuredPatch)) {
          return structuredPatch.map(function(patch) {
            return reversePatch(patch);
          }).reverse();
        }
        return __assign(__assign({}, structuredPatch), { oldFileName: structuredPatch.newFileName, oldHeader: structuredPatch.newHeader, newFileName: structuredPatch.oldFileName, newHeader: structuredPatch.oldHeader, hunks: structuredPatch.hunks.map(function(hunk) {
          return {
            oldLines: hunk.newLines,
            oldStart: hunk.newStart,
            newLines: hunk.oldLines,
            newStart: hunk.oldStart,
            lines: hunk.lines.map(function(l) {
              if (l.startsWith("-")) {
                return "+".concat(l.slice(1));
              }
              if (l.startsWith("+")) {
                return "-".concat(l.slice(1));
              }
              return l;
            })
          };
        }) });
      }
    }
  });

  // node_modules/diff/libcjs/patch/create.js
  var require_create = __commonJS({
    "node_modules/diff/libcjs/patch/create.js"(exports) {
      "use strict";
      var __assign = exports && exports.__assign || function() {
        __assign = Object.assign || function(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
              t[p] = s[p];
          }
          return t;
        };
        return __assign.apply(this, arguments);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.OMIT_HEADERS = exports.FILE_HEADERS_ONLY = exports.INCLUDE_HEADERS = void 0;
      exports.structuredPatch = structuredPatch;
      exports.formatPatch = formatPatch;
      exports.createTwoFilesPatch = createTwoFilesPatch;
      exports.createPatch = createPatch;
      var line_js_1 = require_line();
      exports.INCLUDE_HEADERS = {
        includeIndex: true,
        includeUnderline: true,
        includeFileHeaders: true
      };
      exports.FILE_HEADERS_ONLY = {
        includeIndex: false,
        includeUnderline: false,
        includeFileHeaders: true
      };
      exports.OMIT_HEADERS = {
        includeIndex: false,
        includeUnderline: false,
        includeFileHeaders: false
      };
      function structuredPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options) {
        var optionsObj;
        if (!options) {
          optionsObj = {};
        } else if (typeof options === "function") {
          optionsObj = { callback: options };
        } else {
          optionsObj = options;
        }
        if (typeof optionsObj.context === "undefined") {
          optionsObj.context = 4;
        }
        var context = optionsObj.context;
        if (optionsObj.newlineIsToken) {
          throw new Error("newlineIsToken may not be used with patch-generation functions, only with diffing functions");
        }
        if (!optionsObj.callback) {
          return diffLinesResultToPatch((0, line_js_1.diffLines)(oldStr, newStr, optionsObj));
        } else {
          var callback_1 = optionsObj.callback;
          (0, line_js_1.diffLines)(oldStr, newStr, __assign(__assign({}, optionsObj), { callback: function(diff) {
            var patch = diffLinesResultToPatch(diff);
            callback_1(patch);
          } }));
        }
        function diffLinesResultToPatch(diff) {
          if (!diff) {
            return;
          }
          diff.push({ value: "", lines: [] });
          function contextLines(lines2) {
            return lines2.map(function(entry) {
              return " " + entry;
            });
          }
          var hunks = [];
          var oldRangeStart = 0, newRangeStart = 0, curRange = [], oldLine = 1, newLine = 1;
          for (var i = 0; i < diff.length; i++) {
            var current = diff[i], lines = current.lines || splitLines(current.value);
            current.lines = lines;
            if (current.added || current.removed) {
              if (!oldRangeStart) {
                var prev = diff[i - 1];
                oldRangeStart = oldLine;
                newRangeStart = newLine;
                if (prev) {
                  curRange = context > 0 ? contextLines(prev.lines.slice(-context)) : [];
                  oldRangeStart -= curRange.length;
                  newRangeStart -= curRange.length;
                }
              }
              for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                var line = lines_1[_i];
                curRange.push((current.added ? "+" : "-") + line);
              }
              if (current.added) {
                newLine += lines.length;
              } else {
                oldLine += lines.length;
              }
            } else {
              if (oldRangeStart) {
                if (lines.length <= context * 2 && i < diff.length - 2) {
                  for (var _a = 0, _b = contextLines(lines); _a < _b.length; _a++) {
                    var line = _b[_a];
                    curRange.push(line);
                  }
                } else {
                  var contextSize = Math.min(lines.length, context);
                  for (var _c = 0, _d = contextLines(lines.slice(0, contextSize)); _c < _d.length; _c++) {
                    var line = _d[_c];
                    curRange.push(line);
                  }
                  var hunk = {
                    oldStart: oldRangeStart,
                    oldLines: oldLine - oldRangeStart + contextSize,
                    newStart: newRangeStart,
                    newLines: newLine - newRangeStart + contextSize,
                    lines: curRange
                  };
                  hunks.push(hunk);
                  oldRangeStart = 0;
                  newRangeStart = 0;
                  curRange = [];
                }
              }
              oldLine += lines.length;
              newLine += lines.length;
            }
          }
          for (var _e = 0, hunks_1 = hunks; _e < hunks_1.length; _e++) {
            var hunk = hunks_1[_e];
            for (var i = 0; i < hunk.lines.length; i++) {
              if (hunk.lines[i].endsWith("\n")) {
                hunk.lines[i] = hunk.lines[i].slice(0, -1);
              } else {
                hunk.lines.splice(i + 1, 0, "\\ No newline at end of file");
                i++;
              }
            }
          }
          return {
            oldFileName,
            newFileName,
            oldHeader,
            newHeader,
            hunks
          };
        }
      }
      function formatPatch(patch, headerOptions) {
        if (!headerOptions) {
          headerOptions = exports.INCLUDE_HEADERS;
        }
        if (Array.isArray(patch)) {
          if (patch.length > 1 && !headerOptions.includeFileHeaders) {
            throw new Error("Cannot omit file headers on a multi-file patch. (The result would be unparseable; how would a tool trying to apply the patch know which changes are to which file?)");
          }
          return patch.map(function(p) {
            return formatPatch(p, headerOptions);
          }).join("\n");
        }
        var ret = [];
        if (headerOptions.includeIndex && patch.oldFileName == patch.newFileName) {
          ret.push("Index: " + patch.oldFileName);
        }
        if (headerOptions.includeUnderline) {
          ret.push("===================================================================");
        }
        if (headerOptions.includeFileHeaders) {
          ret.push("--- " + patch.oldFileName + (typeof patch.oldHeader === "undefined" ? "" : "	" + patch.oldHeader));
          ret.push("+++ " + patch.newFileName + (typeof patch.newHeader === "undefined" ? "" : "	" + patch.newHeader));
        }
        for (var i = 0; i < patch.hunks.length; i++) {
          var hunk = patch.hunks[i];
          if (hunk.oldLines === 0) {
            hunk.oldStart -= 1;
          }
          if (hunk.newLines === 0) {
            hunk.newStart -= 1;
          }
          ret.push("@@ -" + hunk.oldStart + "," + hunk.oldLines + " +" + hunk.newStart + "," + hunk.newLines + " @@");
          for (var _i = 0, _a = hunk.lines; _i < _a.length; _i++) {
            var line = _a[_i];
            ret.push(line);
          }
        }
        return ret.join("\n") + "\n";
      }
      function createTwoFilesPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options) {
        if (typeof options === "function") {
          options = { callback: options };
        }
        if (!(options === null || options === void 0 ? void 0 : options.callback)) {
          var patchObj = structuredPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options);
          if (!patchObj) {
            return;
          }
          return formatPatch(patchObj, options === null || options === void 0 ? void 0 : options.headerOptions);
        } else {
          var callback_2 = options.callback;
          structuredPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, __assign(__assign({}, options), { callback: function(patchObj2) {
            if (!patchObj2) {
              callback_2(void 0);
            } else {
              callback_2(formatPatch(patchObj2, options.headerOptions));
            }
          } }));
        }
      }
      function createPatch(fileName, oldStr, newStr, oldHeader, newHeader, options) {
        return createTwoFilesPatch(fileName, fileName, oldStr, newStr, oldHeader, newHeader, options);
      }
      function splitLines(text) {
        var hasTrailingNl = text.endsWith("\n");
        var result = text.split("\n").map(function(line) {
          return line + "\n";
        });
        if (hasTrailingNl) {
          result.pop();
        } else {
          result.push(result.pop().slice(0, -1));
        }
        return result;
      }
    }
  });

  // node_modules/diff/libcjs/convert/dmp.js
  var require_dmp = __commonJS({
    "node_modules/diff/libcjs/convert/dmp.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.convertChangesToDMP = convertChangesToDMP;
      function convertChangesToDMP(changes) {
        var ret = [];
        var change, operation;
        for (var i = 0; i < changes.length; i++) {
          change = changes[i];
          if (change.added) {
            operation = 1;
          } else if (change.removed) {
            operation = -1;
          } else {
            operation = 0;
          }
          ret.push([operation, change.value]);
        }
        return ret;
      }
    }
  });

  // node_modules/diff/libcjs/convert/xml.js
  var require_xml2 = __commonJS({
    "node_modules/diff/libcjs/convert/xml.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.convertChangesToXML = convertChangesToXML;
      function convertChangesToXML(changes) {
        var ret = [];
        for (var i = 0; i < changes.length; i++) {
          var change = changes[i];
          if (change.added) {
            ret.push("<ins>");
          } else if (change.removed) {
            ret.push("<del>");
          }
          ret.push(escapeHTML(change.value));
          if (change.added) {
            ret.push("</ins>");
          } else if (change.removed) {
            ret.push("</del>");
          }
        }
        return ret.join("");
      }
      function escapeHTML(s) {
        var n = s;
        n = n.replace(/&/g, "&amp;");
        n = n.replace(/</g, "&lt;");
        n = n.replace(/>/g, "&gt;");
        n = n.replace(/"/g, "&quot;");
        return n;
      }
    }
  });

  // node_modules/diff/libcjs/index.js
  var require_libcjs = __commonJS({
    "node_modules/diff/libcjs/index.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.canonicalize = exports.convertChangesToXML = exports.convertChangesToDMP = exports.reversePatch = exports.parsePatch = exports.applyPatches = exports.applyPatch = exports.OMIT_HEADERS = exports.FILE_HEADERS_ONLY = exports.INCLUDE_HEADERS = exports.formatPatch = exports.createPatch = exports.createTwoFilesPatch = exports.structuredPatch = exports.arrayDiff = exports.diffArrays = exports.jsonDiff = exports.diffJson = exports.cssDiff = exports.diffCss = exports.sentenceDiff = exports.diffSentences = exports.diffTrimmedLines = exports.lineDiff = exports.diffLines = exports.wordsWithSpaceDiff = exports.diffWordsWithSpace = exports.wordDiff = exports.diffWords = exports.characterDiff = exports.diffChars = exports.Diff = void 0;
      var base_js_1 = require_base();
      exports.Diff = base_js_1.default;
      var character_js_1 = require_character();
      Object.defineProperty(exports, "diffChars", { enumerable: true, get: function() {
        return character_js_1.diffChars;
      } });
      Object.defineProperty(exports, "characterDiff", { enumerable: true, get: function() {
        return character_js_1.characterDiff;
      } });
      var word_js_1 = require_word();
      Object.defineProperty(exports, "diffWords", { enumerable: true, get: function() {
        return word_js_1.diffWords;
      } });
      Object.defineProperty(exports, "diffWordsWithSpace", { enumerable: true, get: function() {
        return word_js_1.diffWordsWithSpace;
      } });
      Object.defineProperty(exports, "wordDiff", { enumerable: true, get: function() {
        return word_js_1.wordDiff;
      } });
      Object.defineProperty(exports, "wordsWithSpaceDiff", { enumerable: true, get: function() {
        return word_js_1.wordsWithSpaceDiff;
      } });
      var line_js_1 = require_line();
      Object.defineProperty(exports, "diffLines", { enumerable: true, get: function() {
        return line_js_1.diffLines;
      } });
      Object.defineProperty(exports, "diffTrimmedLines", { enumerable: true, get: function() {
        return line_js_1.diffTrimmedLines;
      } });
      Object.defineProperty(exports, "lineDiff", { enumerable: true, get: function() {
        return line_js_1.lineDiff;
      } });
      var sentence_js_1 = require_sentence();
      Object.defineProperty(exports, "diffSentences", { enumerable: true, get: function() {
        return sentence_js_1.diffSentences;
      } });
      Object.defineProperty(exports, "sentenceDiff", { enumerable: true, get: function() {
        return sentence_js_1.sentenceDiff;
      } });
      var css_js_1 = require_css2();
      Object.defineProperty(exports, "diffCss", { enumerable: true, get: function() {
        return css_js_1.diffCss;
      } });
      Object.defineProperty(exports, "cssDiff", { enumerable: true, get: function() {
        return css_js_1.cssDiff;
      } });
      var json_js_1 = require_json2();
      Object.defineProperty(exports, "diffJson", { enumerable: true, get: function() {
        return json_js_1.diffJson;
      } });
      Object.defineProperty(exports, "canonicalize", { enumerable: true, get: function() {
        return json_js_1.canonicalize;
      } });
      Object.defineProperty(exports, "jsonDiff", { enumerable: true, get: function() {
        return json_js_1.jsonDiff;
      } });
      var array_js_1 = require_array();
      Object.defineProperty(exports, "diffArrays", { enumerable: true, get: function() {
        return array_js_1.diffArrays;
      } });
      Object.defineProperty(exports, "arrayDiff", { enumerable: true, get: function() {
        return array_js_1.arrayDiff;
      } });
      var apply_js_1 = require_apply();
      Object.defineProperty(exports, "applyPatch", { enumerable: true, get: function() {
        return apply_js_1.applyPatch;
      } });
      Object.defineProperty(exports, "applyPatches", { enumerable: true, get: function() {
        return apply_js_1.applyPatches;
      } });
      var parse_js_1 = require_parse();
      Object.defineProperty(exports, "parsePatch", { enumerable: true, get: function() {
        return parse_js_1.parsePatch;
      } });
      var reverse_js_1 = require_reverse();
      Object.defineProperty(exports, "reversePatch", { enumerable: true, get: function() {
        return reverse_js_1.reversePatch;
      } });
      var create_js_1 = require_create();
      Object.defineProperty(exports, "structuredPatch", { enumerable: true, get: function() {
        return create_js_1.structuredPatch;
      } });
      Object.defineProperty(exports, "createTwoFilesPatch", { enumerable: true, get: function() {
        return create_js_1.createTwoFilesPatch;
      } });
      Object.defineProperty(exports, "createPatch", { enumerable: true, get: function() {
        return create_js_1.createPatch;
      } });
      Object.defineProperty(exports, "formatPatch", { enumerable: true, get: function() {
        return create_js_1.formatPatch;
      } });
      Object.defineProperty(exports, "INCLUDE_HEADERS", { enumerable: true, get: function() {
        return create_js_1.INCLUDE_HEADERS;
      } });
      Object.defineProperty(exports, "FILE_HEADERS_ONLY", { enumerable: true, get: function() {
        return create_js_1.FILE_HEADERS_ONLY;
      } });
      Object.defineProperty(exports, "OMIT_HEADERS", { enumerable: true, get: function() {
        return create_js_1.OMIT_HEADERS;
      } });
      var dmp_js_1 = require_dmp();
      Object.defineProperty(exports, "convertChangesToDMP", { enumerable: true, get: function() {
        return dmp_js_1.convertChangesToDMP;
      } });
      var xml_js_1 = require_xml2();
      Object.defineProperty(exports, "convertChangesToXML", { enumerable: true, get: function() {
        return xml_js_1.convertChangesToXML;
      } });
    }
  });

  // node_modules/diff2html/lib/rematch.js
  var require_rematch = __commonJS({
    "node_modules/diff2html/lib/rematch.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.levenshtein = levenshtein;
      exports.newDistanceFn = newDistanceFn;
      exports.newMatcherFn = newMatcherFn;
      function levenshtein(a, b) {
        if (a.length === 0) {
          return b.length;
        }
        if (b.length === 0) {
          return a.length;
        }
        const matrix = [];
        let i;
        for (i = 0; i <= b.length; i++) {
          matrix[i] = [i];
        }
        let j;
        for (j = 0; j <= a.length; j++) {
          matrix[0][j] = j;
        }
        for (i = 1; i <= b.length; i++) {
          for (j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
              matrix[i][j] = matrix[i - 1][j - 1];
            } else {
              matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
            }
          }
        }
        return matrix[b.length][a.length];
      }
      function newDistanceFn(str) {
        return (x, y) => {
          const xValue = str(x).trim();
          const yValue = str(y).trim();
          const lev = levenshtein(xValue, yValue);
          return lev / (xValue.length + yValue.length);
        };
      }
      function newMatcherFn(distance) {
        function findBestMatch(a, b, cache = /* @__PURE__ */ new Map()) {
          let bestMatchDist = Infinity;
          let bestMatch;
          for (let i = 0; i < a.length; ++i) {
            for (let j = 0; j < b.length; ++j) {
              const cacheKey = JSON.stringify([a[i], b[j]]);
              let md;
              if (!(cache.has(cacheKey) && (md = cache.get(cacheKey)))) {
                md = distance(a[i], b[j]);
                cache.set(cacheKey, md);
              }
              if (md < bestMatchDist) {
                bestMatchDist = md;
                bestMatch = { indexA: i, indexB: j, score: bestMatchDist };
              }
            }
          }
          return bestMatch;
        }
        function group(a, b, level = 0, cache = /* @__PURE__ */ new Map()) {
          const bm = findBestMatch(a, b, cache);
          if (!bm || a.length + b.length < 3) {
            return [[a, b]];
          }
          const a1 = a.slice(0, bm.indexA);
          const b1 = b.slice(0, bm.indexB);
          const aMatch = [a[bm.indexA]];
          const bMatch = [b[bm.indexB]];
          const tailA = bm.indexA + 1;
          const tailB = bm.indexB + 1;
          const a2 = a.slice(tailA);
          const b2 = b.slice(tailB);
          const group1 = group(a1, b1, level + 1, cache);
          const groupMatch = group(aMatch, bMatch, level + 1, cache);
          const group2 = group(a2, b2, level + 1, cache);
          let result = groupMatch;
          if (bm.indexA > 0 || bm.indexB > 0) {
            result = group1.concat(result);
          }
          if (a.length > tailA || b.length > tailB) {
            result = result.concat(group2);
          }
          return result;
        }
        return group;
      }
    }
  });

  // node_modules/diff2html/lib/render-utils.js
  var require_render_utils = __commonJS({
    "node_modules/diff2html/lib/render-utils.js"(exports) {
      "use strict";
      var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      }) : (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        o[k2] = m[k];
      }));
      var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }) : function(o, v) {
        o["default"] = v;
      });
      var __importStar = exports && exports.__importStar || /* @__PURE__ */ (function() {
        var ownKeys = function(o) {
          ownKeys = Object.getOwnPropertyNames || function(o2) {
            var ar = [];
            for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
            return ar;
          };
          return ownKeys(o);
        };
        return function(mod) {
          if (mod && mod.__esModule) return mod;
          var result = {};
          if (mod != null) {
            for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
          }
          __setModuleDefault(result, mod);
          return result;
        };
      })();
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.defaultRenderConfig = exports.CSSLineClass = void 0;
      exports.toCSSClass = toCSSClass;
      exports.colorSchemeToCss = colorSchemeToCss;
      exports.escapeForHtml = escapeForHtml;
      exports.deconstructLine = deconstructLine;
      exports.filenameDiff = filenameDiff;
      exports.getHtmlId = getHtmlId;
      exports.getFileIcon = getFileIcon;
      exports.diffHighlight = diffHighlight;
      var jsDiff = __importStar(require_libcjs());
      var utils_1 = require_utils();
      var rematch = __importStar(require_rematch());
      var types_1 = require_types();
      exports.CSSLineClass = {
        INSERTS: "d2h-ins",
        DELETES: "d2h-del",
        CONTEXT: "d2h-cntx",
        INFO: "d2h-info",
        INSERT_CHANGES: "d2h-ins d2h-change",
        DELETE_CHANGES: "d2h-del d2h-change"
      };
      exports.defaultRenderConfig = {
        matching: types_1.LineMatchingType.NONE,
        matchWordsThreshold: 0.25,
        maxLineLengthHighlight: 1e4,
        diffStyle: types_1.DiffStyleType.WORD,
        colorScheme: types_1.ColorSchemeType.LIGHT
      };
      var separator = "/";
      var distance = rematch.newDistanceFn((change) => change.value);
      var matcher = rematch.newMatcherFn(distance);
      function isDevNullName(name) {
        return name.indexOf("dev/null") !== -1;
      }
      function removeInsElements(line) {
        return line.replace(/(<ins[^>]*>((.|\n)*?)<\/ins>)/g, "");
      }
      function removeDelElements(line) {
        return line.replace(/(<del[^>]*>((.|\n)*?)<\/del>)/g, "");
      }
      function toCSSClass(lineType) {
        switch (lineType) {
          case types_1.LineType.CONTEXT:
            return exports.CSSLineClass.CONTEXT;
          case types_1.LineType.INSERT:
            return exports.CSSLineClass.INSERTS;
          case types_1.LineType.DELETE:
            return exports.CSSLineClass.DELETES;
        }
      }
      function colorSchemeToCss(colorScheme) {
        switch (colorScheme) {
          case types_1.ColorSchemeType.DARK:
            return "d2h-dark-color-scheme";
          case types_1.ColorSchemeType.AUTO:
            return "d2h-auto-color-scheme";
          case types_1.ColorSchemeType.LIGHT:
          default:
            return "d2h-light-color-scheme";
        }
      }
      function prefixLength(isCombined) {
        return isCombined ? 2 : 1;
      }
      function escapeForHtml(str) {
        return str.slice(0).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;");
      }
      function deconstructLine(line, isCombined, escape = true) {
        const indexToSplit = prefixLength(isCombined);
        return {
          prefix: line.substring(0, indexToSplit),
          content: escape ? escapeForHtml(line.substring(indexToSplit)) : line.substring(indexToSplit)
        };
      }
      function filenameDiff(file) {
        const oldFilename = (0, utils_1.unifyPath)(file.oldName);
        const newFilename = (0, utils_1.unifyPath)(file.newName);
        if (oldFilename !== newFilename && !isDevNullName(oldFilename) && !isDevNullName(newFilename)) {
          const prefixPaths = [];
          const suffixPaths = [];
          const oldFilenameParts = oldFilename.split(separator);
          const newFilenameParts = newFilename.split(separator);
          const oldFilenamePartsSize = oldFilenameParts.length;
          const newFilenamePartsSize = newFilenameParts.length;
          let i = 0;
          let j = oldFilenamePartsSize - 1;
          let k = newFilenamePartsSize - 1;
          while (i < j && i < k) {
            if (oldFilenameParts[i] === newFilenameParts[i]) {
              prefixPaths.push(newFilenameParts[i]);
              i += 1;
            } else {
              break;
            }
          }
          while (j > i && k > i) {
            if (oldFilenameParts[j] === newFilenameParts[k]) {
              suffixPaths.unshift(newFilenameParts[k]);
              j -= 1;
              k -= 1;
            } else {
              break;
            }
          }
          const finalPrefix = prefixPaths.join(separator);
          const finalSuffix = suffixPaths.join(separator);
          const oldRemainingPath = oldFilenameParts.slice(i, j + 1).join(separator);
          const newRemainingPath = newFilenameParts.slice(i, k + 1).join(separator);
          if (finalPrefix.length && finalSuffix.length) {
            return finalPrefix + separator + "{" + oldRemainingPath + " \u2192 " + newRemainingPath + "}" + separator + finalSuffix;
          } else if (finalPrefix.length) {
            return finalPrefix + separator + "{" + oldRemainingPath + " \u2192 " + newRemainingPath + "}";
          } else if (finalSuffix.length) {
            return "{" + oldRemainingPath + " \u2192 " + newRemainingPath + "}" + separator + finalSuffix;
          }
          return oldFilename + " \u2192 " + newFilename;
        } else if (!isDevNullName(newFilename)) {
          return newFilename;
        } else {
          return oldFilename;
        }
      }
      function getHtmlId(file) {
        return `d2h-${(0, utils_1.hashCode)(filenameDiff(file)).toString().slice(-6)}`;
      }
      function getFileIcon(file) {
        let templateName = "file-changed";
        if (file.isRename) {
          templateName = "file-renamed";
        } else if (file.isCopy) {
          templateName = "file-renamed";
        } else if (file.isNew) {
          templateName = "file-added";
        } else if (file.isDeleted) {
          templateName = "file-deleted";
        } else if (file.newName !== file.oldName) {
          templateName = "file-renamed";
        }
        return templateName;
      }
      function diffHighlight(diffLine1, diffLine2, isCombined, config = {}) {
        const { matching, maxLineLengthHighlight, matchWordsThreshold, diffStyle } = Object.assign(Object.assign({}, exports.defaultRenderConfig), config);
        const line1 = deconstructLine(diffLine1, isCombined, false);
        const line2 = deconstructLine(diffLine2, isCombined, false);
        if (line1.content.length > maxLineLengthHighlight || line2.content.length > maxLineLengthHighlight) {
          return {
            oldLine: {
              prefix: line1.prefix,
              content: escapeForHtml(line1.content)
            },
            newLine: {
              prefix: line2.prefix,
              content: escapeForHtml(line2.content)
            }
          };
        }
        const diff = diffStyle === "char" ? jsDiff.diffChars(line1.content, line2.content) : jsDiff.diffWordsWithSpace(line1.content, line2.content);
        const changedWords = [];
        if (diffStyle === "word" && matching === "words") {
          const removed = diff.filter((element) => element.removed);
          const added = diff.filter((element) => element.added);
          const chunks = matcher(added, removed);
          chunks.forEach((chunk) => {
            if (chunk[0].length === 1 && chunk[1].length === 1) {
              const dist = distance(chunk[0][0], chunk[1][0]);
              if (dist < matchWordsThreshold) {
                changedWords.push(chunk[0][0]);
                changedWords.push(chunk[1][0]);
              }
            }
          });
        }
        const highlightedLine = diff.reduce((highlightedLine2, part) => {
          const elemType = part.added ? "ins" : part.removed ? "del" : null;
          const addClass = changedWords.indexOf(part) > -1 ? ' class="d2h-change"' : "";
          const escapedValue = escapeForHtml(part.value);
          return elemType !== null ? `${highlightedLine2}<${elemType}${addClass}>${escapedValue}</${elemType}>` : `${highlightedLine2}${escapedValue}`;
        }, "");
        return {
          oldLine: {
            prefix: line1.prefix,
            content: removeInsElements(highlightedLine)
          },
          newLine: {
            prefix: line2.prefix,
            content: removeDelElements(highlightedLine)
          }
        };
      }
    }
  });

  // node_modules/diff2html/lib/file-list-renderer.js
  var require_file_list_renderer = __commonJS({
    "node_modules/diff2html/lib/file-list-renderer.js"(exports) {
      "use strict";
      var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      }) : (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        o[k2] = m[k];
      }));
      var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }) : function(o, v) {
        o["default"] = v;
      });
      var __importStar = exports && exports.__importStar || /* @__PURE__ */ (function() {
        var ownKeys = function(o) {
          ownKeys = Object.getOwnPropertyNames || function(o2) {
            var ar = [];
            for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
            return ar;
          };
          return ownKeys(o);
        };
        return function(mod) {
          if (mod && mod.__esModule) return mod;
          var result = {};
          if (mod != null) {
            for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
          }
          __setModuleDefault(result, mod);
          return result;
        };
      })();
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.FileListRenderer = exports.defaultFileListRendererConfig = void 0;
      var renderUtils = __importStar(require_render_utils());
      var baseTemplatesPath = "file-summary";
      var iconsBaseTemplatesPath = "icon";
      exports.defaultFileListRendererConfig = {
        colorScheme: renderUtils.defaultRenderConfig.colorScheme
      };
      var FileListRenderer = class {
        constructor(hoganUtils, config = {}) {
          this.hoganUtils = hoganUtils;
          this.config = Object.assign(Object.assign({}, exports.defaultFileListRendererConfig), config);
        }
        render(diffFiles) {
          const files = diffFiles.map((file) => this.hoganUtils.render(baseTemplatesPath, "line", {
            fileHtmlId: renderUtils.getHtmlId(file),
            oldName: file.oldName,
            newName: file.newName,
            fileName: renderUtils.filenameDiff(file),
            deletedLines: "-" + file.deletedLines,
            addedLines: "+" + file.addedLines
          }, {
            fileIcon: this.hoganUtils.template(iconsBaseTemplatesPath, renderUtils.getFileIcon(file))
          })).join("\n");
          return this.hoganUtils.render(baseTemplatesPath, "wrapper", {
            colorScheme: renderUtils.colorSchemeToCss(this.config.colorScheme),
            filesNumber: diffFiles.length,
            files
          });
        }
      };
      exports.FileListRenderer = FileListRenderer;
    }
  });

  // node_modules/diff2html/lib/line-by-line-renderer.js
  var require_line_by_line_renderer = __commonJS({
    "node_modules/diff2html/lib/line-by-line-renderer.js"(exports) {
      "use strict";
      var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      }) : (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        o[k2] = m[k];
      }));
      var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }) : function(o, v) {
        o["default"] = v;
      });
      var __importStar = exports && exports.__importStar || /* @__PURE__ */ (function() {
        var ownKeys = function(o) {
          ownKeys = Object.getOwnPropertyNames || function(o2) {
            var ar = [];
            for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
            return ar;
          };
          return ownKeys(o);
        };
        return function(mod) {
          if (mod && mod.__esModule) return mod;
          var result = {};
          if (mod != null) {
            for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
          }
          __setModuleDefault(result, mod);
          return result;
        };
      })();
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.defaultLineByLineRendererConfig = void 0;
      var Rematch = __importStar(require_rematch());
      var renderUtils = __importStar(require_render_utils());
      var types_1 = require_types();
      var utils_1 = require_utils();
      exports.defaultLineByLineRendererConfig = Object.assign(Object.assign({}, renderUtils.defaultRenderConfig), { renderNothingWhenEmpty: false, matchingMaxComparisons: 2500, maxLineSizeInBlockForComparison: 200 });
      var genericTemplatesPath = "generic";
      var baseTemplatesPath = "line-by-line";
      var iconsBaseTemplatesPath = "icon";
      var tagsBaseTemplatesPath = "tag";
      var LineByLineRenderer = class {
        constructor(hoganUtils, config = {}) {
          this.hoganUtils = hoganUtils;
          this.config = Object.assign(Object.assign({}, exports.defaultLineByLineRendererConfig), config);
        }
        render(diffFiles) {
          const diffsHtml = diffFiles.map((file) => {
            let diffs;
            if (file.blocks.length) {
              diffs = this.generateFileHtml(file);
            } else {
              diffs = this.generateEmptyDiff();
            }
            return this.makeFileDiffHtml(file, diffs);
          }).join("\n");
          return this.hoganUtils.render(genericTemplatesPath, "wrapper", {
            colorScheme: renderUtils.colorSchemeToCss(this.config.colorScheme),
            content: diffsHtml
          });
        }
        makeFileDiffHtml(file, diffs) {
          if (this.config.renderNothingWhenEmpty && Array.isArray(file.blocks) && file.blocks.length === 0)
            return "";
          const fileDiffTemplate = this.hoganUtils.template(baseTemplatesPath, "file-diff");
          const filePathTemplate = this.hoganUtils.template(genericTemplatesPath, "file-path");
          const fileIconTemplate = this.hoganUtils.template(iconsBaseTemplatesPath, "file");
          const fileTagTemplate = this.hoganUtils.template(tagsBaseTemplatesPath, renderUtils.getFileIcon(file));
          return fileDiffTemplate.render({
            file,
            fileHtmlId: renderUtils.getHtmlId(file),
            diffs,
            filePath: filePathTemplate.render({
              fileDiffName: renderUtils.filenameDiff(file)
            }, {
              fileIcon: fileIconTemplate,
              fileTag: fileTagTemplate
            })
          });
        }
        generateEmptyDiff() {
          return this.hoganUtils.render(genericTemplatesPath, "empty-diff", {
            contentClass: "d2h-code-line",
            CSSLineClass: renderUtils.CSSLineClass
          });
        }
        generateFileHtml(file) {
          const matcher = Rematch.newMatcherFn(Rematch.newDistanceFn((e) => renderUtils.deconstructLine(e.content, file.isCombined).content));
          return file.blocks.map((block) => {
            let lines = this.hoganUtils.render(genericTemplatesPath, "block-header", {
              CSSLineClass: renderUtils.CSSLineClass,
              blockHeader: file.isTooBig ? block.header : renderUtils.escapeForHtml(block.header),
              lineClass: "d2h-code-linenumber",
              contentClass: "d2h-code-line"
            });
            this.applyLineGroupping(block).forEach(([contextLines, oldLines, newLines]) => {
              if (oldLines.length && newLines.length && !contextLines.length) {
                this.applyRematchMatching(oldLines, newLines, matcher).map(([oldLines2, newLines2]) => {
                  const { left, right } = this.processChangedLines(file, file.isCombined, oldLines2, newLines2);
                  lines += left;
                  lines += right;
                });
              } else if (contextLines.length) {
                contextLines.forEach((line) => {
                  const { prefix, content } = renderUtils.deconstructLine(line.content, file.isCombined);
                  lines += this.generateSingleLineHtml(file, {
                    type: renderUtils.CSSLineClass.CONTEXT,
                    prefix,
                    content,
                    oldNumber: line.oldNumber,
                    newNumber: line.newNumber
                  });
                });
              } else if (oldLines.length || newLines.length) {
                const { left, right } = this.processChangedLines(file, file.isCombined, oldLines, newLines);
                lines += left;
                lines += right;
              } else {
                console.error("Unknown state reached while processing groups of lines", contextLines, oldLines, newLines);
              }
            });
            return lines;
          }).join("\n");
        }
        applyLineGroupping(block) {
          const blockLinesGroups = [];
          let oldLines = [];
          let newLines = [];
          for (let i = 0; i < block.lines.length; i++) {
            const diffLine = block.lines[i];
            if (diffLine.type !== types_1.LineType.INSERT && newLines.length || diffLine.type === types_1.LineType.CONTEXT && oldLines.length > 0) {
              blockLinesGroups.push([[], oldLines, newLines]);
              oldLines = [];
              newLines = [];
            }
            if (diffLine.type === types_1.LineType.CONTEXT) {
              blockLinesGroups.push([[diffLine], [], []]);
            } else if (diffLine.type === types_1.LineType.INSERT && oldLines.length === 0) {
              blockLinesGroups.push([[], [], [diffLine]]);
            } else if (diffLine.type === types_1.LineType.INSERT && oldLines.length > 0) {
              newLines.push(diffLine);
            } else if (diffLine.type === types_1.LineType.DELETE) {
              oldLines.push(diffLine);
            }
          }
          if (oldLines.length || newLines.length) {
            blockLinesGroups.push([[], oldLines, newLines]);
            oldLines = [];
            newLines = [];
          }
          return blockLinesGroups;
        }
        applyRematchMatching(oldLines, newLines, matcher) {
          const comparisons = oldLines.length * newLines.length;
          const maxLineSizeInBlock = (0, utils_1.max)(oldLines.concat(newLines).map((elem) => elem.content.length));
          const doMatching = comparisons < this.config.matchingMaxComparisons && maxLineSizeInBlock < this.config.maxLineSizeInBlockForComparison && (this.config.matching === "lines" || this.config.matching === "words");
          return doMatching ? matcher(oldLines, newLines) : [[oldLines, newLines]];
        }
        processChangedLines(file, isCombined, oldLines, newLines) {
          const fileHtml = {
            right: "",
            left: ""
          };
          const maxLinesNumber = Math.max(oldLines.length, newLines.length);
          for (let i = 0; i < maxLinesNumber; i++) {
            const oldLine = oldLines[i];
            const newLine = newLines[i];
            const diff = oldLine !== void 0 && newLine !== void 0 ? renderUtils.diffHighlight(oldLine.content, newLine.content, isCombined, this.config) : void 0;
            const preparedOldLine = oldLine !== void 0 && oldLine.oldNumber !== void 0 ? Object.assign(Object.assign({}, diff !== void 0 ? {
              prefix: diff.oldLine.prefix,
              content: diff.oldLine.content,
              type: renderUtils.CSSLineClass.DELETE_CHANGES
            } : Object.assign(Object.assign({}, renderUtils.deconstructLine(oldLine.content, isCombined)), { type: renderUtils.toCSSClass(oldLine.type) })), { oldNumber: oldLine.oldNumber, newNumber: oldLine.newNumber }) : void 0;
            const preparedNewLine = newLine !== void 0 && newLine.newNumber !== void 0 ? Object.assign(Object.assign({}, diff !== void 0 ? {
              prefix: diff.newLine.prefix,
              content: diff.newLine.content,
              type: renderUtils.CSSLineClass.INSERT_CHANGES
            } : Object.assign(Object.assign({}, renderUtils.deconstructLine(newLine.content, isCombined)), { type: renderUtils.toCSSClass(newLine.type) })), { oldNumber: newLine.oldNumber, newNumber: newLine.newNumber }) : void 0;
            const { left, right } = this.generateLineHtml(file, preparedOldLine, preparedNewLine);
            fileHtml.left += left;
            fileHtml.right += right;
          }
          return fileHtml;
        }
        generateLineHtml(file, oldLine, newLine) {
          return {
            left: this.generateSingleLineHtml(file, oldLine),
            right: this.generateSingleLineHtml(file, newLine)
          };
        }
        generateSingleLineHtml(file, line) {
          if (line === void 0)
            return "";
          const lineNumberHtml = this.hoganUtils.render(baseTemplatesPath, "numbers", {
            oldNumber: line.oldNumber || "",
            newNumber: line.newNumber || ""
          });
          return this.hoganUtils.render(genericTemplatesPath, "line", {
            type: line.type,
            lineClass: "d2h-code-linenumber",
            contentClass: "d2h-code-line",
            prefix: line.prefix === " " ? "&nbsp;" : line.prefix,
            content: line.content,
            lineNumber: lineNumberHtml,
            line,
            file
          });
        }
      };
      exports.default = LineByLineRenderer;
    }
  });

  // node_modules/diff2html/lib/side-by-side-renderer.js
  var require_side_by_side_renderer = __commonJS({
    "node_modules/diff2html/lib/side-by-side-renderer.js"(exports) {
      "use strict";
      var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      }) : (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        o[k2] = m[k];
      }));
      var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }) : function(o, v) {
        o["default"] = v;
      });
      var __importStar = exports && exports.__importStar || /* @__PURE__ */ (function() {
        var ownKeys = function(o) {
          ownKeys = Object.getOwnPropertyNames || function(o2) {
            var ar = [];
            for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
            return ar;
          };
          return ownKeys(o);
        };
        return function(mod) {
          if (mod && mod.__esModule) return mod;
          var result = {};
          if (mod != null) {
            for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
          }
          __setModuleDefault(result, mod);
          return result;
        };
      })();
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.defaultSideBySideRendererConfig = void 0;
      var Rematch = __importStar(require_rematch());
      var renderUtils = __importStar(require_render_utils());
      var types_1 = require_types();
      var utils_1 = require_utils();
      exports.defaultSideBySideRendererConfig = Object.assign(Object.assign({}, renderUtils.defaultRenderConfig), { renderNothingWhenEmpty: false, matchingMaxComparisons: 2500, maxLineSizeInBlockForComparison: 200 });
      var genericTemplatesPath = "generic";
      var baseTemplatesPath = "side-by-side";
      var iconsBaseTemplatesPath = "icon";
      var tagsBaseTemplatesPath = "tag";
      var SideBySideRenderer = class {
        constructor(hoganUtils, config = {}) {
          this.hoganUtils = hoganUtils;
          this.config = Object.assign(Object.assign({}, exports.defaultSideBySideRendererConfig), config);
        }
        render(diffFiles) {
          const diffsHtml = diffFiles.map((file) => {
            let diffs;
            if (file.blocks.length) {
              diffs = this.generateFileHtml(file);
            } else {
              diffs = this.generateEmptyDiff();
            }
            return this.makeFileDiffHtml(file, diffs);
          }).join("\n");
          return this.hoganUtils.render(genericTemplatesPath, "wrapper", {
            colorScheme: renderUtils.colorSchemeToCss(this.config.colorScheme),
            content: diffsHtml
          });
        }
        makeFileDiffHtml(file, diffs) {
          if (this.config.renderNothingWhenEmpty && Array.isArray(file.blocks) && file.blocks.length === 0)
            return "";
          const fileDiffTemplate = this.hoganUtils.template(baseTemplatesPath, "file-diff");
          const filePathTemplate = this.hoganUtils.template(genericTemplatesPath, "file-path");
          const fileIconTemplate = this.hoganUtils.template(iconsBaseTemplatesPath, "file");
          const fileTagTemplate = this.hoganUtils.template(tagsBaseTemplatesPath, renderUtils.getFileIcon(file));
          return fileDiffTemplate.render({
            file,
            fileHtmlId: renderUtils.getHtmlId(file),
            diffs,
            filePath: filePathTemplate.render({
              fileDiffName: renderUtils.filenameDiff(file)
            }, {
              fileIcon: fileIconTemplate,
              fileTag: fileTagTemplate
            })
          });
        }
        generateEmptyDiff() {
          return {
            right: "",
            left: this.hoganUtils.render(genericTemplatesPath, "empty-diff", {
              contentClass: "d2h-code-side-line",
              CSSLineClass: renderUtils.CSSLineClass
            })
          };
        }
        generateFileHtml(file) {
          const matcher = Rematch.newMatcherFn(Rematch.newDistanceFn((e) => renderUtils.deconstructLine(e.content, file.isCombined).content));
          return file.blocks.map((block) => {
            const fileHtml = {
              left: this.makeHeaderHtml(block.header, file),
              right: this.makeHeaderHtml("")
            };
            this.applyLineGroupping(block).forEach(([contextLines, oldLines, newLines]) => {
              if (oldLines.length && newLines.length && !contextLines.length) {
                this.applyRematchMatching(oldLines, newLines, matcher).map(([oldLines2, newLines2]) => {
                  const { left, right } = this.processChangedLines(file.isCombined, oldLines2, newLines2);
                  fileHtml.left += left;
                  fileHtml.right += right;
                });
              } else if (contextLines.length) {
                contextLines.forEach((line) => {
                  const { prefix, content } = renderUtils.deconstructLine(line.content, file.isCombined);
                  const { left, right } = this.generateLineHtml({
                    type: renderUtils.CSSLineClass.CONTEXT,
                    prefix,
                    content,
                    number: line.oldNumber
                  }, {
                    type: renderUtils.CSSLineClass.CONTEXT,
                    prefix,
                    content,
                    number: line.newNumber
                  });
                  fileHtml.left += left;
                  fileHtml.right += right;
                });
              } else if (oldLines.length || newLines.length) {
                const { left, right } = this.processChangedLines(file.isCombined, oldLines, newLines);
                fileHtml.left += left;
                fileHtml.right += right;
              } else {
                console.error("Unknown state reached while processing groups of lines", contextLines, oldLines, newLines);
              }
            });
            return fileHtml;
          }).reduce((accomulated, html) => {
            return { left: accomulated.left + html.left, right: accomulated.right + html.right };
          }, { left: "", right: "" });
        }
        applyLineGroupping(block) {
          const blockLinesGroups = [];
          let oldLines = [];
          let newLines = [];
          for (let i = 0; i < block.lines.length; i++) {
            const diffLine = block.lines[i];
            if (diffLine.type !== types_1.LineType.INSERT && newLines.length || diffLine.type === types_1.LineType.CONTEXT && oldLines.length > 0) {
              blockLinesGroups.push([[], oldLines, newLines]);
              oldLines = [];
              newLines = [];
            }
            if (diffLine.type === types_1.LineType.CONTEXT) {
              blockLinesGroups.push([[diffLine], [], []]);
            } else if (diffLine.type === types_1.LineType.INSERT && oldLines.length === 0) {
              blockLinesGroups.push([[], [], [diffLine]]);
            } else if (diffLine.type === types_1.LineType.INSERT && oldLines.length > 0) {
              newLines.push(diffLine);
            } else if (diffLine.type === types_1.LineType.DELETE) {
              oldLines.push(diffLine);
            }
          }
          if (oldLines.length || newLines.length) {
            blockLinesGroups.push([[], oldLines, newLines]);
            oldLines = [];
            newLines = [];
          }
          return blockLinesGroups;
        }
        applyRematchMatching(oldLines, newLines, matcher) {
          const comparisons = oldLines.length * newLines.length;
          const maxLineSizeInBlock = (0, utils_1.max)(oldLines.concat(newLines).map((elem) => elem.content.length));
          const doMatching = comparisons < this.config.matchingMaxComparisons && maxLineSizeInBlock < this.config.maxLineSizeInBlockForComparison && (this.config.matching === "lines" || this.config.matching === "words");
          return doMatching ? matcher(oldLines, newLines) : [[oldLines, newLines]];
        }
        makeHeaderHtml(blockHeader, file) {
          return this.hoganUtils.render(genericTemplatesPath, "block-header", {
            CSSLineClass: renderUtils.CSSLineClass,
            blockHeader: (file === null || file === void 0 ? void 0 : file.isTooBig) ? blockHeader : renderUtils.escapeForHtml(blockHeader),
            lineClass: "d2h-code-side-linenumber",
            contentClass: "d2h-code-side-line"
          });
        }
        processChangedLines(isCombined, oldLines, newLines) {
          const fileHtml = {
            right: "",
            left: ""
          };
          const maxLinesNumber = Math.max(oldLines.length, newLines.length);
          for (let i = 0; i < maxLinesNumber; i++) {
            const oldLine = oldLines[i];
            const newLine = newLines[i];
            const diff = oldLine !== void 0 && newLine !== void 0 ? renderUtils.diffHighlight(oldLine.content, newLine.content, isCombined, this.config) : void 0;
            const preparedOldLine = oldLine !== void 0 && oldLine.oldNumber !== void 0 ? Object.assign(Object.assign({}, diff !== void 0 ? {
              prefix: diff.oldLine.prefix,
              content: diff.oldLine.content,
              type: renderUtils.CSSLineClass.DELETE_CHANGES
            } : Object.assign(Object.assign({}, renderUtils.deconstructLine(oldLine.content, isCombined)), { type: renderUtils.toCSSClass(oldLine.type) })), { number: oldLine.oldNumber }) : void 0;
            const preparedNewLine = newLine !== void 0 && newLine.newNumber !== void 0 ? Object.assign(Object.assign({}, diff !== void 0 ? {
              prefix: diff.newLine.prefix,
              content: diff.newLine.content,
              type: renderUtils.CSSLineClass.INSERT_CHANGES
            } : Object.assign(Object.assign({}, renderUtils.deconstructLine(newLine.content, isCombined)), { type: renderUtils.toCSSClass(newLine.type) })), { number: newLine.newNumber }) : void 0;
            const { left, right } = this.generateLineHtml(preparedOldLine, preparedNewLine);
            fileHtml.left += left;
            fileHtml.right += right;
          }
          return fileHtml;
        }
        generateLineHtml(oldLine, newLine) {
          return {
            left: this.generateSingleHtml(oldLine),
            right: this.generateSingleHtml(newLine)
          };
        }
        generateSingleHtml(line) {
          const lineClass = "d2h-code-side-linenumber";
          const contentClass = "d2h-code-side-line";
          return this.hoganUtils.render(genericTemplatesPath, "line", {
            type: (line === null || line === void 0 ? void 0 : line.type) || `${renderUtils.CSSLineClass.CONTEXT} d2h-emptyplaceholder`,
            lineClass: line !== void 0 ? lineClass : `${lineClass} d2h-code-side-emptyplaceholder`,
            contentClass: line !== void 0 ? contentClass : `${contentClass} d2h-code-side-emptyplaceholder`,
            prefix: (line === null || line === void 0 ? void 0 : line.prefix) === " " ? "&nbsp;" : line === null || line === void 0 ? void 0 : line.prefix,
            content: line === null || line === void 0 ? void 0 : line.content,
            lineNumber: line === null || line === void 0 ? void 0 : line.number
          });
        }
      };
      exports.default = SideBySideRenderer;
    }
  });

  // node_modules/@profoundlogic/hogan/lib/compiler.js
  var require_compiler = __commonJS({
    "node_modules/@profoundlogic/hogan/lib/compiler.js"(exports) {
      (function(Hogan2) {
        var rIsWhitespace = /\S/, rQuot = /\"/g, rNewline = /\n/g, rCr = /\r/g, rSlash = /\\/g, rLineSep = /\u2028/, rParagraphSep = /\u2029/;
        Hogan2.tags = {
          "#": 1,
          "^": 2,
          "<": 3,
          "$": 4,
          "/": 5,
          "!": 6,
          ">": 7,
          "=": 8,
          "_v": 9,
          "{": 10,
          "&": 11,
          "_t": 12
        };
        Hogan2.scan = function scan(text, delimiters) {
          var len = text.length, IN_TEXT = 0, IN_TAG_TYPE = 1, IN_TAG = 2, state = IN_TEXT, tagType = null, tag = null, buf = "", tokens = [], seenTag = false, i = 0, lineStart = 0, otag = "{{", ctag = "}}";
          function addBuf() {
            if (buf.length > 0) {
              tokens.push({ tag: "_t", text: new String(buf) });
              buf = "";
            }
          }
          function lineIsWhitespace() {
            var isAllWhitespace = true;
            for (var j = lineStart; j < tokens.length; j++) {
              isAllWhitespace = Hogan2.tags[tokens[j].tag] < Hogan2.tags["_v"] || tokens[j].tag == "_t" && tokens[j].text.match(rIsWhitespace) === null;
              if (!isAllWhitespace) {
                return false;
              }
            }
            return isAllWhitespace;
          }
          function filterLine(haveSeenTag, noNewLine) {
            addBuf();
            if (haveSeenTag && lineIsWhitespace()) {
              for (var j = lineStart, next; j < tokens.length; j++) {
                if (tokens[j].text) {
                  if ((next = tokens[j + 1]) && next.tag == ">") {
                    next.indent = tokens[j].text.toString();
                  }
                  tokens.splice(j, 1);
                }
              }
            } else if (!noNewLine) {
              tokens.push({ tag: "\n" });
            }
            seenTag = false;
            lineStart = tokens.length;
          }
          function changeDelimiters(text2, index) {
            var close = "=" + ctag, closeIndex = text2.indexOf(close, index), delimiters2 = trim(
              text2.substring(text2.indexOf("=", index) + 1, closeIndex)
            ).split(" ");
            otag = delimiters2[0];
            ctag = delimiters2[delimiters2.length - 1];
            return closeIndex + close.length - 1;
          }
          if (delimiters) {
            delimiters = delimiters.split(" ");
            otag = delimiters[0];
            ctag = delimiters[1];
          }
          for (i = 0; i < len; i++) {
            if (state == IN_TEXT) {
              if (tagChange(otag, text, i)) {
                --i;
                addBuf();
                state = IN_TAG_TYPE;
              } else {
                if (text.charAt(i) == "\n") {
                  filterLine(seenTag);
                } else {
                  buf += text.charAt(i);
                }
              }
            } else if (state == IN_TAG_TYPE) {
              i += otag.length - 1;
              tag = Hogan2.tags[text.charAt(i + 1)];
              tagType = tag ? text.charAt(i + 1) : "_v";
              if (tagType == "=") {
                i = changeDelimiters(text, i);
                state = IN_TEXT;
              } else {
                if (tag) {
                  i++;
                }
                state = IN_TAG;
              }
              seenTag = i;
            } else {
              if (tagChange(ctag, text, i)) {
                tokens.push({
                  tag: tagType,
                  n: trim(buf),
                  otag,
                  ctag,
                  i: tagType == "/" ? seenTag - otag.length : i + ctag.length
                });
                buf = "";
                i += ctag.length - 1;
                state = IN_TEXT;
                if (tagType == "{") {
                  if (ctag == "}}") {
                    i++;
                  } else {
                    cleanTripleStache(tokens[tokens.length - 1]);
                  }
                }
              } else {
                buf += text.charAt(i);
              }
            }
          }
          filterLine(seenTag, true);
          return tokens;
        };
        function cleanTripleStache(token) {
          if (token.n.substr(token.n.length - 1) === "}") {
            token.n = token.n.substring(0, token.n.length - 1);
          }
        }
        function trim(s) {
          if (s.trim) {
            return s.trim();
          }
          return s.replace(/^\s*|\s*$/g, "");
        }
        function tagChange(tag, text, index) {
          if (text.charAt(index) != tag.charAt(0)) {
            return false;
          }
          for (var i = 1, l = tag.length; i < l; i++) {
            if (text.charAt(index + i) != tag.charAt(i)) {
              return false;
            }
          }
          return true;
        }
        var allowedInSuper = { "_t": true, "\n": true, "$": true, "/": true };
        function buildTree(tokens, kind, stack, customTags) {
          var instructions = [], opener = null, tail = null, token = null;
          tail = stack[stack.length - 1];
          while (tokens.length > 0) {
            token = tokens.shift();
            if (tail && tail.tag == "<" && !(token.tag in allowedInSuper)) {
              throw new Error("Illegal content in < super tag.");
            }
            if (Hogan2.tags[token.tag] <= Hogan2.tags["$"] || isOpener(token, customTags)) {
              stack.push(token);
              token.nodes = buildTree(tokens, token.tag, stack, customTags);
            } else if (token.tag == "/") {
              if (stack.length === 0) {
                throw new Error("Closing tag without opener: /" + token.n);
              }
              opener = stack.pop();
              if (token.n != opener.n && !isCloser(token.n, opener.n, customTags)) {
                throw new Error("Nesting error: " + opener.n + " vs. " + token.n);
              }
              opener.end = token.i;
              return instructions;
            } else if (token.tag == "\n") {
              token.last = tokens.length == 0 || tokens[0].tag == "\n";
            }
            instructions.push(token);
          }
          if (stack.length > 0) {
            throw new Error("missing closing tag: " + stack.pop().n);
          }
          return instructions;
        }
        function isOpener(token, tags) {
          for (var i = 0, l = tags.length; i < l; i++) {
            if (tags[i].o == token.n) {
              token.tag = "#";
              return true;
            }
          }
        }
        function isCloser(close, open, tags) {
          for (var i = 0, l = tags.length; i < l; i++) {
            if (tags[i].c == close && tags[i].o == open) {
              return true;
            }
          }
        }
        function stringifySubstitutions(obj) {
          var items = [];
          for (var key2 in obj) {
            items.push('"' + esc(key2) + '": function(c,p,t,i) {' + obj[key2] + "}");
          }
          return "{ " + items.join(",") + " }";
        }
        function stringifyPartials(codeObj) {
          var partials = [];
          for (var key2 in codeObj.partials) {
            partials.push('"' + esc(key2) + '":{name:"' + esc(codeObj.partials[key2].name) + '", ' + stringifyPartials(codeObj.partials[key2]) + "}");
          }
          return "partials: {" + partials.join(",") + "}, subs: " + stringifySubstitutions(codeObj.subs);
        }
        Hogan2.stringify = function(codeObj, text, options) {
          return "{code: function (c,p,i) { " + Hogan2.wrapMain(codeObj.code) + " }," + stringifyPartials(codeObj) + "}";
        };
        var serialNo = 0;
        Hogan2.generate = function(tree, text, options) {
          serialNo = 0;
          var context = { code: "", subs: {}, partials: {} };
          Hogan2.walk(tree, context);
          if (options.asString) {
            return this.stringify(context, text, options);
          }
          return this.makeTemplate(context, text, options);
        };
        Hogan2.wrapMain = function(code) {
          return 'var t=this;t.b(i=i||"");' + code + "return t.fl();";
        };
        Hogan2.template = Hogan2.Template;
        Hogan2.makeTemplate = function(codeObj, text, options) {
          var template = this.makePartials(codeObj);
          template.code = new Function("c", "p", "i", this.wrapMain(codeObj.code));
          return new this.template(template, text, this, options);
        };
        Hogan2.makePartials = function(codeObj) {
          var key2, template = { subs: {}, partials: codeObj.partials, name: codeObj.name };
          for (key2 in template.partials) {
            template.partials[key2] = this.makePartials(template.partials[key2]);
          }
          for (key2 in codeObj.subs) {
            template.subs[key2] = new Function("c", "p", "t", "i", codeObj.subs[key2]);
          }
          return template;
        };
        function esc(s) {
          return s.replace(rSlash, "\\\\").replace(rQuot, '\\"').replace(rNewline, "\\n").replace(rCr, "\\r").replace(rLineSep, "\\u2028").replace(rParagraphSep, "\\u2029");
        }
        function chooseMethod(s) {
          return ~s.indexOf(".") ? "d" : "f";
        }
        function createPartial(node, context) {
          var prefix = "<" + (context.prefix || "");
          var sym = prefix + node.n + serialNo++;
          context.partials[sym] = { name: node.n, partials: {} };
          context.code += 't.b(t.rp("' + esc(sym) + '",c,p,"' + (node.indent || "") + '"));';
          return sym;
        }
        Hogan2.codegen = {
          "#": function(node, context) {
            context.code += "if(t.s(t." + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,1),c,p,0,' + node.i + "," + node.end + ',"' + node.otag + " " + node.ctag + '")){t.rs(c,p,function(c,p,t){';
            Hogan2.walk(node.nodes, context);
            context.code += "});c.pop();}";
          },
          "^": function(node, context) {
            context.code += "if(!t.s(t." + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,1),c,p,1,0,0,"")){';
            Hogan2.walk(node.nodes, context);
            context.code += "};";
          },
          ">": createPartial,
          "<": function(node, context) {
            var ctx = { partials: {}, code: "", subs: {}, inPartial: true };
            Hogan2.walk(node.nodes, ctx);
            var template = context.partials[createPartial(node, context)];
            template.subs = ctx.subs;
            template.partials = ctx.partials;
          },
          "$": function(node, context) {
            var ctx = { subs: {}, code: "", partials: context.partials, prefix: node.n };
            Hogan2.walk(node.nodes, ctx);
            context.subs[node.n] = ctx.code;
            if (!context.inPartial) {
              context.code += 't.sub("' + esc(node.n) + '",c,p,i);';
            }
          },
          "\n": function(node, context) {
            context.code += write('"\\n"' + (node.last ? "" : " + i"));
          },
          "_v": function(node, context) {
            context.code += "t.b(t.v(t." + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,0)));';
          },
          "_t": function(node, context) {
            context.code += write('"' + esc(node.text) + '"');
          },
          "{": tripleStache,
          "&": tripleStache
        };
        function tripleStache(node, context) {
          context.code += "t.b(t.t(t." + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,0)));';
        }
        function write(s) {
          return "t.b(" + s + ");";
        }
        Hogan2.walk = function(nodelist, context) {
          var func;
          for (var i = 0, l = nodelist.length; i < l; i++) {
            func = Hogan2.codegen[nodelist[i].tag];
            func && func(nodelist[i], context);
          }
          return context;
        };
        Hogan2.parse = function(tokens, text, options) {
          options = options || {};
          return buildTree(tokens, "", [], options.sectionTags || []);
        };
        Hogan2.cache = {};
        Hogan2.cacheKey = function(text, options) {
          return [text, !!options.asString, !!options.disableLambda, options.delimiters, !!options.modelGet].join("||");
        };
        Hogan2.compile = function(text, options) {
          options = options || {};
          var key2 = Hogan2.cacheKey(text, options);
          var template = this.cache[key2];
          if (template) {
            var partials = template.partials;
            for (var name in partials) {
              delete partials[name].instance;
            }
            return template;
          }
          template = this.generate(this.parse(this.scan(text, options.delimiters), text, options), text, options);
          return this.cache[key2] = template;
        };
      })(typeof exports !== "undefined" ? exports : Hogan);
    }
  });

  // node_modules/@profoundlogic/hogan/lib/template.js
  var require_template = __commonJS({
    "node_modules/@profoundlogic/hogan/lib/template.js"(exports) {
      var Hogan2 = {};
      (function(Hogan3) {
        Hogan3.Template = function(codeObj, text, compiler, options) {
          codeObj = codeObj || {};
          this.r = codeObj.code || this.r;
          this.c = compiler;
          this.options = options || {};
          this.text = text || "";
          this.partials = codeObj.partials || {};
          this.subs = codeObj.subs || {};
          this.buf = "";
        };
        Hogan3.Template.prototype = {
          // render: replaced by generated code.
          r: function(context, partials, indent) {
            return "";
          },
          // variable escaping
          v: hoganEscape,
          // triple stache
          t: coerceToString,
          render: function render(context, partials, indent) {
            return this.ri([context], partials || {}, indent);
          },
          // render internal -- a hook for overrides that catches partials too
          ri: function(context, partials, indent) {
            return this.r(context, partials, indent);
          },
          // ensurePartial
          ep: function(symbol, partials) {
            var partial = this.partials[symbol];
            var template = partials[partial.name];
            if (partial.instance && partial.base == template) {
              return partial.instance;
            }
            if (typeof template == "string") {
              if (!this.c) {
                throw new Error("No compiler available.");
              }
              template = this.c.compile(template, this.options);
            }
            if (!template) {
              return null;
            }
            this.partials[symbol].base = template;
            if (partial.subs) {
              if (!partials.stackText) partials.stackText = {};
              for (key in partial.subs) {
                if (!partials.stackText[key]) {
                  partials.stackText[key] = this.activeSub !== void 0 && partials.stackText[this.activeSub] ? partials.stackText[this.activeSub] : this.text;
                }
              }
              template = createSpecializedPartial(
                template,
                partial.subs,
                partial.partials,
                this.stackSubs,
                this.stackPartials,
                partials.stackText
              );
            }
            this.partials[symbol].instance = template;
            return template;
          },
          // tries to find a partial in the current scope and render it
          rp: function(symbol, context, partials, indent) {
            var partial = this.ep(symbol, partials);
            if (!partial) {
              return "";
            }
            return partial.ri(context, partials, indent);
          },
          // render a section
          rs: function(context, partials, section) {
            var tail = context[context.length - 1];
            if (!isArray(tail)) {
              section(context, partials, this);
              return;
            }
            for (var i = 0; i < tail.length; i++) {
              context.push(tail[i]);
              section(context, partials, this);
              context.pop();
            }
          },
          // maybe start a section
          s: function(val, ctx, partials, inverted, start, end, tags) {
            var pass;
            if (isArray(val) && val.length === 0) {
              return false;
            }
            if (typeof val == "function") {
              val = this.ms(val, ctx, partials, inverted, start, end, tags);
            }
            pass = !!val;
            if (!inverted && pass && ctx) {
              ctx.push(typeof val == "object" ? val : ctx[ctx.length - 1]);
            }
            return pass;
          },
          // find values with dotted names
          d: function(key2, ctx, partials, returnFound) {
            var found, names = key2.split("."), val = this.f(names[0], ctx, partials, returnFound), doModelGet = this.options.modelGet, cx = null;
            if (key2 === "." && isArray(ctx[ctx.length - 2])) {
              val = ctx[ctx.length - 1];
            } else {
              for (var i = 1; i < names.length; i++) {
                found = findInScope(names[i], val, doModelGet);
                if (found !== void 0) {
                  cx = val;
                  val = found;
                } else {
                  val = "";
                }
              }
            }
            if (returnFound && !val) {
              return false;
            }
            if (!returnFound && typeof val == "function") {
              ctx.push(cx);
              val = this.mv(val, ctx, partials);
              ctx.pop();
            }
            return val;
          },
          // find values with normal names
          f: function(key2, ctx, partials, returnFound) {
            var val = false, v = null, found = false, doModelGet = this.options.modelGet;
            for (var i = ctx.length - 1; i >= 0; i--) {
              v = ctx[i];
              val = findInScope(key2, v, doModelGet);
              if (val !== void 0) {
                found = true;
                break;
              }
            }
            if (!found) {
              return returnFound ? false : "";
            }
            if (!returnFound && typeof val == "function") {
              val = this.mv(val, ctx, partials);
            }
            return val;
          },
          // higher order templates
          ls: function(func, cx, ctx, partials, text, tags) {
            var oldTags = this.options.delimiters;
            this.options.delimiters = tags;
            this.b(this.ct(coerceToString(func.call(cx, text, ctx)), cx, partials));
            this.options.delimiters = oldTags;
            return false;
          },
          // compile text
          ct: function(text, cx, partials) {
            if (this.options.disableLambda) {
              throw new Error("Lambda features disabled.");
            }
            return this.c.compile(text, this.options).render(cx, partials);
          },
          // template result buffering
          b: function(s) {
            this.buf += s;
          },
          fl: function() {
            var r = this.buf;
            this.buf = "";
            return r;
          },
          // method replace section
          ms: function(func, ctx, partials, inverted, start, end, tags) {
            var textSource, cx = ctx[ctx.length - 1], result = func.call(cx);
            if (typeof result == "function") {
              if (inverted) {
                return true;
              } else {
                textSource = this.activeSub && this.subsText && this.subsText[this.activeSub] ? this.subsText[this.activeSub] : this.text;
                return this.ls(result, cx, ctx, partials, textSource.substring(start, end), tags);
              }
            }
            return result;
          },
          // method replace variable
          mv: function(func, ctx, partials) {
            var cx = ctx[ctx.length - 1];
            var result = func.call(cx);
            if (typeof result == "function") {
              return this.ct(coerceToString(result.call(cx)), cx, partials);
            }
            return result;
          },
          sub: function(name, context, partials, indent) {
            var f = this.subs[name];
            if (f) {
              this.activeSub = name;
              f(context, partials, this, indent);
              this.activeSub = false;
            }
          }
        };
        function findInScope(key2, scope, doModelGet) {
          var val;
          if (scope && typeof scope == "object") {
            if (scope[key2] !== void 0) {
              val = scope[key2];
            } else if (doModelGet && scope.get && typeof scope.get == "function") {
              val = scope.get(key2);
            }
          }
          return val;
        }
        function createSpecializedPartial(instance, subs, partials, stackSubs, stackPartials, stackText) {
          function PartialTemplate() {
          }
          ;
          PartialTemplate.prototype = instance;
          function Substitutions() {
          }
          ;
          Substitutions.prototype = instance.subs;
          var key2;
          var partial = new PartialTemplate();
          partial.subs = new Substitutions();
          partial.subsText = {};
          partial.buf = "";
          stackSubs = stackSubs || {};
          partial.stackSubs = stackSubs;
          partial.subsText = stackText;
          for (key2 in subs) {
            if (!stackSubs[key2]) stackSubs[key2] = subs[key2];
          }
          for (key2 in stackSubs) {
            partial.subs[key2] = stackSubs[key2];
          }
          stackPartials = stackPartials || {};
          partial.stackPartials = stackPartials;
          for (key2 in partials) {
            if (!stackPartials[key2]) stackPartials[key2] = partials[key2];
          }
          for (key2 in stackPartials) {
            partial.partials[key2] = stackPartials[key2];
          }
          return partial;
        }
        var rAmp = /&/g, rLt = /</g, rGt = />/g, rApos = /\'/g, rQuot = /\"/g, hChars = /[&<>\"\']/;
        function coerceToString(val) {
          return String(val === null || val === void 0 ? "" : val);
        }
        function hoganEscape(str) {
          str = coerceToString(str);
          return hChars.test(str) ? str.replace(rAmp, "&amp;").replace(rLt, "&lt;").replace(rGt, "&gt;").replace(rApos, "&#39;").replace(rQuot, "&quot;") : str;
        }
        var isArray = Array.isArray || function(a) {
          return Object.prototype.toString.call(a) === "[object Array]";
        };
      })(typeof exports !== "undefined" ? exports : Hogan2);
    }
  });

  // node_modules/@profoundlogic/hogan/lib/hogan.js
  var require_hogan = __commonJS({
    "node_modules/@profoundlogic/hogan/lib/hogan.js"(exports, module) {
      var Hogan2 = require_compiler();
      Hogan2.Template = require_template().Template;
      Hogan2.template = Hogan2.Template;
      module.exports = Hogan2;
    }
  });

  // node_modules/diff2html/lib/diff2html-templates.js
  var require_diff2html_templates = __commonJS({
    "node_modules/diff2html/lib/diff2html-templates.js"(exports) {
      "use strict";
      var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      }) : (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        o[k2] = m[k];
      }));
      var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }) : function(o, v) {
        o["default"] = v;
      });
      var __importStar = exports && exports.__importStar || /* @__PURE__ */ (function() {
        var ownKeys = function(o) {
          ownKeys = Object.getOwnPropertyNames || function(o2) {
            var ar = [];
            for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
            return ar;
          };
          return ownKeys(o);
        };
        return function(mod) {
          if (mod && mod.__esModule) return mod;
          var result = {};
          if (mod != null) {
            for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
          }
          __setModuleDefault(result, mod);
          return result;
        };
      })();
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.defaultTemplates = void 0;
      var Hogan2 = __importStar(require_hogan());
      exports.defaultTemplates = {};
      exports.defaultTemplates["file-summary-line"] = new Hogan2.Template({ code: function(c, p, i) {
        var t = this;
        t.b(i = i || "");
        t.b('<li class="d2h-file-list-line">');
        t.b("\n" + i);
        t.b('    <span class="d2h-file-name-wrapper">');
        t.b("\n" + i);
        t.b(t.rp("<fileIcon0", c, p, "      "));
        t.b('      <a href="#');
        t.b(t.v(t.f("fileHtmlId", c, p, 0)));
        t.b('" class="d2h-file-name">');
        t.b(t.v(t.f("fileName", c, p, 0)));
        t.b("</a>");
        t.b("\n" + i);
        t.b('      <span class="d2h-file-stats">');
        t.b("\n" + i);
        t.b('          <span class="d2h-lines-added">');
        t.b(t.v(t.f("addedLines", c, p, 0)));
        t.b("</span>");
        t.b("\n" + i);
        t.b('          <span class="d2h-lines-deleted">');
        t.b(t.v(t.f("deletedLines", c, p, 0)));
        t.b("</span>");
        t.b("\n" + i);
        t.b("      </span>");
        t.b("\n" + i);
        t.b("    </span>");
        t.b("\n" + i);
        t.b("</li>");
        return t.fl();
      }, partials: { "<fileIcon0": { name: "fileIcon", partials: {}, subs: {} } }, subs: {} });
      exports.defaultTemplates["file-summary-wrapper"] = new Hogan2.Template({ code: function(c, p, i) {
        var t = this;
        t.b(i = i || "");
        t.b('<div class="d2h-file-list-wrapper ');
        t.b(t.v(t.f("colorScheme", c, p, 0)));
        t.b('">');
        t.b("\n" + i);
        t.b('    <div class="d2h-file-list-header">');
        t.b("\n" + i);
        t.b('        <span class="d2h-file-list-title">Files changed (');
        t.b(t.v(t.f("filesNumber", c, p, 0)));
        t.b(")</span>");
        t.b("\n" + i);
        t.b('        <a class="d2h-file-switch d2h-hide">hide</a>');
        t.b("\n" + i);
        t.b('        <a class="d2h-file-switch d2h-show">show</a>');
        t.b("\n" + i);
        t.b("    </div>");
        t.b("\n" + i);
        t.b('    <ol class="d2h-file-list">');
        t.b("\n" + i);
        t.b("    ");
        t.b(t.t(t.f("files", c, p, 0)));
        t.b("\n" + i);
        t.b("    </ol>");
        t.b("\n" + i);
        t.b("</div>");
        return t.fl();
      }, partials: {}, subs: {} });
      exports.defaultTemplates["generic-block-header"] = new Hogan2.Template({ code: function(c, p, i) {
        var t = this;
        t.b(i = i || "");
        t.b("<tr>");
        t.b("\n" + i);
        t.b('    <td class="');
        t.b(t.v(t.f("lineClass", c, p, 0)));
        t.b(" ");
        t.b(t.v(t.d("CSSLineClass.INFO", c, p, 0)));
        t.b('"></td>');
        t.b("\n" + i);
        t.b('    <td class="');
        t.b(t.v(t.d("CSSLineClass.INFO", c, p, 0)));
        t.b('">');
        t.b("\n" + i);
        t.b('        <div class="');
        t.b(t.v(t.f("contentClass", c, p, 0)));
        t.b('">');
        if (t.s(t.f("blockHeader", c, p, 1), c, p, 0, 156, 173, "{{ }}")) {
          t.rs(c, p, function(c2, p2, t2) {
            t2.b(t2.t(t2.f("blockHeader", c2, p2, 0)));
          });
          c.pop();
        }
        if (!t.s(t.f("blockHeader", c, p, 1), c, p, 1, 0, 0, "")) {
          t.b("&nbsp;");
        }
        ;
        t.b("</div>");
        t.b("\n" + i);
        t.b("    </td>");
        t.b("\n" + i);
        t.b("</tr>");
        return t.fl();
      }, partials: {}, subs: {} });
      exports.defaultTemplates["generic-empty-diff"] = new Hogan2.Template({ code: function(c, p, i) {
        var t = this;
        t.b(i = i || "");
        t.b("<tr>");
        t.b("\n" + i);
        t.b('    <td class="');
        t.b(t.v(t.d("CSSLineClass.INFO", c, p, 0)));
        t.b('">');
        t.b("\n" + i);
        t.b('        <div class="');
        t.b(t.v(t.f("contentClass", c, p, 0)));
        t.b('">');
        t.b("\n" + i);
        t.b("            File without changes");
        t.b("\n" + i);
        t.b("        </div>");
        t.b("\n" + i);
        t.b("    </td>");
        t.b("\n" + i);
        t.b("</tr>");
        return t.fl();
      }, partials: {}, subs: {} });
      exports.defaultTemplates["generic-file-path"] = new Hogan2.Template({ code: function(c, p, i) {
        var t = this;
        t.b(i = i || "");
        t.b('<span class="d2h-file-name-wrapper">');
        t.b("\n" + i);
        t.b(t.rp("<fileIcon0", c, p, "    "));
        t.b('    <span class="d2h-file-name">');
        t.b(t.v(t.f("fileDiffName", c, p, 0)));
        t.b("</span>");
        t.b("\n" + i);
        t.b(t.rp("<fileTag1", c, p, "    "));
        t.b("</span>");
        t.b("\n" + i);
        t.b('<label class="d2h-file-collapse">');
        t.b("\n" + i);
        t.b('    <input class="d2h-file-collapse-input" type="checkbox" name="viewed" value="viewed">');
        t.b("\n" + i);
        t.b("    Viewed");
        t.b("\n" + i);
        t.b("</label>");
        return t.fl();
      }, partials: { "<fileIcon0": { name: "fileIcon", partials: {}, subs: {} }, "<fileTag1": { name: "fileTag", partials: {}, subs: {} } }, subs: {} });
      exports.defaultTemplates["generic-line"] = new Hogan2.Template({ code: function(c, p, i) {
        var t = this;
        t.b(i = i || "");
        t.b("<tr>");
        t.b("\n" + i);
        t.b('    <td class="');
        t.b(t.v(t.f("lineClass", c, p, 0)));
        t.b(" ");
        t.b(t.v(t.f("type", c, p, 0)));
        t.b('">');
        t.b("\n" + i);
        t.b("      ");
        t.b(t.t(t.f("lineNumber", c, p, 0)));
        t.b("\n" + i);
        t.b("    </td>");
        t.b("\n" + i);
        t.b('    <td class="');
        t.b(t.v(t.f("type", c, p, 0)));
        t.b('">');
        t.b("\n" + i);
        t.b('        <div class="');
        t.b(t.v(t.f("contentClass", c, p, 0)));
        t.b('">');
        t.b("\n" + i);
        if (t.s(t.f("prefix", c, p, 1), c, p, 0, 162, 238, "{{ }}")) {
          t.rs(c, p, function(c2, p2, t2) {
            t2.b('            <span class="d2h-code-line-prefix">');
            t2.b(t2.t(t2.f("prefix", c2, p2, 0)));
            t2.b("</span>");
            t2.b("\n" + i);
          });
          c.pop();
        }
        if (!t.s(t.f("prefix", c, p, 1), c, p, 1, 0, 0, "")) {
          t.b('            <span class="d2h-code-line-prefix">&nbsp;</span>');
          t.b("\n" + i);
        }
        ;
        if (t.s(t.f("content", c, p, 1), c, p, 0, 371, 445, "{{ }}")) {
          t.rs(c, p, function(c2, p2, t2) {
            t2.b('            <span class="d2h-code-line-ctn">');
            t2.b(t2.t(t2.f("content", c2, p2, 0)));
            t2.b("</span>");
            t2.b("\n" + i);
          });
          c.pop();
        }
        if (!t.s(t.f("content", c, p, 1), c, p, 1, 0, 0, "")) {
          t.b('            <span class="d2h-code-line-ctn"><br></span>');
          t.b("\n" + i);
        }
        ;
        t.b("        </div>");
        t.b("\n" + i);
        t.b("    </td>");
        t.b("\n" + i);
        t.b("</tr>");
        return t.fl();
      }, partials: {}, subs: {} });
      exports.defaultTemplates["generic-wrapper"] = new Hogan2.Template({ code: function(c, p, i) {
        var t = this;
        t.b(i = i || "");
        t.b('<div class="d2h-wrapper ');
        t.b(t.v(t.f("colorScheme", c, p, 0)));
        t.b('">');
        t.b("\n" + i);
        t.b("    ");
        t.b(t.t(t.f("content", c, p, 0)));
        t.b("\n" + i);
        t.b("</div>");
        return t.fl();
      }, partials: {}, subs: {} });
      exports.defaultTemplates["icon-file-added"] = new Hogan2.Template({ code: function(c, p, i) {
        var t = this;
        t.b(i = i || "");
        t.b('<svg aria-hidden="true" class="d2h-icon d2h-added" height="16" title="added" version="1.1" viewBox="0 0 14 16"');
        t.b("\n" + i);
        t.b('     width="14">');
        t.b("\n" + i);
        t.b('    <path d="M13 1H1C0.45 1 0 1.45 0 2v12c0 0.55 0.45 1 1 1h12c0.55 0 1-0.45 1-1V2c0-0.55-0.45-1-1-1z m0 13H1V2h12v12zM6 9H3V7h3V4h2v3h3v2H8v3H6V9z"></path>');
        t.b("\n" + i);
        t.b("</svg>");
        return t.fl();
      }, partials: {}, subs: {} });
      exports.defaultTemplates["icon-file-changed"] = new Hogan2.Template({ code: function(c, p, i) {
        var t = this;
        t.b(i = i || "");
        t.b('<svg aria-hidden="true" class="d2h-icon d2h-changed" height="16" title="modified" version="1.1"');
        t.b("\n" + i);
        t.b('     viewBox="0 0 14 16" width="14">');
        t.b("\n" + i);
        t.b('    <path d="M13 1H1C0.45 1 0 1.45 0 2v12c0 0.55 0.45 1 1 1h12c0.55 0 1-0.45 1-1V2c0-0.55-0.45-1-1-1z m0 13H1V2h12v12zM4 8c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3z"></path>');
        t.b("\n" + i);
        t.b("</svg>");
        return t.fl();
      }, partials: {}, subs: {} });
      exports.defaultTemplates["icon-file-deleted"] = new Hogan2.Template({ code: function(c, p, i) {
        var t = this;
        t.b(i = i || "");
        t.b('<svg aria-hidden="true" class="d2h-icon d2h-deleted" height="16" title="removed" version="1.1"');
        t.b("\n" + i);
        t.b('     viewBox="0 0 14 16" width="14">');
        t.b("\n" + i);
        t.b('    <path d="M13 1H1C0.45 1 0 1.45 0 2v12c0 0.55 0.45 1 1 1h12c0.55 0 1-0.45 1-1V2c0-0.55-0.45-1-1-1z m0 13H1V2h12v12zM11 9H3V7h8v2z"></path>');
        t.b("\n" + i);
        t.b("</svg>");
        return t.fl();
      }, partials: {}, subs: {} });
      exports.defaultTemplates["icon-file-renamed"] = new Hogan2.Template({ code: function(c, p, i) {
        var t = this;
        t.b(i = i || "");
        t.b('<svg aria-hidden="true" class="d2h-icon d2h-moved" height="16" title="renamed" version="1.1"');
        t.b("\n" + i);
        t.b('     viewBox="0 0 14 16" width="14">');
        t.b("\n" + i);
        t.b('    <path d="M6 9H3V7h3V4l5 4-5 4V9z m8-7v12c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h12c0.55 0 1 0.45 1 1z m-1 0H1v12h12V2z"></path>');
        t.b("\n" + i);
        t.b("</svg>");
        return t.fl();
      }, partials: {}, subs: {} });
      exports.defaultTemplates["icon-file"] = new Hogan2.Template({ code: function(c, p, i) {
        var t = this;
        t.b(i = i || "");
        t.b('<svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">');
        t.b("\n" + i);
        t.b('    <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>');
        t.b("\n" + i);
        t.b("</svg>");
        return t.fl();
      }, partials: {}, subs: {} });
      exports.defaultTemplates["line-by-line-file-diff"] = new Hogan2.Template({ code: function(c, p, i) {
        var t = this;
        t.b(i = i || "");
        t.b('<div id="');
        t.b(t.v(t.f("fileHtmlId", c, p, 0)));
        t.b('" class="d2h-file-wrapper" data-lang="');
        t.b(t.v(t.d("file.language", c, p, 0)));
        t.b('">');
        t.b("\n" + i);
        t.b('    <div class="d2h-file-header">');
        t.b("\n" + i);
        t.b("    ");
        t.b(t.t(t.f("filePath", c, p, 0)));
        t.b("\n" + i);
        t.b("    </div>");
        t.b("\n" + i);
        t.b('    <div class="d2h-file-diff">');
        t.b("\n" + i);
        t.b('        <div class="d2h-code-wrapper">');
        t.b("\n" + i);
        t.b('            <table class="d2h-diff-table">');
        t.b("\n" + i);
        t.b('                <tbody class="d2h-diff-tbody">');
        t.b("\n" + i);
        t.b("                ");
        t.b(t.t(t.f("diffs", c, p, 0)));
        t.b("\n" + i);
        t.b("                </tbody>");
        t.b("\n" + i);
        t.b("            </table>");
        t.b("\n" + i);
        t.b("        </div>");
        t.b("\n" + i);
        t.b("    </div>");
        t.b("\n" + i);
        t.b("</div>");
        return t.fl();
      }, partials: {}, subs: {} });
      exports.defaultTemplates["line-by-line-numbers"] = new Hogan2.Template({ code: function(c, p, i) {
        var t = this;
        t.b(i = i || "");
        t.b('<div class="line-num1">');
        t.b(t.v(t.f("oldNumber", c, p, 0)));
        t.b("</div>");
        t.b("\n" + i);
        t.b('<div class="line-num2">');
        t.b(t.v(t.f("newNumber", c, p, 0)));
        t.b("</div>");
        return t.fl();
      }, partials: {}, subs: {} });
      exports.defaultTemplates["side-by-side-file-diff"] = new Hogan2.Template({ code: function(c, p, i) {
        var t = this;
        t.b(i = i || "");
        t.b('<div id="');
        t.b(t.v(t.f("fileHtmlId", c, p, 0)));
        t.b('" class="d2h-file-wrapper" data-lang="');
        t.b(t.v(t.d("file.language", c, p, 0)));
        t.b('">');
        t.b("\n" + i);
        t.b('    <div class="d2h-file-header">');
        t.b("\n" + i);
        t.b("      ");
        t.b(t.t(t.f("filePath", c, p, 0)));
        t.b("\n" + i);
        t.b("    </div>");
        t.b("\n" + i);
        t.b('    <div class="d2h-files-diff">');
        t.b("\n" + i);
        t.b('        <div class="d2h-file-side-diff">');
        t.b("\n" + i);
        t.b('            <div class="d2h-code-wrapper">');
        t.b("\n" + i);
        t.b('                <table class="d2h-diff-table">');
        t.b("\n" + i);
        t.b('                    <tbody class="d2h-diff-tbody">');
        t.b("\n" + i);
        t.b("                    ");
        t.b(t.t(t.d("diffs.left", c, p, 0)));
        t.b("\n" + i);
        t.b("                    </tbody>");
        t.b("\n" + i);
        t.b("                </table>");
        t.b("\n" + i);
        t.b("            </div>");
        t.b("\n" + i);
        t.b("        </div>");
        t.b("\n" + i);
        t.b('        <div class="d2h-file-side-diff">');
        t.b("\n" + i);
        t.b('            <div class="d2h-code-wrapper">');
        t.b("\n" + i);
        t.b('                <table class="d2h-diff-table">');
        t.b("\n" + i);
        t.b('                    <tbody class="d2h-diff-tbody">');
        t.b("\n" + i);
        t.b("                    ");
        t.b(t.t(t.d("diffs.right", c, p, 0)));
        t.b("\n" + i);
        t.b("                    </tbody>");
        t.b("\n" + i);
        t.b("                </table>");
        t.b("\n" + i);
        t.b("            </div>");
        t.b("\n" + i);
        t.b("        </div>");
        t.b("\n" + i);
        t.b("    </div>");
        t.b("\n" + i);
        t.b("</div>");
        return t.fl();
      }, partials: {}, subs: {} });
      exports.defaultTemplates["tag-file-added"] = new Hogan2.Template({ code: function(c, p, i) {
        var t = this;
        t.b(i = i || "");
        t.b('<span class="d2h-tag d2h-added d2h-added-tag">ADDED</span>');
        return t.fl();
      }, partials: {}, subs: {} });
      exports.defaultTemplates["tag-file-changed"] = new Hogan2.Template({ code: function(c, p, i) {
        var t = this;
        t.b(i = i || "");
        t.b('<span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span>');
        return t.fl();
      }, partials: {}, subs: {} });
      exports.defaultTemplates["tag-file-deleted"] = new Hogan2.Template({ code: function(c, p, i) {
        var t = this;
        t.b(i = i || "");
        t.b('<span class="d2h-tag d2h-deleted d2h-deleted-tag">DELETED</span>');
        return t.fl();
      }, partials: {}, subs: {} });
      exports.defaultTemplates["tag-file-renamed"] = new Hogan2.Template({ code: function(c, p, i) {
        var t = this;
        t.b(i = i || "");
        t.b('<span class="d2h-tag d2h-moved d2h-moved-tag">RENAMED</span>');
        return t.fl();
      }, partials: {}, subs: {} });
    }
  });

  // node_modules/diff2html/lib/hoganjs-utils.js
  var require_hoganjs_utils = __commonJS({
    "node_modules/diff2html/lib/hoganjs-utils.js"(exports) {
      "use strict";
      var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      }) : (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        o[k2] = m[k];
      }));
      var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }) : function(o, v) {
        o["default"] = v;
      });
      var __importStar = exports && exports.__importStar || /* @__PURE__ */ (function() {
        var ownKeys = function(o) {
          ownKeys = Object.getOwnPropertyNames || function(o2) {
            var ar = [];
            for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
            return ar;
          };
          return ownKeys(o);
        };
        return function(mod) {
          if (mod && mod.__esModule) return mod;
          var result = {};
          if (mod != null) {
            for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
          }
          __setModuleDefault(result, mod);
          return result;
        };
      })();
      Object.defineProperty(exports, "__esModule", { value: true });
      var Hogan2 = __importStar(require_hogan());
      var diff2html_templates_1 = require_diff2html_templates();
      var HoganJsUtils = class {
        constructor({ compiledTemplates = {}, rawTemplates = {} }) {
          const compiledRawTemplates = Object.entries(rawTemplates).reduce((previousTemplates, [name, templateString]) => {
            const compiledTemplate = Hogan2.compile(templateString, { asString: false });
            return Object.assign(Object.assign({}, previousTemplates), { [name]: compiledTemplate });
          }, {});
          this.preCompiledTemplates = Object.assign(Object.assign(Object.assign({}, diff2html_templates_1.defaultTemplates), compiledTemplates), compiledRawTemplates);
        }
        static compile(templateString) {
          return Hogan2.compile(templateString, { asString: false });
        }
        render(namespace, view, params, partials, indent) {
          const templateKey = this.templateKey(namespace, view);
          try {
            const template = this.preCompiledTemplates[templateKey];
            return template.render(params, partials, indent);
          } catch (_e) {
            throw new Error(`Could not find template to render '${templateKey}'`);
          }
        }
        template(namespace, view) {
          return this.preCompiledTemplates[this.templateKey(namespace, view)];
        }
        templateKey(namespace, view) {
          return `${namespace}-${view}`;
        }
      };
      exports.default = HoganJsUtils;
    }
  });

  // node_modules/diff2html/lib/diff2html.js
  var require_diff2html = __commonJS({
    "node_modules/diff2html/lib/diff2html.js"(exports) {
      "use strict";
      var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      }) : (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        o[k2] = m[k];
      }));
      var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }) : function(o, v) {
        o["default"] = v;
      });
      var __importStar = exports && exports.__importStar || /* @__PURE__ */ (function() {
        var ownKeys = function(o) {
          ownKeys = Object.getOwnPropertyNames || function(o2) {
            var ar = [];
            for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
            return ar;
          };
          return ownKeys(o);
        };
        return function(mod) {
          if (mod && mod.__esModule) return mod;
          var result = {};
          if (mod != null) {
            for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
          }
          __setModuleDefault(result, mod);
          return result;
        };
      })();
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.defaultDiff2HtmlConfig = void 0;
      exports.parse = parse;
      exports.html = html;
      var DiffParser = __importStar(require_diff_parser());
      var file_list_renderer_1 = require_file_list_renderer();
      var line_by_line_renderer_1 = __importStar(require_line_by_line_renderer());
      var side_by_side_renderer_1 = __importStar(require_side_by_side_renderer());
      var types_1 = require_types();
      var hoganjs_utils_1 = __importDefault(require_hoganjs_utils());
      exports.defaultDiff2HtmlConfig = Object.assign(Object.assign(Object.assign({}, line_by_line_renderer_1.defaultLineByLineRendererConfig), side_by_side_renderer_1.defaultSideBySideRendererConfig), { outputFormat: types_1.OutputFormatType.LINE_BY_LINE, drawFileList: true });
      function parse(diffInput, configuration = {}) {
        return DiffParser.parse(diffInput, Object.assign(Object.assign({}, exports.defaultDiff2HtmlConfig), configuration));
      }
      function html(diffInput, configuration = {}) {
        const config = Object.assign(Object.assign({}, exports.defaultDiff2HtmlConfig), configuration);
        const diffJson = typeof diffInput === "string" ? DiffParser.parse(diffInput, config) : diffInput;
        const hoganUtils = new hoganjs_utils_1.default(config);
        const { colorScheme } = config;
        const fileListRendererConfig = { colorScheme };
        const fileList = config.drawFileList ? new file_list_renderer_1.FileListRenderer(hoganUtils, fileListRendererConfig).render(diffJson) : "";
        const diffOutput = config.outputFormat === "side-by-side" ? new side_by_side_renderer_1.default(hoganUtils, config).render(diffJson) : new line_by_line_renderer_1.default(hoganUtils, config).render(diffJson);
        return fileList + diffOutput;
      }
    }
  });

  // node_modules/diff2html/lib/ui/js/diff2html-ui-base.js
  var require_diff2html_ui_base = __commonJS({
    "node_modules/diff2html/lib/ui/js/diff2html-ui-base.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Diff2HtmlUI = exports.defaultDiff2HtmlUIConfig = void 0;
      var highlight_js_helpers_1 = require_highlight_js_helpers();
      var diff2html_1 = require_diff2html();
      exports.defaultDiff2HtmlUIConfig = Object.assign(Object.assign({}, diff2html_1.defaultDiff2HtmlConfig), { synchronisedScroll: true, highlight: true, fileListToggle: true, fileListStartVisible: false, highlightLanguages: /* @__PURE__ */ new Map(), smartSelection: true, fileContentToggle: true, stickyFileHeaders: true });
      var Diff2HtmlUI2 = class {
        constructor(target, diffInput, config = {}, hljs) {
          this.hljs = null;
          this.currentSelectionColumnId = -1;
          this.config = Object.assign(Object.assign({}, exports.defaultDiff2HtmlUIConfig), config);
          this.diffHtml = diffInput !== void 0 ? (0, diff2html_1.html)(diffInput, this.config) : target.innerHTML;
          this.targetElement = target;
          if (hljs !== void 0)
            this.hljs = hljs;
        }
        draw() {
          this.targetElement.innerHTML = this.diffHtml;
          if (this.config.synchronisedScroll)
            this.synchronisedScroll();
          if (this.config.highlight)
            this.highlightCode();
          if (this.config.fileListToggle)
            this.fileListToggle(this.config.fileListStartVisible);
          if (this.config.fileContentToggle)
            this.fileContentToggle();
          if (this.config.stickyFileHeaders)
            this.stickyFileHeaders();
        }
        synchronisedScroll() {
          this.targetElement.querySelectorAll(".d2h-file-wrapper").forEach((wrapper) => {
            const [left, right] = Array().slice.call(wrapper.querySelectorAll(".d2h-file-side-diff"));
            if (left === void 0 || right === void 0)
              return;
            const onScroll = (event) => {
              if (event === null || event.target === null)
                return;
              if (event.target === left) {
                right.scrollTop = left.scrollTop;
                right.scrollLeft = left.scrollLeft;
              } else {
                left.scrollTop = right.scrollTop;
                left.scrollLeft = right.scrollLeft;
              }
            };
            left.addEventListener("scroll", onScroll);
            right.addEventListener("scroll", onScroll);
          });
        }
        fileListToggle(startVisible) {
          const showBtn = this.targetElement.querySelector(".d2h-show");
          const hideBtn = this.targetElement.querySelector(".d2h-hide");
          const fileList = this.targetElement.querySelector(".d2h-file-list");
          if (showBtn === null || hideBtn === null || fileList === null)
            return;
          const show = () => {
            showBtn.style.display = "none";
            hideBtn.style.display = "inline";
            fileList.style.display = "block";
          };
          const hide = () => {
            showBtn.style.display = "inline";
            hideBtn.style.display = "none";
            fileList.style.display = "none";
          };
          showBtn.addEventListener("click", () => show());
          hideBtn.addEventListener("click", () => hide());
          const hashTag = this.getHashTag();
          if (hashTag === "files-summary-show")
            show();
          else if (hashTag === "files-summary-hide")
            hide();
          else if (startVisible)
            show();
          else
            hide();
        }
        fileContentToggle() {
          this.targetElement.querySelectorAll(".d2h-file-collapse").forEach((fileContentToggleBtn) => {
            fileContentToggleBtn.style.display = "flex";
            const toggleFileContents = (selector) => {
              var _a;
              const fileContents = (_a = fileContentToggleBtn.closest(".d2h-file-wrapper")) === null || _a === void 0 ? void 0 : _a.querySelector(selector);
              if (fileContents !== null && fileContents !== void 0) {
                fileContentToggleBtn.classList.toggle("d2h-selected");
                fileContents.classList.toggle("d2h-d-none");
              }
            };
            const toggleHandler = (e) => {
              if (fileContentToggleBtn === e.target)
                return;
              toggleFileContents(".d2h-file-diff");
              toggleFileContents(".d2h-files-diff");
            };
            fileContentToggleBtn.addEventListener("click", (e) => toggleHandler(e));
          });
        }
        highlightCode() {
          const hljs = this.hljs;
          if (hljs === null) {
            throw new Error("Missing a `highlight.js` implementation. Please provide one when instantiating Diff2HtmlUI.");
          }
          const files = this.targetElement.querySelectorAll(".d2h-file-wrapper");
          files.forEach((file) => {
            const language = file.getAttribute("data-lang");
            if (!(this.config.highlightLanguages instanceof Map)) {
              this.config.highlightLanguages = new Map(Object.entries(this.config.highlightLanguages));
            }
            let hljsLanguage = language && this.config.highlightLanguages.has(language) ? this.config.highlightLanguages.get(language) : language ? (0, highlight_js_helpers_1.getLanguage)(language) : "plaintext";
            if (hljs.getLanguage(hljsLanguage) === void 0) {
              hljsLanguage = "plaintext";
            }
            const codeLines = file.querySelectorAll(".d2h-code-line-ctn");
            codeLines.forEach((line) => {
              const text = line.textContent;
              const lineParent = line.parentNode;
              if (text === null || lineParent === null || !this.isElement(lineParent))
                return;
              const result = (0, highlight_js_helpers_1.closeTags)(hljs.highlight(text, {
                language: hljsLanguage,
                ignoreIllegals: true
              }));
              const originalStream = (0, highlight_js_helpers_1.nodeStream)(line);
              if (originalStream.length) {
                const resultNode = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
                resultNode.innerHTML = result.value;
                result.value = (0, highlight_js_helpers_1.mergeStreams)(originalStream, (0, highlight_js_helpers_1.nodeStream)(resultNode), text);
              }
              line.classList.add("hljs");
              if (result.language) {
                line.classList.add(result.language);
              }
              line.innerHTML = result.value;
            });
          });
        }
        stickyFileHeaders() {
          this.targetElement.querySelectorAll(".d2h-file-header").forEach((header) => {
            header.classList.add("d2h-sticky-header");
          });
        }
        smartSelection() {
          console.warn("Smart selection is now enabled by default with CSS. No need to call this method anymore.");
        }
        getHashTag() {
          const docUrl = document.URL;
          const hashTagIndex = docUrl.indexOf("#");
          let hashTag = null;
          if (hashTagIndex !== -1) {
            hashTag = docUrl.substr(hashTagIndex + 1);
          }
          return hashTag;
        }
        isElement(arg) {
          return arg !== null && (arg === null || arg === void 0 ? void 0 : arg.classList) !== void 0;
        }
      };
      exports.Diff2HtmlUI = Diff2HtmlUI2;
    }
  });

  // node_modules/diff2html/lib/ui/js/diff2html-ui-slim.js
  var require_diff2html_ui_slim = __commonJS({
    "node_modules/diff2html/lib/ui/js/diff2html-ui-slim.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.defaultDiff2HtmlUIConfig = exports.Diff2HtmlUI = void 0;
      var highlight_js_slim_1 = require_highlight_js_slim();
      var diff2html_ui_base_1 = require_diff2html_ui_base();
      Object.defineProperty(exports, "defaultDiff2HtmlUIConfig", { enumerable: true, get: function() {
        return diff2html_ui_base_1.defaultDiff2HtmlUIConfig;
      } });
      var Diff2HtmlUI2 = class extends diff2html_ui_base_1.Diff2HtmlUI {
        constructor(target, diffInput, config = {}) {
          super(target, diffInput, config, highlight_js_slim_1.hljs);
        }
      };
      exports.Diff2HtmlUI = Diff2HtmlUI2;
    }
  });

  // node_modules/@hotwired/stimulus/dist/stimulus.js
  var EventListener = class {
    constructor(eventTarget, eventName, eventOptions) {
      this.eventTarget = eventTarget;
      this.eventName = eventName;
      this.eventOptions = eventOptions;
      this.unorderedBindings = /* @__PURE__ */ new Set();
    }
    connect() {
      this.eventTarget.addEventListener(this.eventName, this, this.eventOptions);
    }
    disconnect() {
      this.eventTarget.removeEventListener(this.eventName, this, this.eventOptions);
    }
    bindingConnected(binding) {
      this.unorderedBindings.add(binding);
    }
    bindingDisconnected(binding) {
      this.unorderedBindings.delete(binding);
    }
    handleEvent(event) {
      const extendedEvent = extendEvent(event);
      for (const binding of this.bindings) {
        if (extendedEvent.immediatePropagationStopped) {
          break;
        } else {
          binding.handleEvent(extendedEvent);
        }
      }
    }
    hasBindings() {
      return this.unorderedBindings.size > 0;
    }
    get bindings() {
      return Array.from(this.unorderedBindings).sort((left, right) => {
        const leftIndex = left.index, rightIndex = right.index;
        return leftIndex < rightIndex ? -1 : leftIndex > rightIndex ? 1 : 0;
      });
    }
  };
  function extendEvent(event) {
    if ("immediatePropagationStopped" in event) {
      return event;
    } else {
      const { stopImmediatePropagation } = event;
      return Object.assign(event, {
        immediatePropagationStopped: false,
        stopImmediatePropagation() {
          this.immediatePropagationStopped = true;
          stopImmediatePropagation.call(this);
        }
      });
    }
  }
  var Dispatcher = class {
    constructor(application) {
      this.application = application;
      this.eventListenerMaps = /* @__PURE__ */ new Map();
      this.started = false;
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.eventListeners.forEach((eventListener) => eventListener.connect());
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        this.eventListeners.forEach((eventListener) => eventListener.disconnect());
      }
    }
    get eventListeners() {
      return Array.from(this.eventListenerMaps.values()).reduce((listeners, map) => listeners.concat(Array.from(map.values())), []);
    }
    bindingConnected(binding) {
      this.fetchEventListenerForBinding(binding).bindingConnected(binding);
    }
    bindingDisconnected(binding, clearEventListeners = false) {
      this.fetchEventListenerForBinding(binding).bindingDisconnected(binding);
      if (clearEventListeners)
        this.clearEventListenersForBinding(binding);
    }
    handleError(error2, message, detail = {}) {
      this.application.handleError(error2, `Error ${message}`, detail);
    }
    clearEventListenersForBinding(binding) {
      const eventListener = this.fetchEventListenerForBinding(binding);
      if (!eventListener.hasBindings()) {
        eventListener.disconnect();
        this.removeMappedEventListenerFor(binding);
      }
    }
    removeMappedEventListenerFor(binding) {
      const { eventTarget, eventName, eventOptions } = binding;
      const eventListenerMap = this.fetchEventListenerMapForEventTarget(eventTarget);
      const cacheKey = this.cacheKey(eventName, eventOptions);
      eventListenerMap.delete(cacheKey);
      if (eventListenerMap.size == 0)
        this.eventListenerMaps.delete(eventTarget);
    }
    fetchEventListenerForBinding(binding) {
      const { eventTarget, eventName, eventOptions } = binding;
      return this.fetchEventListener(eventTarget, eventName, eventOptions);
    }
    fetchEventListener(eventTarget, eventName, eventOptions) {
      const eventListenerMap = this.fetchEventListenerMapForEventTarget(eventTarget);
      const cacheKey = this.cacheKey(eventName, eventOptions);
      let eventListener = eventListenerMap.get(cacheKey);
      if (!eventListener) {
        eventListener = this.createEventListener(eventTarget, eventName, eventOptions);
        eventListenerMap.set(cacheKey, eventListener);
      }
      return eventListener;
    }
    createEventListener(eventTarget, eventName, eventOptions) {
      const eventListener = new EventListener(eventTarget, eventName, eventOptions);
      if (this.started) {
        eventListener.connect();
      }
      return eventListener;
    }
    fetchEventListenerMapForEventTarget(eventTarget) {
      let eventListenerMap = this.eventListenerMaps.get(eventTarget);
      if (!eventListenerMap) {
        eventListenerMap = /* @__PURE__ */ new Map();
        this.eventListenerMaps.set(eventTarget, eventListenerMap);
      }
      return eventListenerMap;
    }
    cacheKey(eventName, eventOptions) {
      const parts = [eventName];
      Object.keys(eventOptions).sort().forEach((key2) => {
        parts.push(`${eventOptions[key2] ? "" : "!"}${key2}`);
      });
      return parts.join(":");
    }
  };
  var defaultActionDescriptorFilters = {
    stop({ event, value }) {
      if (value)
        event.stopPropagation();
      return true;
    },
    prevent({ event, value }) {
      if (value)
        event.preventDefault();
      return true;
    },
    self({ event, value, element }) {
      if (value) {
        return element === event.target;
      } else {
        return true;
      }
    }
  };
  var descriptorPattern = /^(?:(?:([^.]+?)\+)?(.+?)(?:\.(.+?))?(?:@(window|document))?->)?(.+?)(?:#([^:]+?))(?::(.+))?$/;
  function parseActionDescriptorString(descriptorString) {
    const source = descriptorString.trim();
    const matches = source.match(descriptorPattern) || [];
    let eventName = matches[2];
    let keyFilter = matches[3];
    if (keyFilter && !["keydown", "keyup", "keypress"].includes(eventName)) {
      eventName += `.${keyFilter}`;
      keyFilter = "";
    }
    return {
      eventTarget: parseEventTarget(matches[4]),
      eventName,
      eventOptions: matches[7] ? parseEventOptions(matches[7]) : {},
      identifier: matches[5],
      methodName: matches[6],
      keyFilter: matches[1] || keyFilter
    };
  }
  function parseEventTarget(eventTargetName) {
    if (eventTargetName == "window") {
      return window;
    } else if (eventTargetName == "document") {
      return document;
    }
  }
  function parseEventOptions(eventOptions) {
    return eventOptions.split(":").reduce((options, token) => Object.assign(options, { [token.replace(/^!/, "")]: !/^!/.test(token) }), {});
  }
  function stringifyEventTarget(eventTarget) {
    if (eventTarget == window) {
      return "window";
    } else if (eventTarget == document) {
      return "document";
    }
  }
  function camelize(value) {
    return value.replace(/(?:[_-])([a-z0-9])/g, (_, char) => char.toUpperCase());
  }
  function namespaceCamelize(value) {
    return camelize(value.replace(/--/g, "-").replace(/__/g, "_"));
  }
  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  function dasherize(value) {
    return value.replace(/([A-Z])/g, (_, char) => `-${char.toLowerCase()}`);
  }
  function tokenize(value) {
    return value.match(/[^\s]+/g) || [];
  }
  function isSomething(object) {
    return object !== null && object !== void 0;
  }
  function hasProperty(object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  }
  var allModifiers = ["meta", "ctrl", "alt", "shift"];
  var Action = class {
    constructor(element, index, descriptor, schema) {
      this.element = element;
      this.index = index;
      this.eventTarget = descriptor.eventTarget || element;
      this.eventName = descriptor.eventName || getDefaultEventNameForElement(element) || error("missing event name");
      this.eventOptions = descriptor.eventOptions || {};
      this.identifier = descriptor.identifier || error("missing identifier");
      this.methodName = descriptor.methodName || error("missing method name");
      this.keyFilter = descriptor.keyFilter || "";
      this.schema = schema;
    }
    static forToken(token, schema) {
      return new this(token.element, token.index, parseActionDescriptorString(token.content), schema);
    }
    toString() {
      const eventFilter = this.keyFilter ? `.${this.keyFilter}` : "";
      const eventTarget = this.eventTargetName ? `@${this.eventTargetName}` : "";
      return `${this.eventName}${eventFilter}${eventTarget}->${this.identifier}#${this.methodName}`;
    }
    shouldIgnoreKeyboardEvent(event) {
      if (!this.keyFilter) {
        return false;
      }
      const filters = this.keyFilter.split("+");
      if (this.keyFilterDissatisfied(event, filters)) {
        return true;
      }
      const standardFilter = filters.filter((key2) => !allModifiers.includes(key2))[0];
      if (!standardFilter) {
        return false;
      }
      if (!hasProperty(this.keyMappings, standardFilter)) {
        error(`contains unknown key filter: ${this.keyFilter}`);
      }
      return this.keyMappings[standardFilter].toLowerCase() !== event.key.toLowerCase();
    }
    shouldIgnoreMouseEvent(event) {
      if (!this.keyFilter) {
        return false;
      }
      const filters = [this.keyFilter];
      if (this.keyFilterDissatisfied(event, filters)) {
        return true;
      }
      return false;
    }
    get params() {
      const params = {};
      const pattern = new RegExp(`^data-${this.identifier}-(.+)-param$`, "i");
      for (const { name, value } of Array.from(this.element.attributes)) {
        const match = name.match(pattern);
        const key2 = match && match[1];
        if (key2) {
          params[camelize(key2)] = typecast(value);
        }
      }
      return params;
    }
    get eventTargetName() {
      return stringifyEventTarget(this.eventTarget);
    }
    get keyMappings() {
      return this.schema.keyMappings;
    }
    keyFilterDissatisfied(event, filters) {
      const [meta, ctrl, alt, shift] = allModifiers.map((modifier) => filters.includes(modifier));
      return event.metaKey !== meta || event.ctrlKey !== ctrl || event.altKey !== alt || event.shiftKey !== shift;
    }
  };
  var defaultEventNames = {
    a: () => "click",
    button: () => "click",
    form: () => "submit",
    details: () => "toggle",
    input: (e) => e.getAttribute("type") == "submit" ? "click" : "input",
    select: () => "change",
    textarea: () => "input"
  };
  function getDefaultEventNameForElement(element) {
    const tagName = element.tagName.toLowerCase();
    if (tagName in defaultEventNames) {
      return defaultEventNames[tagName](element);
    }
  }
  function error(message) {
    throw new Error(message);
  }
  function typecast(value) {
    try {
      return JSON.parse(value);
    } catch (o_O) {
      return value;
    }
  }
  var Binding = class {
    constructor(context, action) {
      this.context = context;
      this.action = action;
    }
    get index() {
      return this.action.index;
    }
    get eventTarget() {
      return this.action.eventTarget;
    }
    get eventOptions() {
      return this.action.eventOptions;
    }
    get identifier() {
      return this.context.identifier;
    }
    handleEvent(event) {
      const actionEvent = this.prepareActionEvent(event);
      if (this.willBeInvokedByEvent(event) && this.applyEventModifiers(actionEvent)) {
        this.invokeWithEvent(actionEvent);
      }
    }
    get eventName() {
      return this.action.eventName;
    }
    get method() {
      const method = this.controller[this.methodName];
      if (typeof method == "function") {
        return method;
      }
      throw new Error(`Action "${this.action}" references undefined method "${this.methodName}"`);
    }
    applyEventModifiers(event) {
      const { element } = this.action;
      const { actionDescriptorFilters } = this.context.application;
      const { controller } = this.context;
      let passes = true;
      for (const [name, value] of Object.entries(this.eventOptions)) {
        if (name in actionDescriptorFilters) {
          const filter = actionDescriptorFilters[name];
          passes = passes && filter({ name, value, event, element, controller });
        } else {
          continue;
        }
      }
      return passes;
    }
    prepareActionEvent(event) {
      return Object.assign(event, { params: this.action.params });
    }
    invokeWithEvent(event) {
      const { target, currentTarget } = event;
      try {
        this.method.call(this.controller, event);
        this.context.logDebugActivity(this.methodName, { event, target, currentTarget, action: this.methodName });
      } catch (error2) {
        const { identifier, controller, element, index } = this;
        const detail = { identifier, controller, element, index, event };
        this.context.handleError(error2, `invoking action "${this.action}"`, detail);
      }
    }
    willBeInvokedByEvent(event) {
      const eventTarget = event.target;
      if (event instanceof KeyboardEvent && this.action.shouldIgnoreKeyboardEvent(event)) {
        return false;
      }
      if (event instanceof MouseEvent && this.action.shouldIgnoreMouseEvent(event)) {
        return false;
      }
      if (this.element === eventTarget) {
        return true;
      } else if (eventTarget instanceof Element && this.element.contains(eventTarget)) {
        return this.scope.containsElement(eventTarget);
      } else {
        return this.scope.containsElement(this.action.element);
      }
    }
    get controller() {
      return this.context.controller;
    }
    get methodName() {
      return this.action.methodName;
    }
    get element() {
      return this.scope.element;
    }
    get scope() {
      return this.context.scope;
    }
  };
  var ElementObserver = class {
    constructor(element, delegate) {
      this.mutationObserverInit = { attributes: true, childList: true, subtree: true };
      this.element = element;
      this.started = false;
      this.delegate = delegate;
      this.elements = /* @__PURE__ */ new Set();
      this.mutationObserver = new MutationObserver((mutations) => this.processMutations(mutations));
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.mutationObserver.observe(this.element, this.mutationObserverInit);
        this.refresh();
      }
    }
    pause(callback) {
      if (this.started) {
        this.mutationObserver.disconnect();
        this.started = false;
      }
      callback();
      if (!this.started) {
        this.mutationObserver.observe(this.element, this.mutationObserverInit);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        this.mutationObserver.takeRecords();
        this.mutationObserver.disconnect();
        this.started = false;
      }
    }
    refresh() {
      if (this.started) {
        const matches = new Set(this.matchElementsInTree());
        for (const element of Array.from(this.elements)) {
          if (!matches.has(element)) {
            this.removeElement(element);
          }
        }
        for (const element of Array.from(matches)) {
          this.addElement(element);
        }
      }
    }
    processMutations(mutations) {
      if (this.started) {
        for (const mutation of mutations) {
          this.processMutation(mutation);
        }
      }
    }
    processMutation(mutation) {
      if (mutation.type == "attributes") {
        this.processAttributeChange(mutation.target, mutation.attributeName);
      } else if (mutation.type == "childList") {
        this.processRemovedNodes(mutation.removedNodes);
        this.processAddedNodes(mutation.addedNodes);
      }
    }
    processAttributeChange(element, attributeName) {
      if (this.elements.has(element)) {
        if (this.delegate.elementAttributeChanged && this.matchElement(element)) {
          this.delegate.elementAttributeChanged(element, attributeName);
        } else {
          this.removeElement(element);
        }
      } else if (this.matchElement(element)) {
        this.addElement(element);
      }
    }
    processRemovedNodes(nodes) {
      for (const node of Array.from(nodes)) {
        const element = this.elementFromNode(node);
        if (element) {
          this.processTree(element, this.removeElement);
        }
      }
    }
    processAddedNodes(nodes) {
      for (const node of Array.from(nodes)) {
        const element = this.elementFromNode(node);
        if (element && this.elementIsActive(element)) {
          this.processTree(element, this.addElement);
        }
      }
    }
    matchElement(element) {
      return this.delegate.matchElement(element);
    }
    matchElementsInTree(tree = this.element) {
      return this.delegate.matchElementsInTree(tree);
    }
    processTree(tree, processor) {
      for (const element of this.matchElementsInTree(tree)) {
        processor.call(this, element);
      }
    }
    elementFromNode(node) {
      if (node.nodeType == Node.ELEMENT_NODE) {
        return node;
      }
    }
    elementIsActive(element) {
      if (element.isConnected != this.element.isConnected) {
        return false;
      } else {
        return this.element.contains(element);
      }
    }
    addElement(element) {
      if (!this.elements.has(element)) {
        if (this.elementIsActive(element)) {
          this.elements.add(element);
          if (this.delegate.elementMatched) {
            this.delegate.elementMatched(element);
          }
        }
      }
    }
    removeElement(element) {
      if (this.elements.has(element)) {
        this.elements.delete(element);
        if (this.delegate.elementUnmatched) {
          this.delegate.elementUnmatched(element);
        }
      }
    }
  };
  var AttributeObserver = class {
    constructor(element, attributeName, delegate) {
      this.attributeName = attributeName;
      this.delegate = delegate;
      this.elementObserver = new ElementObserver(element, this);
    }
    get element() {
      return this.elementObserver.element;
    }
    get selector() {
      return `[${this.attributeName}]`;
    }
    start() {
      this.elementObserver.start();
    }
    pause(callback) {
      this.elementObserver.pause(callback);
    }
    stop() {
      this.elementObserver.stop();
    }
    refresh() {
      this.elementObserver.refresh();
    }
    get started() {
      return this.elementObserver.started;
    }
    matchElement(element) {
      return element.hasAttribute(this.attributeName);
    }
    matchElementsInTree(tree) {
      const match = this.matchElement(tree) ? [tree] : [];
      const matches = Array.from(tree.querySelectorAll(this.selector));
      return match.concat(matches);
    }
    elementMatched(element) {
      if (this.delegate.elementMatchedAttribute) {
        this.delegate.elementMatchedAttribute(element, this.attributeName);
      }
    }
    elementUnmatched(element) {
      if (this.delegate.elementUnmatchedAttribute) {
        this.delegate.elementUnmatchedAttribute(element, this.attributeName);
      }
    }
    elementAttributeChanged(element, attributeName) {
      if (this.delegate.elementAttributeValueChanged && this.attributeName == attributeName) {
        this.delegate.elementAttributeValueChanged(element, attributeName);
      }
    }
  };
  function add(map, key2, value) {
    fetch2(map, key2).add(value);
  }
  function del(map, key2, value) {
    fetch2(map, key2).delete(value);
    prune(map, key2);
  }
  function fetch2(map, key2) {
    let values = map.get(key2);
    if (!values) {
      values = /* @__PURE__ */ new Set();
      map.set(key2, values);
    }
    return values;
  }
  function prune(map, key2) {
    const values = map.get(key2);
    if (values != null && values.size == 0) {
      map.delete(key2);
    }
  }
  var Multimap = class {
    constructor() {
      this.valuesByKey = /* @__PURE__ */ new Map();
    }
    get keys() {
      return Array.from(this.valuesByKey.keys());
    }
    get values() {
      const sets = Array.from(this.valuesByKey.values());
      return sets.reduce((values, set) => values.concat(Array.from(set)), []);
    }
    get size() {
      const sets = Array.from(this.valuesByKey.values());
      return sets.reduce((size, set) => size + set.size, 0);
    }
    add(key2, value) {
      add(this.valuesByKey, key2, value);
    }
    delete(key2, value) {
      del(this.valuesByKey, key2, value);
    }
    has(key2, value) {
      const values = this.valuesByKey.get(key2);
      return values != null && values.has(value);
    }
    hasKey(key2) {
      return this.valuesByKey.has(key2);
    }
    hasValue(value) {
      const sets = Array.from(this.valuesByKey.values());
      return sets.some((set) => set.has(value));
    }
    getValuesForKey(key2) {
      const values = this.valuesByKey.get(key2);
      return values ? Array.from(values) : [];
    }
    getKeysForValue(value) {
      return Array.from(this.valuesByKey).filter(([_key, values]) => values.has(value)).map(([key2, _values]) => key2);
    }
  };
  var SelectorObserver = class {
    constructor(element, selector, delegate, details) {
      this._selector = selector;
      this.details = details;
      this.elementObserver = new ElementObserver(element, this);
      this.delegate = delegate;
      this.matchesByElement = new Multimap();
    }
    get started() {
      return this.elementObserver.started;
    }
    get selector() {
      return this._selector;
    }
    set selector(selector) {
      this._selector = selector;
      this.refresh();
    }
    start() {
      this.elementObserver.start();
    }
    pause(callback) {
      this.elementObserver.pause(callback);
    }
    stop() {
      this.elementObserver.stop();
    }
    refresh() {
      this.elementObserver.refresh();
    }
    get element() {
      return this.elementObserver.element;
    }
    matchElement(element) {
      const { selector } = this;
      if (selector) {
        const matches = element.matches(selector);
        if (this.delegate.selectorMatchElement) {
          return matches && this.delegate.selectorMatchElement(element, this.details);
        }
        return matches;
      } else {
        return false;
      }
    }
    matchElementsInTree(tree) {
      const { selector } = this;
      if (selector) {
        const match = this.matchElement(tree) ? [tree] : [];
        const matches = Array.from(tree.querySelectorAll(selector)).filter((match2) => this.matchElement(match2));
        return match.concat(matches);
      } else {
        return [];
      }
    }
    elementMatched(element) {
      const { selector } = this;
      if (selector) {
        this.selectorMatched(element, selector);
      }
    }
    elementUnmatched(element) {
      const selectors = this.matchesByElement.getKeysForValue(element);
      for (const selector of selectors) {
        this.selectorUnmatched(element, selector);
      }
    }
    elementAttributeChanged(element, _attributeName) {
      const { selector } = this;
      if (selector) {
        const matches = this.matchElement(element);
        const matchedBefore = this.matchesByElement.has(selector, element);
        if (matches && !matchedBefore) {
          this.selectorMatched(element, selector);
        } else if (!matches && matchedBefore) {
          this.selectorUnmatched(element, selector);
        }
      }
    }
    selectorMatched(element, selector) {
      this.delegate.selectorMatched(element, selector, this.details);
      this.matchesByElement.add(selector, element);
    }
    selectorUnmatched(element, selector) {
      this.delegate.selectorUnmatched(element, selector, this.details);
      this.matchesByElement.delete(selector, element);
    }
  };
  var StringMapObserver = class {
    constructor(element, delegate) {
      this.element = element;
      this.delegate = delegate;
      this.started = false;
      this.stringMap = /* @__PURE__ */ new Map();
      this.mutationObserver = new MutationObserver((mutations) => this.processMutations(mutations));
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.mutationObserver.observe(this.element, { attributes: true, attributeOldValue: true });
        this.refresh();
      }
    }
    stop() {
      if (this.started) {
        this.mutationObserver.takeRecords();
        this.mutationObserver.disconnect();
        this.started = false;
      }
    }
    refresh() {
      if (this.started) {
        for (const attributeName of this.knownAttributeNames) {
          this.refreshAttribute(attributeName, null);
        }
      }
    }
    processMutations(mutations) {
      if (this.started) {
        for (const mutation of mutations) {
          this.processMutation(mutation);
        }
      }
    }
    processMutation(mutation) {
      const attributeName = mutation.attributeName;
      if (attributeName) {
        this.refreshAttribute(attributeName, mutation.oldValue);
      }
    }
    refreshAttribute(attributeName, oldValue) {
      const key2 = this.delegate.getStringMapKeyForAttribute(attributeName);
      if (key2 != null) {
        if (!this.stringMap.has(attributeName)) {
          this.stringMapKeyAdded(key2, attributeName);
        }
        const value = this.element.getAttribute(attributeName);
        if (this.stringMap.get(attributeName) != value) {
          this.stringMapValueChanged(value, key2, oldValue);
        }
        if (value == null) {
          const oldValue2 = this.stringMap.get(attributeName);
          this.stringMap.delete(attributeName);
          if (oldValue2)
            this.stringMapKeyRemoved(key2, attributeName, oldValue2);
        } else {
          this.stringMap.set(attributeName, value);
        }
      }
    }
    stringMapKeyAdded(key2, attributeName) {
      if (this.delegate.stringMapKeyAdded) {
        this.delegate.stringMapKeyAdded(key2, attributeName);
      }
    }
    stringMapValueChanged(value, key2, oldValue) {
      if (this.delegate.stringMapValueChanged) {
        this.delegate.stringMapValueChanged(value, key2, oldValue);
      }
    }
    stringMapKeyRemoved(key2, attributeName, oldValue) {
      if (this.delegate.stringMapKeyRemoved) {
        this.delegate.stringMapKeyRemoved(key2, attributeName, oldValue);
      }
    }
    get knownAttributeNames() {
      return Array.from(new Set(this.currentAttributeNames.concat(this.recordedAttributeNames)));
    }
    get currentAttributeNames() {
      return Array.from(this.element.attributes).map((attribute) => attribute.name);
    }
    get recordedAttributeNames() {
      return Array.from(this.stringMap.keys());
    }
  };
  var TokenListObserver = class {
    constructor(element, attributeName, delegate) {
      this.attributeObserver = new AttributeObserver(element, attributeName, this);
      this.delegate = delegate;
      this.tokensByElement = new Multimap();
    }
    get started() {
      return this.attributeObserver.started;
    }
    start() {
      this.attributeObserver.start();
    }
    pause(callback) {
      this.attributeObserver.pause(callback);
    }
    stop() {
      this.attributeObserver.stop();
    }
    refresh() {
      this.attributeObserver.refresh();
    }
    get element() {
      return this.attributeObserver.element;
    }
    get attributeName() {
      return this.attributeObserver.attributeName;
    }
    elementMatchedAttribute(element) {
      this.tokensMatched(this.readTokensForElement(element));
    }
    elementAttributeValueChanged(element) {
      const [unmatchedTokens, matchedTokens] = this.refreshTokensForElement(element);
      this.tokensUnmatched(unmatchedTokens);
      this.tokensMatched(matchedTokens);
    }
    elementUnmatchedAttribute(element) {
      this.tokensUnmatched(this.tokensByElement.getValuesForKey(element));
    }
    tokensMatched(tokens) {
      tokens.forEach((token) => this.tokenMatched(token));
    }
    tokensUnmatched(tokens) {
      tokens.forEach((token) => this.tokenUnmatched(token));
    }
    tokenMatched(token) {
      this.delegate.tokenMatched(token);
      this.tokensByElement.add(token.element, token);
    }
    tokenUnmatched(token) {
      this.delegate.tokenUnmatched(token);
      this.tokensByElement.delete(token.element, token);
    }
    refreshTokensForElement(element) {
      const previousTokens = this.tokensByElement.getValuesForKey(element);
      const currentTokens = this.readTokensForElement(element);
      const firstDifferingIndex = zip(previousTokens, currentTokens).findIndex(([previousToken, currentToken]) => !tokensAreEqual(previousToken, currentToken));
      if (firstDifferingIndex == -1) {
        return [[], []];
      } else {
        return [previousTokens.slice(firstDifferingIndex), currentTokens.slice(firstDifferingIndex)];
      }
    }
    readTokensForElement(element) {
      const attributeName = this.attributeName;
      const tokenString = element.getAttribute(attributeName) || "";
      return parseTokenString(tokenString, element, attributeName);
    }
  };
  function parseTokenString(tokenString, element, attributeName) {
    return tokenString.trim().split(/\s+/).filter((content) => content.length).map((content, index) => ({ element, attributeName, content, index }));
  }
  function zip(left, right) {
    const length = Math.max(left.length, right.length);
    return Array.from({ length }, (_, index) => [left[index], right[index]]);
  }
  function tokensAreEqual(left, right) {
    return left && right && left.index == right.index && left.content == right.content;
  }
  var ValueListObserver = class {
    constructor(element, attributeName, delegate) {
      this.tokenListObserver = new TokenListObserver(element, attributeName, this);
      this.delegate = delegate;
      this.parseResultsByToken = /* @__PURE__ */ new WeakMap();
      this.valuesByTokenByElement = /* @__PURE__ */ new WeakMap();
    }
    get started() {
      return this.tokenListObserver.started;
    }
    start() {
      this.tokenListObserver.start();
    }
    stop() {
      this.tokenListObserver.stop();
    }
    refresh() {
      this.tokenListObserver.refresh();
    }
    get element() {
      return this.tokenListObserver.element;
    }
    get attributeName() {
      return this.tokenListObserver.attributeName;
    }
    tokenMatched(token) {
      const { element } = token;
      const { value } = this.fetchParseResultForToken(token);
      if (value) {
        this.fetchValuesByTokenForElement(element).set(token, value);
        this.delegate.elementMatchedValue(element, value);
      }
    }
    tokenUnmatched(token) {
      const { element } = token;
      const { value } = this.fetchParseResultForToken(token);
      if (value) {
        this.fetchValuesByTokenForElement(element).delete(token);
        this.delegate.elementUnmatchedValue(element, value);
      }
    }
    fetchParseResultForToken(token) {
      let parseResult = this.parseResultsByToken.get(token);
      if (!parseResult) {
        parseResult = this.parseToken(token);
        this.parseResultsByToken.set(token, parseResult);
      }
      return parseResult;
    }
    fetchValuesByTokenForElement(element) {
      let valuesByToken = this.valuesByTokenByElement.get(element);
      if (!valuesByToken) {
        valuesByToken = /* @__PURE__ */ new Map();
        this.valuesByTokenByElement.set(element, valuesByToken);
      }
      return valuesByToken;
    }
    parseToken(token) {
      try {
        const value = this.delegate.parseValueForToken(token);
        return { value };
      } catch (error2) {
        return { error: error2 };
      }
    }
  };
  var BindingObserver = class {
    constructor(context, delegate) {
      this.context = context;
      this.delegate = delegate;
      this.bindingsByAction = /* @__PURE__ */ new Map();
    }
    start() {
      if (!this.valueListObserver) {
        this.valueListObserver = new ValueListObserver(this.element, this.actionAttribute, this);
        this.valueListObserver.start();
      }
    }
    stop() {
      if (this.valueListObserver) {
        this.valueListObserver.stop();
        delete this.valueListObserver;
        this.disconnectAllActions();
      }
    }
    get element() {
      return this.context.element;
    }
    get identifier() {
      return this.context.identifier;
    }
    get actionAttribute() {
      return this.schema.actionAttribute;
    }
    get schema() {
      return this.context.schema;
    }
    get bindings() {
      return Array.from(this.bindingsByAction.values());
    }
    connectAction(action) {
      const binding = new Binding(this.context, action);
      this.bindingsByAction.set(action, binding);
      this.delegate.bindingConnected(binding);
    }
    disconnectAction(action) {
      const binding = this.bindingsByAction.get(action);
      if (binding) {
        this.bindingsByAction.delete(action);
        this.delegate.bindingDisconnected(binding);
      }
    }
    disconnectAllActions() {
      this.bindings.forEach((binding) => this.delegate.bindingDisconnected(binding, true));
      this.bindingsByAction.clear();
    }
    parseValueForToken(token) {
      const action = Action.forToken(token, this.schema);
      if (action.identifier == this.identifier) {
        return action;
      }
    }
    elementMatchedValue(element, action) {
      this.connectAction(action);
    }
    elementUnmatchedValue(element, action) {
      this.disconnectAction(action);
    }
  };
  var ValueObserver = class {
    constructor(context, receiver) {
      this.context = context;
      this.receiver = receiver;
      this.stringMapObserver = new StringMapObserver(this.element, this);
      this.valueDescriptorMap = this.controller.valueDescriptorMap;
    }
    start() {
      this.stringMapObserver.start();
      this.invokeChangedCallbacksForDefaultValues();
    }
    stop() {
      this.stringMapObserver.stop();
    }
    get element() {
      return this.context.element;
    }
    get controller() {
      return this.context.controller;
    }
    getStringMapKeyForAttribute(attributeName) {
      if (attributeName in this.valueDescriptorMap) {
        return this.valueDescriptorMap[attributeName].name;
      }
    }
    stringMapKeyAdded(key2, attributeName) {
      const descriptor = this.valueDescriptorMap[attributeName];
      if (!this.hasValue(key2)) {
        this.invokeChangedCallback(key2, descriptor.writer(this.receiver[key2]), descriptor.writer(descriptor.defaultValue));
      }
    }
    stringMapValueChanged(value, name, oldValue) {
      const descriptor = this.valueDescriptorNameMap[name];
      if (value === null)
        return;
      if (oldValue === null) {
        oldValue = descriptor.writer(descriptor.defaultValue);
      }
      this.invokeChangedCallback(name, value, oldValue);
    }
    stringMapKeyRemoved(key2, attributeName, oldValue) {
      const descriptor = this.valueDescriptorNameMap[key2];
      if (this.hasValue(key2)) {
        this.invokeChangedCallback(key2, descriptor.writer(this.receiver[key2]), oldValue);
      } else {
        this.invokeChangedCallback(key2, descriptor.writer(descriptor.defaultValue), oldValue);
      }
    }
    invokeChangedCallbacksForDefaultValues() {
      for (const { key: key2, name, defaultValue, writer } of this.valueDescriptors) {
        if (defaultValue != void 0 && !this.controller.data.has(key2)) {
          this.invokeChangedCallback(name, writer(defaultValue), void 0);
        }
      }
    }
    invokeChangedCallback(name, rawValue, rawOldValue) {
      const changedMethodName = `${name}Changed`;
      const changedMethod = this.receiver[changedMethodName];
      if (typeof changedMethod == "function") {
        const descriptor = this.valueDescriptorNameMap[name];
        try {
          const value = descriptor.reader(rawValue);
          let oldValue = rawOldValue;
          if (rawOldValue) {
            oldValue = descriptor.reader(rawOldValue);
          }
          changedMethod.call(this.receiver, value, oldValue);
        } catch (error2) {
          if (error2 instanceof TypeError) {
            error2.message = `Stimulus Value "${this.context.identifier}.${descriptor.name}" - ${error2.message}`;
          }
          throw error2;
        }
      }
    }
    get valueDescriptors() {
      const { valueDescriptorMap } = this;
      return Object.keys(valueDescriptorMap).map((key2) => valueDescriptorMap[key2]);
    }
    get valueDescriptorNameMap() {
      const descriptors = {};
      Object.keys(this.valueDescriptorMap).forEach((key2) => {
        const descriptor = this.valueDescriptorMap[key2];
        descriptors[descriptor.name] = descriptor;
      });
      return descriptors;
    }
    hasValue(attributeName) {
      const descriptor = this.valueDescriptorNameMap[attributeName];
      const hasMethodName = `has${capitalize(descriptor.name)}`;
      return this.receiver[hasMethodName];
    }
  };
  var TargetObserver = class {
    constructor(context, delegate) {
      this.context = context;
      this.delegate = delegate;
      this.targetsByName = new Multimap();
    }
    start() {
      if (!this.tokenListObserver) {
        this.tokenListObserver = new TokenListObserver(this.element, this.attributeName, this);
        this.tokenListObserver.start();
      }
    }
    stop() {
      if (this.tokenListObserver) {
        this.disconnectAllTargets();
        this.tokenListObserver.stop();
        delete this.tokenListObserver;
      }
    }
    tokenMatched({ element, content: name }) {
      if (this.scope.containsElement(element)) {
        this.connectTarget(element, name);
      }
    }
    tokenUnmatched({ element, content: name }) {
      this.disconnectTarget(element, name);
    }
    connectTarget(element, name) {
      var _a;
      if (!this.targetsByName.has(name, element)) {
        this.targetsByName.add(name, element);
        (_a = this.tokenListObserver) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.targetConnected(element, name));
      }
    }
    disconnectTarget(element, name) {
      var _a;
      if (this.targetsByName.has(name, element)) {
        this.targetsByName.delete(name, element);
        (_a = this.tokenListObserver) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.targetDisconnected(element, name));
      }
    }
    disconnectAllTargets() {
      for (const name of this.targetsByName.keys) {
        for (const element of this.targetsByName.getValuesForKey(name)) {
          this.disconnectTarget(element, name);
        }
      }
    }
    get attributeName() {
      return `data-${this.context.identifier}-target`;
    }
    get element() {
      return this.context.element;
    }
    get scope() {
      return this.context.scope;
    }
  };
  function readInheritableStaticArrayValues(constructor, propertyName) {
    const ancestors = getAncestorsForConstructor(constructor);
    return Array.from(ancestors.reduce((values, constructor2) => {
      getOwnStaticArrayValues(constructor2, propertyName).forEach((name) => values.add(name));
      return values;
    }, /* @__PURE__ */ new Set()));
  }
  function readInheritableStaticObjectPairs(constructor, propertyName) {
    const ancestors = getAncestorsForConstructor(constructor);
    return ancestors.reduce((pairs, constructor2) => {
      pairs.push(...getOwnStaticObjectPairs(constructor2, propertyName));
      return pairs;
    }, []);
  }
  function getAncestorsForConstructor(constructor) {
    const ancestors = [];
    while (constructor) {
      ancestors.push(constructor);
      constructor = Object.getPrototypeOf(constructor);
    }
    return ancestors.reverse();
  }
  function getOwnStaticArrayValues(constructor, propertyName) {
    const definition = constructor[propertyName];
    return Array.isArray(definition) ? definition : [];
  }
  function getOwnStaticObjectPairs(constructor, propertyName) {
    const definition = constructor[propertyName];
    return definition ? Object.keys(definition).map((key2) => [key2, definition[key2]]) : [];
  }
  var OutletObserver = class {
    constructor(context, delegate) {
      this.started = false;
      this.context = context;
      this.delegate = delegate;
      this.outletsByName = new Multimap();
      this.outletElementsByName = new Multimap();
      this.selectorObserverMap = /* @__PURE__ */ new Map();
      this.attributeObserverMap = /* @__PURE__ */ new Map();
    }
    start() {
      if (!this.started) {
        this.outletDefinitions.forEach((outletName) => {
          this.setupSelectorObserverForOutlet(outletName);
          this.setupAttributeObserverForOutlet(outletName);
        });
        this.started = true;
        this.dependentContexts.forEach((context) => context.refresh());
      }
    }
    refresh() {
      this.selectorObserverMap.forEach((observer) => observer.refresh());
      this.attributeObserverMap.forEach((observer) => observer.refresh());
    }
    stop() {
      if (this.started) {
        this.started = false;
        this.disconnectAllOutlets();
        this.stopSelectorObservers();
        this.stopAttributeObservers();
      }
    }
    stopSelectorObservers() {
      if (this.selectorObserverMap.size > 0) {
        this.selectorObserverMap.forEach((observer) => observer.stop());
        this.selectorObserverMap.clear();
      }
    }
    stopAttributeObservers() {
      if (this.attributeObserverMap.size > 0) {
        this.attributeObserverMap.forEach((observer) => observer.stop());
        this.attributeObserverMap.clear();
      }
    }
    selectorMatched(element, _selector, { outletName }) {
      const outlet = this.getOutlet(element, outletName);
      if (outlet) {
        this.connectOutlet(outlet, element, outletName);
      }
    }
    selectorUnmatched(element, _selector, { outletName }) {
      const outlet = this.getOutletFromMap(element, outletName);
      if (outlet) {
        this.disconnectOutlet(outlet, element, outletName);
      }
    }
    selectorMatchElement(element, { outletName }) {
      const selector = this.selector(outletName);
      const hasOutlet = this.hasOutlet(element, outletName);
      const hasOutletController = element.matches(`[${this.schema.controllerAttribute}~=${outletName}]`);
      if (selector) {
        return hasOutlet && hasOutletController && element.matches(selector);
      } else {
        return false;
      }
    }
    elementMatchedAttribute(_element, attributeName) {
      const outletName = this.getOutletNameFromOutletAttributeName(attributeName);
      if (outletName) {
        this.updateSelectorObserverForOutlet(outletName);
      }
    }
    elementAttributeValueChanged(_element, attributeName) {
      const outletName = this.getOutletNameFromOutletAttributeName(attributeName);
      if (outletName) {
        this.updateSelectorObserverForOutlet(outletName);
      }
    }
    elementUnmatchedAttribute(_element, attributeName) {
      const outletName = this.getOutletNameFromOutletAttributeName(attributeName);
      if (outletName) {
        this.updateSelectorObserverForOutlet(outletName);
      }
    }
    connectOutlet(outlet, element, outletName) {
      var _a;
      if (!this.outletElementsByName.has(outletName, element)) {
        this.outletsByName.add(outletName, outlet);
        this.outletElementsByName.add(outletName, element);
        (_a = this.selectorObserverMap.get(outletName)) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.outletConnected(outlet, element, outletName));
      }
    }
    disconnectOutlet(outlet, element, outletName) {
      var _a;
      if (this.outletElementsByName.has(outletName, element)) {
        this.outletsByName.delete(outletName, outlet);
        this.outletElementsByName.delete(outletName, element);
        (_a = this.selectorObserverMap.get(outletName)) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.outletDisconnected(outlet, element, outletName));
      }
    }
    disconnectAllOutlets() {
      for (const outletName of this.outletElementsByName.keys) {
        for (const element of this.outletElementsByName.getValuesForKey(outletName)) {
          for (const outlet of this.outletsByName.getValuesForKey(outletName)) {
            this.disconnectOutlet(outlet, element, outletName);
          }
        }
      }
    }
    updateSelectorObserverForOutlet(outletName) {
      const observer = this.selectorObserverMap.get(outletName);
      if (observer) {
        observer.selector = this.selector(outletName);
      }
    }
    setupSelectorObserverForOutlet(outletName) {
      const selector = this.selector(outletName);
      const selectorObserver = new SelectorObserver(document.body, selector, this, { outletName });
      this.selectorObserverMap.set(outletName, selectorObserver);
      selectorObserver.start();
    }
    setupAttributeObserverForOutlet(outletName) {
      const attributeName = this.attributeNameForOutletName(outletName);
      const attributeObserver = new AttributeObserver(this.scope.element, attributeName, this);
      this.attributeObserverMap.set(outletName, attributeObserver);
      attributeObserver.start();
    }
    selector(outletName) {
      return this.scope.outlets.getSelectorForOutletName(outletName);
    }
    attributeNameForOutletName(outletName) {
      return this.scope.schema.outletAttributeForScope(this.identifier, outletName);
    }
    getOutletNameFromOutletAttributeName(attributeName) {
      return this.outletDefinitions.find((outletName) => this.attributeNameForOutletName(outletName) === attributeName);
    }
    get outletDependencies() {
      const dependencies = new Multimap();
      this.router.modules.forEach((module) => {
        const constructor = module.definition.controllerConstructor;
        const outlets = readInheritableStaticArrayValues(constructor, "outlets");
        outlets.forEach((outlet) => dependencies.add(outlet, module.identifier));
      });
      return dependencies;
    }
    get outletDefinitions() {
      return this.outletDependencies.getKeysForValue(this.identifier);
    }
    get dependentControllerIdentifiers() {
      return this.outletDependencies.getValuesForKey(this.identifier);
    }
    get dependentContexts() {
      const identifiers = this.dependentControllerIdentifiers;
      return this.router.contexts.filter((context) => identifiers.includes(context.identifier));
    }
    hasOutlet(element, outletName) {
      return !!this.getOutlet(element, outletName) || !!this.getOutletFromMap(element, outletName);
    }
    getOutlet(element, outletName) {
      return this.application.getControllerForElementAndIdentifier(element, outletName);
    }
    getOutletFromMap(element, outletName) {
      return this.outletsByName.getValuesForKey(outletName).find((outlet) => outlet.element === element);
    }
    get scope() {
      return this.context.scope;
    }
    get schema() {
      return this.context.schema;
    }
    get identifier() {
      return this.context.identifier;
    }
    get application() {
      return this.context.application;
    }
    get router() {
      return this.application.router;
    }
  };
  var Context = class {
    constructor(module, scope) {
      this.logDebugActivity = (functionName, detail = {}) => {
        const { identifier, controller, element } = this;
        detail = Object.assign({ identifier, controller, element }, detail);
        this.application.logDebugActivity(this.identifier, functionName, detail);
      };
      this.module = module;
      this.scope = scope;
      this.controller = new module.controllerConstructor(this);
      this.bindingObserver = new BindingObserver(this, this.dispatcher);
      this.valueObserver = new ValueObserver(this, this.controller);
      this.targetObserver = new TargetObserver(this, this);
      this.outletObserver = new OutletObserver(this, this);
      try {
        this.controller.initialize();
        this.logDebugActivity("initialize");
      } catch (error2) {
        this.handleError(error2, "initializing controller");
      }
    }
    connect() {
      this.bindingObserver.start();
      this.valueObserver.start();
      this.targetObserver.start();
      this.outletObserver.start();
      try {
        this.controller.connect();
        this.logDebugActivity("connect");
      } catch (error2) {
        this.handleError(error2, "connecting controller");
      }
    }
    refresh() {
      this.outletObserver.refresh();
    }
    disconnect() {
      try {
        this.controller.disconnect();
        this.logDebugActivity("disconnect");
      } catch (error2) {
        this.handleError(error2, "disconnecting controller");
      }
      this.outletObserver.stop();
      this.targetObserver.stop();
      this.valueObserver.stop();
      this.bindingObserver.stop();
    }
    get application() {
      return this.module.application;
    }
    get identifier() {
      return this.module.identifier;
    }
    get schema() {
      return this.application.schema;
    }
    get dispatcher() {
      return this.application.dispatcher;
    }
    get element() {
      return this.scope.element;
    }
    get parentElement() {
      return this.element.parentElement;
    }
    handleError(error2, message, detail = {}) {
      const { identifier, controller, element } = this;
      detail = Object.assign({ identifier, controller, element }, detail);
      this.application.handleError(error2, `Error ${message}`, detail);
    }
    targetConnected(element, name) {
      this.invokeControllerMethod(`${name}TargetConnected`, element);
    }
    targetDisconnected(element, name) {
      this.invokeControllerMethod(`${name}TargetDisconnected`, element);
    }
    outletConnected(outlet, element, name) {
      this.invokeControllerMethod(`${namespaceCamelize(name)}OutletConnected`, outlet, element);
    }
    outletDisconnected(outlet, element, name) {
      this.invokeControllerMethod(`${namespaceCamelize(name)}OutletDisconnected`, outlet, element);
    }
    invokeControllerMethod(methodName, ...args) {
      const controller = this.controller;
      if (typeof controller[methodName] == "function") {
        controller[methodName](...args);
      }
    }
  };
  function bless(constructor) {
    return shadow(constructor, getBlessedProperties(constructor));
  }
  function shadow(constructor, properties) {
    const shadowConstructor = extend(constructor);
    const shadowProperties = getShadowProperties(constructor.prototype, properties);
    Object.defineProperties(shadowConstructor.prototype, shadowProperties);
    return shadowConstructor;
  }
  function getBlessedProperties(constructor) {
    const blessings = readInheritableStaticArrayValues(constructor, "blessings");
    return blessings.reduce((blessedProperties, blessing) => {
      const properties = blessing(constructor);
      for (const key2 in properties) {
        const descriptor = blessedProperties[key2] || {};
        blessedProperties[key2] = Object.assign(descriptor, properties[key2]);
      }
      return blessedProperties;
    }, {});
  }
  function getShadowProperties(prototype, properties) {
    return getOwnKeys(properties).reduce((shadowProperties, key2) => {
      const descriptor = getShadowedDescriptor(prototype, properties, key2);
      if (descriptor) {
        Object.assign(shadowProperties, { [key2]: descriptor });
      }
      return shadowProperties;
    }, {});
  }
  function getShadowedDescriptor(prototype, properties, key2) {
    const shadowingDescriptor = Object.getOwnPropertyDescriptor(prototype, key2);
    const shadowedByValue = shadowingDescriptor && "value" in shadowingDescriptor;
    if (!shadowedByValue) {
      const descriptor = Object.getOwnPropertyDescriptor(properties, key2).value;
      if (shadowingDescriptor) {
        descriptor.get = shadowingDescriptor.get || descriptor.get;
        descriptor.set = shadowingDescriptor.set || descriptor.set;
      }
      return descriptor;
    }
  }
  var getOwnKeys = (() => {
    if (typeof Object.getOwnPropertySymbols == "function") {
      return (object) => [...Object.getOwnPropertyNames(object), ...Object.getOwnPropertySymbols(object)];
    } else {
      return Object.getOwnPropertyNames;
    }
  })();
  var extend = (() => {
    function extendWithReflect(constructor) {
      function extended() {
        return Reflect.construct(constructor, arguments, new.target);
      }
      extended.prototype = Object.create(constructor.prototype, {
        constructor: { value: extended }
      });
      Reflect.setPrototypeOf(extended, constructor);
      return extended;
    }
    function testReflectExtension() {
      const a = function() {
        this.a.call(this);
      };
      const b = extendWithReflect(a);
      b.prototype.a = function() {
      };
      return new b();
    }
    try {
      testReflectExtension();
      return extendWithReflect;
    } catch (error2) {
      return (constructor) => class extended extends constructor {
      };
    }
  })();
  function blessDefinition(definition) {
    return {
      identifier: definition.identifier,
      controllerConstructor: bless(definition.controllerConstructor)
    };
  }
  var Module = class {
    constructor(application, definition) {
      this.application = application;
      this.definition = blessDefinition(definition);
      this.contextsByScope = /* @__PURE__ */ new WeakMap();
      this.connectedContexts = /* @__PURE__ */ new Set();
    }
    get identifier() {
      return this.definition.identifier;
    }
    get controllerConstructor() {
      return this.definition.controllerConstructor;
    }
    get contexts() {
      return Array.from(this.connectedContexts);
    }
    connectContextForScope(scope) {
      const context = this.fetchContextForScope(scope);
      this.connectedContexts.add(context);
      context.connect();
    }
    disconnectContextForScope(scope) {
      const context = this.contextsByScope.get(scope);
      if (context) {
        this.connectedContexts.delete(context);
        context.disconnect();
      }
    }
    fetchContextForScope(scope) {
      let context = this.contextsByScope.get(scope);
      if (!context) {
        context = new Context(this, scope);
        this.contextsByScope.set(scope, context);
      }
      return context;
    }
  };
  var ClassMap = class {
    constructor(scope) {
      this.scope = scope;
    }
    has(name) {
      return this.data.has(this.getDataKey(name));
    }
    get(name) {
      return this.getAll(name)[0];
    }
    getAll(name) {
      const tokenString = this.data.get(this.getDataKey(name)) || "";
      return tokenize(tokenString);
    }
    getAttributeName(name) {
      return this.data.getAttributeNameForKey(this.getDataKey(name));
    }
    getDataKey(name) {
      return `${name}-class`;
    }
    get data() {
      return this.scope.data;
    }
  };
  var DataMap = class {
    constructor(scope) {
      this.scope = scope;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get(key2) {
      const name = this.getAttributeNameForKey(key2);
      return this.element.getAttribute(name);
    }
    set(key2, value) {
      const name = this.getAttributeNameForKey(key2);
      this.element.setAttribute(name, value);
      return this.get(key2);
    }
    has(key2) {
      const name = this.getAttributeNameForKey(key2);
      return this.element.hasAttribute(name);
    }
    delete(key2) {
      if (this.has(key2)) {
        const name = this.getAttributeNameForKey(key2);
        this.element.removeAttribute(name);
        return true;
      } else {
        return false;
      }
    }
    getAttributeNameForKey(key2) {
      return `data-${this.identifier}-${dasherize(key2)}`;
    }
  };
  var Guide = class {
    constructor(logger) {
      this.warnedKeysByObject = /* @__PURE__ */ new WeakMap();
      this.logger = logger;
    }
    warn(object, key2, message) {
      let warnedKeys = this.warnedKeysByObject.get(object);
      if (!warnedKeys) {
        warnedKeys = /* @__PURE__ */ new Set();
        this.warnedKeysByObject.set(object, warnedKeys);
      }
      if (!warnedKeys.has(key2)) {
        warnedKeys.add(key2);
        this.logger.warn(message, object);
      }
    }
  };
  function attributeValueContainsToken(attributeName, token) {
    return `[${attributeName}~="${token}"]`;
  }
  var TargetSet = class {
    constructor(scope) {
      this.scope = scope;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get schema() {
      return this.scope.schema;
    }
    has(targetName) {
      return this.find(targetName) != null;
    }
    find(...targetNames) {
      return targetNames.reduce((target, targetName) => target || this.findTarget(targetName) || this.findLegacyTarget(targetName), void 0);
    }
    findAll(...targetNames) {
      return targetNames.reduce((targets, targetName) => [
        ...targets,
        ...this.findAllTargets(targetName),
        ...this.findAllLegacyTargets(targetName)
      ], []);
    }
    findTarget(targetName) {
      const selector = this.getSelectorForTargetName(targetName);
      return this.scope.findElement(selector);
    }
    findAllTargets(targetName) {
      const selector = this.getSelectorForTargetName(targetName);
      return this.scope.findAllElements(selector);
    }
    getSelectorForTargetName(targetName) {
      const attributeName = this.schema.targetAttributeForScope(this.identifier);
      return attributeValueContainsToken(attributeName, targetName);
    }
    findLegacyTarget(targetName) {
      const selector = this.getLegacySelectorForTargetName(targetName);
      return this.deprecate(this.scope.findElement(selector), targetName);
    }
    findAllLegacyTargets(targetName) {
      const selector = this.getLegacySelectorForTargetName(targetName);
      return this.scope.findAllElements(selector).map((element) => this.deprecate(element, targetName));
    }
    getLegacySelectorForTargetName(targetName) {
      const targetDescriptor = `${this.identifier}.${targetName}`;
      return attributeValueContainsToken(this.schema.targetAttribute, targetDescriptor);
    }
    deprecate(element, targetName) {
      if (element) {
        const { identifier } = this;
        const attributeName = this.schema.targetAttribute;
        const revisedAttributeName = this.schema.targetAttributeForScope(identifier);
        this.guide.warn(element, `target:${targetName}`, `Please replace ${attributeName}="${identifier}.${targetName}" with ${revisedAttributeName}="${targetName}". The ${attributeName} attribute is deprecated and will be removed in a future version of Stimulus.`);
      }
      return element;
    }
    get guide() {
      return this.scope.guide;
    }
  };
  var OutletSet = class {
    constructor(scope, controllerElement) {
      this.scope = scope;
      this.controllerElement = controllerElement;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get schema() {
      return this.scope.schema;
    }
    has(outletName) {
      return this.find(outletName) != null;
    }
    find(...outletNames) {
      return outletNames.reduce((outlet, outletName) => outlet || this.findOutlet(outletName), void 0);
    }
    findAll(...outletNames) {
      return outletNames.reduce((outlets, outletName) => [...outlets, ...this.findAllOutlets(outletName)], []);
    }
    getSelectorForOutletName(outletName) {
      const attributeName = this.schema.outletAttributeForScope(this.identifier, outletName);
      return this.controllerElement.getAttribute(attributeName);
    }
    findOutlet(outletName) {
      const selector = this.getSelectorForOutletName(outletName);
      if (selector)
        return this.findElement(selector, outletName);
    }
    findAllOutlets(outletName) {
      const selector = this.getSelectorForOutletName(outletName);
      return selector ? this.findAllElements(selector, outletName) : [];
    }
    findElement(selector, outletName) {
      const elements = this.scope.queryElements(selector);
      return elements.filter((element) => this.matchesElement(element, selector, outletName))[0];
    }
    findAllElements(selector, outletName) {
      const elements = this.scope.queryElements(selector);
      return elements.filter((element) => this.matchesElement(element, selector, outletName));
    }
    matchesElement(element, selector, outletName) {
      const controllerAttribute = element.getAttribute(this.scope.schema.controllerAttribute) || "";
      return element.matches(selector) && controllerAttribute.split(" ").includes(outletName);
    }
  };
  var Scope = class _Scope {
    constructor(schema, element, identifier, logger) {
      this.targets = new TargetSet(this);
      this.classes = new ClassMap(this);
      this.data = new DataMap(this);
      this.containsElement = (element2) => {
        return element2.closest(this.controllerSelector) === this.element;
      };
      this.schema = schema;
      this.element = element;
      this.identifier = identifier;
      this.guide = new Guide(logger);
      this.outlets = new OutletSet(this.documentScope, element);
    }
    findElement(selector) {
      return this.element.matches(selector) ? this.element : this.queryElements(selector).find(this.containsElement);
    }
    findAllElements(selector) {
      return [
        ...this.element.matches(selector) ? [this.element] : [],
        ...this.queryElements(selector).filter(this.containsElement)
      ];
    }
    queryElements(selector) {
      return Array.from(this.element.querySelectorAll(selector));
    }
    get controllerSelector() {
      return attributeValueContainsToken(this.schema.controllerAttribute, this.identifier);
    }
    get isDocumentScope() {
      return this.element === document.documentElement;
    }
    get documentScope() {
      return this.isDocumentScope ? this : new _Scope(this.schema, document.documentElement, this.identifier, this.guide.logger);
    }
  };
  var ScopeObserver = class {
    constructor(element, schema, delegate) {
      this.element = element;
      this.schema = schema;
      this.delegate = delegate;
      this.valueListObserver = new ValueListObserver(this.element, this.controllerAttribute, this);
      this.scopesByIdentifierByElement = /* @__PURE__ */ new WeakMap();
      this.scopeReferenceCounts = /* @__PURE__ */ new WeakMap();
    }
    start() {
      this.valueListObserver.start();
    }
    stop() {
      this.valueListObserver.stop();
    }
    get controllerAttribute() {
      return this.schema.controllerAttribute;
    }
    parseValueForToken(token) {
      const { element, content: identifier } = token;
      return this.parseValueForElementAndIdentifier(element, identifier);
    }
    parseValueForElementAndIdentifier(element, identifier) {
      const scopesByIdentifier = this.fetchScopesByIdentifierForElement(element);
      let scope = scopesByIdentifier.get(identifier);
      if (!scope) {
        scope = this.delegate.createScopeForElementAndIdentifier(element, identifier);
        scopesByIdentifier.set(identifier, scope);
      }
      return scope;
    }
    elementMatchedValue(element, value) {
      const referenceCount = (this.scopeReferenceCounts.get(value) || 0) + 1;
      this.scopeReferenceCounts.set(value, referenceCount);
      if (referenceCount == 1) {
        this.delegate.scopeConnected(value);
      }
    }
    elementUnmatchedValue(element, value) {
      const referenceCount = this.scopeReferenceCounts.get(value);
      if (referenceCount) {
        this.scopeReferenceCounts.set(value, referenceCount - 1);
        if (referenceCount == 1) {
          this.delegate.scopeDisconnected(value);
        }
      }
    }
    fetchScopesByIdentifierForElement(element) {
      let scopesByIdentifier = this.scopesByIdentifierByElement.get(element);
      if (!scopesByIdentifier) {
        scopesByIdentifier = /* @__PURE__ */ new Map();
        this.scopesByIdentifierByElement.set(element, scopesByIdentifier);
      }
      return scopesByIdentifier;
    }
  };
  var Router = class {
    constructor(application) {
      this.application = application;
      this.scopeObserver = new ScopeObserver(this.element, this.schema, this);
      this.scopesByIdentifier = new Multimap();
      this.modulesByIdentifier = /* @__PURE__ */ new Map();
    }
    get element() {
      return this.application.element;
    }
    get schema() {
      return this.application.schema;
    }
    get logger() {
      return this.application.logger;
    }
    get controllerAttribute() {
      return this.schema.controllerAttribute;
    }
    get modules() {
      return Array.from(this.modulesByIdentifier.values());
    }
    get contexts() {
      return this.modules.reduce((contexts, module) => contexts.concat(module.contexts), []);
    }
    start() {
      this.scopeObserver.start();
    }
    stop() {
      this.scopeObserver.stop();
    }
    loadDefinition(definition) {
      this.unloadIdentifier(definition.identifier);
      const module = new Module(this.application, definition);
      this.connectModule(module);
      const afterLoad = definition.controllerConstructor.afterLoad;
      if (afterLoad) {
        afterLoad.call(definition.controllerConstructor, definition.identifier, this.application);
      }
    }
    unloadIdentifier(identifier) {
      const module = this.modulesByIdentifier.get(identifier);
      if (module) {
        this.disconnectModule(module);
      }
    }
    getContextForElementAndIdentifier(element, identifier) {
      const module = this.modulesByIdentifier.get(identifier);
      if (module) {
        return module.contexts.find((context) => context.element == element);
      }
    }
    proposeToConnectScopeForElementAndIdentifier(element, identifier) {
      const scope = this.scopeObserver.parseValueForElementAndIdentifier(element, identifier);
      if (scope) {
        this.scopeObserver.elementMatchedValue(scope.element, scope);
      } else {
        console.error(`Couldn't find or create scope for identifier: "${identifier}" and element:`, element);
      }
    }
    handleError(error2, message, detail) {
      this.application.handleError(error2, message, detail);
    }
    createScopeForElementAndIdentifier(element, identifier) {
      return new Scope(this.schema, element, identifier, this.logger);
    }
    scopeConnected(scope) {
      this.scopesByIdentifier.add(scope.identifier, scope);
      const module = this.modulesByIdentifier.get(scope.identifier);
      if (module) {
        module.connectContextForScope(scope);
      }
    }
    scopeDisconnected(scope) {
      this.scopesByIdentifier.delete(scope.identifier, scope);
      const module = this.modulesByIdentifier.get(scope.identifier);
      if (module) {
        module.disconnectContextForScope(scope);
      }
    }
    connectModule(module) {
      this.modulesByIdentifier.set(module.identifier, module);
      const scopes = this.scopesByIdentifier.getValuesForKey(module.identifier);
      scopes.forEach((scope) => module.connectContextForScope(scope));
    }
    disconnectModule(module) {
      this.modulesByIdentifier.delete(module.identifier);
      const scopes = this.scopesByIdentifier.getValuesForKey(module.identifier);
      scopes.forEach((scope) => module.disconnectContextForScope(scope));
    }
  };
  var defaultSchema = {
    controllerAttribute: "data-controller",
    actionAttribute: "data-action",
    targetAttribute: "data-target",
    targetAttributeForScope: (identifier) => `data-${identifier}-target`,
    outletAttributeForScope: (identifier, outlet) => `data-${identifier}-${outlet}-outlet`,
    keyMappings: Object.assign(Object.assign({ enter: "Enter", tab: "Tab", esc: "Escape", space: " ", up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", home: "Home", end: "End", page_up: "PageUp", page_down: "PageDown" }, objectFromEntries("abcdefghijklmnopqrstuvwxyz".split("").map((c) => [c, c]))), objectFromEntries("0123456789".split("").map((n) => [n, n])))
  };
  function objectFromEntries(array) {
    return array.reduce((memo, [k, v]) => Object.assign(Object.assign({}, memo), { [k]: v }), {});
  }
  var Application = class {
    constructor(element = document.documentElement, schema = defaultSchema) {
      this.logger = console;
      this.debug = false;
      this.logDebugActivity = (identifier, functionName, detail = {}) => {
        if (this.debug) {
          this.logFormattedMessage(identifier, functionName, detail);
        }
      };
      this.element = element;
      this.schema = schema;
      this.dispatcher = new Dispatcher(this);
      this.router = new Router(this);
      this.actionDescriptorFilters = Object.assign({}, defaultActionDescriptorFilters);
    }
    static start(element, schema) {
      const application = new this(element, schema);
      application.start();
      return application;
    }
    async start() {
      await domReady();
      this.logDebugActivity("application", "starting");
      this.dispatcher.start();
      this.router.start();
      this.logDebugActivity("application", "start");
    }
    stop() {
      this.logDebugActivity("application", "stopping");
      this.dispatcher.stop();
      this.router.stop();
      this.logDebugActivity("application", "stop");
    }
    register(identifier, controllerConstructor) {
      this.load({ identifier, controllerConstructor });
    }
    registerActionOption(name, filter) {
      this.actionDescriptorFilters[name] = filter;
    }
    load(head, ...rest) {
      const definitions = Array.isArray(head) ? head : [head, ...rest];
      definitions.forEach((definition) => {
        if (definition.controllerConstructor.shouldLoad) {
          this.router.loadDefinition(definition);
        }
      });
    }
    unload(head, ...rest) {
      const identifiers = Array.isArray(head) ? head : [head, ...rest];
      identifiers.forEach((identifier) => this.router.unloadIdentifier(identifier));
    }
    get controllers() {
      return this.router.contexts.map((context) => context.controller);
    }
    getControllerForElementAndIdentifier(element, identifier) {
      const context = this.router.getContextForElementAndIdentifier(element, identifier);
      return context ? context.controller : null;
    }
    handleError(error2, message, detail) {
      var _a;
      this.logger.error(`%s

%o

%o`, message, error2, detail);
      (_a = window.onerror) === null || _a === void 0 ? void 0 : _a.call(window, message, "", 0, 0, error2);
    }
    logFormattedMessage(identifier, functionName, detail = {}) {
      detail = Object.assign({ application: this }, detail);
      this.logger.groupCollapsed(`${identifier} #${functionName}`);
      this.logger.log("details:", Object.assign({}, detail));
      this.logger.groupEnd();
    }
  };
  function domReady() {
    return new Promise((resolve) => {
      if (document.readyState == "loading") {
        document.addEventListener("DOMContentLoaded", () => resolve());
      } else {
        resolve();
      }
    });
  }
  function ClassPropertiesBlessing(constructor) {
    const classes = readInheritableStaticArrayValues(constructor, "classes");
    return classes.reduce((properties, classDefinition) => {
      return Object.assign(properties, propertiesForClassDefinition(classDefinition));
    }, {});
  }
  function propertiesForClassDefinition(key2) {
    return {
      [`${key2}Class`]: {
        get() {
          const { classes } = this;
          if (classes.has(key2)) {
            return classes.get(key2);
          } else {
            const attribute = classes.getAttributeName(key2);
            throw new Error(`Missing attribute "${attribute}"`);
          }
        }
      },
      [`${key2}Classes`]: {
        get() {
          return this.classes.getAll(key2);
        }
      },
      [`has${capitalize(key2)}Class`]: {
        get() {
          return this.classes.has(key2);
        }
      }
    };
  }
  function OutletPropertiesBlessing(constructor) {
    const outlets = readInheritableStaticArrayValues(constructor, "outlets");
    return outlets.reduce((properties, outletDefinition) => {
      return Object.assign(properties, propertiesForOutletDefinition(outletDefinition));
    }, {});
  }
  function getOutletController(controller, element, identifier) {
    return controller.application.getControllerForElementAndIdentifier(element, identifier);
  }
  function getControllerAndEnsureConnectedScope(controller, element, outletName) {
    let outletController = getOutletController(controller, element, outletName);
    if (outletController)
      return outletController;
    controller.application.router.proposeToConnectScopeForElementAndIdentifier(element, outletName);
    outletController = getOutletController(controller, element, outletName);
    if (outletController)
      return outletController;
  }
  function propertiesForOutletDefinition(name) {
    const camelizedName = namespaceCamelize(name);
    return {
      [`${camelizedName}Outlet`]: {
        get() {
          const outletElement = this.outlets.find(name);
          const selector = this.outlets.getSelectorForOutletName(name);
          if (outletElement) {
            const outletController = getControllerAndEnsureConnectedScope(this, outletElement, name);
            if (outletController)
              return outletController;
            throw new Error(`The provided outlet element is missing an outlet controller "${name}" instance for host controller "${this.identifier}"`);
          }
          throw new Error(`Missing outlet element "${name}" for host controller "${this.identifier}". Stimulus couldn't find a matching outlet element using selector "${selector}".`);
        }
      },
      [`${camelizedName}Outlets`]: {
        get() {
          const outlets = this.outlets.findAll(name);
          if (outlets.length > 0) {
            return outlets.map((outletElement) => {
              const outletController = getControllerAndEnsureConnectedScope(this, outletElement, name);
              if (outletController)
                return outletController;
              console.warn(`The provided outlet element is missing an outlet controller "${name}" instance for host controller "${this.identifier}"`, outletElement);
            }).filter((controller) => controller);
          }
          return [];
        }
      },
      [`${camelizedName}OutletElement`]: {
        get() {
          const outletElement = this.outlets.find(name);
          const selector = this.outlets.getSelectorForOutletName(name);
          if (outletElement) {
            return outletElement;
          } else {
            throw new Error(`Missing outlet element "${name}" for host controller "${this.identifier}". Stimulus couldn't find a matching outlet element using selector "${selector}".`);
          }
        }
      },
      [`${camelizedName}OutletElements`]: {
        get() {
          return this.outlets.findAll(name);
        }
      },
      [`has${capitalize(camelizedName)}Outlet`]: {
        get() {
          return this.outlets.has(name);
        }
      }
    };
  }
  function TargetPropertiesBlessing(constructor) {
    const targets = readInheritableStaticArrayValues(constructor, "targets");
    return targets.reduce((properties, targetDefinition) => {
      return Object.assign(properties, propertiesForTargetDefinition(targetDefinition));
    }, {});
  }
  function propertiesForTargetDefinition(name) {
    return {
      [`${name}Target`]: {
        get() {
          const target = this.targets.find(name);
          if (target) {
            return target;
          } else {
            throw new Error(`Missing target element "${name}" for "${this.identifier}" controller`);
          }
        }
      },
      [`${name}Targets`]: {
        get() {
          return this.targets.findAll(name);
        }
      },
      [`has${capitalize(name)}Target`]: {
        get() {
          return this.targets.has(name);
        }
      }
    };
  }
  function ValuePropertiesBlessing(constructor) {
    const valueDefinitionPairs = readInheritableStaticObjectPairs(constructor, "values");
    const propertyDescriptorMap = {
      valueDescriptorMap: {
        get() {
          return valueDefinitionPairs.reduce((result, valueDefinitionPair) => {
            const valueDescriptor = parseValueDefinitionPair(valueDefinitionPair, this.identifier);
            const attributeName = this.data.getAttributeNameForKey(valueDescriptor.key);
            return Object.assign(result, { [attributeName]: valueDescriptor });
          }, {});
        }
      }
    };
    return valueDefinitionPairs.reduce((properties, valueDefinitionPair) => {
      return Object.assign(properties, propertiesForValueDefinitionPair(valueDefinitionPair));
    }, propertyDescriptorMap);
  }
  function propertiesForValueDefinitionPair(valueDefinitionPair, controller) {
    const definition = parseValueDefinitionPair(valueDefinitionPair, controller);
    const { key: key2, name, reader: read, writer: write } = definition;
    return {
      [name]: {
        get() {
          const value = this.data.get(key2);
          if (value !== null) {
            return read(value);
          } else {
            return definition.defaultValue;
          }
        },
        set(value) {
          if (value === void 0) {
            this.data.delete(key2);
          } else {
            this.data.set(key2, write(value));
          }
        }
      },
      [`has${capitalize(name)}`]: {
        get() {
          return this.data.has(key2) || definition.hasCustomDefaultValue;
        }
      }
    };
  }
  function parseValueDefinitionPair([token, typeDefinition], controller) {
    return valueDescriptorForTokenAndTypeDefinition({
      controller,
      token,
      typeDefinition
    });
  }
  function parseValueTypeConstant(constant) {
    switch (constant) {
      case Array:
        return "array";
      case Boolean:
        return "boolean";
      case Number:
        return "number";
      case Object:
        return "object";
      case String:
        return "string";
    }
  }
  function parseValueTypeDefault(defaultValue) {
    switch (typeof defaultValue) {
      case "boolean":
        return "boolean";
      case "number":
        return "number";
      case "string":
        return "string";
    }
    if (Array.isArray(defaultValue))
      return "array";
    if (Object.prototype.toString.call(defaultValue) === "[object Object]")
      return "object";
  }
  function parseValueTypeObject(payload) {
    const { controller, token, typeObject } = payload;
    const hasType = isSomething(typeObject.type);
    const hasDefault = isSomething(typeObject.default);
    const fullObject = hasType && hasDefault;
    const onlyType = hasType && !hasDefault;
    const onlyDefault = !hasType && hasDefault;
    const typeFromObject = parseValueTypeConstant(typeObject.type);
    const typeFromDefaultValue = parseValueTypeDefault(payload.typeObject.default);
    if (onlyType)
      return typeFromObject;
    if (onlyDefault)
      return typeFromDefaultValue;
    if (typeFromObject !== typeFromDefaultValue) {
      const propertyPath = controller ? `${controller}.${token}` : token;
      throw new Error(`The specified default value for the Stimulus Value "${propertyPath}" must match the defined type "${typeFromObject}". The provided default value of "${typeObject.default}" is of type "${typeFromDefaultValue}".`);
    }
    if (fullObject)
      return typeFromObject;
  }
  function parseValueTypeDefinition(payload) {
    const { controller, token, typeDefinition } = payload;
    const typeObject = { controller, token, typeObject: typeDefinition };
    const typeFromObject = parseValueTypeObject(typeObject);
    const typeFromDefaultValue = parseValueTypeDefault(typeDefinition);
    const typeFromConstant = parseValueTypeConstant(typeDefinition);
    const type = typeFromObject || typeFromDefaultValue || typeFromConstant;
    if (type)
      return type;
    const propertyPath = controller ? `${controller}.${typeDefinition}` : token;
    throw new Error(`Unknown value type "${propertyPath}" for "${token}" value`);
  }
  function defaultValueForDefinition(typeDefinition) {
    const constant = parseValueTypeConstant(typeDefinition);
    if (constant)
      return defaultValuesByType[constant];
    const hasDefault = hasProperty(typeDefinition, "default");
    const hasType = hasProperty(typeDefinition, "type");
    const typeObject = typeDefinition;
    if (hasDefault)
      return typeObject.default;
    if (hasType) {
      const { type } = typeObject;
      const constantFromType = parseValueTypeConstant(type);
      if (constantFromType)
        return defaultValuesByType[constantFromType];
    }
    return typeDefinition;
  }
  function valueDescriptorForTokenAndTypeDefinition(payload) {
    const { token, typeDefinition } = payload;
    const key2 = `${dasherize(token)}-value`;
    const type = parseValueTypeDefinition(payload);
    return {
      type,
      key: key2,
      name: camelize(key2),
      get defaultValue() {
        return defaultValueForDefinition(typeDefinition);
      },
      get hasCustomDefaultValue() {
        return parseValueTypeDefault(typeDefinition) !== void 0;
      },
      reader: readers[type],
      writer: writers[type] || writers.default
    };
  }
  var defaultValuesByType = {
    get array() {
      return [];
    },
    boolean: false,
    number: 0,
    get object() {
      return {};
    },
    string: ""
  };
  var readers = {
    array(value) {
      const array = JSON.parse(value);
      if (!Array.isArray(array)) {
        throw new TypeError(`expected value of type "array" but instead got value "${value}" of type "${parseValueTypeDefault(array)}"`);
      }
      return array;
    },
    boolean(value) {
      return !(value == "0" || String(value).toLowerCase() == "false");
    },
    number(value) {
      return Number(value.replace(/_/g, ""));
    },
    object(value) {
      const object = JSON.parse(value);
      if (object === null || typeof object != "object" || Array.isArray(object)) {
        throw new TypeError(`expected value of type "object" but instead got value "${value}" of type "${parseValueTypeDefault(object)}"`);
      }
      return object;
    },
    string(value) {
      return value;
    }
  };
  var writers = {
    default: writeString,
    array: writeJSON,
    object: writeJSON
  };
  function writeJSON(value) {
    return JSON.stringify(value);
  }
  function writeString(value) {
    return `${value}`;
  }
  var Controller = class {
    constructor(context) {
      this.context = context;
    }
    static get shouldLoad() {
      return true;
    }
    static afterLoad(_identifier, _application) {
      return;
    }
    get application() {
      return this.context.application;
    }
    get scope() {
      return this.context.scope;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get targets() {
      return this.scope.targets;
    }
    get outlets() {
      return this.scope.outlets;
    }
    get classes() {
      return this.scope.classes;
    }
    get data() {
      return this.scope.data;
    }
    initialize() {
    }
    connect() {
    }
    disconnect() {
    }
    dispatch(eventName, { target = this.element, detail = {}, prefix = this.identifier, bubbles = true, cancelable = true } = {}) {
      const type = prefix ? `${prefix}:${eventName}` : eventName;
      const event = new CustomEvent(type, { detail, bubbles, cancelable });
      target.dispatchEvent(event);
      return event;
    }
  };
  Controller.blessings = [
    ClassPropertiesBlessing,
    TargetPropertiesBlessing,
    ValuePropertiesBlessing,
    OutletPropertiesBlessing
  ];
  Controller.targets = [];
  Controller.outlets = [];
  Controller.values = {};

  // web/src/controllers/checks_controller.ts
  var ChecksController = class extends Controller {
    static {
      this.targets = ["status", "output"];
    }
    async refresh() {
      this.statusTarget.textContent = "loading\u2026";
      this.outputTarget.textContent = "";
      try {
        const res = await fetch("/api/checks");
        const data = await res.json();
        this.statusTarget.textContent = data.status;
        this.statusTarget.className = this.statusClasses(data.status);
        if (data.output) {
          this.outputTarget.textContent = data.output;
        }
        if (data.error) {
          this.outputTarget.textContent = data.error;
        }
      } catch {
        this.statusTarget.textContent = "error";
        this.statusTarget.className = "text-sm font-semibold text-red-500";
      }
    }
    statusClasses(status) {
      switch (status) {
        case "pass":
          return "text-sm font-semibold text-green-600";
        case "fail":
          return "text-sm font-semibold text-red-500";
        default:
          return "text-sm font-semibold text-gray-500";
      }
    }
  };

  // web/src/controllers/review_controller.ts
  var import_diff2html_ui_slim = __toESM(require_diff2html_ui_slim(), 1);
  var ReviewController = class _ReviewController extends Controller {
    constructor() {
      super(...arguments);
      this.comments = [];
      this.activeForm = null;
      this.selection = null;
      this.mode = "worktree" /* Worktree */;
    }
    static {
      this.targets = [
        "output",
        "fileExplorer",
        "branchSelect",
        "baseBranchSelect",
        "commitSelect",
        "sidebar",
        "sidebarToggle"
      ];
    }
    static {
      this.values = {
        diff: { type: Object, default: {} },
        sidebarVisible: { type: Boolean, default: true }
      };
    }
    static {
      this.STORAGE_KEY = "rv-comments";
    }
    diffValueChanged() {
      this.outputTarget.innerHTML = "";
      const diff2htmlUi = new import_diff2html_ui_slim.Diff2HtmlUI(this.outputTarget, this.diffValue.diff, {
        drawFileList: true,
        matching: "lines",
        outputFormat: "side-by-side"
      });
      diff2htmlUi.draw();
      this.renderFileExplorer();
      this.loadComments();
      this.renderCommentsList();
    }
    toggleSidebar() {
      this.sidebarVisibleValue = !this.sidebarVisibleValue;
    }
    sidebarVisibleValueChanged() {
      if (this.sidebarVisibleValue) {
        this.sidebarTarget.style.display = "";
        this.sidebarToggleTarget.textContent = "\u25C0";
      } else {
        this.sidebarTarget.style.display = "none";
        this.sidebarToggleTarget.textContent = "\u25B6";
      }
    }
    async connect() {
      this.loadComments();
      await this.loadBranches();
      await this.reloadReview();
      this.outputTarget.addEventListener("mousedown", (e) => {
        if (!(e.target instanceof HTMLElement)) {
          return;
        }
        if (!e.target.classList.contains("d2h-code-side-linenumber")) {
          return;
        }
        const lineNumber = Number(e.target.textContent);
        if (isNaN(lineNumber)) return;
        const fileDiffContainer = e.target.closest(".d2h-file-wrapper");
        const fileName = fileDiffContainer.querySelector(".d2h-file-name")?.textContent?.trim() || "unknown";
        const diffSide = this.getDiffSide(e.target);
        if (this.selection === null) {
          this.selection = { fileName, startLine: lineNumber, diffSide };
          return;
        }
        this.selection.endLine = lineNumber;
        this.handleSelectionEnded(e.target, this.selection);
      });
    }
    deriveMode() {
      const branch = this.branchSelectTarget.value;
      const commit = this.commitSelectTarget.value;
      if (commit) return "commit" /* Commit */;
      if (!branch) return "worktree" /* Worktree */;
      return "branch" /* Branch */;
    }
    applyModeConstraints() {
      switch (this.mode) {
        case "worktree" /* Worktree */:
          this.commitSelectTarget.disabled = true;
          this.baseBranchSelectTarget.disabled = false;
          break;
        case "branch" /* Branch */:
          this.commitSelectTarget.disabled = false;
          this.baseBranchSelectTarget.disabled = false;
          break;
        case "commit" /* Commit */:
          this.commitSelectTarget.disabled = false;
          this.baseBranchSelectTarget.disabled = true;
          break;
      }
    }
    async reloadReview() {
      this.mode = this.deriveMode();
      this.applyModeConstraints();
      if (this.mode !== "commit" /* Commit */) {
        const branch = this.branchSelectTarget.value;
        const baseBranch = this.baseBranchSelectTarget.value;
        await this.loadCommits(branch, baseBranch);
      }
      await this.fetchDiff();
    }
    async loadBranches() {
      const res = await fetch("/api/branches");
      const data = await res.json();
      const currentBranch = data.current;
      for (const branch of data.branches) {
        const option = document.createElement("option");
        option.value = branch;
        option.textContent = branch;
        this.branchSelectTarget.appendChild(option);
      }
      const baseBranches = data.branches.filter((branch) => branch !== currentBranch).sort((a, b) => a.localeCompare(b));
      if (!this.baseBranchSelectTarget.options.length) {
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Default (main/master)";
        this.baseBranchSelectTarget.appendChild(defaultOption);
      }
      for (const branch of baseBranches) {
        const option = document.createElement("option");
        option.value = branch;
        option.textContent = branch;
        this.baseBranchSelectTarget.appendChild(option);
      }
    }
    clearCommitOptions() {
      this.commitSelectTarget.innerHTML = "";
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "All commits (branch diff)";
      this.commitSelectTarget.appendChild(option);
    }
    async loadCommits(branch, baseBranch) {
      this.clearCommitOptions();
      if (!branch) return;
      const params = new URLSearchParams({ branch });
      if (baseBranch) {
        params.set("base", baseBranch);
      }
      const res = await fetch(`/api/commits?${params.toString()}`);
      const data = await res.json();
      for (const commit of data.commits) {
        const option = document.createElement("option");
        option.value = commit.hash;
        option.textContent = commit.label;
        this.commitSelectTarget.appendChild(option);
      }
    }
    async fetchDiff() {
      const branch = this.branchSelectTarget.value;
      const commit = this.commitSelectTarget.value;
      const baseBranch = this.baseBranchSelectTarget.value;
      const params = new URLSearchParams();
      if (commit) {
        params.set("commit", commit);
      } else if (branch) {
        params.set("branch", branch);
      }
      if (this.mode !== "commit" /* Commit */ && baseBranch) {
        params.set("base", baseBranch);
      }
      const url = params.toString() ? `/api/diff?${params.toString()}` : "/api/diff";
      const res = await fetch(url);
      const data = await res.json();
      this.outputTarget.innerHTML = "";
      const diff2htmlUi = new import_diff2html_ui_slim.Diff2HtmlUI(this.outputTarget, data.diff, {
        drawFileList: true,
        matching: "lines",
        outputFormat: "side-by-side"
      });
      diff2htmlUi.draw();
      this.diffValue = data;
      this.loadComments();
      this.renderCommentsList();
    }
    async branchChanged() {
      await this.reloadReview();
    }
    async baseBranchChanged() {
      await this.reloadReview();
    }
    async commitChanged() {
      await this.reloadReview();
    }
    getDiffSide(element) {
      const filesDiv = element.closest(".d2h-files-diff");
      if (!filesDiv) return "new" /* New */;
      const sides = Array.from(
        filesDiv.querySelectorAll(":scope > .d2h-file-side-diff")
      );
      const sideDiv = element.closest(".d2h-file-side-diff");
      if (sideDiv === sides[0]) return "old" /* Old */;
      return "new" /* New */;
    }
    handleSelectionEnded(target, selection) {
      const row = target.closest("tr") || target.closest(".d2h-code-line-ctn")?.parentElement;
      if (!row) return;
      this.selection = null;
      if (this.activeForm) {
        this.activeForm.remove();
        this.activeForm = null;
      }
      const { fileName, startLine, endLine, diffSide } = selection;
      const form = document.createElement("tr");
      form.innerHTML = `
      <td colspan="99" class="p-2 bg-yellow-50 border border-yellow-200">
        <div class="flex flex-col gap-2">
          <span class="text-xs text-gray-500">${fileName} (${diffSide}) : ${startLine}-${endLine}</span>
          <textarea
            class="w-full rounded border border-gray-300 p-2 text-sm"
            rows="3"
            placeholder="Write a comment..."
          ></textarea>
          <div class="flex gap-2">
            <button
              type="button"
              class="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
              data-action="submit"
            >
              Comment
            </button>
            <button
              type="button"
              class="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
              data-action="cancel"
            >
              Cancel
            </button>
          </div>
        </div>
      </td>
    `;
      form.querySelector('[data-action="submit"]').addEventListener("click", () => {
        const textarea = form.querySelector("textarea");
        const text = textarea.value.trim();
        if (text) {
          this.addComment(selection, text);
          form.remove();
          this.activeForm = null;
        }
      });
      form.querySelector('[data-action="cancel"]').addEventListener("click", () => {
        form.remove();
        this.activeForm = null;
      });
      row.insertAdjacentElement("afterend", form);
      this.activeForm = form;
      form.querySelector("textarea").focus();
    }
    addComment(selection, text) {
      const branch = this.branchSelectTarget.value || "current";
      const comment = { selection, text, branch };
      this.comments.push(comment);
      this.saveComments();
      this.renderCommentsList();
    }
    async finishReview(e) {
      const btn = e.currentTarget;
      const currentBranch = this.branchSelectTarget.value || "current";
      const branchComments = this.comments.filter((c) => c.branch === currentBranch);
      if (branchComments.length === 0) {
        this.showButtonFeedback(btn, "No comments to copy");
        return;
      }
      const blocks = branchComments.map((c) => {
        const s = c.selection;
        const sideLabel = s.diffSide === "old" /* Old */ ? "old code (before the change)" : "new code (after the change)";
        return `${s.fileName} lines ${s.startLine}-${s.endLine} on the ${sideLabel}

\`\`\`
${c.text}
\`\`\``;
      });
      const reviewText = "Here's the review of the user:\n\n" + blocks.join("\n\n---\n\n");
      await navigator.clipboard.writeText(reviewText);
      this.comments = this.comments.filter((c) => c.branch !== currentBranch);
      this.saveComments();
      this.renderCommentsList();
      this.showButtonFeedback(btn, "Copied to clipboard!");
    }
    showButtonFeedback(btn, message) {
      const original = btn.textContent;
      btn.textContent = message;
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
      }, 2e3);
    }
    removeComment(e) {
      const btn = e.currentTarget;
      const index = parseInt(btn.dataset.index || "0", 10);
      this.comments.splice(index, 1);
      this.saveComments();
      this.renderCommentsList();
    }
    buildFileTree(files) {
      const root = /* @__PURE__ */ new Map();
      for (const file of files) {
        const parts = file.split("/");
        let current = root;
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          const isFile = i === parts.length - 1;
          if (isFile) {
            current.set(part, file);
          } else {
            if (!current.has(part)) {
              current.set(part, /* @__PURE__ */ new Map());
            }
            current = current.get(part);
          }
        }
      }
      return root;
    }
    renderTreeLevel(parent, tree, hrefMap, depth) {
      const entries = Array.from(tree.entries());
      const folders = entries.filter(([, v]) => v instanceof Map);
      const files = entries.filter(([, v]) => typeof v === "string");
      for (const [name, subtree] of folders) {
        const folderEl = document.createElement("div");
        folderEl.style.paddingLeft = `${depth * 12}px`;
        const label = document.createElement("span");
        label.className = "flex items-center gap-1 py-0.5 text-xs font-medium text-gray-500";
        label.textContent = `\u{1F4C1} ${name}`;
        folderEl.appendChild(label);
        parent.appendChild(folderEl);
        this.renderTreeLevel(parent, subtree, hrefMap, depth + 1);
      }
      for (const [name, fullPath] of files) {
        const fileEl = document.createElement("div");
        fileEl.style.paddingLeft = `${depth * 12}px`;
        const a = document.createElement("a");
        a.className = "block truncate rounded px-1 py-0.5 text-xs text-gray-700 hover:bg-gray-100";
        a.textContent = name;
        const hash = hrefMap.get(fullPath);
        if (hash) a.href = hash;
        fileEl.appendChild(a);
        parent.appendChild(fileEl);
      }
    }
    renderFileExplorer() {
      const nav = this.fileExplorerTarget;
      nav.innerHTML = "";
      const title = document.createElement("h3");
      title.className = "mb-2 text-sm font-semibold text-gray-700";
      title.textContent = "Files";
      nav.appendChild(title);
      const fileLinks = this.outputTarget.querySelectorAll(
        ".d2h-file-list a.d2h-file-name"
      );
      const hrefMap = /* @__PURE__ */ new Map();
      fileLinks.forEach((a) => {
        const name = a.textContent?.trim();
        if (name && a.hash) hrefMap.set(name, a.hash);
      });
      const tree = this.buildFileTree(this.diffValue.files || []);
      const container = document.createElement("div");
      container.className = "flex flex-col";
      this.renderTreeLevel(container, tree, hrefMap, 0);
      nav.appendChild(container);
    }
    renderCommentsList() {
      this.outputTarget.querySelectorAll(".rv-comment-btn").forEach((el) => {
        if (el.tagName === "TR") {
          el.querySelectorAll(".d2h-code-side-linenumber").forEach((ln) => {
            ln.style.backgroundColor = "";
          });
          el.classList.remove("rv-comment-btn");
        } else {
          el.remove();
        }
      });
      this.outputTarget.querySelectorAll(".rv-comment-popup").forEach((popup) => popup.remove());
      const currentBranch = this.branchSelectTarget.value || "current";
      const filteredComments = this.comments.filter(
        (c) => c.branch === currentBranch
      );
      if (filteredComments.length === 0) {
        return;
      }
      const fileWrappers = Array.from(
        this.outputTarget.querySelectorAll(".d2h-file-wrapper")
      );
      for (const comment of filteredComments) {
        const { fileName, startLine, diffSide } = comment.selection;
        for (const wrapper of fileWrappers) {
          const fileNameEl = wrapper.querySelector(".d2h-file-name");
          const wrapperFileName = fileNameEl?.textContent?.trim();
          if (wrapperFileName !== fileName) continue;
          const filesDiv = wrapper.querySelector(".d2h-files-diff");
          if (!filesDiv) continue;
          const sides = Array.from(
            filesDiv.querySelectorAll(":scope > .d2h-file-side-diff")
          );
          const sideContainer = diffSide === "old" /* Old */ ? sides[0] : sides[1];
          if (!sideContainer) continue;
          const { endLine } = comment.selection;
          const lineNumberEls = Array.from(
            sideContainer.querySelectorAll(".d2h-code-side-linenumber")
          );
          let firstRow = null;
          for (const lineEl of lineNumberEls) {
            const num = Number(lineEl.textContent);
            if (isNaN(num) || num < startLine || num > endLine) continue;
            const row = lineEl.closest("tr");
            if (!row) continue;
            row.classList.add("rv-comment-btn");
            lineEl.style.backgroundColor = "rgba(250, 204, 21, 0.15)";
            if (!firstRow) firstRow = row;
          }
          if (!firstRow) continue;
          firstRow.style.position = "relative";
          const btn = document.createElement("button");
          btn.className = "rv-comment-btn absolute -left-1 top-0 w-5 h-5 rounded-full bg-yellow-400 text-[10px] leading-5 text-center cursor-pointer hover:bg-yellow-500 z-10";
          btn.textContent = "\u{1F4AC}";
          btn.title = comment.text;
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const existing = firstRow.querySelector(".rv-comment-popup");
            if (existing) {
              existing.remove();
              return;
            }
            const popup = document.createElement("div");
            popup.className = "rv-comment-popup absolute left-6 top-0 w-64 p-2 bg-white border border-gray-300 rounded shadow-lg text-sm z-20";
            popup.addEventListener("click", (ev) => ev.stopPropagation());
            const textEl = document.createElement("p");
            textEl.textContent = comment.text;
            popup.appendChild(textEl);
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "mt-2 rounded bg-red-500 px-2 py-0.5 text-xs text-white hover:bg-red-600";
            deleteBtn.textContent = "Delete";
            deleteBtn.addEventListener("click", () => {
              const idx = this.comments.indexOf(comment);
              if (idx !== -1) {
                this.comments.splice(idx, 1);
                this.saveComments();
                this.renderCommentsList();
              }
            });
            popup.appendChild(deleteBtn);
            firstRow.appendChild(popup);
            const close = () => {
              popup.remove();
              document.removeEventListener("click", close);
            };
            document.addEventListener("click", close);
          });
          firstRow.appendChild(btn);
        }
      }
    }
    saveComments() {
      localStorage.setItem(
        _ReviewController.STORAGE_KEY,
        JSON.stringify(this.comments)
      );
    }
    loadComments() {
      const stored = localStorage.getItem(_ReviewController.STORAGE_KEY);
      if (stored) {
        try {
          this.comments = JSON.parse(stored);
        } catch {
          this.comments = [];
          localStorage.removeItem(_ReviewController.STORAGE_KEY);
        }
      }
    }
  };

  // web/src/main.ts
  window.Stimulus = Application.start();
  window.Stimulus.register("checks", ChecksController);
  window.Stimulus.register("review", ReviewController);
})();
