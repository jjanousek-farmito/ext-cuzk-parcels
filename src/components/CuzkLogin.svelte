<script>
	import { LogIn } from "lucide-svelte";
	import { Button } from "./ui/button";
	import { Badge } from "./ui/badge";

	import { cuzkLoginStatus } from "@/storage";
	import { messageToSW } from "@/content/crm/utils";

	function handleLogin() {
		messageToSW({
			type: "cuzk-login",
		});
	}
</script>

<Button size="sm" onclick={handleLogin}>
	<LogIn class="w-4 h-4 mr-2" />
	Přihlásit se na ČÚZK
</Button>

<style>
</style>
