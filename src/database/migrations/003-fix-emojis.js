// Corrige emojis quebrados
const db = require("../database");

const broken = db.prepare("SELECT slug, emoji FROM produtos").all();
const replacements = {
    "duplo-cheddar": "🧀",
    "big-cheddar":   "🧀"
};

let fixed = 0;
for (const p of broken) {
    if (replacements[p.slug]) {
        db.prepare("UPDATE produtos SET emoji = ? WHERE slug = ?").run(replacements[p.slug], p.slug);
        console.log(`  ${p.slug}: ${JSON.stringify(p.emoji)} -> ${replacements[p.slug]}`);
        fixed++;
    }
}
console.log(`\n${fixed} emoji(s) corrigido(s)`);
