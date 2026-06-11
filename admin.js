'use strict';

const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');
const sidebarClose = document.getElementById('sidebarClose');
const overlay = document.getElementById('sidebarOverlay');

function toggleSidebar() {
  sidebar.classList.toggle('active');
  overlay.classList.toggle('active');
}

menuToggle.addEventListener('click', toggleSidebar);
sidebarClose.addEventListener('click', toggleSidebar);
overlay.addEventListener('click', toggleSidebar);

// Animate bars on load
window.addEventListener('DOMContentLoaded', () => {
  const bars = document.querySelectorAll('.bar');
  bars.forEach(bar => {
    const targetHeight = bar.style.height;
    bar.style.height = '0%';
    setTimeout(() => {
      bar.style.height = targetHeight;
    }, 100);
  });
});

// =========================================
// ADD PRODUCT MODAL LOGIC
// =========================================
const addProductBtn = document.querySelector('.page-header .btn-primary');
const addProductModal = document.getElementById('addProductModal');
const closeAddProductBtn = document.getElementById('closeAddProduct');
const cancelAddProductBtn = document.getElementById('cancelAddProduct');
const addProductForm = document.getElementById('addProductForm');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('productImage');

function openAddProductModal() {
  addProductModal.classList.add('active');
}

function closeAddProductModal() {
  addProductModal.classList.remove('active');
  addProductForm.reset();
}

// Open modal
if (addProductBtn) {
  addProductBtn.addEventListener('click', openAddProductModal);
}

// Close modal
if (closeAddProductBtn) {
  closeAddProductBtn.addEventListener('click', closeAddProductModal);
}
if (cancelAddProductBtn) {
  cancelAddProductBtn.addEventListener('click', (e) => {
    e.preventDefault();
    closeAddProductModal();
  });
}

// Close when clicking outside the modal box
addProductModal.addEventListener('click', (e) => {
  if (e.target === addProductModal) {
    closeAddProductModal();
  }
});

// Upload area click to trigger file input
if (uploadArea) {
  uploadArea.addEventListener('click', () => {
    fileInput.click();
  });
}

// Handle Form Submission
const saveProductBtn = document.getElementById('saveProductBtn');
if (saveProductBtn) {
  saveProductBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!addProductForm.checkValidity()) {
      addProductForm.reportValidity();
      return;
    }

    // Prepare FormData
    const formData = new FormData();
    if (fileInput.files.length > 0) {
      formData.append('image', fileInput.files[0]);
    } else {
      alert("Please select a product image.");
      return;
    }
    
    formData.append('name', document.getElementById('productName').value);
    formData.append('category', document.getElementById('productCat').value);
    formData.append('price', document.getElementById('productPrice').value);
    formData.append('stock', document.getElementById('productStock').value);
    formData.append('description', document.getElementById('productDesc').value);

    // Show loading state
    const originalText = saveProductBtn.innerHTML;
    saveProductBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    saveProductBtn.disabled = true;
    
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        saveProductBtn.innerHTML = '<i class="fa-solid fa-check"></i> Saved!';
        saveProductBtn.classList.remove('btn-primary');
        saveProductBtn.classList.add('btn-success');
        
        setTimeout(() => {
          closeAddProductModal();
          // Reset button state
          saveProductBtn.innerHTML = originalText;
          saveProductBtn.classList.add('btn-primary');
          saveProductBtn.classList.remove('btn-success');
          saveProductBtn.disabled = false;
        }, 1000);
      } else {
        const err = await response.json();
        alert("Error saving product: " + err.error);
        saveProductBtn.innerHTML = originalText;
        saveProductBtn.disabled = false;
      }
    } catch (error) {
      console.error(error);
      alert("Network error. Please try again.");
      saveProductBtn.innerHTML = originalText;
      saveProductBtn.disabled = false;
    }
  });
}

// =========================================
// TOAST NOTIFICATIONS
// =========================================
function showAdminToast(msg) {
  let toast = document.getElementById('adminToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'adminToast';
    toast.style.cssText = `
      position: fixed;
      bottom: 32px;
      right: 32px;
      background: var(--bg-card);
      border: 1px solid var(--primary);
      color: var(--text-primary);
      padding: 12px 24px;
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      font-weight: 600;
      z-index: 9999;
      opacity: 0;
      transition: all 0.3s ease;
      box-shadow: 0 8px 32px var(--primary-glow);
      max-width: 350px;
      pointer-events: none;
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
  }, 3000);
}

// =========================================
// TAB SWITCHING LOGIC
// =========================================
const menuDashboard = document.getElementById('menuDashboard');
const menuFeedback = document.getElementById('menuFeedback');
const dashboardSection = document.getElementById('dashboardSection');
const feedbacksSection = document.getElementById('feedbacksSection');
const allMenuItems = document.querySelectorAll('.sidebar-menu .menu-item');

function switchSection(targetSectionId, activeMenuEl) {
  // Toggle active class on sidebar
  allMenuItems.forEach(item => item.classList.remove('active'));
  activeMenuEl.classList.add('active');

  // Toggle sections
  document.querySelectorAll('.admin-section').forEach(sec => sec.classList.remove('active'));
  const targetSec = document.getElementById(targetSectionId);
  if (targetSec) {
    targetSec.classList.add('active');
  }
}

if (menuDashboard) {
  menuDashboard.addEventListener('click', (e) => {
    e.preventDefault();
    switchSection('dashboardSection', menuDashboard);
  });
}

if (menuFeedback) {
  menuFeedback.addEventListener('click', (e) => {
    e.preventDefault();
    switchSection('feedbacksSection', menuFeedback);
    loadFeedbackData();
  });
}

// Bind other mock menus
allMenuItems.forEach(item => {
  if (item !== menuDashboard && item !== menuFeedback) {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      showAdminToast('Feature coming soon — stay tuned!');
    });
  }
});

// =========================================
// FEEDBACK & MARKETING ANALYTICS LOGIC
// =========================================
const adminFeedbackTableBody = document.getElementById('adminFeedbackTableBody');
const referralsChartContainer = document.getElementById('referralsChartContainer');
const refreshFeedbackBtn = document.getElementById('refreshFeedbackBtn');

async function loadFeedbackData() {
  await Promise.all([
    fetchAndRenderAdminFeedbacks(),
    fetchAndRenderReferralStats()
  ]);
}

async function fetchAndRenderAdminFeedbacks() {
  if (!adminFeedbackTableBody) return;

  try {
    const response = await fetch('/api/feedbacks');
    if (!response.ok) throw new Error();
    const feedbacks = await response.json();
    
    // Update badge in sidebar
    const badge = document.getElementById('adminFeedbackBadge');
    if (badge) {
      badge.textContent = feedbacks.length;
      badge.style.display = feedbacks.length > 0 ? 'inline-block' : 'none';
    }

    if (feedbacks.length === 0) {
      adminFeedbackTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 40px 0;">
            <i class="fa-regular fa-comments" style="font-size: 2.5rem; margin-bottom: 12px; display: block; opacity: 0.3;"></i>
            No feedbacks submitted yet.
          </td>
        </tr>`;
      return;
    }

    adminFeedbackTableBody.innerHTML = feedbacks.map(item => {
      // Parse date safely
      let dateStr = '';
      try {
        if (item.created_at) {
          const dateObj = new Date(item.created_at.replace(' ', 'T') + 'Z');
          dateStr = dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        }
      } catch (e) {
        dateStr = item.created_at || '';
      }

      // Class mapping
      let sourceClass = 'source-other';
      const sourceLower = (item.source || '').toLowerCase();
      if (sourceLower.includes('instagram')) sourceClass = 'source-instagram';
      else if (sourceLower.includes('tiktok')) sourceClass = 'source-tiktok';
      else if (sourceLower.includes('whatsapp')) sourceClass = 'source-whatsapp';
      else if (sourceLower.includes('mouth') || sourceLower.includes('friend') || sourceLower.includes('recommendation')) sourceClass = 'source-word-of-mouth';
      else if (sourceLower.includes('search') || sourceLower.includes('google')) sourceClass = 'source-search-engine';
      else if (sourceLower.includes('advertisement') || sourceLower.includes('ad')) sourceClass = 'source-advertisement';

      return `
        <tr>
          <td><strong style="color:var(--text-primary);">${escapeAdminHTML(item.name)}</strong></td>
          <td style="max-width: 300px; white-space: normal; color: var(--text-secondary); line-height: 1.4;">${escapeAdminHTML(item.comment)}</td>
          <td><span class="feedback-source-tag ${sourceClass}">${escapeAdminHTML(item.source)}</span></td>
          <td>${dateStr}</td>
          <td>
            <button class="btn-action-delete" data-id="${item.id}" title="Delete Feedback">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Bind delete events
    adminFeedbackTableBody.querySelectorAll('.btn-action-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (confirm('Are you sure you want to delete this feedback?')) {
          await deleteFeedback(id);
        }
      });
    });

  } catch (error) {
    console.error(error);
    adminFeedbackTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: var(--danger); padding: 20px;">
          Error loading feedbacks.
        </td>
      </tr>`;
  }
}

async function deleteFeedback(id) {
  try {
    const response = await fetch(`/api/feedbacks/${id}`, { method: 'DELETE' });
    if (response.ok) {
      showAdminToast('Feedback deleted successfully.');
      loadFeedbackData();
    } else {
      showAdminToast('Failed to delete feedback.');
    }
  } catch (error) {
    console.error(error);
    showAdminToast('Network error.');
  }
}

async function fetchAndRenderReferralStats() {
  if (!referralsChartContainer) return;

  try {
    const response = await fetch('/api/referrals/stats');
    if (!response.ok) throw new Error();
    const data = await response.json();

    // Populate stat cards
    document.getElementById('statTotalFeedback').textContent = data.total;
    document.getElementById('statTotalReferrals').textContent = data.total;

    let topChannel = '-';
    let topChannelPercent = 0;

    if (data.stats && data.stats.length > 0) {
      // Find top channel
      const sorted = [...data.stats].sort((a, b) => b.count - a.count);
      topChannel = sorted[0].source;
      topChannelPercent = sorted[0].percentage;
    }

    document.getElementById('statTopChannel').textContent = topChannel;
    document.getElementById('statTopChannelPercent').innerHTML = `<i class="fa-solid fa-arrow-trend-up"></i> ${topChannelPercent}% share`;

    if (data.total === 0) {
      referralsChartContainer.innerHTML = `
        <div style="color: var(--text-muted); text-align: center; padding: 40px 0;">
          <i class="fa-solid fa-chart-bar" style="font-size: 2.5rem; margin-bottom: 12px; display: block; opacity: 0.3;"></i>
          No statistics available.
        </div>`;
      return;
    }

    // Render chart bars
    // Define sorted stats
    const statsSorted = [...data.stats].sort((a, b) => b.count - a.count);

    referralsChartContainer.innerHTML = statsSorted.map(item => {
      let colorClass = 'bar-other';
      const sourceLower = item.source.toLowerCase();
      if (sourceLower.includes('instagram')) colorClass = 'bar-instagram';
      else if (sourceLower.includes('tiktok')) colorClass = 'bar-tiktok';
      else if (sourceLower.includes('whatsapp')) colorClass = 'bar-whatsapp';
      else if (sourceLower.includes('mouth') || sourceLower.includes('friend') || sourceLower.includes('recommendation')) colorClass = 'bar-word-of-mouth';
      else if (sourceLower.includes('search') || sourceLower.includes('google')) colorClass = 'bar-search-engine';
      else if (sourceLower.includes('advertisement') || sourceLower.includes('ad')) colorClass = 'bar-advertisement';

      return `
        <div class="referral-stat-row">
          <div class="referral-stat-info">
            <span class="referral-stat-label">${escapeAdminHTML(item.source)}</span>
            <span class="referral-stat-value">${item.count} responses (${item.percentage}%)</span>
          </div>
          <div class="referral-stat-progress">
            <div class="referral-stat-bar ${colorClass}" style="width: 0%"></div>
          </div>
        </div>
      `;
    }).join('');

    // Animate the bars width on render
    setTimeout(() => {
      referralsChartContainer.querySelectorAll('.referral-stat-bar').forEach((bar, idx) => {
        bar.style.width = statsSorted[idx].percentage + '%';
      });
    }, 100);

  } catch (error) {
    console.error(error);
    referralsChartContainer.innerHTML = `
      <div style="color: var(--danger); text-align: center; padding: 20px;">
        Error loading marketing analytics stats.
      </div>`;
  }
}

function escapeAdminHTML(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}

if (refreshFeedbackBtn) {
  refreshFeedbackBtn.addEventListener('click', loadFeedbackData);
}

// Initial fetch of badge count on load
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/api/feedbacks');
    if (response.ok) {
      const feedbacks = await response.json();
      const badge = document.getElementById('adminFeedbackBadge');
      if (badge) {
        badge.textContent = feedbacks.length;
        badge.style.display = feedbacks.length > 0 ? 'inline-block' : 'none';
      }
    }
  } catch (e) {
    console.error(e);
  }
});
