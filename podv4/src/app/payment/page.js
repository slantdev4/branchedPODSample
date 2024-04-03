// Import PaymentComponent
import PaymentComponent from '../components/paymentComponent';

// Inside your page component
const Payment = () => {
  return (
    <div className="h-screen bg-gradient-to-bl from-blue-500 to-gray-100">
      <div className="flex items-center justify-center min-h-90">

        {/* Other content */}
        <PaymentComponent />
      </div>
    </div>
  );
};

export default Payment;
