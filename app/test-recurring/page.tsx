import TestRecurringPayment from "@/components/test-recurring-payment";

export default function TestRecurringPage() {
  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Payment Transaction Testing</h1>
          <p className="text-gray-400">Test payment details and recurring payment functionality using Transaction IDs</p>
        </div>
        <TestRecurringPayment />
      </div>
    </div>
  );
}