import {
  getAllTimezones,
  getLocalTimeZone,
  friendlyName,
  regionOf,
  getTimeInfo,
  formatDiffFromLocal,
  searchTimezones,
} from './logic.js';

const els = {
  use24Hour: document.getElementById('use24Hour'),
  searchInput: document.getElementById('searchInput'),
  searchResults: document.getElementById('searchResults'),
  cardGrid: document.getElementById('cardGrid'),
  emptyNote: document.getElementById('emptyNote'),
};

const LOCAL_TZ = getLocalTimeZone();
const ALL_ZONES = getAllTimezones();

let cities = [];
let use24Hour = false;

function saveCities() {
  window.worldTimeAPI.set({ worldClockCities: cities });
}

function addCity(tz) {
  if (tz === LOCAL_TZ || cities.includes(tz)) return;
  cities = [...cities, tz];
  saveCities();
  renderCards();
}

function removeCity(tz) {
  cities = cities.filter((c) => c !== tz);
  saveCities();
  renderCards();
}

function buildCard(tz, isLocal) {
  const now = new Date();
  const info = getTimeInfo(tz, now, use24Hour);
  const localInfo = getTimeInfo(LOCAL_TZ, now, use24Hour);

  const card = document.createElement('div');
  card.className = `card${info.isDaytime ? '' : ' night'}${isLocal ? ' pinned-local' : ''}`;

  if (!isLocal) {
    const removeBtn = document.createElement('button');
    removeBtn.className = 'card-remove';
    removeBtn.textContent = '✕';
    removeBtn.title = 'Remove';
    removeBtn.addEventListener('click', () => removeCity(tz));
    card.appendChild(removeBtn);
  }

  const header = document.createElement('div');
  header.className = 'card-header';
  const name = document.createElement('span');
  name.className = 'card-name';
  name.textContent = isLocal ? 'Local Time' : friendlyName(tz);
  const region = document.createElement('span');
  region.className = 'card-region';
  region.textContent = isLocal ? friendlyName(tz) : regionOf(tz);
  header.append(name, region);

  const time = document.createElement('div');
  time.className = 'card-time';
  const dayNight = document.createElement('span');
  dayNight.className = 'card-daynight';
  dayNight.textContent = info.isDaytime ? '☀️' : '🌙';
  time.append(document.createTextNode(info.time + ' '), dayNight);

  const date = document.createElement('div');
  date.className = 'card-date';
  date.textContent = info.date;

  const offsetRow = document.createElement('div');
  offsetRow.className = 'card-offset';
  const offsetLabel = document.createElement('span');
  offsetLabel.textContent = info.offsetLabel;
  const diff = document.createElement('span');
  diff.className = 'card-diff';
  diff.textContent = isLocal ? '' : formatDiffFromLocal(info.offsetMinutes, localInfo.offsetMinutes);
  offsetRow.append(offsetLabel, diff);

  card.append(header, time, date, offsetRow);
  return card;
}

function renderCards() {
  els.cardGrid.innerHTML = '';
  els.cardGrid.appendChild(buildCard(LOCAL_TZ, true));
  for (const tz of cities) {
    els.cardGrid.appendChild(buildCard(tz, false));
  }
  els.emptyNote.hidden = cities.length > 0;
}

function renderSearchResults(query) {
  els.searchResults.innerHTML = '';
  const results = searchTimezones(query, ALL_ZONES).filter(
    (tz) => tz !== LOCAL_TZ && !cities.includes(tz)
  );
  for (const tz of results) {
    const item = document.createElement('div');
    item.className = 'search-result-item';
    const name = document.createElement('span');
    name.className = 'sr-name';
    name.textContent = friendlyName(tz);
    const zone = document.createElement('span');
    zone.className = 'sr-zone';
    zone.textContent = tz;
    item.append(name, zone);
    item.addEventListener('click', () => {
      addCity(tz);
      els.searchInput.value = '';
      els.searchResults.innerHTML = '';
    });
    els.searchResults.appendChild(item);
  }
}

els.searchInput.addEventListener('input', () => {
  renderSearchResults(els.searchInput.value);
});

document.addEventListener('click', (e) => {
  if (!els.searchResults.contains(e.target) && e.target !== els.searchInput) {
    els.searchResults.innerHTML = '';
  }
});

els.use24Hour.addEventListener('change', () => {
  use24Hour = els.use24Hour.checked;
  window.worldTimeAPI.set({ worldClockUse24Hour: use24Hour });
  renderCards();
});

window.worldTimeAPI.get().then((settings) => {
  cities = Array.isArray(settings.worldClockCities) ? settings.worldClockCities : [];
  use24Hour = !!settings.worldClockUse24Hour;
  els.use24Hour.checked = use24Hour;
  renderCards();
});

setInterval(renderCards, 1000);
