const API = 'https://devprasad-api.onrender.com/api';
const token = localStorage.getItem('sc_token');

if(!token) window.location.href = 'login.html';

function toast(msg, type) {
    var t = document.createElement('div');
    t.style.cssText = 'position:fixed;top:20px;right:20px;z-index:200;padding:12px 20px;border-radius:8px;color:#fff;font-size:13px;animation:slideIn .3s ease';
    t.style.background = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#4f46e5';
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

// ============ TAB SWITCHING ============
function showTab(tab) {
    // Update sidebar active
    var links = document.querySelectorAll('.sidebar-nav a');
    for(var i=0; i<links.length; i++) links[i].classList.remove('active');
    
    var activeLink = document.querySelector('[data-tab="' + tab + '"]');
    if(activeLink) activeLink.classList.add('active');
    
    // Hide all tabs
    var tabs = ['dashboard', 'services', 'orders', 'users', 'settings'];
    for(var i=0; i<tabs.length; i++) {
        var el = document.getElementById(tabs[i] + 'Tab');
        if(el) el.style.display = 'none';
    }
    
    // Show selected tab
    var show = document.getElementById(tab + 'Tab');
    if(show) show.style.display = 'block';
    
    // Load data
    if(tab === 'dashboard') loadDashboard();
    if(tab === 'services') loadServices();
    if(tab === 'orders') loadOrders();
    if(tab === 'users') loadUsers();
    if(tab === 'settings') loadSettings();
}

// ============ DASHBOARD ============
function loadDashboard() {
    fetch(API + '/admin/dashboard', {
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(function(r){ return r.json(); })
    .then(function(d){
        if(d && d.success) {
            document.getElementById('totalUsers').textContent = d.data.totalUsers || 0;
            document.getElementById('totalServices').textContent = d.data.totalServices || 0;
            document.getElementById('totalOrders').textContent = d.data.totalOrders || 0;
            document.getElementById('pendingOrders').textContent = d.data.pendingOrders || 0;
        }
    });
}

// ============ SERVICES ============
function loadServices() {
    fetch(API + '/services?limit=100')
    .then(function(r){ return r.json(); })
    .then(function(d){
        var tbody = document.getElementById('servicesTable');
        tbody.innerHTML = '';
        if(d && d.data && d.data.length > 0) {
            for(var i=0; i<d.data.length; i++) {
                var s = d.data[i];
                var row = '<tr>' +
                    '<td><strong>' + s.name + '</strong>' + (s.nameBn ? '<br><small>' + s.nameBn + '</small>' : '') + '</td>' +
                    '<td><span class="badge badge-info">' + s.category + '</span></td>' +
                    '<td>₹' + s.price + '</td>' +
                    '<td>' + (s.isActive ? '✅ Active' : '❌ Inactive') + '</td>' +
                    '<td>' +
                        '<button class="btn btn-sm btn-outline" onclick="editService(\'' + s._id + '\')">✏️ Edit</button> ' +
                        '<button class="btn btn-sm btn-danger" onclick="deleteService(\'' + s._id + '\')">🗑️</button>' +
                    '</td>' +
                '</tr>';
                tbody.innerHTML += row;
            }
        } else {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px">No services. Click Add Service button.</td></tr>';
        }
    });
}

// SHOW SERVICE FORM - This is the fix!
function showServiceForm(id) {
    console.log('Opening form, id:', id);
    var modal = document.getElementById('serviceModal');
    if(!modal) { alert('Modal not found!'); return; }
    
    document.getElementById('modalTitle').textContent = id ? 'Edit Service' : 'Add Service';
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
    
    modal.classList.add('active');
    
    if(id) {
        fetch(API + '/services/' + id)
        .then(function(r){ return r.json(); })
        .then(function(d){
            if(d && d.success && d.data) {
                var s = d.data;
                document.getElementById('sName').value = s.name || '';
                document.getElementById('sNameBn').value = s.nameBn || '';
                document.getElementById('sCat').value = s.category || '';
                document.getElementById('sPrice').value = s.price || '';
                document.getElementById('sDesc').value = s.description || '';
                document.getElementById('sTime').value = s.processingTime || '';
                document.getElementById('sTrend').checked = s.isTrending;
                document.getElementById('sFeat').checked = s.isFeatured;
            }
        });
    }
}

function editService(id) { showServiceForm(id); }

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
    
    var img = document.getElementById('sImage').files[0];
    if(img) formData.append('serviceImage', img);
    
    var url = id ? API + '/admin/services/' + id : API + '/admin/services';
    
    fetch(url, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Authorization': 'Bearer ' + token },
        body: formData
    })
    .then(function(r){ return r.json(); })
    .then(function(d){
        if(d && d.success) {
            toast('Saved!', 'success');
            document.getElementById('serviceModal').classList.remove('active');
            loadServices();
        } else {
            toast('Failed to save', 'error');
        }
    });
}

function deleteService(id) {
    if(!confirm('Delete this service?')) return;
    fetch(API + '/admin/services/' + id, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(function(r){ return r.json(); })
    .then(function(d){
        if(d && d.success) { toast('Deleted!', 'success'); loadServices(); }
    });
}

// ============ ORDERS ============
function loadOrders(filter) {
    var url = API + '/admin/orders?limit=100';
    if(filter && filter !== 'all') url += '&status=' + filter;
    
    fetch(url, { headers: { 'Authorization': 'Bearer ' + token } })
    .then(function(r){ return r.json(); })
    .then(function(d){
        var tbody = document.getElementById('ordersTable');
        tbody.innerHTML = '';
        if(d && d.data && d.data.length > 0) {
            for(var i=0; i<d.data.length; i++) {
                var o = d.data[i];
                tbody.innerHTML += '<tr>' +
                    '<td>#' + (o.orderNumber || o._id.slice(-6)) + '</td>' +
                    '<td>' + (o.customerDetails ? o.customerDetails.name : 'N/A') + '</td>' +
                    '<td>' + (o.service ? o.service.name : (o.customService || 'N/A')) + '</td>' +
                    '<td><span class="badge badge-' + (o.status==='completed'?'success':o.status==='pending'?'warning':'info') + '">' + o.status + '</span></td>' +
                    '<td>' + new Date(o.createdAt).toLocaleDateString() + '</td>' +
                    '<td>' +
                        '<select onchange="updateOrderStatus(\'' + o._id + '\', this.value)" style="padding:5px;border:1px solid #ddd;border-radius:5px;font-size:12px">' +
                            '<option ' + (o.status==='pending'?'selected':'') + '>pending</option>' +
                            '<option ' + (o.status==='processing'?'selected':'') + '>processing</option>' +
                            '<option ' + (o.status==='completed'?'selected':'') + '>completed</option>' +
                            '<option ' + (o.status==='rejected'?'selected':'') + '>rejected</option>' +
                        '</select> ' +
                        '<button class="btn btn-sm btn-danger" onclick="deleteOrder(\'' + o._id + '\')">🗑️</button>' +
                    '</td>' +
                '</tr>';
            }
        } else {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px">No orders</td></tr>';
        }
    });
}

function updateOrderStatus(id, status) {
    fetch(API + '/admin/orders/' + id + '/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ status: status })
    })
    .then(function(r){ return r.json(); })
    .then(function(d){ if(d && d.success) toast('Updated!', 'success'); });
}

function deleteOrder(id) {
    if(!confirm('Delete?')) return;
    fetch(API + '/admin/orders/' + id, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(function(r){ return r.json(); })
    .then(function(d){ if(d && d.success) { toast('Deleted!', 'success'); loadOrders(); } });
}

// ============ USERS ============
function loadUsers() {
    fetch(API + '/admin/users', { headers: { 'Authorization': 'Bearer ' + token } })
    .then(function(r){ return r.json(); })
    .then(function(d){
        var tbody = document.getElementById('usersTable');
        tbody.innerHTML = '';
        if(d && d.data && d.data.length > 0) {
            for(var i=0; i<d.data.length; i++) {
                var u = d.data[i];
                tbody.innerHTML += '<tr>' +
                    '<td><strong>' + u.name + '</strong></td>' +
                    '<td>' + u.email + '</td>' +
                    '<td>' + u.mobile + '</td>' +
                    '<td>' + (u.isActive ? '✅ Active' : '❌ Inactive') + '</td>' +
                    '<td>' +
                        '<button class="btn btn-sm btn-outline" onclick="toggleUser(\'' + u._id + '\',' + u.isActive + ')">' + (u.isActive ? 'Deactivate' : 'Activate') + '</button>' +
                        (u.role !== 'admin' ? ' <button class="btn btn-sm btn-danger" onclick="deleteUser(\'' + u._id + '\')">🗑️</button>' : '') +
                    '</td>' +
                '</tr>';
            }
        } else {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px">No users</td></tr>';
        }
    });
}

function toggleUser(id, status) {
    fetch(API + '/admin/users/' + id + '/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ isActive: !status })
    })
    .then(function(r){ return r.json(); })
    .then(function(d){ if(d && d.success) { toast('Updated!', 'success'); loadUsers(); } });
}

function deleteUser(id) {
    if(!confirm('Delete user and orders?')) return;
    fetch(API + '/admin/users/' + id, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(function(r){ return r.json(); })
    .then(function(d){ if(d && d.success) { toast('Deleted!', 'success'); loadUsers(); } });
}

// ============ SETTINGS ============
function loadSettings() {
    fetch(API + '/admin/settings')
    .then(function(r){ return r.json(); })
    .then(function(d){
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
    .then(function(r){ return r.json(); })
    .then(function(d){ if(d && d.success) toast('Settings saved!', 'success'); });
}

// Init
loadDashboard();

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
