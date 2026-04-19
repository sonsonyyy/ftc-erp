<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\StoreInventoryCategoryRequest;
use App\Http\Requests\Inventory\UpdateInventoryCategoryRequest;
use App\Models\InventoryCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryCategoryController extends Controller
{
    private const PER_PAGE = 15;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', InventoryCategory::class);

        $search = $request->string('search')->toString();

        $categories = InventoryCategory::query()
            ->withCount('inventoryItems')
            ->search($search)
            ->orderBy('name')
            ->paginate(self::PER_PAGE)
            ->withQueryString()
            ->through(fn (InventoryCategory $inventoryCategory) => [
                'id' => $inventoryCategory->getKey(),
                'name' => $inventoryCategory->name,
                'description' => $inventoryCategory->description,
                'item_count' => (int) $inventoryCategory->getAttribute('inventory_items_count'),
                'can' => [
                    'update' => $request->user()?->can('update', $inventoryCategory) ?? false,
                    'delete' => $request->user()?->can('delete', $inventoryCategory) ?? false,
                ],
            ]);

        return Inertia::render('inventory/categories/index', [
            'categories' => $categories,
            'filters' => [
                'search' => $search,
            ],
            'can' => [
                'create' => $request->user()?->can('create', InventoryCategory::class) ?? false,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $this->authorize('create', InventoryCategory::class);

        return Inertia::render('inventory/categories/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreInventoryCategoryRequest $request): RedirectResponse
    {
        $this->authorize('create', InventoryCategory::class);

        $inventoryCategory = InventoryCategory::query()->create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Inventory category created.'),
        ]);

        return to_route('inventory-categories.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(InventoryCategory $inventoryCategory): Response
    {
        $this->authorize('update', $inventoryCategory);

        return Inertia::render('inventory/categories/edit', [
            'inventoryCategory' => [
                'id' => $inventoryCategory->getKey(),
                'name' => $inventoryCategory->name,
                'description' => $inventoryCategory->description,
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(
        UpdateInventoryCategoryRequest $request,
        InventoryCategory $inventoryCategory,
    ): RedirectResponse {
        $this->authorize('update', $inventoryCategory);

        $inventoryCategory->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Inventory category updated.'),
        ]);

        return to_route('inventory-categories.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(InventoryCategory $inventoryCategory): RedirectResponse
    {
        $this->authorize('delete', $inventoryCategory);

        $inventoryCategory->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Inventory category archived.'),
        ]);

        return to_route('inventory-categories.index');
    }
}
