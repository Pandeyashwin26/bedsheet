/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#f0f9f0',
                    100: '#daf1da',
                    200: '#b8e4b8',
                    300: '#86d086',
                    400: '#4db84d',
                    500: '#2D6A2E',
                    600: '#265c27',
                    700: '#1f4a20',
                    800: '#1a3c1a',
                    900: '#153115',
                },
                gold: {
                    50: '#fef9eb',
                    100: '#fcefc5',
                    200: '#f9e08a',
                    300: '#f5cc4d',
                    400: '#f0b824',
                    500: '#D4A843',
                    600: '#b8862a',
                    700: '#946522',
                    800: '#7a5120',
                    900: '#66431f',
                },
                cream: {
                    50: '#FEFCF3',
                    100: '#FDF8E1',
                    200: '#FAF0C8',
                    300: '#F5E6A8',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                serif: ['Playfair Display', 'Georgia', 'serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.6s ease-out forwards',
                'slide-up': 'slideUp 0.5s ease-out forwards',
                'slide-right': 'slideRight 0.5s ease-out forwards',
                'scale-in': 'scaleIn 0.4s ease-out forwards',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideRight: {
                    '0%': { opacity: '0', transform: 'translateX(-30px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.9)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
            },
        },
    },
    plugins: [],
}
