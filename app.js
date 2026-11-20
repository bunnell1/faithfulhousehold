const KEY = "faithful-household-v1";
const EXAMPLE = { source:"example", income:5800, givingRate:0.1, reserveRate:0.08, debts:[{id:1,name:"Card",balance:12400,payment:280}], emergencySaved:900, liveFor:{shelter:0,food:0,fuel:0,utilities:0}, goals:{firstFruits:false,oneMonth:false,namedDebt:false} };
const BLANK = { source:"yours", income:0, givingRate:0.1, reserveRate:0.1, debts:[{id:1,name:"",balance:0,payment:0}], emergencySaved:0, liveFor:{shelter:0,food:0,fuel:0,utilities:0}, goals:{firstFruits:false,oneMonth:false,namedDebt:false} };
let state = structuredClone(EXAMPLE);
let nextId = 2;
const $ = (id) => document.getElementById(id);
const money = (n) => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(Math.round(n||0));
const nn = (n) => (!Number.isFinite(n) || n<=0) ? 0 : Math.min(1000000, Math.round(n));
function normalize(s) {
  let debts = Array.isArray(s.debts) ? s.debts.map((d,i) => ({ id: d.id || i+1, name: String(d.name||"").slice(0,40), balance: nn(d.balance), payment: nn(d.payment) })) : [];
  if (!debts.length && (nn(s.debtBalance)>0 || nn(s.debtPayment)>0)) {
    debts = [{ id:1, name:"", balance: nn(s.debtBalance), payment: nn(s.debtPayment) }];
  }
  if (!debts.length) debts = [{ id:1, name:"", balance:0, payment:0 }];
  nextId = Math.max(nextId, ...debts.map(d => d.id||0)) + 1;
  const n = (v) => { const x = Number(String(v).replace(/[^\d]/g,"")); return Number.isFinite(x) && x>0 ? Math.min(1000000, Math.round(x)) : 0; };
  const liveFor = s.liveFor && typeof s.liveFor === "object" ? {
    shelter: n(s.liveFor.shelter),
    food: n(s.liveFor.food),
    fuel: n(s.liveFor.fuel),
    utilities: n(s.liveFor.utilities)
  } : {shelter:0,food:0,fuel:0,utilities:0};
  return { ...s, debts, liveFor };
}
function activeDebts(s) {
  return (s.debts||[]).filter(d => nn(d.balance)>0).sort((a,b) => nn(a.balance)-nn(b.balance));
}
function planOf(s) {
  let left = nn(s.income);
  const giving = Math.min(Math.round(nn(s.income) * s.givingRate), left); left -= giving;
  const active = activeDebts(s);
  const debtWant = active.reduce((sum,d) => sum + nn(d.payment), 0);
  const debtPay = Math.min(debtWant, left); left -= debtPay;
  const reserveWant = Math.round(nn(s.income) * s.reserveRate);
  const reserve = Math.min(reserveWant, left); left -= reserve;
  const totalBalance = active.reduce((sum,d) => sum + nn(d.balance), 0);
  return { giving, debtPay, debtShort: debtWant-debtPay, reserve, reserveShort: reserveWant-reserve, living: left, totalBalance, count: active.length };
}
function stepOf(s, p) {
  const income = nn(s.income);
  const active = activeDebts(s);
  if (income<=0) return ["Know what came in","Enter this month’s take-home. The order only means something when it is working with a real number.","Be thou diligent to know the state of thy flocks, and look well to thy herds.","Proverbs 27:23"];
  if (s.givingRate<=0) return ["Set first fruits apart","Before a reserve or a lifestyle, name an amount to give — even a small one. The month starts there.","Honour the LORD with thy substance, and with the firstfruits of all thine increase.","Proverbs 3:9"];
  const missingPayment = active.find(d => nn(d.payment)<=0);
  if (missingPayment) return ["Name what is due","A balance without a payment is only a worry. Enter what must go out this month so the rest of the plan can make room for it.","The borrower is servant to the lender.","Proverbs 22:7"];
  if (p.debtShort>0) return ["Make room for what is owed","Giving is set aside, and the payments you entered do not fit in what is left. Lower the reserve until they fit. Do not plan a lifestyle that ignores what is owed.","The borrower is servant to the lender.","Proverbs 22:7"];
  const heavy = p.totalBalance > income * 4;
  if (!heavy && p.living>0 && nn(s.emergencySaved) < p.living) return ["One month, set aside", `Giving is first, and the payments fit. Next, grow what is already set aside (${money(s.emergencySaved)}) toward one month of living costs (${money(p.living)}). That is margin for the household, not a pile for its own sake.`,"There is treasure to be desired and oil in the dwelling of the wise; but a foolish man spendeth it up.","Proverbs 21:20"];
  if (heavy && s.reserveRate>0.05) {
    const smallest = active[0];
    const name = smallest && smallest.name ? ` the one named ${smallest.name}` : " the smallest balance";
    return ["Send the margin to the debt", `The balances are large next to this month’s income. Keep a modest cushion, and aim extra reserve at${name} until it is smaller.`,"The borrower is servant to the lender.","Proverbs 22:7"];
  }
  if (s.givingRate<0.1 && p.living > income*0.6) return ["Look at the gift before lifestyle grows","Living still takes most of the month. A tenth is a long-used starting point for giving, not a tax this tool collects. If you can choose it freely, move giving toward it before the remainder quietly expands.","Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver.","2 Corinthians 9:7"];
  if (active.length > 1) {
    const smallest = active[0];
    const label = smallest.name ? `${smallest.name} (${money(smallest.balance)})` : `the smallest (${money(smallest.balance)})`;
    return ["The smallest is in view", `Giving is first, and every payment fits. ${label} is the one to clear next. When it is gone, its payment moves to the next. The order does not change.`,"The borrower is servant to the lender.","Proverbs 22:7"];
  }
  return ["Stay inside what remains","The order is holding: giving, what is owed, and a reserve. The faithful work now is to live on what is left — and not invent new needs for it.","But godliness with contentment is great gain.","1 Timothy 6:6"];
}
function digits(el) { const d = el.value.replace(/[^\d]/g,""); return d ? Number(d) : 0; }
function show(name) {
  for (const view of ["home", "plan", "about"]) {
    $("view-" + view).classList.toggle("hidden", name !== view);
    $("nav-" + view).setAttribute("aria-current", name === view ? "page" : "false");
  }
  const next = name === "home" ? "" : "#" + name;
  if ((location.hash || "") !== next) {
    if (next) location.hash = name;
    else history.replaceState(null, "", location.pathname + location.search);
  }
}
function renderDebts() {
  const box = $("debts");
  const esc = (s) => String(s||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");
  box.innerHTML = state.debts.map((d, i) => {
    const safe = esc(d.name);
    return `<div class="debt" data-id="${d.id}">
      <div class="debt-head">
        <span class="muted">Debt ${i+1}</span>
        ${state.debts.length>1 ? `<button type="button" class="btn quiet remove" data-remove="${d.id}">Remove</button>` : ""}
      </div>
      <input type="text" class="name" placeholder="Optional name" value="${safe}" data-name="${d.id}" maxlength="40">
      <div class="debt-fields">
        <div><label>Balance</label><div class="field"><span>$</span><input inputmode="numeric" class="bal" data-bal="${d.id}" value="${d.balance||""}"></div></div>
        <div><label>Payment this month</label><div class="field"><span>$</span><input inputmode="numeric" class="pay" data-pay="${d.id}" value="${d.payment||""}"></div></div>
      </div>
    </div>`;
  }).join("");
  if (activeDebts(state).length > 1) {
    box.insertAdjacentHTML("beforeend", `<p class="hint">Listed in the order entered. The smallest balance is the one in view this month.</p>`);
  }
}
function render(skipDebts) {
  state = normalize(state);
  const p = planOf(state);
  const step = stepOf(state, p);
  $("example-note").classList.toggle("hidden", state.source!=="example");
  $("income").value = state.income ? String(state.income) : "";
  $("saved").value = state.emergencySaved ? String(state.emergencySaved) : "";
  const lf = state.liveFor || {};
  $("live-shelter").value = lf.shelter || "";
  $("live-food").value = lf.food || "";
  $("live-fuel").value = lf.fuel || "";
  $("live-utilities").value = lf.utilities || "";
  const used = (lf.shelter||0) + (lf.food||0) + (lf.fuel||0) + (lf.utilities||0);
  const rest = Math.max(0, p.living - used);
  $("live-rest").textContent = money(rest);
  $("giving").value = Math.round(state.givingRate*100);
  $("reserve").value = Math.round(state.reserveRate*100);
  $("giving-read").textContent = Math.round(state.givingRate*100) + "% · " + money(p.giving);
  $("reserve-read").textContent = Math.round(state.reserveRate*100) + "% · " + money(p.reserve);
  if (!skipDebts) renderDebts();
  const income = nn(state.income);
  $("empty").classList.toggle("hidden", income>0);
  const oweQuiet = p.count===0 ? "No debt entered" : (p.count>1 ? `${p.count} debts` : "");
  $("order").innerHTML = income<=0 ? "" : [
    ["1","Give", p.giving, "var(--olive)"],
    ["2","Owe", p.debtPay, "var(--copper)", oweQuiet],
    ["3","Keep", p.reserve, "color-mix(in srgb, var(--olive) 45%, transparent)"],
    ["4","Live", p.living, "color-mix(in srgb, var(--ink) 20%, transparent)"]
  ].map(([i,label,amt,tone,quiet]) => {
    const share = income>0 ? Math.max(0, Math.min(100, amt/income*100)) : 0;
    return `<li><div class="row"><p style="margin:0"><span class="muted">${i}</span> ${label}${quiet?` <span class="muted">· ${quiet}</span>`:""}</p><strong>${money(amt)}</strong></div><div class="track"><i style="width:${share}%;background:${tone}"></i></div></li>`;
  }).join("");
  $("short").className = "";
  $("short").textContent = "";
  if (p.debtShort>0) { $("short").className="warn"; $("short").textContent = `The payments are short ${money(p.debtShort)}. Lower the reserve, or the month cannot cover what is owed.`; }
  else if (p.reserveShort>0) { $("short").className="warn"; $("short").style.borderColor="var(--olive)"; $("short").textContent = `The reserve is short ${money(p.reserveShort)} because giving and the payments came first.`; }
  else if (income>0) { $("short").className="hint"; $("short").textContent = "Every dollar of take-home is assigned."; }
  $("step-title").textContent = step[0];
  $("step-body").textContent = step[1];
  $("step-verse").textContent = step[2];
  $("step-ref").textContent = step[3];
  const debtDetail = p.count===0 ? "If a balance should be retired, it is named here — or marked as none."
    : p.count===1 ? `${money(p.totalBalance)} is the balance in view, with its payment named.`
    : `${p.count} balances are named, totaling ${money(p.totalBalance)}. The smallest is the one in view.`;
  const goals = [
    ["firstFruits","First fruits are named","An amount to give is chosen before the rest of the month is spent."],
    ["oneMonth","One month is the aim", p.living>0 ? `The reserve is pointed at ${money(p.living)} of living costs.` : "Once living costs are known, that figure becomes the reserve aim."],
    ["namedDebt","Debts are named", debtDetail]
  ];
  $("goals").innerHTML = goals.map(([key,title,detail]) => `<button type="button" class="goal" data-goal="${key}" aria-pressed="${state.goals[key]}"><span class="box">${state.goals[key]?"✓":""}</span><span><strong style="display:block">${title}</strong><span class="muted">${detail}</span></span></button>`).join("");
  localStorage.setItem(KEY, JSON.stringify(state));
}
function set(partial) { state = normalize({ ...state, ...partial, source:"yours" }); render(); }
function updateDebt(id, patch) {
  state = normalize({ ...state, source:"yours", debts: state.debts.map(d => d.id===id ? { ...d, ...patch } : d) });
  render(true);
}
document.addEventListener("input", (e) => {
  const id = e.target.id;
  if (id==="income") set({income:digits(e.target)});
  if (id==="giving") set({givingRate:Number(e.target.value)/100});
  if (id==="reserve") set({reserveRate:Number(e.target.value)/100});
  if (id==="saved") set({emergencySaved:digits(e.target)});
  if (id==="live-shelter") set({liveFor:{...state.liveFor, shelter:digits(e.target)}});
  if (id==="live-food") set({liveFor:{...state.liveFor, food:digits(e.target)}});
  if (id==="live-fuel") set({liveFor:{...state.liveFor, fuel:digits(e.target)}});
  if (id==="live-utilities") set({liveFor:{...state.liveFor, utilities:digits(e.target)}});
  const nameId = e.target.dataset.name;
  const balId = e.target.dataset.bal;
  const payId = e.target.dataset.pay;
  if (nameId) updateDebt(Number(nameId), { name: e.target.value });
  if (balId) updateDebt(Number(balId), { balance: digits(e.target) });
  if (payId) updateDebt(Number(payId), { payment: digits(e.target) });
});
document.addEventListener("click", (e) => {
  const g = e.target.closest("[data-goal]");
  if (g) {
    const key = g.dataset.goal;
    state = { ...state, source:"yours", goals:{...state.goals, [key]: !state.goals[key]} };
    render();
    return;
  }
  const rem = e.target.closest("[data-remove]");
  if (rem) {
    const id = Number(rem.dataset.remove);
    state = normalize({ ...state, source:"yours", debts: state.debts.filter(d => d.id!==id) });
    render();
  }
});
$("add-debt").onclick = () => {
  state = normalize({ ...state, source:"yours", debts: [...state.debts, { id: nextId++, name:"", balance:0, payment:0 }] });
  render();
};
$("load").onclick = () => { state = structuredClone(EXAMPLE); render(); };
$("clear").onclick = () => { state = structuredClone(BLANK); render(); };
$("next-month").onclick = () => {
  state = normalize({ ...state, source:"yours", income:0 });
  $("file-note").textContent = "Rates, debts, and what is set aside are kept. Enter this month’s take-home.";
  render();
  $("income").focus();
};
$("print").onclick = () => window.print();
$("nav-home").onclick = () => show("home");
$("nav-mark").onclick = () => show("home");
$("nav-plan").onclick = () => show("plan");
$("nav-about").onclick = () => show("about");
$("open-plan").onclick = () => show("plan");
$("open-about").onclick = () => show("about");
$("save").onclick = () => {
  const raw = $("filename").value.trim().replace(/[^\w.\- ]+/g,"").slice(0,80);
  if (!raw) { $("file-note").textContent = "Enter a filename."; return; }
  const name = raw.toLowerCase().endsWith(".json") ? raw : raw + ".json";
  const blob = new Blob([JSON.stringify({kind:"faithful-household",version:1,household:{...state,source:"yours"}}, null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  URL.revokeObjectURL(a.href);
  $("file-note").textContent = `Saved ${name}. It stays on this device.`;
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
    state = normalize({ ...h, source:"yours" });
    $("file-note").textContent = `Opened ${file.name}. The form now shows what was in the file.`;
    render();
  } catch { $("file-note").textContent = "That file is not a Faithful Household plan."; }
};
try {
  const raw = localStorage.getItem(KEY) || localStorage.getItem("faithful-house-v1");
  if (raw) { const parsed = JSON.parse(raw); if (typeof parsed.income==="number" && parsed.goals) state = normalize(parsed); }
} catch {}
if (location.hash==="#about" || location.hash==="#install") show("about");
else if (location.hash==="#plan") show("plan");
else show("home");
render();
