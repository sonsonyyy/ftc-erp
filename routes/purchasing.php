<?php

use App\Http\Controllers\Purchasing\PurchaseOrderController;
use App\Http\Controllers\Purchasing\PurchaseReceiptController;
use App\Http\Controllers\Purchasing\PurchaseRequestController;
use App\Http\Controllers\Purchasing\SupplierController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('purchase-orders/{purchase_order}/receipts/create', [PurchaseReceiptController::class, 'create'])
        ->name('purchase-orders.receipts.create');
    Route::post('purchase-orders/{purchase_order}/receipts', [PurchaseReceiptController::class, 'store'])
        ->name('purchase-orders.receipts.store');

    Route::resource('suppliers', SupplierController::class);
    Route::resource('purchase-requests', PurchaseRequestController::class);
    Route::resource('purchase-orders', PurchaseOrderController::class);
    Route::resource('purchase-receipts', PurchaseReceiptController::class)
        ->only(['index', 'show']);
});
