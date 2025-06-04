// Handle Admin Registration
document
  .getElementById("adminRegisterForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const full_name = document.getElementById("fullName").value;
    const username = document.getElementById("registerUsername").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      document.getElementById("registerResponseMessage").innerHTML =
        '<span class="text-danger">❌ Passwords do not match.</span>';
      return;
    }

    try {
      const res = await axios.post("/admin-auth/register", {
        full_name,
        username,
        email,
        password,
      });
      document.getElementById("registerResponseMessage").innerHTML =
        `<span class="text-success">✅ ${res.data.message}</span>`;

      document.getElementById("adminRegisterForm").reset();
    } catch (err) {
      document.getElementById("registerResponseMessage").innerHTML =
        `<span class="text-danger">❌ ${err.response.data.message}</span>`;
    }
  });

// handling logins

document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    try {
      const response = await axios.post("/admin-auth/login", {
        username: formData.get("username"),
        password: formData.get("password"),
      });

      if (response.data.success) {
        // ✅ Redirect to admin dashboard
        window.location.href = "/admin/register";
      } else {
        document.getElementById("loginMessage").textContent =
          response.data.message;
      }
    } catch (error) {
      console.error(error);
      document.getElementById("loginMessage").textContent =
        "An error occurred. Please try again.";
    }
  });
