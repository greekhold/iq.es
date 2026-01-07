<?php

namespace App\Http\Requests\Production;

use Illuminate\Foundation\Http\FormRequest;

class CreateProductionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'uuid', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'machine_on_at' => ['required', 'date'],
            'machine_off_at' => ['required', 'date', 'after:machine_on_at'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required' => 'Produk wajib dipilih',
            'quantity.required' => 'Jumlah produksi wajib diisi',
            'quantity.min' => 'Jumlah produksi minimal 1',
            'machine_on_at.required' => 'Waktu mesin ON wajib diisi',
            'machine_off_at.required' => 'Waktu mesin OFF wajib diisi',
            'machine_off_at.after' => 'Waktu mesin OFF harus setelah waktu ON',
        ];
    }
}
