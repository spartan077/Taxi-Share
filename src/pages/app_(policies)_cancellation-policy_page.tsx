export default function CancellationPolicy() {
  return (
    <div className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold mb-6">Cancellation and Refund Policy</h1>
      
      <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">1. Cancellation Policy</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Free cancellation up to 1 hour before scheduled departure</li>
          <li>50% cancellation fee if cancelled within 1 hour of departure</li>
          <li>No refund for no-shows or cancellations after departure time</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">2. Refund Process</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Refunds are processed within 5-7 business days</li>
          <li>Refund amount depends on cancellation timing</li>
          <li>Refunds are credited to the original payment method</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">3. Exceptional Circumstances</h2>
        <p>Full refunds may be provided in cases of:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Service cancellation by VIT Taxi Share</li>
          <li>Technical issues preventing service delivery</li>
          <li>Emergency situations (with valid proof)</li>
        </ul>
      </section>
    </div>
  )
}

