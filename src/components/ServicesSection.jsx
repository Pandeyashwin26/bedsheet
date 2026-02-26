import React from 'react';

const services = [
    {
        icon: '🌱',
        title: 'Organic Farming',
        desc: 'Pure, chemical-free crops grown with sustainable methods.',
        img: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?w=400&q=80',
    },
    {
        icon: '🥬',
        title: 'Fresh Vegetables',
        desc: 'Farm-picked daily for maximum freshness and nutrition.',
        img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
    },
    {
        icon: '🍎',
        title: 'Seasonal Fruits',
        desc: 'Hand-selected, naturally ripened seasonal fruits.',
        img: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80',
    },
    {
        icon: '🌽',
        title: 'Farm Products',
        desc: 'Grains, pulses, and specialty products straight from farms.',
        img: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=400&q=80',
    },
];

const ServicesSection = () => {
    return (
        <section id="services" className="py-20 bg-brand-500 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-40 h-40 border-2 border-white rounded-full"></div>
                <div className="absolute bottom-10 right-10 w-60 h-60 border-2 border-white rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 w-32 h-32 border border-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            </div>

            <div className="section-container relative z-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
                    <div>
                        <p className="text-brand-200 text-sm font-semibold tracking-wider uppercase mb-2">What We Offer</p>
                        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                            Best Agriculture Services
                        </h2>
                    </div>
                    <div className="flex gap-2">
                        <button className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 text-brand-500 flex items-center justify-center transition-colors shadow-lg">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {services.map((s, i) => (
                        <div
                            key={i}
                            className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                                <div className="absolute top-3 left-3 w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-lg">{s.icon}</span>
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="text-white font-bold text-lg mb-1">{s.title}</h3>
                                <p className="text-white/70 text-sm leading-relaxed">{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;
