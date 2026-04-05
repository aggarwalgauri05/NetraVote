const fs = require('fs');
const path = require('path');

const rules = [
    { regex: /bg-obsidian-900/g, replacement: 'bg-slate-50 dark:bg-obsidian-900' },
    { regex: /bg-obsidian-950\/80/g, replacement: 'bg-white/80 dark:bg-obsidian-950/80' },
    { regex: /bg-obsidian-950/g, replacement: 'bg-white dark:bg-obsidian-950' },
    { regex: /bg-white\/\[0\.02\]/g, replacement: 'bg-white shadow-sm dark:shadow-none dark:bg-white/[0.02]' },
    { regex: /bg-white\/\[0\.01\]/g, replacement: 'bg-white shadow-sm dark:shadow-none dark:bg-white/[0.01]' },
    { regex: /bg-white\/\[0\.03\]/g, replacement: 'bg-white shadow-md dark:shadow-none dark:bg-white/[0.03]' },
    { regex: /bg-white\/\[0\.04\]/g, replacement: 'bg-slate-50 shadow-md dark:shadow-none dark:bg-white/[0.04]' },
    { regex: /bg-white\/\[0\.05\]/g, replacement: 'bg-slate-100 shadow-md dark:shadow-none dark:bg-white/[0.05]' },
    { regex: /bg-white\/5/g, replacement: 'bg-slate-100 dark:bg-white/5' },
    { regex: /border-white\/5/g, replacement: 'border-slate-200 dark:border-white/5' },
    { regex: /border-white\/10/g, replacement: 'border-slate-200 dark:border-white/10' },
    { regex: /text-slate-200/g, replacement: 'text-slate-800 dark:text-slate-200' },
    { regex: /text-slate-300/g, replacement: 'text-slate-700 dark:text-slate-300' },
    { regex: /text-slate-400/g, replacement: 'text-slate-500 dark:text-slate-400' },
    { regex: /text-white/g, replacement: 'text-slate-900 dark:text-white' },
];

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            for (const rule of rules) {
                if (rule.regex.test(content)) {
                    content = content.replace(rule.regex, rule.replacement);
                    modified = true;
                }
            }
            // Add clickability
            // Replace "glass-panel" with "glass-panel hover:scale-[1.01] transition-transform duration-300 cursor-pointer"
            if (content.includes('glass-panel') && !content.includes('hover:scale-[1.01]')) {
             content = content.replace(/glass-panel(\s)/g, 'glass-panel cursor-pointer hover:scale-[1.01] hover:shadow-xl transition-all duration-300 active:scale-[0.99] $1');
             modified = true;
            }
            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated ' + fullPath);
            }
        }
    }
}

processDir('src');
