import React from 'react';

const testimonials = [
    {
        name: 'Rajesh Kumar',
        role: 'Farmer, Haryana',
        text: 'This platform helped me connect directly with buyers. My income has increased by 40% since I started selling organic produce here.',
        img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
        rating: 5,
    },
    {
        name: 'Priya Sharma',
        role: 'Home Chef, Delhi',
        text: 'The vegetables are incredibly fresh! I can taste the difference compared to supermarket produce. Delivery is always on time.',
        img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
        rating: 5,
    },
    {
        name: 'Amit Patel',
        role: 'Restaurant Owner',
        text: 'Reliable quality and consistent supply. My customers love that we source directly from organic farmers through FarmFresh.',
        img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
        rating: 5,
    },
];

const TestimonialSection = () => {
    return (
        <section className="py-20 bg-cream-50">
            <div className="section-container">
                {/* Header */}
                <div className="text-center mb-12">
                    <p className="text-brand-500 text-sm font-semibold tracking-wider uppercase mb-2">Testimonials</p>
                    <h2 className="section-heading">
                        What our customers say
                    </h2>
                </div>

                {/* Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    {testimonials.map((t, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover"
                        >
                            {/* Stars */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(t.rating)].map((_, j) => (
                                    <svg key={j} className="w-5 h-5 text-gold-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                ))}
                            </div>

                            {/* Quote */}
                            <p className="text-gray-600 leading-relaxed mb-6 text-sm">
                                "{t.text}"
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                                <img
                                    src={t.img}
                                    alt={t.name}
                                    className="w-11 h-11 rounded-full object-cover border-2 border-brand-100"
                                />
                                <div>
                                    <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                                    <div className="text-xs text-gray-400">{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialSection;
