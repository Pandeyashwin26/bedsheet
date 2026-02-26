import React from 'react';

const Hero = () => {
    return (
        <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80"
                    alt="Farm landscape"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
            </div>

            {/* Content */}
            <div className="section-container relative z-10 py-32 lg:py-0">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Text */}
                    <div className="space-y-6 animate-slide-right">
                        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md text-white text-sm font-medium py-2 px-4 rounded-full border border-white/20">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            100% Organic & Fresh
                        </div>

                        <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1]">
                            Quality Trust,
                            <br />
                            <span className="text-gold-400">Direct to the</span>
                            <br />
                            Farm
                        </h1>

                        <p className="text-white/80 text-lg max-w-md leading-relaxed">
                            Connecting you with organic farming and selling organic food
                            directly from the source to your table.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-2">
                            <a href="#services" className="btn-primary text-base">
                                Explore Now
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </a>
                            <a href="#about" className="inline-flex items-center gap-2 text-white border-2 border-white/30 font-semibold py-3 px-7 rounded-full hover:bg-white/10 transition-all duration-300">
                                Learn More
                            </a>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex gap-8 pt-6">
                            <div>
                                <div className="text-3xl font-bold text-white">435<span className="text-gold-400">+</span></div>
                                <div className="text-white/60 text-sm">Products</div>
                            </div>
                            <div className="w-px bg-white/20"></div>
                            <div>
                                <div className="text-3xl font-bold text-white">2K<span className="text-gold-400">+</span></div>
                                <div className="text-white/60 text-sm">Happy Customers</div>
                            </div>
                            <div className="w-px bg-white/20"></div>
                            <div>
                                <div className="text-3xl font-bold text-white">50<span className="text-gold-400">+</span></div>
                                <div className="text-white/60 text-sm">Farm Partners</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Image Collage */}
                    <div className="hidden lg:block relative">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div className="rounded-3xl overflow-hidden shadow-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
                                    <img
                                        src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&q=80"
                                        alt="Fresh vegetables"
                                        className="w-full h-56 object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="rounded-3xl overflow-hidden shadow-2xl animate-fade-in" style={{ animationDelay: '0.4s' }}>
                                    <img
                                        src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80"
                                        alt="Green fields"
                                        className="w-full h-40 object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4 pt-8">
                                <div className="rounded-3xl overflow-hidden shadow-2xl animate-fade-in" style={{ animationDelay: '0.3s' }}>
                                    <img
                                        src="https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&q=80"
                                        alt="Farmer harvesting"
                                        className="w-full h-40 object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="rounded-3xl overflow-hidden shadow-2xl animate-fade-in" style={{ animationDelay: '0.5s' }}>
                                    <img
                                        src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&q=80"
                                        alt="Organic produce"
                                        className="w-full h-56 object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Floating Badge */}
                        <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 animate-float">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                                    <span className="text-2xl">🌾</span>
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900">Farm Fresh</div>
                                    <div className="text-xs text-gray-500">Delivered Daily</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom wave */}
            <div className="absolute bottom-0 left-0 right-0 z-10">
                <svg viewBox="0 0 1440 100" fill="none" className="w-full">
                    <path d="M0 40C360 80 720 0 1080 40C1260 60 1380 80 1440 80V100H0V40Z" fill="white" />
                </svg>
            </div>
        </section>
    );
};

export default Hero;
