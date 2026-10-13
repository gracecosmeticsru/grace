import {GuestCheckout} from '@/components/guest-checkout';
import {headers} from 'next/headers';
import {localOrderTestEnabled, hostedOrdersEnabled, hostedPickupEnabled} from '@/lib/order-runtime';

export const metadata = {title: 'Оформление заказа', robots: {index: false, follow: false}};
export const dynamic = 'force-dynamic';
export default async function Page() {
  const host = (await headers()).get('host') ?? '';
  const friendsOrders = hostedOrdersEnabled(host);
  return <GuestCheckout ordersEnabled={friendsOrders || localOrderTestEnabled(host)} friendsOrders={friendsOrders} pickupEnabled={!friendsOrders || hostedPickupEnabled()}/>;
}
