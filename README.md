# SnapWort

SnapWort is a mobile-first web application that helps you learn languages by looking up word definitions in English and German using OpenAI's GPT-4o-mini.

## Features

- Search for word definitions in English and German
- Get definitions powered by OpenAI's GPT-4o-mini
- Save words to your personal library for later reference
- Organize saved words by language
- Mobile-first responsive design

## Technologies Used

- Next.js 15
- TypeScript
- Tailwind CSS
- Dexie.js (IndexedDB)
- OpenAI API

## Getting Started

### Prerequisites

- Node.js 18 or higher
- NPM or Yarn
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/snapwort.git
cd snapwort
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to use the application.

## Usage

1. Select a language (English or German) from the dropdown menu
2. Enter a word in the input field
3. Click "Search" to get the definition
4. The word and definition will be automatically saved to your library
5. Access your saved words by clicking on "Library" in the bottom navigation

## License

This project is licensed under the MIT License.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
