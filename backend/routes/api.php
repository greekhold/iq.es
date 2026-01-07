<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\PriceController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductionController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\SyncController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
});

// Protected routes
Route::middleware(['jwt.auth'])->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });

    // Products (read for all, write for admin)
    Route::get('products', [ProductController::class, 'index']);
    Route::middleware(['role:ADMIN'])->group(function () {
        Route::post('products', [ProductController::class, 'store']);
        Route::put('products/{id}', [ProductController::class, 'update']);
    });

    // Prices
    Route::get('prices/available', [PriceController::class, 'available']);
    Route::middleware(['role:ADMIN'])->group(function () {
        Route::get('prices', [PriceController::class, 'index']);
        Route::post('prices', [PriceController::class, 'store']);
        Route::put('prices/{id}', [PriceController::class, 'update']);
    });

    // Customers
    Route::get('customers', [CustomerController::class, 'index']);
    Route::post('customers', [CustomerController::class, 'store']);
    Route::middleware(['role:ADMIN'])->group(function () {
        Route::put('customers/{id}', [CustomerController::class, 'update']);
        Route::get('customers/{id}/history', [CustomerController::class, 'history']);
    });

    // Production
    Route::get('production', [ProductionController::class, 'index']);
    Route::middleware(['role:ADMIN,KASIR_PABRIK'])->group(function () {
        Route::post('production', [ProductionController::class, 'store']);
        Route::get('production/summary', [ProductionController::class, 'summary']);
    });

    // Inventory
    Route::get('inventory/stock', [InventoryController::class, 'stock']);
    Route::middleware(['role:ADMIN'])->group(function () {
        Route::get('inventory/movements', [InventoryController::class, 'movements']);
        Route::post('inventory/adjustment', [InventoryController::class, 'adjustment']);
    });

    // Sales
    Route::get('sales', [SalesController::class, 'index']);
    Route::get('sales/{id}', [SalesController::class, 'show']);
    Route::middleware(['role:ADMIN,KASIR_PABRIK,SUPPLIER'])->group(function () {
        Route::post('sales', [SalesController::class, 'store']);
    });
    Route::middleware(['role:ADMIN'])->group(function () {
        Route::post('sales/{id}/cancel', [SalesController::class, 'cancel']);
    });

    // Sync (for offline transactions)
    Route::middleware(['role:SUPPLIER'])->group(function () {
        Route::post('sync/push', [SyncController::class, 'push']);
        Route::get('sync/status', [SyncController::class, 'status']);
    });
    Route::middleware(['role:ADMIN'])->group(function () {
        Route::get('sync/conflicts', [SyncController::class, 'conflicts']);
        Route::post('sync/resolve/{id}', [SyncController::class, 'resolve']);
    });
});
