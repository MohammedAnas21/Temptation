import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../../core/network/dio_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Payment service for PhonePe integration
class PaymentService {
  final Dio _dio;
  PaymentService(this._dio);

  /// Initiate a payment for an order
  Future<PaymentResult> initiateOrderPayment({
    required String orderId,
    required double amount,
    required String paymentMethod,
  }) async {
    try {
      final response = await _dio.post('/payments/initiate', data: {
        'reference_type': 'order',
        'reference_id': orderId,
        'amount': amount,
        'payment_method': paymentMethod,
      });

      final data = response.data;
      return PaymentResult(
        success: true,
        paymentId: data['payment_id'],
        redirectUrl: data['redirect_url'],
        gatewayPayload: data['gateway_payload'],
      );
    } on DioException catch (e) {
      return PaymentResult(
        success: false,
        error: e.response?.data?['detail'] ?? 'Payment initiation failed',
      );
    }
  }

  /// Poll payment status
  Future<PaymentStatus> checkPaymentStatus(String paymentId) async {
    try {
      final response = await _dio.get('/payments/$paymentId/status');
      final status = response.data['status'];
      return PaymentStatus.fromString(status);
    } catch (e) {
      return PaymentStatus.unknown;
    }
  }

  /// Verify payment callback (from PhonePe redirect)
  Future<bool> verifyPaymentCallback({
    required String paymentId,
    required String transactionId,
    required String checksum,
  }) async {
    try {
      final response = await _dio.post('/payments/$paymentId/verify', data: {
        'transaction_id': transactionId,
        'checksum': checksum,
      });
      return response.data['verified'] == true;
    } catch (e) {
      return false;
    }
  }
}

class PaymentResult {
  final bool success;
  final String? paymentId;
  final String? redirectUrl;
  final Map<String, dynamic>? gatewayPayload;
  final String? error;

  PaymentResult({
    required this.success,
    this.paymentId,
    this.redirectUrl,
    this.gatewayPayload,
    this.error,
  });
}

enum PaymentStatus { pending, processing, success, failed, refunded, unknown;

  static PaymentStatus fromString(String s) {
    return PaymentStatus.values.firstWhere(
      (e) => e.name == s,
      orElse: () => PaymentStatus.unknown,
    );
  }
}

final paymentServiceProvider = Provider<PaymentService>((ref) {
  return PaymentService(ref.read(dioProvider));
});
