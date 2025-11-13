import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export default function Dashboard() {
	const { data: session, isPending } = authClient.useSession();
	const navigate = useNavigate();
	const [customerState, setCustomerState] = useState<any>(null);

	useEffect(() => {
		if (!session && !isPending) {
			navigate("/login");
		}
	}, [session, isPending, navigate]);

	useEffect(() => {
		async function fetchCustomerState() {
			if (session) {
				const { data } = await authClient.customer.state();
				setCustomerState(data);
			}
		}

		fetchCustomerState();
	}, [session]);

	if (isPending) {
		return <div>Loading...</div>;
	}

	const hasProSubscription = customerState?.activeSubscriptions?.length! > 0;
	console.log("Active subscriptions:", customerState?.activeSubscriptions);

	return (
		<div>
			<h1>Dashboard</h1>
			<p>Welcome {session?.user.name}</p>
			<p>Plan: {hasProSubscription ? "Pro" : "Free"}</p>
			{hasProSubscription ? (
				<Button onClick={async () => await authClient.customer.portal()}>
					Manage Subscription
				</Button>
			) : (
				<Button
					onClick={async () => await authClient.checkout({ slug: "pro" })}
				>
					Upgrade to Pro
				</Button>
			)}
		</div>
	);
}
