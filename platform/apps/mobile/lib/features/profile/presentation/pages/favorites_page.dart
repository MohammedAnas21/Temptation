import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/theme/app_theme.dart';

final favoritesProvider = FutureProvider<List>((ref) async {
  final r = await ref.read(dioProvider).get('/favorites');
  return r.data as List;
});

class FavoritesPage extends ConsumerWidget {
  const FavoritesPage({super.key});

  Future<void> _remove(WidgetRef ref, String itemId) async {
    await ref.read(dioProvider).delete('/favorites/$itemId');
    ref.invalidate(favoritesProvider);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final favoritesAsync = ref.watch(favoritesProvider);
    return Scaffold(
      backgroundColor: AppColors.green900,
      appBar: AppBar(title: const Text('Favorites'), backgroundColor: AppColors.green900),
      body: favoritesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.gold300)),
        error: (e, _) => Center(child: Text('Failed to load: $e', style: const TextStyle(color: Colors.redAccent))),
        data: (items) => items.isEmpty
            ? const Center(child: Text('No favorites yet.\nTap the heart on any menu item to save it here.', textAlign: TextAlign.center, style: TextStyle(color: AppColors.gold500)))
            : ListView.separated(
                padding: const EdgeInsets.all(20),
                itemCount: items.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (_, i) {
                  final item = items[i] as Map;
                  return GestureDetector(
                    onTap: () => context.push('/menu/${item["menu_item_id"]}'),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: AppColors.green800, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.green700)),
                      child: Row(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: item['image_url'] != null
                                ? CachedNetworkImage(imageUrl: item['image_url'], width: 56, height: 56, fit: BoxFit.cover)
                                : Container(width: 56, height: 56, color: AppColors.green700, child: const Icon(Icons.restaurant, color: AppColors.gold500)),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(item['name'] ?? '', style: const TextStyle(color: AppColors.ivory50, fontWeight: FontWeight.w600, fontSize: 14)),
                                const SizedBox(height: 4),
                                Text('₹${item["price"]}', style: const TextStyle(color: AppColors.gold400, fontWeight: FontWeight.w700, fontSize: 13)),
                              ],
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.favorite, color: Colors.redAccent),
                            onPressed: () => _remove(ref, item['menu_item_id'].toString()),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
      ),
    );
  }
}
