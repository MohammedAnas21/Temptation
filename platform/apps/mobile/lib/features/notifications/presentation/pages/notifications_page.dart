import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/theme/app_theme.dart';

final notificationsProvider = FutureProvider<List>((ref) async {
  final dio = ref.read(dioProvider);
  final r = await dio.get('/notifications', queryParameters: {'limit': 50});
  return r.data as List;
});

class NotificationsPage extends ConsumerStatefulWidget {
  const NotificationsPage({super.key});
  @override
  ConsumerState<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends ConsumerState<NotificationsPage> {
  @override
  Widget build(BuildContext context) {
    final notifAsync = ref.watch(notificationsProvider);

    return Scaffold(
      backgroundColor: AppColors.green900,
      appBar: AppBar(
        title: const Text('Notifications'),
        backgroundColor: AppColors.green900,
        actions: [
          TextButton(
            onPressed: () async {
              try {
                final dio = ref.read(dioProvider);
                await dio.post('/notifications/read-all');
                ref.invalidate(notificationsProvider);
              } catch (_) {}
            },
            child: const Text('Mark all read',
                style: TextStyle(color: AppColors.gold400, fontSize: 13)),
          ),
        ],
      ),
      body: notifAsync.when(
        loading: () => const Center(
            child: CircularProgressIndicator(color: AppColors.gold300)),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, color: Colors.redAccent, size: 48),
              const SizedBox(height: 12),
              Text('Failed to load notifications',
                  style: const TextStyle(color: AppColors.ivory100)),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: () => ref.invalidate(notificationsProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (notifs) => notifs.isEmpty
            ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.notifications_none_rounded,
                        color: AppColors.gold500.withOpacity(0.5), size: 64),
                    const SizedBox(height: 16),
                    const Text('No notifications yet',
                        style: TextStyle(
                            color: AppColors.gold400,
                            fontSize: 16,
                            fontWeight: FontWeight.w600)),
                    const SizedBox(height: 8),
                    const Text('We\'ll notify you about orders, offers & more',
                        style:
                            TextStyle(color: AppColors.gold500, fontSize: 13)),
                  ],
                ),
              )
            : RefreshIndicator(
                color: AppColors.gold300,
                onRefresh: () async =>
                    ref.invalidate(notificationsProvider),
                child: ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: notifs.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (_, i) =>
                      _NotificationTile(notif: notifs[i]),
                ),
              ),
      ),
    );
  }
}

class _NotificationTile extends StatelessWidget {
  final Map notif;
  const _NotificationTile({required this.notif});

  IconData _iconForType(String type) {
    switch (type) {
      case 'order':
        return Icons.receipt_long;
      case 'reservation':
        return Icons.event_seat;
      case 'offer':
        return Icons.local_offer;
      case 'loyalty':
        return Icons.stars;
      case 'referral':
        return Icons.people;
      case 'payment':
        return Icons.payment;
      default:
        return Icons.notifications;
    }
  }

  @override
  Widget build(BuildContext context) {
    final type = notif['type'] as String? ?? 'general';
    final isRead = notif['is_read'] == true;
    final createdAt = DateTime.tryParse(notif['created_at'] ?? '');
    final timeAgo = createdAt != null ? _formatTimeAgo(createdAt) : '';

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isRead ? AppColors.green800 : AppColors.green800.withOpacity(0.8),
        borderRadius: BorderRadius.circular(14),
        border: isRead
            ? null
            : Border.all(color: AppColors.gold500.withOpacity(0.3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.green700,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(_iconForType(type),
                color: AppColors.gold400, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(notif['title'] ?? 'Notification',
                    style: TextStyle(
                      color: AppColors.ivory50,
                      fontWeight:
                          isRead ? FontWeight.w500 : FontWeight.w700,
                      fontSize: 14,
                    )),
                const SizedBox(height: 4),
                Text(notif['message'] ?? '',
                    style: const TextStyle(
                        color: AppColors.ivory100, fontSize: 13),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis),
                const SizedBox(height: 4),
                Text(timeAgo,
                    style: const TextStyle(
                        color: AppColors.gold500, fontSize: 11)),
              ],
            ),
          ),
          if (!isRead)
            Container(
              width: 8,
              height: 8,
              margin: const EdgeInsets.only(top: 4),
              decoration: const BoxDecoration(
                color: AppColors.gold300,
                shape: BoxShape.circle,
              ),
            ),
        ],
      ),
    );
  }

  String _formatTimeAgo(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${dt.day}/${dt.month}/${dt.year}';
  }
}
