/* ═══════════════════════════════════════════════════════════════
   VoyageAI — Smart Itinerary Generator
   Auto-generates day-wise plans based on preferences
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    initItinerary();
});

function initItinerary() {
    // Interest tag toggles
    document.querySelectorAll('.interest-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            tag.classList.toggle('active');
        });
    });

    // Generate button
    document.getElementById('generateItinerary')?.addEventListener('click', generateSmartItinerary);
}

function generateSmartItinerary() {
    const destId = document.getElementById('planDestination').value;
    const days = parseInt(document.getElementById('planDays').value) || 3;
    const budgetTier = document.getElementById('planBudget').value;

    // Get selected interests
    const selectedInterests = [];
    document.querySelectorAll('.interest-tag.active').forEach(tag => {
        selectedInterests.push(tag.dataset.interest);
    });

    if (!destId) {
        showToast('Please select a destination', 'error');
        return;
    }

    if (selectedInterests.length === 0) {
        showToast('Please select at least one interest', 'error');
        return;
    }

    const destination = getDestinationById(destId);
    if (!destination) {
        showToast('Destination not found', 'error');
        return;
    }

    showLoading('🧠 AI is crafting your perfect itinerary...');

    // Simulate AI processing time
    setTimeout(() => {
        const itinerary = buildItinerary(destination, days, budgetTier, selectedInterests);
        renderItinerary(destination, itinerary, days, budgetTier);
        hideLoading();
        showToast('Itinerary generated successfully!', 'success');
    }, 1500);
}

function buildItinerary(destination, days, budgetTier, interests) {
    const attractions = [...destination.attractions];

    // Score and sort attractions based on user interests
    const scored = attractions.map(attr => {
        let score = 0;
        interests.forEach(interest => {
            if (attr.type === interest) score += 10;
            if (destination.categories.includes(interest) && attr.type === interest) score += 5;
        });
        // Add some randomness for variety
        score += Math.random() * 3;
        return { ...attr, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // Distribute attractions across days
    const itinerary = [];
    const slotsPerDay = { morning: [], afternoon: [], evening: [] };

    // Group by time preference
    const morningAttr = scored.filter(a => a.time === 'morning');
    const afternoonAttr = scored.filter(a => a.time === 'afternoon');
    const eveningAttr = scored.filter(a => a.time === 'evening');

    let mIdx = 0, aIdx = 0, eIdx = 0;

    for (let day = 1; day <= days; day++) {
        const dayPlan = {
            day: day,
            title: `Day ${day}`,
            activities: []
        };

        // Morning activity (1-2)
        if (mIdx < morningAttr.length) {
            dayPlan.activities.push({
                ...morningAttr[mIdx],
                slot: 'morning'
            });
            mIdx++;
        }

        // Sometimes add a second morning activity if duration allows
        if (mIdx < morningAttr.length && morningAttr[mIdx - 1]?.duration <= 3) {
            dayPlan.activities.push({
                ...morningAttr[mIdx],
                slot: 'morning'
            });
            mIdx++;
        }

        // Afternoon activity (1-2)
        if (aIdx < afternoonAttr.length) {
            dayPlan.activities.push({
                ...afternoonAttr[aIdx],
                slot: 'afternoon'
            });
            aIdx++;
        }

        if (aIdx < afternoonAttr.length && afternoonAttr[aIdx - 1]?.duration <= 2) {
            dayPlan.activities.push({
                ...afternoonAttr[aIdx],
                slot: 'afternoon'
            });
            aIdx++;
        }

        // Evening activity
        if (eIdx < eveningAttr.length) {
            dayPlan.activities.push({
                ...eveningAttr[eIdx],
                slot: 'evening'
            });
            eIdx++;
        }

        // If we run out of slotted activities, add from remaining scored list
        if (dayPlan.activities.length < 3) {
            const used = new Set(dayPlan.activities.map(a => a.name));
            const remaining = scored.filter(a => !used.has(a.name));
            while (dayPlan.activities.length < 4 && remaining.length > 0) {
                const next = remaining.shift();
                if (!dayPlan.activities.find(a => a.name === next.name)) {
                    dayPlan.activities.push({
                        ...next,
                        slot: next.time || 'afternoon'
                    });
                }
            }
        }

        // Generate day title based on activities
        const types = [...new Set(dayPlan.activities.map(a => a.type))];
        const typeLabels = {
            adventure: '🏔️ Adventure',
            culture: '🏛️ Culture',
            food: '🍛 Culinary',
            nature: '🌿 Nature',
            shopping: '🛍️ Shopping',
            spiritual: '🙏 Spiritual',
            beach: '🏖️ Beach',
            history: '📜 Heritage',
            photography: '📸 Photography',
            trekking: '🥾 Trekking',
            wellness: '🧘 Wellness',
            nightlife: '🎉 Nightlife'
        };

        dayPlan.title = `Day ${day} — ${types.slice(0, 2).map(t => typeLabels[t] || t).join(' & ')}`;

        itinerary.push(dayPlan);
    }

    return itinerary;
}

function renderItinerary(destination, itinerary, days, budgetTier) {
    const container = document.getElementById('itineraryResult');
    const dailyCost = destination.costs[budgetTier];
    const totalCost = (dailyCost.stay + dailyCost.food + dailyCost.transport + dailyCost.activities) * days;

    const tierLabels = {
        budget: '🎒 Backpacker',
        comfort: '🏨 Comfort',
        luxury: '👑 Luxury'
    };

    let html = `
        <div class="itinerary-header">
            <div>
                <h2>📍 ${destination.name} — ${days}-Day Itinerary</h2>
                <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 4px;">
                    ${tierLabels[budgetTier]} • ${destination.state} • Best time: ${destination.bestTime}
                </p>
            </div>
            <div class="itinerary-actions">
                <button class="btn btn-primary" onclick="saveCurrentItinerary()">
                    💾 Save Trip
                </button>
                <button class="btn btn-ghost" onclick="window.print()">
                    🖨️ Print
                </button>
            </div>
        </div>
    `;

    // Day cards
    itinerary.forEach(day => {
        html += `
            <div class="day-card">
                <div class="day-header">
                    <div class="day-number">${day.day}</div>
                    <h3>${day.title}</h3>
                    <span class="day-cost">${formatCurrency(dailyCost.stay + dailyCost.food + dailyCost.transport + dailyCost.activities)}/day</span>
                </div>
                <div class="day-activities">
                    ${day.activities.map(act => `
                        <div class="activity-item">
                            <div class="activity-time">
                                <span class="time-label">${act.slot}</span>
                            </div>
                            <div class="activity-info">
                                <h4>${act.name}</h4>
                                <span class="activity-type">${getTypeEmoji(act.type)} ${act.type}</span>
                            </div>
                            <div class="activity-duration">🕐 ${act.duration}h</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });

    // Summary card
    html += `
        <div class="itinerary-summary">
            <h3 style="margin-bottom: 16px;">📊 Trip Summary</h3>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-value">${formatCurrency(totalCost)}</div>
                    <div class="summary-label">Estimated Total Cost</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${formatCurrency(Math.round(totalCost / days))}</div>
                    <div class="summary-label">Per Day Average</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${itinerary.reduce((sum, d) => sum + d.activities.length, 0)}</div>
                    <div class="summary-label">Total Activities</div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    // Store current itinerary for saving
    window._currentItinerary = {
        destination: destination.name,
        days: days,
        budget: budgetTier,
        interests: [...document.querySelectorAll('.interest-tag.active')].map(t => t.dataset.interest),
        itinerary: itinerary,
        totalBudget: totalCost,
        createdAt: new Date().toISOString()
    };
}

function getTypeEmoji(type) {
    const emojis = {
        adventure: '🏔️', culture: '🏛️', food: '🍛', nature: '🌿',
        shopping: '🛍️', spiritual: '🙏', beach: '🏖️', history: '📜',
        photography: '📸', trekking: '🥾', wellness: '🧘', nightlife: '🎉'
    };
    return emojis[type] || '📍';
}

async function saveCurrentItinerary() {
    if (!window._currentItinerary) {
        showToast('No itinerary to save', 'error');
        return;
    }

    if (AppState.isGuest) {
        // Save to localStorage
        const trips = JSON.parse(localStorage.getItem('voyageai_trips') || '[]');
        const trip = {
            ...window._currentItinerary,
            id: Date.now()
        };
        trips.push(trip);
        localStorage.setItem('voyageai_trips', JSON.stringify(trips));
        showToast('Trip saved locally! (Guest mode)', 'success');
        loadSavedTrips();
        return;
    }

    try {
        const resp = await fetch('/api/trips', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(window._currentItinerary)
        });

        if (resp.ok) {
            showToast('Trip saved to your profile!', 'success');
            loadSavedTrips();
        } else {
            showToast('Failed to save trip. Please login.', 'error');
        }
    } catch (err) {
        showToast('Failed to save trip', 'error');
    }
}
