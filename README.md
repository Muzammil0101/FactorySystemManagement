# FactorySystemManagement

A comprehensive **Offline Stock Management System** built with **Electron**, **Next.js**, **Node.js**, and **SQLite**. Designed for efficient factory operations management without requiring an internet connection.

## 🚀 Features

-   **Stock Management**: Real-time tracking of raw materials and finished goods.
-   **Order Processing**: Manage incoming and outgoing orders seamlessly.
-   **Offline First**: Built on Electron and SQLite to ensure full functionality without internet access.
-   **Interactive Dashboard**: Visual analytics and reporting.
-   **Cross-Platform**: Runs smoothly on macOS, Windows, and Linux (via Electron).

## 🛠 Tech Stack

-   **Frontend**: [Next.js](https://nextjs.org/) (React Framework), TypeScript, Tailwind CSS
-   **Backend**: Node.js, Express (or custom server logic)
-   **Database**: [SQLite](https://www.sqlite.org/index.html) (via `better-sqlite3` or similar adapter)
-   **Desktop Wrapper**: [Electron](https://www.electronjs.org/)

## 📋 Prerequisites

Before you begin, ensure you have met the following requirements:

-   **Node.js**: Version 16.x or higher (Recommended: LTS)
-   **npm** or **yarn**: Package manager installed.

## 📦 Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/FacSys.git
    cd FacSys
    ```

2.  **Install Frontend Dependencies**:
    ```bash
    cd frontend
    npm install
    # or
    yarn install
    ```

3.  **Install Backend Dependencies**:
    ```bash
    cd ../backend
    npm install
    # or
    yarn install
    ```

## 🏃‍♂️ Running the Application

### Development Mode

To run the application in development mode (with hot-reloading):

1.  **Start the Backend**:
    Open a terminal in the `backend` directory:
    ```bash
    cd backend
    npm run dev  # or start, check package.json
    ```

2.  **Start the Frontend (Next.js)**:
    Open a new terminal in the `frontend` directory:
    ```bash
    cd frontend
    npm run dev
    ```

3.  **Launch Electron** (if configured to run with dev server):
    ```bash
    cd frontend
    npm run electron:dev
    ```

### Production Build

To build the application for production:

1.  **Build Frontend**:
    ```bash
    cd frontend
    npm run build
    ```

2.  **Build/Package Electron App**:
    ```bash
    npm run electron:build
    ```

## 📂 Project Structure

```
FacSys/
├── backend/            # Node.js backend server and database logic
│   ├── database/       # SQLite database files and seed scripts
│   ├── routes/         # API routes
│   └── ...
├── frontend/           # Next.js frontend application
│   ├── src/            # Source code (components, pages)
│   ├── electron/       # Electron main and preload scripts
│   └── ...
└── README.md           # Project documentation
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
