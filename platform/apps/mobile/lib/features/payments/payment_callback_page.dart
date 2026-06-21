import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'payment_service.dart';

/// Handles the payment gateway callback redirect.
/// Verifies the payment and navigates to orders on success.
class PaymentCallbackPage extends ConsumerStatefulWidget {
  final String paymentId;
  final String transactionId;
  final String checksum;

  const PaymentCallbackPage({
    super.key,
    required this.paymentId,
    required this.transactionId,
    required this.checksum,
  });

  @override
  ConsumerState<PaymentCallbackPage> createState() => _PaymentCallbackState();
}

class _PaymentCallbackState extends ConsumerState<PaymentCallbackPage> {
  bool _verifying = true;
  bool _success = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _verify();
  }

  Future<void> _verify() async {
    try {
      final service = ref.read(paymentServiceProvider);
      final verified = await service.verifyPaymentCallback(
        paymentId: widget.paymentId,
        transactionId: widget.transactionId,
        checksum: widget.checksum,
      );
      if (!mounted) return;
      setState(() {
        _success = verified;
        _verifying = false;
        if (!verified) _error = 'Payment verification failed';
      });
      if (verified) {
        // Navigate to orders after brief success display
        await Future.delayed(const Duration(seconds: 2));
        if (mounted) context.go('/orders');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _verifying = false;
          _error = e.toString();
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (_verifying) ...[
                const CircularProgressIndicator(color: Color(0xFFF0CC8D)),
                const SizedBox(height: 24),
                const Text('Verifying payment...',
                    style: TextStyle(
                        color: Color(0xFFFAF6EC),
                        fontSize: 18,
                        fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                const Text('Please do not close this screen',
                    style: TextStyle(color: Color(0xFFC79A4E), fontSize: 13)),
              ] else if (_success) ...[
                const Icon(Icons.check_circle,
                    color: Colors.green, size: 72),
                const SizedBox(height: 24),
                const Text('Payment Successful!',
                    style: TextStyle(
                        color: Color(0xFFFAF6EC),
                        fontSize: 22,
                        fontFamily: 'Fraunces',
                        fontWeight: FontWeight.w900)),
                const SizedBox(height: 8),
                const Text('Redirecting to your orders...',
                    style: TextStyle(color: Color(0xFFC79A4E), fontSize: 14)),
              ] else ...[
                const Icon(Icons.error_outline,
                    color: Colors.redAccent, size: 72),
                const SizedBox(height: 24),
                Text(_error ?? 'Payment failed',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                        color: Color(0xFFFAF6EC),
                        fontSize: 18,
                        fontWeight: FontWeight.w600)),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () => context.go('/orders'),
                  child: const Text('View Orders'),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
