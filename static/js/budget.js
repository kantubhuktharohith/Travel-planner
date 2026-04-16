/* ═══════════════════════════════════════════════════════════════
   VoyageAI — Budget Optimizer & Expense Tracker
   Budget analysis, cost breakdown, and expense management
   ═══════════════════════════════════════════════════════════════ */

let budgetChart = null;
let expenseChart = null;
const expenses = [];

document.addEventListener('DOMContentLoaded', () => {
    initBudget();
});

function initBudget() {
    document.getElementById('findByBudget')?.addEventListener('click', findDestinationsByBudget);
    document.getElementById('addExpense')?.addEventListener('click', addExpenseItem);

    // Allow Enter key for expense
    document.getElementById('expenseAmount')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addExpenseItem();
    });
}

// ─── Budget Optimizer ─────────────────────────────────────────
function findDestinationsByBudget() {
    const totalBudget = parseInt(document.getElementById('totalBudgetInput').value);
    const days = parseInt(document.getElementById('budgetDaysInput').value) || 3;

    if (!totalBudget || totalBudget < 1000) {
        showToast('Please enter a valid budget (min ₹1,000)', 'error');
        return;
    }

    const container = document.getElementById('budgetSuggestions');
    const results = [];

    AppState.destinations.forEach(dest => {
        // Calculate costs for each tier
        ['budget', 'comfort', 'luxury'].forEach(tier => {
            const costs = dest.costs[tier];
            const dailyTotal = costs.stay + costs.food + costs.transport + costs.activities;
            const tripTotal = dailyTotal * days;

            results.push({
                id: dest.id,
                name: dest.name,
                state: dest.state,
                tier: tier,
                dailyCost: dailyTotal,
                totalCost: tripTotal,
                affordable: tripTotal <= totalBudget,
                savings: totalBudget - tripTotal,
                rating: dest.rating,
                costs: costs
            });
        });
    });

    // Sort: affordable first, then by best value (highest rating per rupee)
    results.sort((a, b) => {
        if (a.affordable !== b.affordable) return b.affordable - a.affordable;
        if (a.affordable) {
            return (b.rating / b.totalCost) - (a.rating / a.totalCost);
        }
        return a.totalCost - b.totalCost;
    });

    // Show top 12 suggestions (4 per tier approximately)
    const top = results.slice(0, 15);

    container.innerHTML = top.map((r, i) => {
        const tierEmoji = { budget: '🎒', comfort: '🏨', luxury: '👑' };
        return `
            <div class="budget-dest-card ${r.affordable ? '' : 'too-expensive'}"
                 onclick="showBudgetBreakdown(${r.id}, '${r.tier}', ${days})">
                <div class="budget-dest-rank">${i + 1}</div>
                <div class="budget-dest-info">
                    <h4>${r.name}</h4>
                    <p>${r.state} • ${tierEmoji[r.tier]} ${r.tier}${r.affordable ? ` • Saves ${formatCurrency(r.savings)}` : ' • Over budget'}</p>
                </div>
                <div class="budget-dest-cost ${r.affordable ? 'affordable' : 'over-budget'}">
                    <div class="cost-value">${formatCurrency(r.totalCost)}</div>
                    <div class="cost-label">${days} days total</div>
                </div>
            </div>
        `;
    }).join('');

    // Show the first affordable one's breakdown
    const firstAffordable = top.find(r => r.affordable);
    if (firstAffordable) {
        showBudgetBreakdown(firstAffordable.id, firstAffordable.tier, days);
    }

    showToast(`Found ${top.filter(r => r.affordable).length} options within your budget!`, 'success');
}

function showBudgetBreakdown(destId, tier, days) {
    const dest = getDestinationById(destId);
    if (!dest) return;

    const costs = dest.costs[tier];
    const categories = [
        { name: 'Stay', value: costs.stay * days, color: '#667eea', emoji: '🏨' },
        { name: 'Food', value: costs.food * days, color: '#f59e0b', emoji: '🍛' },
        { name: 'Transport', value: costs.transport * days, color: '#10b981', emoji: '🚗' },
        { name: 'Activities', value: costs.activities * days, color: '#f093fb', emoji: '🎯' }
    ];

    const total = categories.reduce((sum, c) => sum + c.value, 0);

    // Update breakdown list
    const list = document.getElementById('budgetBreakdownList');
    list.innerHTML = `
        <h4 style="margin-bottom: 12px; color: var(--text-primary);">
            ${dest.name} — ${tier.charAt(0).toUpperCase() + tier.slice(1)} (${days} days)
        </h4>
        ${categories.map(c => `
            <div class="breakdown-item">
                <span class="category">
                    <span class="breakdown-dot" style="background: ${c.color}"></span>
                    ${c.emoji} ${c.name}
                </span>
                <span style="font-weight: 600">${formatCurrency(c.value)}</span>
            </div>
        `).join('')}
        <div class="breakdown-item" style="border-top: 2px solid var(--border-light); font-weight: 700; padding-top: 12px; margin-top: 4px;">
            <span>Total Estimated Cost</span>
            <span style="color: var(--accent-1); font-size: 1.1rem;">${formatCurrency(total)}</span>
        </div>
    `;

    // Update chart
    renderBudgetChart(categories);
}

function renderBudgetChart(categories) {
    const ctx = document.getElementById('budgetChart');
    if (!ctx) return;

    if (budgetChart) budgetChart.destroy();

    budgetChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories.map(c => c.name),
            datasets: [{
                data: categories.map(c => c.value),
                backgroundColor: categories.map(c => c.color),
                borderWidth: 0,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#94a3b8',
                        font: { family: 'Inter', size: 12 },
                        padding: 16,
                        usePointStyle: true,
                        pointStyleWidth: 10
                    }
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#f1f5f9',
                    bodyColor: '#94a3b8',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    callbacks: {
                        label: (ctx) => ` ${ctx.label}: ₹${ctx.raw.toLocaleString('en-IN')}`
                    }
                }
            }
        }
    });
}

// ─── Expense Tracker ──────────────────────────────────────────
function addExpenseItem() {
    const name = document.getElementById('expenseName').value.trim();
    const category = document.getElementById('expenseCategory').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);

    if (!name) {
        showToast('Please enter an expense description', 'error');
        return;
    }

    if (!amount || amount <= 0) {
        showToast('Please enter a valid amount', 'error');
        return;
    }

    const categoryEmojis = {
        food: '🍛', stay: '🏨', transport: '🚗',
        activities: '🎯', shopping: '🛍️', misc: '📦'
    };

    expenses.push({
        id: Date.now(),
        name: name,
        category: category,
        emoji: categoryEmojis[category],
        amount: amount
    });

    // Clear inputs
    document.getElementById('expenseName').value = '';
    document.getElementById('expenseAmount').value = '';

    renderExpenses();
    showToast(`Added: ${name} - ${formatCurrency(amount)}`, 'success');
}

function removeExpense(id) {
    const idx = expenses.findIndex(e => e.id === id);
    if (idx > -1) {
        expenses.splice(idx, 1);
        renderExpenses();
    }
}

function renderExpenses() {
    const list = document.getElementById('expenseList');
    const totalEl = document.getElementById('expenseTotal');

    if (expenses.length === 0) {
        list.innerHTML = '<div class="empty-state small"><p>No expenses tracked yet</p></div>';
        totalEl.querySelector('.total-amount').textContent = '₹0';
        if (expenseChart) { expenseChart.destroy(); expenseChart = null; }
        return;
    }

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    list.innerHTML = expenses.map(e => `
        <div class="expense-item">
            <span class="expense-cat-icon">${e.emoji}</span>
            <span class="expense-item-name">${e.name}</span>
            <span class="expense-item-amount">${formatCurrency(e.amount)}</span>
            <button class="expense-item-remove" onclick="removeExpense(${e.id})" title="Remove">✕</button>
        </div>
    `).join('');

    totalEl.querySelector('.total-amount').textContent = formatCurrency(total);

    // Update expense chart
    renderExpenseChart();
}

function renderExpenseChart() {
    const ctx = document.getElementById('expenseChart');
    if (!ctx) return;

    // Group by category
    const grouped = {};
    expenses.forEach(e => {
        if (!grouped[e.category]) grouped[e.category] = 0;
        grouped[e.category] += e.amount;
    });

    const categoryColors = {
        food: '#f59e0b', stay: '#667eea', transport: '#10b981',
        activities: '#f093fb', shopping: '#4facfe', misc: '#94a3b8'
    };

    const labels = Object.keys(grouped);
    const values = Object.values(grouped);
    const colors = labels.map(l => categoryColors[l] || '#667eea');

    if (expenseChart) expenseChart.destroy();

    expenseChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
            datasets: [{
                data: values,
                backgroundColor: colors.map(c => c + '80'),
                borderColor: colors,
                borderWidth: 1,
                borderRadius: 6,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#f1f5f9',
                    bodyColor: '#94a3b8',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    callbacks: {
                        label: (ctx) => `₹${ctx.raw.toLocaleString('en-IN')}`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#64748b', font: { size: 11 } }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: {
                        color: '#64748b',
                        font: { size: 11 },
                        callback: v => '₹' + v.toLocaleString()
                    }
                }
            }
        }
    });
}
