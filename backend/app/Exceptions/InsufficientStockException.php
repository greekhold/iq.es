<?php

namespace App\Exceptions;

use Exception;

class InsufficientStockException extends Exception
{
    public function __construct(string $message = "Stok tidak mencukupi")
    {
        parent::__construct($message);
    }

    public function render($request)
    {
        return response()->json([
            'success' => false,
            'message' => $this->getMessage(),
            'error_code' => 'INSUFFICIENT_STOCK',
        ], 422);
    }
}
