const API = 'http://localhost:5000/api';
const token = localStorage.getItem('sc_token');

// Auth check
if(!token || token === 'null' || token === 'undefined') {
    window.location.href = 'login.html';
}

// Helper functions
function getHeaders(isFormData) {
    const h = { 'Authorization': 'Bearer ' + token };
    if(!isFormData) h['Content-Type'] = 'application/json';
    return h;
}

function toast(msg, type) {
    const t = document.createElement('div');
    t.className = 'toast toast-' + (type || 'info');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function(){ t.remove(); }, 3000);
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('show');
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

// Show tab
function showTab(tab) {
    // Update active link
    var links = document.querySelectorAll('.sidebar-nav a');
    for(var i=0; i<links.length; i++) {
        links[i].classList.remove('active');
    }
    
    // Find clicked link and activate
    var clickedLink = document.querySelector('[data-tab="' + tab + '"]');
    if(clickedLink) clickedLink.classList.add('active');
    
    // Hide all tabs
    var tabs = ['dashboard', 'services', 'orders', 'users', 'settings'];
    for(var i=0; i<tabs.length; i++) {
        var el = document.getElementById(tabs[i] + 'Tab');
        if(el) el.style.display = 'none';
    }
    
    // Show selected tab
    var selected = document.getElementById(tab + 'Tab');
    if(selected) selected.style.display = 'block';
    
    // Load data
    if(tab === 'dashboard') loadDashboard();
    if(tab === 'services') loadServices();
    if(tab === 'orders') loadOrders();
    if(tab === 'users') loadUsers();
    if(tab === 'settings') loadSettings();
}

// ============ DASHBOARD ============
function loadDashboard() {
    fetch(API + '/admin/dashboard', { headers: getHeaders() })
        .then(function(r) { return r.json(); })
        .then(function(d) {
            if(d && d.success) {
                document.getElementById('totalUsers').textContent = d.data.totalUsers || 0;
                document.getElementById('totalServices').textContent = d.data.totalServices || 0;
                document.getElementById('totalOrders').textContent = d.data.totalOrders || 0;
                document.getElementById('pendingOrders').textContent = d.data.pendingOrders || 0;
            }
        })
        .catch(function(err) {
            console.error('Dashboard error:', err);
        });
}

// ============ SERVICES ============
function loadServices() {
    fetch(API + '/services?limit=100')
        .then(function(r) { return r.json(); })
        .then(function(d) {
            var tbody = document.getElementById('servicesTable');
            if(d && d.data && d.data.length > 0) {
                tbody.innerHTML = '';
                for(var i=0; i<d.data.length; i++) {
                    var s = d.data[i];
                    var imgUrl = s.image || '';
                    if(imgUrl && imgUrl.indexOf('http') !== 0) {
                        imgUrl = 'http://localhost:5000/uploads/' + imgUrl;
                    }
                    if(!imgUrl) {
                        imgUrl = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect fill="%23e2e8f0" width="40" height="40"/></svg>';
                    }
                    
                    var row = '<tr>' +
                        '<td><strong>' + s.name + '</strong>' + (s.nameBn ? '<br><small style="color:#64748b">' + s.nameBn + '</small>' : '') + '</td>' +
                        '<td><span class="badge badge-info">' + s.category + '</span></td>' +
                        '<td>₹' + s.price + '</td>' +
                        '<td><span class="badge ' + (s.isActive ? 'badge-success' : 'badge-danger') + '">' + (s.isActive ? 'Active' : 'Inactive') + '</span></td>' +
                        '<td>' +
                            '<button class="btn btn-sm btn-outline" onclick="editService(\'' + s._id + '\')" style="margin-right:4px">✏️ Edit</button>' +
                            '<button class="btn btn-sm btn-danger" onclick="deleteService(\'' + s._id + '\')">🗑️</button>' +
                        '</td>' +
                    '</tr>';
                    tbody.innerHTML += row;
                }
            } else {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px">No services yet. Click Add Service to create one.</td></tr>';
            }
        })
        .catch(function(err) {
            console.error('Services error:', err);
        });
}

function showServiceForm(id) {
    document.getElementById('modalTitle').textContent = id ? 'Edit Service' : 'Add New Service';
    document.getElementById('serviceId').value = id || '';
    document.getElementById('sName').value = '';
    document.getElementById('sNameBn').value = '';
    document.getElementById('sCat').value = '';
    document.getElementById('sPrice').value = '';
    document.getElementById('sDesc').value = '';
    document.getElementById('sTime').value = '';
    document.getElementById('sTrend').checked = false;
    document.getElementById('sFeat').checked = false;
    document.getElementById('sImage').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('serviceModal').classList.add('active');
    
    // If editing, load service data
    if(id) {
        fetch(API + '/services/' + id)
            .then(function(r) { return r.json(); })
            .then(function(d) {
                if(d && d.success && d.data) {
                    var s = d.data;
                    document.getElementById('sName').value = s.name || '';
                    document.getElementById('sNameBn').value = s.nameBn || '';
                    document.getElementById('sCat').value = s.category || '';
                    document.getElementById('sPrice').value = s.price || '';
                    document.getElementById('sDesc').value = s.description || '';
                    document.getElementById('sTime').value = s.processingTime || '';
                    document.getElementById('sTrend').checked = s.isTrending || false;
                    document.getElementById('sFeat').checked = s.isFeatured || false;
                    
                    if(s.image) {
                        var imgUrl = s.image;
                        if(imgUrl.indexOf('http') !== 0) imgUrl = 'http://localhost:5000/uploads/' + imgUrl;
                        document.getElementById('imagePreview').innerHTML = '<img src="' + imgUrl + '" style="max-width:200px;border-radius:8px">';
                    }
                }
            });
    }
}

function editService(id) {
    showServiceForm(id);
}

function saveService() {
    var id = document.getElementById('serviceId').value;
    var formData = new FormData();
    formData.append('name', document.getElementById('sName').value);
    formData.append('nameBn', document.getElementById('sNameBn').value);
    formData.append('category', document.getElementById('sCat').value);
    formData.append('price', document.getElementById('sPrice').value);
    formData.append('description', document.getElementById('sDesc').value);
    formData.append('processingTime', document.getElementById('sTime').value);
    formData.append('isTrending', document.getElementById('sTrend').checked);
    formData.append('isFeatured', document.getElementById('sFeat').checked);
    
    var imgFile = document.getElementById('sImage').files[0];
    if(imgFile) formData.append('serviceImage', imgFile);
    
    var url = id ? API + '/admin/services/' + id : API + '/admin/services';
    
    fetch(url, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Authorization': 'Bearer ' + token },
        body: formData
    })
    .then(function(r) { return r.json(); })
    .then(function(d) {
        if(d && d.success) {
            toast('Service saved successfully!', 'success');
            document.getElementById('serviceModal').classList.remove('active');
            loadServices();
        } else {
            toast('Failed to save service', 'error');
        }
    })
    .catch(function(err) {
        console.error('Save error:', err);
        toast('Error saving service', 'error');
    });
}

function deleteService(id) {
    if(!confirm('Are you sure you want to delete this service?')) return;
    
    fetch(API + '/admin/services/' + id, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(function(r) { return r.json(); })
    .then(function(d) {
        if(d && d.success) {
            toast('Service deleted!', 'success');
            loadServices();
        }
    })
    .catch(function(err) {
        toast('Error deleting service', 'error');
    });
}

// ============ ORDERS ============
function loadOrders(filter) {
    filter = filter || 'all';
    var url = API + '/admin/orders?limit=100';
    if(filter !== 'all') url += '&status=' + filter;
    
    fetch(url, { headers: getHeaders() })
        .then(function(r) { return r.json(); })
        .then(function(d) {
            var tbody = document.getElementById('ordersTable');
            if(d && d.data && d.data.length > 0) {
                tbody.innerHTML = '';
                for(var i=0; i<d.data.length; i++) {
                    var o = d.data[i];
                    var statusClass = o.status === 'completed' ? 'badge-success' : o.status === 'pending' ? 'badge-warning' : 'badge-info';
                    var row = '<tr>' +
                        '<td><strong>#' + (o.orderNumber || o._id.slice(-6)) + '</strong></td>' +
                        '<td>' + (o.customerDetails ? o.customerDetails.name : 'N/A') + '</td>' +
                        '<td>' + (o.service ? o.service.name : (o.customService || 'N/A')) + '</td>' +
                        '<td><span class="badge ' + statusClass + '">' + o.status + '</span></td>' +
                        '<td>' + new Date(o.createdAt).toLocaleDateString() + '</td>' +
                        '<td>' +
                            '<select onchange="updateOrderStatus(\'' + o._id + '\', this.value)" style="padding:5px;border:1px solid #e2e8f0;border-radius:6px;font-size:12px">' +
                                '<option value="pending" ' + (o.status === 'pending' ? 'selected' : '') + '>Pending</option>' +
                                '<option value="processing" ' + (o.status === 'processing' ? 'selected' : '') + '>Processing</option>' +
                                '<option value="completed" ' + (o.status === 'completed' ? 'selected' : '') + '>Completed</option>' +
                                '<option value="rejected" ' + (o.status === 'rejected' ? 'selected' : '') + '>Rejected</option>' +
                            '</select>' +
                            '<button class="btn btn-sm btn-danger" onclick="deleteOrder(\'' + o._id + '\')" style="margin-left:4px">🗑️</button>' +
                        '</td>' +
                    '</tr>';
                    tbody.innerHTML += row;
                }
            } else {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px">No orders found</td></tr>';
            }
        });
}

function updateOrderStatus(id, status) {
    fetch(API + '/admin/orders/' + id + '/status', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status: status })
    })
    .then(function(r) { return r.json(); })
    .then(function(d) {
        if(d && d.success) toast('Status updated!', 'success');
    });
}

function deleteOrder(id) {
    if(!confirm('Delete this order?')) return;
    fetch(API + '/admin/orders/' + id, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(function(r) { return r.json(); })
    .then(function(d) {
        if(d && d.success) {
            toast('Order deleted!', 'success');
            loadOrders();
        }
    });
}

// ============ USERS ============
function loadUsers() {
    fetch(API + '/admin/users', { headers: getHeaders() })
        .then(function(r) { return r.json(); })
        .then(function(d) {
            var tbody = document.getElementById('usersTable');
            if(d && d.data && d.data.length > 0) {
                tbody.innerHTML = '';
                for(var i=0; i<d.data.length; i++) {
                    var u = d.data[i];
                    var row = '<tr>' +
                        '<td><strong>' + u.name + '</strong></td>' +
                        '<td>' + u.email + '</td>' +
                        '<td>' + u.mobile + '</td>' +
                        '<td><span class="badge ' + (u.isActive ? 'badge-success' : 'badge-danger') + '">' + (u.isActive ? 'Active' : 'Inactive') + '</span></td>' +
                        '<td>' +
                            '<button class="btn btn-sm btn-outline" onclick="toggleUser(\'' + u._id + '\',' + u.isActive + ')">' + (u.isActive ? 'Deactivate' : 'Activate') + '</button>' +
                            (u.role !== 'admin' ? '<button class="btn btn-sm btn-danger" onclick="deleteUser(\'' + u._id + '\')" style="margin-left:4px">🗑️</button>' : '') +
                        '</td>' +
                    '</tr>';
                    tbody.innerHTML += row;
                }
            } else {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px">No users found</td></tr>';
            }
        });
}

function toggleUser(id, status) {
    fetch(API + '/admin/users/' + id + '/status', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ isActive: !status })
    })
    .then(function(r) { return r.json(); })
    .then(function(d) {
        if(d && d.success) {
            toast('User updated!', 'success');
            loadUsers();
        }
    });
}

function deleteUser(id) {
    if(!confirm('Delete this user and all their orders?')) return;
    fetch(API + '/admin/users/' + id, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(function(r) { return r.json(); })
    .then(function(d) {
        if(d && d.success) {
            toast('User deleted!', 'success');
            loadUsers();
        }
    });
}

// ============ SETTINGS ============
function loadSettings() {
    fetch(API + '/admin/settings')
        .then(function(r) { return r.json(); })
        .then(function(d) {
            if(d && d.success && d.data) {
                var s = d.data;
                document.getElementById('setSiteName').value = s.siteName || '';
                document.getElementById('setOwner').value = s.ownerName || '';
                document.getElementById('setPhone').value = s.ownerWhatsApp || '';
                document.getElementById('setEmail').value = s.ownerEmail || '';
                document.getElementById('setAddress').value = s.address || '';
                document.getElementById('setHours').value = s.workingHours || '';
                document.getElementById('setWelcome').value = s.welcomeMessage || '';
                document.getElementById('setWelcomeBn').value = s.welcomeMessageBn || '';
            }
        });
}

function saveSettings() {
    var formData = new FormData();
    formData.append('siteName', document.getElementById('setSiteName').value);
    formData.append('ownerName', document.getElementById('setOwner').value);
    formData.append('ownerWhatsApp', document.getElementById('setPhone').value);
    formData.append('ownerEmail', document.getElementById('setEmail').value);
    formData.append('address', document.getElementById('setAddress').value);
    formData.append('workingHours', document.getElementById('setHours').value);
    formData.append('welcomeMessage', document.getElementById('setWelcome').value);
    formData.append('welcomeMessageBn', document.getElementById('setWelcomeBn').value);
    
    var photo = document.getElementById('setPhoto').files[0];
    if(photo) formData.append('ownerPhoto', photo);
    
    fetch(API + '/admin/settings', {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + token },
        body: formData
    })
    .then(function(r) { return r.json(); })
    .then(function(d) {
        if(d && d.success) toast('Settings saved!', 'success');
    });
}

// ============ INIT ============
// Close modal on outside click
document.getElementById('serviceModal').addEventListener('click', function(e) {
    if(e.target === this) this.classList.remove('active');
});

// Image preview
document.getElementById('sImage').addEventListener('change', function(e) {
    var file = e.target.files[0];
    if(file) {
        var reader = new FileReader();
        reader.onload = function(ev) {
            document.getElementById('imagePreview').innerHTML = '<img src="' + ev.target.result + '" style="max-width:200px;border-radius:8px">';
        };
        reader.readAsDataURL(file);
    }
});

// Load dashboard on start
loadDashboard();
