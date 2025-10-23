# GEMINI.md

## Project Overview

This project is the front-end for the "Dayspring Chapel Management application". It is a multi-page website for a church, featuring sections for events, a library, a gallery, donations, and appointments.

The application is built using:

*   **HTML:** For the structure of the web pages.
*   **CSS:** For styling, with a responsive design implemented using media queries.
*   **Vanilla JavaScript:** For client-side interactivity and DOM manipulation.
*   **Parcel:** As a web application bundler to build and serve the project.

The JavaScript code is organized into a Model-View-Controller (MVC) like pattern, with `controller.js`, `view.js`, and separate view files (e.g., `indexView.js`) for different pages.

## Building and Running

To get the project running locally, follow these steps:

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm start
    ```
    This will start a development server with Parcel, and you can view the application in your browser at the address provided (usually `http://localhost:1234`).

3.  **Build for production:**
    ```bash
    npm run build
    ```
    This will create a `dist` directory with the optimized and bundled files for production.

## Development Conventions

*   **File Structure:**
    *   HTML files are located in the root directory.
    *   Global styles are in `globalStyles.css`.
    *   Page-specific styles are in the `src/styles.css` directory.
    *   JavaScript files are in the `src` directory, with a clear separation of concerns between `controller.js`, `view.js`, and page-specific views.
    *   Static assets like images and videos are in the `public` directory.
*   **Styling:** The project uses a global stylesheet (`globalStyles.css`) for common styles and variables, and page-specific stylesheets for individual pages. It uses CSS variables for theme colors.
*   **JavaScript:** The JavaScript is written in a modular way, with a `View` class handling common UI tasks. The code is not transpiled from a newer ECMAScript version, but it uses ES modules.
*   **Routing:** The project uses a multi-page architecture with separate HTML files for each page. Navigation is handled through standard anchor tags.
