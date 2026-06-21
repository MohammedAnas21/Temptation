import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:dio/dio.dart';
import '../../../core/network/dio_client.dart';

// Stream of Firebase auth state changes
final authStateProvider = StreamProvider<User?>((ref) {
  return FirebaseAuth.instance.authStateChanges();
});

// Current logged-in user (throws if null)
final currentUserProvider = Provider<User>((ref) {
  final user = FirebaseAuth.instance.currentUser;
  if (user == null) throw Exception('Not authenticated');
  return user;
});

// User profile from our backend
final userProfileProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final dio = ref.read(dioProvider);
  final res = await dio.get('/auth/me');
  return res.data as Map<String, dynamic>;
});
