# Foomatic Printer Database Lookup Site

[![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Shadcn UI](https://img.shields.io/badge/Shadcn_UI-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)

A modern, blazing-fast, and responsive web application designed for effortlessly browsing the extensive Foomatic printer database, meticulously maintained by the OpenPrinting community. Built with the powerful Next.js framework and optimized for peak performance with intelligent lazy loading.

## Features

-   **Lightning Fast Loading**: Experience a remarkable 95.2% reduction in initial page load time thanks to advanced lazy loading optimization.
-   **Comprehensive Database**: Gain instant access to a vast collection of over 6,657 printers, complete with detailed driver information.
-   **Advanced Search & Filtering**: Easily find what you need by filtering printers by manufacturer and searching by model name.
-   **Responsive & Modern UI**: Enjoy a beautiful, intuitive user interface that adapts seamlessly to all devices, from desktops to smartphones.
-   **Static Site Generation**: Fully compatible with GitHub Pages and other static hosting platforms for easy deployment.

## Performance Optimization

This application leverages a sophisticated lazy loading system to deliver an unparalleled user experience:

-   **Lightweight Index**: The initial page load is incredibly fast, fetching only essential printer metadata (a mere 1.1MB compared to the full 23.9MB).
-   **On-Demand Loading**: Full, detailed printer specifications are intelligently fetched only when a user specifically requests them.
-   **Individual Files**: Each printer's data is stored in its own separate JSON file, enabling optimal browser caching and efficient updates.
-   **Smooth Loading States**: Provides a seamless user experience with elegant skeleton loaders and robust error handling.

## Technologies Used

-   [**Next.js**](https://nextjs.org/): A React framework for building performant web applications.
-   [**TypeScript**](https://www.typescriptlang.org/): A typed superset of JavaScript that compiles to plain JavaScript.
-   [**Tailwind CSS**](https://tailwindcss.com/): A utility-first CSS framework for rapidly building custom designs.
-   [**Shadcn UI**](https://ui.shadcn.com/): A collection of re-usable components built with Radix UI and Tailwind CSS.
-   [**Foomatic Database**](https://www.openprinting.org/foomatic/): The comprehensive printer database providing the core data.

## Project Structure

-   `app/`: Contains the Next.js application pages and layout.
    -   `app/page.tsx`: The main landing page.
    -   `app/printer/[id]/page.tsx`: Dynamic route for individual printer details.
-   `components/`: Reusable UI components.
    -   `components/ui/`: Shadcn UI components.
-   `lib/`: Utility functions, types, and hooks.
    -   `lib/types.ts`: TypeScript type definitions.
    -   `lib/utils.ts`: General utility functions.
    -   `lib/hooks/use-debounce.ts`: Custom debounce hook.
-   `public/`: Static assets and the Foomatic printer database.
    -   `public/foomatic-db/printers.json`: Main printer data file.
    -   `public/foomatic-db/printers/`: Directory containing individual printer JSON files.

## Data Structure

-   `printersMap.json`: Lightweight index with essential printer information.
-   `printers/{id}.json`: Individual printer files with complete driver details.
-   Automatic data splitting script for easy updates.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Available Scripts

-   `npm run dev`: Starts the development server.
-   `npm run build`: Builds the application for production.
-   `npm run start`: Starts a production-ready Next.js server.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
