<?php

namespace App\Http\Requests\Sales;

use Illuminate\Foundation\Http\FormRequest;

class CreateSaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sales_channel' => ['required', 'in:FACTORY,FIELD'],
            'payment_method' => ['required', 'in:CASH,TRANSFER'],
            'customer_id' => ['nullable', 'uuid', 'exists:customers,id'],
            'sold_at' => ['nullable', 'date'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'uuid', 'exists:products,id'],
            'items.*.price_id' => ['required', 'uuid', 'exists:prices,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'sales_channel.required' => 'Channel penjualan wajib diisi',
            'sales_channel.in' => 'Channel penjualan tidak valid',
            'payment_method.required' => 'Metode pembayaran wajib diisi',
            'items.required' => 'Item penjualan wajib diisi',
            'items.min' => 'Minimal 1 item penjualan',
            'items.*.product_id.required' => 'Produk wajib dipilih',
            'items.*.price_id.required' => 'Harga wajib dipilih',
            'items.*.quantity.required' => 'Jumlah wajib diisi',
            'items.*.quantity.min' => 'Jumlah minimal 1',
        ];
    }
}
