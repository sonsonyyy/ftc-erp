<?php

use App\Enums\InventoryItemStatus;
use App\Enums\PurchaseOrderStatus;
use App\Enums\PurchaseRequestStatus;
use App\Enums\StockMovementType;
use App\Models\Attachment;
use App\Models\InventoryItem;
use App\Models\Project;
use App\Models\PurchaseOrder;
use App\Models\PurchaseReceipt;
use App\Models\PurchaseRequest;
use App\Models\Role;
use App\Models\StockBalance;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\WorkOrder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->withoutVite();
});

function actingAsPurchasingRole(string $roleName = 'Purchasing Officer'): User
{
    $user = User::factory()->create();
    $role = Role::query()->where('name', $roleName)->firstOrFail();

    $user->roles()->sync([$role->getKey()]);

    test()->actingAs($user);

    return $user;
}

/**
 * @return array{
 *     project: Project,
 *     workOrder: WorkOrder,
 *     supplier: Supplier,
 *     warehouse: Warehouse,
 *     itemA: InventoryItem,
 *     itemB: InventoryItem
 * }
 */
function purchasingContext(): array
{
    $project = Project::factory()->create();
    $workOrder = WorkOrder::factory()->create([
        'project_id' => $project->getKey(),
        'customer_id' => $project->customer_id,
        'customer_site_id' => $project->customer_site_id,
    ]);

    return [
        'project' => $project,
        'workOrder' => $workOrder,
        'supplier' => Supplier::factory()->create(['is_active' => true]),
        'warehouse' => Warehouse::factory()->create(['is_active' => true]),
        'itemA' => InventoryItem::factory()->create(['status' => InventoryItemStatus::Active]),
        'itemB' => InventoryItem::factory()->create(['status' => InventoryItemStatus::Active]),
    ];
}

function createPurchaseRequestRecord(array $attributes = [], ?array $items = null): PurchaseRequest
{
    $context = purchasingContext();

    $purchaseRequest = PurchaseRequest::factory()->create([
        'supplier_id' => $attributes['supplier_id'] ?? $context['supplier']->getKey(),
        'project_id' => $attributes['project_id'] ?? $context['project']->getKey(),
        'work_order_id' => $attributes['work_order_id'] ?? $context['workOrder']->getKey(),
        'status' => $attributes['status'] ?? PurchaseRequestStatus::Submitted,
        'requested_by_user_id' => $attributes['requested_by_user_id'] ?? User::factory(),
        ...collect($attributes)->except([
            'supplier_id',
            'project_id',
            'work_order_id',
            'status',
            'requested_by_user_id',
        ])->all(),
    ]);

    $lines = $items ?? [
        [
            'inventory_item' => $context['itemA'],
            'requested_quantity' => '12.00',
            'estimated_unit_cost' => '125.00',
            'remarks' => 'Primary request line',
        ],
        [
            'inventory_item' => $context['itemB'],
            'requested_quantity' => '8.00',
            'estimated_unit_cost' => '225.00',
            'remarks' => 'Secondary request line',
        ],
    ];

    foreach ($lines as $line) {
        /** @var InventoryItem $inventoryItem */
        $inventoryItem = $line['inventory_item'];

        $purchaseRequest->items()->create([
            'inventory_item_id' => $inventoryItem->getKey(),
            'item_description' => $inventoryItem->item_name,
            'unit' => $inventoryItem->unit,
            'requested_quantity' => $line['requested_quantity'],
            'estimated_unit_cost' => $line['estimated_unit_cost'],
            'remarks' => $line['remarks'] ?? null,
        ]);
    }

    return $purchaseRequest->fresh(['items']);
}

function createPurchaseOrderRecord(array $attributes = [], ?PurchaseRequest $purchaseRequest = null): PurchaseOrder
{
    $purchaseRequest ??= createPurchaseRequestRecord();

    $purchaseOrder = PurchaseOrder::factory()->create([
        'purchase_request_id' => $attributes['purchase_request_id'] ?? $purchaseRequest->getKey(),
        'supplier_id' => $attributes['supplier_id'] ?? $purchaseRequest->supplier_id,
        'project_id' => $attributes['project_id'] ?? $purchaseRequest->project_id,
        'work_order_id' => $attributes['work_order_id'] ?? $purchaseRequest->work_order_id,
        'status' => $attributes['status'] ?? PurchaseOrderStatus::Approved,
        'ordered_by_user_id' => $attributes['ordered_by_user_id'] ?? User::factory(),
        ...collect($attributes)->except([
            'purchase_request_id',
            'supplier_id',
            'project_id',
            'work_order_id',
            'status',
            'ordered_by_user_id',
        ])->all(),
    ]);

    foreach ($purchaseRequest->items as $purchaseRequestItem) {
        $purchaseOrder->items()->create([
            'purchase_request_item_id' => $purchaseRequestItem->getKey(),
            'inventory_item_id' => $purchaseRequestItem->inventory_item_id,
            'item_description' => $purchaseRequestItem->item_description,
            'unit' => $purchaseRequestItem->unit,
            'ordered_quantity' => $purchaseRequestItem->requested_quantity,
            'unit_cost' => $purchaseRequestItem->estimated_unit_cost ?? '100.00',
            'remarks' => $purchaseRequestItem->remarks,
        ]);
    }

    return $purchaseOrder->fresh(['items']);
}

test('authorized users can browse and filter paginated suppliers', function () {
    actingAsPurchasingRole();

    Supplier::factory()->create([
        'supplier_code' => 'SUP-ALPHA',
        'company_name' => 'Alpha Fire Supply',
        'is_active' => true,
    ]);

    Supplier::factory()->create([
        'supplier_code' => 'SUP-BETA',
        'company_name' => 'Beta Alarm Components',
        'is_active' => false,
    ]);

    Supplier::factory()->count(14)->create();

    $this->get(route('suppliers.index', [
        'search' => 'Alpha',
        'activity' => 'active',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('suppliers/index')
            ->where('filters.search', 'Alpha')
            ->where('filters.activity', 'active')
            ->where('suppliers.total', 1)
            ->where('suppliers.data.0.company_name', 'Alpha Fire Supply')
            ->where('can.create', true),
        );
});

test('authorized users can create and update suppliers', function () {
    actingAsPurchasingRole();

    $response = $this->post(route('suppliers.store'), [
        'supplier_code' => 'SUP-00001',
        'company_name' => 'Prime Industrial Trading',
        'contact_person' => 'Lina Cruz',
        'phone' => '09171234567',
        'email' => 'sales@prime.example',
        'tin' => '123-456-789-000',
        'address' => 'Valenzuela warehouse district',
        'payment_terms' => '30 days',
        'is_active' => true,
        'notes' => 'Main sprinkler supplier',
    ]);

    $supplier = Supplier::query()->firstOrFail();

    $response->assertRedirect(route('suppliers.show', $supplier));

    $this->put(route('suppliers.update', $supplier), [
        'supplier_code' => 'SUP-00001',
        'company_name' => 'Prime Industrial Supply and Trading',
        'contact_person' => 'Lina Cruz',
        'phone' => '09170001111',
        'email' => 'orders@prime.example',
        'tin' => '123-456-789-000',
        'address' => 'Updated industrial estate',
        'payment_terms' => '15 days',
        'is_active' => false,
        'notes' => 'Updated notes',
    ])->assertRedirect(route('suppliers.show', $supplier));

    expect($supplier->refresh()->company_name)->toBe('Prime Industrial Supply and Trading');
    expect($supplier->is_active)->toBeFalse();
});

test('users without permissions cannot create suppliers', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('suppliers.store'), [
            'supplier_code' => 'SUP-UNAUTH',
            'company_name' => 'Unauthorized Supplier',
            'is_active' => true,
        ])
        ->assertForbidden();
});

test('attachments can be uploaded and unlinked from suppliers', function () {
    actingAsPurchasingRole();

    Storage::fake('local');

    $supplier = Supplier::factory()->create();
    $file = UploadedFile::fake()->create('supplier-accreditation.pdf', 128, 'application/pdf');

    $this->from(route('suppliers.show', $supplier))
        ->post(route('attachments.store'), [
            'attachable_type' => 'supplier',
            'attachable_id' => $supplier->getKey(),
            'file' => $file,
        ])
        ->assertRedirect(route('suppliers.show', $supplier));

    $attachment = Attachment::query()->firstOrFail();

    $this->assertDatabaseHas('attachment_links', [
        'attachment_id' => $attachment->getKey(),
        'attachable_type' => Supplier::class,
        'attachable_id' => $supplier->getKey(),
    ]);

    $this->from(route('suppliers.show', $supplier))
        ->post(route('attachments.unlink', $attachment), [
            'attachable_type' => 'supplier',
            'attachable_id' => $supplier->getKey(),
        ])
        ->assertRedirect(route('suppliers.show', $supplier));

    $this->assertDatabaseMissing('attachments', [
        'id' => $attachment->getKey(),
    ]);
});

test('authorized users can browse filter and create purchase requests', function () {
    actingAsPurchasingRole();

    $context = purchasingContext();

    PurchaseRequest::factory()->create([
        'request_no' => 'PR-ALPHA',
        'supplier_id' => $context['supplier']->getKey(),
        'project_id' => $context['project']->getKey(),
        'work_order_id' => $context['workOrder']->getKey(),
        'status' => PurchaseRequestStatus::Submitted,
        'purpose' => 'Alpha sourcing request',
        'requested_by_user_id' => User::factory(),
    ]);

    PurchaseRequest::factory()->create([
        'request_no' => 'PR-BETA',
        'status' => PurchaseRequestStatus::Cancelled,
        'requested_by_user_id' => User::factory(),
    ]);

    $this->get(route('purchase-requests.index', [
        'search' => 'Alpha',
        'supplier' => $context['supplier']->getKey(),
        'status' => PurchaseRequestStatus::Submitted->value,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('purchase-requests/index')
            ->where('filters.search', 'Alpha')
            ->where('filters.supplier', $context['supplier']->getKey())
            ->where('filters.status', PurchaseRequestStatus::Submitted->value)
            ->where('purchaseRequests.total', 1)
            ->where('purchaseRequests.data.0.request_no', 'PR-ALPHA'),
        );

    $response = $this->post(route('purchase-requests.store'), [
        'request_no' => 'PR-NEW-001',
        'supplier_id' => $context['supplier']->getKey(),
        'project_id' => $context['project']->getKey(),
        'work_order_id' => $context['workOrder']->getKey(),
        'request_date' => '2026-04-20',
        'needed_by' => '2026-04-25',
        'status' => PurchaseRequestStatus::Submitted->value,
        'purpose' => 'Need additional alarm modules',
        'remarks' => 'For upcoming weekend shutdown',
        'items' => [
            [
                'inventory_item_id' => $context['itemA']->getKey(),
                'requested_quantity' => '4',
                'estimated_unit_cost' => '950',
                'remarks' => 'Primary line',
            ],
            [
                'inventory_item_id' => $context['itemB']->getKey(),
                'requested_quantity' => '2',
                'estimated_unit_cost' => '1250',
                'remarks' => null,
            ],
        ],
    ]);

    $purchaseRequest = PurchaseRequest::query()
        ->where('request_no', 'PR-NEW-001')
        ->firstOrFail();

    $response->assertRedirect(route('purchase-requests.show', $purchaseRequest));

    expect($purchaseRequest->items()->count())->toBe(2);
});

test('purchase request validation errors are returned', function () {
    actingAsPurchasingRole();

    $context = purchasingContext();
    $otherProject = Project::factory()->create();

    PurchaseRequest::factory()->create([
        'request_no' => 'PR-DUPLICATE',
        'requested_by_user_id' => User::factory(),
    ]);

    $this->from(route('purchase-requests.create'))
        ->post(route('purchase-requests.store'), [
            'request_no' => 'PR-DUPLICATE',
            'supplier_id' => $context['supplier']->getKey(),
            'project_id' => $otherProject->getKey(),
            'work_order_id' => $context['workOrder']->getKey(),
            'request_date' => '2026-04-20',
            'needed_by' => '2026-04-19',
            'status' => PurchaseRequestStatus::Ordered->value,
            'purpose' => '',
            'items' => [
                [
                    'inventory_item_id' => $context['itemA']->getKey(),
                    'requested_quantity' => '0',
                    'estimated_unit_cost' => '-1',
                    'remarks' => null,
                ],
            ],
        ])
        ->assertRedirect(route('purchase-requests.create'))
        ->assertSessionHasErrors([
            'request_no',
            'needed_by',
            'status',
            'purpose',
            'work_order_id',
            'items.0.requested_quantity',
            'items.0.estimated_unit_cost',
        ]);
});

test('purchase-order export respects the active filters', function () {
    actingAsPurchasingRole();

    $alphaRequest = createPurchaseRequestRecord([
        'request_no' => 'PR-ALPHA-001',
    ]);

    $betaRequest = createPurchaseRequestRecord([
        'request_no' => 'PR-BETA-001',
    ]);

    createPurchaseOrderRecord([
        'po_no' => 'PO-ALPHA-001',
        'supplier_reference' => 'ALPHA-REF',
        'status' => PurchaseOrderStatus::Approved,
    ], $alphaRequest);

    createPurchaseOrderRecord([
        'po_no' => 'PO-BETA-001',
        'supplier_reference' => 'BETA-REF',
        'status' => PurchaseOrderStatus::Cancelled,
    ], $betaRequest);

    $response = $this->get(route('purchase-orders.index', [
        'search' => 'ALPHA',
        'supplier' => $alphaRequest->supplier_id,
        'status' => PurchaseOrderStatus::Approved->value,
        'export' => 'csv',
    ]));

    $response->assertOk()
        ->assertHeader('content-type', 'text/csv; charset=UTF-8');

    expect($response->streamedContent())
        ->toContain('PO-ALPHA-001')
        ->not->toContain('PO-BETA-001');
});

test('authorized users can create purchase orders and linked request becomes ordered', function () {
    actingAsPurchasingRole();

    $purchaseRequest = createPurchaseRequestRecord([
        'status' => PurchaseRequestStatus::Submitted,
    ]);

    $response = $this->post(route('purchase-orders.store'), [
        'po_no' => 'PO-NEW-001',
        'purchase_request_id' => $purchaseRequest->getKey(),
        'supplier_id' => $purchaseRequest->supplier_id,
        'project_id' => $purchaseRequest->project_id,
        'work_order_id' => $purchaseRequest->work_order_id,
        'order_date' => '2026-04-20',
        'expected_date' => '2026-04-27',
        'status' => PurchaseOrderStatus::Approved->value,
        'supplier_reference' => 'SUP-REF-001',
        'remarks' => 'Released for delivery',
        'items' => $purchaseRequest->items->map(fn ($item) => [
            'purchase_request_item_id' => $item->getKey(),
            'inventory_item_id' => $item->inventory_item_id,
            'ordered_quantity' => $item->requested_quantity,
            'unit_cost' => $item->estimated_unit_cost ?? '100.00',
            'remarks' => $item->remarks,
        ])->all(),
    ]);

    $purchaseOrder = PurchaseOrder::query()->where('po_no', 'PO-NEW-001')->firstOrFail();

    $response->assertRedirect(route('purchase-orders.show', $purchaseOrder));

    expect($purchaseOrder->items()->count())->toBe(2);
    expect($purchaseRequest->refresh()->status)->toBe(PurchaseRequestStatus::Ordered);
});

test('purchasing users can submit and approve purchase orders', function () {
    $requester = actingAsPurchasingRole();

    $purchaseOrder = createPurchaseOrderRecord([
        'status' => PurchaseOrderStatus::Draft,
    ]);

    $this->patch(route('purchase-orders.submit', $purchaseOrder))
        ->assertRedirect(route('purchase-orders.show', $purchaseOrder));

    $purchaseOrder->refresh();

    expect($purchaseOrder->status)->toBe(PurchaseOrderStatus::Submitted);
    expect($purchaseOrder->submitted_by_user_id)->toBe($requester->getKey());
    expect($purchaseOrder->submitted_at)->not->toBeNull();
    expect($purchaseOrder->approved_at)->toBeNull();

    $approver = actingAsPurchasingRole('Management / CEO');

    $this->patch(route('purchase-orders.approve', $purchaseOrder), [
        'approval_notes' => 'Supplier pricing confirmed.',
    ])->assertRedirect(route('purchase-orders.show', $purchaseOrder));

    $purchaseOrder->refresh();

    expect($purchaseOrder->status)->toBe(PurchaseOrderStatus::Approved);
    expect($purchaseOrder->approved_by_user_id)->toBe($approver->getKey());
    expect($purchaseOrder->approved_at)->not->toBeNull();
    expect($purchaseOrder->approval_notes)->toBe('Supplier pricing confirmed.');
});

test('users without approval permission cannot approve purchase orders', function () {
    $purchaseOrder = createPurchaseOrderRecord([
        'status' => PurchaseOrderStatus::Submitted,
        'submitted_at' => now(),
        'submitted_by_user_id' => User::factory()->create()->getKey(),
    ]);

    $this->actingAs(User::factory()->create())
        ->patch(route('purchase-orders.approve', $purchaseOrder), [
            'approval_notes' => 'Unauthorized approval',
        ])
        ->assertForbidden();
});

test('purchase order validation fails when supplier does not match the linked request', function () {
    actingAsPurchasingRole();

    $purchaseRequest = createPurchaseRequestRecord();
    $otherSupplier = Supplier::factory()->create(['is_active' => true]);

    $this->from(route('purchase-orders.create'))
        ->post(route('purchase-orders.store'), [
            'po_no' => 'PO-MISMATCH',
            'purchase_request_id' => $purchaseRequest->getKey(),
            'supplier_id' => $otherSupplier->getKey(),
            'project_id' => $purchaseRequest->project_id,
            'work_order_id' => $purchaseRequest->work_order_id,
            'order_date' => '2026-04-20',
            'expected_date' => '2026-04-25',
            'status' => PurchaseOrderStatus::Approved->value,
            'items' => $purchaseRequest->items->map(fn ($item) => [
                'purchase_request_item_id' => $item->getKey(),
                'inventory_item_id' => $item->inventory_item_id,
                'ordered_quantity' => $item->requested_quantity,
                'unit_cost' => $item->estimated_unit_cost ?? '100.00',
                'remarks' => null,
            ])->all(),
        ])
        ->assertRedirect(route('purchase-orders.create'))
        ->assertSessionHasErrors(['supplier_id']);
});

test('recording a purchase receipt updates stock and marks the order as fully received', function () {
    actingAsPurchasingRole('Warehouse / Inventory Officer');

    $context = purchasingContext();
    $purchaseRequest = createPurchaseRequestRecord([
        'supplier_id' => $context['supplier']->getKey(),
        'project_id' => $context['project']->getKey(),
        'work_order_id' => $context['workOrder']->getKey(),
        'status' => PurchaseRequestStatus::Ordered,
    ], [
        [
            'inventory_item' => $context['itemA'],
            'requested_quantity' => '5.00',
            'estimated_unit_cost' => '150.00',
            'remarks' => null,
        ],
    ]);

    $purchaseOrder = createPurchaseOrderRecord([
        'supplier_id' => $context['supplier']->getKey(),
        'project_id' => $context['project']->getKey(),
        'work_order_id' => $context['workOrder']->getKey(),
        'status' => PurchaseOrderStatus::Approved,
    ], $purchaseRequest);

    $purchaseOrderItem = $purchaseOrder->items()->firstOrFail();

    $response = $this->post(route('purchase-orders.receipts.store', $purchaseOrder), [
        'receipt_no' => 'RCV-NEW-001',
        'warehouse_id' => $context['warehouse']->getKey(),
        'received_date' => '2026-04-20',
        'supplier_reference' => 'DEL-001',
        'remarks' => 'Full delivery received',
        'items' => [
            [
                'purchase_order_item_id' => $purchaseOrderItem->getKey(),
                'received_quantity' => '5.00',
                'remarks' => 'Complete line delivery',
            ],
        ],
    ]);

    $purchaseReceipt = PurchaseReceipt::query()->where('receipt_no', 'RCV-NEW-001')->firstOrFail();

    $response->assertRedirect(route('purchase-receipts.show', $purchaseReceipt));

    $this->assertDatabaseHas('stock_balances', [
        'warehouse_id' => $context['warehouse']->getKey(),
        'inventory_item_id' => $context['itemA']->getKey(),
        'quantity_on_hand' => '5.00',
    ]);

    $this->assertDatabaseHas('stock_movements', [
        'warehouse_id' => $context['warehouse']->getKey(),
        'inventory_item_id' => $context['itemA']->getKey(),
        'reference_type' => 'purchase_receipt',
        'reference_id' => $purchaseReceipt->getKey(),
        'reference_number' => 'RCV-NEW-001',
        'movement_type' => StockMovementType::StockIn->value,
        'quantity' => '5.00',
    ]);

    expect($purchaseOrder->refresh()->status)->toBe(PurchaseOrderStatus::FullyReceived);
    expect(StockBalance::query()->count())->toBe(1);
    expect(StockMovement::query()->count())->toBe(1);
});

test('users without permission cannot record purchase receipts', function () {
    $user = User::factory()->create();
    $purchaseOrder = createPurchaseOrderRecord([
        'status' => PurchaseOrderStatus::Approved,
    ]);

    $purchaseOrderItem = $purchaseOrder->items()->firstOrFail();
    $warehouse = Warehouse::factory()->create(['is_active' => true]);

    $this->actingAs($user)
        ->post(route('purchase-orders.receipts.store', $purchaseOrder), [
            'receipt_no' => 'RCV-UNAUTH',
            'warehouse_id' => $warehouse->getKey(),
            'received_date' => '2026-04-20',
            'items' => [
                [
                    'purchase_order_item_id' => $purchaseOrderItem->getKey(),
                    'received_quantity' => '1.00',
                    'remarks' => null,
                ],
            ],
        ])
        ->assertForbidden();
});
