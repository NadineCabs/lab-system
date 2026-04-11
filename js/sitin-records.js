// ============================================
// SIT-IN RECORDS JAVASCRIPT
// ============================================

let currentPage = 1;
const recordsPerPage = 25;
let totalRecords = 0;

document.addEventListener('DOMContentLoaded', () => {
  loadRecords();

  // Filter buttons
  const applyFiltersBtn = document.getElementById('applyFiltersBtn');
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', () => {
      currentPage = 1;
      loadRecords();
    });
  }

  // Pagination
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        loadRecords();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const maxPage = Math.ceil(totalRecords / recordsPerPage);
      if (currentPage < maxPage) {
        currentPage++;
        loadRecords();
      }
    });
  }

  // Export button
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportRecords);
  }
});

async function loadRecords() {
  const startDate = document.getElementById('filterStartDate')?.value || null;
  const endDate = document.getElementById('filterEndDate')?.value || null;
  
  const offset = (currentPage - 1) * recordsPerPage;

  try {
    const params = new URLSearchParams({
      limit: recordsPerPage,
      offset: offset,
      ...(startDate && { start_date: startDate }),
      ...(endDate && { end_date: endDate })
    });

    const response = await fetch(`get-sitin-records.php?${params}`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Unable to load records');
    }

    totalRecords = data.total;
    renderRecords(data.records);
    updatePagination();
  } catch (error) {
    console.error('Error loading records:', error);
    const tbody = document.getElementById('recordsTableBody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px;">
            <p style="color: #dc2626;">Error loading records. Please try again.</p>
          </td>
        </tr>
      `;
    }
  }
}

function renderRecords(records) {
  const tbody = document.getElementById('recordsTableBody');
  const countEl = document.getElementById('recordsCount');

  if (!tbody) return;

  if (countEl) {
    countEl.textContent = totalRecords;
  }

  if (!records || records.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px;">
          <i data-feather="inbox" style="width: 48px; height: 48px; margin: 0 auto; color: #999; display: block; margin-bottom: 16px;"></i>
          <p style="color: #666;">No records found</p>
        </td>
      </tr>
    `;
    feather.replace();
    return;
  }

  tbody.innerHTML = records.map(record => `
    <tr>
      <td>${formatDateTimeLocal(record.recorded_at)}</td>
      <td><strong>${escapeHtml(record.id_number)}</strong></td>
      <td>${escapeHtml(record.first_name)} ${escapeHtml(record.last_name)}</td>
      <td><span class="badge" style="background: #f3e5f5; color: #6a1b9a;">${escapeHtml(record.course)}</span></td>
      <td>${escapeHtml(record.computer_number || '-')}</td>
      <td><span style="font-weight: 600; color: #703081;">${record.duration_minutes}</span></td>
      <td>${record.purpose ? escapeHtml(record.purpose) : '<em style="color: #999;">-</em>'}</td>
    </tr>
  `).join('');

  feather.replace();
}

function updatePagination() {
  const maxPage = Math.ceil(totalRecords / recordsPerPage);
  const paginationInfo = document.getElementById('paginationInfo');
  const startRecord = (currentPage - 1) * recordsPerPage + 1;
  const endRecord = Math.min(currentPage * recordsPerPage, totalRecords);

  if (paginationInfo) {
    paginationInfo.textContent = `Showing ${startRecord} to ${endRecord} of ${totalRecords} records`;
  }

  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');

  if (prevBtn) {
    prevBtn.disabled = currentPage === 1;
    prevBtn.style.opacity = currentPage === 1 ? '0.5' : '1';
    prevBtn.style.cursor = currentPage === 1 ? 'not-allowed' : 'pointer';
  }

  if (nextBtn) {
    nextBtn.disabled = currentPage >= maxPage;
    nextBtn.style.opacity = currentPage >= maxPage ? '0.5' : '1';
    nextBtn.style.cursor = currentPage >= maxPage ? 'not-allowed' : 'pointer';
  }
}

function exportRecords() {
  const startDate = document.getElementById('filterStartDate')?.value || '';
  const endDate = document.getElementById('filterEndDate')?.value || '';

  let csvContent = 'Date & Time,Student ID,Name,Course,Computer,Duration (mins),Purpose\n';

  const rows = document.querySelectorAll('#recordsTableBody tr');
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    const rowData = Array.from(cells).map(cell => {
      const text = cell.textContent.trim();
      // Escape quotes and wrap in quotes if contains comma
      return text.includes(',') ? `"${text.replace(/"/g, '""')}"` : text;
    });
    csvContent += rowData.join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `sitin-records-${new Date().toISOString().split('T')[0]}.csv`);
  link.click();
}

function formatDateTimeLocal(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
