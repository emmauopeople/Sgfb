// public/js/customer.js
document.addEventListener("DOMContentLoaded", () => {
  const modalEl = document.getElementById("productModal");
  const modal = modalEl ? bootstrap.Modal.getOrCreateInstance(modalEl) : null;

  function formatPrice(p) {
    const n = Number(p);
    if (Number.isNaN(n)) return "";
    return `$${n.toFixed(2)}`;
  }

  // ---------- WhatsApp helpers ----------
  function normalizePhone(raw) {
    const d = (raw || "").replace(/\D/g, "");
    if (d.length === 10) return `1${d}`; // assume US
    return d;
  }
  function buildWaText({ name, id, price, email, userMsg }) {
    let t = `Hello SGFB, I'm interested in ${name || "this product"}`;
    if (id) t += ` (ID: ${id})`;
    if (price) t += ` - ${price}`;
    if (email) t += `. My email: ${email}`;
    if (userMsg) t += `. Message: ${userMsg}`;
    return t;
  }
  function openWhatsAppDeepLink(phone, text) {
    const mobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
    const waScheme = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(text)}`;
    const webURL   = mobile
      ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`
      : `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;

    // Try native app; if page doesn't lose focus shortly, fall back in-place (no popup).
    const fallbackDelay = 700;
    const start = Date.now();

    const onBlur = () => {
      // User switched to WhatsApp or a new tab—cancel fallback.
      window.removeEventListener("blur", onBlur);
      clearTimeout(tid);
    };
    window.addEventListener("blur", onBlur);

    const tid = setTimeout(() => {
      window.removeEventListener("blur", onBlur);
      // If still here, navigate same tab to a web URL (bypasses popup blockers)
      window.location.href = webURL;
    }, fallbackDelay);

    // Kick off native app attempt
    window.location.href = waScheme;
  }

  // ---------- DOM refs ----------
  const emailInput = document.getElementById("customerEmail");
  const msgInput   = document.getElementById("message");
  const nameH      = document.getElementById("modalName");
  const priceH     = document.getElementById("modalPrice");
  const imgEl      = document.getElementById("modalImage");
  const nameHidden = document.getElementById("productNameHidden");
  const idHidden   = document.getElementById("productIdHidden");
  const priceHidden= document.getElementById("productPriceHidden");
  const waBtn      = document.getElementById("whatsAppBtn");

  function refreshWaHref() {
    // Keep an href for accessibility (not used for navigation anymore)
    if (!waBtn) return;
    const phone = normalizePhone(waBtn.getAttribute("data-wa-phone") || "14055511960");
    const text = buildWaText({
      name: nameHidden?.value?.trim() || nameH?.textContent?.trim(),
      id:   idHidden?.value?.trim(),
      price: priceHidden?.value?.trim() || priceH?.textContent?.trim(),
      email: emailInput?.value?.trim(),
      userMsg: msgInput?.value?.trim(),
    });
    waBtn.href = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
  }

  // ---------- Search/filter (if present) ----------
  const searchInput = document.getElementById("searchInput");
  const filterSelect = document.getElementById("filterSelect");
  const clearBtn = document.getElementById("clearFilters");
  const cards = Array.from(document.querySelectorAll(".product-card"));

  function getCardName(card) {
    const dataName = card.dataset?.name;
    if (dataName) return dataName.toLowerCase();
    const titleEl = card.querySelector(".card-title, h6, .title, .small");
    return (titleEl?.textContent || card.textContent || "").toLowerCase();
  }
  function getCardCategory(card) {
    return (card.dataset?.category || "").toLowerCase();
  }
  function applyFilters() {
    const q = (searchInput?.value || "").trim().toLowerCase();
    const cat = (filterSelect?.value || "").trim().toLowerCase();
    cards.forEach((card) => {
      const name = getCardName(card);
      const category = getCardCategory(card);
      const matchesText = q === "" || name.includes(q);
      const matchesCat = cat === "" || category === cat;
      card.classList.toggle("d-none", !(matchesText && matchesCat));
    });
  }
  if (searchInput) searchInput.addEventListener("input", applyFilters);
  if (filterSelect) filterSelect.addEventListener("change", applyFilters);
  if (clearBtn) clearBtn.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    if (filterSelect) filterSelect.value = "";
    applyFilters();
  });
  applyFilters();

  // ---------- Open modal with product info ----------
  document.querySelectorAll(".buy-now-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const id = btn.dataset.productId;
      if (!id || !modal) return;

      try {
        const { data: product } = await axios.get(`/products/${id}`);
        const name  = product.product_name || product.name || "";
        const price = product.price ?? product.unit_price ?? "";
        const image = product.image_name || product.image || "";
        const pid   = product.product_id ?? id;

        if (imgEl) {
          imgEl.src = image ? `/images/${image}` : "";
          imgEl.alt = name || "Product Image";
        }
        if (nameH) nameH.textContent = name;
        if (priceH) priceH.textContent = formatPrice(price);
        if (nameHidden) nameHidden.value = name;
        if (idHidden) idHidden.value = String(pid);
        if (priceHidden) priceHidden.value = formatPrice(price);

        refreshWaHref();
        modal.show();
      } catch (err) {
        console.error("Failed to load product", err);
      }
    });
  });

  // ---------- Inquiry submission (includes Product Name + ID) ----------
  const form = document.getElementById("inquiryForm");
  const submitBtn = form?.querySelector('button[type="submit"]');
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const customerEmail = emailInput?.value?.trim();
      const userMessage   = msgInput?.value?.trim();
      const productName   = nameHidden?.value;
      const productId     = idHidden?.value;

      let composed = `Product: ${productName || ""}`;
      if (productId) composed += ` (ID: ${productId})`;
      composed += userMessage ? `\n\nCustomer message:\n${userMessage}` : "";

      if (submitBtn) submitBtn.disabled = true;
      try {
        const res = await axios.post("/sendmail", { customerEmail, message: composed, productName });
        if (res.status >= 200 && res.status < 300) {
          document.getElementById("inquirySuccess")?.classList.remove("d-none");
          document.getElementById("inquiryError")?.classList.add("d-none");
        } else {
          document.getElementById("inquiryError")?.classList.remove("d-none");
        }
      } catch (err) {
        document.getElementById("inquiryError")?.classList.remove("d-none");
        console.error(err);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // ---------- WhatsApp click (native + fallback) ----------
  if (waBtn) {
    waBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const phone = normalizePhone(waBtn.getAttribute("data-wa-phone") || "14055511960");
      const text = buildWaText({
        name: nameHidden?.value?.trim() || nameH?.textContent?.trim(),
        id:   idHidden?.value?.trim(),
        price: priceHidden?.value?.trim() || priceH?.textContent?.trim(),
        email: emailInput?.value?.trim(),
        userMsg: msgInput?.value?.trim(),
      });
      openWhatsAppDeepLink(phone, text);
    });

    // keep href updated for accessibility
    ["input", "change"].forEach(evt => {
      emailInput?.addEventListener(evt, refreshWaHref);
      msgInput?.addEventListener(evt, refreshWaHref);
    });
    refreshWaHref();
  }

  // ---------- Reset modal ----------
  if (modalEl) {
    modalEl.addEventListener("hidden.bs.modal", () => {
      document.getElementById("inquirySuccess")?.classList.add("d-none");
      document.getElementById("inquiryError")?.classList.add("d-none");
      if (submitBtn) submitBtn.disabled = false;
      form?.reset();
      if (imgEl) imgEl.src = "";
      if (nameHidden) nameHidden.value = "";
      if (idHidden) idHidden.value = "";
      if (priceHidden) priceHidden.value = "";
      refreshWaHref();
    });
  }
});
