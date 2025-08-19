// public/js/script.js

const form = document.getElementById("productForm");

if (form) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(form);

    try {
      const response = await axios.post("/products/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      document.getElementById("responseMessage").innerHTML =
        '<span class="text-success">✅ Product registered successfully!</span>';
      form.reset();
    } catch (error) {
      console.error(error);
      document.getElementById("responseMessage").innerHTML =
        '<span class="text-danger">❌ Error submitting product, please try again.</span>';
    }
  });
}
