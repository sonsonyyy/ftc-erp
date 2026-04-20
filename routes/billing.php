<?php

use App\Http\Controllers\Billing\AccountsReceivableController;
use App\Http\Controllers\Billing\InvoiceController;
use App\Http\Controllers\Billing\PaymentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('accounts-receivable', AccountsReceivableController::class)
        ->name('accounts-receivable.index');

    Route::resource('invoices', InvoiceController::class);
    Route::resource('payments', PaymentController::class)
        ->only(['index', 'create', 'store', 'show']);
});
