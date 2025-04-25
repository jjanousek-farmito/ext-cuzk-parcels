<script lang="ts">
	import { Switch } from "@/components/ui/switch";
	import { config, opportunities } from "@/storage";
	import { Label } from "./ui/label";
	import { Button } from "./ui/button";
	import { messageToSW } from "src/content/crm/utils";
	import { onDestroy } from "svelte";
	import * as Accordion from "./ui/accordion";
	import { Separator } from "./ui/separator";
	import { Input } from "./ui/input";

	const handleClearStorage = () => {
		const approval = confirm(
			"Opravdu chcete smazat historii kontroly parcel?",
		);
		if (!approval) {
			return;
		}

		// Send message to service worker to clear storage
		messageToSW({ type: "clear-storage" }, true);
	};

	const handleDisableAlarm = () => {
		if (!confirm("Opravdu chcete vypnout automatické přihlášení?")) {
			return;
		}
		messageToSW({ type: "clear-alarms" });
	};
</script>

<main class="flex p-8 gap-8 box-border max-h-dvh">
	<form class="sticky t-0 w-full space-y-6 max-w-6/12">
		<h2 class="text-2xl font-bold">Nastavení</h2>
		<p class="text-muted-foreground text-sm">Nastavení aplikace CRM CUZK</p>
		{#if $config}
			{#each Object.entries($config) as [key, value] (key)}
				<!-- render control items by type -->
				{#if typeof value == "boolean"}
					<div
						class="flex flex-row items-center justify-between rounded-lg border p-4"
					>
						<div class="space-y-0.5">
							<Label>{key}</Label>
							<p class="text-muted-foreground text-[0.8rem]">
								{key}
							</p>
						</div>
						<Switch includeInput bind:checked={$config[key]} />
					</div>
				{:else if typeof value === "string" || typeof value === "number"}
					<div
						class="flex flex-row items-center justify-between rounded-lg border p-4"
					>
						<div class="space-y-0.5">
							<Label>{key}</Label>
							<p class="text-muted-foreground text-[0.8rem]">
								{key}
							</p>
						</div>
						<Input
							type="text"
							bind:value={$config[key]}
							class="max-w-32"
						/>
					</div>
				{/if}
			{/each}
		{/if}
		<Button
			variant="destructive"
			size="sm"
			type="button"
			on:click={handleClearStorage}>Smazat pamět</Button
		>
		<Button
			variant="warning"
			size="sm"
			type="button"
			on:click={handleDisableAlarm}>Vypnout automatické přihlášení</Button
		>
	</form>
	<!-- Print data from opportunities store grouped by opportunityId -->
	<div class="w-full space-y-6 max-w-6/12 max-h-[100vh] overflow-y-auto">
		{#if $opportunities}
			<Accordion.Root class="flex flex-col gap-4">
				{#each Object.entries($opportunities) as [opportunityId, parcels]}
					<Accordion.Item value={opportunityId} class="border-0">
						<Accordion.Trigger
							class="hover:no-underline hover:bg-gray-100 py-2 px-4"
						>
							<div class="flex gap-4 items-center">
								<h3 class="text-lg font-bold">
									{opportunityId}
								</h3>
								<Separator orientation="vertical" class="h-4" />
								<p class="text-muted-foreground text-sm">
									{parcels[0]?.owner ?? "Neznámý vlastník"}
								</p>
								<Separator orientation="vertical" class="h-4" />
								<p class="text-muted-foreground text-sm">
									Počet parcel: {parcels.length}
								</p>
							</div>
						</Accordion.Trigger>
						<Accordion.Content class="p-4">
							<a
								href={`https://crm.cmzf.cz/purchase/opportunity/${opportunityId}`}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex mb-4 text-sm text-blue-500 hover:underline"
							>
								Nákupní případ
							</a>
							<table
								class="w-full text-sm text-left text-gray-500 dark:text-gray-400"
							>
								<!-- owner, parcelNumber, lv, area -->
								<thead>
									<tr
										class="text-left bg-gray-700 text-white p-1"
									>
										<th class="p-1">Parcelní číslo</th>
										<th class="p-1 text-right">LV</th>
										<th class="p-1 text-right">Výměra</th>
									</tr>
								</thead>
								<tbody>
									{#each parcels as parcel}
										<tr
											class="text-left odd:bg-white even:bg-gray-100 p-1"
										>
											<td class="p-1"
												>{parcel.parcelNumber}</td
											>
											<td class="p-1 text-right"
												>{parcel.lv}</td
											>
											<td class="p-1 text-right"
												>{parcel.area} m<sup>2</sup></td
											>
										</tr>
									{/each}
								</tbody>
							</table>
						</Accordion.Content>
					</Accordion.Item>
				{/each}
			</Accordion.Root>
		{/if}
	</div>
</main>
