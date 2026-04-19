<?php

namespace Database\Seeders;

use App\Actions\Inventory\StockLedgerService;
use App\Enums\InventoryItemStatus;
use App\Enums\StockMovementType;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\Project;
use App\Models\StockBalance;
use App\Models\StockIssuance;
use App\Models\StockIssuanceItem;
use App\Models\StockMovement;
use App\Models\StockReturn;
use App\Models\StockReturnItem;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\WorkOrder;
use Illuminate\Database\Seeder;
use RuntimeException;

class DemoInventorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Sprinkler Components',
                'description' => 'Sprinkler heads, hangers, and related installation hardware.',
            ],
            [
                'name' => 'Fire Alarm Devices',
                'description' => 'Detectors, modules, and alarm interface devices.',
            ],
            [
                'name' => 'Electrical Support',
                'description' => 'Panel batteries and auxiliary electrical materials.',
            ],
            [
                'name' => 'Valves and Mechanical',
                'description' => 'Mechanical valves and corrective replacement items.',
            ],
        ];

        foreach ($categories as $categoryData) {
            InventoryCategory::query()->updateOrCreate(
                ['name' => $categoryData['name']],
                ['description' => $categoryData['description']],
            );
        }

        $items = [
            [
                'item_code' => 'ITM-SPR-001',
                'sku' => 'SPR-QR-68',
                'item_name' => 'Quick-response sprinkler head',
                'category' => 'Sprinkler Components',
                'unit' => 'pcs',
                'reorder_level' => '50.00',
                'standard_cost' => '380.00',
                'status' => InventoryItemStatus::Active->value,
                'notes' => 'Primary stocked sprinkler head for retrofit and service work.',
            ],
            [
                'item_code' => 'ITM-HGR-001',
                'sku' => 'CLP-HGR-01',
                'item_name' => 'Pipe hanger clamp',
                'category' => 'Sprinkler Components',
                'unit' => 'pcs',
                'reorder_level' => '80.00',
                'standard_cost' => '65.00',
                'status' => InventoryItemStatus::Active->value,
                'notes' => 'General installation stock for ceiling void and riser support works.',
            ],
            [
                'item_code' => 'ITM-BAT-001',
                'sku' => 'BAT-12V-7AH',
                'item_name' => '12V 7Ah battery',
                'category' => 'Electrical Support',
                'unit' => 'pcs',
                'reorder_level' => '6.00',
                'standard_cost' => '950.00',
                'status' => InventoryItemStatus::Active->value,
                'notes' => 'Used for fire alarm control panel battery replacement.',
            ],
            [
                'item_code' => 'ITM-VLV-001',
                'sku' => 'VLV-BF-150',
                'item_name' => '150mm butterfly valve',
                'category' => 'Valves and Mechanical',
                'unit' => 'pc',
                'reorder_level' => '3.00',
                'standard_cost' => '4250.00',
                'status' => InventoryItemStatus::Active->value,
                'notes' => 'Kept for urgent corrective service and mechanical replacement jobs.',
            ],
            [
                'item_code' => 'ITM-SMK-001',
                'sku' => 'DET-SMK-01',
                'item_name' => 'Photoelectric smoke detector',
                'category' => 'Fire Alarm Devices',
                'unit' => 'pcs',
                'reorder_level' => '12.00',
                'standard_cost' => '1650.00',
                'status' => InventoryItemStatus::Active->value,
                'notes' => 'Common detector replacement stock for alarm rectification works.',
            ],
            [
                'item_code' => 'ITM-MOD-001',
                'sku' => 'MOD-IN-01',
                'item_name' => 'Input monitor module',
                'category' => 'Fire Alarm Devices',
                'unit' => 'pcs',
                'reorder_level' => '4.00',
                'standard_cost' => '2850.00',
                'status' => InventoryItemStatus::Active->value,
                'notes' => 'Module stock for addressable panel projects and service replacements.',
            ],
            [
                'item_code' => 'ITM-LEG-001',
                'sku' => 'DET-CONV-01',
                'item_name' => 'Conventional smoke detector',
                'category' => 'Fire Alarm Devices',
                'unit' => 'pcs',
                'reorder_level' => '0.00',
                'standard_cost' => '780.00',
                'status' => InventoryItemStatus::Inactive->value,
                'notes' => 'Legacy part retained for history and limited back-order reference.',
            ],
        ];

        foreach ($items as $itemData) {
            InventoryItem::query()->updateOrCreate(
                ['item_code' => $itemData['item_code']],
                [
                    'sku' => $itemData['sku'],
                    'item_name' => $itemData['item_name'],
                    'inventory_category_id' => $this->categoryId($itemData['category']),
                    'unit' => $itemData['unit'],
                    'reorder_level' => $itemData['reorder_level'],
                    'standard_cost' => $itemData['standard_cost'],
                    'status' => $itemData['status'],
                    'notes' => $itemData['notes'],
                ],
            );
        }

        $warehouses = [
            [
                'warehouse_code' => 'WH-MAIN',
                'warehouse_name' => 'Main Warehouse',
                'address' => 'FTC Operations Compound, Valenzuela City',
                'contact_person' => 'Carla Gomez',
                'contact_no' => '+63 917 810 2101',
                'is_active' => true,
                'notes' => 'Primary storage location for project and service stock.',
            ],
            [
                'warehouse_code' => 'WH-BUFFER',
                'warehouse_name' => 'Project Buffer Yard',
                'address' => 'Laguna staging yard near fabrication area',
                'contact_person' => 'Miguel Santos',
                'contact_no' => '+63 917 810 2102',
                'is_active' => true,
                'notes' => 'Temporary holding area for staged project materials.',
            ],
        ];

        foreach ($warehouses as $warehouseData) {
            Warehouse::query()->updateOrCreate(
                ['warehouse_code' => $warehouseData['warehouse_code']],
                [
                    'warehouse_name' => $warehouseData['warehouse_name'],
                    'address' => $warehouseData['address'],
                    'contact_person' => $warehouseData['contact_person'],
                    'contact_no' => $warehouseData['contact_no'],
                    'is_active' => $warehouseData['is_active'],
                    'notes' => $warehouseData['notes'],
                ],
            );
        }

        StockReturnItem::query()->delete();
        StockReturn::query()->delete();
        StockIssuanceItem::query()->delete();
        StockIssuance::query()->delete();
        StockMovement::query()->delete();
        StockBalance::query()->delete();

        $stockLedgerService = app(StockLedgerService::class);
        $warehouseUser = $this->userByEmail('warehouse@example.com');

        $manualMovements = [
            [
                'warehouse_code' => 'WH-MAIN',
                'item_code' => 'ITM-SPR-001',
                'movement_type' => StockMovementType::StockIn->value,
                'quantity' => '140.00',
                'unit_cost' => '380.00',
                'movement_date' => '2026-02-06',
                'reference_number' => 'DR-2026-0011',
                'remarks' => 'Initial replenishment for awarded retrofit and service work.',
            ],
            [
                'warehouse_code' => 'WH-MAIN',
                'item_code' => 'ITM-HGR-001',
                'movement_type' => StockMovementType::StockIn->value,
                'quantity' => '160.00',
                'unit_cost' => '65.00',
                'movement_date' => '2026-02-06',
                'reference_number' => 'DR-2026-0012',
                'remarks' => 'Bulk replenishment for ongoing installation projects.',
            ],
            [
                'warehouse_code' => 'WH-MAIN',
                'item_code' => 'ITM-BAT-001',
                'movement_type' => StockMovementType::StockIn->value,
                'quantity' => '4.00',
                'unit_cost' => '950.00',
                'movement_date' => '2026-03-01',
                'reference_number' => 'DR-2026-0028',
                'remarks' => 'Battery stock received for service support.',
            ],
            [
                'warehouse_code' => 'WH-MAIN',
                'item_code' => 'ITM-VLV-001',
                'movement_type' => StockMovementType::StockIn->value,
                'quantity' => '3.00',
                'unit_cost' => '4250.00',
                'movement_date' => '2026-04-02',
                'reference_number' => 'DR-2026-0037',
                'remarks' => 'Urgent mechanical stock received for emergency corrective work.',
            ],
            [
                'warehouse_code' => 'WH-MAIN',
                'item_code' => 'ITM-SMK-001',
                'movement_type' => StockMovementType::StockIn->value,
                'quantity' => '10.00',
                'unit_cost' => '1650.00',
                'movement_date' => '2026-03-18',
                'reference_number' => 'DR-2026-0031',
                'remarks' => 'Detector replenishment for alarm rectification works.',
            ],
            [
                'warehouse_code' => 'WH-MAIN',
                'item_code' => 'ITM-MOD-001',
                'movement_type' => StockMovementType::StockIn->value,
                'quantity' => '8.00',
                'unit_cost' => '2850.00',
                'movement_date' => '2026-03-18',
                'reference_number' => 'DR-2026-0032',
                'remarks' => 'Module stock for alarm system service support.',
            ],
            [
                'warehouse_code' => 'WH-BUFFER',
                'item_code' => 'ITM-SPR-001',
                'movement_type' => StockMovementType::StockIn->value,
                'quantity' => '24.00',
                'unit_cost' => '380.00',
                'movement_date' => '2026-02-08',
                'reference_number' => 'TRF-2026-0001',
                'remarks' => 'Project staging balance loaded into the Laguna buffer yard.',
            ],
            [
                'warehouse_code' => 'WH-BUFFER',
                'item_code' => 'ITM-HGR-001',
                'movement_type' => StockMovementType::StockIn->value,
                'quantity' => '18.00',
                'unit_cost' => '65.00',
                'movement_date' => '2026-02-08',
                'reference_number' => 'TRF-2026-0002',
                'remarks' => 'Project staging clamps transferred to the buffer yard.',
            ],
            [
                'warehouse_code' => 'WH-MAIN',
                'item_code' => 'ITM-SMK-001',
                'movement_type' => StockMovementType::AdjustmentDecrease->value,
                'quantity' => '1.00',
                'unit_cost' => '1650.00',
                'movement_date' => '2026-04-10',
                'reference_number' => 'ADJ-2026-0004',
                'remarks' => 'Damaged detector removed from usable stock during cycle count.',
            ],
        ];

        foreach ($manualMovements as $movement) {
            $stockLedgerService->recordManualMovement([
                'warehouse_id' => $this->warehouseId($movement['warehouse_code']),
                'inventory_item_id' => $this->itemId($movement['item_code']),
                'movement_type' => $movement['movement_type'],
                'quantity' => $movement['quantity'],
                'unit_cost' => $movement['unit_cost'],
                'movement_date' => $movement['movement_date'],
                'reference_number' => $movement['reference_number'],
                'remarks' => $movement['remarks'],
            ], $warehouseUser);
        }

        $stockLedgerService->createIssuance([
            'issuance_no' => 'ISS-2026-0001',
            'warehouse_id' => $this->warehouseId('WH-MAIN'),
            'project_id' => $this->projectId('PRJ-2026-0001'),
            'work_order_id' => $this->workOrderId('WO-2026-0001'),
            'issued_date' => '2026-02-10',
            'remarks' => 'Initial project pull-out for the Tower A installation support work order.',
            'items' => [
                [
                    'inventory_item_id' => $this->itemId('ITM-SPR-001'),
                    'quantity' => '48.00',
                    'remarks' => 'Work order line support for sprinkler head installation.',
                ],
                [
                    'inventory_item_id' => $this->itemId('ITM-HGR-001'),
                    'quantity' => '60.00',
                    'remarks' => 'Ceiling void hanger support materials.',
                ],
            ],
        ], $warehouseUser);

        $stockLedgerService->createIssuance([
            'issuance_no' => 'ISS-2026-0002',
            'warehouse_id' => $this->warehouseId('WH-MAIN'),
            'project_id' => null,
            'work_order_id' => $this->workOrderId('WO-2026-0003'),
            'issued_date' => '2026-03-15',
            'remarks' => 'Battery pull-out for the clean agent room restoration service visit.',
            'items' => [
                [
                    'inventory_item_id' => $this->itemId('ITM-BAT-001'),
                    'quantity' => '2.00',
                    'remarks' => 'Panel battery replacement set.',
                ],
            ],
        ], $warehouseUser);

        $stockLedgerService->createIssuance([
            'issuance_no' => 'ISS-2026-0003',
            'warehouse_id' => $this->warehouseId('WH-MAIN'),
            'project_id' => null,
            'work_order_id' => $this->workOrderId('WO-2026-0004'),
            'issued_date' => '2026-04-05',
            'remarks' => 'Emergency valve issue for warehouse riser corrective work.',
            'items' => [
                [
                    'inventory_item_id' => $this->itemId('ITM-VLV-001'),
                    'quantity' => '1.00',
                    'remarks' => 'Corrective replacement valve.',
                ],
            ],
        ], $warehouseUser);

        $stockLedgerService->createReturn([
            'return_no' => 'RET-2026-0001',
            'warehouse_id' => $this->warehouseId('WH-MAIN'),
            'project_id' => $this->projectId('PRJ-2026-0001'),
            'work_order_id' => $this->workOrderId('WO-2026-0001'),
            'returned_date' => '2026-02-18',
            'remarks' => 'Unused clamps returned after installation quantity reconciliation.',
            'items' => [
                [
                    'inventory_item_id' => $this->itemId('ITM-HGR-001'),
                    'quantity' => '6.00',
                    'remarks' => 'Excess issue reversed after actual usage count.',
                ],
            ],
        ], $warehouseUser);
    }

    /**
     * Resolve a category name to its database identifier.
     */
    private function categoryId(string $categoryName): int
    {
        $categoryId = InventoryCategory::query()
            ->where('name', $categoryName)
            ->value('id');

        if ($categoryId === null) {
            throw new RuntimeException("Inventory category [{$categoryName}] was not found while seeding inventory.");
        }

        return (int) $categoryId;
    }

    /**
     * Resolve an inventory item code to its database identifier.
     */
    private function itemId(string $itemCode): int
    {
        $itemId = InventoryItem::query()
            ->where('item_code', $itemCode)
            ->value('id');

        if ($itemId === null) {
            throw new RuntimeException("Inventory item [{$itemCode}] was not found while seeding inventory.");
        }

        return (int) $itemId;
    }

    /**
     * Resolve a warehouse code to its database identifier.
     */
    private function warehouseId(string $warehouseCode): int
    {
        $warehouseId = Warehouse::query()
            ->where('warehouse_code', $warehouseCode)
            ->value('id');

        if ($warehouseId === null) {
            throw new RuntimeException("Warehouse [{$warehouseCode}] was not found while seeding inventory.");
        }

        return (int) $warehouseId;
    }

    /**
     * Resolve a project number to its database identifier.
     */
    private function projectId(string $projectNo): int
    {
        $projectId = Project::query()
            ->where('project_no', $projectNo)
            ->value('id');

        if ($projectId === null) {
            throw new RuntimeException("Project [{$projectNo}] was not found while seeding inventory.");
        }

        return (int) $projectId;
    }

    /**
     * Resolve a work order number to its database identifier.
     */
    private function workOrderId(string $workOrderNo): int
    {
        $workOrderId = WorkOrder::query()
            ->where('work_order_no', $workOrderNo)
            ->value('id');

        if ($workOrderId === null) {
            throw new RuntimeException("Work order [{$workOrderNo}] was not found while seeding inventory.");
        }

        return (int) $workOrderId;
    }

    /**
     * Resolve a demo user by email.
     */
    private function userByEmail(string $email): User
    {
        $user = User::query()->where('email', $email)->first();

        if ($user === null) {
            throw new RuntimeException("User [{$email}] was not found while seeding inventory.");
        }

        return $user;
    }
}
