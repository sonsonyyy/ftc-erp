<?php

use App\Http\Controllers\WorkOrders\WorkOrderController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('work-orders/{work_order}/status', [WorkOrderController::class, 'updateStatus'])->name('work-orders.update-status');
    Route::post('work-orders/{work_order}/assignments', [WorkOrderController::class, 'storeAssignment'])->name('work-orders.assignments.store');
    Route::delete('work-orders/{work_order}/assignments/{assignment}', [WorkOrderController::class, 'destroyAssignment'])->name('work-orders.assignments.destroy');
    Route::post('work-orders/{work_order}/logs', [WorkOrderController::class, 'storeLog'])->name('work-orders.logs.store');
    Route::post('work-orders/{work_order}/materials', [WorkOrderController::class, 'storeMaterial'])->name('work-orders.materials.store');
    Route::delete('work-orders/{work_order}/materials/{material}', [WorkOrderController::class, 'destroyMaterial'])->name('work-orders.materials.destroy');
    Route::resource('work-orders', WorkOrderController::class);
});
