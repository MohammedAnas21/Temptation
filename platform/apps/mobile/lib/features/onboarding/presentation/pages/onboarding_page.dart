import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../core/theme/app_theme.dart';

class _OnboardSlide {
  final IconData icon;
  final String title;
  final String description;
  const _OnboardSlide({required this.icon, required this.title, required this.description});
}

const _slides = [
  _OnboardSlide(
    icon: Icons.celebration_rounded,
    title: 'Welcome to Temptations',
    description: 'Your favourite cafe, now in your pocket. Taste Of Happiness, anywhere you go.',
  ),
  _OnboardSlide(
    icon: Icons.event_seat_rounded,
    title: 'Reserve Your Table',
    description: 'Pick your favourite seat — cosy sofas, private corners, or by the window — in seconds.',
  ),
  _OnboardSlide(
    icon: Icons.restaurant_menu_rounded,
    title: 'Order Food, Your Way',
    description: 'Browse our full menu, customise your order, and choose dine-in or takeaway.',
  ),
  _OnboardSlide(
    icon: Icons.stars_rounded,
    title: 'Earn Rewards',
    description: 'Every order earns you points. Climb from Bronze to Gold and unlock exclusive rewards.',
  ),
];

class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key});

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  final _controller = PageController();
  int _index = 0;

  Future<void> _finish() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('has_seen_onboarding', true);
    if (mounted) context.go('/auth/landing');
  }

  void _next() {
    if (_index == _slides.length - 1) {
      _finish();
    } else {
      _controller.nextPage(duration: const Duration(milliseconds: 350), curve: Curves.easeOut);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isLast = _index == _slides.length - 1;
    return Scaffold(
      backgroundColor: AppColors.green900,
      body: SafeArea(
        child: Column(
          children: [
            Align(
              alignment: Alignment.topRight,
              child: Padding(
                padding: const EdgeInsets.only(right: 20, top: 8),
                child: TextButton(
                  onPressed: _finish,
                  child: const Text('Skip', style: TextStyle(color: AppColors.gold500)),
                ),
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _controller,
                itemCount: _slides.length,
                onPageChanged: (i) => setState(() => _index = i),
                itemBuilder: (context, i) {
                  final slide = _slides[i];
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 36),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 140,
                          height: 140,
                          decoration: BoxDecoration(
                            color: AppColors.green800,
                            shape: BoxShape.circle,
                            border: Border.all(color: AppColors.gold500.withOpacity(0.3), width: 1.5),
                          ),
                          child: Icon(slide.icon, color: AppColors.gold400, size: 64),
                        ),
                        const SizedBox(height: 40),
                        Text(
                          slide.title,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontFamily: 'Fraunces',
                            fontWeight: FontWeight.w900,
                            fontSize: 26,
                            color: AppColors.ivory50,
                          ),
                        ),
                        const SizedBox(height: 14),
                        Text(
                          slide.description,
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: AppColors.ivory100, fontSize: 15, height: 1.4),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(_slides.length, (i) {
                final active = i == _index;
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  width: active ? 22 : 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: active ? AppColors.gold300 : AppColors.green700,
                    borderRadius: BorderRadius.circular(4),
                  ),
                );
              }),
            ),
            const SizedBox(height: 28),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 28),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _next,
                  child: Text(isLast ? 'Get Started' : 'Next'),
                ),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}
