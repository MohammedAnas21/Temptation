import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../shared/providers/auth_provider.dart';
import '../../../../shared/widgets/loading_skeleton.dart';
import '../../../../shared/widgets/error_state.dart';

final homeDataProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final dio = ref.read(dioProvider);
  final results = await Future.wait([
    dio.get('/offers').then((r) => r.data),
    dio.get('/menu/items', queryParameters: {
      'branch_id': ApiConstants.branchId,
      'tag': 'recommended',
    }).then((r) => r.data),
    dio.get('/loyalty/me').then((r) => r.data),
  ]);
  return {'offers': results[0], 'featured': results[1], 'loyalty': results[2]};
});

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(userProfileProvider);
    final dataAsync = ref.watch(homeDataProvider);

    return Scaffold(
      backgroundColor: AppColors.green900,
      body: SafeArea(
        child: RefreshIndicator(
          color: AppColors.gold300,
          backgroundColor: AppColors.green800,
          onRefresh: () => ref.refresh(homeDataProvider.future),
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20),
                // Greeting
                profileAsync.when(
                  data: (p) => _Greeting(name: p['name'] ?? 'Guest'),
                  loading: () => const _Greeting(name: '…'),
                  error: (_, __) => const _Greeting(name: 'Guest'),
                ),
                const SizedBox(height: 24),

                dataAsync.when(
                  loading: () => Column(
                    children: [
                      const LoadingSkeleton(height: 130, isCard: true, borderRadius: 20),
                      const SizedBox(height: 16),
                      const LoadingSkeleton(lines: 2),
                      const SizedBox(height: 16),
                      LoadingSkeletonRow(count: 4, cardHeight: 180, cardWidth: 140),
                    ],
                  ),
                  error: (e, _) => ErrorState(
                    message: 'Failed to load: $e',
                    onRetry: () => ref.invalidate(homeDataProvider),
                  ),
                  data: (data) => Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Loyalty card
                      if (data['loyalty'] != null) _LoyaltyCard(loyalty: data['loyalty']),
                      const SizedBox(height: 24),

                      // Quick actions
                      _QuickActions(),
                      const SizedBox(height: 24),

                      // Offers
                      if ((data['offers'] as List).isNotEmpty) ...[
                        _SectionHeader(title: 'Active Offers', onTap: () {}),
                        const SizedBox(height: 12),
                        _OffersCarousel(offers: data['offers'] as List),
                        const SizedBox(height: 24),
                      ],

                      // Featured menu
                      if ((data['featured'] as List).isNotEmpty) ...[
                        _SectionHeader(title: "Chef's Picks", onTap: () => context.go('/menu')),
                        const SizedBox(height: 12),
                        _FeaturedItems(items: data['featured'] as List),
                        const SizedBox(height: 24),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _Greeting extends StatelessWidget {
  final String name;
  const _Greeting({required this.name});

  String _timeGreeting() {
    final h = DateTime.now().hour;
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('${_timeGreeting()}, ${name.split(' ').first} 👋',
          style: const TextStyle(color: AppColors.ivory50, fontSize: 24, fontFamily: 'Fraunces', fontWeight: FontWeight.w900)),
        const SizedBox(height: 4),
        const Text("Welcome to Temptations Cafe",
          style: TextStyle(color: AppColors.gold500, fontSize: 13)),
      ],
    );
  }
}

class _LoyaltyCard extends StatelessWidget {
  final Map loyalty;
  const _LoyaltyCard({required this.loyalty});

  @override
  Widget build(BuildContext context) {
    final tier = loyalty['tier'] ?? 'bronze';
    final balance = loyalty['points_balance'] ?? 0;
    final tierColor = tier == 'gold' ? AppColors.gold300 : tier == 'silver' ? Colors.grey[300]! : AppColors.gold600;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [AppColors.green800, AppColors.green700], begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.gold500.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Icon(Icons.stars_rounded, color: tierColor, size: 36),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('$balance Points', style: TextStyle(color: AppColors.ivory50, fontSize: 22, fontFamily: 'Fraunces', fontWeight: FontWeight.w900)),
                Row(children: [
                  Container(
                    margin: const EdgeInsets.only(top: 4),
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(color: tierColor.withOpacity(0.2), borderRadius: BorderRadius.circular(20)),
                    child: Text(tier.toUpperCase(), style: TextStyle(color: tierColor, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1)),
                  ),
                ]),
              ],
            ),
          ),
          TextButton(
            onPressed: () => context.go('/loyalty'),
            child: const Text('View', style: TextStyle(color: AppColors.gold300)),
          ),
        ],
      ),
    );
  }
}

class _QuickActions extends StatelessWidget {
  final _actions = const [
    {'label': 'Reserve',  'icon': Icons.event_seat,      'route': '/reservations'},
    {'label': 'Order',    'icon': Icons.restaurant_menu, 'route': '/menu'},
    {'label': 'My Orders','icon': Icons.receipt_long,    'route': '/orders'},
    {'label': 'Profile',  'icon': Icons.person_outline,  'route': '/profile'},
  ];

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: _actions.map((a) => _ActionBtn(
        label: a['label'] as String,
        icon: a['icon'] as IconData,
        onTap: () => context.go(a['route'] as String),
      )).toList(),
    );
  }
}

class _ActionBtn extends StatelessWidget {
  final String label; final IconData icon; final VoidCallback onTap;
  const _ActionBtn({required this.label, required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(children: [
        Container(
          width: 56, height: 56,
          decoration: BoxDecoration(color: AppColors.green800, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.gold500.withOpacity(0.25))),
          child: Icon(icon, color: AppColors.gold400, size: 24),
        ),
        const SizedBox(height: 6),
        Text(label, style: const TextStyle(color: AppColors.ivory100, fontSize: 11, fontWeight: FontWeight.w500)),
      ]),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title; final VoidCallback onTap;
  const _SectionHeader({required this.title, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: const TextStyle(color: AppColors.ivory50, fontSize: 18, fontFamily: 'Fraunces', fontWeight: FontWeight.w700)),
        GestureDetector(onTap: onTap, child: const Text('See all', style: TextStyle(color: AppColors.gold400, fontSize: 13))),
      ],
    );
  }
}

class _OffersCarousel extends StatelessWidget {
  final List offers;
  const _OffersCarousel({required this.offers});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 100,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: offers.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (_, i) {
          final o = offers[i];
          return Container(
            width: 220,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [AppColors.green700, AppColors.green800]),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.gold500.withOpacity(0.3)),
            ),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [
              Text(o['title'] ?? '', style: const TextStyle(color: AppColors.gold300, fontWeight: FontWeight.w700, fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis),
              const SizedBox(height: 4),
              Text(o['description'] ?? '', style: const TextStyle(color: AppColors.ivory100, fontSize: 11), maxLines: 2, overflow: TextOverflow.ellipsis),
            ]),
          );
        },
      ),
    );
  }
}

class _FeaturedItems extends StatelessWidget {
  final List items;
  const _FeaturedItems({required this.items});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 180,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: items.take(6).length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (_, i) {
          final item = items[i];
          return GestureDetector(
            onTap: () => context.push('/menu/${item["id"]}'),
            child: Container(
              width: 140,
              decoration: BoxDecoration(color: AppColors.green800, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.green700)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    height: 100,
                    decoration: BoxDecoration(color: AppColors.green700, borderRadius: const BorderRadius.vertical(top: Radius.circular(16))),
                    child: item['image_url'] != null
                        ? ClipRRect(
                            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                            child: CachedNetworkImage(
                              imageUrl: item['image_url'],
                              fit: BoxFit.cover,
                              width: double.infinity,
                              placeholder: (_, __) => Container(color: AppColors.green700),
                              errorWidget: (_, __, ___) => const Center(child: Icon(Icons.restaurant, color: AppColors.gold500, size: 32)),
                            ),
                          )
                        : const Center(child: Icon(Icons.restaurant, color: AppColors.gold500, size: 32)),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(10),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(item['name'] ?? '', style: const TextStyle(color: AppColors.ivory50, fontWeight: FontWeight.w600, fontSize: 12), maxLines: 1, overflow: TextOverflow.ellipsis),
                      const SizedBox(height: 3),
                      Text('₹${item["price"]}', style: const TextStyle(color: AppColors.gold400, fontWeight: FontWeight.w700, fontSize: 13)),
                    ]),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
