DISMANTLING ALGORITHMIC MONOPOLIES
A Self-Study Guide to Web Monetization and Your First 100 Users

[CONTENT DRAFT: COMPLETE. Part 1 covers Chapters 1 to 4. Part 2 (GTM, Chapters 5 to 10), the assessment bank and the appendices follow in separate documents.]

HOW TO USE THIS GUIDE

This guide is built for you to study on your own. You don't need a teacher in the room, but you do need a pen, a notebook and a little curiosity.

By the end of Part 1 you will be able to:
- explain how apps and websites make money today, and where those models hurt creators and audiences
- explain, in plain English, what Web Monetization is and how it differs from advertising and subscriptions
- describe where Web Monetization sits in the Interledger stack
- outline the steps to set it up, and then follow the Interledger docs to do it
- look at a real problem and decide whether Web Monetization is the right tool for it

Throughout the guide you will see these boxes:
PAUSE AND PREDICT: guess before you read on. Wrong guesses are useful.
THINK IT THROUGH: a short reflection. Write your answer down.
SPOT THE ERROR: find what's wrong.
TRY IT: do something hands-on.
CHECK YOURSELF: a short quiz. Answers are on the page after.
DOCS CHECK: a pointer to the official Interledger or Web Monetization documentation. Technical details change over time, so the docs are always the final word.

A note on the docs: whenever this guide describes how the technology works, it is based on the Web Monetization site (webmonetization.org) and the Interledger Foundation's developer site (interledger.org/developers). If anything here ever disagrees with the docs, trust the docs.

==================================================
MAJOR PART 1: UNDERSTANDING WEB MONETIZATION
==================================================

CHAPTER 1: ALTERNATIVE REVENUE MODELS

The prepaid meter

Think about how you buy electricity with a prepaid meter. You don't sign a contract for a whole month and pay for power you may never use. You load credit, you use what you need, and when it runs low you top it up. You pay in small amounts, in proportion to what you use.

Now think about how you pay for most things online. Most of them ask you for a large amount, upfront, for access to everything: a monthly subscription, a full course fee, an annual plan.

PAUSE AND PREDICT: Before reading on, list the ways you or your family paid for something digital in the last month. Airtime? Data bundles? A streaming subscription? A course? Which of those were small, per-use payments, and which were large lump sums?

Have you ever wanted just ONE episode? ONE movie? ONE section of a course? Yet you had to pay for the whole thing. That frustration is the starting point of this guide.

How apps make money today

Before we look for a different way to pay, we need to understand how the web pays for things now. Look at four familiar products.

Facebook and Instagram are free to use. They make their money mainly from advertising. Businesses pay to show ads to users, and the platform helps those businesses reach exactly the right people by using data about what users do, like and look at.

Netflix is the opposite. It shows no ads on its standard plans. It earns through subscriptions, a recurring monthly fee for access to the whole catalogue.

YouTube mixes the two. It earns from ads, and also from paid memberships.

[IMAGE PLACEHOLDER 1.1: A simple chart with four app logos on the left (Facebook, Instagram, Netflix, YouTube) and how each earns money on the right (ads, ads, subscription, ads plus memberships). Whiteboard style, uncluttered.]

Beyond these two, apps and creators also earn from:
- sponsorships and brand partnerships
- selling products or services directly (commerce)
- donations and tips
- grants
- freemium models, where the basic product is free and extra features cost money
- transaction fees, where the platform takes a cut each time money moves

Almost everything on that list is built on one of three ideas: someone else pays for your attention (ads), you pay for access (subscriptions), or you give because you want to (donations).

THINK IT THROUGH: Pick one app you use every day. Write down how it earns money. Is it ads, subscriptions, or something else? Who is really paying, and who is the "customer"?

The cost of advertising

Advertising looks free, but it is not. The audience isn't paying you with money. Their attention is the product being sold.

That has two consequences. First, platforms control distribution. They decide who sees your content. Second, advertisers decide which kind of audience is worth money. If your audience isn't valuable to advertisers, your content earns little, however good it is. For many African creators this is a real problem. Your audience may be large and loyal, yet small in the eyes of advertisers.

Ads also come with costs for the people who watch them: interruptions, tracking, and the sense that you are being watched while you browse.

The cost of subscriptions

Subscriptions are more direct. The reader pays the creator. But they bring a different problem: commitment.

What if you only want to read one article on a website? You probably won't subscribe for a whole month. What if you cannot afford, or do not want, a recurring fee? Subscriptions exclude people. Both models, in their own way, work against creators, publishers and the audiences they're trying to reach.

So what if there was another way?

A teaser

Imagine that while you read an article, a tiny amount of value flowed from you to the writer. You chose how much, and you could stop whenever you liked. No ads. No monthly commitment. No tracking. The longer you stayed, the more flowed.

That is the idea behind Web Monetization, and by the end of Part 1 you will understand how it works.

THINK IT THROUGH: Before you read further, invent your own alternative. If you could design a new way for people to pay creators online, how would it work? Write down your idea. We will come back to it.

[IMAGE PLACEHOLDER 1.2: A two-column graphic comparing advertising (attention is the product) and subscriptions (a recurring commitment), with a question mark in the middle: "What if there was another way?"]

KEY TAKEAWAYS
- Most of the web earns through ads or subscriptions.
- Ads sell attention. Subscriptions require commitment. Both have real costs.
- A third idea, small payments that flow as you use something, is worth exploring.


CHAPTER 2: THE INTERLEDGER STACK (A BRIEF RECAP)

You don't need to become an expert in Interledger to understand Web Monetization, but you do need the big picture. Think of this chapter as a recap of what matters.

The problem: different networks, one payment

Suppose you are a Nigerian creator and one of your readers is in the United States. Your wallet is with Provider A. Your reader's wallet is with Provider B.

Traditional payment systems often have different currencies, different technical interfaces, different account systems, different ways of settling money, different fees and different compliance rules. For a payment to move from Provider B to Provider A, those differences have to be handled. In other words, you need interoperability.

The internet analogy

The internet solved a similar problem. A computer on one network can talk to a computer on a completely different network, because they share common rules, namely TCP/IP. Nobody requires every computer to belong to the same network provider.

Interledger works in the same spirit. Interledger (ILP) is an open protocol for routing packets of value across different financial systems. It is not itself a blockchain, a token or a central payment company. The networks do not need to merge into one giant ledger. ILP simply gives them a common way to move value between each other.

The internet:
Computer -> TCP/IP -> Network A -> Network B -> Network C -> Computer

Similarly, Interledger:
Wallet A -> Financial Network A -> ILP -> Connector -> Financial Network B -> Wallet B

[IMAGE PLACEHOLDER 2.1: The internet analogy drawn next to the Interledger flow, in matching whiteboard style: Computer -> TCP/IP -> Network A -> Network B -> Computer; Wallet A -> Network A -> ILP -> Connector -> Network B -> Wallet B.]

The stack, simplified

Engineers talk about systems in layers, each with a job. Here is a simplified view of the Interledger stack, from top to bottom:

1. Application layer. This is where the apps people actually use live: Web Monetization, Open Payments, SPSP and other payment applications.
2. Transport layer. STREAM lives here. It handles ongoing flows of money and data, which is what makes continuous payments possible.
3. Interledger layer. ILPv4 lives here. It routes the packets of value.
4. Link layer. This covers how connected parties communicate with each other (for example BTP or ILP-over-HTTP).
5. Settlement layer. This is where the money actually settles in banks, mobile money, fiat or crypto systems.

Here is the stack laid out visually:

APPLICATION LAYER
Web Monetization
Open Payments / SPSP
Other payment applications
        |
TRANSPORT LAYER
STREAM
Handles ongoing flows of money/data
        |
INTERLEDGER LAYER
ILPv4
Routes packets of value
        |
LINK LAYER
BTP / ILP-over-HTTP etc.
Communication between peers
        |
SETTLEMENT LAYER
Banks / fiat / mobile money / crypto etc.

[IMAGE PLACEHOLDER 2.2: THE INTERLEDGER STACK INFOGRAPHIC. Five stacked bands with the Application layer highlighted in the accent colour, and an arrow labelled "Web Monetization is here".]

A note on layers: the Interledger architecture documents describe the protocol layers (application, transport, Interledger and link), with settlement happening in the financial systems beneath them. This guide adds settlement as a fifth band so you can see where the money finally lands. Check the architecture pages on interledger.org/developers if you want the exact official wording.

What matters to you: you will work at the top. The layers beneath do the heavy lifting so that you don't have to.

DOCS CHECK: Visit interledger.org/developers and look for the architecture overview. Compare the layers described there with the simplified version above. Note any differences.

Where Web Monetization sits

Here is an important idea that people often get wrong: Web Monetization is NOT ILP.

Use this analogy. ILP is the roads. Web Monetization is a delivery service that uses the roads. The delivery company isn't the road. But without the road infrastructure, the delivery system wouldn't work in the same way.

The Interledger Foundation describes Web Monetization as an open web standard for browser-native payments. It sits at the application layer, using application-layer protocols to make those payments possible. In your assignment brief, this is described as a user application sitting above SPSP and ILP.

So why does Web Monetization need ILP? Because without the roads, the delivery service has no way to move parcels between different networks. ILP handles the interoperability problem, and Web Monetization rides on top of it, focusing on the browser experience.

SPSP and Open Payments (a short box)

SPSP stands for Simple Payment Setup Protocol. Historically it was an application-layer protocol used to communicate the payment details needed to start a payment. The Interledger architecture describes SPSP as an application-layer protocol that can communicate the destination ILP address and related details over HTTPS and use STREAM as its transport.

In older descriptions, the chain looked like this:

Web Monetization -> SPSP -> STREAM -> ILP

In the modern ecosystem, Open Payments has become a major part of how applications interact with payment accounts. The chain looks more like this:

Web Monetization -> Open Payments -> STREAM/ILP mechanisms -> Financial systems

A simple way to separate them: ILP answers "how can value be routed between different financial systems?" Open Payments answers "how can an application interact with a payment account in a common way?" The current Open Payments documentation describes it as a shared standard for applications to request, approve and complete payments across participating accounts and wallets.

You may see both versions in articles, videos and course material, so you should know both. The Web Monetization docs themselves describe how Web Monetization works through Open Payments, and they say a monetization link must contain a valid Open Payments wallet address. Always treat the current docs as the authority.

DOCS CHECK: Read the "Learn about sending payments" page in the Web Monetization docs (webmonetization.org/supporters/about-sending) and note the key components it names. Then visit the Open Payments documentation at openpayments.dev and read the overview. How does it describe what Open Payments does?

[IMAGE PLACEHOLDER 2.3: Side-by-side "old route" and "current route" diagram: Web Monetization -> SPSP -> STREAM -> ILP versus Web Monetization -> Open Payments -> STREAM/ILP -> financial systems.]

KEY TAKEAWAYS
- Interledger lets different financial systems exchange value, just as the internet lets different networks exchange data.
- It is organized in layers. You work at the application layer.
- Web Monetization is an application that uses Interledger. It is not Interledger itself.
- SPSP is the older route. Open Payments is the modern one.


CHECKPOINT 1: THREE QUESTIONS

Try these without looking back. Answers are on the next page.

Question 1. In the advertising model, what is really being sold?
A. The creator's content
B. The audience's attention
C. The platform's software
D. The reader's subscription

Question 2. What problem does Interledger mainly solve?
A. It makes websites load faster
B. It replaces all banks with one giant ledger
C. It lets different financial systems exchange value with a common protocol
D. It stops advertisers from tracking users

Question 3. In the roads and delivery analogy, what is Web Monetization?
A. The road
B. The delivery service that uses the road
C. The warehouse
D. The customer

[PAGE BREAK]

CHECKPOINT 1: ANSWERS

Question 1: B. In the ad model the audience's attention is the product advertisers buy. The audience is not paying the creator directly.

Question 2: C. Interledger does not replace banks or merge networks into one ledger. It gives them a shared way to route value between each other.

Question 3: B. ILP is the road. Web Monetization is the delivery service using it. It is an application, not the infrastructure.

If you got all three right, move on. If not, re-read the section the question came from before starting Chapter 3.


CHAPTER 3: WEB MONETIZATION

Look again at the stack from the last chapter. Web Monetization sits at the top, in the application layer. In this chapter we meet it properly.

[IMAGE PLACEHOLDER 3.1: Reuse the Chapter 2 stack infographic with the Application layer highlighted.]

What Web Monetization is

Web Monetization is an open web standard that lets websites receive small, automatic payments from visitors as they browse. There are no interruptions and no data is harvested in exchange. It gives creators an additional revenue model alongside advertising and subscriptions.

Here is the key idea. Instead of asking "Will you subscribe?" or "Can we show you an ad?", Web Monetization asks:

"Can value flow from the audience to the creator continuously, while the audience consumes the experience?"

The payment isn't necessarily "Here is N5,000." It can instead be: "While I'm consuming this content, I'm continuously allowing small amounts of value to flow."

Think of it this way: with Web Monetization, your website is the product.

What Web Monetization is NOT

Let's clear up some common misunderstandings. According to the Web Monetization docs:
- It is not a way for sites to take money from you. The supporters overview at webmonetization.org/supporters/overview states: "All payments to web monetized sites must be explicitly authorized or pre-authorized by you. Sites can't pull payments from your payment account under any circumstance."
- It is not tied to one currency. A creator can receive in the currency they choose, and a supporter can send in theirs.
- It does not require a separate account on every site. You use one wallet. The docs say: "The only account you need is the one you create with your wallet provider."
- It is not an ad blocker. The docs clarify: "Sending a payment to a web monetized site doesn't guarantee an ad-free experience. Web Monetization provides publishers an alternative revenue model to ads, but the decision whether to load ads in response to a payment is entirely theirs."
- It is not ILP. It is an application that sits on top of it.
- It does not replace every other model. The Interledger Foundation describes it as complementary to advertising, subscriptions and other revenue models.

What "micro-streaming" actually means

The word streaming can be misleading. Here is an example to make it concrete.

Imagine you are reading a long, free article on a news website. You've set a small budget in your Web Monetization extension. While the page is open, small amounts of value flow from your wallet toward the writer. Read for thirty seconds and little flows. Stay for ten minutes and more flows. Close the tab and it stops.

(The exact amounts in the extension are set by you. Throughout this guide, any naira figures are only illustrations.)

Conceptually, the longer you engage, the more value can flow. That creates a very different relationship between consumption, value and payment.

But streaming does not necessarily mean one separate financial transaction is settled every fraction of a second. ILP was designed to route very small packets of value, and STREAM provides a way to handle ongoing flows. So when you hear the term "penny switching", think:

"The economic model treats value as a continuous flow, not one large payment."

Not:

"Someone literally transfers one penny into a bank account every millisecond."

PAUSE AND PREDICT: Before reading the next part, guess: if a reader spends ten minutes on your page, should a subscription and a streaming model treat them the same? Why or why not?

Three readers, one price

Imagine three people who visit your website.
User A reads one article.
User B reads your website every day.
User C watches one 20-minute tutorial.

A subscription of, say, N5,000 a month treats them similarly. User A will probably refuse to subscribe for one article. User B might happily pay. User C might pay once and leave.

Streaming can make the relationship more proportional to usage:
Little engagement -> little value transferred.
More engagement -> more value transferred.

Web Monetization can be thought of as a value pipe: a programmable path through which value continuously flows from a consumer toward a content or value provider.

[IMAGE PLACEHOLDER 3.2: Three-reader diagram. Three figures (A, B, C) with different amounts of time on a page, and bars showing what a subscription charges (the same for each) versus what streaming transfers (proportional to engagement).]

Who is in control?

One of the most important points in the docs is that supporters are in control. They decide whether they pay, when they pay and how much. A web monetized site cannot pull payments from your wallet. When you link the browser extension to your wallet, you give the extension permission to send payments on your behalf, within the budget you set. You can change those settings later, and you can also turn continuous payments off.

The Web Monetization supporters overview (webmonetization.org/supporters/overview) lists these benefits:
- "Control who, when, and how much to pay."
- "Your payments are private." Web Monetization doesn't provide the recipient with personally identifiable information such as your name, wallet address, IP address, or anything else the recipient could use to correlate a payment with you.
- "Your payment details are stored with your wallet." The extension communicates with your wallet without storing sensitive payment details in the extension or in the browser itself.
- "You choose your wallet provider."
- "There's no separate Web Monetization account(s)."

Two practical details worth knowing:
- The amount and renewal period are set for each extension. If you install the extension in another browser and connect the same wallet, that extension has its own, separate budget.
- In the extension, the rate is expressed as how much is paid per hour.

DOCS CHECK: Read the supporters overview (webmonetization.org/supporters/overview) and the FAQ (webmonetization.org/faq). Find the answer to "Do I have to share personal data to use Web Monetization?"

CASE STUDY 1: THE CREATOR WHO ESCAPED THE AD-DRIVEN MONOPOLY

[This case study is built from your scenario. Adjust names and details freely.]

Ngozi runs "Learn Calculus Nigeria", a small educational channel. Her audience is mostly secondary school and first-year university students. They watch on phones, often on limited data, and few have money for monthly subscriptions.

For two years she depended on the usual route: ads on a video platform, plus occasional appeals for donations. The platform decided who saw her lessons. Advertisers cared little about her audience, because it was young and had little spending power. Her earnings were small and unpredictable. At the same time, every ad interrupted the students she was trying to help, and some stopped watching.

She tried a subscription, but most students could not commit to a monthly fee. Putting every lesson behind a paywall meant locking out the very people she wanted to help.

Then she began exploring Web Monetization. She published her lessons openly on her own website and added a monetization link to each page. Students who had compatible wallets and the extension could stream small amounts to her while they studied. Students who didn't could still learn for free.

The change in her economics looks like this:
Student watches -> value flows -> creator.

She didn't need to lock every lesson. For educational content, access and income don't have to be opposites.

It wasn't magic. Many students had no compatible wallet at first. Ngozi still needed to promote her content, build a community, and explain to students how to set things up. Her income was less predictable than a subscription, so she kept other income sources too. But for the first time her revenue wasn't controlled by a platform's algorithm, and her lessons stayed open to everyone.

THINK IT THROUGH:
1. Which two problems with ads and subscriptions did Ngozi solve?
2. Which problems did Web Monetization NOT solve for her?
3. If you were advising Ngozi, what would you tell her to do first?

More scenarios to think about

Scenario: an African journalist. A Nigerian investigative reporter normally earns through advertising, subscriptions, sponsorship and grants. With Web Monetization, a reader could read a free article, spend eight minutes on it and send a small value stream to the publisher. They would not need to decide "Do I want to subscribe?" before reading.

Scenario: Seamlyy, a digital art gallery. A viewer discovers a Nigerian artist, explores the gallery and spends time looking at artwork. Value streams toward the artist while they look. The artwork doesn't need to be locked behind "pay N5,000 before viewing." Discovery stays open and monetization happens in the background.

Scenario: an open-source developer. A developer maintains a free library for other developers. Usually they earn nothing from it, apart from sponsors or donations. Imagine the documentation itself could receive tiny streams as people read it, without a "PLEASE DONATE" banner interrupting them.

Scenario: a podcast. An episode can stay free. Instead of a subscription or a 30-second advert, the listener contributes continuously while listening.

THINK IT THROUGH: Which of these four scenarios do you think works best, and which is hardest? What would the creator need besides Web Monetization?

Setting it up: the process in outline

Now let's look at what it takes to make this work. We'll keep this at the right depth: you'll understand the process, and then you'll follow the official docs step by step to actually do it.

There are two sides: the publisher (who receives) and the supporter (who sends).

For a publisher, the process is:
1. Get a wallet address. Sign up with a wallet provider that supports Web Monetization. Your wallet address is where payments will be sent.
2. Create the link. The Web Monetization site has a link generator tool (webmonetization.org/publishers/link-tag-tool). You give it your wallet address and it produces a link element.
3. Add it to your pages. Place the link inside the head of every page you want to monetize.

For a supporter, the process is:
1. Sign up with a compatible wallet provider and get a wallet address.
2. Install the Web Monetization browser extension (it works on Chromium-based browsers like Chrome, Edge and Opera, and on Firefox).
3. Connect your wallet in the extension.
4. Set your budget.
5. Browse web monetized sites and the payments flow.

DOCS CHECK: Visit webmonetization.org/supporters/get-started for the current step-by-step instructions for supporters. Visit webmonetization.org/publishers/get-started for publishers.

[IMAGE PLACEHOLDER 3.3: PAYMENT FLOW DIAGRAM. Whiteboard style, uncluttered: Viewer -> Viewer's wallet -> Web Monetization extension -> Publisher's wallet -> Publisher. Label what each part does.]

A word about the wallet: sending and receiving payments requires both the sender and the recipient to have an account with a wallet provider that is enabled for Web Monetization. The docs describe the network of compatible wallet providers as "nascent, but growing," so check the current list at webmonetization.org/wallets.

The HTML tag

How does a website say "I accept Web Monetization"? It places a monetization link in the head of the page. Here is an example:

<head>
  <title>My Website</title>
  <link
    rel="monetization"
    href="https://wallet.example.com/Ngozi"
  >
</head>

The important part is rel="monetization". This tells a compatible Web Monetization implementation: "This page has a destination where monetization payments can be sent." The href holds the receiving wallet address. According to the docs, that must be a valid Open Payments wallet address.

[IMAGE PLACEHOLDER 3.4: ANNOTATED CODE SNIPPET GRAPHIC. The snippet above with arrows pointing to: the head element, rel="monetization" (what it declares), and href (the wallet address).]

What the tag does NOT do

The tag does not magically move money. It only declares the destination. For a payment to actually happen you also need:
- a compatible Web Monetization implementation on the user's side, such as the browser extension
- a user's payment account with a compatible wallet
- authorization from the user
- payment APIs
- the underlying payment infrastructure

The Interledger Foundation's engineering blog describes how the extension uses Open Payments to connect to a wallet and send payments. If you are curious how, browse the Web Monetization posts on interledger.org/developers/blog.

SPOT THE ERROR:
A student writes this and wonders why nothing works:

<head>
  <meta name="monetization" content="$wallet.example.com/Ngozi">
</head>

What do you think is wrong? Write down at least two problems. (The answer is below.)

Answer: First, the wrong element. Web Monetization uses a link element with rel="monetization", not a meta tag. Second, the wrong attribute: the destination goes in href, not content. Third, the value should be a valid Open Payments wallet address (a web address starting with https://), not an older style payment pointer starting with a dollar sign. A fuller version of this exercise appears in the assessment bank.

Your docs map

From here, stop reading and start doing. Follow the official docs strictly. They are the source of truth and will be more current than any book.
- For publishers: webmonetization.org/publishers
- Publisher tools (link generator, banner, widget, etc.): webmonetization.org/publishers (see the tools section)
- For supporters: webmonetization.org/supporters/overview
- Getting started as a supporter: webmonetization.org/supporters/get-started
- How sending works: webmonetization.org/supporters/about-sending
- FAQ: webmonetization.org/faq
- Compatible wallets: webmonetization.org/wallets
- The monetization link element API: webmonetization.org/developers/link-element
- Behind the scenes: interledger.org/developers/blog (search the Web Monetization posts)
- Open Payments: openpayments.dev

TRY IT: Hands-on checklist
[ ] Create an account with a Web Monetization compatible wallet provider and note down your wallet address. (Check webmonetization.org/wallets for current providers.)
[ ] Install the browser extension and connect your wallet. (Follow webmonetization.org/supporters/get-started.)
[ ] Set a small budget and choose whether it renews monthly.
[ ] Use the link generator (webmonetization.org/publishers/link-tag-tool) to make a link with your wallet address.
[ ] Add the link to the head of a simple web page.
[ ] Open that page and check whether payments flow.
[ ] If nothing happens, check the FAQ (webmonetization.org/faq), then re-read the tag carefully.

(If something in these steps is different in the docs, follow the docs.)

KEY TAKEAWAYS
- Web Monetization lets value flow from audience to creator while the audience engages. No ads. No subscription gate.
- Supporters are in control. Sites cannot pull from wallets.
- A website declares it accepts Web Monetization by placing a link element with rel="monetization" and a wallet address in the head.
- The tag only declares the destination. The actual payment requires a compatible wallet, the extension, and user authorization.
- Web Monetization is not an ad blocker. It is complementary to other revenue models.


CHECKPOINT 2: THREE QUESTIONS

Question 1. Who decides how much a visitor pays and how often?
A. The website owner
B. The wallet provider
C. The visitor
D. Interledger

Question 2. Which HTML element tells a compatible implementation where to send payments?
A. A meta element with name="monetization"
B. A link element with rel="monetization" and an Open Payments wallet address in href
C. A script element
D. A title element

Question 3. A creator adds the correct tag to their page, but no payments arrive. Which is the most likely reason?
A. The tag cannot work without ads
B. No visitor has a compatible wallet and the extension, so no stream is being sent
C. The tag expires after a day
D. Payments need a separate account on every site

[PAGE BREAK]

CHECKPOINT 2: ANSWERS

Question 1: C. Supporters control whether, when and how much they pay. Sites cannot pull payments.

Question 2: B. The monetization link goes in the head and its href holds a valid Open Payments wallet address.

Question 3: B. The tag only declares where payments can be sent. Someone with a compatible wallet and the extension must actually send them. This is also why distribution still matters, which we return to in Chapter 4.


CHAPTER 4: THINKING WEB MONETIZATION

You now know what Web Monetization is and how to set it up. This chapter is the one that matters most, because it's about how to think with it.

Problems before technology

Here's a common mistake. People learn a new technology and ask: "Where can I add it?" That's the wrong question.

It's not about what Interledger can do for you. It's about what you can do with Interledger.

The better approach is to start from a problem. Ask: "What problems do these people have, and would this technology solve one of them?" Steve Jobs made a similar point: great products start from the experience people need, and then work backward to the technology, not the other way around.

So when you think about Web Monetization, don't look for places to add it. Look for problems. If the problem genuinely needs small, continuous payments, use it. If it doesn't, don't.

THINK IT THROUGH: Write down three problems you've personally seen in your community involving money, access or payment. Keep them. You will use them at the end of this chapter.

Beyond bloggers: can we use this outside digital content?

Yes, but we have to be technically precise.

Web Monetization specifically concerns the web, meaning the browser-facing experience. The ILP and Open Payments building blocks underneath can support broader payment architectures.

So when we explore physical examples, the correct way to say it is: "We are extending the micro-streaming, value-streaming model beyond traditional Web Monetization into ILP and Open Payments enabled applications and physical infrastructure."

The incorrect way is to say: "Your Wi-Fi router is Web Monetized."

This distinction matters. Be precise about what is and isn't Web Monetization.

CASE STUDY 2: THE CAMPUS THAT CHARGED BY USAGE

[This case study is built from your campus Wi-Fi scenario. Adjust names and details freely.]

A university in Nigeria runs campus Wi-Fi. For years, students have faced two options. The network is free but unreliable, funded by ads or by the university's general budget. Or it's a paid service at something like N10,000 a month.

Most students don't want a monthly plan. Some barely use the network one week, then depend on it heavily during exam preparation. A flat fee punishes the light user and under-charges the heavy one. The free alternative has no money to improve the service, so it stays slow.

Imagine a different design, which this case study explores as a thought experiment. A student connects. As they use bandwidth, a tiny value stream flows to the operator. Light users pay little. Heavy users pay more. The operator earns in proportion to real usage, and so has a reason to invest in better equipment.

Clever, but it raises hard questions that a good designer must answer:
Who receives the money? The university, the students' association, an independent Wi-Fi provider, or a community network?
What determines the rate? Per minute? Per megabyte? Per session? Per service tier?
How would students fund the stream? Does everyone have a compatible wallet?
What happens when the connection is poor? Do students pay for a service that isn't working?

Notice that this is not literally Web Monetization. A router isn't a web page. It's an ILP and Open Payments style programmable value flow applied to physical infrastructure. The lesson is that once you stop thinking "subscription or free", you discover a whole new pricing design space.

THINK IT THROUGH:
1. What's better in this model than a flat monthly fee? What's worse?
2. Which of the four questions above would you answer first, and why?
3. Who might oppose this model, and why?

More physical-world scenarios

The same idea can be applied in other places. As you read, remember that these are thought experiments, not ready-made products.

A community workspace. Instead of N5,000 a day, imagine a shared workspace in Lagos where payment tracks the time you actually use the space. You enter, work, leave, and your payment corresponds to your usage. This could interest coworking spaces, study spaces, community libraries and maker spaces.

A community water dispenser (IoT). Imagine a connected dispenser that can talk to a payment system: user requests water, device requests authorization, value transfers, water dispenses. Or the model could become a small amount per litre. The dispenser would be a connected device making payments, not a web page. That is not Web Monetization. It is an ILP/Open Payments-style programmable value flow applied to IoT infrastructure.

A solar microgrid. Instead of a flat monthly fee, a household pays according to the energy it actually consumes. A meter measures usage, and a payment stream goes to the provider. This is interesting because the physical resource itself is measurable. The economic relationship becomes: resource consumption -> continuous value flow, rather than subscription -> unlimited/limited access.

Shared agricultural equipment. A rural community shares a tractor, an irrigation pump or a processing machine. Instead of renting the machine for a flat daily fee, members pay according to measured use. This supports fractional access: people don't have to buy the equipment, they pay for the value they consume.

A word of caution: fractional real estate. You can imagine many people contributing small amounts toward a property and receiving proportional returns. But this quickly enters investment and securities regulation. ILP could provide payment infrastructure for such a system, but ownership, investment, securities, custody, identity checks (KYC) and anti-money-laundering rules (AML) would all be separate problems that must be solved properly. Don't say "just build it with ILP."

TRY IT: Pick one of the scenarios above, or one of your own. Answer: Who pays? Who receives? What is measured? What is the rate based on? What could go wrong?

[IMAGE PLACEHOLDER 4.1: A "design canvas" template with five blanks (Who pays? Who receives? What's measured? What's the rate based on? What could go wrong?) for readers to fill in.]

Where Web Monetization is a poor fit

Being honest about limits makes you a better thinker. Here are three.

Problem 1: Users still need a way to pay. A stream needs a funding source, a compatible wallet and user authorization. The docs at webmonetization.org/supporters/overview describe the network of compatible wallet providers as "nascent, but growing." Wallet providers are regulated entities; obtaining proper licensing can be expensive, complex and time-consuming. A compatible wallet provider may not yet be available in your area. If nobody funds the stream, your content earns N0.

Problem 2: Distribution still matters. Web Monetization doesn't bring you an audience. A creator still needs good content, search visibility, social media, community, referrals and partnerships. It can change the economic relationship, but not remove the need for distribution. (We'll spend all of Part 2 on this.)

Problem 3: Revenue can be unpredictable. Compare 100 subscribers at N5,000 a month, which is a fairly predictable N500,000, with streaming income that depends on audience size, engagement, how users fund their wallets, the payment rate and how many return. Creators may need more than one revenue source.

Hybrid monetization

This leads to the most realistic model: hybrid monetization. The Web Monetization docs describe it as complementary, meaning it can sit alongside advertising, subscriptions and other revenue. You don't have to choose one forever.

THINK IT THROUGH: Think of a creator you know. Which mix of revenue models would suit them best?

The "does this problem need it?" test

Go back to the three problems you wrote down earlier. For each one, ask:
1. Who exactly has this problem?
2. Is the money involved small, frequent and tied to usage, or large and occasional?
3. Can the thing being paid for be measured, such as time, a page, a litre, a unit of energy?
4. Do the people who would pay have any way to pay (a compatible wallet, a device, a connection)?
5. Is there a simpler solution that already works? If so, why not use it?

If you answer yes to the first four and no to the fifth, Web Monetization or an ILP-based design might be a good fit. Otherwise, a different solution may serve people better. Knowing when not to use a technology is part of understanding it.

TRY IT: Apply the test to your three problems. Which, if any, passes?

KEY TAKEAWAYS FOR PART 1
- Ads sell attention. Subscriptions require commitment. Web Monetization lets value flow as people engage.
- It sits at the application layer of Interledger. It is not ILP itself.
- The tag declares a destination. It doesn't move money by itself.
- Supporters control their payments. Sites can't pull from wallets.
- Beyond web pages, the same streaming idea can inspire designs for physical infrastructure, but be precise about what is and isn't Web Monetization.
- Start from the problem, not the technology.
- Web Monetization doesn't solve distribution, funding or predictability on its own.

Here is a question to carry into Part 2. Even if the technology is perfect and the problem is real, how do you get your first 100 people to actually use what you built?

[END OF PART 1 CONTENT DRAFT]
