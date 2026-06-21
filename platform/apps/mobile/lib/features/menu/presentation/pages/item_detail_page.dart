import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../shared/providers/cart_provider.dart';

final itemDetailProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, id) async {
  final r = await ref.read(dioProvider).get('/menu/items/$id');
  return r.data as Map<String, dynamic>;
});

class ItemDetailPage extends ConsumerWidget {
  final String itemId;
  const ItemDetailPage({super.key, required this.itemId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final itemAsync = ref.watch(itemDetailProvider(itemId));

    return itemAsync.when(
      loading: () => const Scaffold(backgroundColor: AppColors.green900, body: Center(child: CircularProgressIndicator(color: AppColors.gold300))),
      error: (e, _) => Scaffold(backgroundColor: AppColors.green900, body: Center(child: Text('Error: $e', style: const TextStyle(color: Colors.red)))),
      data: (item) => _ItemDetail(item: item),
    );
  }
}

class _ItemDetail extends ConsumerStatefulWidget {
  final Map<String, dynamic> item;
  const _ItemDetail({required this.item});
  @override
  ConsumerState<_ItemDetail> createState() => _ItemDetailState();
}

class _ItemDetailState extends ConsumerState<_ItemDetail> {
  int _qty = 1;

  @override
  Widget build(BuildContext context) {
    final item = widget.item;
    return Scaffold(
      backgroundColor: AppColors.green900,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 280,
            pinned: true,
            backgroundColor: AppColors.green900,
            flexibleSpace: FlexibleSpaceBar(
              background: item['image_url'] != null
                  ? Image.network(item['image_url'], fit: BoxFit.cover)
                  : Container(color: AppColors.green800, child: const Center(child: Icon(Icons.restaurant, color: AppColors.gold500, size: 80))),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(item['name'] ?? '', style: const TextStyle(color: AppColors.ivory50, fontFamily: 'Fraunces', fontWeight: FontWeight.w900, fontSize: 26)),
                      ),
                      // Veg indicator
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: (item['is_veg'] == true ? Colors.green : Colors.red).withOpacity(0.15),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: item['is_veg'] == true ? Colors.green : Colors.red),
                        ),
                        child: Text(item['is_veg'] == true ? 'VEG' : 'NON-VEG',
                          style: TextStyle(color: item['is_veg'] == true ? Colors.green : Colors.red, fontSize: 11, fontWeight: FontWeight.w700)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(children: [
                    Text('₹${item["price"]}', style: const TextStyle(color: AppColors.gold400, fontSize: 22, fontWeight: FontWeight.w700)),
                    const SizedBox(width: 12),
                    Icon(Icons.access_time, color: AppColors.gold500.withOpacity(0.7), size: 14),
                    const SizedBox(width: 4),
                    Text('${item["preparation_time"]} min', style: const TextStyle(color: AppColors.gold500, fontSize: 12)),
                  ]),
                  const SizedBox(height: 16),

                  // Tags
                  Wrap(spacing: 8, children: [
                    if (item['is_best_seller'] == true) _Tag('⭐ Best Seller'),
                    if (item['is_chef_special'] == true) _Tag('👨‍🍳 Chef Special'),
                    if (item['is_recommended'] == true) _Tag('👍 Recommended'),
                  ]),

                  if (item['description'] != null) ...[
                    const SizedBox(height: 16),
                    Text(item['description'], style: const TextStyle(color: AppColors.ivory100, fontSize: 14, height: 1.6)),
                  ],

                  // Ingredients
                  if (item['ingredients'] != null && (item['ingredients'] as List).isNotEmpty) ...[
                    const SizedBox(height: 20),
                    const Text('Ingredients', style: TextStyle(color: AppColors.ivory50, fontWeight: FontWeight.w700, fontSize: 16)),
                    const SizedBox(height: 8),
                    Wrap(spacing: 8, runSpacing: 6,
                      children: (item['ingredients'] as List).map((ing) => Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(color: AppColors.green800, borderRadius: BorderRadius.circular(20), border: Border.all(color: AppColors.green700)),
                        child: Text(ing.toString(), style: const TextStyle(color: AppColors.ivory100, fontSize: 12)),
                      )).toList(),
                    ),
                  ],
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.green950,
          border: Border(top: BorderSide(color: AppColors.green800)),
        ),
        child: Row(
          children: [
            // Quantity
            Container(
              decoration: BoxDecoration(color: AppColors.green800, borderRadius: BorderRadius.circular(12)),
              child: Row(children: [
                IconButton(icon: const Icon(Icons.remove, color: AppColors.gold400), onPressed: () => setState(() => _qty = (_qty - 1).clamp(1, 10))),
                Text('$_qty', style: const TextStyle(color: AppColors.ivory50, fontWeight: FontWeight.w700, fontSize: 16)),
                IconButton(icon: const Icon(Icons.add, color: AppColors.gold400), onPressed: () => setState(() => _qty = (_qty + 1).clamp(1, 10))),
              ]),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: ElevatedButton(
                onPressed: () {
                  for (var i = 0; i < _qty; i++) {
                    ref.read(cartProvider.notifier).addItem(CartItem(
                      menuItemId: item['id'], name: item['name'],
                      price: (item['price'] as num).toDouble(), isVeg: item['is_veg'] ?? true,
                    ));
                  }
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('${item["name"]} added to cart'), backgroundColor: AppColors.green700, duration: const Duration(seconds: 2)),
                  );
                  Navigator.of(context).pop();
                },
                child: Text('Add to Cart · ₹${((item["price"] as num) * _qty).toStringAsFixed(0)}'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Tag extends StatelessWidget {
  final String text;
  const _Tag(this.text);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: AppColors.gold500.withOpacity(0.15), borderRadius: BorderRadius.circular(20), border: Border.all(color: AppColors.gold500.withOpacity(0.4))),
      child: Text(text, style: const TextStyle(color: AppColors.gold300, fontSize: 12, fontWeight: FontWeight.w600)),
    );
  }
}
