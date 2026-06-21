import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';

class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _fade;
  late final Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 900));
    _fade = CurvedAnimation(parent: _controller, curve: Curves.easeOut);
    _scale = Tween<double>(begin: 0.85, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutBack),
    );
    _controller.forward();

    // Minimum splash dwell time; router redirect handles where we go next
    // once Firebase/auth state and onboarding flag are resolved.
    Timer(const Duration(milliseconds: 1400), () {
      if (mounted) context.go('/splash/done');
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.green900,
      body: Center(
        child: FadeTransition(
          opacity: _fade,
          child: ScaleTransition(
            scale: _scale,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 96,
                  height: 96,
                  decoration: BoxDecoration(
                    color: AppColors.green800,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: AppColors.gold500.withOpacity(0.4), width: 1.5),
                  ),
                  child: const Icon(Icons.restaurant, color: AppColors.gold400, size: 48),
                ),
                const SizedBox(height: 24),
                const Text(
                  'TEMPTATIONS',
                  style: TextStyle(
                    fontFamily: 'Fraunces',
                    fontWeight: FontWeight.w900,
                    fontSize: 26,
                    letterSpacing: 4,
                    color: AppColors.gold300,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Taste Of Happiness',
                  style: TextStyle(
                    fontFamily: 'WorkSans',
                    fontSize: 13,
                    letterSpacing: 1.5,
                    color: AppColors.gold500,
                  ),
                ),
                const SizedBox(height: 36),
                const SizedBox(
                  width: 22,
                  height: 22,
                  child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.gold500),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
