export default function Terms() {
  return (
    <div className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
      
      <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
        <p>By accessing and using VIT Taxi Share, you agree to be bound by these Terms and Conditions.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">2. User Responsibilities</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Provide accurate and complete information</li>
          <li>Maintain the confidentiality of your account</li>
          <li>Comply with all applicable laws and regulations</li>
          <li>Be respectful to other users and drivers</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">3. Service Rules</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Users must be VIT students or staff members</li>
          <li>Rides must be booked in advance</li>
          <li>Cancellations must follow our cancellation policy</li>
          <li>Users are responsible for their personal belongings</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">4. Limitation of Liability</h2>
        <p>VIT Taxi Share is not liable for any indirect, incidental, or consequential damages arising from the use of our service.</p>
      </section>
    </div>
  )
}

