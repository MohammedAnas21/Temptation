import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
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
import '../../features/notifications/presentation/pages/notifications_page.dart';
import '../../features/payments/payment_page.dart';
import '../../features/payments/payment_callback_page.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/home',
    redirect: (context, state) {
      final user = FirebaseAuth.instance.currentUser;
      final isAuth = user != null;
      final onAuthPage = state.matchedLocation.startsWith('/auth');
      if (!isAuth && !onAuthPage) return '/auth/phone';
      if (isAuth && onAuthPage) return '/home';
      return null;
    },
    routes: [
      // Auth
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

      // Modal routes
      GoRoute(path: '/menu/:id',  builder: (_, s) => ItemDetailPage(itemId: s.pathParameters['id']!)),
      GoRoute(path: '/cart',      builder: (_, __) => const CartPage()),

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
