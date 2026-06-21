import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../features/splash/presentation/pages/splash_page.dart';
import '../../features/onboarding/presentation/pages/onboarding_page.dart';
import '../../features/auth/presentation/pages/auth_landing_page.dart';
import '../../features/auth/presentation/pages/profile_setup_page.dart';
import '../../features/auth/presentation/pages/phone_auth_page.dart';
import '../../features/auth/presentation/pages/otp_page.dart';
import '../../features/home/presentation/pages/home_page.dart';
import '../../features/menu/presentation/pages/menu_page.dart';
import '../../features/menu/presentation/pages/item_detail_page.dart';
import '../../features/cart/presentation/pages/cart_page.dart';
import '../../features/reservations/presentation/pages/reservation_flow_page.dart';
import '../../features/orders/presentation/pages/orders_page.dart';
import '../../features/loyalty/presentation/pages/loyalty_page.dart';
import '../../features/profile/presentation/pages/profile_page.dart';
import '../../features/profile/presentation/pages/favorites_page.dart';
import '../../features/settings/presentation/pages/settings_page.dart';
import '../../features/notifications/presentation/pages/notifications_page.dart';
import '../../features/payments/payment_page.dart';
import '../../features/payments/payment_callback_page.dart';

/// True once the splash screen's minimum dwell time + bootstrap checks have run.
final splashDoneProvider = StateProvider<bool>((ref) => false);

/// Cached "has the user completed onboarding" flag, loaded once at startup.
final hasSeenOnboardingProvider = FutureProvider<bool>((ref) async {
  final prefs = await SharedPreferences.getInstance();
  return prefs.getBool('has_seen_onboarding') ?? false;
});

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/splash',
    refreshListenable: GoRouterRefreshStream(FirebaseAuth.instance.authStateChanges()),
    redirect: (context, state) {
      final loc = state.matchedLocation;
      final splashDone = ref.read(splashDoneProvider);
      final onboardingAsync = ref.read(hasSeenOnboardingProvider);

      // Always allow the splash screen itself and its "done" marker route.
      if (loc == '/splash') return null;
      if (loc == '/splash/done') {
        ref.read(splashDoneProvider.notifier).state = true;
        final seenOnboarding = onboardingAsync.value ?? false;
        if (!seenOnboarding) return '/onboarding';
        final user = FirebaseAuth.instance.currentUser;
        return user != null ? '/home' : '/auth/landing';
      }

      // Before splash has finished, hold everything at splash.
      if (!splashDone) return '/splash';

      final seenOnboarding = onboardingAsync.value ?? true; // assume seen while loading to avoid flicker
      if (!seenOnboarding && loc != '/onboarding') return '/onboarding';

      final user = FirebaseAuth.instance.currentUser;
      final isAuth = user != null;
      final onAuthFlow = loc.startsWith('/auth') || loc == '/onboarding';
      if (!isAuth && !onAuthFlow) return '/auth/landing';
      if (isAuth && (loc.startsWith('/auth') || loc == '/onboarding')) return '/home';
      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (_, __) => const SplashPage()),
      GoRoute(path: '/splash/done', builder: (_, __) => const SplashPage()),
      GoRoute(path: '/onboarding', builder: (_, __) => const OnboardingPage()),

      // Auth
      GoRoute(path: '/auth/landing', builder: (_, __) => const AuthLandingPage()),
      GoRoute(path: '/auth/profile-setup', builder: (_, __) => const ProfileSetupPage()),
      GoRoute(path: '/auth/phone', builder: (_, __) => const PhoneAuthPage()),
      GoRoute(path: '/auth/otp',   builder: (_, s) => OtpPage(verificationId: s.uri.queryParameters['vid'] ?? '')),

      // Main shell with bottom nav
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(path: '/home',         builder: (_, __) => const HomePage()),
          GoRoute(path: '/menu',         builder: (_, __) => const MenuPage()),
          GoRoute(path: '/reservations', builder: (_, __) => const ReservationFlowPage()),
          GoRoute(path: '/orders',       builder: (_, __) => const OrdersPage()),
          GoRoute(path: '/loyalty',      builder: (_, __) => const LoyaltyPage()),
          GoRoute(path: '/profile',      builder: (_, __) => const ProfilePage()),
        ],
      ),

      // Modal / detail routes
      GoRoute(path: '/menu/:id',  builder: (_, s) => ItemDetailPage(itemId: s.pathParameters['id']!)),
      GoRoute(path: '/cart',      builder: (_, __) => const CartPage()),
      GoRoute(path: '/settings',  builder: (_, __) => const SettingsPage()),
      GoRoute(path: '/favorites', builder: (_, __) => const FavoritesPage()),

      // Notifications
      GoRoute(path: '/notifications', builder: (_, __) => const NotificationsPage()),

      // Payments
      GoRoute(
        path: '/payment',
        builder: (_, s) => PaymentPage(
          orderId: s.uri.queryParameters['orderId'] ?? '',
          amount: double.tryParse(s.uri.queryParameters['amount'] ?? '0') ?? 0,
        ),
      ),
      GoRoute(
        path: '/payment/callback',
        builder: (_, s) => PaymentCallbackPage(
          paymentId: s.uri.queryParameters['paymentId'] ?? '',
          transactionId: s.uri.queryParameters['transactionId'] ?? '',
          checksum: s.uri.queryParameters['checksum'] ?? '',
        ),
      ),
    ],
  );
});

/// Bridges a Stream (Firebase auth state) into a Listenable so GoRouter
/// re-evaluates its redirect whenever auth state changes.
class GoRouterRefreshStream extends ChangeNotifier {
  late final Stream<User?> _stream;
  GoRouterRefreshStream(Stream<User?> stream) {
    _stream = stream;
    _stream.listen((_) => notifyListeners());
  }
}

class MainShell extends StatelessWidget {
  final Widget child;
  const MainShell({super.key, required this.child});

  static const _tabs = ['/home', '/menu', '/reservations', '/orders', '/loyalty'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: _BottomNav(),
    );
  }
}

class _BottomNav extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    final idx = ['/home','/menu','/reservations','/orders','/loyalty'].indexOf(location).clamp(0, 4);
    return NavigationBar(
      selectedIndex: idx,
      onDestinationSelected: (i) {
        const routes = ['/home','/menu','/reservations','/orders','/loyalty'];
        context.go(routes[i]);
      },
      destinations: const [
        NavigationDestination(icon: Icon(Icons.home_outlined),     selectedIcon: Icon(Icons.home),            label: 'Home'),
        NavigationDestination(icon: Icon(Icons.restaurant_menu_outlined), selectedIcon: Icon(Icons.restaurant_menu), label: 'Menu'),
        NavigationDestination(icon: Icon(Icons.event_seat_outlined), selectedIcon: Icon(Icons.event_seat),    label: 'Reserve'),
        NavigationDestination(icon: Icon(Icons.receipt_outlined),   selectedIcon: Icon(Icons.receipt),        label: 'Orders'),
        NavigationDestination(icon: Icon(Icons.stars_outlined),     selectedIcon: Icon(Icons.stars),          label: 'Loyalty'),
      ],
    );
  }
}
