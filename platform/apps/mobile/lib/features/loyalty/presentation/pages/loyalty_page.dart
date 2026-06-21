import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../shared/providers/auth_provider.dart';

final loyaltyProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final r = await ref.read(dioProvider).get('/loyalty/me');
  return r.data as Map<String, dynamic>;
});

final loyaltyTransactionsProvider = FutureProvider<List>((ref) async {
  final r = await ref.read(dioProvider).get('/loyalty/transactions?limit=20');
  return r.data as List;
});

class LoyaltyPage extends ConsumerWidget {
  const LoyaltyPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final loyaltyAsync = ref.watch(loyaltyProvider);
    final txnAsync = ref.watch(loyaltyTransactionsProvider);

    return Scaffold(
      backgroundColor: AppColors.green900,
      appBar: AppBar(title: const Text('Loyalty & Rewards'), backgroundColor: AppColors.green900),
      body: RefreshIndicator(
        color: AppColors.gold300,
        backgroundColor: AppColors.green800,
        onRefresh: () async {
          ref.invalidate(loyaltyProvider);
          ref.invalidate(loyaltyTransactionsProvider);
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Points card
              loyaltyAsync.when(
                loading: () => const _SkeletonCard(),
                error: (_, __) => const SizedBox.shrink(),
                data: (l) => _PointsCard(loyalty: l),
              ),
              const SizedBox(height: 24),

              // Tier benefits
              loyaltyAsync.when(
                loading: () => const SizedBox.shrink(),
                error: (_, __) => const SizedBox.shrink(),
                data: (l) => _TierBenefits(tier: l['tier'] ?? 'bronze', tierInfo: l['tier_info'] ?? {}),
              ),
              const SizedBox(height: 24),

              // Referral card
              loyaltyAsync.when(
                loading: () => const SizedBox.shrink(),
                error: (_, __) => const SizedBox.shrink(),
                data: (l) => const _ReferralCard(),
              ),
              const SizedBox(height: 24),

              // Transaction history
              const Text('Points History', style: TextStyle(color: AppColors.ivory50, fontFamily: 'Fraunces', fontWeight: FontWeight.w700, fontSize: 18)),
              const SizedBox(height: 12),
              txnAsync.when(
                loading: () => const Center(child: CircularProgressIndicator(color: AppColors.gold300)),
                error: (e, _) => Text('Error: $e', style: const TextStyle(color: Colors.redAccent)),
                data: (txns) => txns.isEmpty
                    ? const Center(child: Padding(padding: EdgeInsets.symmetric(vertical: 32), child: Text('No transactions yet', style: TextStyle(color: AppColors.gold500))))
                    : Column(children: txns.map((t) => _TxnRow(txn: t)).toList()),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PointsCard extends StatelessWidget {
  final Map loyalty;
  const _PointsCard({required this.loyalty});

  static const _tierColors = {'gold': AppColors.gold300, 'silver': Color(0xFFD1D5DB), 'bronze': AppColors.gold600};
  static const _tierEmojis = {'gold': '🥇', 'silver': '🥈', 'bronze': '🥉'};

  @override
  Widget build(BuildContext context) {
    final tier = loyalty['tier'] as String? ?? 'bronze';
    final balance = loyalty['points_balance'] as int? ?? 0;
    final lifetime = loyalty['lifetime_points'] as int? ?? 0;
    final tierInfo = loyalty['tier_info'] as Map? ?? {};
    final color = _tierColors[tier] ?? AppColors.gold500;
    final progress = (tierInfo['progress_pct'] as num? ?? 0).toDouble() / 100;
    final toNext = tierInfo['points_to_next'] as int? ?? 0;
    final nextTier = tierInfo['next'] as String?;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [AppColors.green800, AppColors.green700], begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('${_tierEmojis[tier]} ${tier.toUpperCase()} MEMBER', style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w700, letterSpacing: 1.5)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(color: color.withOpacity(0.15), borderRadius: BorderRadius.circular(20)),
                child: Text('$lifetime lifetime pts', style: TextStyle(color: color, fontSize: 11)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text('$balance', style: const TextStyle(color: AppColors.ivory50, fontFamily: 'Fraunces', fontWeight: FontWeight.w900, fontSize: 52)),
          const Text('Available Points', style: TextStyle(color: AppColors.gold500, fontSize: 13)),
          const SizedBox(height: 20),

          // Progress to next tier
          if (nextTier != null) ...[
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Text('Progress to ${nextTier.toUpperCase()}', style: const TextStyle(color: AppColors.ivory100, fontSize: 12)),
              Text('$toNext pts to go', style: const TextStyle(color: AppColors.gold500, fontSize: 12)),
            ]),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                value: progress.clamp(0.0, 1.0),
                backgroundColor: AppColors.green900,
                valueColor: AlwaysStoppedAnimation<Color>(color),
                minHeight: 8,
              ),
            ),
          ] else
            Text('You\'ve reached the highest tier! 🎉', style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.w600)),

          const SizedBox(height: 16),
          const Text('100 points = ₹10 discount · Earn 1 pt per ₹10 spent', style: TextStyle(color: AppColors.gold500, fontSize: 11)),
        ],
      ),
    );
  }
}

class _TierBenefits extends StatelessWidget {
  final String tier;
  final Map tierInfo;
  const _TierBenefits({required this.tier, required this.tierInfo});

  static const _benefits = {
    'bronze': ['1× points on every order', 'Birthday bonus: 500 pts', 'Anniversary bonus: 300 pts'],
    'silver': ['1.25× points on every order', 'Priority table reservation', 'All Bronze benefits'],
    'gold':   ['1.5× points on every order', 'Free birthday dessert', 'Priority reservation', 'All Silver benefits'],
  };

  @override
  Widget build(BuildContext context) {
    final b = _benefits[tier] ?? [];
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(color: AppColors.green800, borderRadius: BorderRadius.circular(18), border: Border.all(color: AppColors.green700)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('${tier.toUpperCase()} Benefits', style: const TextStyle(color: AppColors.gold300, fontWeight: FontWeight.w700, fontSize: 14)),
          const SizedBox(height: 12),
          ...b.map((benefit) => Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Row(children: [
              const Icon(Icons.check_circle, color: AppColors.gold500, size: 16),
              const SizedBox(width: 10),
              Text(benefit, style: const TextStyle(color: AppColors.ivory100, fontSize: 13)),
            ]),
          )),
        ],
      ),
    );
  }
}

class _ReferralCard extends ConsumerWidget {
  const _ReferralCard();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(userProfileProvider);

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(color: AppColors.green800, borderRadius: BorderRadius.circular(18), border: Border.all(color: AppColors.gold500.withOpacity(0.3))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('🎁 Refer & Earn', style: TextStyle(color: AppColors.gold300, fontWeight: FontWeight.w700, fontSize: 15)),
          const SizedBox(height: 6),
          const Text('Earn 200 points for every friend you refer who places their first order.', style: TextStyle(color: AppColors.ivory100, fontSize: 13, height: 1.5)),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(color: AppColors.green900, borderRadius: BorderRadius.circular(10)),
                  child: profileAsync.when(
                    loading: () => const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.gold400)),
                    error: (_, __) => const Text('—', style: TextStyle(color: AppColors.gold400, fontWeight: FontWeight.w600, fontSize: 13)),
                    data: (profile) {
                      final code = profile['referral_code'] as String? ?? 'TEMPT000';
                      return Text(code, style: const TextStyle(color: AppColors.gold400, fontWeight: FontWeight.w600, fontSize: 14, letterSpacing: 1.5));
                    },
                  ),
                ),
              ),
              const SizedBox(width: 10),
              GestureDetector(
                onTap: () {
                  profileAsync.whenData((profile) {
                    final code = profile['referral_code'] as String? ?? 'TEMPT000';
                    Clipboard.setData(ClipboardData(text: code)).then((_) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Referral code copied!'), duration: Duration(seconds: 1)),
                      );
                    });
                  });
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(color: AppColors.gold500, borderRadius: BorderRadius.circular(10)),
                  child: const Text('Copy', style: TextStyle(color: AppColors.green900, fontWeight: FontWeight.w700)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _TxnRow extends StatelessWidget {
  final Map txn;
  const _TxnRow({required this.txn});

  static const _typeIcons = {
    'earn': Icons.add_circle_outline,
    'redeem': Icons.remove_circle_outline,
    'referral': Icons.people_outline,
    'birthday': Icons.cake_outlined,
    'anniversary': Icons.favorite_outline,
    'reservation_checkin': Icons.event_seat_outlined,
    'manual': Icons.edit_outlined,
  };

  @override
  Widget build(BuildContext context) {
    final type = txn['type'] as String? ?? 'earn';
    final pts = txn['points'] as int? ?? 0;
    final isEarn = pts > 0;
    final icon = _typeIcons[type] ?? Icons.stars_outlined;
    final createdAt = DateTime.tryParse(txn['created_at'] ?? '');
    final dateStr = createdAt != null ? '${createdAt.day}/${createdAt.month}/${createdAt.year}' : '';

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(color: AppColors.green800, borderRadius: BorderRadius.circular(12)),
      child: Row(
        children: [
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(
              color: (isEarn ? Colors.green : Colors.red).withOpacity(0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: isEarn ? Colors.green : Colors.redAccent, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(txn['description'] ?? type, style: const TextStyle(color: AppColors.ivory50, fontSize: 13, fontWeight: FontWeight.w500), maxLines: 1, overflow: TextOverflow.ellipsis),
              Text(dateStr, style: const TextStyle(color: AppColors.gold500, fontSize: 11)),
            ]),
          ),
          Text('${isEarn ? '+' : ''}$pts pts',
            style: TextStyle(color: isEarn ? Colors.green : Colors.redAccent, fontWeight: FontWeight.w700, fontSize: 14)),
        ],
      ),
    );
  }
}

class _SkeletonCard extends StatelessWidget {
  const _SkeletonCard();
  @override
  Widget build(BuildContext context) => Container(
    height: 200,
    decoration: BoxDecoration(color: AppColors.green800, borderRadius: BorderRadius.circular(24)),
    child: const Center(child: CircularProgressIndicator(color: AppColors.gold300)),
  );
}
