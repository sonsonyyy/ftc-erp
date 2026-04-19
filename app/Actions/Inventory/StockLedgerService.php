<?php

namespace App\Actions\Inventory;

use App\Enums\StockMovementType;
use App\Models\InventoryItem;
use App\Models\StockBalance;
use App\Models\StockIssuance;
use App\Models\StockIssuanceItem;
use App\Models\StockMovement;
use App\Models\StockReturn;
use App\Models\StockReturnItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockLedgerService
{
    /**
     * Record a manual stock movement.
     *
     * @param  array<string, mixed>  $validated
     */
    public function recordManualMovement(array $validated, ?User $user): StockMovement
    {
        return DB::transaction(function () use ($validated, $user): StockMovement {
            $movementType = StockMovementType::from($validated['movement_type']);

            if (! $movementType->isManualEntry()) {
                throw ValidationException::withMessages([
                    'movement_type' => 'Only manual stock movements can be recorded from this form.',
                ]);
            }

            return $this->applyMovement(
                warehouseId: (int) $validated['warehouse_id'],
                inventoryItemId: (int) $validated['inventory_item_id'],
                movementType: $movementType,
                quantity: $validated['quantity'],
                user: $user,
                movementDate: (string) $validated['movement_date'],
                referenceType: 'manual',
                referenceId: null,
                referenceNumber: $validated['reference_number'] ?? null,
                remarks: $validated['remarks'] ?? null,
                projectId: null,
                workOrderId: null,
                unitCost: $validated['unit_cost'] ?? null,
                validationKey: 'quantity',
            );
        });
    }

    /**
     * Create a stock issuance and its related movements.
     *
     * @param  array<string, mixed>  $validated
     */
    public function createIssuance(array $validated, ?User $user): StockIssuance
    {
        /** @var StockIssuance $issuance */
        $issuance = DB::transaction(function () use ($validated, $user): StockIssuance {
            $issuance = StockIssuance::query()->create([
                'issuance_no' => $validated['issuance_no'],
                'warehouse_id' => $validated['warehouse_id'],
                'project_id' => $validated['project_id'] ?? null,
                'work_order_id' => $validated['work_order_id'] ?? null,
                'issued_date' => $validated['issued_date'],
                'remarks' => $validated['remarks'] ?? null,
                'created_by' => $user?->getKey(),
            ]);

            foreach ($validated['items'] as $index => $item) {
                $issuanceItem = StockIssuanceItem::query()->create([
                    'stock_issuance_id' => $issuance->getKey(),
                    'inventory_item_id' => $item['inventory_item_id'],
                    'quantity' => $item['quantity'],
                    'remarks' => $item['remarks'] ?? null,
                ]);

                $inventoryItem = InventoryItem::query()->findOrFail($issuanceItem->inventory_item_id);

                $this->applyMovement(
                    warehouseId: $issuance->warehouse_id,
                    inventoryItemId: $issuanceItem->inventory_item_id,
                    movementType: StockMovementType::Issuance,
                    quantity: $issuanceItem->quantity,
                    user: $user,
                    movementDate: $issuance->issued_date?->toDateString() ?? now()->toDateString(),
                    referenceType: 'stock_issuance',
                    referenceId: $issuance->getKey(),
                    referenceNumber: $issuance->issuance_no,
                    remarks: $issuanceItem->remarks ?? $issuance->remarks,
                    projectId: $issuance->project_id,
                    workOrderId: $issuance->work_order_id,
                    unitCost: $inventoryItem->standard_cost,
                    validationKey: "items.{$index}.quantity",
                );
            }

            return $issuance;
        });

        return $issuance->load([
            'warehouse',
            'project',
            'workOrder',
            'createdBy',
            'items.inventoryItem',
        ]);
    }

    /**
     * Create a stock return and its related movements.
     *
     * @param  array<string, mixed>  $validated
     */
    public function createReturn(array $validated, ?User $user): StockReturn
    {
        /** @var StockReturn $return */
        $return = DB::transaction(function () use ($validated, $user): StockReturn {
            $return = StockReturn::query()->create([
                'return_no' => $validated['return_no'],
                'warehouse_id' => $validated['warehouse_id'],
                'project_id' => $validated['project_id'] ?? null,
                'work_order_id' => $validated['work_order_id'] ?? null,
                'returned_date' => $validated['returned_date'],
                'remarks' => $validated['remarks'] ?? null,
                'created_by' => $user?->getKey(),
            ]);

            foreach ($validated['items'] as $index => $item) {
                $returnItem = StockReturnItem::query()->create([
                    'stock_return_id' => $return->getKey(),
                    'inventory_item_id' => $item['inventory_item_id'],
                    'quantity' => $item['quantity'],
                    'remarks' => $item['remarks'] ?? null,
                ]);

                $inventoryItem = InventoryItem::query()->findOrFail($returnItem->inventory_item_id);

                $this->applyMovement(
                    warehouseId: $return->warehouse_id,
                    inventoryItemId: $returnItem->inventory_item_id,
                    movementType: StockMovementType::Return,
                    quantity: $returnItem->quantity,
                    user: $user,
                    movementDate: $return->returned_date?->toDateString() ?? now()->toDateString(),
                    referenceType: 'stock_return',
                    referenceId: $return->getKey(),
                    referenceNumber: $return->return_no,
                    remarks: $returnItem->remarks ?? $return->remarks,
                    projectId: $return->project_id,
                    workOrderId: $return->work_order_id,
                    unitCost: $inventoryItem->standard_cost,
                    validationKey: "items.{$index}.quantity",
                );
            }

            return $return;
        });

        return $return->load([
            'warehouse',
            'project',
            'workOrder',
            'createdBy',
            'items.inventoryItem',
        ]);
    }

    /**
     * Apply a stock movement and persist the resulting balance.
     */
    private function applyMovement(
        int $warehouseId,
        int $inventoryItemId,
        StockMovementType $movementType,
        float|int|string $quantity,
        ?User $user,
        string $movementDate,
        string $referenceType,
        ?int $referenceId,
        ?string $referenceNumber,
        ?string $remarks,
        ?int $projectId,
        ?int $workOrderId,
        float|int|string|null $unitCost,
        string $validationKey,
    ): StockMovement {
        $normalizedQuantity = $this->normalizeDecimal($quantity);
        $balance = StockBalance::query()->firstOrCreate(
            [
                'warehouse_id' => $warehouseId,
                'inventory_item_id' => $inventoryItemId,
            ],
            [
                'quantity_on_hand' => 0,
            ],
        );

        /** @var StockBalance $balance */
        $balance = StockBalance::query()
            ->whereKey($balance->getKey())
            ->lockForUpdate()
            ->firstOrFail();

        $currentQuantity = $this->normalizeDecimal($balance->quantity_on_hand);

        if ($movementType->isOutbound() && $currentQuantity < $normalizedQuantity) {
            $inventoryItem = InventoryItem::query()->findOrFail($inventoryItemId);

            throw ValidationException::withMessages([
                $validationKey => "Insufficient stock for {$inventoryItem->item_name} in the selected warehouse.",
            ]);
        }

        $nextQuantity = $movementType->isInbound()
            ? $currentQuantity + $normalizedQuantity
            : $currentQuantity - $normalizedQuantity;

        $balance->update([
            'quantity_on_hand' => $this->formatDecimal($nextQuantity),
        ]);

        return StockMovement::query()->create([
            'inventory_item_id' => $inventoryItemId,
            'warehouse_id' => $warehouseId,
            'project_id' => $projectId,
            'work_order_id' => $workOrderId,
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'reference_number' => $referenceNumber,
            'movement_type' => $movementType,
            'quantity' => $this->formatDecimal($normalizedQuantity),
            'balance_after' => $this->formatDecimal($nextQuantity),
            'unit_cost' => $unitCost === null ? null : $this->formatDecimal($unitCost),
            'movement_date' => $movementDate,
            'remarks' => $remarks,
            'created_by' => $user?->getKey(),
        ]);
    }

    /**
     * Normalize decimal inputs to two places for quantity math.
     */
    private function normalizeDecimal(float|int|string|null $value): float
    {
        return round((float) $value, 2);
    }

    /**
     * Format a decimal value for persistence.
     */
    private function formatDecimal(float|int|string $value): string
    {
        return number_format((float) $value, 2, '.', '');
    }
}
