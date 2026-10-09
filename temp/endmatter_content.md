# END MATTER

## SECTION 1: ASSESSMENT BANK

### Multiple Choice Questions (MCQs)

1. The traditional advertising model on the web primarily relies on:
A) Direct payments from users to creators
B) Harvesting user data to serve targeted promotions
C) Subscriptions paid monthly by users
D) Open standards like the Interledger Protocol

2. A major drawback of the subscription model for users is:
A) It relies too heavily on tracking pixels
B) Creators don't earn enough from it
C) "Subscription fatigue" and high barriers to entry for occasional reading
D) The lack of recurring revenue for creators

3. What is Web Monetization?
A) A new cryptocurrency for paying creators
B) A proposed browser API standard that allows continuous, micro-payments from a user to a creator
C) A premium ad network for African content creators
D) A subscription bundling service

4. The Interledger Protocol (ILP) is best described as:
A) An open protocol suite for sending payments across different ledgers
B) A proprietary payment gateway built by a single company
C) A smart contract platform for creating NFTs
D) A centralized database of user payment information

5. Which HTML tag is used to enable Web Monetization on a webpage?
A) `<meta name="monetization" content="...">`
B) `<link rel="payment" href="...">`
C) `<link rel="monetization" href="...">`
D) `<script src="monetization.js"></script>`

6. Micro-streaming of payments means:
A) Users send large lump sums once a year
B) Payments are sent in tiny increments continuously as the user consumes content
C) Creators are paid based on the number of ads clicked
D) Users must manually approve every 1-cent transaction

7. Which Go-to-Market (GTM) motion relies on the product itself being the primary driver of acquisition, activation, and retention?
A) Sales-led growth
B) Market-led growth
C) Product-led growth
D) Founder-led growth

8. In the GTM funnel framework (Acquire, Activate, Retain), "Activation" refers to:
A) Getting a user to visit your landing page
B) A user experiencing the core value of your product for the first time
C) A user paying for an annual subscription
D) A user leaving a positive review on an app store

9. Why is segmentation critical when launching a new product?
A) It allows you to build a product for everyone simultaneously
B) It helps you focus your limited resources on a specific group with an acute problem
C) It ensures your marketing budget is spread as widely as possible
D) It guarantees immediate profitability

10. When seeking your "first 100 users," the best approach is typically:
A) Buying expensive billboard ads in major cities
B) Doing unscalable, direct outreach to your specific target segment
C) Relying entirely on SEO to bring in organic traffic over time
D) Waiting for the product to go viral on social media

### Essay Questions

**Essay 1: Monetization Models**
Compare Web Monetization with the traditional advertising and subscription models. Analyze the strengths and weaknesses of each specifically for a Nigerian educational content creator offering tutorials and study guides. Which model, or combination of models, would you recommend they start with and why?

**Essay 2: GTM Strategy Design**
Design a Go-to-Market strategy for a new Web Monetization tool that helps Nigerian digital artists get paid for their online portfolios. Use the Acquire, Activate, Retain funnel framework. Clearly identify the specific segment of artists you are targeting, how you will reach them, what the "aha moment" (activation) will be, and how you will keep them using the tool.

### Fix the Tag Exercise

The following HTML snippets attempt to add Web Monetization to a page, but they contain errors. Identify what is wrong with each snippet and write the corrected version. (Remember: The correct tag uses the `<link>` element with `rel="monetization"` and an `href` pointing to a valid Open Payments wallet address).

**Snippet 1:**
`<meta name="monetization" content="https://wallet.example.com/alice">`

**Snippet 2:**
`<link rel="monitization" href="$ilp.uphold.com/qww7r7qww7r7">`

**Snippet 3:**
`<link rel="monetization" content="https://wallet.example.com/bob">`

**Snippet 4:**
Put this at the bottom of the `<body>`:
`<link rel="monetization" href="https://wallet.example.com/charlie">`

## SECTION 2: ANSWER KEY

### MCQs Answer Key

1. **B** (Advertising relies on harvesting attention and data. Direct payments and subscriptions are different models.)
2. **C** (Subscription fatigue occurs when users are asked to pay monthly fees for numerous services they may only use occasionally.)
3. **B** (Web Monetization is a proposed web standard for continuous micro-payments, not a cryptocurrency or ad network.)
4. **A** (ILP is an open protocol designed to route payments across any ledger, similar to how IP routes data across different networks.)
5. **C** (The standard tag uses `<link>` with `rel="monetization"` and the `href` attribute.)
6. **B** (Micro-streaming involves continuous, tiny payments sent automatically in the background while the user consumes content.)
7. **C** (Product-led growth uses the product's value and user experience as the main engine for growth.)
8. **B** (Activation is the "aha moment" when the user first realizes the value of the product.)
9. **B** (Segmentation narrows your focus to a specific, manageable group whose problem you can solve deeply, which is vital when resources are limited.)
10. **B** (Getting the first 100 users almost always requires doing things that don't scale, like direct messaging, attending specific community events, and personal outreach.)

### Essay Rubric

**Essay 1: Monetization Models**
*   **Good answers will include:**
    *   **Advertising:** Strengths (free for students), Weaknesses (requires massive traffic, annoying UX, data privacy issues).
    *   **Subscriptions:** Strengths (predictable revenue), Weaknesses (hard to convince Nigerian students with limited budgets to commit monthly).
    *   **Web Monetization:** Strengths (frictionless for the user once set up, fair compensation per second of reading), Weaknesses (requires user to have a Web Monetization provider, which is currently a high barrier).
    *   **Recommendation:** A strong answer will likely suggest a hybrid approach (e.g., offering core content for free to build an audience, using Web Monetization for premium interactive elements, or combining Web Monetization with ad-free experiences).

**Essay 2: GTM Strategy Design**
*   **Good answers will include:**
    *   **Clear Segmentation:** E.g., "Nigerian 2D illustrators who post art on Twitter/X but don't have a Patreon."
    *   **Acquire:** Specific, unscalable tactics to reach them (e.g., DMing them on Twitter, hosting a small workshop at a Lagos tech hub).
    *   **Activate:** Defining the "aha moment" (e.g., The moment the artist sees their first streaming micro-payment hit their wallet while testing their own portfolio).
    *   **Retain:** Tactics to keep them engaged (e.g., weekly community showcases, easy withdrawal options to local currency).

### Fix the Tag - Corrected

**Snippet 1 Errors:** Uses `<meta>` instead of `<link>`. Uses `name` and `content` instead of `rel` and `href`.
*   **Corrected:** `<link rel="monetization" href="https://wallet.example.com/alice">`

**Snippet 2 Errors:** Misspells `rel="monetization"`. Uses the legacy payment pointer format (`$`) instead of a modern `https://` Open Payments wallet address.
*   **Corrected:** `<link rel="monetization" href="https://ilp.uphold.com/qww7r7qww7r7">` (assuming the provider supports the https format for that identifier).

**Snippet 3 Errors:** Uses `content` attribute instead of `href`.
*   **Corrected:** `<link rel="monetization" href="https://wallet.example.com/bob">`

**Snippet 4 Errors:** The `<link>` tag must be placed inside the `<head>` section of the HTML document, not the `<body>`.
*   **Corrected:** Ensure `<link rel="monetization" href="https://wallet.example.com/charlie">` is placed within the `<head>` tags of the HTML document.

## SECTION 3: GLOSSARY

*   **Advertising model:** A revenue model where creators are paid by advertisers to display promotional content to users, often relying on user data tracking and maximizing attention.
*   **Application layer:** The top layer of the Interledger stack (and internet protocols) where user-facing applications (like the Web Monetization API) operate.
*   **Browser extension (Web Monetization context):** A software add-on (like Coil, historically) that users install in their browser to act as their Web Monetization provider, streaming payments to sites they visit.
*   **Distribution:** The channels and methods used to get your product in front of your target users.
*   **Funnel (Acquire, Activate, Retain):** A framework for visualizing the user journey: acquiring them (getting their attention), activating them (they experience value), and retaining them (they keep coming back).
*   **Go-to-market (GTM) strategy:** The comprehensive action plan that specifies how a company will reach target customers and achieve competitive advantage.
*   **Hybrid monetization:** Combining multiple revenue models (e.g., using both Web Monetization and voluntary tips, or subscriptions and ads) to maximize earnings and provide options.
*   **ILPv4:** The current version of the Interledger Protocol, standardizing how value is routed across different networks.
*   **Interledger Protocol (ILP):** An open protocol suite for sending payments across different ledgers, acting like the TCP/IP of money.
*   **Link layer:** The bottom layer of the Interledger stack, dealing with the actual ledgers and specific payment networks.
*   **Market-led growth:** A GTM motion driven by strong market demand and network effects, often seen in marketplaces or viral consumer apps.
*   **Micro-streaming:** Sending extremely small amounts of money continuously over time (e.g., fractions of a cent per second) while a user consumes content.
*   **Open Payments:** An API standard built on Interledger that provides a common way to interface with digital wallets, allowing for setup of recurring payments and Web Monetization.
*   **Payment pointer (legacy term):** The old format for identifying an ILP receiver account, starting with a `$` sign. Replaced by Open Payments wallet addresses.
*   **Penny switching:** The mental friction and reluctance users feel when asked to make a small, active payment decision (even for just a penny). Web Monetization aims to eliminate this friction.
*   **Positioning:** How you define your product in the mind of your target customer relative to competitors.
*   **Product-led growth:** A GTM motion where the product itself (its usability, viral loops, self-serve nature) is the primary driver of user acquisition and retention.
*   **Sales-led growth:** A GTM motion relying on a sales team to proactively reach out to, negotiate with, and close deals with customers (often enterprise).
*   **Segmentation:** The process of dividing a broad target market into smaller, more manageable groups of consumers who have similar needs or characteristics.
*   **Settlement layer:** The underlying mechanisms and ledgers where the final transfer of value actually occurs.
*   **SPSP (Simple Payment Setup Protocol):** A protocol used in the Interledger ecosystem to exchange payment information before sending an ILP stream.
*   **STREAM:** A transport layer protocol over ILP designed for sending money and data concurrently, handling the breakdown of large payments into micro-transactions.
*   **Subscription model:** A revenue model where users pay a recurring fee (usually monthly or annually) for access to content or services.
*   **Transport layer:** The layer in the Interledger stack (like STREAM) responsible for ensuring payments arrive correctly, handling encryption, and managing packet size.
*   **Unit economics:** The direct revenues and costs associated with a single unit of your business (e.g., the cost to acquire one user vs. the lifetime value of that user).
*   **Value proposition:** A clear statement that explains how your product solves a user's problem or improves their situation, and why they should choose you.
*   **Wallet address:** A standardized URL (e.g., `https://wallet.example.com/username`) used in Open Payments to identify an account that can receive funds.
*   **Web Monetization:** A proposed web standard (W3C) that allows browsers to continuously stream micro-payments to websites as the user consumes content.

## SECTION 4: RESOURCES

**Web Monetization & Interledger Documentation:**
*   [webmonetization.org](https://webmonetization.org) - The main hub for the Web Monetization standard.
*   [webmonetization.org/publishers](https://webmonetization.org/publishers) - Implementation guides for publishers.
*   [webmonetization.org/supporters/overview](https://webmonetization.org/supporters/overview) - Implementation guides for supporters.
*   [webmonetization.org/faq](https://webmonetization.org/faq) - FAQ.
*   [interledger.org/developers](https://interledger.org/developers) - Interledger developer docs.
*   [interledger.org/developers/blog](https://interledger.org/developers/blog) - Engineering blog.
*   The Web Monetization specification (link from webmonetization.org).

**Interledger Videos & Talks:**
*   *Note: Check the Interledger Foundation's YouTube channel for the most current videos.*
*   [Placeholder: Interledger Foundation YouTube channel]
*   [Placeholder: Key talk on Web Monetization]

**GTM & Startup Resources:**
*   [Placeholder: Recommended reading on GTM strategy]
*   [Placeholder: Books on building startups]
*   [Placeholder: Guide to the Nigerian tech ecosystem]

**Case Study Sources:**
*   *Paystack Story:* [Placeholder for sources on Paystack story].
*   *Chowdeck Story:* [Placeholder for sources on Chowdeck story].
*   *M-Pesa Story:* [Placeholder for sources on M-Pesa story].
*   *Note: Always verify figures against original sources.*

## SECTION 5: ASSET LIST

**Part 1 Images:**
*   **IMAGE PLACEHOLDER 1.1:** Simple chart showing how Facebook, Instagram, Netflix, YouTube each earn money.
*   **IMAGE PLACEHOLDER 1.2:** Two-column graphic comparing advertising and subscriptions with question mark.
*   **IMAGE PLACEHOLDER 2.1:** Internet analogy drawn next to Interledger flow.
*   **IMAGE PLACEHOLDER 2.2:** The Interledger stack infographic with Application layer highlighted.
*   **IMAGE PLACEHOLDER 2.3:** Side-by-side old route and current route diagram.
*   **IMAGE PLACEHOLDER 3.1:** Reuse Chapter 2 stack infographic.
*   **IMAGE PLACEHOLDER 3.2:** Three-reader diagram comparing subscription vs streaming.
*   **IMAGE PLACEHOLDER 3.3:** Payment flow diagram.
*   **IMAGE PLACEHOLDER 3.4:** Annotated code snippet graphic.
*   **IMAGE PLACEHOLDER 4.1:** Design canvas template.

**Part 2 Images:**
*   **IMAGE PLACEHOLDER 6.1:** Product vs project comparison.
*   **IMAGE PLACEHOLDER 7.1:** Segmentation test visual.
*   **IMAGE PLACEHOLDER 8.1:** Three GTM motions diagram.
*   **IMAGE PLACEHOLDER 9.1:** Localized funnel flowchart template.
*   **IMAGE PLACEHOLDER 10.1:** First-100 worksheet template.
