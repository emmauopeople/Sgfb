// public/js/customer.js
document.addEventListener("DOMContentLoaded", () => {
  const modalEl = document.getElementById("productModal");
  const modal = modalEl ? bootstrap.Modal.getOrCreateInstance(modalEl) : null;

  function formatPrice(p) {
    const n = Number(p);
    if (Number.isNaN(n)) return "";
    return `$${n.toFixed(2)}`;
  }

  // Build a cross-device WhatsApp URL (opens app on phones, web on desktop)
  function buildWhatsAppURL(phoneDigits, text) {
    const phone = (phoneDigits || "").replace(/\D/g, "");
    // api.whatsapp.com works well on both desktop and mobile
    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
  }

  // Keep fields handy
  const emailInput = document.getElementById("customerEmail");
  const msgInput   = document.getElementById("message");
  const nameH      = document.getElementById("modalName");
  const priceH     = document.getElementById("modalPrice");
  const imgEl      = document.getElementById("modalImage");
  const nameHidden = document.getElementById("productNameHidden");
  const idHidden   = document.getElementById("productIdHidden");
  const priceHidden= document.getElementById("productPriceHidden");
  const waBtn      = document.getElementById("whatsAppBtn");

  function composeWhatsAppText() {
    const name = nameHidden?.value?.trim() || nameH?.textContent?.trim() || "";
    const id   = idHidden?.value?.trim();
    const price= priceHidden?.value?.trim() || priceH?.textContent?.trim() || "";
    const email= emailInput?.value?.trim() || "";
    const user = msgInput?.value?.trim() || "";
    let text   = `Hello SGFB, I'm interested in ${name}${id ? " (ID: " + id + ")" : ""}${price ? " - " + price : ""}.`;
    if (email) text += ` My email: ${email}.`;
    if (user)  text += ` Message: ${user}`;
    return text;
  }

  function refreshWhatsAppHref() {
    if (!waBtn) return;
    const phone = waBtn.getAttribute("data-wa-phone") || "14055511960";
    waBtn.href = buildWhatsAppURL(phone, composeWhatsAppText());
  }

  // Search/filter (if present on this page)
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

  // Open modal with product info
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

        refreshWhatsAppHref();
        modal.show();
      } catch (err) {
        console.error("Failed to load product", err);
      }
    });
  });

  // Inquiry submission
  const form = document.getElementById("inquiryForm");
  const submitBtn = form?.querySelector('button[type="submit"]');
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const customerEmail = emailInput?.value?.trim();
      const userMessage   = msgInput?.value?.trim();
      const productName   = nameHidden?.value;
      const productId     = idHidden?.value;

      // Compose message to include product details so server doesn't need changes
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

  // Keep WA link fresh as user types
  ["input", "change"].forEach(evt => {
    emailInput?.addEventListener(evt, refreshWhatsAppHref);
    msgInput?.addEventListener(evt, refreshWhatsAppHref);
  });

  // Update href right before navigation; do NOT prevent default
  waBtn?.addEventListener("click", () => {
    refreshWhatsAppHref();
  });

  // Reset modal on close
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
      refreshWhatsAppHref();
    });
  }
});
