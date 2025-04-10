<script lang="ts">
	import { onDestroy, onMount } from "svelte";

	import { CheckCircle, AlertTriangle, XCircle, BetweenHorizonalStart, Table, Loader } from "lucide-svelte";

	import { Button } from "@/components/ui/button";
	import { Badge } from "@/components/ui/badge";
	import { Card, CardContent } from "@/components/ui/card";
	import { Separator } from "@/components/ui/separator";
	import { Switch } from "@/components/ui/switch";
	import { Label } from "@/components/ui/label";
	import * as Dialog from "@/components/ui/dialog";

	import CuzkLogin from "./CuzkLogin.svelte";

	import { cuzkLoginStatus, opportunities } from "@/storage";
	import { Validity } from "@/model/parcel";
	import { applyValidationResults, checkParcels, closeCuzkCards, getOpportunityId, getTableRows, insertGroupHeaders, messageToSW, registerParcels, removeGroupHeaders, removeParcelRowHighlight } from "@/content/crm/utils";

	let id = getOpportunityId();
	let { parcels = [] } = $props();

	let initialized = $state(false);
	let showLVHeaders = $state(false);
	let hasOpenedParcelTabs = $state(false);

	const stats = $state({
		invalid: 0,
		unknown: 0,
		valid: 0,
	});

	const dialog = $state({
		isOpen: false,
		title: "",
		message: "",
	});

	function handleParcelCheck() {
		console.log("handleParcelCheck");
		console.log(parcels);

		removeGroupHeaders();
		checkParcels(parcels);
	}

	function handleParcelRegister() {
		registerParcels(parcels);
		setTimeout(() => {
			initialized = true;
		}, 1000);
		parcels = opportunities.update((o) => {
			o[id] = parcels.map((parcel) => {
				console.log("parcel", parcel);
				parcel.validity = null;
				return parcel;
			});
			return o;
		});
		setTimeout(() => parcels.map(removeParcelRowHighlight), 500);

	}

	function handleCloseCuzkCards() {
		closeCuzkCards();
	}

	function handleLVHeaders() {
		showLVHeaders = !showLVHeaders;

		if (showLVHeaders) {
			insertGroupHeaders(getTableRows());
		} else {
			removeGroupHeaders();
		}
	}

	onMount(() => {
		if (showLVHeaders) {
			insertGroupHeaders(getTableRows());
		}
	});

	export function showDialog({ title, message }) {
		dialog.isOpen = true;
		dialog.title = title;
		dialog.message = message;
	}

	const unsubOps = opportunities.subscribe((o) => {
		if (Object.keys(o).length === 0) {
			return;
		}

		if (!o[id]) {
			return;
		}

		parcels = o[id];
		if (!initialized) initialized = true;

		applyValidationResults(parcels);

		stats.invalid = parcels.filter((parcel) => parcel.validity === Validity.INVALID).length;
		stats.unknown = parcels.filter((parcel) => parcel.validity === Validity.UNKNOWN).length;
		stats.valid = parcels.filter((parcel) => parcel.validity === Validity.VALID).length;

		hasOpenedParcelTabs = parcels.filter(({ cuzk }) => cuzk?.tabId).length > 0;

		// parcels = validateParcels(parcels);
		// apply validation results to each row
	});
	onDestroy(() => {
		unsubOps();
	});
</script>

<div class="relative px-3 py-3 mx-auto mb-4 border rounded-2xl bg-white z-10 shadow-sm dark:bg-gray-800">
	<div class="flex flex-col sm:flex-row items-center gap-4">
		<div class="flex gap-4 flex-wrap w-full">
			{#if !$cuzkLoginStatus}
				<div class="grid items-center justify-center w-full">
					<CuzkLogin />
				</div>
			{:else}
				<div class="flex gap-2 flex-wrap">
					<Button variant="default" size="sm" disabled={!initialized} onclick={handleParcelCheck}>Kontrola PV</Button>
					<Button variant="destructive" size="sm" disabled={!hasOpenedParcelTabs} onclick={handleCloseCuzkCards}>Zavřít CUZK karty</Button>
					<Button variant="warning" size="sm" onclick={handleParcelRegister}>Scan parcel</Button>
					<div class="flex items-center space-x-2 gap-2 justify-center">
						<Button variant="outline" size="sm" onclick={handleLVHeaders}>
							<div class="flex gap-2">
								{#if showLVHeaders}
									<Table />
								{:else}
									<BetweenHorizonalStart />
								{/if}
								{!showLVHeaders ? "rozdělit" : "sloučit"} LV
							</div>
						</Button>
					</div>
				</div>
				<div class="flex gap-2 flex-wrap ml-auto">
					<div class="flex gap-2 items-center">
						<p class="m-0">Ke kontrole: {parcels?.length}</p>
						<Badge variant="destructive" size="sm">
							<XCircle class="w-4 h-4 mr-1" />
							{stats.invalid}
						</Badge>
						<Badge variant="warning" size="sm">
							<AlertTriangle class="w-4 h-4 mr-1" />
							{stats.unknown}
						</Badge>
						<Badge variant="success" size="sm">
							<CheckCircle class="w-4 h-4 mr-1" />
							{stats.valid}
						</Badge>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- <ReportDialog {...dialog} bind:isOpen={dialog.isOpen} /> -->

<Dialog.Root bind:open={dialog.isOpen}>
	<!-- <Dialog.Trigger class={"outline"}>Edit Profile</Dialog.Trigger> -->
	<Dialog.Content class="sm:max-w-[640px]">
		<Dialog.Header>
			<Dialog.Title>{dialog.title}</Dialog.Title>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			{@html dialog.message}
		</div>
	</Dialog.Content>
</Dialog.Root>
