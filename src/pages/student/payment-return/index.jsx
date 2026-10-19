import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  captureAndFinalizePaymentService,
  completeStripeCheckoutService,
} from "@/services";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function PaymentReturnPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const provider = params.get("provider");
  const paymentId = params.get("paymentId");
  const payerId = params.get("PayerID");
  const sessionId = params.get("session_id");
  const stripeOrderId = params.get("orderId");
  const [statusMessage, setStatusMessage] = useState(
    "Processing payment... Please wait"
  );

  useEffect(() => {
    async function finalizePayment() {
      try {
        let response;
        if (provider === "stripe" && sessionId && stripeOrderId) {
          response = await completeStripeCheckoutService(
            stripeOrderId,
            sessionId
          );
        } else if (paymentId && payerId) {
          const orderId = JSON.parse(sessionStorage.getItem("currentOrderId"));
          response = await captureAndFinalizePaymentService(
            paymentId,
            payerId,
            orderId
          );
        } else {
          setStatusMessage(
            "Payment was cancelled or could not be verified. You have not been enrolled."
          );
          return;
        }

        if (!response?.success) {
          setStatusMessage(
            response?.message || "Payment could not be confirmed."
          );
          return;
        }

        sessionStorage.removeItem("currentOrderId");
        window.location.replace("/student-courses");
      } catch (error) {
        setStatusMessage(
          error?.response?.data?.message ||
            "Payment could not be confirmed. Please contact support if you were charged."
        );
      }
    }

    finalizePayment();
  }, [payerId, paymentId, provider, sessionId, stripeOrderId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{statusMessage}</CardTitle>
      </CardHeader>
    </Card>
  );
}

export default PaymentReturnPage;
