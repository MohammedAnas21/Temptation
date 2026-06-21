import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'payment_service.dart';
import '../../../core/theme/app_theme.dart';

class PaymentPage extends ConsumerStatefulWidget {
  final String orderId;
  final double amount;
  const PaymentPage({super.key, required this.orderId, required this.amount});

  @override
  ConsumerState<PaymentPage> createState() => _PaymentPageState();
}

class _PaymentPageState extends ConsumerState<PaymentPage> {
  String _selectedMethod = 'upi';
  bool _processing = false;
  String? _error;

  Future<void> _pay() async {
    setState(() { _processing = true; _error = null; });

    final service = ref.read(paymentServiceProvider);
    final result = await service.initiateOrderPayment(
      orderId: widget.orderId,
      amount: widget.amount,
      paymentMethod: _selectedMethod,
    );

    if (!result.success) {
      setState(() { _error = result.error; _processing = false; });
      return;
    }

    // For UPI — open the redirect URL
    if (result.redirectUrl != null) {
      // In production, use url_launcher to open PhonePe
      // For now, show polling state
      _pollStatus(result.paymentId!);
    }
  }

  Future<void> _pollStatus(String paymentId) async {
    final service = ref.read(paymentServiceProvider);
    for (int i = 0; i < 30; i++) {
      await Future.delayed(const Duration(seconds: 2));
      final status = await service.checkPaymentStatus(paymentId);
      if (status == PaymentStatus.success) {
        if (mounted) {
          Navigator.pop(context, true); // Success
        }
        return;
      }
      if (status == PaymentStatus.failed) {
        if (mounted) {
          setState(() { _error = 'Payment failed'; _processing = false; });
        }
        return;
      }
    }
    if (mounted) {
      setState(() { _error = 'Payment timed out. Please check your order status.'; _processing = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.green900,
      appBar: AppBar(
        title: const Text('Payment'),
        backgroundColor: AppColors.green900,
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Amount display
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.green800,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppColors.green700),
              ),
              child: Column(
                children: [
                  const Text('Amount to Pay', style: TextStyle(color: AppColors.gold500, fontSize: 14)),
                  const SizedBox(height: 8),
                  Text(
                    '₹${widget.amount.toStringAsFixed(0)}',
                    style: const TextStyle(color: AppColors.ivory50, fontFamily: 'Fraunces', fontWeight: FontWeight.w900, fontSize: 36),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Payment methods
            const Text('Select Payment Method', style: TextStyle(color: AppColors.gold400, fontSize: 14, fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            _PaymentMethodTile(
              icon: Icons.phone_android,
              title: 'UPI / PhonePe',
              subtitle: 'Pay using any UPI app',
              selected: _selectedMethod == 'upi',
              onTap: () => setState(() => _selectedMethod = 'upi'),
            ),
            _PaymentMethodTile(
              icon: Icons.credit_card,
              title: 'Card',
              subtitle: 'Credit or Debit Card',
              selected: _selectedMethod == 'card',
              onTap: () => setState(() => _selectedMethod = 'card'),
            ),
            _PaymentMethodTile(
              icon: Icons.wallet,
              title: 'Wallet',
              subtitle: 'Pay using wallet balance',
              selected: _selectedMethod == 'wallet',
              onTap: () => setState(() => _selectedMethod = 'wallet'),
            ),

            const Spacer(),

            if (_error != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Text(_error!, style: const TextStyle(color: Colors.redAccent, fontSize: 13)),
              ),

            ElevatedButton(
              onPressed: _processing ? null : _pay,
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 54),
                backgroundColor: AppColors.gold500,
              ),
              child: _processing
                  ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.green900))
                  : Text('Pay ₹${widget.amount.toStringAsFixed(0)}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.green900)),
            ),
          ],
        ),
      ),
    );
  }
}

class _PaymentMethodTile extends StatelessWidget {
  final IconData icon;
  final String title, subtitle;
  final bool selected;
  final VoidCallback onTap;
  const _PaymentMethodTile({required this.icon, required this.title, required this.subtitle, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: selected ? AppColors.green700 : AppColors.green800,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: selected ? AppColors.gold500 : AppColors.green700, width: selected ? 2 : 1),
        ),
        child: Row(
          children: [
            Icon(icon, color: AppColors.gold400, size: 24),
            const SizedBox(width: 14),
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(title, style: const TextStyle(color: AppColors.ivory50, fontWeight: FontWeight.w600, fontSize: 15)),
              Text(subtitle, style: const TextStyle(color: AppColors.ivory100, fontSize: 12)),
            ]),
            const Spacer(),
            if (selected) const Icon(Icons.check_circle, color: AppColors.gold500, size: 20),
          ],
        ),
      ),
    );
  }
}
