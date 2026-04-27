import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiCheckCircle } from 'react-icons/fi';

export default function OrderSuccess() {
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <>
      <Helmet><title>Order Confirmed — Shopperz Mart</title></Helmet>
      <div className="container">
        <div className="order-success">
          <div className="order-success__icon">
            <FiCheckCircle size={72} />
          </div>
          <h1>Order Placed Successfully!</h1>
          {orderId && <p className="text-muted">Order ID: <strong>#{orderId}</strong></p>}
          <p className="text-muted mt-2">Thank you for shopping with Shopperz Mart. You'll receive a confirmation notification shortly.</p>
          <div className="order-success__actions mt-6">
            <Link to="/account/orders" className="btn btn-primary">View My Orders</Link>
            <Link to="/products" className="btn btn-ghost">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </>
  );
}
