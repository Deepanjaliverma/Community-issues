// // Mock data - replace this later with real API call

// // =============================================
// // api.js — All Data & Mock Backend
// // =============================================

// // Master issues array — this is your database for now
// let mockIssues = [
//   { id: 128, title: "Pothole near XYZ Crossing",   category: "Roads",       location: "Gomti Nagar",  description: "Large pothole near XYZ crossing. Vehicles swerving dangerously. Exists for over 2 weeks.", votes: 75, status: "pending",     photo: null },
//   { id: 114, title: "Street Light Not Working",     category: "Electricity", location: "Aliganj",      description: "Street light on main road has not been working for 5 days. Area is completely dark at night.", votes: 42, status: "in-progress", photo: null },
//   { id: 97,  title: "Water Leakage Main Road",      category: "Water",       location: "Indira Nagar", description: "Water pipe burst near the main crossing. Wasting water and making road slippery.", votes: 20, status: "resolved",    photo: null },
//   { id: 88,  title: "Garbage Not Collected",        category: "Cleanliness", location: "Hazratganj",   description: "Garbage has not been collected for 4 days. Causing bad smell and hygiene issues.", votes: 33, status: "pending",     photo: null },
//   { id: 76,  title: "Broken Traffic Signal",        category: "Traffic",     location: "Charbagh",     description: "Traffic signal at main chowk is broken since Monday. Causing traffic jams every morning.", votes: 58, status: "in-progress", photo: null }
// ];

// // Counter for new issue IDs
// let nextId = 200;

// // Returns all issues
// function fetchIssues() {
//   return new Promise(function(resolve) {
//     setTimeout(function() { resolve([...mockIssues]); }, 300);
//   });
// }

// // Returns one issue by ID
// function fetchIssueById(id) {
//   return new Promise(function(resolve) {
//     const issue = mockIssues.find(function(i) { return i.id === id; });
//     setTimeout(function() { resolve(issue || null); }, 200);
//   });
// }

// // Adds a new issue
// function addIssue(issueData) {
//   const newIssue = {
//     id: nextId++,
//     title: issueData.title,
//     category: issueData.category,
//     location: issueData.location,
//     description: issueData.description,
//     votes: 0,
//     status: "pending",
//     photo: issueData.photo || null
//   };
//   mockIssues.unshift(newIssue); // add to top
//   return newIssue;
// }

// // Adds 1 vote to an issue
// function upvoteIssue(issueId) {
//   const issue = mockIssues.find(function(i) { return i.id === issueId; });
//   if (issue) { issue.votes += 1; return issue; }
//   return null;
// }

// // Updates status of an issue (used in admin)
// function updateIssueStatus(issueId, newStatus) {
//   const issue = mockIssues.find(function(i) { return i.id === issueId; });
//   if (issue) { issue.status = newStatus; return issue; }
//   return null;
// }

// // Returns badge CSS class and label for a status string
// function getBadgeInfo(status) {
//   if (status === "pending")     return { cls: "badge-pending",  label: "Pending" };
//   if (status === "in-progress") return { cls: "badge-progress", label: "In Progress" };
//   if (status === "resolved")    return { cls: "badge-resolved", label: "Resolved" };
//   return { cls: "badge-pending", label: status };
// }

const BASE_URL = 'http://localhost:3000/api';

function fetchIssues() {
  return fetch(BASE_URL + '/issues')
    .then(function(res) { return res.json(); })
    .catch(function(err) {
      console.error('fetchIssues failed:', err);
      return [];
    });
}

function fetchIssueById(id) {
  return fetch(BASE_URL + '/issues/' + id)
    .then(function(res) { return res.json(); })
    .catch(function(err) {
      console.error('fetchIssueById failed:', err);
      return null;
    });
}

function addIssue(issueData) {
  return fetch(BASE_URL + '/issues', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(issueData)
  })
    .then(function(res) { return res.json(); })
    .catch(function(err) {
      console.error('addIssue failed:', err);
      return null;
    });
}

function upvoteIssue(issueId) {
  return fetch(BASE_URL + '/issues/' + issueId + '/upvote', {
    method: 'PATCH'
  })
    .then(function(res) { return res.json(); })
    .catch(function(err) {
      console.error('upvoteIssue failed:', err);
      return null;
    });
}

function updateIssueStatus(issueId, newStatus) {
  return fetch(BASE_URL + '/issues/' + issueId + '/status', {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ status: newStatus })
  })
    .then(function(res) { return res.json(); })
    .catch(function(err) {
      console.error('updateIssueStatus failed:', err);
      return null;
    });
}

function getBadgeInfo(status) {
  if (status === 'pending')     return { cls: 'badge-pending',  label: 'Pending' };
  if (status === 'in-progress') return { cls: 'badge-progress', label: 'In Progress' };
  if (status === 'resolved')    return { cls: 'badge-resolved', label: 'Resolved' };
  return { cls: 'badge-pending', label: status };
}