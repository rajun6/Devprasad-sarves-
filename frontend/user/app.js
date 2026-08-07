var API='https://devprasad-api.onrender.com/api';
var token=localStorage.getItem('sc_token');
var authMode='login';

function getImgUrl(p){
    if(!p)return'';
    if(p.indexOf('http')===0)return p;
    return'https://devprasad-api.onrender.com/uploads/'+p;
}

if(token){
    document.getElementById('loginBtn').style.display='none';
    document.getElementById('dashBtn').style.display='inline-flex';
}

fetch(API+'/admin/settings')
.then(function(r){return r.json()})
.then(function(d){
    if(d.success&&d.data){
        var s=d.data;
        document.getElementById('navSiteName').textContent=s.siteName||'Service Center';
        document.getElementById('welcomeMsg').innerHTML='Welcome to <span>'+(s.siteName||'Service Center')+'</span>';
        document.getElementById('welcomeSub').textContent=s.welcomeMessageBn||'Your trusted partner';
        if(s.ownerPhoto)document.getElementById('ownerImg').src=getImgUrl(s.ownerPhoto);
        document.getElementById('cPhone').textContent=s.ownerWhatsApp||'-';
        document.getElementById('cEmail').textContent=s.ownerEmail||'-';
        document.getElementById('cAddress').textContent=s.address||'-';
        document.getElementById('cHours').textContent=s.workingHours||'-';
        document.getElementById('footerName').textContent=s.siteName||'Service Center';
        document.title=s.siteName||'Service Center';
        if(s.ownerWhatsApp){
            var num=s.ownerWhatsApp.replace(/[^0-9]/g,'');
            document.getElementById('waLink').href='https://wa.me/'+num;
        }
    }
});

function loadServices(search){
    var g=document.getElementById('servicesGrid');
    g.innerHTML='<div class="loading">Loading...</div>';
    var u=API+'/services?limit=50';
    if(search)u+='&search='+encodeURIComponent(search);
    
    fetch(u).then(function(r){return r.json()}).then(function(d){
        if(d.data&&d.data.length>0){
            g.innerHTML='';
            for(var i=0;i<d.data.length;i++){
                var s=d.data[i];
                var card=document.createElement('div');
                card.className='service-card';
                card.onclick=function(){bookService(s._id)};
                
                var html='';
                
                // IMAGE - Always show
                if(s.image){
                    html+='<img src="'+getImgUrl(s.image)+'" alt="'+s.name+'" style="width:100%;height:180px;object-fit:cover;border-radius:12px;margin-bottom:15px" onerror="this.remove()">';
                }
                
                if(s.isTrending)html+='<span class="badge badge-hot">🔥 Trending</span> ';
                html+='<h3>'+s.name+'</h3>';
                if(s.nameBn)html+='<div class="bn">'+s.nameBn+'</div>';
                html+='<p class="desc">'+s.description+'</p>';
                html+='<div class="price">₹'+s.price+'</div>';
                html+='<div style="font-size:11px;color:#94a3b8;margin-top:2px">⏱ '+(s.processingTime||'2-3 days')+'</div>';
                
                card.innerHTML=html;
                g.appendChild(card);
            }
        }else{
            g.innerHTML='<div class="empty-state">📋 No services available yet</div>';
        }
    }).catch(function(){g.innerHTML='<div class="empty-state">Failed to load</div>'});
}

loadServices();
function searchServices(){loadServices(document.getElementById('searchInput').value.trim());}
function bookService(id){if(!token){openAuth();return;}location.href='booking.html?service='+id;}
function openAuth(){document.getElementById('authModal').classList.add('active');}
function closeAuth(){document.getElementById('authModal').classList.remove('active');}
function toggleAuth(){
    authMode=authMode==='login'?'register':'login';
    document.getElementById('authTitle').textContent=authMode==='login'?'🔐 Login':'📝 Register';
    document.getElementById('authName').style.display=authMode==='register'?'block':'none';
    document.getElementById('authMobile').style.display=authMode==='register'?'block':'none';
    document.getElementById('authBtn').textContent=authMode==='login'?'Login':'Register';
    document.getElementById('authToggle').innerHTML=authMode==='login'?"Don't have account? <a href='#' onclick='toggleAuth()' style='color:#2563eb;font-weight:600'>Register</a>":"Have account? <a href='#' onclick='toggleAuth()' style='color:#2563eb;font-weight:600'>Login</a>";
}
function handleAuth(){
    var e=document.getElementById('authEmail').value,p=document.getElementById('authPassword').value;
    if(authMode==='login'){
        fetch(API+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:e,password:p})}).then(function(r){return r.json()}).then(function(d){if(d.success){localStorage.setItem('sc_token',d.token);localStorage.setItem('sc_user',JSON.stringify(d.user));location.reload()}else alert('Login failed!')});
    }else{
        var n=document.getElementById('authName').value,m=document.getElementById('authMobile').value;
        fetch(API+'/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:n,email:e,mobile:m,password:p})}).then(function(r){return r.json()}).then(function(d){if(d.success){localStorage.setItem('sc_token',d.token);location.reload()}else alert('Registration failed!')});
    }
}
document.getElementById('authModal').addEventListener('click',function(ev){if(ev.target===this)closeAuth();});
