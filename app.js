const cooks=[
{id:"mak-cik-siti",name:"Mak Cik Siti",type:"Nasi Lemak · Malay Food",rating:"4.9",reviews:"128",time:"25–35 min",distance:"1.2 km",avatar:"https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=180&q=85",foods:[
["Nasi Lemak Ayam",6.00,"https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=85"],
["Nasi Lemak Rendang",7.00,"https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=500&q=85"],
["Mee Siam",5.50,"https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=500&q=85"],
["Kuih Lapis",2.50,"https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=500&q=85"]]},
{id:"ah-ma-kitchen",name:"Ah Ma Kitchen",type:"Chinese · Home Cooked",rating:"4.8",reviews:"96",time:"30–40 min",distance:"1.5 km",avatar:"https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=180&q=85",foods:[["Home-style Chicken",7,"https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=500&q=85"]]},
{id:"dapur-kak-leha",name:"Dapur Kak Leha",type:"Malay · Mixing Food",rating:"4.9",reviews:"74",time:"25–35 min",distance:"1.7 km",avatar:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=180&q=85",foods:[["Ayam Penyet",6.50,"https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=500&q=85"]]},
{id:"uncle-mans-kitchen",name:"Uncle Man's Kitchen",type:"Asian Favorites",rating:"4.7",reviews:"58",time:"30–45 min",distance:"2.0 km",avatar:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=180&q=85",foods:[["Chicken Rice",6,"https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=500&q=85"]]}
];


let currentCook=cooks[0], cart=[];
let currentRider={id:"rider-brother",name:"Brother Rider"};
let currentLiveOrder=null;
let riderOrderChannel=null;

const $=id=>document.getElementById(id);

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

function renderIncomingOrder(){
 if(!$("incomingOrderArea")||!testOrder)return;
 $("incomingOrderArea").innerHTML=`<div class="incoming-order"><h3>🔔 New Order</h3><div class="incoming-meta">${testOrder.id}</div><div class="incoming-items">${testOrder.items.map(x=>`${x.name} <b style="float:right">$${x.price.toFixed(2)}</b>`).join("<br>")}<br><b>Total</b><b style="float:right">$${testOrder.total.toFixed(2)}</b></div><div class="incoming-actions"><button class="green" onclick="acceptTestOrder()">ACCEPT ORDER</button><button class="decline" onclick="declineTestOrder()">DECLINE</button></div></div>`;
}
function acceptTestOrder(){if(!testOrder||!customerConn?.open)return;testOrder.status="accepted";customerConn.send({type:"order_status",id:testOrder.id,status:"accepted"});renderIncomingOrder();toast("Order accepted ✓");}
function declineTestOrder(){if(!testOrder||!customerConn?.open)return;testOrder.status="declined";customerConn.send({type:"order_status",id:testOrder.id,status:"declined"});renderIncomingOrder();toast("Order declined");}
function renderCustomerOrderBanner(){const b=$("customerOrderBanner");if(!b||!testOrder)return;b.innerHTML=`<b>${testOrder.status==="accepted"?"✓ Order Accepted":testOrder.status==="declined"?"Order Declined":"Order Placed"}</b><small>${testOrder.id} · ${testOrder.status==="accepted"?"Cook has accepted your order.":"Waiting for cook confirmation."}</small><button onclick="showCustomerLiveOrder()">VIEW ORDER</button>`;b.classList.remove("hidden");}
function showCustomerLiveOrder(){const s=testOrder?.status||"placed";$("customerLiveOrderContent").innerHTML=`<div class="live-order-card"><span class="status-pill ${s}">${s.toUpperCase()}</span><h2>${s==="accepted"?"Order accepted!":s==="declined"?"Order declined":"Order placed"}</h2><p>${testOrder?.id||""}</p><div class="status-steps"><div class="status-step on"><i>✓</i>Order Placed</div><div class="status-step ${s==="accepted"?"on":""}"><i>${s==="accepted"?"✓":"•"}</i>Cook Accepted</div><div class="status-step"><i>•</i>Cooking</div><div class="status-step"><i>•</i>Ready for Rider</div></div></div>`;go("customerLiveOrder");}


let cookOrderChannel=null, customerOrderChannel=null;

async function ensureLiveSession(){
  if(!window.KOPI_SUPABASE_READY) return null;
  const {data:{session}}=await supabase.auth.getSession();
  if(session) return session;
  const {data,error}=await supabase.auth.signInAnonymously();
  if(error){console.error(error);return null;}
  return data.session;
}

function merchantIdForCook(){
  // Each cook in the UI maps directly to the merchants.id in Supabase.
  if(currentCook?.id) return currentCook.id;
  const map = {
    "Mak Cik Siti":"mak-cik-siti",
    "Ah Ma Kitchen":"ah-ma-kitchen",
    "Dapur Kak Leha":"dapur-kak-leha",
    "Uncle Man's Kitchen":"uncle-mans-kitchen"
  };
  return map[currentCook?.name] || null;
}

function statusLabel(s){
  return ({placed:"Order Placed",accepted:"Cook Accepted",declined:"Declined",looking_for_rider:"Looking for Rider",rider_accepted:"Rider Accepted",cooking:"Cooking",ready:"Ready for Pickup",out_for_delivery:"Out for Delivery",delivered:"Delivered",cancelled:"Cancelled"})[s]||s;
}
function timelineHTML(order){
  const rows=[
    ["placed_at","Order placed"],
    ["accepted_at","Cook accepted"],
    ["rider_requested_at","Looking for rider"],
    ["rider_accepted_at","Rider accepted"],
    ["cooking_at","Cooking started"],
    ["ready_at","Food ready"],
    ["picked_up_at","Food collected"],
    ["delivered_at","Delivered"]
  ];
  return `<div class="timeline">${rows.map(([field,label])=>`<div class="timeline-row ${order[field]?"done":""}"><b>${label}</b><span>${order[field]?new Date(order[field]).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}):"Waiting"}</span></div>`).join("")}</div>`;
}
function cookNextAction(order){
  if(order.status==="placed") return `<button class="green full" onclick="updateLiveOrderStatus('${order.id}','accepted')">ACCEPT ORDER</button><button class="decline full" onclick="updateLiveOrderStatus('${order.id}','declined')">DECLINE</button>`;
  if(order.status==="accepted") return `<button class="orange full" onclick="updateLiveOrderStatus('${order.id}','looking_for_rider')">FIND RIDER</button>`;
  if(order.status==="rider_accepted") return `<button class="green full" onclick="updateLiveOrderStatus('${order.id}','cooking')">START COOKING</button>`;
  if(order.status==="cooking") return `<button class="green full" onclick="updateLiveOrderStatus('${order.id}','ready')">FOOD READY</button>`;
  return "";
}
function renderLiveOrder(order){
  const area=$("incomingOrderArea"); if(!area)return;
  currentLiveOrder=order;
  const items=Array.isArray(order.items)?order.items:[];
  area.innerHTML=`<div class="incoming-order live-received">
    <div style="display:flex;justify-content:space-between;align-items:center"><h3>🔔 ${statusLabel(order.status)}</h3><span class="status-pill ${order.status}">${String(order.status).toUpperCase()}</span></div>
    <div class="incoming-meta">${order.order_number} · ${new Date(order.created_at||Date.now()).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</div>
    <div class="incoming-items">${items.map(x=>`${x.name} <b style="float:right">x${x.qty||1} · $${Number(x.price).toFixed(2)}</b>`).join("<br>")}<br><b>Total</b><b style="float:right">$${Number(order.total).toFixed(2)}</b></div>
    ${order.rider_name?`<div class="job-line"><span>Rider</span><b>🛵 ${order.rider_name}</b></div>`:""}
    ${timelineHTML(order)}
    <div class="incoming-actions">${cookNextAction(order)}</div>
  </div>`;
}
async function initLiveCookOrders(){
  if(!window.KOPI_SUPABASE_READY){
    if($("liveOrderStatus")) $("liveOrderStatus").textContent="Database setup required";
    return;
  }
  await ensureLiveSession();
  const merchantId=merchantIdForCook();
  if($("liveOrderStatus")) $("liveOrderStatus").textContent="LIVE · receiving orders";
  if($("cookWorkflowStatus")) $("cookWorkflowStatus").className="connection-dot online";
  if(cookOrderChannel) supabase.removeChannel(cookOrderChannel);
  cookOrderChannel=supabase.channel("kopi-boy-orders-"+merchantId)
    .on("postgres_changes",{event:"INSERT",schema:"public",table:"orders",filter:`merchant_id=eq.${merchantId}`},payload=>{renderLiveOrder(payload.new);toast("🔔 New Kopi Boy order received");})
    .on("postgres_changes",{event:"UPDATE",schema:"public",table:"orders",filter:`merchant_id=eq.${merchantId}`},payload=>{renderLiveOrder(payload.new);if(payload.new.status==="rider_accepted")toast("🛵 Rider accepted the order");})
    .subscribe();
}
async function updateLiveOrderStatus(orderId,status){
  if(!window.KOPI_SUPABASE_READY){toast("Live database is not connected");return;}
  const patch={status};
  const now=new Date().toISOString();
  if(status==="accepted")patch.accepted_at=now;
  if(status==="declined")patch.declined_at=now;
  if(status==="looking_for_rider")patch.rider_requested_at=now;
  if(status==="cooking")patch.cooking_at=now;
  if(status==="ready")patch.ready_at=now;
  if(status==="out_for_delivery")patch.picked_up_at=now;
  if(status==="delivered")patch.delivered_at=now;
  const {data,error}=await supabase.from("orders").update(patch).eq("id",orderId).select().single();
  if(error){toast("Could not update order: "+error.message);return;}
  renderLiveOrder(data);
  toast(statusLabel(status)+" ✓");
}
async function subscribeCustomerOrder(orderId){
  if(!window.KOPI_SUPABASE_READY)return;
  await ensureLiveSession();
  if(customerOrderChannel) supabase.removeChannel(customerOrderChannel);
  customerOrderChannel=supabase.channel("kopi-boy-customer-"+orderId)
    .on("postgres_changes",{event:"UPDATE",schema:"public",table:"orders",filter:`id=eq.${orderId}`},
      payload=>renderCustomerLiveStatus(payload.new))
    .subscribe();
}

function renderCustomerLiveStatus(order){
  const screen=$("customerLiveOrderContent");
  if(!screen)return;
  screen.innerHTML=`<div class="live-order-card">
    <span class="status-pill ${order.status}">${String(order.status).toUpperCase()}</span>
    <h2>${order.status==="accepted"?"Order accepted!":order.status==="declined"?"Order declined":"Order placed"}</h2>
    <p>${order.order_number} · ${currentCook?.name||"Kopi Boy cook"}</p>
    <div class="status-steps">
      <div class="status-step on"><i>✓</i>Order Placed</div>
      <div class="status-step ${["accepted","cooking","ready","out_for_delivery","delivered"].includes(order.status)?"on":""}"><i>${["accepted","cooking","ready","out_for_delivery","delivered"].includes(order.status)?"✓":"•"}</i>Cook Accepted</div>
      <div class="status-step ${["cooking","ready","out_for_delivery","delivered"].includes(order.status)?"on":""}"><i>•</i>Cooking</div>
      <div class="status-step ${["ready","out_for_delivery","delivered"].includes(order.status)?"on":""}"><i>•</i>Ready for Rider</div>
    </div>
  </div>`;
}

function showLastOrder(){
  const raw=localStorage.getItem("kopiboy_last_order");
  if(!raw){toast("No active order");return;}
  const order=JSON.parse(raw);renderCustomerLiveStatus(order);go("customerLiveOrder");subscribeCustomerOrder(order.id);
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
function openCook(i){
 currentCook=cooks[i];
 $("menuContent").innerHTML=`<div class="screen-title"><button class="back-small" onclick="go('cookList')">‹</button><b>${currentCook.name}</b><button>⋯</button></div>
 <div class="menu-top"><img src="${currentCook.avatar}"><div><h2>${currentCook.name} <span class="rating">★ ${currentCook.rating}</span></h2><p>${currentCook.type}</p><p>◷ ${currentCook.time} · $2.50 Delivery</p></div></div>
 <div class="menu-tabs"><button class="active">Menu</button><button>Reviews</button><button>Info</button></div>
 ${currentCook.foods.map((f,idx)=>`<div class="dish"><img src="${f[2]}"><div class="dish-main"><h3>${f[0]} <strong>$${f[1].toFixed(2)}</strong></h3><p>Fragrant, freshly prepared home-style food made with care, served with classic sides.</p></div><button class="plus" onclick="addFood(${idx})">+</button></div>`).join("")}
 ${cart.length?`<div class="cartbar"><span>🛒 ${cart.length} items · $${cartTotal().toFixed(2)}</span><button onclick="renderSummary()">View Cart</button></div>`:""}`;
 go("menuScreen");
}
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
async function placeOrder(){
  if(!window.KOPI_SUPABASE_READY){toast("Kopi Boy is not connected to its live database yet");return;}
  if(!currentCook?.id){toast("This cook is not configured");return;}
  if(!cart.length){toast("Your cart is empty");return;}
  const orderId="KB"+Math.floor(100000+Math.random()*900000);
  const items=cart.map(x=>({name:x.name,price:Number(x.price),qty:1}));
  const subtotal=cartTotal(), deliveryFee=2.50, total=subtotal+deliveryFee;
  const {data:order,error}=await supabase.from("orders").insert({
    order_number:orderId,
    merchant_id:currentCook.id,
    customer_name:"Customer",
    status:"placed",
    subtotal,delivery_fee:deliveryFee,total,
    items
  }).select().single();
  if(error){console.error(error);toast("Could not place order: "+error.message);return;}
  $("orderNumber").textContent="Order #"+order.order_number;
  $("confirmedSeller").innerHTML=`<img src="${currentCook.avatar}"><div><b>${currentCook.name}</b><small style="display:block;color:#888">${currentCook.time} · ${currentCook.distance}</small></div>`;
  localStorage.setItem("kopiboy_last_order", JSON.stringify(order));
  cart=[];go("orderConfirmed");toast("Order placed ✓");
  subscribeCustomerOrder(order.id);
}

async function initLiveRiderOrders(){
  if(!window.KOPI_SUPABASE_READY){
    if($("riderLiveStatus")) $("riderLiveStatus").textContent="Live database not connected";
    return;
  }
  await ensureLiveSession();
  if($("riderLiveStatus")) $("riderLiveStatus").textContent="LIVE · looking for delivery jobs";
  if(riderOrderChannel) supabase.removeChannel(riderOrderChannel);
  riderOrderChannel=supabase.channel("kopi-boy-rider-jobs")
    .on("postgres_changes",{event:"INSERT",schema:"public",table:"orders"},payload=>{
      if(["looking_for_rider","accepted"].includes(payload.new.status)) loadRiderJobs();
    })
    .on("postgres_changes",{event:"UPDATE",schema:"public",table:"orders"},payload=>{
      if(["looking_for_rider","accepted","rider_accepted","cooking","ready","out_for_delivery","delivered"].includes(payload.new.status)) {
        loadRiderJobs();
        if(payload.new.rider_id==="rider-brother") renderRiderJob(payload.new);
      }
    }).subscribe();
  await loadRiderJobs();
}
async function loadRiderJobs(){
  if(!window.KOPI_SUPABASE_READY||!$("riderJobsArea"))return;
  const {data,error}=await supabase.from("orders").select("*").in("status",["accepted","looking_for_rider"]).is("rider_id",null).order("created_at",{ascending:false});
  if(error){console.error(error);return;}
  $("riderJobsArea").innerHTML=data?.length?data.map(riderJobCard).join(""):"<div class='rider-order-card'><small>No delivery jobs available right now.</small></div>";
}
function riderJobCard(order){
  return `<div class="rider-order-card">
    <h3>🛵 Delivery Request · ${order.order_number}</h3>
    <small>${new Date(order.created_at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})} · Food payment goes to merchant</small>
    <div class="job-line"><span>Pick up</span><b>Merchant</b></div>
    <div class="job-line"><span>Deliver to</span><b>Customer</b></div>
    <div class="job-line"><span>Delivery fee</span><b>$${Number(order.delivery_fee).toFixed(2)}</b></div>
    <button class="green full" onclick="acceptRiderOrder('${order.id}')">ACCEPT DELIVERY</button>
  </div>`;
}
async function acceptRiderOrder(orderId){
  if(!window.KOPI_SUPABASE_READY){toast("Live database is not connected");return;}
  const now=new Date().toISOString();
  const {data,error}=await supabase.from("orders").update({status:"rider_accepted",rider_id:currentRider.id,rider_name:currentRider.name,rider_accepted_at:now}).eq("id",orderId).is("rider_id",null).select().single();
  if(error){toast("This delivery was already accepted or could not be claimed");await loadRiderJobs();return;}
  renderRiderJob(data);toast("Delivery accepted ✓");
}
function renderRiderJob(order){
  currentLiveOrder=order;
  $("riderJobTitle").textContent=order.order_number;
  $("riderJobContent").innerHTML=`<div class="rider-order-card">
    <span class="status-pill ${order.status}">${statusLabel(order.status).toUpperCase()}</span>
    <h3 style="margin-top:8px">Delivery for ${order.rider_name||currentRider.name}</h3>
    <div class="job-line"><span>Pick up from</span><b>Merchant</b></div>
    <div class="job-line"><span>Deliver to</span><b>Customer</b></div>
    <div class="job-line"><span>Delivery fee</span><b>$${Number(order.delivery_fee).toFixed(2)}</b></div>
    ${timelineHTML(order)}
    <div class="rider-actions">
      ${order.status==="rider_accepted"?`<button class="green full" onclick="riderUpdateStatus('${order.id}','cooking')">CONFIRM — WAITING FOR FOOD</button>`:""}
      ${order.status==="ready"?`<button class="green full" onclick="riderUpdateStatus('${order.id}','out_for_delivery')">I'VE COLLECTED THE FOOD</button>`:""}
      ${order.status==="out_for_delivery"?`<button class="green full" onclick="riderUpdateStatus('${order.id}','delivered')">DELIVERED TO CUSTOMER</button>`:""}
    </div>
  </div>`;
  go("riderJob");
}
async function riderUpdateStatus(orderId,status){
  const patch={status};
  const now=new Date().toISOString();
  if(status==="out_for_delivery")patch.picked_up_at=now;
  if(status==="delivered")patch.delivered_at=now;
  const {data,error}=await supabase.from("orders").update(patch).eq("id",orderId).eq("rider_id",currentRider.id).select().single();
  if(error){toast("Could not update delivery");return;}
  renderRiderJob(data);toast(statusLabel(status)+" ✓");
}

function setupCook(){
  if($("newOrderCard")) $("newOrderCard").innerHTML="";
  initLiveCookOrders();
}
function setupRider(){
  initLiveRiderOrders();
}
function findRider(){toast("Searching riders within 3 km…");setTimeout(()=>go("riderFound"),650);}
renderHome();renderCooks();setupCook();setupRider();