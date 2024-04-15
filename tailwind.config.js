/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'text-primary-100',
    'text-primary-200',
    'text-primary-300',
    'text-textColor-100',
    'text-textColor-200',
    'text-textColor-300',
    'text-light-hover-100',
    'text-light-hover-200',
    'text-separator',
    'text-GPT-4-100',
    'text-GPT-4-200',
    'text-LLAMA-2-100',
    'text-LLAMA-2-200',
    'text-MISTRAL-8X7B-100',
    'text-MISTRAL-8X7B-200',
    'text-CLAUDE-3-OPUS-100',
    'text-CLAUDE-3-OPUS-200',
    'text-CLAUDE-3-SONNET-100',
    'text-CLAUDE-3-SONNET-200',
    'text-GEMINI-100',
    'text-GEMINI-200',
    'text-GPT-4-VISION-100',
    'text-GPT-4-VISION-200',
    'text-DALL-E-3-100',
    'text-DALL-E-3-200',
    'bg-primary-100',
    'bg-primary-200',
    'bg-primary-300',
    'bg-textColor-100',
    'bg-textColor-200',
    'bg-textColor-300',
    'bg-light-hover-100',
    'bg-light-hover-200',
    'bg-separator',
    'bg-GPT-4-100',
    'bg-GPT-4-200',
    'bg-LLAMA-2-100',
    'bg-LLAMA-2-200',
    'bg-MISTRAL-8X7B-100',
    'bg-MISTRAL-8X7B-200',
    'bg-CLAUDE-3-OPUS-100',
    'bg-CLAUDE-3-OPUS-200',
    'bg-CLAUDE-3-SONNET-100',
    'bg-CLAUDE-3-SONNET-200',
    'bg-GEMINI-100',
    'bg-GEMINI-200',
    'bg-GPT-4-VISION-100',
    'bg-GPT-4-VISION-200',
    'bg-DALL-E-3-100',
    'bg-DALL-E-3-200',
    'bg-background',
    'bg-background_workspace',
  ],
  theme: {
    extend: {
      transitionProperty: {
        'width': 'width'
      },
      screens: {
        '3xl': '1800px',
        '4xl': '2100px',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      animation: {
        blink: 'blink 1s step-start infinite',
      },
      colors: {
        background: "var(--background-color)",
        background_workspace: "var(--background-workspace-color)",
        primary: {
          100: "#BBD1F5",
          200: "#77A8F9",
          300: "#5293FD",
        },
        textColor: {
          100: "#ABAEB4",
          200: "#78716C",
          300: "#333333",
        },
        'light-hover': {
          100: "#F8F8F8",
          200: "#E3E3E4",
        },
        separator: "var(--separator-color)",
        'GPT-4': {
          100: "#F8D4F1",
          200: "#D163DA",
        },
        'LLAMA-2': {
          100: "#C8E6C9",
          200: "#388E3C",
        },
        'MISTRAL-8X7B': {
          100: "#FFE0B2",
          200: "#EF6C00",
        },
        'CLAUDE-3-OPUS': {
          100: "#FFF9C4",
          200: "#FBC02D",
        },
        'CLAUDE-3-SONNET': {
          100: "#F5F5F5",
          200: "#616161",
        },
        'GEMINI': {
          100: "#B2DFDB",
          200: "#00796B",
        },
        'GPT-4-VISION': {
          100: "#EDE7F6",
          200: "#4527A0",
        },
        'DALL-E-3': {
          100: "#D1C4E9",
          200: "#3F51B5",
        },
      },
    },
  },
  plugins: [],
}

