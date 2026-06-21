import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/network/dio_client.dart';
import 'features/notifications/notification_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();

  // Initialize local notification service (registers FCM background handler)
  await NotificationService().initialize();

  runApp(const ProviderScope(child: TemptationsApp()));
}

class TemptationsApp extends ConsumerStatefulWidget {
  const TemptationsApp({super.key});

  @override
  ConsumerState<TemptationsApp> createState() => _TemptationsAppState();
}

class _TemptationsAppState extends ConsumerState<TemptationsApp> {
  @override
  void initState() {
    super.initState();
    _registerFCMToken();
  }

  /// Sends the FCM token to our backend for push targeting.
  Future<void> _registerFCMToken() async {
    try {
      final token = await NotificationService().getToken();
      if (token != null) {
        final dio = ref.read(dioProvider);
        await dio.post('/auth/fcm-token', data: {'token': token});
      }
    } catch (_) {
      // Non-fatal — push won't work until next successful registration
    }
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(routerProvider);
    return MaterialApp.router(
      title: 'Temptations Cafe',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.dark,
      routerConfig: router,
    );
  }
}
