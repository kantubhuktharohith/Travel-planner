/* ═══════════════════════════════════════════════════════════════
   VoyageAI — Interactive Map Module
   LeafletJS map with destination markers, popups, and search
   ═══════════════════════════════════════════════════════════════ */

let map = null;
let markers = [];
let markerGroup = null;
let mapInitialized = false;

function initMap() {
    if (mapInitialized && map) {
        map.invalidateSize();
        return;
    }

    const mapEl = document.getElementById('leafletMap');
    if (!mapEl) return;

    // Initialize map centered on India
    map = L.map('leafletMap', {
        zoomControl: true,
        scrollWheelZoom: true
    }).setView([22.5, 78.5], 5);

    // Dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    markerGroup = L.layerGroup().addTo(map);

    // Add destination markers
    addDestinationMarkers();

    // Initialize search & filter
    initExploreSearch();
    initExploreFilters();

    mapInitialized = true;
}

function addDestinationMarkers() {
    if (!markerGroup) return;

    markerGroup.clearLayers();
    markers = [];

    AppState.destinations.forEach(dest => {
        // Custom icon
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="
                width: 32px;
                height: 32px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 10px rgba(102,126,234,0.4);
                border: 2px solid rgba(255,255,255,0.3);
            "><span style="transform: rotate(45deg); font-size: 14px;">📍</span></div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });

        const marker = L.marker([dest.lat, dest.lng], { icon })
            .bindPopup(createPopupContent(dest), {
                maxWidth: 280,
                className: 'custom-popup'
            });

        marker.destId = dest.id;

        marker.on('click', () => {
            highlightDestCard(dest.id);
        });

        markers.push(marker);
        markerGroup.addLayer(marker);
    });
}

function createPopupContent(dest) {
    const dailyCost = dest.costs.budget.stay + dest.costs.budget.food + dest.costs.budget.transport + dest.costs.budget.activities;

    return `
        <div class="map-popup">
            <h3>${dest.name}</h3>
            <p>${dest.description.substring(0, 100)}...</p>
            <div class="popup-meta">
                <span>⭐ ${dest.rating}</span>
                <span>💰 From ₹${dailyCost}/day</span>
                <span>📍 ${dest.state}</span>
            </div>
            <button class="popup-btn" onclick="navigateTo('planner'); document.getElementById('planDestination').value=${dest.id};">
                Plan Trip →
            </button>
        </div>
    `;
}

// ─── Explore Search ───────────────────────────────────────────
function initExploreSearch() {
    const searchInput = document.getElementById('searchDestinations');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        filterDestinations(query, getActiveFilter());
    });
}

function initExploreFilters() {
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
            tag.classList.add('active');

            const query = document.getElementById('searchDestinations')?.value.toLowerCase().trim() || '';
            filterDestinations(query, tag.dataset.filter);
        });
    });
}

function getActiveFilter() {
    const active = document.querySelector('.filter-tag.active');
    return active ? active.dataset.filter : 'all';
}

function filterDestinations(query, category) {
    const filtered = AppState.destinations.filter(dest => {
        const matchesSearch = !query ||
            dest.name.toLowerCase().includes(query) ||
            dest.state.toLowerCase().includes(query) ||
            dest.description.toLowerCase().includes(query);

        const matchesCategory = category === 'all' ||
            dest.categories.includes(category);

        return matchesSearch && matchesCategory;
    });

    renderExploreList(filtered);
    updateMapMarkers(filtered);
}

function renderExploreList(destinations = null) {
    const list = document.getElementById('destinationList');
    if (!list) return;

    const dests = destinations || AppState.destinations;

    list.innerHTML = dests.map(dest => `
        <div class="dest-list-card" data-dest-id="${dest.id}" onclick="focusDestinationOnMap(${dest.id})">
            <img src="${dest.image}" alt="${dest.name}" class="dest-list-img" loading="lazy"
                 onerror="this.src='https://via.placeholder.com/64x64/1e293b/667eea?text=${dest.name.charAt(0)}'">
            <div class="dest-list-info">
                <h4>${dest.name}</h4>
                <p class="dest-list-state">📍 ${dest.state} &nbsp;•&nbsp; ⭐ ${dest.rating}</p>
                <div class="dest-list-tags">
                    ${dest.categories.slice(0, 3).map(c => `<span>${c}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

function updateMapMarkers(filtered) {
    if (!markerGroup) return;

    const filteredIds = new Set(filtered.map(d => d.id));

    markers.forEach(marker => {
        if (filteredIds.has(marker.destId)) {
            if (!markerGroup.hasLayer(marker)) {
                markerGroup.addLayer(marker);
            }
        } else {
            markerGroup.removeLayer(marker);
        }
    });

    // Fit bounds to visible markers
    if (filtered.length > 0) {
        const bounds = L.latLngBounds(filtered.map(d => [d.lat, d.lng]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
    }
}

// ─── Focus on a Destination ───────────────────────────────────
function focusDestinationOnMap(destId) {
    const dest = getDestinationById(destId);
    if (!dest || !map) return;

    map.flyTo([dest.lat, dest.lng], 10, {
        duration: 1
    });

    // Open popup
    const marker = markers.find(m => m.destId === destId);
    if (marker) {
        marker.openPopup();
    }

    // Highlight in list
    highlightDestCard(destId);
}

function highlightDestCard(destId) {
    document.querySelectorAll('.dest-list-card').forEach(card => {
        card.classList.toggle('active', parseInt(card.dataset.destId) === destId);
    });

    // Scroll card into view
    const activeCard = document.querySelector(`.dest-list-card[data-dest-id="${destId}"]`);
    if (activeCard) {
        activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}
