document.addEventListener("DOMContentLoaded", () => {
  const modalEl = document.getElementById("productModal");
  const modal = modalEl ? bootstrap.Modal.getOrCreateInstance(modalEl) : null;

  function formatPrice(p) {
    const n = Number(p);
    if (Number.isNaN(n)) return "";
    return `$${n.toFixed(2)}`;
  }

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
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (filterSelect) filterSelect.value = "";
      applyFilters();
    });
  }
  applyFilters();

  document.querySelectorAll(".buy-now-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const id = btn.dataset.productId;
      if (!id || !modal) return;

      try {
        const { data: product } = await axios.get(`/products/${id}`);
        const name = product.product_name || product.name || "";
        const price = product.price ?? product.unit_price ?? "";
        const image = product.image_name || product.image || "";

        const imgEl = document.getElementById("modalImage");
        if (imgEl) {
          imgEl.src = image ? `/images/${image}` : "";
          imgEl.alt = name || "Product Image";
        }
        const nameEl = document.getElementById("modalName");
        if (nameEl) nameEl.textContent = name;
        const priceEl = document.getElementById("modalPrice");
        if (priceEl) priceEl.textContent = formatPrice(price);
        const hiddenEl = document.getElementById("productNameHidden");
        if (hiddenEl) hiddenEl.value = name;

        modal.show();
      } catch (err) {
        console.error("Failed to load product", err);
      }
    });
  });

  const form = document.getElementById("inquiryForm");
  const submitBtn = form?.querySelector('button[type="submit"]');
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const customerEmail = document.getElementById("customerEmail")?.value?.trim();
      const message = document.getElementById("message")?.value?.trim();
      const productName = document.getElementById("productNameHidden")?.value;

      if (submitBtn) submitBtn.disabled = true;
      try {
        const res = await axios.post("/sendmail", { customerEmail, message, productName });
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

  if (modalEl) {
    modalEl.addEventListener("hidden.bs.modal", () => {
      document.getElementById("inquirySuccess")?.classList.add("d-none");
      document.getElementById("inquiryError")?.classList.add("d-none");
      if (submitBtn) submitBtn.disabled = false;
      form?.reset();
      const imgEl = document.getElementById("modalImage");
      if (imgEl) imgEl.src = "";
    });
  }
});
