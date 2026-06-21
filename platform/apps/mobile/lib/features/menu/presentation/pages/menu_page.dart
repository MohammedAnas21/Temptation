import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../shared/providers/cart_provider.dart';
import '../../../../shared/widgets/loading_skeleton.dart';
import '../../../../shared/widgets/error_state.dart';
import '../../../../shared/widgets/empty_state.dart';

final categoriesProvider = FutureProvider<List>((ref) async {
  final dio = ref.read(dioProvider);
  final r = await dio.get('/menu/categories', queryParameters: {'branch_id': ApiConstants.branchId});
  return r.data as List;
});

final menuItemsProvider = FutureProvider.family<List, Map<String, String?>>((ref, params) async {
  final dio = ref.read(dioProvider);
  final qp = <String, String>{'branch_id': ApiConstants.branchId};
  if (params['category_id'] != null) qp['category_id'] = params['category_id']!;
  if (params['is_veg'] != null)      qp['is_veg'] = params['is_veg']!;
  if (params['search'] != null)      qp['search'] = params['search']!;
  final r = await dio.get('/menu/items', queryParameters: qp);
  return r.data as List;
});

class MenuPage extends ConsumerStatefulWidget {
  const MenuPage({super.key});
  @override
  ConsumerState<MenuPage> createState() => _MenuPageState();
}

class _MenuPageState extends ConsumerState<MenuPage> {
  String? _selectedCatId;
  bool? _vegFilter;
  String _search = '';
  final _searchCtrl = TextEditingController();

  @override
  void dispose() { _searchCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final catsAsync = ref.watch(categoriesProvider);
    final params = <String, String?>{
      'category_id': _selectedCatId,
      'is_veg': _vegFilter == null ? null : _vegFilter.toString(),
      'search': _search.isEmpty ? null : _search,
    };
    final itemsAsync = ref.watch(menuItemsProvider(params));
    final cartCount = ref.watch(cartCountProvider);

    return Scaffold(
      backgroundColor: AppColors.green900,
      appBar: AppBar(
        title: const Text('Menu'),
        backgroundColor: AppColors.green900,
        actions: [
          if (cartCount > 0)
            Stack(
              clipBehavior: Clip.none,
              children: [
                IconButton(icon: const Icon(Icons.shopping_bag_outlined, color: AppColors.gold300), onPressed: () => context.push('/cart')),
                Positioned(top: 6, right: 6,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(color: AppColors.gold500, shape: BoxShape.circle),
                    child: Text('$cartCount', style: const TextStyle(color: AppColors.green900, fontSize: 10, fontWeight: FontWeight.w800)),
                  ),
                ),
              ],
            ),
        ],
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
            child: TextField(
              controller: _searchCtrl,
              style: const TextStyle(color: AppColors.ivory50),
              onChanged: (v) => setState(() => _search = v),
              decoration: const InputDecoration(
                hintText: 'Search menu…',
                prefixIcon: Icon(Icons.search, color: AppColors.gold500),
                contentPadding: EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ),

          // Veg toggle + category chips
          catsAsync.when(
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
            data: (cats) => SizedBox(
              height: 50,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                children: [
                  // Veg toggle
                  _FilterChip(
                    label: '🟢 Veg',
                    selected: _vegFilter == true,
                    onTap: () => setState(() => _vegFilter = _vegFilter == true ? null : true),
                  ),
                  const SizedBox(width: 8),
                  _FilterChip(
                    label: 'All',
                    selected: _selectedCatId == null,
                    onTap: () => setState(() => _selectedCatId = null),
                  ),
                  const SizedBox(width: 8),
                  ...cats.map((c) => Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: _FilterChip(
                      label: c['name'],
                      selected: _selectedCatId == c['id'],
                      onTap: () => setState(() => _selectedCatId = c['id']),
                    ),
                  )),
                ],
              ),
            ),
          ),

          // Items grid
          Expanded(
            child: itemsAsync.when(
              loading: () => Padding(
                padding: const EdgeInsets.all(16),
                child: GridView.builder(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2, childAspectRatio: 0.78,
                    crossAxisSpacing: 12, mainAxisSpacing: 12,
                  ),
                  itemCount: 6,
                  itemBuilder: (_, __) => const LoadingSkeleton(
                    isCard: true, height: double.infinity, borderRadius: 16,
                  ),
                ),
              ),
              error: (e, _) => ErrorState(
                message: 'Error loading menu: $e',
                onRetry: () => ref.invalidate(menuItemsProvider(params)),
              ),
              data: (items) => items.isEmpty
                  ? const EmptyState(
                      icon: Icons.restaurant_menu,
                      title: 'No items found',
                      subtitle: 'Try a different category or remove filters',
                    )
                  : GridView.builder(
                      padding: const EdgeInsets.all(16),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2, childAspectRatio: 0.78,
                        crossAxisSpacing: 12, mainAxisSpacing: 12,
                      ),
                      itemCount: items.length,
                      itemBuilder: (_, i) => _MenuItemCard(item: items[i]),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label; final bool selected; final VoidCallback onTap;
  const _FilterChip({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: selected ? AppColors.gold500 : AppColors.green800,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: selected ? AppColors.gold500 : AppColors.green700),
        ),
        child: Text(label, style: TextStyle(color: selected ? AppColors.green900 : AppColors.ivory100, fontSize: 13, fontWeight: selected ? FontWeight.w700 : FontWeight.w400)),
      ),
    );
  }
}

class _MenuItemCard extends ConsumerWidget {
  final Map item;
  const _MenuItemCard({required this.item});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return GestureDetector(
      onTap: () => context.push('/menu/${item["id"]}'),
      child: Container(
        decoration: BoxDecoration(color: AppColors.green800, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.green700)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            Stack(
              children: [
                Container(
                  height: 110,
                  decoration: BoxDecoration(color: AppColors.green700, borderRadius: const BorderRadius.vertical(top: Radius.circular(16))),
                  child: item['image_url'] != null
                      ? ClipRRect(
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                          child: CachedNetworkImage(
                            imageUrl: item['image_url'],
                            fit: BoxFit.cover,
                            width: double.infinity,
                            placeholder: (_, __) => Container(color: AppColors.green700),
                            errorWidget: (_, __, ___) => const Center(child: Icon(Icons.restaurant, color: AppColors.gold500, size: 36)),
                          ),
                        )
                      : const Center(child: Icon(Icons.restaurant, color: AppColors.gold500, size: 36)),
                ),
                Positioned(top: 6, left: 6,
                  child: Container(
                    width: 14, height: 14,
                    decoration: BoxDecoration(
                      border: Border.all(color: item['is_veg'] ? Colors.green : Colors.red, width: 1.5),
                      borderRadius: BorderRadius.circular(2),
                    ),
                    child: Center(child: Container(width: 7, height: 7, decoration: BoxDecoration(color: item['is_veg'] ? Colors.green : Colors.red, shape: BoxShape.circle))),
                  ),
                ),
                if (item['is_best_seller'] == true)
                  Positioned(top: 6, right: 6,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                      decoration: BoxDecoration(color: AppColors.gold500, borderRadius: BorderRadius.circular(6)),
                      child: const Text('⭐', style: TextStyle(fontSize: 10)),
                    ),
                  ),
              ],
            ),
            // Info
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item['name'] ?? '', style: const TextStyle(color: AppColors.ivory50, fontWeight: FontWeight.w600, fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('₹${item["price"]}', style: const TextStyle(color: AppColors.gold400, fontWeight: FontWeight.w700, fontSize: 14)),
                      GestureDetector(
                        onTap: () => ref.read(cartProvider.notifier).addItem(CartItem(
                          menuItemId: item['id'], name: item['name'], price: (item['price'] as num).toDouble(), isVeg: item['is_veg'] ?? true,
                        )),
                        child: Container(
                          width: 28, height: 28,
                          decoration: BoxDecoration(color: AppColors.gold500, borderRadius: BorderRadius.circular(8)),
                          child: const Icon(Icons.add, color: AppColors.green900, size: 18),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
