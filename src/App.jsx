import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ServicesSection from './components/ServicesSection';
import ProductGrid from './components/ProductGrid';
import TestimonialSection from './components/TestimonialSection';
import InfoSections from './components/InfoSections';
import Footer from './components/Footer';

function App() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <Hero />
            <ServicesSection />
            <ProductGrid />
            <TestimonialSection />
            <InfoSections />
            <Footer />
        </div>
    );
}

export default App;
