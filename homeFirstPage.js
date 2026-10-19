
// =============================================
// app.js — All Page Logic
// =============================================

// ─── PAGE NAVIGATION ──────────────────────
// Shows one page and hides all others

function showPage(pageName) {
  // Hide every page
  const allPages = document.querySelectorAll('.page');
  allPages.forEach(function(p) { p.style.display = 'none'; });

  // Show the selected page
  document.getElementById('page-' + pageName).style.display = 'block';

  // Update active nav link
  const allNavLinks = document.querySelectorAll('nav a');
  allNavLinks.forEach(function(a) { a.classList.remove('active'); });
  const activeLink = document.getElementById('nav-' + pageName);
  if (activeLink) activeLink.classList.add('active');

  // Scroll back to top
  window.scrollTo(0, 0);

  // Load the right data for each page
  if (pageName === 'home')   loadHomePage();
  if (pageName === 'issues') loadIssuesPage();
  if (pageName === 'admin')  loadAdminPage();
}

// ─── HOME PAGE ────────────────────────────

async function loadHomePage() {
  const issues = await fetchIssues();
  renderBoard(issues);
  renderStats(issues);
}

function renderBoard(issues) {
  const container = document.getElementById('boardRows');
  if (!container) return;
  // Show top 3 by votes
  const top3 = [...issues].sort(function(a,b){ return b.votes - a.votes; }).slice(0, 3);
  container.innerHTML = top3.map(function(issue) {
    const badge = getBadgeInfo(issue.status);
    return `
      <div class="lb-row">
        <div class="lb-info">
          <div class="lb-name">${issue.title}</div>
          <div class="lb-meta">${issue.location} · #${issue.id}</div>
        </div>
        <div class="lb-right">
          <div class="lb-votes">
            <span class="v-num">${issue.votes}</span>
            <span class="v-label">votes</span>
          </div>
          <span class="badge ${badge.cls}">${badge.label}</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderStats(issues) {
  const total    = issues.length;
  const resolved = issues.filter(function(i){ return i.status === 'resolved'; }).length;
  const pending  = issues.filter(function(i){ return i.status !== 'resolved'; }).length;
  const rate     = total > 0 ? Math.round((resolved / total) * 100) : 0;
  document.getElementById('statTotal').textContent    = total;
  document.getElementById('statResolved').textContent = resolved;
  document.getElementById('statPending').textContent  = pending;
  document.getElementById('statRate').textContent     = rate + '%';
}

// ─── ALL ISSUES PAGE ──────────────────────

let allIssues = []; // store for filtering

async function loadIssuesPage() {
  allIssues = await fetchIssues();
  displayIssues(allIssues);
}

function displayIssues(issues) {
  const container = document.getElementById('issueCards');
  const countEl   = document.getElementById('issuesCount');
  if (!container) return;

  countEl.textContent = issues.length + ' issue' + (issues.length !== 1 ? 's' : '') + ' found';

  if (issues.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:60px 0;color:var(--muted)"><div style="font-size:48px;margin-bottom:16px">🔍</div><p>No issues match your filters.</p></div>';
    return;
  }

  container.innerHTML = issues.map(function(issue) {
    const badge = getBadgeInfo(issue.status);
    return `
      <div class="issue-card" onclick="openDetails(${issue.id})">
        <div class="issue-card-top">
          <div>
            <div class="issue-card-title">${issue.title}</div>
            <div class="issue-card-meta">📍 ${issue.location} &nbsp;·&nbsp; 🆔 #${issue.id}</div>
          </div>
          <div class="issue-card-right">
            <div class="issue-card-votes">${issue.votes}<span>votes</span></div>
            <span class="badge ${badge.cls}">${badge.label}</span>
          </div>
        </div>
        <div class="issue-card-desc">${issue.description.substring(0, 120)}...</div>
        <div class="issue-card-footer">
          <span class="cat-badge">${issue.category}</span>
          <button class="upvote-btn" onclick="event.stopPropagation(); quickUpvote(${issue.id}, this)">
            👍 Upvote
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function filterIssues() {
  const search   = document.getElementById('searchInput').value.toLowerCase();
  const category = document.getElementById('filterCategory').value;
  const status   = document.getElementById('filterStatus').value;
  const sort     = document.getElementById('filterSort').value;

  let filtered = allIssues.filter(function(issue) {
    const matchSearch   = issue.title.toLowerCase().includes(search) || issue.location.toLowerCase().includes(search);
    const matchCategory = !category || issue.category === category;
    const matchStatus   = !status   || issue.status   === status;
    return matchSearch && matchCategory && matchStatus;
  });

  if (sort === 'votes') {
    filtered.sort(function(a,b){ return b.votes - a.votes; });
  } else {
    filtered.sort(function(a,b){ return b.id - a.id; });
  }

  displayIssues(filtered);
}

function resetFilters() {
  document.getElementById('searchInput').value    = '';
  document.getElementById('filterCategory').value = '';
  document.getElementById('filterStatus').value   = '';
  document.getElementById('filterSort').value     = 'votes';
  displayIssues(allIssues);
}

function quickUpvote(issueId, btn) {
  upvoteIssue(issueId);
  btn.classList.add('voted');
  btn.textContent = '✅ Voted';
  btn.disabled = true;
  // Update the vote count shown on the card
  const issue = allIssues.find(function(i){ return i.id === issueId; });
  if (issue) {
    const voteEl = btn.closest('.issue-card').querySelector('.issue-card-votes');
    voteEl.innerHTML = issue.votes + '<span>votes</span>';
  }
}

// ─── ISSUE DETAILS PAGE ───────────────────

async function openDetails(issueId) {
  showPage('details');
  const issue = await fetchIssueById(issueId);
  if (!issue) return;

  const badge = getBadgeInfo(issue.status);

  document.getElementById('detailTitle').textContent    = issue.title;
  document.getElementById('detailLocation').textContent = issue.location;
  document.getElementById('detailId').textContent       = issue.id;
  document.getElementById('detailVotes').textContent    = issue.votes;
  document.getElementById('detailDescription').textContent = issue.description;

  // Category badge
  document.getElementById('detailCategory').textContent  = issue.category;
  document.getElementById('detailCategory').className    = 'cat-badge';

  // Status badge
  document.getElementById('detailStatus').textContent = badge.label;
  document.getElementById('detailStatus').className   = 'badge ' + badge.cls;

  // Photo
  if (issue.photo) {
    document.getElementById('detailPhoto').src = issue.photo;
    document.getElementById('detailPhotoWrap').style.display = 'block';
  } else {
    document.getElementById('detailPhotoWrap').style.display = 'none';
  }

  // Timeline
  renderTimeline(issue.status);

  // Store current issue ID for voting
  document.getElementById('voteBtn').dataset.id = issueId;
}

function renderTimeline(currentStatus) {
  const steps = [
    { key: 'pending',     label: 'Pending',     desc: 'Issue submitted by community' },
    { key: 'in-progress', label: 'In Progress', desc: 'Work has been assigned' },
    { key: 'resolved',    label: 'Resolved',    desc: 'Issue has been fixed' }
  ];
  const order = ['pending', 'in-progress', 'resolved'];
  const currentIndex = order.indexOf(currentStatus);

  document.getElementById('detailTimeline').innerHTML = steps.map(function(step, i) {
    let dotClass = '';
    let icon = '';
    if (i < currentIndex)  { dotClass = 'done';   icon = '✓'; }
    if (i === currentIndex) { dotClass = 'active'; icon = '●'; }
    return `
      <div class="timeline-step">
        <div class="tl-dot ${dotClass}">${icon}</div>
        <div class="tl-info">
          <div class="tl-name">${step.label}</div>
          <div class="tl-desc">${step.desc}</div>
        </div>
      </div>
    `;
  }).join('');
}

function voteOnDetail() {
  const btn     = document.getElementById('voteBtn');
  const issueId = parseInt(btn.dataset.id);
  const updated = upvoteIssue(issueId);
  if (updated) {
    document.getElementById('detailVotes').textContent = updated.votes;
    btn.textContent = '✅ Voted!';
    btn.disabled = true;
  }
}

// ─── REPORT PAGE ──────────────────────────

// Make file drop area clickable
document.addEventListener('DOMContentLoaded', function() {
  const fileDrop = document.getElementById('fileDrop');
  if (fileDrop) {
    fileDrop.addEventListener('click', function() {
      document.getElementById('issuePhoto').click();
    });
  }
  // Load home page on start
  loadHomePage();
});

function handleFileSelect(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('previewImg').src = e.target.result;
    document.getElementById('filePreview').style.display = 'block';
    document.getElementById('fileDrop').style.display    = 'none';
  };
  reader.readAsDataURL(file);
}

function removeFile() {
  document.getElementById('issuePhoto').value = '';
  document.getElementById('filePreview').style.display = 'none';
  document.getElementById('fileDrop').style.display    = 'block';
}

function submitIssue() {
  // Get values
  const title       = document.getElementById('issueTitle').value.trim();
  const category    = document.getElementById('issueCategory').value;
  const location    = document.getElementById('issueLocation').value.trim();
  const description = document.getElementById('issueDescription').value.trim();
  const photoSrc    = document.getElementById('previewImg').src || null;

  // Clear old errors
  document.getElementById('err-title').textContent       = '';
  document.getElementById('err-category').textContent    = '';
  document.getElementById('err-location').textContent    = '';
  document.getElementById('err-description').textContent = '';

  // Validate
  let hasError = false;
  if (!title)       { document.getElementById('err-title').textContent       = 'Please enter a title.';       hasError = true; }
  if (!category)    { document.getElementById('err-category').textContent    = 'Please select a category.';   hasError = true; }
  if (!location)    { document.getElementById('err-location').textContent    = 'Please enter a location.';    hasError = true; }
  if (!description) { document.getElementById('err-description').textContent = 'Please enter a description.'; hasError = true; }
  if (hasError) return;

  // Add the issue
  addIssue({
    title: title,
    category: category,
    location: location,
    description: description,
    photo: document.getElementById('filePreview').style.display !== 'none' ? photoSrc : null
  });

  // Show success screen
  document.getElementById('reportForm').style.display    = 'none';
  document.getElementById('reportSuccess').style.display = 'block';
}

function resetReportForm() {
  document.getElementById('issueTitle').value       = '';
  document.getElementById('issueCategory').value    = '';
  document.getElementById('issueLocation').value    = '';
  document.getElementById('issueDescription').value = '';
  removeFile();
  document.getElementById('reportForm').style.display    = 'block';
  document.getElementById('reportSuccess').style.display = 'none';
}

// ─── ADMIN PAGE ───────────────────────────

async function loadAdminPage() {
  const issues = await fetchIssues();

  // Stats
  document.getElementById('adminTotal').textContent    = issues.length;
  document.getElementById('adminResolved').textContent = issues.filter(function(i){ return i.status === 'resolved'; }).length;
  document.getElementById('adminPending').textContent  = issues.filter(function(i){ return i.status === 'pending'; }).length;
  document.getElementById('adminProgress').textContent = issues.filter(function(i){ return i.status === 'in-progress'; }).length;

  // Table
  renderAdminTable(issues);
}

function renderAdminTable(issues) {
  const tbody = document.getElementById('adminTableBody');
  if (!tbody) return;
  tbody.innerHTML = issues.map(function(issue) {
    const badge = getBadgeInfo(issue.status);
    return `
      <tr>
        <td><strong>#${issue.id}</strong></td>
        <td>${issue.title}</td>
        <td>${issue.category}</td>
        <td>${issue.location}</td>
        <td><strong>${issue.votes}</strong></td>
        <td><span class="badge ${badge.cls}">${badge.label}</span></td>
        <td>
          <select class="status-select" onchange="changeStatus(${issue.id}, this.value)">
            <option value="pending"     ${issue.status === 'pending'     ? 'selected' : ''}>Pending</option>
            <option value="in-progress" ${issue.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
            <option value="resolved"    ${issue.status === 'resolved'    ? 'selected' : ''}>Resolved</option>
          </select>
        </td>
      </tr>
    `;
  }).join('');
}

function changeStatus(issueId, newStatus) {
  updateIssueStatus(issueId, newStatus);
  loadAdminPage(); // refresh stats
}

function filterAdminTable(query) {
  fetchIssues().then(function(issues) {
    const filtered = issues.filter(function(i) {
      return i.title.toLowerCase().includes(query.toLowerCase()) ||
             i.location.toLowerCase().includes(query.toLowerCase());
    });
    renderAdminTable(filtered);
  });
}