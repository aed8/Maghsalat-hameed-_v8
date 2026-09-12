const K="laundry_orders";let orders=[],rd=new Date();const $=x=>document.getElementById(x),m=x=>Number(x||0).toFixed(2),pn=x=>String(x||"").replace(/\D/g,""),nn=x=>String(x||"").trim().replace(/\s+/g," ").toLowerCase(),esc=x=>String(x??"").replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[a])),di=d=>new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);
function mig(o){let t=Number(o.total??(o.w||o.weight||0)*(o.kp||o.kgprice||0)+(o.dp||0)),p=Number(o.paid??(o.paymentStatus=="paid"?t:0));return {...o,id:+o.id||0,name:String(o.name||""),phone:String(o.phone||""),type:o.type||"ملابس",w:+(o.w??o.weight)||0,total:t,paid:Math.min(Math.max(p,0),t),balance:Math.max(t-p,0),status:o.status||"قيد الغسيل",orderDate:o.orderDate||di(new Date()),orderDay:o.orderDay||"",date:o.date||new Date().toISOString()}}
function load(){try{orders=JSON.parse(localStorage.getItem(K)||"[]")}catch(e){orders=[]}orders=Array.isArray(orders)?orders.map(mig):[];save()}
function save(){localStorage.setItem(K,JSON.stringify(orders))}
function week(d){let s=new Date(d);s.setHours(0,0,0,0);s.setDate(s.getDate()-((s.getDay()+1)%7));let e=new Date(s);e.setDate(e.getDate()+6);e.setHours(23,59,59,999);return{s,e}}
function stats(){let w=week(rd),a=orders.filter(o=>{let d=new Date(o.orderDate+"T12:00:00");return d>=w.s&&d<=w.e}),c=new Set(a.map(o=>pn(o.phone)||nn(o.name)));return{w,a,s:a.reduce((x,o)=>x+o.total,0),p:a.reduce((x,o)=>x+o.paid,0),d:a.reduce((x,o)=>x+o.balance,0),c:c.size}}
function calc(){let t=(+$("weight").value||0)*(+$("kg").value||0)+($("det").value=="1"?+$("drug").value||0:0),p=Math.min(Math.max(+$("paid").value||0,0),t);$("total").textContent=m(t);$("balance").textContent=m(t-p)}
function clear(){["name","phone","weight","kg","drug","delivery","paid"].forEach(x=>$(x).value="");$("det").value="0";$("status").value="قيد الغسيل";setToday();calc()}
function setToday(){$("date").value=di(new Date());$("day").value=new Date($("date").value+"T12:00:00").toLocaleDateString("ar",{weekday:"long"})}
function add(){let n=$("name").value.trim(),ph=$("phone").value.trim(),w=+$("weight").value||0,k=+$("kg").value||0,d=$("det").value=="1"?+$("drug").value||0:0;if(!n||!ph||w<=0||k<=0)return alert("أدخل الاسم والهاتف والوزن وسعر الكيلو");let t=w*k+d,p=Math.min(Math.max(+$("paid").value||0,0),t);orders.push({id:orders.reduce((a,o)=>Math.max(a,+o.id||0),0)+1,name:n,phone:ph,type:$("type").value,w,kp:k,dp:d,total:t,paid:p,balance:t-p,status:$("status").value,orderDate:$("date").value,orderDay:$("day").value,due:$("delivery").value,date:new Date().toISOString()});save();render();clear();toast("تم حفظ الطلب ✅")}
function groups(){let z=new Map;orders.forEach(o=>{let k=pn(o.phone)||nn(o.name);if(!z.has(k))z.set(k,{name:o.name,phone:o.phone,a:[]});z.get(k).a.push(o)});return[...z.values()].map(c=>({...c,t:c.a.reduce((s,o)=>s+o.total,0),p:c.a.reduce((s,o)=>s+o.paid,0),d:c.a.reduce((s,o)=>s+o.balance,0)}))}
function render(){let s=stats(),g=groups();$("customers").textContent=g.length;$("orders").textContent=orders.length;$("sales").textContent=m(s.s);$("due").textContent=m(s.d);$("range").textContent=`الفترة: ${di(s.w.s)} إلى ${di(s.w.e)}`;["rsales","rpaid","rdue"].forEach((x,i)=>$(x).textContent=m([s.s,s.p,s.d][i]));$("rcust").textContent=s.c;$("rorders").textContent=s.a.length;$("ravg").textContent=m(s.a.length?s.s/s.a.length:0);
let cq=nn($("csearch").value);$("clist").innerHTML=g.filter(c=>!cq||nn(c.name).includes(cq)||pn(c.phone).includes(pn(cq))).map(c=>`<div class="customer"><b>${esc(c.name)}</b><br>${esc(c.phone)} — ${c.a.length} طلب<br>المبيعات: ${m(c.t)} | المدفوع: ${m(c.p)} | المتبقي: ${m(c.d)}</div>`).join("")||"<p>لا يوجد زبائن</p>";
let q=nn($("search").value),f=$("filter").value;a=orders.filter(o=>(!q||(nn(o.name)+" "+pn(o.phone)+" "+o.id).includes(q))&&(f=="كل الطلبات"||(f=="غير مدفوع"?o.balance>0:o.status==f))).slice().reverse();$("rows").innerHTML=a.map(o=>`<tr><td>${o.id}</td><td>${esc(o.name)}</td><td>${esc(o.phone)}</td><td>${esc(o.type)}</td><td>${o.w}</td><td>${m(o.total)}</td><td>${m(o.paid)}</td><td><span class="badge ${o.balance<=0?"ok":"bad"}">${m(o.balance)}</span></td><td>${esc(o.status)}</td><td><button onclick="pay(${o.id})">💵 دفع</button> <button class="gray" onclick="receipt(${o.id})">🧾 فاتورة</button> <button onclick="sendWhatsApp(${o.id})">🟢 واتساب</button> <button class="gray" onclick="shareOrder(${o.id})">📲 إرسال</button> <button class="gray" onclick="del(${o.id})">حذف</button></td></tr>`).join("")||`<tr><td colspan="10">لا توجد طلبات</td></tr>`}
function pay(id){let o=orders.find(x=>x.id==id),n=prompt("المتبقي: "+m(o.balance)+" — أدخل المبلغ المدفوع");if(n!==null){o.paid=Math.min(o.total,o.paid+Math.max(0,+n||0));o.balance=o.total-o.paid;save();render()}}
function del(id){if(confirm("حذف الطلب؟")){orders=orders.filter(o=>o.id!=id);save();render()}}
function messageFor(o){return `🧺 مغسلة حميد\nأهلاً ${o.name}، تم تسجيل طلب الغسيل رقم ${o.id}.\nالنوع: ${o.type}\nالوزن: ${o.w} كغ\nالإجمالي: ${m(o.total)}\nالمدفوع: ${m(o.paid)}\nالمتبقي: ${m(o.balance)}\nموعد التسليم: ${o.due ? new Date(o.due).toLocaleString("ar") : "غير محدد"}\nشكرًا لثقتكم بنا 🌷`}
function sendWhatsApp(id){let o=orders.find(x=>x.id==id);if(!o)return;let p=pn(o.phone);if(!p)return alert("لا يوجد رقم هاتف للزبون.");p=p.startsWith("0")?"972"+p.slice(1):p;window.open("https://wa.me/"+p+"?text="+encodeURIComponent(messageFor(o)),"_blank")}
async function shareOrder(id){let o=orders.find(x=>x.id==id);if(!o)return;let t=messageFor(o);if(navigator.share){try{await navigator.share({title:"فاتورة مغسلة حميد",text:t})}catch(e){}}else{try{await navigator.clipboard.writeText(t);toast("تم نسخ الرسالة ✅")}catch(e){prompt("انسخ الرسالة:",t)}}}
function receipt(id){let o=orders.find(x=>x.id==id),w=window.open("","_blank");if(!w)return;w.document.write(`<html dir=rtl><meta charset=utf-8><body style="font-family:Arial;padding:25px"><h2>🧺 مغسلة حميد</h2><p>رقم الطلب: ${o.id}</p><p>الزبون: ${esc(o.name)}</p><p>الهاتف: ${esc(o.phone)}</p><p>النوع: ${esc(o.type)}</p><p>التاريخ: ${o.orderDate}</p><p>الإجمالي: ${m(o.total)}</p><p>المدفوع: ${m(o.paid)}</p><p>المتبقي: ${m(o.balance)}</p><p>الحالة: ${esc(o.status)}</p><button onclick=print()>🖨️ طباعة</button></body></html>`);w.document.close()}
function excel(){
  const s=stats();
  const rows=[
    ["مغسلة حميد - التقرير الأسبوعي"],
    ["الفترة",di(s.w.s),di(s.w.e)],
    [],
    ["رقم الطلب","الزبون","الهاتف","النوع","التاريخ","الوزن (كغ)","الإجمالي","المدفوع","المتبقي","الحالة"]
  ];
  s.a.forEach(o=>rows.push([o.id,o.name,o.phone,o.type,o.orderDate,o.w,o.total,o.paid,o.balance,o.status]));
  rows.push([]);
  rows.push(["ملخص"]);
  rows.push(["إجمالي المبيعات",s.s]);
  rows.push(["المدفوع",s.p]);
  rows.push(["غير المدفوع",s.d]);
  rows.push(["عدد الزبائن",s.c]);
  rows.push(["عدد الطلبات",s.a.length]);

  // Excel 2003 SpreadsheetML: a genuine Excel workbook XML format.
  const cell=v=>`<Cell><Data ss:Type="${typeof v==="number"&&isFinite(v)?"Number":"String"}">${xml(v)}</Data></Cell>`;
  const row=r=>`<Row>${r.map(cell).join("")}</Row>`;
  const xmlbook=`<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="التقرير الأسبوعي"><Table>${rows.map(row).join("")}</Table></Worksheet>
</Workbook>`;
  download("\ufeff"+xmlbook,"تقرير-مغسلة-حميد.xls","application/vnd.ms-excel;charset=utf-8");
  toast("تم إنشاء ملف Excel ✅");
}
function xml(v){
  return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");
}
function download(x,n,t){let a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\ufeff"+x],{type:t}));a.download=n;a.click()}
function backup(){download(JSON.stringify({version:8,orders},null,2),"نسخة-مغسلة-حميد.json","application/json")}
function toast(x){$("toast").textContent=x;$("toast").style.display="block";setTimeout(()=>$("toast").style.display="none",1800)}
["weight","kg","drug","det","paid"].forEach(x=>$(x).oninput=calc);$("date").onchange=()=>{$("day").value=new Date($("date").value+"T12:00:00").toLocaleDateString("ar",{weekday:"long"})};$("save").onclick=add;$("clear").onclick=clear;$("search").oninput=render;$("filter").onchange=render;$("csearch").oninput=render;$("excel").onclick=excel;$("print").onclick=()=>print();$("backup").onclick=backup;$("restore").onchange=e=>{let r=new FileReader;r.onload=()=>{try{let x=JSON.parse(r.result);if(!Array.isArray(x.orders))throw 0;orders=x.orders.map(mig);save();render();toast("تمت الاستعادة ✅")}catch(e){alert("النسخة غير صالحة")}};r.readAsText(e.target.files[0])};$("prev").onclick=()=>{rd.setDate(rd.getDate()-7);render()};$("next").onclick=()=>{rd.setDate(rd.getDate()+7);render()};$("now").onclick=()=>{rd=new Date();render()};
load();setToday();calc();render();if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
let dep;addEventListener("beforeinstallprompt",e=>{e.preventDefault();dep=e;$("install").hidden=false});$("install").onclick=()=>{if(dep){dep.prompt();dep=null;$("install").hidden=true}};