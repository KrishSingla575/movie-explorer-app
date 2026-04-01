const API_KEY = 'e9994db';
const BASE = 'https://www.omdbapi.com/';

function makePlaceholder(title) {
const initials = (title||'?').split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase()||'?';
const colors = ['c084fc','818cf8','38bdf8','fb923c','34d399'];
const c = colors[(title||'X').charCodeAt(0) % colors.length];
return `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='240'><rect width='160' height='240' fill='%23151524'/><rect x='16' y='16' width='128' height='208' rx='8' fill='%231c1c2e'/><text x='80' y='120' font-family='sans-serif' font-size='36' font-weight='700' fill='%23${c}' text-anchor='middle' dominant-baseline='middle'>${initials}</text><text x='80' y='160' font-family='sans-serif' font-size='10' fill='%236b6990' text-anchor='middle'>NO POSTER</text></svg>`;
}

function proxyImg(url, title) {
if (!url || url === 'N/A') return makePlaceholder(title||'');
return url;
}

let currentPage = 1;
let currentSearch = 'action';
let totalPages = 1;
let allMovies = [];
let filteredMovies = [];
let searchTimeout = null;

const trendingIds = [
'tt15398776', // Oppenheimer
'tt1630029',  // Avatar 2
'tt10366460', // John Wick 4
'tt6791350',  // Guardians 3
'tt9603212',  // Migration
'tt11304740', // Dune Part Two
'tt0111161',  // Shawshank Redemption
'tt0068646',  // The Godfather
'tt5681572',  // Barbie
'tt0816692',  // Interstellar
'tt1345836',  // The Dark Knight Rises
'tt0087843',  // Back to the Future
];

function showGridLoader() {
document.getElementById('movieGrid').innerHTML = Array(8).fill(0).map((_, i) => `
    <div class="movie-card" style="animation-delay:${i*0.05}s;pointer-events:none">
    <div style="width:100%;aspect-ratio:2/3;background:var(--bg4);border-radius:8px 8px 0 0;animation:pulse 1.4s ease-in-out infinite alternate"></div>
    <div class="movie-card-body">
        <div style="height:13px;background:var(--bg4);border-radius:4px;margin-bottom:6px;animation:pulse 1.4s ease-in-out infinite alternate"></div>
        <div style="height:11px;width:60%;background:var(--bg4);border-radius:4px;animation:pulse 1.4s ease-in-out infinite alternate"></div>
    </div>
    </div>`).join('');
}

function showTrendingLoader() {
document.getElementById('trendingRow').innerHTML = Array(12).fill(0).map(() => `
    <div class="trending-card" style="pointer-events:none;width:120px">
    <div style="width:120px;height:170px;background:var(--bg4);animation:pulse 1.4s ease-in-out infinite alternate"></div>
    </div>`).join('');
}

async function fetchSearch(query, page = 1) {
try {
    const res = await fetch(`${BASE}?s=${encodeURIComponent(query)}&page=${page}&apikey=${API_KEY}`);
    const data = await res.json();
    return data;
} catch (err) {
    console.error('Fetch error:', err);
    return { Response: 'False', Error: 'Network error - check your connection' };
}
}

async function fetchById(imdbId) {
try {
    const res = await fetch(`${BASE}?i=${imdbId}&plot=full&apikey=${API_KEY}`);
    const data = await res.json();
    return data;
} catch (err) {
    console.error('Fetch error:', err);
    return { Response: 'False', Error: 'Network error' };
}
}

async function loadTrending() {
showTrendingLoader();
const results = await Promise.all(trendingIds.map(id => fetchById(id)));
const valid = results.filter(m => m.Response === 'True');

if (valid.length === 0 && results.length > 0 && results[0].Error) {
    document.getElementById('trendingRow').innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:24px;color:var(--text3);background:var(--bg3);border-radius:8px;border:1px solid rgba(248,113,113,0.2)">
        <div style="font-size:32px;margin-bottom:8px">⚠️</div>
        <strong style="color:var(--danger)">API Key Invalid</strong><br>
        <span style="font-size:12px">Get one free at omdbapi.com and update the API_KEY in the script</span>
    </div>`;
    return;
}

document.getElementById('trendingRow').innerHTML = valid
    .map((m, i) => `
    <div class="trending-card" onclick="openDetailById('${m.imdbID}')">
        <img src="${proxyImg(m.Poster, m.Title)}" alt="${m.Title}" loading="lazy" onerror="this.src=makePlaceholder('${m.Title.replace(/'/g,"\\'")}')">
        <div class="overlay"></div>
        <div class="trending-num">${i + 1}</div>
    </div>`).join('');
}

async function loadMovies(query, page = 1) {
showGridLoader();
currentSearch = query;
const randomPage = page === 1 ? Math.floor(Math.random() * 4) + 1 : page;
currentPage = randomPage;
const data = await fetchSearch(query, randomPage);
if (data.Response === 'True') {
    allMovies = data.Search;
    filteredMovies = [...allMovies];
    totalPages = Math.ceil(parseInt(data.totalResults) / 10);
    document.getElementById('pageInfo').textContent = `${randomPage} / ${Math.min(totalPages, 100)}`;
    document.getElementById('pageNum').textContent = randomPage;
    renderGrid();
} else if (data.Error && data.Error.includes('API key')) {
    document.getElementById('movieGrid').innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:48px 24px;color:var(--text3);background:var(--bg3);border-radius:8px;border:1px solid rgba(248,113,113,0.2)">
        <div style="font-size:48px;margin-bottom:16px">🔑</div>
        <div style="color:var(--danger);font-weight:600;font-size:16px;margin-bottom:8px">Invalid API Key</div>
        <div style="margin-bottom:16px">Your OMDb API key is not valid or has expired.</div>
        <div style="background:var(--bg4);padding:12px 16px;border-radius:6px;border:1px solid var(--border);text-align:left;font-family:monospace;font-size:12px;margin:12px 0">
        const API_KEY = '${API_KEY}';
        </div>
        <div style="font-size:12px;margin-top:12px">
        ✓ <a href="https://www.omdbapi.com/apikey.aspx" target="_blank" style="color:var(--accent);text-decoration:none">Get a free OMDb API key</a><br>
        ✓ Update the API_KEY in this HTML file<br>
        ✓ Refresh your browser
        </div>
    </div>`;
} else {
    document.getElementById('movieGrid').innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:48px 24px;color:var(--text3)">
        <div style="font-size:40px;margin-bottom:12px">🎬</div>
        No results found for <strong style="color:var(--text2)">"${query}"</strong>
    </div>`;
}
}

function renderGrid() {
// Shuffle movies for variety
const shuffled = [...filteredMovies].sort(() => Math.random() - 0.5);
document.getElementById('movieGrid').innerHTML = shuffled.map((m, i) => `
    <div class="movie-card" style="animation-delay:${i * 0.04}s" onclick="openDetailById('${m.imdbID}')">
    ${m.Type === 'series' ? '<div class="badge">TV</div>' : ''}
    <img src="${proxyImg(m.Poster, m.Title)}" alt="${m.Title}" loading="lazy" onerror="this.src=makePlaceholder('${m.Title.replace(/'/g,"\\'").replace(/"/g,"&quot;")}')">
    <div class="movie-card-body">
        <div class="movie-card-title">${m.Title}</div>
        <div class="movie-card-meta">
        <span style="color:var(--gold)">⭐</span>
        <span class="dot-sep">·</span>
        <span>${m.Year}</span>
        <span class="dot-sep">·</span>
        <span style="text-transform:capitalize">${m.Type}</span>
        </div>
    </div>
    </div>`).join('');
}

async function openDetailById(imdbId) {
const panel = document.getElementById('detailPanel');
panel.classList.remove('hidden');

document.getElementById('detailTitle').textContent = 'Loading…';
document.getElementById('detailMeta').innerHTML = '<span style="color:var(--text3);font-size:12px">Fetching details…</span>';
document.getElementById('detailImages').innerHTML = `
    <div style="grid-column:1/-1;height:200px;background:var(--bg4);border-radius:8px;animation:pulse 1.4s ease-in-out infinite alternate"></div>`;
document.getElementById('detailTags').innerHTML = '';
document.getElementById('detailTable').innerHTML = '';

const m = await fetchById(imdbId);
if (m.Response !== 'True') return;

const poster = proxyImg(m.Poster, m.Title);
const rating = m.imdbRating !== 'N/A' ? m.imdbRating : '—';
const votes  = m.imdbVotes  !== 'N/A' ? `(${m.imdbVotes})` : '';

document.getElementById('detailTitle').textContent = m.Title;
document.getElementById('detailMeta').innerHTML = `
    <span>${m.Year}</span>
    ${m.Rated   !== 'N/A' ? `· <span>${m.Rated}</span>`   : ''}
    ${m.Runtime !== 'N/A' ? `· <span>${m.Runtime}</span>` : ''}
    <div style="margin-left:auto">
    <div class="detail-rating">⭐ ${rating}/10
        ${votes ? `<span style="font-size:10px;color:var(--text3);font-weight:400">${votes}</span>` : ''}
    </div>
    </div>`;

document.getElementById('detailImages').innerHTML = `
    <div style="display:flex;gap:14px;align-items:flex-start">
    <img src="${poster}" alt="${m.Title}"
            loading="lazy"
            onerror="this.src=makePlaceholder('${m.Title.replace(/'/g,"\\'")}')"
            style="width:115px;min-width:115px;border-radius:10px;border:1px solid var(--border2);object-fit:cover;aspect-ratio:2/3;background:var(--bg4)">
    <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:10px">
        ${m.imdbRating !== 'N/A' ? `
        <div style="display:flex;align-items:baseline;gap:4px">
        <span style="font-family:var(--font-head);font-size:26px;font-weight:800;color:var(--gold);line-height:1">${m.imdbRating}</span>
        <span style="font-size:11px;color:var(--text3)">/10 IMDb</span>
        </div>` : ''}
        ${m.Metascore && m.Metascore !== 'N/A' ? `
        <div style="display:inline-flex;align-items:center;gap:5px;background:rgba(56,189,248,0.1);border:1px solid rgba(56,189,248,0.2);border-radius:6px;padding:3px 9px;font-size:11px;color:var(--accent3);width:fit-content">
        Metascore &nbsp;<strong>${m.Metascore}</strong>
        </div>` : ''}
        ${m.Awards && m.Awards !== 'N/A' ? `
        <div style="font-size:11px;color:var(--text3);line-height:1.5">🏆 ${m.Awards}</div>` : ''}
        ${m.Genre && m.Genre !== 'N/A' ? `
        <div style="font-size:11px;color:var(--text3)">${m.Genre}</div>` : ''}
    </div>
    </div>
    ${m.Plot && m.Plot !== 'N/A' ? `
    <div style="background:var(--bg4);border-radius:10px;padding:12px 14px;border:1px solid var(--border)">
    <div style="font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);margin-bottom:7px">Plot</div>
    <p style="font-size:13px;line-height:1.65;color:var(--text2);margin:0">${m.Plot}</p>
    </div>` : ''}`;

const genres = m.Genre !== 'N/A' ? m.Genre.split(', ') : ['Unknown'];
document.getElementById('detailTags').innerHTML = genres
    .map((g, j) => `<div class="detail-tag ${j===0?'active':''}" onclick="this.classList.toggle('active')">${g}</div>`)
    .join('');

document.getElementById('visitBtn').onclick = () =>
    window.open(`https://www.imdb.com/title/${m.imdbID}/`, '_blank');

const rows = [
    ['Director', m.Director],
    ['Cast',     m.Actors],
    ['Writer',   m.Writer],
    ['Released', m.Released],
    ['Country',  m.Country],
    ['Language', m.Language],
    ['Box Office', m.BoxOffice],
].filter(([, v]) => v && v !== 'N/A');

document.getElementById('detailTable').innerHTML = rows.map(([k, v]) => `
    <div class="row">
    <div class="key">${k}</div>
    <div class="val">${v}</div>
    </div>`).join('');
}

function closeDetail() {
document.getElementById('detailPanel').classList.add('hidden');
}

function handleSearch(val) {
clearTimeout(searchTimeout);
const q = val.trim();
if (!q) {
    document.getElementById('gridTitle').textContent = 'Popular';
    loadMovies('action', 1);
    return;
}
searchTimeout = setTimeout(() => {
    document.getElementById('gridTitle').textContent = `Results for "${q}"`;
    loadMovies(q, 1);
}, 300);
}

function handleSearchKeypress(e) {
if (e.key === 'Enter') {
    clearTimeout(searchTimeout);
    handleSearch(e.target.value);
}
}

function changePage(dir) {
const max = Math.min(totalPages, 100);
currentPage = Math.max(1, Math.min(max, currentPage + dir));
loadMovies(currentSearch, currentPage);
document.querySelector('.content-main').scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleGenre(el) {
document.querySelectorAll('.genre-chip').forEach(c => c.classList.remove('active'));
el.classList.add('active');
document.getElementById('gridTitle').textContent = el.textContent + ' Movies';
loadMovies(el.textContent.toLowerCase(), 1);
}

function setNav(el) {
document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
el.classList.add('active');
const label = el.textContent.trim();
const termMap = { 
    'Home': 'film', 
    'Top Rated': 'godfather', 
    'New Releases': 'oppenheimer', 
    'TV Series': 'stranger things',
    'Watchlist': 'fight club',
    'Watched': 'romance',
    'Recommendations': 'horror'
};
document.getElementById('gridTitle').textContent = label;
document.getElementById('searchInput').value = '';
loadMovies(termMap[label] || 'film', 1);
}

const style = document.createElement('style');
style.textContent = '@keyframes pulse { from{opacity:.4} to{opacity:.8} }';
document.head.appendChild(style);

loadTrending();
loadMovies('action', 1);
