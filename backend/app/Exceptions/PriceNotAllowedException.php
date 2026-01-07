<?php

namespace App\Exceptions;

use Exception;

class PriceNotAllowedException extends Exception
{
    public function __construct(string $message = "Harga tidak diizinkan untuk pengguna ini")
    {
        parent::__construct($message);
    }

    public function render($request)
    {
        return response()->json([
            'success' => false,
            'message' => $this->getMessage(),
            'error_code' => 'PRICE_NOT_ALLOWED',
        ], 403);
    }
}
