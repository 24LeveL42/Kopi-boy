let cooks=[], currentCook=null, cart=[], currentMenu=[], customerOrderChannel=null, locationFilter={area:'',postal:''}, deliveryAddress=null;

const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
function go(id){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));if($(id))$(id).classList.add("active");window.scrollTo(0,0);}
function toast(msg){const t=$("toast");t.textContent=msg;t.style.display="block";clearTimeout(window._toast);window._toast=setTimeout(()=>t.style.display="none",1800);}
function statusLabel(s){return({placed:"Order Placed",accepted:"Cook Accepted",declined:"Declined",looking_for_rider:"Looking for Rider",rider_accepted:"Rider Accepted",cooking:"Cooking",ready:"Ready for Pickup",out_for_delivery:"Out for Delivery",delivered:"Delivered",cancelled:"Cancelled"})[s]||s;}
async function ensureSession(){
  if(!window.KOPI_SUPABASE_READY){toast("Kopi Boy is not connected");return null;}
  const {data:{session}}=await supabase.auth.getSession();
  if(session)return session;
  const {data,error}=await supabase.auth.signInAnonymously();
  if(error){console.error(error);toast("Could not connect to Kopi Boy");return null;}
  return data.session;
}
function cartTotal(){return cart.reduce((a,x)=>a+x.price,0);}
function normalizePostal(v){return String(v||'').replace(/\D/g,'').slice(0,6);}
function loadCustomerLocation(){try{deliveryAddress=JSON.parse(localStorage.getItem('kopiboy_delivery_address')||'null')}catch(e){deliveryAddress=null}try{locationFilter=JSON.parse(localStorage.getItem('kopiboy_location_filter')||'{"area":"","postal":""}')||{area:'',postal:''}}catch(e){locationFilter={area:'',postal:''}}; if($("areaFilter"))$("areaFilter").value=locationFilter.area||'';if($("postalFilter"))$("postalFilter").value=locationFilter.postal||'';updateLocationUI();}
function updateLocationUI(){const a=locationFilter.area||'';const p=locationFilter.postal||'';const label=p||(a||'Singapore');if($("activeAreaFilter"))$("activeAreaFilter").textContent=label;if($("customerLocationLabel"))$("customerLocationLabel").textContent=deliveryAddress?.postal_code||label;if($("savedAddressSummary"))$("savedAddressSummary").textContent=deliveryAddress?`Saved: ${deliveryAddress.label||'Address'} · ${deliveryAddress.block||''} ${deliveryAddress.street||''} · ${deliveryAddress.postal_code||''}`:'No delivery address saved yet.';}
function cookMatchesLocation(c){if(!locationFilter.area&&!locationFilter.postal)return true;const area=(c.service_area||c.operating_area||'').toLowerCase();const postals=String(c.service_postal_codes||c.postal_code||'').toLowerCase();if(locationFilter.area && area.includes(locationFilter.area.toLowerCase()))return true;if(locationFilter.postal && postals.split(/[,\s;]+/).some(x=>x===locationFilter.postal || x.startsWith(locationFilter.postal) || locationFilter.postal.startsWith(x)))return true;return false;}
function applyLocationFilter(){const area=$("areaFilter").value.trim(),postal=normalizePostal($("postalFilter").value);if(!area&&!postal)return toast('Enter an area or postal code');if(postal&&postal.length!==6)return toast('Enter a 6-digit Singapore postal code');locationFilter={area,postal};localStorage.setItem('kopiboy_location_filter',JSON.stringify(locationFilter));updateLocationUI();renderCooks(cooks.filter(c=>cookMatchesLocation(c)));go('cookList');}
function clearLocationFilter(){locationFilter={area:'',postal:''};localStorage.setItem('kopiboy_location_filter',JSON.stringify(locationFilter));if($("areaFilter"))$("areaFilter").value='';if($("postalFilter"))$("postalFilter").value='';updateLocationUI();renderCooks(cooks);go('cookList');}
function useSavedAddressForFilter(){if(!deliveryAddress)return toast('Save your delivery address first');locationFilter={area:'',postal:deliveryAddress.postal_code||''};if($("postalFilter"))$("postalFilter").value=locationFilter.postal;if($("areaFilter"))$("areaFilter").value='';applyLocationFilter();}
function saveDeliveryAddress(){const a={label:$("addressLabel").value.trim()||'Home',block:$("addressBlock").value.trim(),street:$("addressStreet").value.trim(),unit:$("addressUnit").value.trim(),postal_code:normalizePostal($("addressPostal").value),building:$("addressBuilding").value.trim(),notes:$("addressNotes").value.trim()};if(!a.block||!a.street||a.postal_code.length!==6)return toast('Block, street and valid 6-digit postal code required');if(!$("addressConfirm").checked)return toast('Please confirm your delivery address');deliveryAddress=a;localStorage.setItem('kopiboy_delivery_address',JSON.stringify(a));locationFilter={area:'',postal:a.postal_code};localStorage.setItem('kopiboy_location_filter',JSON.stringify(locationFilter));updateLocationUI();toast('Delivery address saved ✓');go('customerHome');}
function deliveryAddressText(){if(!deliveryAddress)return '';return [deliveryAddress.block,deliveryAddress.street,deliveryAddress.unit,deliveryAddress.building,deliveryAddress.postal_code].filter(Boolean).join(', ');}

async function loadCooks(){
  if(!window.KOPI_SUPABASE_READY){$("cookListItems").innerHTML="<div class='empty-state'>Kopi Boy is not connected to its live service.</div>";return;}
  await ensureSession();
  const {data,error}=await supabase.from("merchants").select("*").eq("active",true).eq("status","approved").order("name");
  if(error){console.error(error);$("cookListItems").innerHTML="<div class='empty-state'>Unable to load today's cooks.</div>";return;}
  cooks=data||[]; renderCooks(); renderPopular(); updateLocationUI();
}
function cookCard(c){
  return `<div class="cook-row" onclick="openCook('${c.id}')">
    <div class="cook-avatar">${c.avatar?`<img src="${esc(c.avatar)}">`:"👨‍🍳"}</div>
    <div class="cook-info"><h3>${esc(c.name)} <span class="online">● Available</span></h3>
    <p>${esc(c.type||"Local food")}</p>
    <p>${c.rating?`<span class="rating">★ ${c.rating}</span> (${c.reviews||0})`:"New cook"}</p>
    <p>◷ ${esc(c.operating_start||"--")}–${esc(c.operating_end||"--")} · ${c.daily_capacity||"--"} pax/day</p></div>
  </div>`;
}
function renderCooks(list=cooks){const filtered=list.filter(cookMatchesLocation);$("cookListItems").innerHTML=filtered.length?filtered.map(cookCard).join(""):locationFilter.area||locationFilter.postal?"<div class='empty-state'>No approved cooks currently serve this area or postal code.</div>":"<div class='empty-state'>No approved cooks are available yet.</div>";}
function renderPopular(){
  $("popularGrid").innerHTML=cooks.length?cooks.slice(0,2).map(c=>`<div class="popular-card" onclick="openCook('${c.id}')"><div class="popular-placeholder">${c.avatar?`<img src="${esc(c.avatar)}">`:"👨‍🍳"}</div><div class="pcopy"><b>${esc(c.name)}</b><br>${esc(c.type||"Local Food")}<br>${c.rating?`<span class="rating">★ ${c.rating}</span>`:"New"} · ◷ ${esc(c.operating_start||"--")}–${esc(c.operating_end||"--")}</div></div>`).join(""):"<div class='empty-state wide-empty'><b>No cooks available yet.</b><small>Approved Kopi Boy cooks will appear here.</small></div>";
}
function filterCooks(){const q=$("search").value.toLowerCase();renderCooks(cooks.filter(c=>(c.name+" "+(c.type||"")+" "+(c.service_area||"")+" "+(c.service_postal_codes||"")).toLowerCase().includes(q)));go("cookList");}

async function openCook(id){
  currentCook=cooks.find(c=>c.id===id);
  if(!currentCook)return;
  const {data,error}=await supabase.from("menu_items").select("*").eq("merchant_id",id).eq("active",true).order("created_at",{ascending:true});
  if(error){toast("Could not load this menu");return;}
  currentMenu=data||[];
  const live=currentCook.menu_live!==false;
  $("menuContent").innerHTML=`
    <div class="screen-title"><button class="back-small" onclick="go('cookList')">‹</button><b>${esc(currentCook.name)}</b><button>⋯</button></div>
    <div class="menu-top"><div class="cook-avatar large">${currentCook.avatar?`<img src="${esc(currentCook.avatar)}">`:"👨‍🍳"}</div>
    <div><h2>${esc(currentCook.name)}</h2><p>${esc(currentCook.type||"Local food")}</p><p>◷ ${esc(currentCook.operating_start||"--")}–${esc(currentCook.operating_end||"--")} · ${currentCook.daily_capacity||"--"} pax/day</p></div></div>
    ${live?`<div class="customer-menu-notice"><b>Today's menu</b>${currentCook.menu_note?` · ${esc(currentCook.menu_note)}`:""}<br>Orders ${esc(currentCook.order_open||"--")}–${esc(currentCook.order_close||"--")}</div>`:`<div class="customer-menu-notice"><b>This cook's menu is currently unavailable.</b></div>`}
    <div class="menu-tabs"><button class="active">Menu</button><button onclick="toast('Reviews coming soon')">Reviews</button><button onclick="toast('Kitchen info')">Info</button></div>
    ${currentMenu.length?currentMenu.map((f,i)=>`<div class="dish"><img src="${esc(f.image_url||"kopi-boy-logo.jpg")}"><div class="dish-main"><h3>${esc(f.name)} <strong>$${Number(f.price).toFixed(2)}</strong></h3><p>${esc(f.description||"Freshly prepared today.")}</p><div class="availability">${f.pax_available>0?`${f.pax_available} portions available`:"Sold out"}</div></div><button class="plus" ${(!live||f.pax_available<=0)?"disabled":""} onclick="addFood(${i})">+</button></div>`).join(""):"<div class='empty-state'>This cook has not published today's menu.</div>"}
    ${cart.length?`<div class="cartbar"><span>🛒 ${cart.length} items · $${cartTotal().toFixed(2)}</span><button onclick="renderSummary()">View Cart</button></div>`:""}`;
  go("menuScreen");
}
function addFood(i){const f=currentMenu[i];if(!f)return;cart.push({name:f.name,price:Number(f.price),img:f.image_url||"kopi-boy-logo.jpg"});toast(f.name+" added");openCook(currentCook.id);}
function renderSummary(){
  $("summaryContent").innerHTML=`<div class="summary-card">${cart.map(x=>`<div class="sum-row"><img src="${esc(x.img)}"><div><b>${esc(x.name)}</b><small style="display:block;color:#888">x1 · $${x.price.toFixed(2)}</small></div><b>$${x.price.toFixed(2)}</b></div>`).join("")}
  <div class="sum"><span>Subtotal</span><b>$${cartTotal().toFixed(2)}</b></div><div class="sum"><span>Delivery Fee</span><b>$2.50</b></div><div class="sum total"><span>Total</span><b>$${(cartTotal()+2.5).toFixed(2)}</b></div>
  <div class="pay-box">▣ &nbsp; PayNow / Bank Transfer <b>Direct to cook</b><br><small>Food payment goes directly to the cook.</small></div>
  <button class="orange full" onclick="placeOrder()">Place Order</button><button class="text-orange full" onclick="go('menuScreen')">Cancel</button></div>`;
  go("orderSummary");
}
async function placeOrder(){
  if(!currentCook||!cart.length){toast("Please choose food first");return;}
  if(!deliveryAddress){go('deliveryAddress');toast('Please add your delivery address before ordering');return;}
  await ensureSession();
  const orderId="KB"+Math.floor(100000+Math.random()*900000),subtotal=cartTotal(),deliveryFee=2.50;
  const payload={order_number:orderId,merchant_id:currentCook.id,customer_name:"Customer",status:"placed",subtotal,delivery_fee:deliveryFee,total:subtotal+deliveryFee,items:cart.map(x=>({name:x.name,price:x.price,qty:1})),delivery_address:deliveryAddressText(),delivery_postal_code:deliveryAddress.postal_code,delivery_notes:deliveryAddress.notes||null,placed_at:new Date().toISOString()};
  const {data,error}=await supabase.from("orders").insert(payload).select().single();
  if(error){console.error(error);toast("Order failed: "+error.message);return;}
  localStorage.setItem("kopiboy_last_order",JSON.stringify(data));cart=[];
  $("orderNumber").textContent="Order #"+data.order_number;
  $("confirmedSeller").innerHTML=`<div class="cook-avatar small">👨‍🍳</div><div><b>${esc(currentCook.name)}</b><small style="display:block;color:#888">Pay directly to cook</small></div>`;
  $("confirmTimeline").innerHTML=timelineHTML(data);
  await subscribeCustomerOrder(data.id);go("orderConfirmed");toast("Order placed ✓");
}
function timelineHTML(o){
  const rows=[["placed_at","Order placed"],["accepted_at","Cook accepted"],["rider_requested_at","Looking for rider"],["rider_accepted_at","Rider accepted"],["cooking_at","Cooking started"],["ready_at","Food ready"],["picked_up_at","Food collected"],["delivered_at","Delivered"]];
  return `<div class="timeline">${rows.map(([f,l])=>`<div class="timeline-row ${o[f]?"done":""}"><b>${l}</b><span>${o[f]?new Date(o[f]).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}):"Waiting"}</span></div>`).join("")}</div>`;
}
function renderLive(o){$("customerLiveOrderContent").innerHTML=`<div class="live-order-card"><span class="status-pill ${o.status}">${statusLabel(o.status).toUpperCase()}</span><h2>${statusLabel(o.status)}</h2><p>${esc(o.order_number)}</p>${timelineHTML(o)}</div>`;}
async function subscribeCustomerOrder(id){
  if(!window.KOPI_SUPABASE_READY)return;
  if(customerOrderChannel)supabase.removeChannel(customerOrderChannel);
  customerOrderChannel=supabase.channel("kopi-boy-customer-"+id).on("postgres_changes",{event:"UPDATE",schema:"public",table:"orders",filter:`id=eq.${id}`},payload=>{localStorage.setItem("kopiboy_last_order",JSON.stringify(payload.new));renderLive(payload.new);toast("Order updated: "+statusLabel(payload.new.status));}).subscribe();
}
async function showLastOrder(){
  const raw=localStorage.getItem("kopiboy_last_order");if(!raw){toast("No active order");return;}
  const o=JSON.parse(raw);renderLive(o);go("customerLiveOrder");await subscribeCustomerOrder(o.id);
}
document.addEventListener("DOMContentLoaded",()=>{loadCustomerLocation();loadCooks();});


/* Kopi Boy authentication foundation */
window.KB_AUTH_CONFIG={appRole:document.body?.dataset?.app||"unknown",socialProviders:["google","facebook"],phoneOtpReady:false};
function kbAuthReady(){return window.KOPI_SUPABASE_READY&&typeof supabase!=="undefined";}
function kbOpenAuth(title){const o=document.getElementById("kbAuthOverlay");if(!o)return;document.getElementById("kbAuthTitle").textContent=title||"Sign in to Kopi Boy";o.classList.remove("hidden");}
function kbCloseAuth(){document.getElementById("kbAuthOverlay")?.classList.add("hidden");}
async function kbSignIn(provider){if(!kbAuthReady())return toast?.("Kopi Boy database is not connected");const redirectTo=window.location.origin+window.location.pathname;const {error}=await supabase.auth.signInWithOAuth({provider,options:{redirectTo}});if(error)toast?.(error.message);}
function kbPhoneStart(){document.getElementById("kbPhoneArea")?.classList.remove("hidden");}
async function kbSendOtp(){if(!KB_AUTH_CONFIG.phoneOtpReady)return toast?.("Phone OTP will be enabled before public launch.");const phone=document.getElementById("kbPhone")?.value?.trim();if(!phone)return toast?.("Enter your phone number");const {error}=await supabase.auth.signInWithOtp({phone});if(error)return toast?.(error.message);document.getElementById("kbOtp")?.classList.remove("hidden");document.getElementById("kbVerifyBtn")?.classList.remove("hidden");toast?.("OTP sent");}
async function kbVerifyOtp(){const phone=document.getElementById("kbPhone")?.value?.trim(),token=document.getElementById("kbOtp")?.value?.trim();if(!phone||!token)return toast?.("Enter the phone number and OTP");const {error}=await supabase.auth.verifyOtp({phone,token,type:"sms"});if(error)return toast?.(error.message);kbCloseAuth();toast?.("Verified ✓");}
async function kbGetUser(){if(!kbAuthReady())return null;const {data:{user}}=await supabase.auth.getUser();return user||null;}
