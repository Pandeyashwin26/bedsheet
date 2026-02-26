// Historical and current mandi prices for major crops across India
// Data modeled from real AGMARKNET patterns

const mandiPrices = {
    tomato: [
        {
            mandi: "Nashik", state: "Maharashtra", district: "Nashik", prices: [
                { date: "2026-02-20", price: 1800, arrival: 450, trend: "rising" },
                { date: "2026-02-13", price: 1650, arrival: 520, trend: "stable" },
                { date: "2026-02-06", price: 1600, arrival: 480, trend: "falling" },
                { date: "2026-01-30", price: 1750, arrival: 400, trend: "rising" },
                { date: "2026-01-23", price: 1500, arrival: 600, trend: "falling" },
                { date: "2026-01-16", price: 1700, arrival: 350, trend: "rising" }
            ]
        },
        {
            mandi: "Pune", state: "Maharashtra", district: "Pune", prices: [
                { date: "2026-02-20", price: 2000, arrival: 380, trend: "rising" },
                { date: "2026-02-13", price: 1850, arrival: 420, trend: "stable" },
                { date: "2026-02-06", price: 1800, arrival: 450, trend: "stable" },
                { date: "2026-01-30", price: 1900, arrival: 350, trend: "rising" },
                { date: "2026-01-23", price: 1600, arrival: 550, trend: "falling" },
                { date: "2026-01-16", price: 1750, arrival: 400, trend: "stable" }
            ]
        },
        {
            mandi: "Azadpur", state: "Delhi", district: "New Delhi", prices: [
                { date: "2026-02-20", price: 2200, arrival: 800, trend: "rising" },
                { date: "2026-02-13", price: 2000, arrival: 900, trend: "stable" },
                { date: "2026-02-06", price: 1950, arrival: 850, trend: "falling" },
                { date: "2026-01-30", price: 2100, arrival: 700, trend: "rising" },
                { date: "2026-01-23", price: 1800, arrival: 1000, trend: "falling" },
                { date: "2026-01-16", price: 2050, arrival: 750, trend: "rising" }
            ]
        },
        {
            mandi: "Kolar", state: "Karnataka", district: "Kolar", prices: [
                { date: "2026-02-20", price: 1600, arrival: 600, trend: "stable" },
                { date: "2026-02-13", price: 1550, arrival: 650, trend: "falling" },
                { date: "2026-02-06", price: 1700, arrival: 500, trend: "rising" },
                { date: "2026-01-30", price: 1500, arrival: 700, trend: "falling" },
                { date: "2026-01-23", price: 1650, arrival: 550, trend: "rising" },
                { date: "2026-01-16", price: 1600, arrival: 600, trend: "stable" }
            ]
        },
        {
            mandi: "Madanapalle", state: "Andhra Pradesh", district: "Chittoor", prices: [
                { date: "2026-02-20", price: 1400, arrival: 900, trend: "falling" },
                { date: "2026-02-13", price: 1500, arrival: 850, trend: "stable" },
                { date: "2026-02-06", price: 1550, arrival: 800, trend: "stable" },
                { date: "2026-01-30", price: 1600, arrival: 750, trend: "rising" },
                { date: "2026-01-23", price: 1450, arrival: 900, trend: "falling" },
                { date: "2026-01-16", price: 1500, arrival: 870, trend: "stable" }
            ]
        }
    ],
    onion: [
        {
            mandi: "Lasalgaon", state: "Maharashtra", district: "Nashik", prices: [
                { date: "2026-02-20", price: 2500, arrival: 800, trend: "rising" },
                { date: "2026-02-13", price: 2200, arrival: 900, trend: "rising" },
                { date: "2026-02-06", price: 2000, arrival: 1000, trend: "stable" },
                { date: "2026-01-30", price: 1800, arrival: 1200, trend: "falling" },
                { date: "2026-01-23", price: 1900, arrival: 1100, trend: "falling" },
                { date: "2026-01-16", price: 2100, arrival: 950, trend: "stable" }
            ]
        },
        {
            mandi: "Azadpur", state: "Delhi", district: "New Delhi", prices: [
                { date: "2026-02-20", price: 2800, arrival: 600, trend: "rising" },
                { date: "2026-02-13", price: 2500, arrival: 700, trend: "rising" },
                { date: "2026-02-06", price: 2300, arrival: 750, trend: "stable" },
                { date: "2026-01-30", price: 2100, arrival: 850, trend: "falling" },
                { date: "2026-01-23", price: 2200, arrival: 800, trend: "stable" },
                { date: "2026-01-16", price: 2400, arrival: 700, trend: "rising" }
            ]
        },
        {
            mandi: "Pimpalgaon", state: "Maharashtra", district: "Nashik", prices: [
                { date: "2026-02-20", price: 2400, arrival: 700, trend: "rising" },
                { date: "2026-02-13", price: 2100, arrival: 800, trend: "stable" },
                { date: "2026-02-06", price: 2050, arrival: 850, trend: "stable" },
                { date: "2026-01-30", price: 1850, arrival: 950, trend: "falling" },
                { date: "2026-01-23", price: 1950, arrival: 900, trend: "falling" },
                { date: "2026-01-16", price: 2100, arrival: 800, trend: "stable" }
            ]
        },
        {
            mandi: "Bengaluru", state: "Karnataka", district: "Bengaluru", prices: [
                { date: "2026-02-20", price: 2600, arrival: 500, trend: "rising" },
                { date: "2026-02-13", price: 2350, arrival: 580, trend: "rising" },
                { date: "2026-02-06", price: 2200, arrival: 600, trend: "stable" },
                { date: "2026-01-30", price: 2000, arrival: 700, trend: "falling" },
                { date: "2026-01-23", price: 2100, arrival: 650, trend: "stable" },
                { date: "2026-01-16", price: 2250, arrival: 600, trend: "rising" }
            ]
        }
    ],
    potato: [
        {
            mandi: "Agra", state: "Uttar Pradesh", district: "Agra", prices: [
                { date: "2026-02-20", price: 1200, arrival: 1500, trend: "stable" },
                { date: "2026-02-13", price: 1150, arrival: 1600, trend: "falling" },
                { date: "2026-02-06", price: 1250, arrival: 1400, trend: "rising" },
                { date: "2026-01-30", price: 1100, arrival: 1700, trend: "falling" },
                { date: "2026-01-23", price: 1200, arrival: 1500, trend: "stable" },
                { date: "2026-01-16", price: 1300, arrival: 1300, trend: "rising" }
            ]
        },
        {
            mandi: "Farrukhabad", state: "Uttar Pradesh", district: "Farrukhabad", prices: [
                { date: "2026-02-20", price: 1100, arrival: 1800, trend: "falling" },
                { date: "2026-02-13", price: 1150, arrival: 1700, trend: "stable" },
                { date: "2026-02-06", price: 1200, arrival: 1600, trend: "stable" },
                { date: "2026-01-30", price: 1050, arrival: 2000, trend: "falling" },
                { date: "2026-01-23", price: 1100, arrival: 1900, trend: "falling" },
                { date: "2026-01-16", price: 1250, arrival: 1500, trend: "rising" }
            ]
        },
        {
            mandi: "Azadpur", state: "Delhi", district: "New Delhi", prices: [
                { date: "2026-02-20", price: 1500, arrival: 1200, trend: "rising" },
                { date: "2026-02-13", price: 1400, arrival: 1300, trend: "stable" },
                { date: "2026-02-06", price: 1350, arrival: 1350, trend: "stable" },
                { date: "2026-01-30", price: 1250, arrival: 1500, trend: "falling" },
                { date: "2026-01-23", price: 1300, arrival: 1400, trend: "stable" },
                { date: "2026-01-16", price: 1400, arrival: 1300, trend: "rising" }
            ]
        },
        {
            mandi: "Hooghly", state: "West Bengal", district: "Hooghly", prices: [
                { date: "2026-02-20", price: 1050, arrival: 2000, trend: "falling" },
                { date: "2026-02-13", price: 1100, arrival: 1900, trend: "stable" },
                { date: "2026-02-06", price: 1150, arrival: 1800, trend: "stable" },
                { date: "2026-01-30", price: 1000, arrival: 2200, trend: "falling" },
                { date: "2026-01-23", price: 1100, arrival: 2000, trend: "falling" },
                { date: "2026-01-16", price: 1200, arrival: 1700, trend: "rising" }
            ]
        }
    ],
    wheat: [
        {
            mandi: "Karnal", state: "Haryana", district: "Karnal", prices: [
                { date: "2026-02-20", price: 2300, arrival: 2000, trend: "stable" },
                { date: "2026-02-13", price: 2280, arrival: 2100, trend: "stable" },
                { date: "2026-02-06", price: 2250, arrival: 2200, trend: "stable" },
                { date: "2026-01-30", price: 2200, arrival: 2300, trend: "falling" },
                { date: "2026-01-23", price: 2250, arrival: 2100, trend: "stable" },
                { date: "2026-01-16", price: 2300, arrival: 2000, trend: "rising" }
            ]
        },
        {
            mandi: "Indore", state: "Madhya Pradesh", district: "Indore", prices: [
                { date: "2026-02-20", price: 2400, arrival: 1800, trend: "rising" },
                { date: "2026-02-13", price: 2350, arrival: 1900, trend: "stable" },
                { date: "2026-02-06", price: 2300, arrival: 2000, trend: "stable" },
                { date: "2026-01-30", price: 2250, arrival: 2100, trend: "falling" },
                { date: "2026-01-23", price: 2300, arrival: 2000, trend: "stable" },
                { date: "2026-01-16", price: 2350, arrival: 1900, trend: "rising" }
            ]
        },
        {
            mandi: "Azadpur", state: "Delhi", district: "New Delhi", prices: [
                { date: "2026-02-20", price: 2500, arrival: 1500, trend: "rising" },
                { date: "2026-02-13", price: 2450, arrival: 1600, trend: "stable" },
                { date: "2026-02-06", price: 2400, arrival: 1700, trend: "stable" },
                { date: "2026-01-30", price: 2350, arrival: 1800, trend: "falling" },
                { date: "2026-01-23", price: 2400, arrival: 1700, trend: "stable" },
                { date: "2026-01-16", price: 2450, arrival: 1600, trend: "rising" }
            ]
        }
    ],
    rice: [
        {
            mandi: "Karnal", state: "Haryana", district: "Karnal", prices: [
                { date: "2026-02-20", price: 3200, arrival: 1500, trend: "rising" },
                { date: "2026-02-13", price: 3100, arrival: 1600, trend: "stable" },
                { date: "2026-02-06", price: 3050, arrival: 1650, trend: "stable" },
                { date: "2026-01-30", price: 2900, arrival: 1800, trend: "falling" },
                { date: "2026-01-23", price: 3000, arrival: 1700, trend: "stable" },
                { date: "2026-01-16", price: 3100, arrival: 1600, trend: "rising" }
            ]
        },
        {
            mandi: "Azadpur", state: "Delhi", district: "New Delhi", prices: [
                { date: "2026-02-20", price: 3500, arrival: 1200, trend: "rising" },
                { date: "2026-02-13", price: 3400, arrival: 1300, trend: "stable" },
                { date: "2026-02-06", price: 3350, arrival: 1350, trend: "stable" },
                { date: "2026-01-30", price: 3200, arrival: 1500, trend: "falling" },
                { date: "2026-01-23", price: 3300, arrival: 1400, trend: "stable" },
                { date: "2026-01-16", price: 3400, arrival: 1300, trend: "rising" }
            ]
        },
        {
            mandi: "Cuttack", state: "Odisha", district: "Cuttack", prices: [
                { date: "2026-02-20", price: 2800, arrival: 1800, trend: "stable" },
                { date: "2026-02-13", price: 2750, arrival: 1900, trend: "falling" },
                { date: "2026-02-06", price: 2800, arrival: 1850, trend: "stable" },
                { date: "2026-01-30", price: 2700, arrival: 2000, trend: "falling" },
                { date: "2026-01-23", price: 2800, arrival: 1800, trend: "stable" },
                { date: "2026-01-16", price: 2850, arrival: 1750, trend: "rising" }
            ]
        }
    ],
    soybean: [
        {
            mandi: "Indore", state: "Madhya Pradesh", district: "Indore", prices: [
                { date: "2026-02-20", price: 4800, arrival: 800, trend: "rising" },
                { date: "2026-02-13", price: 4600, arrival: 900, trend: "rising" },
                { date: "2026-02-06", price: 4400, arrival: 1000, trend: "stable" },
                { date: "2026-01-30", price: 4200, arrival: 1100, trend: "falling" },
                { date: "2026-01-23", price: 4300, arrival: 1050, trend: "stable" },
                { date: "2026-01-16", price: 4500, arrival: 900, trend: "rising" }
            ]
        },
        {
            mandi: "Latur", state: "Maharashtra", district: "Latur", prices: [
                { date: "2026-02-20", price: 4700, arrival: 700, trend: "rising" },
                { date: "2026-02-13", price: 4500, arrival: 800, trend: "rising" },
                { date: "2026-02-06", price: 4300, arrival: 900, trend: "stable" },
                { date: "2026-01-30", price: 4100, arrival: 1000, trend: "falling" },
                { date: "2026-01-23", price: 4200, arrival: 950, trend: "stable" },
                { date: "2026-01-16", price: 4400, arrival: 850, trend: "rising" }
            ]
        },
        {
            mandi: "Nagpur", state: "Maharashtra", district: "Nagpur", prices: [
                { date: "2026-02-20", price: 4600, arrival: 750, trend: "rising" },
                { date: "2026-02-13", price: 4400, arrival: 850, trend: "stable" },
                { date: "2026-02-06", price: 4350, arrival: 900, trend: "stable" },
                { date: "2026-01-30", price: 4200, arrival: 1000, trend: "falling" },
                { date: "2026-01-23", price: 4300, arrival: 950, trend: "stable" },
                { date: "2026-01-16", price: 4400, arrival: 850, trend: "rising" }
            ]
        }
    ],
    cotton: [
        {
            mandi: "Rajkot", state: "Gujarat", district: "Rajkot", prices: [
                { date: "2026-02-20", price: 6500, arrival: 400, trend: "rising" },
                { date: "2026-02-13", price: 6300, arrival: 450, trend: "rising" },
                { date: "2026-02-06", price: 6100, arrival: 500, trend: "stable" },
                { date: "2026-01-30", price: 5900, arrival: 550, trend: "falling" },
                { date: "2026-01-23", price: 6000, arrival: 520, trend: "stable" },
                { date: "2026-01-16", price: 6200, arrival: 480, trend: "rising" }
            ]
        },
        {
            mandi: "Nagpur", state: "Maharashtra", district: "Nagpur", prices: [
                { date: "2026-02-20", price: 6400, arrival: 380, trend: "rising" },
                { date: "2026-02-13", price: 6200, arrival: 420, trend: "stable" },
                { date: "2026-02-06", price: 6100, arrival: 450, trend: "stable" },
                { date: "2026-01-30", price: 5800, arrival: 500, trend: "falling" },
                { date: "2026-01-23", price: 5900, arrival: 480, trend: "falling" },
                { date: "2026-01-16", price: 6100, arrival: 450, trend: "rising" }
            ]
        }
    ],
    mustard: [
        {
            mandi: "Jaipur", state: "Rajasthan", district: "Jaipur", prices: [
                { date: "2026-02-20", price: 5200, arrival: 600, trend: "rising" },
                { date: "2026-02-13", price: 5000, arrival: 650, trend: "stable" },
                { date: "2026-02-06", price: 4900, arrival: 700, trend: "stable" },
                { date: "2026-01-30", price: 4700, arrival: 800, trend: "falling" },
                { date: "2026-01-23", price: 4800, arrival: 750, trend: "stable" },
                { date: "2026-01-16", price: 5000, arrival: 680, trend: "rising" }
            ]
        },
        {
            mandi: "Kota", state: "Rajasthan", district: "Kota", prices: [
                { date: "2026-02-20", price: 5100, arrival: 550, trend: "rising" },
                { date: "2026-02-13", price: 4950, arrival: 600, trend: "stable" },
                { date: "2026-02-06", price: 4850, arrival: 650, trend: "stable" },
                { date: "2026-01-30", price: 4650, arrival: 750, trend: "falling" },
                { date: "2026-01-23", price: 4750, arrival: 700, trend: "stable" },
                { date: "2026-01-16", price: 4900, arrival: 650, trend: "rising" }
            ]
        }
    ],
    banana: [
        {
            mandi: "Jalgaon", state: "Maharashtra", district: "Jalgaon", prices: [
                { date: "2026-02-20", price: 1200, arrival: 1000, trend: "stable" },
                { date: "2026-02-13", price: 1150, arrival: 1100, trend: "falling" },
                { date: "2026-02-06", price: 1250, arrival: 950, trend: "rising" },
                { date: "2026-01-30", price: 1100, arrival: 1200, trend: "falling" },
                { date: "2026-01-23", price: 1200, arrival: 1050, trend: "stable" },
                { date: "2026-01-16", price: 1300, arrival: 900, trend: "rising" }
            ]
        },
        {
            mandi: "Azadpur", state: "Delhi", district: "New Delhi", prices: [
                { date: "2026-02-20", price: 1800, arrival: 700, trend: "rising" },
                { date: "2026-02-13", price: 1700, arrival: 750, trend: "stable" },
                { date: "2026-02-06", price: 1650, arrival: 800, trend: "stable" },
                { date: "2026-01-30", price: 1500, arrival: 900, trend: "falling" },
                { date: "2026-01-23", price: 1600, arrival: 850, trend: "stable" },
                { date: "2026-01-16", price: 1700, arrival: 780, trend: "rising" }
            ]
        }
    ],
    mango: [
        {
            mandi: "Vashi", state: "Maharashtra", district: "Mumbai", prices: [
                { date: "2026-02-20", price: 4500, arrival: 200, trend: "rising" },
                { date: "2026-02-13", price: 4200, arrival: 250, trend: "rising" },
                { date: "2026-02-06", price: 3800, arrival: 300, trend: "stable" },
                { date: "2026-01-30", price: 3500, arrival: 350, trend: "falling" },
                { date: "2026-01-23", price: 3600, arrival: 330, trend: "stable" },
                { date: "2026-01-16", price: 3900, arrival: 280, trend: "rising" }
            ]
        },
        {
            mandi: "Azadpur", state: "Delhi", district: "New Delhi", prices: [
                { date: "2026-02-20", price: 5000, arrival: 150, trend: "rising" },
                { date: "2026-02-13", price: 4700, arrival: 180, trend: "rising" },
                { date: "2026-02-06", price: 4300, arrival: 220, trend: "stable" },
                { date: "2026-01-30", price: 4000, arrival: 250, trend: "falling" },
                { date: "2026-01-23", price: 4100, arrival: 240, trend: "stable" },
                { date: "2026-01-16", price: 4400, arrival: 200, trend: "rising" }
            ]
        }
    ]
};

// Distance matrix between major agriculture regions (km, approximate)
const distanceMatrix = {
    "Maharashtra": { "Nashik": 0, "Pune": 210, "Azadpur": 1400, "Kolar": 800, "Madanapalle": 900, "Lasalgaon": 30, "Pimpalgaon": 40, "Bengaluru": 840, "Indore": 600, "Latur": 400, "Nagpur": 550, "Vashi": 180, "Jalgaon": 270, "Rajkot": 750 },
    "Karnataka": { "Nashik": 800, "Pune": 600, "Azadpur": 2100, "Kolar": 0, "Madanapalle": 120, "Bengaluru": 70, "Indore": 1100, "Nagpur": 900, "Vashi": 980, "Jalgaon": 900 },
    "Uttar Pradesh": { "Agra": 0, "Farrukhabad": 250, "Azadpur": 200, "Karnal": 350, "Indore": 600, "Hooghly": 1200 },
    "Haryana": { "Karnal": 0, "Azadpur": 130, "Agra": 350, "Indore": 800 },
    "Madhya Pradesh": { "Indore": 0, "Azadpur": 800, "Nagpur": 500, "Latur": 600, "Karnal": 800 },
    "Delhi": { "Azadpur": 0, "Karnal": 130, "Agra": 200, "Indore": 800, "Nashik": 1400 },
    "Rajasthan": { "Jaipur": 0, "Kota": 250, "Azadpur": 280, "Indore": 400, "Karnal": 350 },
    "Gujarat": { "Rajkot": 0, "Azadpur": 1100, "Nashik": 750, "Nagpur": 900, "Indore": 600 },
    "West Bengal": { "Hooghly": 0, "Azadpur": 1500, "Cuttack": 450 },
    "Odisha": { "Cuttack": 0, "Azadpur": 1700, "Hooghly": 450 },
    "Andhra Pradesh": { "Madanapalle": 0, "Kolar": 120, "Bengaluru": 180, "Azadpur": 2000 }
};

export function getMandiPrices(crop) {
    return mandiPrices[crop] || [];
}

export function getDistanceKm(fromState, toMandi) {
    const stateDistances = distanceMatrix[fromState];
    if (!stateDistances) return 500; // default
    return stateDistances[toMandi] || 500;
}

export function getAllCrops() {
    return Object.keys(mandiPrices);
}

export function getLatestPrice(crop, mandi) {
    const data = mandiPrices[crop]?.find(m => m.mandi === mandi);
    return data?.prices?.[0] || null;
}

export function getPriceTrend(crop, mandi) {
    const data = mandiPrices[crop]?.find(m => m.mandi === mandi);
    if (!data) return { trend: "unknown", change: 0 };
    const prices = data.prices;
    if (prices.length < 2) return { trend: "unknown", change: 0 };
    const change = ((prices[0].price - prices[prices.length - 1].price) / prices[prices.length - 1].price) * 100;
    return {
        trend: change > 5 ? "rising" : change < -5 ? "falling" : "stable",
        changePercent: Math.round(change * 10) / 10,
        weeklyPrices: prices.map(p => ({ date: p.date, price: p.price }))
    };
}

export default mandiPrices;
