import React from 'react';

const Footer = () => {
    return (
        <footer id="contact" className="bg-brand-900 text-white pt-16 pb-8">
            <div className="section-container">
                <div className="grid md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center">
                                <span className="text-xl">🌿</span>
                            </div>
                            <span className="text-xl font-bold">FarmFresh</span>
                        </div>
                        <p className="text-white/60 text-sm leading-relaxed">
                            Quality trust, direct to the farm. Connecting farmers and families
                            through fresh, organic produce since 2005.
                        </p>
                        <div className="flex gap-3 pt-2">
                            {['facebook', 'twitter', 'instagram', 'youtube'].map(social => (
                                <a
                                    key={social}
                                    href="#"
                                    className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-500 transition-colors duration-300"
                                >
                                    <span className="text-sm">
                                        {social === 'facebook' && '📘'}
                                        {social === 'twitter' && '🐦'}
                                        {social === 'instagram' && '📸'}
                                        {social === 'youtube' && '📺'}
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-gold-400">Quick Links</h4>
                        <ul className="space-y-3">
                            {['About Us', 'Our Services', 'Products', 'Blog', 'Contact'].map(link => (
                                <li key={link}>
                                    <a href="#" className="text-white/60 text-sm hover:text-white hover:pl-1 transition-all duration-200">
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-gold-400">Services</h4>
                        <ul className="space-y-3">
                            {['Organic Farming', 'Fresh Vegetables', 'Seasonal Fruits', 'Farm Tours', 'Consulting'].map(link => (
                                <li key={link}>
                                    <a href="#" className="text-white/60 text-sm hover:text-white hover:pl-1 transition-all duration-200">
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact & Newsletter */}
                    <div>
                        <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-gold-400">Contact Us</h4>
                        <div className="space-y-3 text-sm text-white/60 mb-6">
                            <div className="flex items-start gap-2">
                                <span>📍</span>
                                <span>123 Farm Road, Green Valley, India</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>📞</span>
                                <span>+91 98765 43210</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>✉️</span>
                                <span>hello@farmfresh.in</span>
                            </div>
                        </div>

                        <div>
                            <p className="text-white/80 text-sm font-medium mb-2">Newsletter</p>
                            <div className="flex">
                                <input
                                    type="email"
                                    placeholder="Your email"
                                    className="flex-1 bg-white/10 border border-white/20 rounded-l-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-brand-400"
                                />
                                <button className="bg-brand-500 hover:bg-brand-400 px-4 py-2 rounded-r-lg text-sm font-semibold transition-colors">
                                    →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
                    <p className="text-white/40 text-sm">
                        © 2026 FarmFresh. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        {['Privacy Policy', 'Terms of Service', 'Sitemap'].map(link => (
                            <a key={link} href="#" className="text-white/40 text-xs hover:text-white transition-colors">
                                {link}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
