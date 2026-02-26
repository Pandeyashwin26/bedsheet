import React, { useState, useEffect } from 'react';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const links = ['Home', 'About', 'Services', 'Portfolio', 'Contact'];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                ? 'bg-white/95 backdrop-blur-lg shadow-lg shadow-black/5 py-3'
                : 'bg-transparent py-5'
            }`}>
            <div className="section-container flex items-center justify-between">
                {/* Logo */}
                <a href="#" className="flex items-center gap-2.5 group">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${scrolled ? 'bg-brand-500' : 'bg-white/20 backdrop-blur-sm'
                        }`}>
                        <span className="text-xl">🌿</span>
                    </div>
                    <span className={`text-xl font-bold transition-colors duration-300 ${scrolled ? 'text-brand-500' : 'text-white'
                        }`}>
                        FarmFresh
                    </span>
                </a>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {links.map(link => (
                        <a
                            key={link}
                            href={`#${link.toLowerCase()}`}
                            className={`font-medium text-sm transition-colors duration-200 relative group ${scrolled ? 'text-gray-700 hover:text-brand-500' : 'text-white/90 hover:text-white'
                                }`}
                        >
                            {link}
                            <span className={`absolute -bottom-1 left-0 w-0 h-0.5 rounded-full transition-all duration-300 group-hover:w-full ${scrolled ? 'bg-brand-500' : 'bg-white'
                                }`}></span>
                        </a>
                    ))}
                </div>

                {/* CTA + Mobile Toggle */}
                <div className="flex items-center gap-3">
                    <a href="#contact" className={`hidden sm:inline-flex items-center gap-2 font-semibold text-sm py-2.5 px-6 rounded-full transition-all duration-300 ${scrolled
                            ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600'
                            : 'bg-white text-brand-500 shadow-lg hover:bg-gray-50'
                        }`}>
                        Contact Us
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </a>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                            }`}
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            {menuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                <div className={`px-4 pb-4 pt-2 space-y-1 ${scrolled ? 'bg-white' : 'bg-black/30 backdrop-blur-lg'}`}>
                    {links.map(link => (
                        <a
                            key={link}
                            href={`#${link.toLowerCase()}`}
                            onClick={() => setMenuOpen(false)}
                            className={`block py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${scrolled
                                    ? 'text-gray-700 hover:bg-brand-50 hover:text-brand-500'
                                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {link}
                        </a>
                    ))}
                    <a href="#contact" className="block text-center bg-brand-500 text-white font-semibold py-2.5 px-4 rounded-lg mt-2 sm:hidden">
                        Contact Us
                    </a>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
