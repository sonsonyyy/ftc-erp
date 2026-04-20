<?php

namespace Database\Seeders;

use App\Actions\Purchasing\ReceivePurchaseOrderAction;
use App\Enums\PurchaseOrderStatus;
use App\Enums\PurchaseRequestStatus;
use App\Models\InventoryItem;
use App\Models\Project;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\PurchaseReceipt;
use App\Models\PurchaseReceiptItem;
use App\Models\PurchaseRequest;
use App\Models\PurchaseRequestItem;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\WorkOrder;
use Illuminate\Database\Seeder;
use RuntimeException;

class DemoPurchasingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        PurchaseReceiptItem::query()->delete();
        PurchaseReceipt::query()->delete();
        PurchaseOrderItem::query()->delete();
        PurchaseOrder::query()->withTrashed()->forceDelete();
        PurchaseRequestItem::query()->delete();
        PurchaseRequest::query()->withTrashed()->forceDelete();
        Supplier::query()->withTrashed()->forceDelete();

        $suppliers = [
            [
                'supplier_code' => 'SUP-10001',
                'company_name' => 'Allied Fire Supply Traders',
                'contact_person' => 'Marco Lopez',
                'phone' => '+63 917 800 4101',
                'email' => 'sales@alliedfiresupply.example',
                'tin' => '102-445-788-000',
                'address' => 'Valenzuela industrial district',
                'payment_terms' => '30 days',
                'is_active' => true,
                'notes' => 'Primary supplier for sprinkler heads, hangers, and common installation consumables.',
            ],
            [
                'supplier_code' => 'SUP-10002',
                'company_name' => 'Metro Alarm Components, Inc.',
                'contact_person' => 'Aileen Cruz',
                'phone' => '+63 917 800 4102',
                'email' => 'orders@metroalarm.example',
                'tin' => '215-663-102-000',
                'address' => 'Quezon City electronics strip',
                'payment_terms' => '15 days',
                'is_active' => true,
                'notes' => 'Used for smoke detectors, modules, and panel-related alarm hardware.',
            ],
            [
                'supplier_code' => 'SUP-10003',
                'company_name' => 'ValveTech Industrial Supply',
                'contact_person' => 'Rogelio Tan',
                'phone' => '+63 917 800 4103',
                'email' => 'service@valvetech.example',
                'tin' => '318-990-551-000',
                'address' => 'Meycauayan service road, Bulacan',
                'payment_terms' => 'Cash on delivery',
                'is_active' => true,
                'notes' => 'Emergency vendor for valves, corrective parts, and urgent mechanical replacements.',
            ],
        ];

        foreach ($suppliers as $supplierData) {
            Supplier::query()->create($supplierData);
        }

        $preparedBy = $this->user('purchasing@example.com');
        $receivedBy = $this->user('warehouse@example.com');

        $purchaseRequests = [
            [
                'request_no' => 'PR-2026-0001',
                'supplier_code' => 'SUP-10001',
                'project_no' => 'PRJ-2026-0001',
                'work_order_no' => 'WO-2026-0001',
                'request_date' => '2026-02-08',
                'needed_by' => '2026-02-12',
                'status' => PurchaseRequestStatus::Ordered,
                'purpose' => 'Tower A sprinkler retrofit material pull for heads and supports',
                'remarks' => 'Covers ceiling work packages and staged floor-by-floor installation release.',
                'items' => [
                    [
                        'item_code' => 'ITM-SPR-001',
                        'requested_quantity' => '80.00',
                        'estimated_unit_cost' => '380.00',
                        'remarks' => 'Quick-response heads for tenant floors.',
                    ],
                    [
                        'item_code' => 'ITM-HGR-001',
                        'requested_quantity' => '100.00',
                        'estimated_unit_cost' => '65.00',
                        'remarks' => 'Additional hanger supports for congested ceiling areas.',
                    ],
                ],
            ],
            [
                'request_no' => 'PR-2026-0002',
                'supplier_code' => 'SUP-10002',
                'project_no' => 'PRJ-2026-0002',
                'work_order_no' => 'WO-2026-0005',
                'request_date' => '2026-04-16',
                'needed_by' => '2026-04-23',
                'status' => PurchaseRequestStatus::Submitted,
                'purpose' => 'East Tower pump room alarm devices and interface modules',
                'remarks' => 'Pending final purchasing release while shutdown windows are being confirmed.',
                'items' => [
                    [
                        'item_code' => 'ITM-SMK-001',
                        'requested_quantity' => '12.00',
                        'estimated_unit_cost' => '1650.00',
                        'remarks' => 'Replacement smoke detectors for pump room and interface areas.',
                    ],
                    [
                        'item_code' => 'ITM-MOD-001',
                        'requested_quantity' => '6.00',
                        'estimated_unit_cost' => '2850.00',
                        'remarks' => 'Input monitor modules for new alarm monitoring points.',
                    ],
                ],
            ],
            [
                'request_no' => 'PR-2026-0003',
                'supplier_code' => 'SUP-10003',
                'project_no' => null,
                'work_order_no' => 'WO-2026-0004',
                'request_date' => '2026-04-05',
                'needed_by' => '2026-04-05',
                'status' => PurchaseRequestStatus::Ordered,
                'purpose' => 'Emergency replenishment of warehouse valve replacement stock',
                'remarks' => 'Raised immediately after emergency deployment consumed the remaining riser valve stock.',
                'items' => [
                    [
                        'item_code' => 'ITM-VLV-001',
                        'requested_quantity' => '2.00',
                        'estimated_unit_cost' => '4250.00',
                        'remarks' => 'Buffer stock for urgent corrective service.',
                    ],
                ],
            ],
        ];

        foreach ($purchaseRequests as $requestData) {
            $purchaseRequest = PurchaseRequest::query()->create([
                'request_no' => $requestData['request_no'],
                'supplier_id' => $this->supplierId($requestData['supplier_code']),
                'project_id' => $requestData['project_no'] !== null
                    ? $this->projectId($requestData['project_no'])
                    : null,
                'work_order_id' => $requestData['work_order_no'] !== null
                    ? $this->workOrderId($requestData['work_order_no'])
                    : null,
                'requested_by_user_id' => $preparedBy->getKey(),
                'request_date' => $requestData['request_date'],
                'needed_by' => $requestData['needed_by'],
                'status' => $requestData['status']->value,
                'purpose' => $requestData['purpose'],
                'remarks' => $requestData['remarks'],
            ]);

            foreach ($requestData['items'] as $item) {
                $inventoryItem = $this->inventoryItem($item['item_code']);

                $purchaseRequest->items()->create([
                    'inventory_item_id' => $inventoryItem->getKey(),
                    'item_description' => $inventoryItem->item_name,
                    'unit' => $inventoryItem->unit,
                    'requested_quantity' => $item['requested_quantity'],
                    'estimated_unit_cost' => $item['estimated_unit_cost'],
                    'remarks' => $item['remarks'],
                ]);
            }
        }

        $purchaseOrders = [
            [
                'po_no' => 'PO-2026-0001',
                'purchase_request_no' => 'PR-2026-0001',
                'supplier_code' => 'SUP-10001',
                'project_no' => 'PRJ-2026-0001',
                'work_order_no' => 'WO-2026-0001',
                'order_date' => '2026-02-10',
                'expected_date' => '2026-02-14',
                'status' => PurchaseOrderStatus::Approved,
                'supplier_reference' => 'AFS-Q-9821',
                'remarks' => 'First batch for retrofit floors 8 to 12.',
                'items' => [
                    [
                        'purchase_request_item_code' => 'ITM-SPR-001',
                        'item_code' => 'ITM-SPR-001',
                        'ordered_quantity' => '80.00',
                        'unit_cost' => '380.00',
                        'remarks' => 'Partial staged delivery accepted due floor access phasing.',
                    ],
                    [
                        'purchase_request_item_code' => 'ITM-HGR-001',
                        'item_code' => 'ITM-HGR-001',
                        'ordered_quantity' => '100.00',
                        'unit_cost' => '65.00',
                        'remarks' => 'Support hardware for main ceiling package.',
                    ],
                ],
            ],
            [
                'po_no' => 'PO-2026-0002',
                'purchase_request_no' => 'PR-2026-0003',
                'supplier_code' => 'SUP-10003',
                'project_no' => null,
                'work_order_no' => 'WO-2026-0004',
                'order_date' => '2026-04-05',
                'expected_date' => '2026-04-05',
                'status' => PurchaseOrderStatus::Approved,
                'supplier_reference' => 'VT-ER-455',
                'remarks' => 'Emergency replenishment released same day.',
                'items' => [
                    [
                        'purchase_request_item_code' => 'ITM-VLV-001',
                        'item_code' => 'ITM-VLV-001',
                        'ordered_quantity' => '2.00',
                        'unit_cost' => '4250.00',
                        'remarks' => 'Emergency valve replenishment.',
                    ],
                ],
            ],
            [
                'po_no' => 'PO-2026-0003',
                'purchase_request_no' => 'PR-2026-0002',
                'supplier_code' => 'SUP-10002',
                'project_no' => 'PRJ-2026-0002',
                'work_order_no' => 'WO-2026-0005',
                'order_date' => '2026-04-20',
                'expected_date' => '2026-04-25',
                'status' => PurchaseOrderStatus::Submitted,
                'supplier_reference' => 'MAC-PO-2204',
                'remarks' => 'Awaiting final supplier confirmation before approval.',
                'items' => [
                    [
                        'purchase_request_item_code' => 'ITM-SMK-001',
                        'item_code' => 'ITM-SMK-001',
                        'ordered_quantity' => '12.00',
                        'unit_cost' => '1650.00',
                        'remarks' => 'For pump room replacement scope.',
                    ],
                    [
                        'purchase_request_item_code' => 'ITM-MOD-001',
                        'item_code' => 'ITM-MOD-001',
                        'ordered_quantity' => '6.00',
                        'unit_cost' => '2850.00',
                        'remarks' => 'For monitoring point expansion.',
                    ],
                ],
            ],
        ];

        foreach ($purchaseOrders as $orderData) {
            $purchaseRequest = $this->purchaseRequest($orderData['purchase_request_no']);

            $purchaseOrder = PurchaseOrder::query()->create([
                'po_no' => $orderData['po_no'],
                'purchase_request_id' => $purchaseRequest->getKey(),
                'supplier_id' => $this->supplierId($orderData['supplier_code']),
                'project_id' => $orderData['project_no'] !== null
                    ? $this->projectId($orderData['project_no'])
                    : null,
                'work_order_id' => $orderData['work_order_no'] !== null
                    ? $this->workOrderId($orderData['work_order_no'])
                    : null,
                'ordered_by_user_id' => $preparedBy->getKey(),
                'order_date' => $orderData['order_date'],
                'expected_date' => $orderData['expected_date'],
                'status' => $orderData['status']->value,
                'supplier_reference' => $orderData['supplier_reference'],
                'remarks' => $orderData['remarks'],
            ]);

            foreach ($orderData['items'] as $item) {
                $inventoryItem = $this->inventoryItem($item['item_code']);
                $purchaseRequestItem = $purchaseRequest->items()
                    ->where('inventory_item_id', $inventoryItem->getKey())
                    ->first();

                $purchaseOrder->items()->create([
                    'purchase_request_item_id' => $purchaseRequestItem?->getKey(),
                    'inventory_item_id' => $inventoryItem->getKey(),
                    'item_description' => $inventoryItem->item_name,
                    'unit' => $inventoryItem->unit,
                    'ordered_quantity' => $item['ordered_quantity'],
                    'unit_cost' => $item['unit_cost'],
                    'remarks' => $item['remarks'],
                ]);
            }

            if ($orderData['status'] !== PurchaseOrderStatus::Cancelled) {
                $purchaseRequest->update([
                    'status' => PurchaseRequestStatus::Ordered,
                ]);
            }
        }

        /** @var ReceivePurchaseOrderAction $receivePurchaseOrderAction */
        $receivePurchaseOrderAction = app(ReceivePurchaseOrderAction::class);

        $receipts = [
            [
                'receipt_no' => 'RCV-2026-0001',
                'po_no' => 'PO-2026-0001',
                'warehouse_code' => 'WH-MAIN',
                'received_date' => '2026-02-13',
                'supplier_reference' => 'DR-2026-0141',
                'remarks' => 'First staged delivery for initial retrofit floors.',
                'items' => [
                    [
                        'item_code' => 'ITM-SPR-001',
                        'received_quantity' => '50.00',
                        'remarks' => 'Balance to follow on second delivery.',
                    ],
                    [
                        'item_code' => 'ITM-HGR-001',
                        'received_quantity' => '70.00',
                        'remarks' => 'Remaining hardware delayed by one day.',
                    ],
                ],
            ],
            [
                'receipt_no' => 'RCV-2026-0002',
                'po_no' => 'PO-2026-0002',
                'warehouse_code' => 'WH-MAIN',
                'received_date' => '2026-04-05',
                'supplier_reference' => 'DR-2026-0210',
                'remarks' => 'Emergency valve replenishment received in full.',
                'items' => [
                    [
                        'item_code' => 'ITM-VLV-001',
                        'received_quantity' => '2.00',
                        'remarks' => 'Received with same-day emergency release.',
                    ],
                ],
            ],
        ];

        foreach ($receipts as $receiptData) {
            $purchaseOrder = $this->purchaseOrder($receiptData['po_no']);
            $purchaseOrder->load('items');

            $items = collect($receiptData['items'])
                ->map(function (array $item) use ($purchaseOrder): array {
                    $inventoryItem = $this->inventoryItem($item['item_code']);
                    $purchaseOrderItem = $purchaseOrder->items
                        ->firstWhere('inventory_item_id', $inventoryItem->getKey());

                    if ($purchaseOrderItem === null) {
                        throw new RuntimeException("Purchase-order item [{$item['item_code']}] was not found for [{$purchaseOrder->po_no}].");
                    }

                    return [
                        'purchase_order_item_id' => $purchaseOrderItem->getKey(),
                        'received_quantity' => $item['received_quantity'],
                        'remarks' => $item['remarks'],
                    ];
                })
                ->all();

            $receivePurchaseOrderAction->handle($purchaseOrder, [
                'receipt_no' => $receiptData['receipt_no'],
                'warehouse_id' => $this->warehouseId($receiptData['warehouse_code']),
                'received_date' => $receiptData['received_date'],
                'supplier_reference' => $receiptData['supplier_reference'],
                'remarks' => $receiptData['remarks'],
                'items' => $items,
            ], $receivedBy);
        }
    }

    private function supplierId(string $supplierCode): int
    {
        $supplierId = Supplier::query()
            ->where('supplier_code', $supplierCode)
            ->value('id');

        if ($supplierId === null) {
            throw new RuntimeException("Supplier [{$supplierCode}] was not found while seeding purchasing records.");
        }

        return (int) $supplierId;
    }

    private function inventoryItem(string $itemCode): InventoryItem
    {
        $inventoryItem = InventoryItem::query()
            ->where('item_code', $itemCode)
            ->first();

        if ($inventoryItem === null) {
            throw new RuntimeException("Inventory item [{$itemCode}] was not found while seeding purchasing records.");
        }

        return $inventoryItem;
    }

    private function projectId(string $projectNo): int
    {
        $projectId = Project::query()
            ->where('project_no', $projectNo)
            ->value('id');

        if ($projectId === null) {
            throw new RuntimeException("Project [{$projectNo}] was not found while seeding purchasing records.");
        }

        return (int) $projectId;
    }

    private function workOrderId(string $workOrderNo): int
    {
        $workOrderId = WorkOrder::query()
            ->where('work_order_no', $workOrderNo)
            ->value('id');

        if ($workOrderId === null) {
            throw new RuntimeException("Work order [{$workOrderNo}] was not found while seeding purchasing records.");
        }

        return (int) $workOrderId;
    }

    private function purchaseRequest(string $requestNo): PurchaseRequest
    {
        $purchaseRequest = PurchaseRequest::query()
            ->with('items')
            ->where('request_no', $requestNo)
            ->first();

        if ($purchaseRequest === null) {
            throw new RuntimeException("Purchase request [{$requestNo}] was not found while seeding purchasing records.");
        }

        return $purchaseRequest;
    }

    private function purchaseOrder(string $poNo): PurchaseOrder
    {
        $purchaseOrder = PurchaseOrder::query()
            ->where('po_no', $poNo)
            ->first();

        if ($purchaseOrder === null) {
            throw new RuntimeException("Purchase order [{$poNo}] was not found while seeding purchasing records.");
        }

        return $purchaseOrder;
    }

    private function warehouseId(string $warehouseCode): int
    {
        $warehouseId = Warehouse::query()
            ->where('warehouse_code', $warehouseCode)
            ->value('id');

        if ($warehouseId === null) {
            throw new RuntimeException("Warehouse [{$warehouseCode}] was not found while seeding purchasing records.");
        }

        return (int) $warehouseId;
    }

    private function user(string $email): User
    {
        $user = User::query()
            ->where('email', $email)
            ->first();

        if ($user === null) {
            throw new RuntimeException("User [{$email}] was not found while seeding purchasing records.");
        }

        return $user;
    }
}
