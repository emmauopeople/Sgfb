// public/js/update_inventory_script.js

if (window.location.pathname === "/admin/update") {
  let products = [];
  let selectedProductId = null;

  // Fetch products from backend
  axios
    .get("/products/api")
    .then((res) => {
      products = res.data;
      renderTable(products);
    })
    .catch((err) => console.error("Failed to fetch products:", err));

  // Filter as user types
  document
    .getElementById("searchUpdate")
    .addEventListener("input", function () {
      const query = this.value.toLowerCase();
      const filtered = products.filter(
        (p) =>
          p.product_name.toLowerCase().includes(query) ||
          p.product_description.toLowerCase().includes(query),
      );
      renderTable(filtered);
    });

  // Render table
  function renderTable(data) {
    const tbody = document.getElementById("updateTableBody");
    tbody.innerHTML = "";
    data.forEach((product, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
          <td>${index + 1}</td>
          <td>${product.product_name}</td>
          <td>${product.product_description}</td>
          <td>$${parseFloat(product.price).toFixed(2)}</td>
          <td>${product.quantity}</td>
          <td><img src="/images/${product.image_name}" width="50"></td>
          <td>
            <button class="btn btn-sm btn-warning me-1" onclick="openEditModal(${product.product_id})">✏️</button>
            <button class="btn btn-sm btn-danger" onclick="openDeleteModal(${product.product_id})">🗑️</button>
          </td>
        `;
      tbody.appendChild(row);
    });
  }

  // Expose edit/delete to global scope for inline HTML use
  window.openEditModal = (id) => {
    const product = products.find((p) => p.product_id === id);
    if (!product) return;

    selectedProductId = id;
    document.getElementById("editProductId").value = id;
    document.getElementById("editProductName").value = product.product_name;
    document.getElementById("editProductDescription").value =
      product.product_description;
    document.getElementById("editPrice").value = product.price;
    document.getElementById("editQuantity").value = product.quantity;
    document.getElementById("editImagePreview").src =
      "/images/" + product.image_name;

    new bootstrap.Modal(document.getElementById("editModal")).show();
  };

  window.openDeleteModal = (id) => {
    selectedProductId = id;
    new bootstrap.Modal(document.getElementById("deleteModal")).show();
  };

  // Handle product update
  document
    .getElementById("editProductForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      const updatedData = {
        product_name: document.getElementById("editProductName").value,
        product_description: document.getElementById("editProductDescription")
          .value,
        price: parseFloat(document.getElementById("editPrice").value),
        quantity: parseInt(document.getElementById("editQuantity").value, 10),
      };

      axios
        .put(`/products/${selectedProductId}`, updatedData)
        .then(() => {
          products = products.map((p) =>
            p.product_id === selectedProductId ? { ...p, ...updatedData } : p,
          );
          renderTable(products);
          bootstrap.Modal.getInstance(
            document.getElementById("editModal"),
          ).hide();
        })
        .catch((err) => console.error("Failed to update product:", err));
    });

  // Handle delete
  document.getElementById("confirmDeleteBtn").addEventListener("click", () => {
    axios
      .delete(`/products/${selectedProductId}`)
      .then(() => {
        products = products.filter((p) => p.product_id !== selectedProductId);
        renderTable(products);
        bootstrap.Modal.getInstance(
          document.getElementById("deleteModal"),
        ).hide();
      })
      .catch((err) => console.error("Failed to delete product:", err));
  });
}
