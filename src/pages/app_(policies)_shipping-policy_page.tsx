export default function ShippingPolicy() {
  return (
    <div className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold mb-6">Service Delivery Policy</h1>
      
      <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">1. Service Delivery</h2>
        <p>VIT Taxi Share is a taxi sharing service platform. While we don't ship physical products, we ensure timely and reliable transportation services:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Rides are scheduled based on user-selected time slots</li>
          <li>Drivers arrive 5-10 minutes before scheduled departure</li>
          <li>Real-time tracking is available through our app</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">2. Service Standards</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>All vehicles are regularly maintained and inspected</li>
          <li>Drivers are verified and trained professionals</li>
          <li>24/7 customer support available</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">3. Service Areas</h2>
        <p>Our service is currently available within:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>VIT Campus and surrounding areas</li>
          <li>Major transportation hubs (airports, railway stations)</li>
          <li>Popular destinations within city limits</li>
        </ul>
      </section>
    </div>
  )
}

