import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../shared/providers/cart_provider.dart';
import '../../../../shared/widgets/empty_state.dart';
import '../../../payments/payment_page.dart';

class CartPage extends ConsumerStatefulWidget {
  const CartPage({super.key});
  @override
  ConsumerState<CartPage> createState() => _CartPageState();
}

class _CartPageState extends ConsumerState<CartPage> {
  String _orderType = 'dine_in';
  String _paymentMethod = 'upi'; // upi, card, wallet, cash
  final _couponCtrl = TextEditingController();
  double _discount = 0;
  String? _couponError;
  bool _placingOrder = false;

  @override
  void dispose() { _couponCtrl.dispose(); super.dispose(); }

  Future<void> _validateCoupon(double subtotal) async {
    setState(() => _couponError = null);
    final code = _couponCtrl.text.trim();
    if (code.isEmpty) return;
    try {
      final dio = ref.read(dioProvider);
      final r = await dio.post('/offers/coupons/validate', queryParameters: {'code': code, 'order_subtotal': subtotal});
      setState(() => _discount = (r.data['discount'] as num).toDouble());
    } catch (e) {
      setState(() { _discount = 0; _couponError = 'Invalid coupon'; });
    }
  }

  Future<void> _placeOrder() async {
    final items = ref.read(cartProvider);
    if (items.isEmpty) return;
    setState(() => _placingOrder = true);
    try {
      final dio = ref.read(dioProvider);
      final subtotal = ref.read(cartSubtotalProvider);
      final total = (subtotal - _discount).clamp(0, double.infinity);
      final body = {
        'branch_id': '11111111-1111-1111-1111-111111111111',
        'order_type': _orderType,
        'payment_method': _paymentMethod,
        'items': items.map((i) => {'menu_item_id': i.menuItemId, 'quantity': i.quantity}).toList(),
        if (_couponCtrl.text.isNotEmpty) 'coupon_code': _couponCtrl.text.trim(),
      };
      final orderRes = await dio.post('/orders', data: body);
      ref.read(cartProvider.notifier).clear();

      if (!mounted) return;

      final orderId = orderRes.data['id']?.toString() ?? '';

      // If online payment method selected, navigate to payment page
      if (_paymentMethod != 'cash' && orderId.isNotEmpty) {
        context.push('/payment?orderId=$orderId&amount=$total');
        return;
      }

      // Cash on delivery / dine-in — go straight to orders
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Order placed successfully!'), backgroundColor: Colors.green),
      );
      context.go('/orders');
    } catch (e) {
      if (mounted) {
        final msg = e.toString().contains('409')
            ? 'An item is unavailable. Please review your cart.'
            : e.toString().contains('401')
                ? 'Please sign in again to place orders.'
                : 'Order failed: $e';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(msg), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _placingOrder = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final items = ref.watch(cartProvider);
    final subtotal = ref.watch(cartSubtotalProvider);
    final total = (subtotal - _discount).clamp(0, double.infinity);

    return Scaffold(
      backgroundColor: AppColors.green900,
      appBar: AppBar(title: const Text('Your Cart'), backgroundColor: AppColors.green900),
      body: items.isEmpty
          ? EmptyState(
              icon: Icons.shopping_bag_outlined,
              title: 'Your cart is empty',
              subtitle: 'Add items from the menu to get started',
              action: OutlinedButton(
                onPressed: () => context.go('/menu'),
                child: const Text('Browse Menu'),
              ),
            )
          : ListView(
              padding: const EdgeInsets.all(20),
              children: [
                // Cart items
                ...items.map((item) => _CartItemRow(item: item)),
                const SizedBox(height: 20),

                // Order type
                Row(children: [
                  _TypeBtn('Dine In', 'dine_in', _orderType, (v) => setState(() => _orderType = v)),
                  const SizedBox(width: 12),
                  _TypeBtn('Takeaway', 'takeaway', _orderType, (v) => setState(() => _orderType = v)),
                ]),
                const SizedBox(height: 16),

                // Payment method
                const Text('Payment Method',
                    style: TextStyle(color: AppColors.ivory50, fontWeight: FontWeight.w600, fontSize: 14)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 10,
                  runSpacing: 8,
                  children: [
                    _PayMethodChip('UPI', 'upi', _paymentMethod, (v) => setState(() => _paymentMethod = v)),
                    _PayMethodChip('Card', 'card', _paymentMethod, (v) => setState(() => _paymentMethod = v)),
                    _PayMethodChip('Wallet', 'wallet', _paymentMethod, (v) => setState(() => _paymentMethod = v)),
                    _PayMethodChip('Cash', 'cash', _paymentMethod, (v) => setState(() => _paymentMethod = v)),
                  ],
                ),
                const SizedBox(height: 20),

                // Coupon
                Row(children: [
                  Expanded(
                    child: TextField(
                      controller: _couponCtrl,
                      style: const TextStyle(color: AppColors.ivory50),
                      decoration: InputDecoration(
                        hintText: 'Coupon code',
                        errorText: _couponError,
                        errorStyle: const TextStyle(color: Colors.redAccent),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  TextButton(
                    onPressed: () => _validateCoupon(subtotal),
                    child: const Text('Apply', style: TextStyle(color: AppColors.gold300, fontWeight: FontWeight.w700)),
                  ),
                ]),
                const SizedBox(height: 20),

                // Summary
                _SummaryRow('Subtotal', '₹${subtotal.toStringAsFixed(0)}'),
                if (_discount > 0) _SummaryRow('Discount', '-₹${_discount.toStringAsFixed(0)}', isDiscount: true),
                const Divider(color: AppColors.green700),
                _SummaryRow('Total', '₹${total.toStringAsFixed(0)}', isBold: true),
                const SizedBox(height: 24),

                ElevatedButton(
                  onPressed: _placingOrder ? null : _placeOrder,
                  child: _placingOrder
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.green900))
                      : Text('Place Order · ₹${total.toStringAsFixed(0)}'),
                ),
              ],
            ),
    );
  }
}

class _CartItemRow extends ConsumerWidget {
  final CartItem item;
  const _CartItemRow({required this.item});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: AppColors.green800, borderRadius: BorderRadius.circular(14)),
      child: Row(
        children: [
          Container(
            width: 10, height: 10,
            decoration: BoxDecoration(border: Border.all(color: item.isVeg ? Colors.green : Colors.red), borderRadius: BorderRadius.circular(2)),
            child: Center(child: Container(width: 5, height: 5, decoration: BoxDecoration(color: item.isVeg ? Colors.green : Colors.red, shape: BoxShape.circle))),
          ),
          const SizedBox(width: 10),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(item.name, style: const TextStyle(color: AppColors.ivory50, fontWeight: FontWeight.w600, fontSize: 14)),
            Text('₹${item.price.toStringAsFixed(0)} each', style: const TextStyle(color: AppColors.gold500, fontSize: 12)),
          ])),
          // Qty controls
          Row(children: [
            GestureDetector(
              onTap: () => ref.read(cartProvider.notifier).updateQuantity(item.menuItemId, item.quantity - 1),
              child: Container(width: 28, height: 28, decoration: BoxDecoration(color: AppColors.green700, borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.remove, size: 16, color: AppColors.gold400)),
            ),
            Padding(padding: const EdgeInsets.symmetric(horizontal: 10), child: Text('${item.quantity}', style: const TextStyle(color: AppColors.ivory50, fontWeight: FontWeight.w700))),
            GestureDetector(
              onTap: () => ref.read(cartProvider.notifier).updateQuantity(item.menuItemId, item.quantity + 1),
              child: Container(width: 28, height: 28, decoration: BoxDecoration(color: AppColors.gold500, borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.add, size: 16, color: AppColors.green900)),
            ),
          ]),
          const SizedBox(width: 12),
          Text('₹${item.lineTotal.toStringAsFixed(0)}', style: const TextStyle(color: AppColors.gold300, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}

class _TypeBtn extends StatelessWidget {
  final String label, value, selected;
  final ValueChanged<String> onTap;
  const _TypeBtn(this.label, this.value, this.selected, this.onTap);

  @override
  Widget build(BuildContext context) {
    final active = value == selected;
    return GestureDetector(
      onTap: () => onTap(value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        decoration: BoxDecoration(
          color: active ? AppColors.gold500 : AppColors.green800,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: active ? AppColors.gold500 : AppColors.green700),
        ),
        child: Text(label, style: TextStyle(color: active ? AppColors.green900 : AppColors.ivory100, fontWeight: active ? FontWeight.w700 : FontWeight.w400)),
      ),
    );
  }
}

class _PayMethodChip extends StatelessWidget {
  final String label, value, selected;
  final ValueChanged<String> onTap;
  const _PayMethodChip(this.label, this.value, this.selected, this.onTap);

  IconData _iconFor(String v) {
    switch (v) {
      case 'upi': return Icons.account_balance;
      case 'card': return Icons.credit_card;
      case 'wallet': return Icons.account_balance_wallet;
      default: return Icons.money;
    }
  }

  @override
  Widget build(BuildContext context) {
    final active = value == selected;
    return GestureDetector(
      onTap: () => onTap(value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: active ? AppColors.gold500.withOpacity(0.15) : AppColors.green800,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: active ? AppColors.gold500 : AppColors.green700),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(_iconFor(value), color: active ? AppColors.gold300 : AppColors.gold500, size: 16),
            const SizedBox(width: 6),
            Text(label,
                style: TextStyle(
                    color: active ? AppColors.gold300 : AppColors.ivory100,
                    fontWeight: active ? FontWeight.w700 : FontWeight.w400,
                    fontSize: 13)),
          ],
        ),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label, value;
  final bool isBold, isDiscount;
  const _SummaryRow(this.label, this.value, {this.isBold = false, this.isDiscount = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: AppColors.ivory100, fontWeight: isBold ? FontWeight.w700 : FontWeight.w400, fontSize: isBold ? 16 : 14)),
          Text(value, style: TextStyle(color: isDiscount ? Colors.green : (isBold ? AppColors.gold300 : AppColors.ivory100), fontWeight: isBold ? FontWeight.w700 : FontWeight.w400, fontSize: isBold ? 18 : 14)),
        ],
      ),
    );
  }
}
