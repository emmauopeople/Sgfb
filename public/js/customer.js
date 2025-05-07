document.addEventListener('DOMContentLoaded', () => {
    const buyButtons = document.querySelectorAll('.buy-now-btn');
    
  
    buyButtons.forEach(button => {
      button.addEventListener('click', async () => {
        
        const productId = button.dataset.productId;
        
  
        try {
          const response = await axios.get(`/products/${productId}`);
          const product = response.data;
          
  
          // Populate modal fields
          document.getElementById('modalProductName').textContent = product.product_name;
          document.getElementById('modalProductPrice').textContent = `$${parseFloat(product.price).toFixed(2)}`;
          document.getElementById('modalProductImage').src = `/images/${product.image_name}`;
  
          // Show modal
          
          const productModal = new bootstrap.Modal(document.getElementById('productModal'));
          productModal.show();
        } catch (error) {
          console.error('❌ Error fetching product:', error);
        }
      });
    });

    //handle products view for customers
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
                  <p>${product.description || 'Elegant fragrance for all occasions.'}</p>
                  <p class="fw-bold">Price: $${parseFloat(product.price).toFixed(2)}</p>
                </div>
                <div class="modal-footer">
                  <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  <button class="btn btn-primary">Add to Cart</button>
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
  });
  