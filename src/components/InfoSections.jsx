import React from 'react';

const InfoSections = () => {
    return (
        <div>
            {/* Section 1: Healthy Food Products - Yellow accent */}
            <section className="py-20 bg-white overflow-hidden">
                <div className="section-container">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Images */}
                        <div className="relative">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-2xl overflow-hidden shadow-lg">
                                    <img
                                        src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&q=80"
                                        alt="Fresh fruits"
                                        className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="rounded-2xl overflow-hidden shadow-lg mt-8">
                                    <img
                                        src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=80"
                                        alt="Organic products"
                                        className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            </div>
                            {/* Floating card */}
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-gold-400 text-white rounded-2xl py-4 px-6 shadow-xl flex items-center gap-3 min-w-[200px]">
                                <span className="text-3xl font-bold">100%</span>
                                <span className="text-sm font-medium leading-tight">Natural<br />Products</span>
                            </div>
                        </div>

                        {/* Right: Text */}
                        <div className="space-y-6 lg:pl-8">
                            <p className="text-brand-500 text-sm font-semibold tracking-wider uppercase">Why Choose Us</p>
                            <h2 className="section-heading">
                                Healthy <span className="text-gold-500">Farm Fresh</span> Products
                            </h2>
                            <p className="section-subheading">
                                We believe in providing the healthiest, most nutritious food directly from our partner farms.
                                Every product is carefully selected, naturally grown, and delivered with love.
                            </p>
                            <div className="space-y-4 pt-2">
                                {[
                                    { icon: '✅', text: 'No pesticides or chemicals used' },
                                    { icon: '✅', text: 'Direct farm-to-table delivery' },
                                    { icon: '✅', text: 'Supporting local farming communities' },
                                    { icon: '✅', text: 'Freshness guaranteed within 24 hours' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="text-lg">{item.icon}</span>
                                        <span className="text-gray-700 font-medium">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                            <a href="#" className="btn-primary inline-flex mt-4">
                                Learn More
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2: Farming Since 2005 - Dark Green */}
            <section className="py-20 bg-brand-500 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <img
                        src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=60"
                        alt=""
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="section-container relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Text */}
                        <div className="space-y-6">
                            <p className="text-brand-200 text-sm font-semibold tracking-wider uppercase">Our Story</p>
                            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                                Farming has been our passion since <span className="text-gold-400">2005</span>
                            </h2>
                            <p className="text-white/80 text-lg leading-relaxed max-w-lg">
                                For nearly two decades, we've been committed to sustainable farming practices,
                                connecting farmers with consumers, and ensuring every family has access to the
                                freshest, most nutritious produce possible.
                            </p>
                            <div className="grid grid-cols-3 gap-6 pt-4">
                                {[
                                    { num: '18+', label: 'Years Experience' },
                                    { num: '500+', label: 'Farm Partners' },
                                    { num: '50K+', label: 'Happy Families' },
                                ].map((stat, i) => (
                                    <div key={i} className="text-center">
                                        <div className="text-2xl sm:text-3xl font-bold text-gold-400">{stat.num}</div>
                                        <div className="text-white/60 text-xs sm:text-sm mt-1">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Image */}
                        <div className="relative">
                            <div className="rounded-3xl overflow-hidden shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=700&q=80"
                                    alt="Farmer in field"
                                    className="w-full h-96 object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gold-400 rounded-2xl flex items-center justify-center shadow-xl">
                                <span className="text-4xl">🌾</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Blog/Articles Preview */}
            <section className="py-20 bg-cream-50">
                <div className="section-container">
                    <div className="text-center mb-12">
                        <p className="text-brand-500 text-sm font-semibold tracking-wider uppercase mb-2">From Our Blog</p>
                        <h2 className="section-heading">Latest posts & articles</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                title: 'We began as a farm in agriculture product industry',
                                date: 'Feb 20, 2026',
                                img: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=500&q=80',
                                tag: 'Agriculture',
                            },
                            {
                                title: 'Organic farming methods that boost crop yield naturally',
                                date: 'Feb 18, 2026',
                                img: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&q=80',
                                tag: 'Organic',
                            },
                            {
                                title: 'How technology is transforming Indian agriculture',
                                date: 'Feb 15, 2026',
                                img: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=500&q=80',
                                tag: 'Technology',
                            },
                        ].map((post, i) => (
                            <article key={i} className="bg-white rounded-2xl overflow-hidden card-hover shadow-sm border border-gray-100 group">
                                <div className="relative h-52 overflow-hidden">
                                    <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <span className="absolute top-3 left-3 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                        {post.tag}
                                    </span>
                                </div>
                                <div className="p-5">
                                    <p className="text-xs text-gray-400 mb-2">{post.date}</p>
                                    <h3 className="font-bold text-gray-900 leading-snug group-hover:text-brand-500 transition-colors">
                                        {post.title}
                                    </h3>
                                    <a href="#" className="inline-flex items-center gap-1 text-brand-500 text-sm font-semibold mt-3 group-hover:gap-2 transition-all">
                                        Read More
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </a>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default InfoSections;
