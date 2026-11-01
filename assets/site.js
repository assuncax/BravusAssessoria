/* ======================================================================
   BRAVUS — CONFIGURAÇÃO
   Troque os valores abaixo pelos dados reais. É o único lugar que muda.
   ====================================================================== */
const BRAVUS = {
  whatsapp: "5511959755162",              // DDI + DDD + número, só dígitos
  email: "Bravus.contabil@outlook.com",
  telefone: "(11) 95975-5162",
  telefone2: "(11) 91248-3336",
  instagram: "bravus.contabil",
};

/* ---------- Menu mobile ---------- */
const navToggle = document.getElementById("navToggle");
if (navToggle) {
  navToggle.addEventListener("click", () => {
    const nav = document.getElementById("mobileNav");
    const open = nav.classList.toggle("hidden") === false;
    navToggle.setAttribute("aria-expanded", String(open));
  });
}

/* ---------- Links de WhatsApp ---------- */
const waLink = (texto) => `https://wa.me/${BRAVUS.whatsapp}?text=${encodeURIComponent(texto)}`;

document.querySelectorAll("[data-wa]").forEach((el) => {
  el.href = waLink(el.dataset.wa || "Olá! Gostaria de falar com a Bravus Assessoria Contábil.");
});

/* ---------- Formulários → WhatsApp ---------- */
document.querySelectorAll("form[data-wa-form]").forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const linhas = ["*Novo contato pelo site Bravus*", ""];
    for (const [rotulo, valor] of new FormData(form).entries()) {
      const v = String(valor).trim();
      if (v) linhas.push(`*${rotulo}:* ${v}`);
    }
    window.open(waLink(linhas.join("\n")), "_blank", "noopener");
  });
});

/* ---------- Preenche contatos no HTML ---------- */
[["[data-tel]", BRAVUS.telefone], ["[data-tel2]", BRAVUS.telefone2]].forEach(([sel, tel]) => {
  document.querySelectorAll(sel).forEach((el) => {
    el.textContent = tel;
    el.href = "tel:+55" + tel.replace(/\D/g, "");
  });
});
document.querySelectorAll("[data-instagram]").forEach((el) => {
  el.textContent = "@" + BRAVUS.instagram;
  el.href = "https://www.instagram.com/" + BRAVUS.instagram;
});
document.querySelectorAll("[data-email]").forEach((el) => {
  el.textContent = BRAVUS.email;
  el.href = "mailto:" + BRAVUS.email;
});

/* ---------- Revelar ao rolar ---------- */
const aoAparecer = new IntersectionObserver((entradas) => {
  entradas.forEach(({ isIntersecting, target }) => {
    if (!isIntersecting) return;
    target.classList.add("is-visible");
    aoAparecer.unobserve(target);
  });
}, { threshold: 0.15 });

document.querySelectorAll(".reveal").forEach((el) => aoAparecer.observe(el));

/* ---------- Simulador (2 cliques) ----------
   Regras de 2026 — revisar no início de cada ano.
   Autônomo: INSS 20% (contribuinte individual) + IRPF mensal (carnê-leão).
   Anexo V:  DAS do Anexo V + pró-labore de um salário mínimo.
   Bravus:   Simples no Anexo III com Fator R (pró-labore = 28% do faturamento),
             INSS 11% e IRPF sobre o pró-labore. Lucro distribuído isento. */
const SIM = {
  salarioMinimo: 1621,
  tetoInss: 8475.55,
  descontoSimplificado: 607.2,
  // [base mensal até, alíquota, parcela a deduzir]
  irpf: [
    [2428.8, 0, 0],
    [2826.65, 0.075, 182.16],
    [3751.05, 0.15, 394.16],
    [4664.68, 0.225, 675.49],
    [Infinity, 0.275, 908.73],
  ],
  // [receita bruta 12 meses até, alíquota nominal, parcela a deduzir]
  anexoIII: [
    [180000, 0.06, 0],
    [360000, 0.112, 9360],
    [720000, 0.135, 17640],
    [1800000, 0.16, 35640],
  ],
  anexoV: [
    [180000, 0.155, 0],
    [360000, 0.18, 4500],
    [720000, 0.195, 9900],
    [1800000, 0.205, 17100],
  ],
};

// IRPF mensal com a redução da Lei 15.270/2025 (isenção até R$ 5 mil, parcial até R$ 7.350)
const irpfMensal = (rendimento, deducoes) => {
  const base = rendimento - Math.max(deducoes, SIM.descontoSimplificado);
  const [, aliquota, deducao] = SIM.irpf.find(([limite]) => base <= limite);
  const imposto = Math.max(0, base * aliquota - deducao);
  if (rendimento <= 5000) return 0;
  if (rendimento <= 7350) return Math.max(0, imposto - (978.62 - 0.133145 * rendimento));
  return imposto;
};

const das = (faturamento, tabela) => {
  const rbt12 = faturamento * 12;
  const [, aliquota, deducao] = tabela.find(([limite]) => rbt12 <= limite);
  return faturamento * (aliquota - deducao / rbt12);
};

const proLaboreComImpostos = (proLabore) => {
  const inss = Math.min(proLabore, SIM.tetoInss) * 0.11;
  return inss + irpfMensal(proLabore, inss);
};

const CENARIOS = {
  pf: (faturamento) => {
    const inss = Math.min(faturamento, SIM.tetoInss) * 0.2;
    return inss + irpfMensal(faturamento, inss);
  },
  anexoV: (faturamento) => das(faturamento, SIM.anexoV) + proLaboreComImpostos(SIM.salarioMinimo),
  bravus: (faturamento) =>
    das(faturamento, SIM.anexoIII) + proLaboreComImpostos(Math.max(faturamento * 0.28, SIM.salarioMinimo)),
};

const simForm = document.getElementById("simulador-form");
if (simForm) {
  const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const perfis = { pf: "sou autônomo no CPF", anexoV: "tenho empresa no Anexo V do Simples" };

  const atualizar = () => {
    const perfil = simForm.perfil.value;
    const faturamento = Number(simForm.faturamento.value);
    const hoje = CENARIOS[perfil](faturamento);
    const bravus = CENARIOS.bravus(faturamento);

    document.getElementById("simEconomia").textContent = brl.format(Math.max(0, hoje - bravus) * 12);
    document.getElementById("simHoje").textContent = `${brl.format(hoje)}/mês`;
    document.getElementById("simBravus").textContent = `${brl.format(bravus)}/mês`;
    document.getElementById("simCta").href = waLink(
      `Olá! Fiz a conta no simulador: ${perfis[perfil]} e faturo cerca de ${brl.format(faturamento)} por mês. Quero confirmar a minha economia.`
    );
  };

  simForm.addEventListener("change", atualizar);
  atualizar();
}
