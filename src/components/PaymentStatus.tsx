"use client";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// The reason we made this into custom client component, is that so the thank-you page can still be a server side component. The benefit is for server side validation and actions so the page will never actually be rendered, unless the user is logged in and it's their order. Otherwise there won't even be a content flash.

interface PaymentStatusProps {
  orderEmail: string;
  orderId: string;
  isPaid: boolean;
}

const PaymentStatus = ({ orderEmail, orderId, isPaid }: PaymentStatusProps) => {
  const router = useRouter();

  const { data } = trpc.payment.pollOrderStatus.useQuery(
    { orderId },
    {
      enabled: isPaid === false, // Only querying as long as isPaid is confirmed to be successful/true
      refetchInterval: (data) => (data?.isPaid ? false : 1000), // Making the request every 1 second
    }
  );

  useEffect(() => {
    if (data?.isPaid) router.refresh();
  }, [data?.isPaid, router]);

  return (
    <div className="mt-16 grid grid-cols-2 gap-x-4 text-sm text-gray-600">
      <div>
        <p className="font-medium text-gray-900">Shipping To</p>
        <p>{orderEmail}</p>
      </div>

      <div>
        <p className="font-medium text-gray-900">Order Status</p>
        <p>{isPaid ? "Payment successful" : "Pending payment"}</p>
      </div>
    </div>
  );
};

export default PaymentStatus;
