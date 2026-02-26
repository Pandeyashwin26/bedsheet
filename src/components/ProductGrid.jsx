import React, { useState } from 'react';

const categories = ['All', 'Vegetables', 'Fruits', 'Farm Fresh', 'Organic', 'Seasonal'];

const products = [
    {
        name: 'Fresh Tomatoes',
        category: 'Vegetables',
        price: '₹40/kg',
        img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80',
        badge: 'Popular',
    },
    {
        name: 'Organic Spinach',
        category: 'Vegetables',
        price: '₹30/bundle',
        img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80',
        badge: 'Organic',
    },
    {
        name: 'Sweet Mangoes',
        category: 'Fruits',
        price: '₹120/kg',
        img: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80',
        badge: 'Seasonal',
    },
    {
        name: 'Farm Fresh Corn',
        category: 'Farm Fresh',
        price: '₹25/piece',
        img: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=80',
        badge: null,
    },
    {
        name: 'Green Capsicum',
        category: 'Vegetables',
        price: '₹60/kg',
        img: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&q=80',
        badge: 'Fresh',
    },
    {
        name: 'Organic Bananas',
        category: 'Fruits',
        price: '₹45/dozen',
        img: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80',
        badge: 'Organic',
    },
];

const ProductGrid = () => {
    const [active, setActive] = useState('All');
    const filtered = active === 'All' ? products : products.filter(p => p.category === active);

    return (
        <section id="portfolio" className="py-20 bg-white">
            <div className="section-container">
                {/* Header */}
                <div className="text-center mb-12">
                    <p className="text-brand-500 text-sm font-semibold tracking-wider uppercase mb-2">Our Products</p>
                    <h2 className="section-heading">
                        Choose What's Perfect
                        <br className="hidden sm:block" />
                        <span className="text-brand-500"> For Your Field</span>
                    </h2>
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActive(cat)}
                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${active === cat
                                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((p, i) => (
                        <div
                            key={i}
                            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover shadow-sm"
                        >
                            <div className="relative h-56 overflow-hidden">
                                <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                {p.badge && (
                                    <span className="absolute top-3 left-3 bg-gold-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                        {p.badge}
                                    </span>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-gray-900 text-lg">{p.name}</h3>
                                    <span className="text-brand-500 font-bold text-sm">{p.price}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{p.category}</span>
                                    <button className="w-9 h-9 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center hover:bg-brand-500 hover:text-white transition-all duration-300">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProductGrid;
