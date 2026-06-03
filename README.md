Seamlyy
Seamless payments, boundless art.

Overview
Seamlyy is a lightweight fintech web application engineered to bridge the gap between African artists and the global art economy. By replacing traditional, high-friction payment rails with a decentralized digital payment architecture, Seamlyy enables creators to instantly receive cross-border payouts and monetize their audiences.

Key Features
Open Payments Checkout: Features an instant checkout flow utilizing GNAP for secure, privacy-preserving wallet authorization, completely bypassing centralized escrow systems.

Web Monetization: Leverages the Interledger Protocol (ILP) to allow collectors to stream continuous micro-payments to artists simply by viewing their digital galleries.

Automated Revenue Splitting: A smart, point-of-sale transaction split that routes 95% of funds directly to the artist and 5% to the platform with zero revenue leakage.

Accessible UI/UX: Designed specifically for emerging markets, ensuring the web application is fully optimized and functional on low-end mobile devices.

Tech Stack & Architecture
Backend: Java, Spring Boot

Protocols: Interledger Protocol (ILP), Open Payments API, GNAP, Web Monetization (<meta name="monetization">)

System Design: Built on a strict systems analysis framework to ensure a modular, scalable architecture capable of handling high-frequency micro-transactions securely.

Getting Started
Prerequisites
JDK 17+

Maven or Gradle

An active Interledger Testnet Payment Pointer / Wallet

Installation
Clone the repository:

Bash
git clone https://github.com/yourusername/seamlyy.git
2. Navigate to the project directory:
   ```bash
   cd seamlyy
Configure your application properties:
Update the application.yml or application.properties with your Testnet API keys and Payment Pointers.

Run the application:

./mvnw spring-boot:run


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what