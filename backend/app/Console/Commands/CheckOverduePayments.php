<?php

namespace App\Console\Commands;

use App\Models\Customer;
use App\Models\Sale;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckOverduePayments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payments:check-overdue';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for overdue payments and blacklist customers';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for overdue payments...');

        // Find all unpaid sales that are past due date
        $overdueSales = Sale::where('payment_status', 'unpaid')
            ->whereNotNull('due_date')
            ->where('due_date', '<', today())
            ->get();

        $overdueCount = 0;
        $blacklistedCustomers = [];

        foreach ($overdueSales as $sale) {
            // Mark sale as overdue
            $sale->update(['payment_status' => 'overdue']);
            $overdueCount++;

            // Blacklist the customer if they have a customer record
            if ($sale->customer_id && $sale->customer) {
                $customer = $sale->customer;

                if (!$customer->is_blacklisted) {
                    $customer->blacklist('Pembayaran Invoice ' . $sale->invoice_number . ' melebihi batas waktu');
                    $blacklistedCustomers[] = $customer->name;

                    Log::warning('Customer blacklisted due to overdue payment', [
                        'customer_id' => $customer->id,
                        'customer_name' => $customer->name,
                        'sale_id' => $sale->id,
                        'invoice_number' => $sale->invoice_number,
                        'due_date' => $sale->due_date,
                    ]);
                }
            }
        }

        $this->info("Updated {$overdueCount} sales to overdue status.");

        if (count($blacklistedCustomers) > 0) {
            $this->warn('Blacklisted customers: ' . implode(', ', array_unique($blacklistedCustomers)));
        }

        return Command::SUCCESS;
    }
}
