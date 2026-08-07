var API='https://devprasad-api.onrender.com/api';
var token=localStorage.getItem('sc_token');
var authMode='login';

function getImgUrl(p){if(!p)return'';if(p.indexOf('http')===0)return p;return'https://devprasad-api.onrender.com/uploads/'+p}
if(token){document.getElementById('loginBtn').style.display='none';document.getElementById('dashBtn').style.display='inline-block'}

// Load settings
fetch(API+'/admin/settings').then(function(r){return r.json()}).then(function(d){
    if(d.success&&d.data){var s=d.data;
        var site=s.siteName||'Service Center';document.getElementById('siteTitle').textContent=site;document.getElementById('welcomeMsg').textContent='Welcome to '+site;document.getElementById('welcomeSub').textContent=s.welcomeMessageBn||'';document.getElementById('footerName').textContent=site;document.title=site;
        document.getElementById('cPhone').textContent=s.ownerWhatsApp||'-';document.getElementById('cEmail').textContent=s.ownerEmail||'-';document.getElementById('cAddress').textContent=s.address||'-';document.getElementById('cHours').textContent=s.workingHours||'-';
        if(s.ownerPhoto){document.getElementById('profilePic').src=getImgUrl(s.ownerPhoto);document.getElementById('heroBg').src=getImgUrl(s.ownerPhoto);document.getElementById('heroBg').style.display='block'}
        if(s.ownerWhatsApp){var n=s.ownerWhatsApp.replace(/[^0-9]/g,'');document.getElementById('waLink').href='https://wa.me/'+n;document.getElementById('waContact').href='https://wa.me/'+n;document.getElementById('menuWa').href='https://wa.me/'+n}
        if(s.ownerEmail){document.getElementById('emContact').href='mailto:'+s.ownerEmail;document.getElementById('menuEm').href='mailto:'+s.ownerEmail}
    }
});

var allServices=[];
fetch(API+'/services?limit=100').then(function(r){return r.json()}).then(function(d){if(d.data)allServices=d.data;renderServices(allServices)});
function renderServices(sv){var g=document.getElementById('servicesGrid');if(!sv||sv.length===0){g.innerHTML='<div style="text-align:center;padding:40px">📋 No services yet</div>';return}g.innerHTML='';sv.forEach(function(s){var d=document.createElement('div');d.className='service-card';d.onclick=function(){bookService(s._id)};d.innerHTML=(s.image?'<img src="'+getImgUrl(s.image)+'" alt="'+s.name+'">':'<div class="no-img">📋</div>')+'<div class="card-body">'+(s.isTrending?'<span class="badge-hot">🔥 Trending</span> ':'')+'<h3>'+s.name+'</h3>'+(s.nameBn?'<div style="font-family:\'Hind Siliguri\',sans-serif;color:#64748b;font-size:13px">'+s.nameBn+'</div>':'')+'<p style="color:#64748b;font-size:12px;margin-top:4px">'+s.description+'</p><div class="price">₹'+s.price+'</div></div>';g.appendChild(d)})}
function bookService(id){if(!token){openAuth();return}location.href='booking.html?service='+id}
function toggleAuth(){authMode=authMode==='login'?'register':'login';document.getElementById('authTitle').textContent=authMode==='login'?'🔐 Login':'📝 Register';document.getElementById('authName').style.display=authMode==='register'?'block':'none';document.getElementById('authMobile').style.display=authMode==='register'?'block':'none';document.getElementById('authBtn').textContent=authMode==='login'?'Login':'Register';document.getElementById('authToggle').innerHTML=authMode==='login'?"New user? <a href='#' onclick='toggleAuth()' style='color:#2563eb;font-weight:600'>Register</a>":"Have account? <a href='#' onclick='toggleAuth()' style='color:#2563eb;font-weight:600'>Login</a>"}
function handleAuth(){var e=document.getElementById('authEmail').value,p=document.getElementById('authPassword').value;if(authMode==='login'){fetch(API+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:e,password:p})}).then(function(r){return r.json()}).then(function(d){if(d.success){localStorage.setItem('sc_token',d.token);location.reload()}else alert('Login failed!')})}else{var n=document.getElementById('authName').value,m=document.getElementById('authMobile').value;fetch(API+'/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:n,email:e,mobile:m,password:p})}).then(function(r){return r.json()}).then(function(d){if(d.success){localStorage.setItem('sc_token',d.token);location.reload()}else alert('Registration failed!')})}}
