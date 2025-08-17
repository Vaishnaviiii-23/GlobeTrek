const API_URL = "https://restcountries.com/v3.1/all?fields=name,capital,region,flags,population,cca2";
const perPage = 10;
let countries = [], filtered = [], currentPage = 1;

const searchInput = document.getElementById("searchInput");
const regionSelect = document.getElementById("regionSelect");
const grid = document.getElementById("grid");
const status = document.getElementById("status");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pagesEl = document.getElementById("pages");
const darkModeToggle = document.getElementById("darkModeToggle");
document.getElementById("perPage").textContent = perPage;

// DARK MODE
darkModeToggle.addEventListener("click", ()=>{
  document.body.classList.toggle("dark-mode");
});

// FETCH COUNTRIES
async function fetchCountries(){
  showStatusLoading("Loading countries...");
  try {
    const res = await fetch(API_URL);
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    countries = (await res.json()).sort((a,b)=> (a.name.common || "").localeCompare(b.name.common || ""));
    initRegionOptions();
    applyFilters();
  } catch(err){
    showStatusError("Error fetching countries: " + (err.message||"Network error"));
  }
}

function initRegionOptions(){
  const regions = Array.from(new Set(countries.map(c=>c.region).filter(Boolean))).sort();
  regions.forEach(r=>{
    const opt = document.createElement("option");
    opt.value = r; opt.textContent = r;
    regionSelect.appendChild(opt);
  });
}

// FILTER + SEARCH
function applyFilters(){
  const q = searchInput.value.trim().toLowerCase();
  const region = regionSelect.value;
  filtered = countries.filter(c=>{
    const name = c.name?.common.toLowerCase()||"";
    return name.includes(q) && (region==="All" || c.region===region);
  });
  currentPage=1; render();
}

// RENDER GRID + PAGINATION
function render(){
  grid.innerHTML="";
  if(filtered.length===0){
    showStatusError("No countries found 😕"); return;
  }
  status.textContent="";
  const start=(currentPage-1)*perPage, end=start+perPage;
  const pageItems = filtered.slice(start,end);

  pageItems.forEach(c=>{
    const name = highlightMatch(c.name.common);
    const capital = c.capital?.[0]||"N/A";
    const region = c.region||"N/A";
    const population = c.population?.toLocaleString()||"N/A";
    const flag = c.flags?.png||"";

    const card = document.createElement("div");
    card.className="card";
    card.innerHTML=`
      <img class="flag" src="${flag}" alt="Flag of ${c.name.common}">
      <h3>${name}</h3>
      <p class="meta">Capital: ${capital}</p>
      <p class="meta">Region: ${region}</p>
      <p class="meta">Population: ${population}</p>
    `;
    grid.appendChild(card);
  });

  renderPagination();
}

function highlightMatch(text){
  const q = searchInput.value.trim();
  if(!q) return text;
  const regex = new RegExp(`(${q})`,"gi");
  return text.replace(regex,"<mark>$1</mark>");
}

// PAGINATION
function renderPagination(){
  const totalPages = Math.ceil(filtered.length/perPage);
  pagesEl.innerHTML="";
  for(let i=1;i<=totalPages;i++){
    const dot = document.createElement("button");
    dot.className="page-dot"+(i===currentPage?" active":"");
    dot.textContent=i;
    dot.addEventListener("click",()=>{ currentPage=i; render(); });
    pagesEl.appendChild(dot);
  }
  prevBtn.disabled=currentPage===1;
  nextBtn.disabled=currentPage===totalPages;
}

prevBtn.addEventListener("click",()=>{ if(currentPage>1){currentPage--; render();} });
nextBtn.addEventListener("click",()=>{ 
  const totalPages = Math.ceil(filtered.length/perPage);
  if(currentPage<totalPages){currentPage++; render();}
});

searchInput.addEventListener("input",applyFilters);
regionSelect.addEventListener("change",applyFilters);

function showStatusLoading(msg){
  status.textContent=msg;
  grid.innerHTML="";
  for(let i=0;i<perPage;i++){
    const s = document.createElement("div");
    s.className="skeleton-card";
    grid.appendChild(s);
  }
}

function showStatusError(msg){
  status.textContent=msg;
  grid.innerHTML="";
}

// INIT
fetchCountries();
