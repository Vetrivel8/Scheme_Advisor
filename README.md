# Scheme Advisor: Premium Government Discovery Portal

Scheme Advisor is a state-of-the-art, data-driven platform designed to simplify the discovery and management of government schemes. Built with a focus on "Intelligence First" design, the platform transforms the complex landscape of policy into a personalized, interactive journey for citizens.

---

## 🌟 Core Feature Ecosystem

### 1. Intelligent Search & Discovery
*   **Dynamic Search Engine**: Instantly filter through 20+ verified national schemes (PM Kisan, Beti Bachao, etc.) using the high-performance search bar.
*   **Categorical Navigation**: Browse schemes through curated segments like Agriculture, Education, Women & Children, Social Welfare, and Employment.
*   **Smart Eligibility Filtration**: A dedicated discovery wizard that analyzes age, income, and occupation to map users directly to viable opportunities.

### 2. Profile Intelligence System
The redesigned profile dashboard serves as a centralized "Identity Dossier" with four professional modules:

*   **My Overview**: A high-impact dashboard providing an instant summary of your "Profile Intelligence." It features real-time tailored scheme matches and quick-access metrics for saved items and application status.
*   **My Details (Dossier)**: The **exclusive primary source** of user data. Features a professional inline editor to manage age, income, occupation, and geography. All website intelligence is pulled directly from this manual entry hub.
*   **Saved Schemes (Vault)**: A secure management area for bookmarked schemes, featuring a "Recently Interacted" tracker to resume research instantly.
*   **Track Application (Control Center)**: 
    *   **Live Monitor**: Professional filing table to track application status (Approved/Under Review).
    *   **Compliance Repository**: Document management system to track Aadhaar, Income Certificates, and Educational credentials.
    *   **Smart Health Check**: A diagnostic tool that calculates your "Readiness Score" based on uploaded documentation.

### 3. AI-Powered Smart Chatbot
*   **Personalized Mentorship**: Leverages the user's profile to suggest immediate scheme matches within the chat interface.
*   **Knowledge Retrieval**: Directly answers questions about specific scheme benefits, eligibility criteria, and department details by indexing the live scheme database.
*   **Dynamic Logo & Interface**: Features a custom logo and a responsive, user-friendly interface designed for clarity and ease of use.

---

## 🛠 Technology Architecture

### Frontend (User Interface)
*   **Engine**: React.js with Vite for lightning-fast reloading and builds.
*   **Styling**: A premium "Glassmorphism" aesthetic using Vanilla CSS and Tailwind directives. 
*   **Icons**: High-fidelity iconography powered by **Lucide-React**.
*   **State Management**: Real-time synchronization between LocalStorage and React State for persistent user profiles and bookmarks.

### Backend (Infrastructure)
*   **Server**: Node.js and Express processing dynamic requests.
*   **Data Strategy**: A centralized `schemes.json` database that allows for instant updates without server restarts.
*   **API Layer**: Axios-driven communication with built-in cache-busting (`?t=`) to ensure data freshness on every click.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16.0 or higher)
- npm or yarn

### Installation & Execution

1. **Clone the Repository**
2. **Backend Setup**
   ```bash
   cd backend
   npm install
   node server.js
   ```
   *The server will start on [http://localhost:5000](http://localhost:5000)*

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *The portal will be accessible at [http://localhost:5173](http://localhost:5173)*

---

## 📂 Project Structure

- `/frontend`: React application, premium UI components, and the discovery wizard.
- `/backend`: Express API, authentication logic, and the `schemes.json` database.
- `/backend/data`: Contains the core scheme definitions and metadata.

---

## 🔐 Security & Compliance
*   **JWT Authentication**: Secure user sessions for profile management.
*   **Data Privacy**: All personal information (The Dossier) is managed with high-impact visibility and user-only manual controls.
*   **Compliance Tracking**: Automated status indicators for government documentation readiness.

---
*Created with focus on visual excellence and user empowerment.*
