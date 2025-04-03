<script lang="ts">
	import { Button } from "@/components/ui/button";
	import { Badge } from "@/components/ui/badge";
	import { Card, CardContent } from "@/components/ui/card";
	import { Separator } from "@/components/ui/separator";
	import { CheckCircle, AlertTriangle, XCircle, LogIn } from "lucide-svelte";

	let isLoggedIn = false;

	const stats = {
		discrepancies: 3,
		needRevision: 5,
		valid: 12,
	};

	function handleLogin() {
		isLoggedIn = !isLoggedIn;
	}
</script>

<div class="relative px-4 py-4 mx-auto mb-4 border rounded-2xl bg-white z-10 shadow-sm dark:bg-gray-800">
	<div class="flex flex-col sm:flex-row items-center gap-4">
		<div class="flex gap-4 flex-wrap w-full">
			<div class="flex gap-2 flex-wrap">
				<Button variant="default" disabled={!isLoggedIn}>Spustit kontrolu</Button>
				<Button variant="destructive">Zavřít CUZK karty</Button>
			</div>
			<div class="flex gap-2 flex-wrap ml-auto">
				<div class="flex gap-2 items-center">
					<Button variant="destructive" size="sm">
						<XCircle class="w-4 h-4 mr-1" />
						{stats.discrepancies}
					</Button>
					<Button variant="warning" size="sm">
						<AlertTriangle class="w-4 h-4 mr-1" />
						{stats.needRevision}
					</Button>
					<Button variant="success" size="sm">
						<CheckCircle class="w-4 h-4 mr-1" />
						{stats.valid}
					</Button>
				</div>
			</div>
			<div class="flex gap-2 flex-wrap ml-auto">
				<div class="flex gap-2 items-center">
					<span class="text-sm font-medium">CUZK:</span>
					<Badge variant={isLoggedIn ? "default" : "destructive"}>
						{isLoggedIn ? "Přihlášen" : "Nepřihlášen"}
					</Badge>
				</div>
				<Button variant="outline" onclick={handleLogin}>
					<LogIn class="w-4 h-4 mr-2" /> CUZK Přihlášení
				</Button>
			</div>
		</div>
	</div>
</div>