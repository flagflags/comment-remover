const S = {
    NORMAL:         0,
    LINE_CMT:       1,
    BLOCK_CMT:      2,
    BLOCK_STAR:     3,
    STR_D:          4,
    STR_S:          5,
    ESC_D:          6,
    ESC_S:          7,
    HTML_CMT:       8,
    HTML_D1:        9,
    HTML_D2:        10
};

function removeComments(src, lang) {
    let out   = '';
    let state = S.NORMAL;
    let count = 0;
    let chars = 0;
    const n   = src.length;

    for (let i = 0; i < n; i++) {
        const c  = src[i];
        const nx = i + 1 < n ? src[i + 1] : '';

        if (state === S.NORMAL) {
            if (lang === 'html') {
                if (c === '<' && nx === '!' && src[i+2] === '-' && src[i+3] === '-') {
                    state = S.HTML_CMT;
                    chars += 4;
                    count++;
                    i += 3;
                    continue;
                }
            } else {
                if (c === '/' && nx === '/') {
                    state = S.LINE_CMT;
                    chars += 2;
                    count++;
                    i++;
                    continue;
                }
                if (c === '/' && nx === '*') {
                    state = S.BLOCK_CMT;
                    chars += 2;
                    count++;
                    i++;
                    continue;
                }
            }
            if (c === '"') {
                state = S.STR_D;
                out += c;
            } else if (c === "'" && lang !== 'html') {
                state = S.STR_S;
                out += c;
            } else {
                out += c;
            }
            continue;
        }

        if (state === S.LINE_CMT) {
            if (c === '\n') {
                state = S.NORMAL;
                out += c;
            } else {
                chars++;
            }
            continue;
        }

        if (state === S.BLOCK_CMT) {
            chars++;
            if (c === '*') state = S.BLOCK_STAR;
            continue;
        }

        if (state === S.BLOCK_STAR) {
            chars++;
            if (c === '/') state = S.NORMAL;
            else if (c !== '*') state = S.BLOCK_CMT;
            continue;
        }

        if (state === S.STR_D) {
            out += c;
            if (c === '\\') state = S.ESC_D;
            else if (c === '"') state = S.NORMAL;
            continue;
        }

        if (state === S.STR_S) {
            out += c;
            if (c === '\\') state = S.ESC_S;
            else if (c === "'") state = S.NORMAL;
            continue;
        }

        if (state === S.ESC_D) {
            out += c;
            state = S.STR_D;
            continue;
        }

        if (state === S.ESC_S) {
            out += c;
            state = S.STR_S;
            continue;
        }

        if (state === S.HTML_CMT) {
            chars++;
            if (c === '-') state = S.HTML_D1;
            continue;
        }

        if (state === S.HTML_D1) {
            chars++;
            if (c === '-') state = S.HTML_D2;
            else state = S.HTML_CMT;
            continue;
        }

        if (state === S.HTML_D2) {
            chars++;
            if (c === '>') state = S.NORMAL;
            else if (c !== '-') state = S.HTML_CMT;
            continue;
        }
    }

    return { out, count, chars };
}

function detectLang(src) {
    const t = src.trim();

    if (/^\s*#include\s*[<"]/m.test(t) ||
        /\bstd::/      .test(t) ||
        /\bcout\s*<</  .test(t) ||
        /\bint\s+main\s*\(/.test(t) ||
        /\b(nullptr|cout|cin|endl|vector|template\s*<)/.test(t)) {
        return 'cpp';
    }

    if (/^\s*<(!DOCTYPE|html)/i.test(t) || /<!--/.test(t)) {
        return 'html';
    }

    if (/^\s*using\s+System/.test(t) ||
        /\bnamespace\s+\w+\s*\{/.test(t) ||
        /\bConsole\.(Write|Read)/.test(t) ||
        /^\s*#region\b/m.test(t)) {
        return 'csharp';
    }

    return 'web';
}

const langLabels = {
    cpp:    'c++',
    html:   'html',
    csharp: 'c#',
    web:    'javascript / css'
};

const elInput    = document.getElementById('input');
const elOutput   = document.getElementById('output');
const elLang     = document.getElementById('lang');
const elLines    = document.getElementById('lines');
const elProcess  = document.getElementById('process');
const elClear    = document.getElementById('clear');
const elStatus   = document.getElementById('status');
const elStats    = document.getElementById('stats');

elProcess.addEventListener('click', () => {
    const src = elInput.value;
    if (!src.trim()) {
        elStatus.textContent = 'no input';
        return;
    }

    let lang = elLang.value;
    let detected = false;

    if (lang === 'auto') {
        lang = detectLang(src);
        detected = true;
    }

    const { out, count, chars } = removeComments(src, lang);

    let cleaned = out;
    if (!elLines.checked) {
        cleaned = cleaned.replace(/^[ \t]*\r?\n/gm, '');
    }

    elOutput.value = cleaned;

    const linesBefore = src.split('\n').length;
    const linesAfter  = cleaned.split('\n').length;
    const linesDiff   = Math.max(0, linesBefore - linesAfter);

    elStatus.textContent = detected ? `detected: ${langLabels[lang]}` : 'done';
    elStats.textContent  = `${count} comment(s) · ${linesDiff} line(s) · ${chars} char(s) removed`;
});

elClear.addEventListener('click', () => {
    elInput.value  = '';
    elOutput.value = '';
    elStatus.textContent = 'ready';
    elStats.textContent  = '';
    elInput.focus();
});

elInput.addEventListener('input', () => {
    elStatus.textContent = 'ready';
    elStats.textContent  = '';
});

document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'Enter')  elProcess.click();
    if (e.ctrlKey && e.key === 'Delete') elClear.click();
});