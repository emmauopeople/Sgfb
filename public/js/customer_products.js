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
                
                  <button id="addToCartBtn" class="btn btn-dark" data-product-id=${product.product_id}>Add to Cart</button>

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

    //sending email
    document.getElementById("email_form").addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent default form submission
        
      const email = document.getElementById("email").value;
      const message = document.getElementById("message").value;
  
      if (!email || !message) {
          alert("Please fill in all fields to manager.");
          return;
      }
  
      // Send data using Axios
      axios.post("/sendmail", {
        customerEmail: email,
          subject: "Message from Contact Form",
          text: message
      })
      .then(response => {
          alert("Email sent successfully!");
          document.getElementById("email_form").reset(); // Clear form
      })
      .catch(error => {
          console.error("Error sending email:", error);
          alert("Failed to send email. Please try again.");
      });
  });

//persisting card data
// Load cart from storage when the page loads
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Save cart data to local storage after every update
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}
document.addEventListener("click", (event) => {
    if (event.target && event.target.id === "addToCartBtn") {
        const productId = event.target.dataset.productId;

        // Check if product already in cart
        const existing = cart.find(item => item.id === productId);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ id: productId, quantity: 1 });
        }

        saveCart(); // Persist cart data

        // Update cart badge count
        document.getElementById('cartCount').textContent = cart.reduce((sum, i) => sum + i.quantity, 0);

        // Close the cart modal
        
    }
});

document.getElementById('cartIcon').addEventListener('click', async () => {
    const container = document.getElementById('cartItemsContainer');
    container.innerHTML = '';

    for (let item of cart) {
        const response = await axios.get(`/products/${item.id}`);
        const product = response.data;

        container.innerHTML += `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                    <img src="/images/${product.image_name}" class="img-fluid" style="width: 50px; height: auto;" alt="${product.product_name}">
                </div>
                <div><strong>${product.product_name}</strong><br>$${product.price}</div>
                <div>
                    <input type="number" value="${item.quantity}" min="1" class="form-control quantity-input" data-id="${item.id}">
                </div>
            </div>
        `;
    }

    // Attach quantity change handler dynamically
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const id = e.target.dataset.id;
            const qty = parseInt(e.target.value);
            const item = cart.find(i => i.id === id);
            if (item) item.quantity = qty;
            saveCart(); // Save changes to localStorage
            document.getElementById('cartCount').textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
        });
    });
});



  

  



  
  });


  