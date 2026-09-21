/* ======================================================================
   BRAVUS — CONFIGURAÇÃO
   Troque os valores abaixo pelos dados reais. É o único lugar que muda.
   ====================================================================== */
const BRAVUS = {
  whatsapp: "5511999999999",              // TODO: DDI + DDD + número, só dígitos
  email: "contato@bravuscontabil.com.br", // TODO
  telefone: "(11) 3000-0000",             // TODO
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
document.querySelectorAll("[data-wa]").forEach((el) => {
  const texto = el.dataset.wa || "Olá! Gostaria de falar com a Bravus Assessoria Contábil.";
  el.href = `https://wa.me/${BRAVUS.whatsapp}?text=${encodeURIComponent(texto)}`;
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
    window.open(
      `https://wa.me/${BRAVUS.whatsapp}?text=${encodeURIComponent(linhas.join("\n"))}`,
      "_blank",
      "noopener"
    );
  });
});

/* ---------- Preenche contatos no HTML ---------- */
document.querySelectorAll("[data-tel]").forEach((el) => {
  el.textContent = BRAVUS.telefone;
  el.href = "tel:+55" + BRAVUS.telefone.replace(/\D/g, "");
});
document.querySelectorAll("[data-email]").forEach((el) => {
  el.textContent = BRAVUS.email;
  el.href = "mailto:" + BRAVUS.email;
});
