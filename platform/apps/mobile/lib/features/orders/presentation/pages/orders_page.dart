import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/theme/app_theme.dart';

final myOrdersProvider = FutureProvider<List>((ref) async {
  final r = await ref.read(dioProvider).get('/orders/my');
  return r.data as List;
});

const _statusColors = {
  'pending':   Color(0xFFD97706),
  'confirmed': Color(0xFF2563EB),
  'preparing': Color(0xFF7C3AED),
  'ready':     Color(0xFF0891B2),
  'delivered': Color(0xFF059669),
  'cancelled': Color(0xFFDC2626),
};

const _statusIcons = {
  'pending':   Icons.hourglass_empty,
  'confirmed': Icons.check_circle_outline,
  'preparing': Icons.soup_kitchen_outlined,
  'ready':     Icons.done_all,
  'delivered': Icons.delivery_dining,
  'cancelled': Icons.cancel_outlined,
};

class OrdersPage extends ConsumerWidget {
  const OrdersPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(myOrdersProvider);

    return Scaffold(
      backgroundColor: AppColors.green900,
      appBar: AppBar(
        title: const Text('My Orders'),
        backgroundColor: AppColors.green900,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppColors.gold400),
            onPressed: () => ref.invalidate(myOrdersProvider),
          ),
        ],
      ),
      body: ordersAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.gold300)),
        error: (e, _) => Center(child: Text('Error: $e', style: const TextStyle(color: Colors.redAccent))),
        data: (orders) => orders.isEmpty
            ? const Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                Icon(Icons.receipt_long_outlined, color: AppColors.gold500, size: 64),
                SizedBox(height: 16),
                Text('No orders yet', style: TextStyle(color: AppColors.gold500, fontSize: 16)),
                SizedBox(height: 8),
                Text('Your order history will appear here', style: TextStyle(color: AppColors.gold500, fontSize: 13)),
              ]))
            : RefreshIndicator(
                color: AppColors.gold300,
                backgroundColor: AppColors.green800,
                onRefresh: () => ref.refresh(myOrdersProvider.future),
                child: ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: orders.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (_, i) => _OrderCard(order: orders[i]),
                ),
              ),
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  final Map order;
  const _OrderCard({required this.order});

  @override
  Widget build(BuildContext context) {
    final status = order['status'] as String;
    final color = _statusColors[status] ?? AppColors.gold500;
    final icon = _statusIcons[status] ?? Icons.receipt;
    final createdAt = DateTime.tryParse(order['created_at'] ?? '');
    final timeStr = createdAt != null ? '${createdAt.day}/${createdAt.month} · ${createdAt.hour}:${createdAt.minute.toString().padLeft(2, '0')}' : '';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.green800,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.green700),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 38, height: 38,
                decoration: BoxDecoration(color: color.withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
                child: Icon(icon, color: color, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Order #${(order["id"] as String).substring(0, 8).toUpperCase()}',
                    style: const TextStyle(color: AppColors.ivory50, fontWeight: FontWeight.w700, fontSize: 14)),
                  Text(timeStr, style: const TextStyle(color: AppColors.gold500, fontSize: 12)),
                ]),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: color.withOpacity(0.15), borderRadius: BorderRadius.circular(20), border: Border.all(color: color.withOpacity(0.3))),
                child: Text(status.toUpperCase(), style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 0.5)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(color: AppColors.green700, height: 1),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(order['order_type'] == 'dine_in' ? 'Dine In' : 'Takeaway',
                  style: const TextStyle(color: AppColors.ivory100, fontSize: 13)),
                const SizedBox(height: 2),
                Text(order['payment_status'] == 'paid' ? '✓ Paid' : 'Payment Pending',
                  style: TextStyle(color: order['payment_status'] == 'paid' ? Colors.green : AppColors.gold400, fontSize: 12, fontWeight: FontWeight.w600)),
              ]),
              Text('₹${order["total_amount"]}',
                style: const TextStyle(color: AppColors.gold300, fontWeight: FontWeight.w800, fontSize: 20)),
            ],
          ),

          // Active order tracking
          if (['confirmed', 'preparing', 'ready'].contains(status)) ...[
            const SizedBox(height: 16),
            _OrderTracker(status: status),
          ],
        ],
      ),
    );
  }
}

class _OrderTracker extends StatelessWidget {
  final String status;
  const _OrderTracker({required this.status});

  static const _stages = ['confirmed', 'preparing', 'ready', 'delivered'];
  static const _labels = ['Confirmed', 'Preparing', 'Ready', 'Delivered'];

  @override
  Widget build(BuildContext context) {
    final idx = _stages.indexOf(status);
    return Row(
      children: List.generate(_stages.length, (i) {
        final done = i <= idx;
        return Expanded(
          child: Row(
            children: [
              Column(children: [
                Container(
                  width: 20, height: 20,
                  decoration: BoxDecoration(
                    color: done ? AppColors.gold500 : AppColors.green700,
                    shape: BoxShape.circle,
                    border: Border.all(color: done ? AppColors.gold500 : AppColors.green600),
                  ),
                  child: done ? const Icon(Icons.check, size: 12, color: AppColors.green900) : null,
                ),
                const SizedBox(height: 4),
                Text(_labels[i], style: TextStyle(color: done ? AppColors.gold400 : AppColors.green700, fontSize: 9, fontWeight: FontWeight.w600), textAlign: TextAlign.center),
              ]),
              if (i < _stages.length - 1)
                Expanded(child: Container(height: 1.5, margin: const EdgeInsets.only(bottom: 14), color: done && i < idx ? AppColors.gold500 : AppColors.green700)),
            ],
          ),
        );
      }),
    );
  }
}
