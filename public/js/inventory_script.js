if (window.location.pathname === "/admin/inventory") {
  let products = [];

  // Fetch all products from backend once
  axios
    .get("/products/api")
    .then((response) => {
      products = response.data;
      renderTable(products);
    })
    .catch((error) => {
      console.error("Error loading inventory:", error);
    });

  // Listen for search input
  const searchBox = document.getElementById("searchBox");
  searchBox.addEventListener("input", function () {
    const query = searchBox.value.trim().toLowerCase();
    if (query === "") {
      renderTable(products); // Show all products
    } else {
      const filtered = products.filter(
        (p) =>
          p.product_name.toLowerCase().includes(query) ||
          p.product_description.toLowerCase().includes(query),
      );
      renderTable(filtered);
    }
  });

  function renderTable(data) {
    const tbody = document.getElementById("inventoryTableBody");
    tbody.innerHTML = "";
    data.forEach((product, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
          <td>${index + 1}</td>
          <td>${product.product_name}</td>
          <td>${product.product_description}</td>
          <td>$${parseFloat(product.price).toFixed(2)}</td>
          <td>${product.quantity}</td>
          <td><img src="/images/${product.image_name}" width="60" alt="product image" /></td>
        `;
      tbody.appendChild(row);
    });
  }
}
