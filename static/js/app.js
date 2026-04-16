/* ═══════════════════════════════════════════════════════════════
   VoyageAI — Main App Logic
   Navigation, state management, and core utilities
   ═══════════════════════════════════════════════════════════════ */

// ─── Global State ─────────────────────────────────────────────
const AppState = {
    currentUser: null,
    destinations: [],
    currentSection: 'dashboard',
    isGuest: false
};

// ─── DOM Ready ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initMobileMenu();
    initQuickActions();
    loadDestinations();
    checkAuthStatus();
});

// ─── Navigation ───────────────────────────────────────────────
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            navigateTo(section);
        });
    });
}

function navigateTo(sectionId) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionId);
    });

    // Update sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.toggle('active', section.id === `section-${sectionId}`);
    });

    AppState.currentSection = sectionId;

    // Trigger section-specific init
    if (sectionId === 'explore') {
        setTimeout(() => initMap(), 100);
    }

    // Close mobile menu
    document.getElementById('sidebar').classList.remove('open');
}

// ─── Mobile Menu ──────────────────────────────────────────────
function initMobileMenu() {
    const hamburger = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('sidebar');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 &&
            !e.target.closest('.sidebar') &&
            !e.target.closest('.hamburger')) {
            sidebar.classList.remove('open');
        }
    });
}

// ─── Quick Actions ────────────────────────────────────────────
function initQuickActions() {
    document.querySelectorAll('[data-goto]').forEach(el => {
        el.addEventListener('click', () => {
            navigateTo(el.dataset.goto);
        });
    });
}

// ─── Load Destinations ────────────────────────────────────────
async function loadDestinations() {
    try {
        const resp = await fetch('/api/destinations');
        AppState.destinations = await resp.json();
        populateDestinationSelectors();
        renderPopularDestinations();
        renderExploreList();
        document.getElementById('statDestinations').textContent = AppState.destinations.length;
    } catch (err) {
        console.error('Failed to load destinations:', err);
        showToast('Failed to load destinations', 'error');
    }
}

// ─── Populate Selectors ───────────────────────────────────────
function populateDestinationSelectors() {
    const selectors = [
        document.getElementById('planDestination'),
        document.getElementById('weatherCity')
    ];

    selectors.forEach(select => {
        if (!select) return;
        // Keep first option (placeholder)
        const placeholder = select.options[0];
        select.innerHTML = '';
        select.appendChild(placeholder);

        AppState.destinations.forEach(dest => {
            const option = document.createElement('option');
            option.value = dest.id;
            option.textContent = `${dest.name}, ${dest.state}`;
            select.appendChild(option);
        });
    });
}

// ─── Popular Destinations ─────────────────────────────────────
function renderPopularDestinations() {
    const container = document.getElementById('popularDestinations');
    if (!container) return;

    const sorted = [...AppState.destinations].sort((a, b) => b.rating - a.rating).slice(0, 8);

    container.innerHTML = sorted.map(dest => `
        <div class="dest-scroll-card" onclick="navigateTo('explore'); highlightDestination(${dest.id})">
            <img src="${dest.image}" alt="${dest.name}" class="dest-scroll-img" loading="lazy"
                 onerror="this.src='https://via.placeholder.com/280x160/1e293b/667eea?text=${encodeURIComponent(dest.name)}'">
            <div class="dest-scroll-info">
                <h3>${dest.name}</h3>
                <p class="dest-state">${dest.state}</p>
                <div class="dest-meta">
                    <span class="dest-rating">⭐ ${dest.rating}</span>
                    <span class="dest-price">₹${dest.costs.budget.stay + dest.costs.budget.food}/day</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ─── Saved Trips ──────────────────────────────────────────────
async function loadSavedTrips() {
    if (AppState.isGuest) {
        // Load from localStorage for guests
        const trips = JSON.parse(localStorage.getItem('voyageai_trips') || '[]');
        renderSavedTrips(trips);
        return;
    }

    try {
        const resp = await fetch('/api/trips');
        if (resp.ok) {
            const trips = await resp.json();
            renderSavedTrips(trips);
        }
    } catch (err) {
        console.error('Failed to load trips:', err);
    }
}

function renderSavedTrips(trips) {
    const grid = document.getElementById('savedTripsGrid');
    const noTrips = document.getElementById('noTripsMessage');
    const statTrips = document.getElementById('statTrips');

    if (statTrips) statTrips.textContent = trips.length;

    if (trips.length === 0) {
        grid.style.display = 'none';
        noTrips.style.display = 'block';
        return;
    }

    noTrips.style.display = 'none';
    grid.style.display = 'grid';

    grid.innerHTML = trips.map(trip => `
        <div class="trip-card">
            <div class="trip-card-header">
                <h3>📍 ${trip.destination}</h3>
                <span class="trip-badge ${trip.budget}">${trip.budget}</span>
            </div>
            <div class="trip-card-meta">
                <span>📅 ${trip.days} days</span>
                <span>💰 ₹${trip.totalBudget?.toLocaleString() || 'N/A'}</span>
                <span>📆 ${trip.createdAt ? new Date(trip.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div class="trip-card-actions">
                <button class="btn btn-ghost btn-sm" onclick="viewTrip(${trip.id})">View Details</button>
                <button class="btn btn-danger btn-sm" onclick="deleteTrip(${trip.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

async function deleteTrip(tripId) {
    if (AppState.isGuest) {
        let trips = JSON.parse(localStorage.getItem('voyageai_trips') || '[]');
        trips = trips.filter(t => t.id !== tripId);
        localStorage.setItem('voyageai_trips', JSON.stringify(trips));
        renderSavedTrips(trips);
        showToast('Trip deleted', 'info');
        return;
    }

    try {
        const resp = await fetch(`/api/trips/${tripId}`, { method: 'DELETE' });
        if (resp.ok) {
            showToast('Trip deleted', 'info');
            loadSavedTrips();
        }
    } catch (err) {
        showToast('Failed to delete trip', 'error');
    }
}

function viewTrip(tripId) {
    // Navigate to planner to view details
    navigateTo('planner');
    showToast('Trip details loaded in planner', 'info');
}

// ─── Auth Status ──────────────────────────────────────────────
async function checkAuthStatus() {
    try {
        const resp = await fetch('/api/me');
        if (resp.ok) {
            const user = await resp.json();
            AppState.currentUser = user;
            showApp(user);
        }
    } catch (err) {
        // Not logged in, show auth screen
    }
}

function showApp(user) {
    document.getElementById('authOverlay').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');

    if (user) {
        updateUserUI(user);
    }

    loadSavedTrips();
}

function updateUserUI(user) {
    const name = user.fullname || user.username || 'Guest';
    const initial = name.charAt(0).toUpperCase();

    document.getElementById('userName').textContent = name;
    document.getElementById('userAvatar').textContent = initial;
    document.getElementById('mobileUserAvatar').textContent = initial;
}

// ─── Toast Notifications ──────────────────────────────────────
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ─── Loading Overlay ──────────────────────────────────────────
function showLoading(message = 'Planning your adventure...') {
    const overlay = document.getElementById('loadingOverlay');
    overlay.querySelector('p').textContent = message;
    overlay.classList.add('active');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('active');
}

// ─── Utility: Get destination by ID ───────────────────────────
function getDestinationById(id) {
    return AppState.destinations.find(d => d.id === parseInt(id));
}

// ─── Utility: Format currency ─────────────────────────────────
function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN');
}

// ─── Highlight destination in explore ─────────────────────────
function highlightDestination(destId) {
    // This will be called from map.js when it's ready
    setTimeout(() => {
        if (typeof focusDestinationOnMap === 'function') {
            focusDestinationOnMap(destId);
        }
    }, 500);
}
