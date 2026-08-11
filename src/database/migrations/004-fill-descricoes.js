// Preenche descrições dos produtos que ficaram vazias após a migração.
const db = require("../database");

const descricoes = {
    "misto-quente":         "Pão, presunto, queijo e manteiga.",
    "misto-especial":       "Pão, presunto, queijo, tomate e orégano.",
    "hamburger-salada":     "Pão, hambúrguer, alface, tomate e maionese.",
    "x-egg":                "Pão, hambúrguer, queijo, ovo, alface e tomate.",
    "x-burguer-salada":     "Pão, hambúrguer, queijo, alface, tomate e maionese.",
    "x-burguer-especial":   "Pão, hambúrguer, queijo, presunto, ovo, alface e tomate.",
    "vegetariano":          "Pão, hambúrguer de grão-de-bico, queijo, alface e tomate.",
    "havaneiro":            "Pão, hambúrguer, queijo, presunto, ovo e abacaxi.",
    "hawai":                "Pão, hambúrguer, queijo, presunto e abacaxi.",
    "x-bacon":              "Pão, hambúrguer, queijo, bacon, alface e tomate.",
    "kanguru":              "Pão, hambúrguer, queijo, presunto, ovo e bacon.",
    "x-egg-bacon":          "Pão, hambúrguer, queijo, ovo, bacon, alface e tomate.",
    "lacador":              "Pão, hambúrguer, queijo, bacon, ovo, alface e tomate.",
    "x-tudo":               "Pão, hambúrguer, queijo, presunto, ovo, bacon, alface e tomate.",
    "x-frango-especial":    "Pão, filé de frango, queijo, presunto, alface e tomate.",
    "x-frango-super":       "Pão, filé de frango, queijo, bacon, ovo, alface e tomate.",
    "big-lee":              "Pão brioche, hambúrguer artesanal, queijo, bacon, alface e molho da casa.",
    "big-smash":            "Pão brioche, hambúrguer smash, queijo cheddar e molho barbecue.",
    "big-cheese":           "Pão brioche, hambúrguer artesanal, queijo prato, cheddar e catupiry.",
    "big-gourmet":          "Pão brioche, hambúrguer artesanal, queijo, cebola caramelizada e molho mostarda.",
    "gourmet-fitness":      "Pão integral, hambúrguer de frango, queijo branco, alface e tomate.",
    "mega-big":             "Pão brioche, dois hambúrgueres artesanais, queijo, bacon e molho da casa.",
    "big-monster":          "Pão brioche, três hambúrgueres artesanais, queijo, bacon, ovo e molho da casa.",
    "x-picanha":            "Pão, hambúrguer de picanha, queijo, bacon, alface e tomate.",
    "big-3":                "Pão, três hambúrgueres, queijo, bacon e molho da casa.",
    "big-cheddar":          "Pão, hambúrguer, cheddar cremoso, bacon e cebola caramelizada.",
    "duplo-cheddar":        "Pão, dois hambúrgueres, cheddar duplo, bacon e cebola caramelizada.",
    "desterreao":           "Pão, hambúrguer de picanha, cheddar, bacon, ovo, alface e tomate.",
    "batata-palito":        "Porção de batata palito crocante.",
    "batata-bacon-cheddar": "Batata palito crocante coberta com bacon e cheddar.",
    "cebola-roxa":          "Acréscimo de cebola roxa.",
    "acrescimos":           "Acréscimo genérico (consultar disponibilidade).",
    "hamburguer-artesanal": "Acréscimo de hambúrguer artesanal 120g.",
    "hamburguer-picanha":   "Acréscimo de hambúrguer de picanha 120g."
};

const stmt = db.prepare("UPDATE produtos SET descricao = ? WHERE slug = ?");
let updated = 0;
for (const [slug, desc] of Object.entries(descricoes)) {
    const info = stmt.run(desc, slug);
    if (info.changes > 0) updated++;
}

console.log(`📝 ${updated} descrições preenchidas.`);