/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#eef9ff',
                    100: '#d8f1ff',
                    200: '#b9e7ff',
                    300: '#89d9ff',
                    400: '#52c2ff',
                    500: '#29a3f8',
                    600: '#1285ed',
                    700: '#0b6dda',
                    800: '#1058b0',
                    900: '#134c8a',
                    950: '#0e3055',
                },
                surface: {
                    950: '#0a0f1a',
                    900: '#0f1623',
                    800: '#161e30',
                    700: '#1e293b',
                    600: '#263347',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
        },
    },
    plugins: [],
}
