const cooks=[
{name:"Mak Cik Siti",type:"Nasi Lemak · Malay Food",rating:"4.9",reviews:"128",time:"25–35 min",distance:"1.2 km",avatar:"https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=180&q=85",foods:[
["Nasi Lemak Ayam",6.00,"https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=85"],
["Nasi Lemak Rendang",7.00,"https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=500&q=85"],
["Mee Siam",5.50,"https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=500&q=85"],
["Kuih Lapis",2.50,"https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=500&q=85"]]},
{name:"Ah Ma Kitchen",type:"Chinese · Home Cooked",rating:"4.8",reviews:"96",time:"30–40 min",distance:"1.5 km",avatar:"https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=180&q=85",foods:[["Home-style Chicken",7,"https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=500&q=85"]]},
{name:"Dapur Kak Leha",type:"Malay · Mixing Food",rating:"4.9",reviews:"74",time:"25–35 min",distance:"1.7 km",avatar:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=180&q=85",foods:[["Ayam Penyet",6.50,"https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=500&q=85"]]},
{name:"Uncle Man's Kitchen",type:"Asian Favorites",rating:"4.7",reviews:"58",time:"30–45 min",distance:"2.0 km",avatar:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=180&q=85",foods:[["Chicken Rice",6,"https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=500&q=85"]]}
];

let currentCook=cooks[0], cart=[];
const $=id=>document.getElementById(id);
const MENU_KEY="kopiBoyTodayMenu_v2";
let todayMenu=loadTodayMenu(), selectedPhotoData="";
function defaultMenu(){return {live:true,open:"09:00",close:"14:00",cookStart:"10:00",cookEnd:"16:00",description:"Freshly cooked today. Limited portions available.",dishes:cooks[0].foods.map((f,i)=>({name:f[0],price:f[1],qty:i?15:20,desc:"Freshly prepared home-style food made with care.",img:f[2],active:true}))};}
function loadTodayMenu(){try{const x=JSON.parse(localStorage.getItem(MENU_KEY));return x&&Array.isArray(x.dishes)?x:defaultMenu()}catch(e){return defaultMenu()}}
function saveTodayMenu(){localStorage.setItem(MENU_KEY,JSON.stringify(todayMenu));renderCookMenuPreview();renderManagedDishes()}
function saveMenuSettings(){todayMenu.open=$("openTime").value;todayMenu.close=$("closeTime").value;todayMenu.cookStart=$("cookStart").value;todayMenu.cookEnd=$("cookEnd").value;todayMenu.description=$("menuDescription").value;saveTodayMenu();updateMenuToggle()}
function openMenuManager(){$("openTime").value=todayMenu.open;$("closeTime").value=todayMenu.close;$("cookStart").value=todayMenu.cookStart;$("cookEnd").value=todayMenu.cookEnd;$("menuDescription").value=todayMenu.description;updateMenuToggle();renderManagedDishes();go("menuManager")}
function updateMenuToggle(){if(!$("menuToggle"))return;$("menuToggle").textContent=todayMenu.live?"ON":"OFF";$("menuToggle").className="toggle "+(todayMenu.live?"on":"off");$("menuLiveSummary").textContent=todayMenu.live?`Orders ${todayMenu.open}–${todayMenu.close} · Cooking ${todayMenu.cookStart}–${todayMenu.cookEnd}`:"Today's menu is cancelled / hidden"}
function toggleTodayMenu(){todayMenu.live=!todayMenu.live;saveTodayMenu();updateMenuToggle();toast(todayMenu.live?"Today's menu is LIVE":"Today's menu cancelled")}
function previewDishPhoto(e){const file=e.target.files?.[0];if(!file)return;const r=new FileReader();r.onload=()=>{selectedPhotoData=r.result;$("photoPreview").innerHTML=`<img src="${selectedPhotoData}">`;$("photoPreview").classList.remove("hidden")};r.readAsDataURL(file)}
function addTodaysDish(){const name=$("dishName").value.trim(),price=parseFloat($("dishPrice").value),qty=parseInt($("dishQty").value||"0",10),desc=$("dishDesc").value.trim()||"Freshly prepared today.";if(!name||!Number.isFinite(price)||qty<1){toast("Enter dish name, price and portions");return}todayMenu.dishes.push({name,price,qty,desc,img:selectedPhotoData||"https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=500&q=85",active:true});saveTodayMenu();["dishName","dishPrice","dishQty","dishDesc"].forEach(id=>$(id).value="");$("dishPhoto").value="";selectedPhotoData="";$("photoPreview").classList.add("hidden");renderManagedDishes();toast(name+" added to today's menu")}
function removeDish(i){if(!confirm("Remove this dish from today's menu?"))return;todayMenu.dishes.splice(i,1);saveTodayMenu();renderManagedDishes();toast("Dish removed")}
function pauseDish(i){todayMenu.dishes[i].active=!todayMenu.dishes[i].active;saveTodayMenu();renderManagedDishes()}
function renderManagedDishes(){if(!$("manageDishList"))return;$("dishCount").textContent=`${todayMenu.dishes.length} dishes`;$("manageDishList").innerHTML=todayMenu.dishes.map((d,i)=>`<div class="manage-dish"><img src="${d.img}"><div class="md-main"><b>${d.name} · $${d.price.toFixed(2)}</b><small>${d.qty} portions · ${d.active?"Visible":"Hidden"}</small></div><div class="md-actions"><button class="pause" onclick="pauseDish(${i})">${d.active?"Hide":"Show"}</button><button class="remove" onclick="removeDish(${i})">Remove</button></div></div>`).join("")}
function renderCookMenuPreview(){if(!$("todayMenuPreview"))return;$("todayMenuPreview").innerHTML=`<div style="font-size:9px;color:#b8aa9b;margin:4px 0 8px">${todayMenu.live?`Orders ${todayMenu.open}–${todayMenu.close}`:"Menu cancelled"} · ${todayMenu.dishes.filter(d=>d.active).length} live dishes</div><button class="mini-orange" onclick="openMenuManager()">Add / Edit Today's Menu</button>`}


function roleApp(id){
  document.querySelectorAll(".app").forEach(a=>a.classList.add("hidden"));
  $(id).classList.remove("hidden");
  document.querySelectorAll(".role-switch button").forEach((b,i)=>b.classList.toggle("active",["customerApp","cookApp","riderApp"][i]===id));
}
function setRole(id){
  roleApp(id);
  if(id==="customerApp") go("customerHome");
  if(id==="cookApp") go("cookDashboard");
  if(id==="riderApp") go("riderDashboard");
}
function go(id){
  document.querySelectorAll(".app:not(.hidden) .screen").forEach(s=>s.classList.remove("active"));
  $(id).classList.add("active");
  window.scrollTo(0,0);
}
function back(){ toast("Use the screen back button in this prototype"); }
function toast(msg){
  const t=$("toast");t.textContent=msg;t.style.display="block";
  clearTimeout(window._toast);window._toast=setTimeout(()=>t.style.display="none",1600);
}
function cookRow(c){
 return `<div class="cook-row" onclick="openCook(${cooks.indexOf(c)})">
  <img src="${c.avatar}">
  <div class="cook-info"><h3>${c.name}<span class="online">● Online</span></h3>
  <p>${c.type}</p><p><span class="rating">★ ${c.rating}</span> (${c.reviews})</p>
  <p>◷ ${c.time}<span style="float:right">⌖ ${c.distance}</span></p></div></div>`;
}
function renderHome(){
  $("popularGrid").innerHTML=cooks.slice(0,2).map((c,i)=>`<div class="popular-card" onclick="openCook(${i})">
    <img src="${c.foods[0][2]}"><div class="pcopy"><b>${c.name}</b><br>${c.foods[0][0]}<br><span class="rating">★ ${c.rating}</span> · ${c.time}</div></div>`).join("");
}
function renderCooks(list=cooks){$("cookListItems").innerHTML=list.map(cookRow).join("");}
function filterCooks(){
 const q=$("search").value.toLowerCase();
 renderCooks(cooks.filter(c=>(c.name+c.type).toLowerCase().includes(q)));
 go("cookList");
}
function openCook(i){currentCook=cooks[i];const published=todayMenu.dishes.filter(d=>d.active);$("menuContent").innerHTML=`<div class="screen-title"><button class="back-small" onclick="go('cookList')">‹</button><b>${currentCook.name}</b><span></span></div><div class="menu-top"><img src="${currentCook.avatar}"><div><h2>${currentCook.name} <span class="rating">★ ${currentCook.rating}</span></h2><p>${currentCook.type}</p><p>◷ ${currentCook.time} · $2.50 Delivery</p></div></div>${todayMenu.live?`<div class="customer-menu-notice"><b>Today's menu</b> · Orders ${todayMenu.open}–${todayMenu.close}<br>${todayMenu.description}</div>`:`<div class="customer-menu-notice"><b>Today's menu is currently unavailable.</b></div>`}<div class="menu-tabs"><button class="active">Menu</button><button>Reviews</button><button>Info</button></div>${published.map((f,idx)=>`<div class="dish"><img src="${f.img}"><div class="dish-main"><h3>${f.name} <strong>$${f.price.toFixed(2)}</strong></h3><p>${f.desc}</p><div class="availability">${f.qty} portions available</div></div><button class="plus" onclick="addTodayFood(${idx})">+</button></div>`).join("")}${cart.length?`<div class="cartbar"><span>🛒 ${cart.length} items · $${cartTotal().toFixed(2)}</span><button onclick="renderSummary()">View Cart</button></div>`:""}`;go("menuScreen")}
function addTodayFood(i){const f=todayMenu.dishes.filter(d=>d.active)[i];if(!f||!todayMenu.live||f.qty<1){toast("This dish is unavailable");return}cart.push({name:f.name,price:f.price,img:f.img});toast(f.name+" added");openCook(cooks.indexOf(currentCook))}
function addFood(idx){const f=currentCook.foods[idx];cart.push({name:f[0],price:f[1],img:f[2]});toast(f[0]+" added");openCook(cooks.indexOf(currentCook));}
function cartTotal(){return cart.reduce((a,x)=>a+x.price,0);}
function renderSummary(){
 $("summaryContent").innerHTML=`<div class="summary-card">
 ${cart.map(x=>`<div class="sum-row"><img src="${x.img}"><div><b>${x.name}</b><small style="display:block;color:#888;margin-top:3px">x1 · $${x.price.toFixed(2)}</small></div><b>$${x.price.toFixed(2)}</b></div>`).join("")}
 <div class="sum"><span>Subtotal</span><b>$${cartTotal().toFixed(2)}</b></div>
 <div class="sum"><span>Delivery Fee</span><b>$2.50</b></div>
 <div class="sum total"><span>Total</span><b>$${(cartTotal()+2.5).toFixed(2)}</b></div>
 <div class="pay-box">▣ &nbsp; PayNow / Bank Transfer <b>Change</b><br><small>You will pay directly to the cook.</small></div>
 <button class="orange full" onclick="placeOrder()">Place Order</button>
 <button class="text-orange full" onclick="go('menuScreen')">Cancel</button></div>`;
 go("orderSummary");
}
function placeOrder(){
 $("orderNumber").textContent="Order #KB"+Math.floor(10000+Math.random()*89999);
 $("confirmedSeller").innerHTML=`<img src="${currentCook.avatar}"><div><b>${currentCook.name}</b><small style="display:block;color:#888">${currentCook.time} · ${currentCook.distance}</small></div>`;
 cart=[];go("orderConfirmed");toast("Order placed — pay the cook directly");
}
function setupCook(){
 $("newOrderCard").innerHTML=`<div class="job-top"><b>Order #KB12345</b><span>10:05 AM</span></div>
 <p style="font-size:9px"><b>Mak Cik Siti</b> · 1.2 km</p>
 <div class="order-items">Nasi Lemak Ayam <b style="float:right">x1&nbsp; $6.00</b><br>Mee Siam <b style="float:right">x1&nbsp; $5.50</b><br><b>Total</b><b style="float:right">$14.00</b></div>
 <div class="accept-row"><button class="green" onclick="go('findRider')">Accept Order</button><button class="decline" onclick="toast('Order declined')">Decline</button></div>`;
}
function findRider(){toast("Searching riders within 3 km…");setTimeout(()=>go("riderFound"),650);}
renderHome();renderCooks();setupCook();renderCookMenuPreview();renderManagedDishes();updateMenuToggle();