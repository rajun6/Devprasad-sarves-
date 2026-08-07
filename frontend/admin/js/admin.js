var API='https://devprasad-api.onrender.com/api';
var token=localStorage.getItem('sc_token');

async function autoLogin(){
    if(token){
        try{
            var r=await fetch(API+'/auth/me',{headers:{'Authorization':'Bearer '+token}});
            var d=await r.json();
            if(d.success)return token;
        }catch(e){}
    }
    try{
        var r=await fetch(API+'/auth/login',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({email:'admin@myadmin.com',password:'admin123'})
        });
        var d=await r.json();
        if(d.success){
            localStorage.setItem('sc_token',d.token);
            return d.token;
        }
    }catch(e){}
    return null;
}

function toast(m,t){var d=document.createElement('div');d.style.cssText='position:fixed;top:15px;right:15px;z-index:300;padding:10px 18px;border-radius:8px;color:#fff;font-size:12px;background:'+(t==='success'?'#059669':'#4f46e5');d.textContent=m;document.body.appendChild(d);setTimeout(function(){d.remove()},3000)}
function logout(){localStorage.clear();location.reload()}

// Tab switching
document.querySelectorAll('.sidebar a[data-tab]').forEach(function(a){a.addEventListener('click',function(){var t=this.getAttribute('data-tab');document.querySelectorAll('.sidebar a').forEach(function(x){x.classList.remove('active')});this.classList.add('active');document.querySelectorAll('.tab').forEach(function(x){x.classList.remove('active')});document.getElementById(t+'Tab').classList.add('active');if(t==='dashboard')loadDashboard();if(t==='services')loadServices();if(t==='orders')loadOrders('all');if(t==='users')loadUsers();if(t==='settings')loadSettings()})});
document.getElementById('menuToggle').onclick=function(){document.getElementById('sidebar').classList.toggle('open');document.getElementById('overlay').classList.toggle('show')};
document.getElementById('overlay').onclick=function(){document.getElementById('sidebar').classList.remove('open');this.classList.remove('show')};

async function loadDashboard(){var t=await autoLogin();if(!t)return;fetch(API+'/admin/dashboard',{headers:{'Authorization':'Bearer '+t}}).then(r=>r.json()).then(d=>{if(d.success){document.getElementById('totalUsers').textContent=d.data.totalUsers||0;document.getElementById('totalServices').textContent=d.data.totalServices||0;document.getElementById('totalOrders').textContent=d.data.totalOrders||0;document.getElementById('pendingOrders').textContent=d.data.pendingOrders||0}})}
function loadServices(){fetch(API+'/services?limit=100').then(r=>r.json()).then(d=>{var t=document.getElementById('servicesTable');t.innerHTML='';if(d.data&&d.data.length>0){d.data.forEach(s=>{t.innerHTML+='<tr><td><strong>'+s.name+'</strong></td><td>'+s.category+'</td><td>₹'+s.price+'</td><td><button class="btn btn-sm btn-outline" onclick="editService(\''+s._id+'\')">Edit</button> <button class="btn btn-sm btn-danger" onclick="deleteService(\''+s._id+'\')">Del</button></td></tr>'})}else{t.innerHTML='<tr><td colspan="4">No services</td></tr>'}})}
function showServiceForm(){document.getElementById('serviceForm').classList.add('active');document.getElementById('formTitle').textContent='Add Service';document.getElementById('serviceId').value='';document.getElementById('sName').value='';document.getElementById('sNameBn').value='';document.getElementById('sPrice').value='';document.getElementById('sDesc').value=''}
function editService(id){fetch(API+'/services/'+id).then(r=>r.json()).then(d=>{if(d.success){var s=d.data;document.getElementById('serviceForm').classList.add('active');document.getElementById('formTitle').textContent='Edit';document.getElementById('serviceId').value=s._id;document.getElementById('sName').value=s.name;document.getElementById('sNameBn').value=s.nameBn||'';document.getElementById('sCat').value=s.category;document.getElementById('sPrice').value=s.price;document.getElementById('sDesc').value=s.description;document.getElementById('sTime').value=s.processingTime}})}
async function saveService(){var t=await autoLogin();if(!t)return;var id=document.getElementById('serviceId').value;var fd=new FormData();fd.append('name',document.getElementById('sName').value);fd.append('nameBn',document.getElementById('sNameBn').value);fd.append('category',document.getElementById('sCat').value);fd.append('price',document.getElementById('sPrice').value);fd.append('description',document.getElementById('sDesc').value);fd.append('processingTime',document.getElementById('sTime').value);fd.append('isTrending',document.getElementById('sTrend').checked);fd.append('isFeatured',document.getElementById('sFeat').checked);var img=document.getElementById('sImage').files[0];if(img)fd.append('serviceImage',img);var url=id?API+'/admin/services/'+id:API+'/admin/services';fetch(url,{method:id?'PUT':'POST',headers:{'Authorization':'Bearer '+t},body:fd}).then(r=>r.json()).then(d=>{if(d.success){toast('Saved!');document.getElementById('serviceForm').classList.remove('active');loadServices()}})}
async function deleteService(id){if(!confirm('Delete?'))return;var t=await autoLogin();if(!t)return;fetch(API+'/admin/services/'+id,{method:'DELETE',headers:{'Authorization':'Bearer '+t}}).then(r=>r.json()).then(d=>{if(d.success){toast('Deleted!');loadServices()}})}
async function loadOrders(f){var t=await autoLogin();if(!t)return;var u=API+'/admin/orders?limit=100';if(f&&f!=='all')u+='&status='+f;fetch(u,{headers:{'Authorization':'Bearer '+t}}).then(r=>r.json()).then(d=>{var tb=document.getElementById('ordersTable');tb.innerHTML='';if(d.data&&d.data.length>0){d.data.forEach(o=>{tb.innerHTML+='<tr><td>#'+(o.orderNumber||o._id.slice(-6))+'</td><td>'+(o.customerDetails?o.customerDetails.name:'N/A')+'</td><td>'+(o.service?o.service.name:(o.customService||'N/A'))+'</td><td><span class="badge badge-'+(o.status==='completed'?'success':'warning')+'">'+o.status+'</span></td><td><select onchange="updateOrderStatus(\''+o._id+'\',this.value)" style="padding:3px;border-radius:4px;font-size:10px"><option '+(o.status==='pending'?'selected':'')+'>pending</option><option '+(o.status==='processing'?'selected':'')+'>processing</option><option '+(o.status==='completed'?'selected':'')+'>completed</option></select> <button class="btn btn-sm btn-danger" onclick="deleteOrder(\''+o._id+'\')">X</button></td></tr>'})}else{tb.innerHTML='<tr><td colspan="5">No orders</td></tr>'}})}
async function updateOrderStatus(id,s){var t=await autoLogin();if(!t)return;fetch(API+'/admin/orders/'+id+'/status',{method:'PUT',headers:{'Content-Type':'application/json','Authorization':'Bearer '+t},body:JSON.stringify({status:s})}).then(r=>r.json()).then(d=>{if(d.success)toast('Updated!')})}
async function deleteOrder(id){if(!confirm('Delete?'))return;var t=await autoLogin();if(!t)return;fetch(API+'/admin/orders/'+id,{method:'DELETE',headers:{'Authorization':'Bearer '+t}}).then(r=>r.json()).then(d=>{if(d.success){toast('Deleted!');loadOrders('all')}})}
async function loadUsers(){var t=await autoLogin();if(!t)return;fetch(API+'/admin/users',{headers:{'Authorization':'Bearer '+t}}).then(r=>r.json()).then(d=>{var tb=document.getElementById('usersTable');tb.innerHTML='';if(d.data&&d.data.length>0){d.data.forEach(function(u){tb.innerHTML+='<tr><td><strong>'+u.name+'</strong></td><td>'+u.email+'</td><td>'+u.mobile+'</td><td>'+(u.role!=='admin'?'<button class="btn btn-sm btn-outline" onclick="toggleUser(\''+u._id+'\','+u.isActive+')">'+(u.isActive?'Deactivate':'Activate')+'</button> <button class="btn btn-sm btn-danger" onclick="deleteUser(\''+u._id+'\')">Del</button>':'<small>Admin</small>')+'</td></tr>'})}else{tb.innerHTML='<tr><td colspan="4">No users</td></tr>'}})}
async function toggleUser(id,s){var t=await autoLogin();if(!t)return;fetch(API+'/admin/users/'+id+'/status',{method:'PUT',headers:{'Content-Type':'application/json','Authorization':'Bearer '+t},body:JSON.stringify({isActive:!s})}).then(r=>r.json()).then(d=>{if(d.success){toast('Updated!');loadUsers()}})}
async function deleteUser(id){if(!confirm('Delete?'))return;var t=await autoLogin();if(!t)return;fetch(API+'/admin/users/'+id,{method:'DELETE',headers:{'Authorization':'Bearer '+t}}).then(r=>r.json()).then(d=>{if(d.success){toast('Deleted!');loadUsers()}})}
function loadSettings(){fetch(API+'/admin/settings').then(r=>r.json()).then(d=>{if(d.success){var s=d.data;document.getElementById('setSiteName').value=s.siteName||'';document.getElementById('setOwner').value=s.ownerName||'';document.getElementById('setPhone').value=s.ownerWhatsApp||'';document.getElementById('setEmail').value=s.ownerEmail||'';document.getElementById('setAddress').value=s.address||'';document.getElementById('setHours').value=s.workingHours||'';document.getElementById('setWelcome').value=s.welcomeMessage||''}})}
async function saveSettings(){var t=await autoLogin();if(!t)return;var fd=new FormData();fd.append('siteName',document.getElementById('setSiteName').value);fd.append('ownerName',document.getElementById('setOwner').value);fd.append('ownerWhatsApp',document.getElementById('setPhone').value);fd.append('ownerEmail',document.getElementById('setEmail').value);fd.append('address',document.getElementById('setAddress').value);fd.append('workingHours',document.getElementById('setHours').value);fd.append('welcomeMessage',document.getElementById('setWelcome').value);var p=document.getElementById('setPhoto').files[0];if(p)fd.append('ownerPhoto',p);fetch(API+'/admin/settings',{method:'PUT',headers:{'Authorization':'Bearer '+t},body:fd}).then(r=>r.json()).then(d=>{if(d.success)toast('Saved!')})}

autoLogin().then(function(t){if(t){loadDashboard();console.log('✅ Admin Ready')}});
