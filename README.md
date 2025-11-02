# Realty-AI: Price & Persona Predictor


**(Live Demo Link: [Add Your Deployed URL Here])**

Realty-AI is a full-stack, data-driven application designed to solve two major challenges for real estate agents: accurate property pricing and targeted buyer identification. By leveraging machine learning, this tool provides instant price estimates and suggests ideal customer personas, empowering agents to make faster, evidence-based decisions.

---

## 🚀 Core Features

### Phase 1: Price Predictor Core
* **User Authentication:** Secure user registration and login using JWT (JSON Web Tokens).
* **Property Management Dashboard:** A full CRUD (Create, Read, Update, Delete) interface for managing property listings.
* **Advanced Data Interaction:**
    * **Search:** Find properties by address or keywords.
    * **Sort:** Sort listings by price, size, etc. (ascending/descending).
    * **Filter:** Filter results by price range, number of bedrooms, and more.
    * **Pagination:** Efficiently browse large lists of properties.
* **AI-Powered Price Prediction:** A dedicated page to input property features (sq. footage, bedrooms, etc.) and receive an instant market price estimate from a **Linear Regression** model.

### Phase 2: Persona Predictor Enhancement
* **Customer Persona Prediction:** Integrates a **K-Means Clustering** model to analyze property features and suggest a target buyer persona (e.g., "Young Professional," "Small Family").
* **Enhanced Prediction Page:** The prediction form now returns *both* the estimated price and the suggested buyer persona.
* **Dashboard Integration:** Saved properties in the dashboard display their assigned persona, aiding in marketing strategy.

---

## 🏛️ System Architecture

This project is built on a modern, decoupled architecture:

1.  **Frontend (React.js):** A responsive client application that handles user interaction.
2.  **Backend (Node.js/Express):** A RESTful API that manages user data, authentication, and property listings.
3.  **AI Microservice (Python/FastAPI):** A separate Python service that hosts the trained machine learning models. The Node.js backend communicates with this service to get predictions.
4.  **Database (SQL/Prisma):** A SQL database managed by the Prisma ORM for type-safe data access.

