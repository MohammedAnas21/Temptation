import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../shared/providers/auth_provider.dart';

class ProfilePage extends ConsumerStatefulWidget {
  const ProfilePage({super.key});
  @override
  ConsumerState<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends ConsumerState<ProfilePage> {
  bool _editing = false;
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  bool _saving = false;

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      final dio = ref.read(dioProvider);
      await dio.patch('/auth/me', data: {
        'name': _nameCtrl.text.trim(),
        'email': _emailCtrl.text.trim(),
      });
      ref.invalidate(userProfileProvider);
      setState(() => _editing = false);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Profile updated'), backgroundColor: Colors.green));
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e'), backgroundColor: Colors.red));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _logout() async {
    await FirebaseAuth.instance.signOut();
    if (mounted) context.go('/auth/phone');
  }

  @override
  Widget build(BuildContext context) {
    final profileAsync = ref.watch(userProfileProvider);

    return Scaffold(
      backgroundColor: AppColors.green900,
      appBar: AppBar(
        title: const Text('Profile'),
        backgroundColor: AppColors.green900,
        actions: [
          if (!_editing)
            IconButton(icon: const Icon(Icons.edit_outlined, color: AppColors.gold400), onPressed: () {
              profileAsync.whenData((p) {
                _nameCtrl.text = p['name'] ?? '';
                _emailCtrl.text = p['email'] ?? '';
              });
              setState(() => _editing = true);
            }),
        ],
      ),
      body: profileAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.gold300)),
        error: (e, _) => Center(child: Text('Error: $e', style: const TextStyle(color: Colors.redAccent))),
        data: (profile) => SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              // Avatar
              Stack(
                alignment: Alignment.bottomRight,
                children: [
                  CircleAvatar(
                    radius: 50,
                    backgroundColor: AppColors.green800,
                    backgroundImage: profile['avatar_url'] != null ? NetworkImage(profile['avatar_url']) : null,
                    child: profile['avatar_url'] == null
                        ? Text((profile['name'] ?? 'U')[0].toUpperCase(), style: const TextStyle(color: AppColors.gold300, fontFamily: 'Fraunces', fontWeight: FontWeight.w900, fontSize: 36))
                        : null,
                  ),
                  Container(
                    width: 32, height: 32,
                    decoration: const BoxDecoration(color: AppColors.gold500, shape: BoxShape.circle),
                    child: const Icon(Icons.camera_alt, size: 16, color: AppColors.green900),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              if (!_editing) ...[
                Text(profile['name'] ?? 'Guest', style: const TextStyle(color: AppColors.ivory50, fontFamily: 'Fraunces', fontWeight: FontWeight.w900, fontSize: 24)),
                const SizedBox(height: 4),
                Text(profile['phone'] ?? '', style: const TextStyle(color: AppColors.gold500, fontSize: 14)),
                const SizedBox(height: 4),
                if (profile['email'] != null)
                  Text(profile['email'], style: const TextStyle(color: AppColors.ivory100, fontSize: 13)),
                const SizedBox(height: 24),
                _InfoCard(profile: profile),
              ] else ...[
                const SizedBox(height: 16),
                TextField(controller: _nameCtrl, style: const TextStyle(color: AppColors.ivory50), decoration: const InputDecoration(hintText: 'Full Name', labelText: 'Name', labelStyle: TextStyle(color: AppColors.gold500))),
                const SizedBox(height: 12),
                TextField(controller: _emailCtrl, style: const TextStyle(color: AppColors.ivory50), decoration: const InputDecoration(hintText: 'Email Address', labelText: 'Email', labelStyle: TextStyle(color: AppColors.gold500))),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _saving ? null : _save,
                  style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 50)),
                  child: _saving ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.green900)) : const Text('Save Changes'),
                ),
                const SizedBox(height: 10),
                TextButton(onPressed: () => setState(() => _editing = false), child: const Text('Cancel', style: TextStyle(color: AppColors.gold500))),
              ],

              const SizedBox(height: 32),
              // Menu items
              _MenuItem(icon: Icons.receipt_long_outlined, label: 'Order History', onTap: () => context.go('/orders')),
              _MenuItem(icon: Icons.event_seat_outlined, label: 'My Reservations', onTap: () => context.go('/reservations')),
              _MenuItem(icon: Icons.stars_outlined, label: 'Loyalty & Rewards', onTap: () => context.go('/loyalty')),
              _MenuItem(icon: Icons.notifications_outlined, label: 'Notifications', onTap: () => context.push('/notifications')),
              const SizedBox(height: 16),
              _MenuItem(icon: Icons.logout, label: 'Sign Out', onTap: _logout, danger: true),
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final Map profile;
  const _InfoCard({required this.profile});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(color: AppColors.green800, borderRadius: BorderRadius.circular(18), border: Border.all(color: AppColors.green700)),
      child: Column(
        children: [
          if (profile['birthday'] != null) _Row('🎂', 'Birthday', profile['birthday']),
          if (profile['anniversary'] != null) _Row('💍', 'Anniversary', profile['anniversary']),
          if (profile['referral_code'] != null) _Row('🎁', 'Referral Code', profile['referral_code']),
        ],
      ),
    );
  }
}

class _Row extends StatelessWidget {
  final String emoji, label, value;
  const _Row(this.emoji, this.label, this.value);
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 6),
    child: Row(children: [
      Text(emoji, style: const TextStyle(fontSize: 16)),
      const SizedBox(width: 10),
      Text(label, style: const TextStyle(color: AppColors.gold500, fontSize: 13)),
      const Spacer(),
      Text(value, style: const TextStyle(color: AppColors.ivory50, fontWeight: FontWeight.w600, fontSize: 13)),
    ]),
  );
}

class _MenuItem extends StatelessWidget {
  final IconData icon; final String label; final VoidCallback onTap; final bool danger;
  const _MenuItem({required this.icon, required this.label, required this.onTap, this.danger = false});

  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
      decoration: BoxDecoration(color: AppColors.green800, borderRadius: BorderRadius.circular(14)),
      child: Row(children: [
        Icon(icon, color: danger ? Colors.redAccent : AppColors.gold400, size: 20),
        const SizedBox(width: 14),
        Text(label, style: TextStyle(color: danger ? Colors.redAccent : AppColors.ivory50, fontSize: 14, fontWeight: FontWeight.w500)),
        const Spacer(),
        Icon(Icons.chevron_right, color: danger ? Colors.redAccent : AppColors.gold500, size: 18),
      ]),
    ),
  );
}
