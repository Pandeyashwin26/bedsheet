// Crop profiles with harvest windows, storage, and spoilage characteristics
const cropProfiles = {
    tomato: { name: "Tomato", name_hi: "टमाटर", category: "vegetable", harvest_months: [1, 2, 3, 4, 10, 11, 12], optimal_temp: { min: 20, max: 25 }, optimal_humidity: { min: 40, max: 60 }, shelf_life_days: 7, spoilage_rate_per_day: 5, cold_storage_extension: 21, perishability: "HIGH" },
    onion: { name: "Onion", name_hi: "प्याज", category: "vegetable", harvest_months: [2, 3, 4, 5, 11, 12], optimal_temp: { min: 25, max: 30 }, optimal_humidity: { min: 60, max: 70 }, shelf_life_days: 30, spoilage_rate_per_day: 1.5, cold_storage_extension: 90, perishability: "LOW" },
    potato: { name: "Potato", name_hi: "आलू", category: "vegetable", harvest_months: [1, 2, 3, 10, 11, 12], optimal_temp: { min: 15, max: 20 }, optimal_humidity: { min: 80, max: 90 }, shelf_life_days: 21, spoilage_rate_per_day: 2, cold_storage_extension: 120, perishability: "LOW" },
    wheat: { name: "Wheat", name_hi: "गेहूँ", category: "grain", harvest_months: [3, 4, 5], optimal_temp: { min: 20, max: 25 }, optimal_humidity: { min: 10, max: 14 }, shelf_life_days: 180, spoilage_rate_per_day: 0.1, cold_storage_extension: 365, perishability: "VERY LOW" },
    rice: { name: "Rice", name_hi: "चावल", category: "grain", harvest_months: [10, 11, 12], optimal_temp: { min: 20, max: 25 }, optimal_humidity: { min: 12, max: 14 }, shelf_life_days: 180, spoilage_rate_per_day: 0.1, cold_storage_extension: 365, perishability: "VERY LOW" },
    soybean: { name: "Soybean", name_hi: "सोयाबीन", category: "oilseed", harvest_months: [9, 10, 11], optimal_temp: { min: 20, max: 25 }, optimal_humidity: { min: 10, max: 13 }, shelf_life_days: 120, spoilage_rate_per_day: 0.2, cold_storage_extension: 180, perishability: "LOW" },
    cotton: { name: "Cotton", name_hi: "कपास", category: "fiber", harvest_months: [10, 11, 12, 1], optimal_temp: { min: 20, max: 30 }, optimal_humidity: { min: 8, max: 10 }, shelf_life_days: 365, spoilage_rate_per_day: 0.05, cold_storage_extension: 365, perishability: "VERY LOW" },
    mustard: { name: "Mustard", name_hi: "सरसों", category: "oilseed", harvest_months: [2, 3, 4], optimal_temp: { min: 15, max: 25 }, optimal_humidity: { min: 8, max: 12 }, shelf_life_days: 150, spoilage_rate_per_day: 0.15, cold_storage_extension: 240, perishability: "LOW" },
    banana: { name: "Banana", name_hi: "केला", category: "fruit", harvest_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], optimal_temp: { min: 13, max: 15 }, optimal_humidity: { min: 85, max: 95 }, shelf_life_days: 5, spoilage_rate_per_day: 8, cold_storage_extension: 14, perishability: "VERY HIGH" },
    mango: { name: "Mango", name_hi: "आम", category: "fruit", harvest_months: [4, 5, 6, 7], optimal_temp: { min: 10, max: 13 }, optimal_humidity: { min: 85, max: 90 }, shelf_life_days: 8, spoilage_rate_per_day: 6, cold_storage_extension: 21, perishability: "HIGH" }
};

export function getCropProfile(crop) {
    return cropProfiles[crop] || null;
}

export function getAllCropsList() {
    return Object.entries(cropProfiles).map(([id, c]) => ({ id, name: c.name, name_hi: c.name_hi, category: c.category }));
}

export default cropProfiles;
