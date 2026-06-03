export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-3xl">
      <h1 className="text-4xl font-heading font-bold text-text-primary mb-8">About Seamlyy</h1>
      <div className="prose prose-invert max-w-none text-text-secondary space-y-6">
        <p className="text-lg">
          Seamlyy is an open marketplace designed to bridge the gap between digital artists, traditional painters, and collectors through the power of Open Payments.
        </p>
        <h2 className="text-2xl font-heading font-semibold text-text-primary mt-12 mb-4">Our Mission</h2>
        <p>
          We believe that art should be accessible, and artists should be compensated fairly and instantly for their work. By leveraging the Interledger Protocol, Seamlyy removes the friction of traditional payment gateways, enabling borderless micro-transactions and one-time purchases.
        </p>
        <h2 className="text-2xl font-heading font-semibold text-text-primary mt-12 mb-4">Why Open Payments?</h2>
        <p>
          Open Payments allows anyone with a compatible digital wallet to send and receive money seamlessly across the web. This means no more platform lock-in. Artists own their payment pointers, and collectors can use their preferred wallet provider to unlock premium exhibitions or purchase high-resolution digital assets.
        </p>
      </div>
    </div>
  )
}
