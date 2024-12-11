export default function PrivacyPolicy() {
  return (
    <div className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
      
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
        <p>When you use VIT Taxi Share, we collect the following types of information:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Personal information (name, email address, phone number)</li>
          <li>Location data for taxi sharing purposes</li>
          <li>Device information and usage statistics</li>
          <li>Payment information (processed securely through our payment partners)</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
        <p>We use the collected information to:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Facilitate taxi sharing between users</li>
          <li>Process payments and maintain accounts</li>
          <li>Improve our services and user experience</li>
          <li>Send important updates and notifications</li>
          <li>Ensure platform safety and security</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">3. Data Security</h2>
        <p>We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">4. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at:</p>
        <p>Email: saatvikdev001@gmail.com</p>
      </section>
    </div>
  )
}

