import 'package:dio/dio.dart';

class AppException implements Exception {
  final String message;
  final int? statusCode;
  const AppException(this.message, {this.statusCode});

  factory AppException.fromDio(DioException e) {
    final data = e.response?.data;
    final detail = data is Map ? (data['detail'] ?? data['message'] ?? 'Unknown error') : e.message ?? 'Network error';
    return AppException(detail.toString(), statusCode: e.response?.statusCode);
  }

  @override
  String toString() => 'AppException($statusCode): $message';
}

class NetworkException extends AppException {
  const NetworkException() : super('No internet connection');
}

class UnauthorizedException extends AppException {
  const UnauthorizedException() : super('Please log in again', statusCode: 401);
}
