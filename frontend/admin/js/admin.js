var API='http://localhost:5000/api';
var token=localStorage.getItem('sc_token');

// Token check and auto-login
function checkToken(){
    if(!token || token==='null' || token==='undefined'){
        location.href='login.html';
        return false;
    }
    return true;
}

function toast(m,t){
    var d=document.createElement('div');
    d.style.cssText='position:fixed;top:15px;right:15px;z-index:300;padding:10px 18px;border-radius:8px;color:#fff;font-size:12px;font-weight:600;background:'+(t==='success'?'#059669':t==='error'?'#dc2626':'#4f46e5');
    d.textContent=m;document.body.appendChild(d);
    setTimeout(function(){d.remove()},3000);
}

function logout(){localStorage.clear();location.href='login.html';}

function getHeaders(){
    return {
        'Authorization':'Bearer '+localStorage.getItem('sc_token'),
        'Content-Type':'application/json'
    };
}

function getImgUrl(p){
    if(!p)return'';
    if(p.indexOf('http')===0)return p;
    return'http://localhost:5000/uploads/'+p;
}

// ============ TAB SWITCHING ============
document.querySelectorAll('.sidebar a[data-tab]').forEach(function(a){
    a.addEventListener('click',function(){
        var t=this.getAttribute('data-tab');
        document.querySelectorAll('.sidebar a').forEach(function(x){x.classList.remove('active')});
        this.classList.add('active');
        document.querySelectorAll('.tab').forEach(function(x){x.classList.remove('active')});
        document.getElementById(t+'Tab').classList.add('active');
        if(t==='dashboard')loadDashboard();
        if(t==='services')loadServices();
        if(t==='orders')loadOrders('all');
        if(t==='users')loadUsers();
        if(t==='settings')loadSettings();
        if(window.innerWidth<=768){
            document.getElementById('sidebar').classList.remove('open');
            document.getElementById('overlay').classList.remove('show');
        }
    });
});

// Mobile menu
document.getElementById('menuToggle').addEventListener('click',function(){
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('show');
});
document.getElementById('overlay').addEventListener('click',function(){
    document.getElementById('sidebar').classList.remove('open');
    this.classList.remove('show');
});

// ============ DASHBOARD ============
function loadDashboard(){
    if(!checkToken())return;
    fetch(API+'/admin/dashboard',{headers:{'Authorization':'Bearer '+token}})
    .then(function(r){return r.json()})
    .then(function(d){
        console.log('Dashboard:',d);
        if(d.success){
            document.getElementById('totalUsers').textContent=d.data.totalUsers||0;
            document.getElementById('totalServices').textContent=d.data.totalServices||0;
            document.getElementById('totalOrders').textContent=d.data.totalOrders||0;
            document.getElementById('pendingOrders').textContent=d.data.pendingOrders||0;
            
            var rt=document.getElementById('recentOrders');
            if(d.data.recentOrders&&d.data.recentOrders.length>0){
                rt.innerHTML='';
                d.data.recentOrders.forEach(function(o){
                    var name=o.customerDetails?o.customerDetails.name:(o.user?o.user.name:'N/A');
                    var service=o.service?o.service.name:(o.customService||'N/A');
                    rt.innerHTML+='<tr><td>#'+(o.orderNumber||o._id.slice(-6))+'</td><td>'+name+'</td><td>'+service+'</td><td><span class="badge badge-'+(o.status==='completed'?'success':'warning')+'">'+o.status+'</span></td></tr>';
                });
            }else{
                rt.innerHTML='<tr><td colspan="4" style="text-align:center;padding:15px">No orders yet</td></tr>';
            }
        }
    })
    .catch(function(e){console.error('Dashboard error:',e);});
}

// ============ SERVICES ============
function loadServices(){
    fetch(API+'/services?limit=100')
    .then(function(r){return r.json()})
    .then(function(d){
        var t=document.getElementById('servicesTable');t.innerHTML='';
        if(d.data&&d.data.length>0){
            d.data.forEach(function(s){
                t.innerHTML+='<tr><td><strong>'+s.name+'</strong></td><td>'+s.category+'</td><td>₹'+s.price+'</td><td><button class="btn btn-sm btn-outline" onclick="editService(\''+s._id+'\')">Edit</button> <button class="btn btn-sm btn-danger" onclick="deleteService(\''+s._id+'\')">Del</button></td></tr>';
            });
        }else{
            t.innerHTML='<tr><td colspan="4" style="text-align:center;padding:15px">No services yet</td></tr>';
        }
    });
}

function showServiceForm(){
    document.getElementById('serviceForm').style.display='block';
    document.getElementById('formTitle').textContent='Add Service';
    document.getElementById('serviceId').value='';
    document.getElementById('sName').value='';document.getElementById('sNameBn').value='';
    document.getElementById('sPrice').value='';document.getElementById('sDesc').value='';
    document.getElementById('sTime').value='2-3 days';
    document.getElementById('sTrend').checked=false;document.getElementById('sFeat').checked=false;
}

function editService(id){
    fetch(API+'/services/'+id).then(function(r){return r.json()}).then(function(d){
        if(d.success){
            var s=d.data;
            document.getElementById('serviceForm').style.display='block';
            document.getElementById('formTitle').textContent='Edit Service';
            document.getElementById('serviceId').value=s._id;
            document.getElementById('sName').value=s.name;
            document.getElementById('sNameBn').value=s.nameBn||'';
            document.getElementById('sCat').value=s.category;
            document.getElementById('sPrice').value=s.price;
            document.getElementById('sDesc').value=s.description;
            document.getElementById('sTime').value=s.processingTime;
            document.getElementById('sTrend').checked=s.isTrending||false;
            document.getElementById('sFeat').checked=s.isFeatured||false;
        }
    });
}

function saveService(){
    if(!checkToken())return;
    var id=document.getElementById('serviceId').value;
    var fd=new FormData();
    fd.append('name',document.getElementById('sName').value);
    fd.append('nameBn',document.getElementById('sNameBn').value);
    fd.append('category',document.getElementById('sCat').value);
    fd.append('price',document.getElementById('sPrice').value);
    fd.append('description',document.getElementById('sDesc').value);
    fd.append('processingTime',document.getElementById('sTime').value);
    fd.append('isTrending',document.getElementById('sTrend').checked);
    fd.append('isFeatured',document.getElementById('sFeat').checked);
    var img=document.getElementById('sImage').files[0];
    if(img)fd.append('serviceImage',img);
    
    var url=id?API+'/admin/services/'+id:API+'/admin/services';
    fetch(url,{method:id?'PUT':'POST',headers:{'Authorization':'Bearer '+token},body:fd})
    .then(function(r){return r.json()})
    .then(function(d){
        if(d.success){toast('Saved!','success');document.getElementById('serviceForm').style.display='none';loadServices();}
        else{toast('Failed!','error');}
    })
    .catch(function(e){toast('Error!','error');console.error(e);});
}

function deleteService(id){
    if(!confirm('Delete this service?'))return;
    fetch(API+'/admin/services/'+id,{method:'DELETE',headers:{'Authorization':'Bearer '+token}})
    .then(function(r){return r.json()})
    .then(function(d){if(d.success){toast('Deleted!','success');loadServices();}});
}

// ============ ORDERS ============
function loadOrders(filter){
    if(!checkToken())return;
    var url=API+'/admin/orders?limit=100';
    if(filter&&filter!=='all')url+='&status='+filter;
    
    fetch(url,{headers:{'Authorization':'Bearer '+token}})
    .then(function(r){return r.json()})
    .then(function(d){
        console.log('Orders:',d);
        var t=document.getElementById('ordersTable');t.innerHTML='';
        if(d.data&&d.data.length>0){
            d.data.forEach(function(o){
                var name=o.customerDetails?o.customerDetails.name:'N/A';
                var service=o.service?o.service.name:(o.customService||'N/A');
                t.innerHTML+='<tr><td>#'+(o.orderNumber||o._id.slice(-6))+'</td><td>'+name+'</td><td>'+service+'</td><td><span class="badge badge-'+(o.status==='completed'?'success':'warning')+'">'+o.status+'</span></td><td><select onchange="updateOrderStatus(\''+o._id+'\',this.value)" style="padding:3px;border-radius:4px;font-size:10px"><option '+(o.status==='pending'?'selected':'')+'>pending</option><option '+(o.status==='processing'?'selected':'')+'>processing</option><option '+(o.status==='completed'?'selected':'')+'>completed</option></select> <button class="btn btn-sm btn-danger" onclick="deleteOrder(\''+o._id+'\')">X</button></td></tr>';
            });
        }else{
            t.innerHTML='<tr><td colspan="5" style="text-align:center;padding:15px">No orders yet</td></tr>';
        }
    })
    .catch(function(e){console.error('Orders error:',e);});
}

function updateOrderStatus(id,status){
    fetch(API+'/admin/orders/'+id+'/status',{method:'PUT',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({status:status})})
    .then(function(r){return r.json()})
    .then(function(d){if(d.success)toast('Updated!','success');});
}

function deleteOrder(id){
    if(!confirm('Delete this order?'))return;
    fetch(API+'/admin/orders/'+id,{method:'DELETE',headers:{'Authorization':'Bearer '+token}})
    .then(function(r){return r.json()})
    .then(function(d){if(d.success){toast('Deleted!','success');loadOrders('all');}});
}

// ============ USERS ============
function loadUsers(){
    if(!checkToken())return;
    console.log('Loading users...');
    
    fetch(API+'/admin/users',{headers:{'Authorization':'Bearer '+token}})
    .then(function(r){return r.json()})
    .then(function(d){
        console.log('Users response:',d);
        var t=document.getElementById('usersTable');
        t.innerHTML='';
        
        if(d.success&&d.data&&d.data.length>0){
            d.data.forEach(function(u){
                var actions='';
                if(u.role!=='admin'){
                    actions='<button class="btn btn-sm btn-outline" onclick="toggleUser(\''+u._id+'\','+u.isActive+')">'+(u.isActive?'Deactivate':'Activate')+'</button> <button class="btn btn-sm btn-danger" onclick="deleteUser(\''+u._id+'\')">Del</button>';
                }else{
                    actions='<small style="color:#64748b">Admin</small>';
                }
                t.innerHTML+='<tr><td><strong>'+u.name+'</strong></td><td>'+u.email+'</td><td>'+u.mobile+'</td><td>'+actions+'</td></tr>';
            });
        }else{
            t.innerHTML='<tr><td colspan="4" style="text-align:center;padding:15px">No users found</td></tr>';
        }
    })
    .catch(function(e){
        console.error('Users error:',e);
        document.getElementById('usersTable').innerHTML='<tr><td colspan="4" style="text-align:center;padding:15px;color:#ef4444">Error loading users</td></tr>';
    });
}

function toggleUser(id,s){
    fetch(API+'/admin/users/'+id+'/status',{method:'PUT',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({isActive:!s})})
    .then(function(r){return r.json()})
    .then(function(d){if(d.success){toast('User updated!','success');loadUsers();}});
}

function deleteUser(id){
    if(!confirm('Delete user and all their orders?'))return;
    fetch(API+'/admin/users/'+id,{method:'DELETE',headers:{'Authorization':'Bearer '+token}})
    .then(function(r){return r.json()})
    .then(function(d){if(d.success){toast('User deleted!','success');loadUsers();}});
}

// ============ SETTINGS ============
function loadSettings(){
    fetch(API+'/admin/settings')
    .then(function(r){return r.json()})
    .then(function(d){
        if(d.success&&d.data){
            var s=d.data;
            document.getElementById('setSiteName').value=s.siteName||'';
            document.getElementById('setOwner').value=s.ownerName||'';
            document.getElementById('setPhone').value=s.ownerWhatsApp||'';
            document.getElementById('setEmail').value=s.ownerEmail||'';
            document.getElementById('setAddress').value=s.address||'';
            document.getElementById('setHours').value=s.workingHours||'';
            document.getElementById('setWelcome').value=s.welcomeMessage||'';
        }
    });
}

function saveSettings(){
    if(!checkToken())return;
    var fd=new FormData();
    fd.append('siteName',document.getElementById('setSiteName').value);
    fd.append('ownerName',document.getElementById('setOwner').value);
    fd.append('ownerWhatsApp',document.getElementById('setPhone').value);
    fd.append('ownerEmail',document.getElementById('setEmail').value);
    fd.append('address',document.getElementById('setAddress').value);
    fd.append('workingHours',document.getElementById('setHours').value);
    fd.append('welcomeMessage',document.getElementById('setWelcome').value);
    var p=document.getElementById('setPhoto').files[0];if(p)fd.append('ownerPhoto',p);
    
    fetch(API+'/admin/settings',{method:'PUT',headers:{'Authorization':'Bearer '+token},body:fd})
    .then(function(r){return r.json()})
    .then(function(d){if(d.success)toast('Settings saved!','success');});
}

// ============ INIT ============
if(checkToken()){loadDashboard();}
