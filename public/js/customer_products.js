document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".buy-now-btn");
    const modalContainer = document.getElementById("modalContainer");
  
    buttons.forEach(button => {
      button.addEventListener("click", async () => {
        const id = button.dataset.productId;
        try {
          const res = await axios.get(`/products/${id}`);
          const product = res.data;
  
          modalContainer.innerHTML = `
            <div class="modal fade" id="productModal" tabindex="-1" aria-hidden="true">
              <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">${product.product_name}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <div class="modal-body text-center">
                    <img src="/images/${product.image_name}" class="img-fluid mb-3">
                    <p class="fw-bold">Price: $${parseFloat(product.price).toFixed(2)}</p>
                  </div>
                  <div class="modal-footer">
                    <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button class="btn btn-primary">Checkout</button>
                  </div>
                </div>
              </div>
            </div>
          `;
  
          new bootstrap.Modal(document.getElementById("productModal")).show();
        } catch (err) {
          console.error("Failed to load product modal", err);
        }
      });
    });
  
    // Filter and search functionality
    const searchInput = document.getElementById("searchInput");
    const productCards = document.querySelectorAll(".product-card");
  
    searchInput.addEventListener("input", () => {
      const value = searchInput.value.toLowerCase();
      productCards.forEach(card => {
        const name = card.dataset.name;
        card.style.display = name.includes(value) ? "block" : "none";
      });
    });
  });
  