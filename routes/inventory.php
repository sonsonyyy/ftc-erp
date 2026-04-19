<?php

use App\Http\Controllers\Inventory\InventoryCategoryController;
use App\Http\Controllers\Inventory\InventoryItemController;
use App\Http\Controllers\Inventory\StockIssuanceController;
use App\Http\Controllers\Inventory\StockMovementController;
use App\Http\Controllers\Inventory\StockReturnController;
use App\Http\Controllers\Inventory\WarehouseController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('inventory/low-stock', [InventoryItemController::class, 'lowStock'])->name('inventory.low-stock');
    Route::resource('inventory', InventoryItemController::class);
    Route::resource('inventory-categories', InventoryCategoryController::class)->except('show');
    Route::resource('warehouses', WarehouseController::class);
    Route::resource('stock-movements', StockMovementController::class)->only(['index', 'create', 'store']);
    Route::resource('stock-issuances', StockIssuanceController::class)->only(['index', 'create', 'store', 'show']);
    Route::resource('stock-returns', StockReturnController::class)->only(['index', 'create', 'store', 'show']);
});
