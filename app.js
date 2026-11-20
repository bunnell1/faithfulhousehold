const KEY = "faithful-household-v1";
const EXAMPLE = { source:"example", income:5800, givingRate:0.1, reserveRate:0.08, debtBalance:12400, debtPayment:280, emergencySaved:900, goals:{firstFruits:false,oneMonth:false,namedDebt:false} };
const BLANK = { source:"yours", income:0, givingRate:0.1, reserveRate:0.1, debtBalance:0, debtPayment:0, emergencySaved:0, goals:{firstFruits:false,oneMonth:false,namedDebt:false} };
let state = structuredClone(EXAMPLE);
const $ = (id) => document.getElementById(id);
const money = (n) => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(Math.round(n||0));
const nn = (n) => (!Number.isFinite(n) || n<=0) ? 0 : Math.min(1000000, Math.round(n));
function planOf(s) {
  let left = nn(s.income);
  const giving = Math.min(Math.round(nn(s.income) * s.givingRate), left); left -= giving;
  const debtWant = nn(s.debtBalance) > 0 ? nn(s.debtPayment) : 0;
  const debtPay = Math.min(debtWant, left); left -= debtPay;
  const reserveWant = Math.round(nn(s.income) * s.reserveRate);
  const reserve = Math.min(reserveWant, left); left -= reserve;
  return { giving, debtPay, debtShort: debtWant-debtPay, reserve, reserveShort: reserveWant-reserve, living: left };
}
function stepOf(s, p) {
  const income = nn(s.income);
  if (income<=0) return ["Know what came in","Enter this month's take-home. The order only means something when it is working with a real number.","Be thou diligent to know the state of thy flocks, and look well to thy herds.","Proverbs 27:23"];
  if (s.givingRate<=0) return ["Set first fruits apart","Before a reserve or a lifestyle, name an amount to give, even a small one. The month starts there.","Honour the LORD with thy substance, and with the firstfruits of all thine increase.","Proverbs 3:9"];
  if (nn(s.debtBalance)>0 && nn(s.debtPayment)<=0) return ["Name what is due","A balance without a payment is only a worry. Enter what must go out this month so the rest of the plan can make room for it.","The borrower is servant to the lender.","Proverbs 22:7"];
  if (p.debtShort>0) return ["Make room for what is owed","Giving is set aside, and the payment you entered does not fit in what is left. Lower the reserve until the payment fits.","The borrower is servant to the lender.","Proverbs 22:7"];
  const heavy = nn(s.debtBalance) > income * 4;
  if (!heavy && p.living>0 && nn(s.emergencySaved) < p.living) return ["One month, set aside", "Giving is first, and the payment fits. Next, grow what is already set aside (" + money(s.emergencySaved) + ") toward one month of living costs (" + money(p.living) + ").","There is treasure to be desired and oil in the dwelling of the wise; but a foolish man spendeth it up.","Proverbs 21:20"];
  if (heavy && s.reserveRate>0.05) return ["Send the margin to the debt","The balance is large next to this month's income. Keep a modest cushion, and aim extra reserve at the debt you named until it is smaller.","The borrower is servant to the lender.","Proverbs 22:7"];
  if (s.givingRate<0.1 && p.living > income*0.6) return ["Look at the gift before lifestyle grows","Living still takes most of the month. A tenth is a long-used starting point for giving, not a tax this tool collects.","Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver.","2 Corinthians 9:7"];
  return ["Stay inside what remains","The order is holding: giving, what is owed, and a reserve. The faithful work now is to live on what is left.","But godliness with contentment is great gain.","1 Timothy 6:6"];
}
function digits(el) { const d = el.value.replace(/[^\d]/g,""); return d ? Number(d) : 0; }
function show(name) {
  $("view-plan").classList.toggle("hidden", name!=="plan");
  $("view-about").classList.toggle("hidden", name!=="about");
  $("nav-plan").setAttribute("aria-current", name==="plan" ? "page" : "false");
  $("nav-about").setAttribute("aria-current", name==="about" ? "page" : "false");
  if (name==="about") location.hash = "about"; else if (location.hash) history.replaceState(null,"", location.pathname);
}
function render() {
  const p = planOf(state);
  const step = stepOf(state, p);
  $("example-note").classList.toggle("hidden", state.source!=="example");
  const map = {income:"income","debt-balance":"debtBalance","debt-payment":"debtPayment",saved:"emergencySaved"};
  for (const id of Object.keys(map)) $(id).value = state[map[id]] ? String(state[map[id]]) : "";
  $("giving").value = Math.round(state.givingRate*100);
  $("reserve").value = Math.round(state.reserveRate*100);
  $("giving-read").textContent = Math.round(state.givingRate*100) + "% \u00b7 " + money(p.giving);
  $("reserve-read").textContent = Math.round(state.reserveRate*100) + "% \u00b7 " + money(p.reserve);
  const income = nn(state.income);
  $("empty").classList.toggle("hidden", income>0);
  $("order").innerHTML = income<=0 ? "" : [["1","Give",p.giving,"var(--olive)",""],["2","Owe",p.debtPay,"var(--copper)",nn(state.debtBalance)<=0?"No debt entered":""],["3","Keep",p.reserve,"color-mix(in srgb, var(--olive) 45%, transparent)",""],["4","Live",p.living,"color-mix(in srgb, var(--ink) 20%, transparent)",""]].map(([i,label,amt,tone,quiet]) => {
    const share = Math.max(0, Math.min(100, amt/income*100));
    return '<li><div class="row"><p style="margin:0"><span class="muted">'+i+'</span> '+label+(quiet?' <span class="muted">\u00b7 '+quiet+'</span>':'')+'</p><strong>'+money(amt)+'</strong></div><div class="track"><i style="width:'+share+'%;background:'+tone+'"></i></div></li>';
  }).join("");
  const short = $("short");
  short.className = ""; short.textContent = ""; short.style.borderColor = "";
  if (p.debtShort>0) { short.className="warn"; short.textContent = "The payment is short "+money(p.debtShort)+". Lower the reserve, or the month cannot cover what is owed."; }
  else if (p.reserveShort>0) { short.className="warn"; short.style.borderColor="var(--olive)"; short.textContent = "The reserve is short "+money(p.reserveShort)+" because giving and the payment came first."; }
  else if (income>0) { short.className="hint"; short.textContent = "Every dollar of take-home is assigned."; }
  $("step-title").textContent = step[0];
  $("step-body").textContent = step[1];
  $("step-verse").textContent = step[2];
  $("step-ref").textContent = step[3];
  const goals = [
    ["firstFruits","First fruits are named","An amount to give is chosen before the rest of the month is spent."],
    ["oneMonth","One month is the aim", p.living>0 ? "The reserve is pointed at "+money(p.living)+" of living costs." : "Once living costs are known, that figure becomes the reserve aim."],
    ["namedDebt","One debt is chosen", nn(state.debtBalance)>0 ? money(state.debtBalance)+" is the balance in view, with its payment named." : "If a balance should be retired, it is named here, or marked as none."]
  ];
  $("goals").innerHTML = goals.map(([key,title,detail]) => '<button type="button" class="goal" data-goal="'+key+'" aria-pressed="'+state.goals[key]+'"><span class="box">'+(state.goals[key]?'\u2713':'')+'</span><span><strong style="display:block">'+title+'</strong><span class="muted">'+detail+'</span></span></button>').join("");
  localStorage.setItem(KEY, JSON.stringify(state));
}
function set(partial) { state = Object.assign({}, state, partial, {source:"yours"}); render(); }
document.addEventListener("input", (e) => {
  const id = e.target.id;
  if (id==="income") set({income:digits(e.target)});
  if (id==="giving") set({givingRate:Number(e.target.value)/100});
  if (id==="reserve") set({reserveRate:Number(e.target.value)/100});
  if (id==="debt-balance") set({debtBalance:digits(e.target)});
  if (id==="debt-payment") set({debtPayment:digits(e.target)});
  if (id==="saved") set({emergencySaved:digits(e.target)});
});
document.addEventListener("click", (e) => {
  const g = e.target.closest("[data-goal]");
  if (!g) return;
  const key = g.dataset.goal;
  const goals = Object.assign({}, state.goals);
  goals[key] = !goals[key];
  state = Object.assign({}, state, {source:"yours", goals});
  render();
});
$("load").onclick = () => { state = structuredClone(EXAMPLE); render(); };
$("clear").onclick = () => { state = structuredClone(BLANK); render(); };
$("print").onclick = () => window.print();
$("nav-plan").onclick = () => show("plan");
$("nav-about").onclick = () => show("about");
$("save").onclick = () => {
  const raw = $("filename").value.trim().replace(/[^\w.\- ]+/g,"").slice(0,80);
  if (!raw) { $("file-note").textContent = "Enter a filename."; return; }
  const name = raw.toLowerCase().endsWith(".json") ? raw : raw + ".json";
  const blob = new Blob([JSON.stringify({kind:"faithful-household",version:1,household:Object.assign({}, state, {source:"yours"})}, null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  URL.revokeObjectURL(a.href);
  $("file-note").textContent = "Saved " + name + ". It stays on this device.";
};
$("open").onclick = () => $("file").click();
$("file").onchange = async (e) => {
  const file = e.target.files[0]; e.target.value = "";
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    if (parsed.kind && parsed.kind!=="faithful-household" && parsed.kind!=="faithful-house") throw new Error("kind");
    const h = parsed.household || parsed;
    if (typeof h.income!=="number" || !h.goals) throw new Error("shape");
    state = Object.assign({}, h, {source:"yours"});
    $("file-note").textContent = "Opened " + file.name + ". The form now shows what was in the file.";
    render();
  } catch (err) { $("file-note").textContent = "That file is not a Faithful Household plan."; }
};
try {
  const raw = localStorage.getItem(KEY) || localStorage.getItem("faithful-house-v1");
  if (raw) { const parsed = JSON.parse(raw); if (typeof parsed.income==="number" && parsed.goals) state = parsed; }
} catch (err) {}
if (location.hash==="#about" || location.hash==="#install") show("about");
render();
