import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/network/dio_client.dart';

class ProfileSetupPage extends ConsumerStatefulWidget {
  const ProfileSetupPage({super.key});

  @override
  ConsumerState<ProfileSetupPage> createState() => _ProfileSetupPageState();
}

class _ProfileSetupPageState extends ConsumerState<ProfileSetupPage> {
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  DateTime? _birthday;
  DateTime? _anniversary;
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickDate(bool isBirthday) async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime(now.year - 20),
      firstDate: DateTime(now.year - 100),
      lastDate: now,
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          colorScheme: const ColorScheme.dark(
            primary: AppColors.gold400,
            surface: AppColors.green800,
          ),
        ),
        child: child!,
      ),
    );
    if (picked != null) {
      setState(() => isBirthday ? _birthday = picked : _anniversary = picked);
    }
  }

  String _fmt(DateTime? d) => d == null ? 'Select date' : '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

  Future<void> _save() async {
    if (_nameCtrl.text.trim().isEmpty) {
      setState(() => _error = 'Please enter your name');
      return;
    }
    setState(() { _loading = true; _error = null; });
    try {
      final dio = ref.read(dioProvider);
      await dio.patch('/auth/me', data: {
        'name': _nameCtrl.text.trim(),
        if (_emailCtrl.text.trim().isNotEmpty) 'email': _emailCtrl.text.trim(),
        if (_birthday != null) 'birthday': _fmt(_birthday),
        if (_anniversary != null) 'anniversary': _fmt(_anniversary),
      });
      if (mounted) context.go('/home');
    } catch (e) {
      setState(() => _error = 'Could not save profile. Please try again.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.green900,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 12),
                const Text('Tell us about you', style: TextStyle(fontFamily: 'Fraunces', fontWeight: FontWeight.w900, fontSize: 28, color: AppColors.ivory50)),
                const SizedBox(height: 8),
                const Text("A few details to personalise your experience.", style: TextStyle(color: AppColors.gold500, fontSize: 14)),
                const SizedBox(height: 28),
                TextField(
                  controller: _nameCtrl,
                  style: const TextStyle(color: AppColors.ivory50),
                  decoration: const InputDecoration(labelText: 'Full name', hintText: 'Your name'),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _emailCtrl,
                  keyboardType: TextInputType.emailAddress,
                  style: const TextStyle(color: AppColors.ivory50),
                  decoration: const InputDecoration(labelText: 'Email (optional)', hintText: 'you@example.com'),
                ),
                const SizedBox(height: 16),
                _DateField(label: 'Birthday (optional)', value: _fmt(_birthday), onTap: () => _pickDate(true)),
                const SizedBox(height: 16),
                _DateField(label: 'Anniversary (optional)', value: _fmt(_anniversary), onTap: () => _pickDate(false)),
                if (_error != null) ...[
                  const SizedBox(height: 16),
                  Text(_error!, style: const TextStyle(color: Colors.redAccent, fontSize: 13)),
                ],
                const SizedBox(height: 28),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _loading ? null : _save,
                    child: _loading
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.green900))
                        : const Text('Continue'),
                  ),
                ),
                const SizedBox(height: 12),
                Center(
                  child: TextButton(
                    onPressed: _loading ? null : () => context.go('/home'),
                    child: const Text('Skip for now', style: TextStyle(color: AppColors.gold500)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _DateField extends StatelessWidget {
  final String label;
  final String value;
  final VoidCallback onTap;
  const _DateField({required this.label, required this.value, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: InputDecorator(
        decoration: InputDecoration(labelText: label),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(value, style: const TextStyle(color: AppColors.ivory50)),
            const Icon(Icons.calendar_today_outlined, color: AppColors.gold500, size: 18),
          ],
        ),
      ),
    );
  }
}
