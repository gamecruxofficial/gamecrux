"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchPaymentDetailsServerSide } from "@/app/actions/tebexPaymentService";
import { checkRecurringPayment } from "@/utils/recurring-payment";

interface LogEntry {
  timestamp: string;
  type: 'info' | 'error' | 'success';
  message: string;
  data?: any;
}

export default function TestRecurringPayment() {
  const [transactionId, setTransactionId] = useState("tbx-90818025a44022-33c719");
  const [loading, setLoading] = useState(false);
  const [webhookTesting, setWebhookTesting] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [paymentResponse, setPaymentResponse] = useState<any>(null);
  const [recurringResponse, setRecurringResponse] = useState<any>(null);

  const addLog = (type: LogEntry['type'], message: string, data?: any) => {
    const newLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      data
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const testPaymentDetails = async () => {
    if (!transactionId.trim()) {
      addLog('error', 'Please enter a transaction ID');
      return;
    }

    setLoading(true);
    setPaymentResponse(null);
    setRecurringResponse(null);
    addLog('info', `Starting payment details check for transaction: ${transactionId}`);

    try {
      // Step 1: Fetch payment details
      addLog('info', 'Fetching payment details from Tebex API...');
      const paymentDetails = await fetchPaymentDetailsServerSide(transactionId);

      addLog('success', 'Payment details fetched successfully');
      addLog('info', 'Payment Details Response:', paymentDetails);
      setPaymentResponse(paymentDetails);

      // Log key payment information
      if (paymentDetails.transaction_id) {
        addLog('info', `Transaction ID: ${paymentDetails.transaction_id}`);
      }
      if (paymentDetails.status) {
        addLog('info', `Payment Status: ${paymentDetails.status}`);
      }
      if (paymentDetails.amount) {
        addLog('info', `Amount: ${paymentDetails.amount.amount} ${paymentDetails.amount.currency}`);
      }
      if (paymentDetails.products) {
        addLog('info', `Products: ${paymentDetails.products.map(p => p.name).join(', ')}`);
      }

      // Step 2: Check for recurring payment reference
      if (paymentDetails.recurring_payment_reference) {
        addLog('info', `Found recurring payment reference: ${paymentDetails.recurring_payment_reference}`);
        addLog('info', 'Fetching recurring payment details...');

        try {
          const recurringDetails = await checkRecurringPayment(paymentDetails.recurring_payment_reference);

          addLog('success', 'Recurring payment details fetched successfully');
          addLog('info', 'Recurring Payment Response:', recurringDetails);
          setRecurringResponse(recurringDetails);

          // Log recurring payment details
          addLog('info', `Recurring Status: ${recurringDetails.status?.description} (${recurringDetails.status?.active ? 'Active' : 'Inactive'})`);
          addLog('info', `Next Payment Date: ${recurringDetails.next_payment_date}`);
          addLog('info', `Recurring Amount: ${recurringDetails.amount}`);
          addLog('info', `Payment Interval: ${recurringDetails.interval}`);
          addLog('info', `Cancelled At: ${recurringDetails.cancelled_at || 'Not cancelled'}`);

        } catch (recurringError) {
          addLog('error', 'Error fetching recurring payment details', recurringError);
        }
      } else {
        addLog('info', 'No recurring payment reference found - this is a one-time payment');
      }

    } catch (error) {
      addLog('error', 'Error fetching payment details', error);
      console.error('Payment details check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setPaymentResponse(null);
    setRecurringResponse(null);
  };

  const testWebhookEndpoint = async (webhookType: string) => {
    setWebhookTesting(true);
    addLog('info', `Testing webhook endpoint: ${webhookType}`);

    try {
      // Test webhook with sample data
      const sampleWebhookData = {
        id: "test-webhook-" + Date.now(),
        type: webhookType,
        date: new Date().toISOString(),
        subject: getSampleWebhookData(webhookType)
      };

      const response = await fetch('/api/webhooks/tebex', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': 'test-signature' // In real scenario, this would be properly generated
        },
        body: JSON.stringify(sampleWebhookData)
      });

      if (response.ok) {
        addLog('success', `Webhook ${webhookType} processed successfully`);
        const result = await response.json();
        addLog('info', 'Webhook Response:', result);
      } else {
        addLog('error', `Webhook ${webhookType} failed: ${response.status}`);
      }
    } catch (error) {
      addLog('error', `Webhook test error: ${error.message}`);
    } finally {
      setWebhookTesting(false);
    }
  };

  const getSampleWebhookData = (type: string) => {
    const basePayment = {
      transaction_id: transactionId,
      custom: { userid: "test-user-123" },
      recurring_payment_reference: "tbx-r-sample123"
    };

    switch (type) {
      case 'payment.completed':
        return basePayment;
      case 'recurring-payment.renewed':
        return {
          reference: "tbx-r-sample123",
          next_payment_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          last_payment: basePayment
        };
      case 'recurring-payment.ended':
        return {
          reference: "tbx-r-sample123",
          cancelled_at: new Date().toISOString(),
          cancel_reason: "Test cancellation",
          last_payment: basePayment
        };
      case 'recurring-payment.cancellation.requested':
        return {
          reference: "tbx-r-sample123",
          last_payment: basePayment
        };
      case 'payment.declined':
        return {
          ...basePayment,
          decline_reason: "Insufficient funds"
        };
      default:
        return {};
    }
  };

  const syncSubscriptions = async () => {
    setLoading(true);
    addLog('info', 'Starting subscription sync...');

    try {
      const response = await fetch('/api/sync-subscriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer sync_test_key_12345`, // Use a test key for development
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        addLog('success', `Sync completed: ${result.message}`);
        addLog('info', 'Sync Results:', result);
      } else {
        const errorData = await response.text();
        addLog('error', `Sync failed: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      addLog('error', `Sync error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Auto-test on component mount
  useEffect(() => {
    addLog('info', 'Test component loaded - ready to test transaction IDs');
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="bg-black border border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Payment Transaction Tester</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter transaction ID (e.g., tbx-90818025a44022-33c719)"
              className="flex-1 bg-gray-900 text-white border-gray-700"
            />
            <Button
              onClick={testPaymentDetails}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Testing...' : 'Test Payment'}
            </Button>
            <Button
              onClick={clearLogs}
              variant="outline"
              className="border-gray-700 text-gray-300"
            >
              Clear Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details Response */}
      {paymentResponse && (
        <Card className="bg-gray-900 border border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              Payment Details Response
              <Badge className="bg-green-600">Success</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-gray-300 overflow-x-auto bg-gray-800 p-4 rounded">
              {JSON.stringify(paymentResponse, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Recurring Payment Response */}
      {recurringResponse && (
        <Card className="bg-gray-900 border border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              Recurring Payment Response
              <Badge className="bg-purple-600">Recurring Data</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-gray-300 overflow-x-auto bg-gray-800 p-4 rounded">
              {JSON.stringify(recurringResponse, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Console Logs Display */}
      <Card className="bg-gray-900 border border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Console Logs ({logs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No logs yet. Click "Test Payment" to start.</p>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`p-3 rounded border-l-4 ${
                    log.type === 'error'
                      ? 'bg-red-900/20 border-red-500 text-red-300'
                      : log.type === 'success'
                      ? 'bg-green-900/20 border-green-500 text-green-300'
                      : 'bg-blue-900/20 border-blue-500 text-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-mono text-sm">
                        <span className="text-gray-400">[{log.timestamp}]</span>
                        <span className={`ml-2 font-medium ${
                          log.type === 'error' ? 'text-red-400' :
                          log.type === 'success' ? 'text-green-400' : 'text-blue-400'
                        }`}>
                          {log.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="mt-1 text-sm">{log.message}</div>
                      {log.data && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-300">
                            Show data
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-800 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gray-900 border border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Quick Test Transaction IDs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['tbx-90818025a44022-33c719', 'tbx-4465125a51222-33f497', 'tbx-123456789012-sample'].map((testTxn) => (
              <Button
                key={testTxn}
                variant="outline"
                size="sm"
                onClick={() => setTransactionId(testTxn)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                {testTxn}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Webhook Testing Section */}
      <Card className="bg-gray-900 border border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Webhook Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              Test different webhook scenarios to verify your subscription handling works correctly.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { type: 'payment.completed', label: 'Payment Complete', color: 'bg-green-600' },
                { type: 'recurring-payment.renewed', label: 'Renewal Success', color: 'bg-blue-600' },
                { type: 'recurring-payment.ended', label: 'Subscription End', color: 'bg-red-600' },
                { type: 'recurring-payment.cancellation.requested', label: 'Cancel Request', color: 'bg-orange-600' },
                { type: 'payment.declined', label: 'Payment Failed', color: 'bg-yellow-600' },
                { type: 'validation.webhook', label: 'Validation', color: 'bg-purple-600' }
              ].map((webhook) => (
                <Button
                  key={webhook.type}
                  variant="outline"
                  size="sm"
                  onClick={() => testWebhookEndpoint(webhook.type)}
                  disabled={webhookTesting}
                  className={`${webhook.color} hover:opacity-80 text-white border-0`}
                >
                  {webhook.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync Testing Section */}
      <Card className="bg-gray-900 border border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Subscription Sync Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              Test the periodic sync functionality that reconciles your database with Tebex.
            </p>
            <Button
              onClick={syncSubscriptions}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? 'Syncing...' : 'Test Subscription Sync'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Webhook Flow Explanation */}
      <Card className="bg-gray-900 border border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">How Webhooks Work in Your App</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-gray-300 text-sm">
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-green-400">1. Initial Subscription</h4>
              <p>User pays → payment.completed webhook → Subscription created/activated in database</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-blue-400">2. Recurring Renewals</h4>
              <p>Tebex auto-charges → recurring-payment.renewed webhook → nextPaymentDate updated, subscription stays active</p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-semibold text-orange-400">3. Cancellation Request</h4>
              <p>User cancels → cancellation.requested webhook → pendingCancellation=true, subscription active until period ends</p>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold text-red-400">4. Subscription Ends</h4>
              <p>Period ends/payment fails → recurring-payment.ended webhook → isActive=false, subscription deactivated</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold text-purple-400">5. Backup Sync</h4>
              <p>Periodic job checks Tebex API → reconciles any missed webhooks → ensures database accuracy</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}