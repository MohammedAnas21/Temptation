import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

/// Reusable empty state widget for lists / grids with no data.
///
/// Usage:
///   EmptyState(
///     icon: Icons.shopping_bag_outlined,
///     title: 'Your cart is empty',
///     subtitle: 'Add items from the menu to get started',
///     action: TextButton(onPressed: () => context.go('/menu'), child: Text('Browse Menu')),
///   )
class EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final Widget? action;

  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
    this.action,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 48),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: AppColors.gold500.withOpacity(0.5), size: 64),
            const SizedBox(height: 16),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: AppColors.gold400,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            if (subtitle != null) ...[
              const SizedBox(height: 8),
              Text(
                subtitle!,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: AppColors.gold500,
                  fontSize: 13,
                ),
              ),
            ],
            if (action != null) ...[
              const SizedBox(height: 20),
              action!,
            ],
          ],
        ),
      ),
    );
  }
}
