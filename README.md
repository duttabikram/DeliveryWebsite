# DeliveryWebsite

![Build Status](https://img.shields.io/badge/build-passing-blue)
![License](https://img.shields.io/badge/license-mit-lightgrey)

## Description

**DeliveryWebsite** is a full-stack web application designed to simulate a food delivery service. It supports three primary user roles: **customers**, **delivery personnel**, and **restaurant administrators**. The platform enables real-time order tracking, restaurant browsing, menu management, and payment processing. The frontend is built with React, Tailwind CSS, and Leaflet for location services, while the backend leverages Node.js, Express, MongoDB, and Socket.IO for real-time communication.

## Installation

### Prerequisites

- Node.js (v16+ recommended)
- npm (v8+)
- MongoDB (local or cloud instance)
- Redis (optional, for caching)
- Kafka (optional, for message brokering)
- Razorpay API keys (for payment integration)
- Mapbox API token (for location tracking)
- Google Maps API key (for map rendering)

---

### Frontend Setup (`delivery-sender-ui`)

1. Clone the repository:
   ```bash
   git clone https://github.com/duttabikram/DeliveryWebsite.git
   cd DeliveryWebsite/delivery-sender-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the following variables:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_RAZORPAY_KEY=your_razorpay_key
   REACT_APP_MAPBOX_TOKEN=your_mapbox_token
   REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. Start the development server:
   ```bash
   npm start
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

---

### Backend Setup (`delivery_tracking/api-service`)

1. Navigate to the backend directory:
   ```bash
   cd ../delivery_tracking/api-service
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file and configure the following:
   ```env
   MONGO_URI=your_mongodb_connection_string
   REDIS_URL=your_redis_url
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_SECRET=your_razorpay_secret
   JWT_SECRET=your_jwt_secret
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

   The API will be available at [http://localhost:5000](http://localhost:5000).

---

## Usage

### Running the Application

1. Start the backend server (see above).
2. Start the frontend (see above).
3. Access the app in your browser and navigate to:
   - **Customer View**: `/` (browse restaurants, place orders, track deliveries)
   - **Restaurant Admin**: `/restaurant` (manage menu, view orders)
   - **Delivery Dashboard**: `/delivery` (track assigned orders)

### Key Workflows

- **Customer**:
  - Browse active restaurants.
  - Place orders and pay via Razorpay.
  - Track order status in real-time using map integration.

- **Restaurant Admin**:
  - Manage food items and restaurant details.
  - View and update order statuses.

- **Delivery Personnel**:
  - View assigned orders and update delivery status.
  - Track customer locations via Mapbox/Leaflet.

---

## Tech Stack

| **Category**       | **Technologies**                                                                                     |
|---------------------|-----------------------------------------------------------------------------------------------------|
| **Frontend**        | React, Tailwind CSS, Socket.IO Client, React Leaflet, @react-google-maps/api, jspdf                  |
| **Backend**         | Node.js, Express, MongoDB, Mongoose, Redis, Kafka (kafkajs), Socket.IO, JWT, Bcrypt, Razorpay      |
| **Location Services** | Mapbox, Leaflet, @mapbox/polyline, @react-google-maps/api                                           |
| **Payment**         | Razorpay Checkout                                                                                   |
| **Dev Tools**       | npm, dotenv, ESLint, Jest, Cypress (optional)                                                       |

---

## Features

- **Multi-Role Authentication**
  - JWT-based login/signup for customers, delivery agents, and restaurant admins.
  - Password hashing with bcrypt.

- **Real-Time Order Tracking**
  - Socket.IO for live updates on order status and delivery location.
  - Interactive maps with Leaflet and Mapbox for route visualization.

- **Restaurant Management**
  - Admin panel to create, update, and manage restaurant menus.
  - Order dashboard for viewing and updating order statuses.

- **Payment Integration**
  - Razorpay Checkout for secure payment processing.

- **Location-Based Services**
  - Customer and delivery agent location tracking.
  - Route mapping with `@mapbox/polyline`.

- **Scalable Backend**
  - MongoDB for data persistence.
  - Redis and Kafka for caching and message brokering.

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add some feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request.

### Coding Standards

- Use consistent indentation (2 spaces).
- Follow React best practices for component structure.
- Write clean, documented code.

---

## License

This project is not currently licensed. For now, it is available under the MIT License for personal and educational use. Contact the repository owner for commercial use.