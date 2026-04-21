<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function (Request $request): RedirectResponse {
    return $request->user() !== null
        ? redirect()->route('dashboard')
        : redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
});

require __DIR__.'/users.php';
require __DIR__.'/customers.php';
require __DIR__.'/quotations.php';
require __DIR__.'/projects.php';
require __DIR__.'/work-orders.php';
require __DIR__.'/inventory.php';
require __DIR__.'/purchasing.php';
require __DIR__.'/billing.php';
require __DIR__.'/payroll.php';
require __DIR__.'/tax.php';
require __DIR__.'/compliance.php';
require __DIR__.'/settings.php';
