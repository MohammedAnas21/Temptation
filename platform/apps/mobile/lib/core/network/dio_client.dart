import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../constants/api_constants.dart';

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(
    BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 30),
      sendTimeout: const Duration(seconds: 15),
      headers: {'Content-Type': 'application/json'},
    ),
  );

  // ── 1. Auth interceptor — attaches Firebase ID token ─────────────
  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      final user = FirebaseAuth.instance.currentUser;
      if (user != null) {
        final token = await user.getIdToken();
        options.headers['Authorization'] = 'Bearer $token';
      }
      return handler.next(options);
    },
    onError: (DioException e, handler) async {
      if (e.response?.statusCode == 401) {
        // Force-refresh the token, then retry once
        final user = FirebaseAuth.instance.currentUser;
        if (user != null) {
          final freshToken = await user.getIdToken(true);
          e.requestOptions.headers['Authorization'] = 'Bearer $freshToken';
          try {
            final retryResponse = await dio.fetch(e.requestOptions);
            return handler.resolve(retryResponse);
          } catch (_) {
            // Fall through to original error
          }
        }
      }
      return handler.next(e);
    },
  ));

  // ── 2. Retry interceptor — retries on transient failures ─────────
  dio.interceptors.add(_RetryInterceptor(dio: dio));

  // ── 3. Logging in debug mode ─────────────────────────────────────
  assert(() {
    dio.interceptors.add(LogInterceptor(
      requestBody: true, responseBody: false,
      logPrint: (o) => debugPrint(o.toString()),
    ));
    return true;
  }());

  return dio;
});

/// Retries GET requests on connection errors / 5xx with exponential backoff.
class _RetryInterceptor extends Interceptor {
  final Dio dio;
  static const _maxRetries = 2;

  _RetryInterceptor({required this.dio});

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    final retries = (err.requestOptions.extra['_retries'] as int?) ?? 0;
    final method = err.requestOptions.method.toUpperCase();

    // Only retry safe idempotent requests
    if (retries >= _maxRetries || method != 'GET' || !_isRetryable(err)) {
      return handler.next(err);
    }

    final delay = Duration(milliseconds: 500 * (retries + 1)); // 500ms, 1s
    await Future.delayed(delay);

    err.requestOptions.extra['_retries'] = retries + 1;
    try {
      final response = await dio.fetch(err.requestOptions);
      return handler.resolve(response);
    } on DioException catch (e) {
      return handler.next(e);
    }
  }

  bool _isRetryable(DioException err) {
    if (err.type == DioExceptionType.connectionTimeout ||
        err.type == DioExceptionType.receiveTimeout ||
        err.type == DioExceptionType.connectionError) {
      return true;
    }
    final code = err.response?.statusCode;
    return code != null && code >= 500;
  }
}
