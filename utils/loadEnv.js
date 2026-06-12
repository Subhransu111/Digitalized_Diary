const fs = require('fs');
const path = require('path');

const parseEnvLine = (line) => {
    const match = line.match(/^\s*(?:export\s+)?([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!match) return null;

    const key = match[1];
    let value = (match[2] || '').trim();
    const quote = value[0];

    if ((quote === '"' || quote === "'") && value[value.length - 1] === quote) {
        value = value.slice(1, -1);
    } else {
        value = value.replace(/\s+#.*$/, '');
    }

    return { key, value };
};

const loadEnv = (envPath = path.resolve(__dirname, '..', '.env')) => {
    if (!fs.existsSync(envPath)) return;

    const file = fs.readFileSync(envPath, 'utf8');

    file.split(/\r?\n/).forEach((line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) return;

        const parsed = parseEnvLine(line);
        if (!parsed || process.env[parsed.key] !== undefined) return;

        process.env[parsed.key] = parsed.value;
    });
};

module.exports = loadEnv;
