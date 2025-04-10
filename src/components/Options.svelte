<script lang="ts">
	import { Switch } from "@/components/ui/switch";
	import { config } from "@/storage";
	import { Label } from "./ui/label";
	import { Button } from "./ui/button";
	import { messageToSW } from "@/content/crm/utils";

	function handleClearStorage() {
		const approval = confirm("Opravdu chcete smazat historii kontroly parcel?");
		if (!approval) {
			return;
		}

		// Send message to service worker to clear storage
		messageToSW({ type: "clear-storage-opportunities" }, true);
	}
</script>

<form class="w-full space-y-6 p-8 max-w-6/12">
	<h2 class="text-2xl font-bold">Nastavení</h2>
	<p class="text-muted-foreground text-sm">Nastavení aplikace CRM CUZK</p>
	{#each Object.entries($config) as [key, value] (key)}
		<!-- render control items by type -->
		{#if typeof value === "boolean"}
			<div class="flex flex-row items-center justify-between rounded-lg border p-4">
				<div class="space-y-0.5">
					<Label>{key}</Label>
					<p class="text-muted-foreground text-[0.8rem]">{key}</p>
				</div>
				<Switch includeInput bind:checked={$config[key]} />
			</div>
		{:else if typeof value === "string" || typeof value === "number"}
			<div class="flex flex-row items-center justify-between rounded-lg border p-4">
				<div class="space-y-0.5">
					<Label>{key}</Label>
					<p class="text-muted-foreground text-[0.8rem]">{key}</p>
				</div>
				<input type="text" bind:value={$config[key]} class="input" />
			</div>
		{/if}
	{/each}
	<Button variant="destructive" size="sm" type="button" on:click={handleClearStorage}>Smazat pamět</Button>
</form>
