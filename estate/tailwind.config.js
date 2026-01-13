/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f4f6fb',
                    100: '#eef0f6',
                    200: '#dce1ed',
                    300: '#bdc8e1',
                    400: '#9aaacf',
                    500: '#768cbb',
                    600: '#5a71a3',
                    700: '#485b89',
                    800: '#3e4c70',
                    900: '#35405d',
                    950: '#242a3d',
                },
                secondary: {
                    50: '#fbf9f1',
                    100: '#f5f1e0',
                    200: '#ede2c0',
                    300: '#e3cd96',
                    400: '#d6b36a',
                    500: '#c69a48',
                    600: '#aa7d39',
                    700: '#885f30',
                    800: '#704c2c',
                    900: '#5d3f28',
                    950: '#352113',
                }
            }
        },
    },
    plugins: [],
}
