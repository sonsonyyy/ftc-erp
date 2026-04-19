<?php

use App\Http\Controllers\Attachments\AttachmentController;
use App\Http\Controllers\Customers\CustomerController;
use App\Http\Controllers\Customers\CustomerSiteController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('customers', CustomerController::class);
    Route::resource('sites', CustomerSiteController::class);

    Route::post('attachments', [AttachmentController::class, 'store'])->name('attachments.store');
    Route::get('attachments/{attachment}/download', [AttachmentController::class, 'download'])->name('attachments.download');
    Route::post('attachments/{attachment}/unlink', [AttachmentController::class, 'unlink'])->name('attachments.unlink');
});
