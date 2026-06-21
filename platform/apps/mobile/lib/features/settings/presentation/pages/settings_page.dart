import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:package_info_plus/package_info_plus.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/theme/theme_provider.dart';

const _languages = {
  'en': 'English',
  'hi': 'हिन्दी',
};

class SettingsPage extends ConsumerWidget {
  const SettingsPage({super.key});

  Future<void> _openUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  Future<void> _openMail() async {
    final uri = Uri(scheme: 'mailto', path: 'support@temptationscafe.in', query: 'subject=App Support');
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);
    final isDark = themeMode == ThemeMode.dark;
    final language = ref.watch(localeProvider);

    return Scaffold(
      backgroundColor: AppColors.green900,
      appBar: AppBar(title: const Text('Settings'), backgroundColor: AppColors.green900),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          _SectionLabel('Appearance'),
          _SettingsCard(children: [
            SwitchListTile(
              value: isDark,
              onChanged: (v) => ref.read(themeModeProvider.notifier).toggle(v),
              activeColor: AppColors.gold400,
              title: const Text('Dark Mode', style: TextStyle(color: AppColors.ivory50, fontSize: 14)),
              subtitle: const Text('Switch between light and dark theme', style: TextStyle(color: AppColors.gold500, fontSize: 11)),
            ),
          ]),
          const SizedBox(height: 20),
          _SectionLabel('Language'),
          _SettingsCard(
            children: _languages.entries.map((e) => RadioListTile<String>(
              value: e.key,
              groupValue: language,
              onChanged: (v) {
                if (v != null) ref.read(localeProvider.notifier).setLanguage(v);
              },
              activeColor: AppColors.gold400,
              title: Text(e.value, style: const TextStyle(color: AppColors.ivory50, fontSize: 14)),
            )).toList(),
          ),
          const SizedBox(height: 20),
          _SectionLabel('Support & Legal'),
          _SettingsCard(children: [
            _Tile(icon: Icons.privacy_tip_outlined, label: 'Privacy Policy', onTap: () => _openUrl('https://temptationscafe.in/privacy')),
            _Tile(icon: Icons.description_outlined, label: 'Terms & Conditions', onTap: () => _openUrl('https://temptationscafe.in/terms')),
            _Tile(icon: Icons.support_agent_outlined, label: 'Contact Support', onTap: _openMail),
            _Tile(icon: Icons.info_outline, label: 'About App', onTap: () => _showAbout(context)),
          ]),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  void _showAbout(BuildContext context) async {
    final info = await PackageInfo.fromPlatform();
    if (!context.mounted) return;
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppColors.green800,
        title: const Text('Temptations Cafe', style: TextStyle(color: AppColors.ivory50, fontFamily: 'Fraunces', fontWeight: FontWeight.w900)),
        content: Text('Taste Of Happiness\nVersion ${info.version} (${info.buildNumber})', style: const TextStyle(color: AppColors.ivory100)),
        actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close', style: TextStyle(color: AppColors.gold400)))],
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String text;
  const _SectionLabel(this.text);
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(left: 4, bottom: 8),
    child: Text(text, style: const TextStyle(color: AppColors.gold500, fontSize: 12, fontWeight: FontWeight.w700, letterSpacing: 1)),
  );
}

class _SettingsCard extends StatelessWidget {
  final List<Widget> children;
  const _SettingsCard({required this.children});
  @override
  Widget build(BuildContext context) => Container(
    decoration: BoxDecoration(color: AppColors.green800, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.green700)),
    child: Column(children: children),
  );
}

class _Tile extends StatelessWidget {
  final IconData icon; final String label; final VoidCallback onTap;
  const _Tile({required this.icon, required this.label, required this.onTap});
  @override
  Widget build(BuildContext context) => ListTile(
    leading: Icon(icon, color: AppColors.gold400, size: 20),
    title: Text(label, style: const TextStyle(color: AppColors.ivory50, fontSize: 14)),
    trailing: const Icon(Icons.chevron_right, color: AppColors.gold500, size: 18),
    onTap: onTap,
  );
}
