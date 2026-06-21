import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

/// Reusable shimmer / skeleton loading widget.
///
/// Usage:
///   LoadingSkeleton(lines: 3)                — text placeholder
///   LoadingSkeleton(height: 120, isCard: true) — card placeholder
///   LoadingSkeleton.circle(size: 60)          — avatar placeholder
class LoadingSkeleton extends StatefulWidget {
  final int lines;
  final double height;
  final bool isCard;
  final double borderRadius;

  const LoadingSkeleton({
    super.key,
    this.lines = 1,
    this.height = 16,
    this.isCard = false,
    this.borderRadius = 8,
  });

  /// Circular skeleton (for avatars / thumbnails).
  const LoadingSkeleton.circle({
    super.key,
    double size = 60,
  })  : lines = 1,
        height = size,
        isCard = false,
        borderRadius = 100;

  @override
  State<LoadingSkeleton> createState() => _LoadingSkeletonState();
}

class _LoadingSkeletonState extends State<LoadingSkeleton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _ctrl,
      builder: (_, __) {
        final opacity = 0.25 + (_ctrl.value * 0.35); // 0.25 ↔ 0.60
        if (widget.borderRadius >= 100) {
          // Circle
          return Container(
            width: widget.height,
            height: widget.height,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.green700.withOpacity(opacity),
            ),
          );
        }
        if (widget.isCard) {
          return Container(
            height: widget.height,
            decoration: BoxDecoration(
              color: AppColors.green700.withOpacity(opacity),
              borderRadius: BorderRadius.circular(widget.borderRadius),
            ),
          );
        }
        // Lines
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: List.generate(widget.lines, (i) {
            final width = i == widget.lines - 1
                ? 0.6 // last line shorter
                : 1.0;
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: FractionallySizedBox(
                widthFactor: width,
                child: Container(
                  height: widget.height,
                  decoration: BoxDecoration(
                    color: AppColors.green700.withOpacity(opacity),
                    borderRadius: BorderRadius.circular(widget.borderRadius),
                  ),
                ),
              ),
            );
          }),
        );
      },
    );
  }
}

/// Convenience: row of skeleton cards in a horizontal list.
class LoadingSkeletonRow extends StatelessWidget {
  final int count;
  final double cardHeight;
  final double cardWidth;

  const LoadingSkeletonRow({
    super.key,
    this.count = 3,
    this.cardHeight = 120,
    this.cardWidth = 140,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: cardHeight,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: count,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (_, __) => SizedBox(
          width: cardWidth,
          child: const LoadingSkeleton(isCard: true, height: double.infinity),
        ),
      ),
    );
  }
}
