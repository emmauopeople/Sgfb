// public/js/report_script.js

if (window.location.pathname === '/admin/report') {
    const reportType = document.getElementById('reportType');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const head = document.getElementById('reportTableHead');
    const body = document.getElementById('reportTableBody');
  
    generateBtn.addEventListener('click', () => {
      const type = reportType.value;
      axios.get(`/products/report?type=${type}`)
        .then(res => {
          const data = res.data;
          renderReport(type, data);
        })
        .catch(err => {
          console.error('Error loading report:', err);
          head.innerHTML = '';
          body.innerHTML = '<tr><td colspan="6" class="text-danger">Error loading report</td></tr>';
        });
    });
  
    function renderReport(type, data) {
      head.innerHTML = '';
      body.innerHTML = '';
  
      if (type === 'stock') {
        head.innerHTML = `
          <tr>
            <th>#</th><th>Name</th><th>Qty</th><th>Status</th>
          </tr>
        `;
        data.forEach((p, i) => {
          const status = p.quantity == 0 ? 'Out of Stock' : (p.quantity <= 10 ? 'Low Stock' : 'In Stock');
          const badge = status === 'Out of Stock' ? 'danger' : (status === 'Low Stock' ? 'warning' : 'success');
          body.innerHTML += `
            <tr>
              <td>${i + 1}</td>
              <td>${p.product_name}</td>
              <td>${p.quantity}</td>
              <td><span class="badge bg-${badge}">${status}</span></td>
            </tr>
          `;
        });
      } else if (type === 'low_stock') {
        head.innerHTML = `
          <tr>
            <th>#</th><th>Name</th><th>Qty</th>
          </tr>
        `;
        data.forEach((p, i) => {
          body.innerHTML += `
            <tr>
              <td>${i + 1}</td>
              <td>${p.product_name}</td>
              <td>${p.quantity}</td>
            </tr>
          `;
        });
      } else if (type === 'valuation') {
        head.innerHTML = `
          <tr>
            <th>#</th><th>Name</th><th>Price ($)</th><th>Qty</th><th>Total Value</th>
          </tr>
        `;
        let total = 0;
        data.forEach((p, i) => {
          const value = p.price * p.quantity;
          total += value;
          body.innerHTML += `
            <tr>
              <td>${i + 1}</td>
              <td>${p.product_name}</td>
              <td>$${p.price.toFixed(2)}</td>
              <td>${p.quantity}</td>
              <td>$${value.toFixed(2)}</td>
            </tr>
          `;
        });
        body.innerHTML += `
          <tr class="fw-bold bg-light">
            <td colspan="4">Total Inventory Value</td>
            <td>$${total.toFixed(2)}</td>
          </tr>
        `;
      }
    }
  
    downloadBtn.addEventListener('click', () => {
        const type = reportType.value;
        window.open(`/products/report/pdf?type=${type}`, '_blank');
      });
      
  }
  