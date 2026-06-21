import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import 'package:go_router/go_router.dart';
import 'dart:io' show Platform;
import '../../../../core/theme/app_theme.dart';

class AuthLandingPage extends StatefulWidget {
  const AuthLandingPage({super.key});

  @override
  State<AuthLandingPage> createState() => _AuthLandingPageState();
}

class _AuthLandingPageState extends State<AuthLandingPage> {
  bool _loading = false;
  String? _error;

  void _afterSignIn(UserCredential cred) {
    if (!mounted) return;
    final isNewUser = cred.additionalUserInfo?.isNewUser ?? false;
    context.go(isNewUser ? '/auth/profile-setup' : '/home');
  }

  Future<void> _withLoading(Future<void> Function() action) async {
    setState(() { _loading = true; _error = null; });
    try {
      await action();
    } on FirebaseAuthException catch (e) {
      setState(() => _error = e.message ?? 'Sign-in failed. Please try again.');
    } catch (e) {
      setState(() => _error = 'Sign-in failed. Please try again.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _signInWithGoogle() => _withLoading(() async {
    final googleUser = await GoogleSignIn().signIn();
    if (googleUser == null) return; // user cancelled
    final googleAuth = await googleUser.authentication;
    final credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );
    final cred = await FirebaseAuth.instance.signInWithCredential(credential);
    _afterSignIn(cred);
  });

  Future<void> _signInWithApple() => _withLoading(() async {
    final appleCredential = await SignInWithApple.getAppleIDCredential(
      scopes: [AppleIDAuthorizationScopes.email, AppleIDAuthorizationScopes.fullName],
    );
    final oauthCredential = OAuthProvider('apple.com').credential(
      idToken: appleCredential.identityToken,
      accessToken: appleCredential.authorizationCode,
    );
    final cred = await FirebaseAuth.instance.signInWithCredential(oauthCredential);
    _afterSignIn(cred);
  });

  Future<void> _continueAsGuest() => _withLoading(() async {
    final cred = await FirebaseAuth.instance.signInAnonymously();
    _afterSignIn(cred);
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.green900,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Spacer(),
              Center(
                child: Column(
                  children: [
                    Container(
                      width: 72, height: 72,
                      decoration: BoxDecoration(color: AppColors.green800, borderRadius: BorderRadius.circular(18)),
                      child: const Icon(Icons.restaurant, color: AppColors.gold400, size: 36),
                    ),
                    const SizedBox(height: 16),
                    const Text('TEMPTATIONS', style: TextStyle(color: AppColors.gold300, fontFamily: 'Fraunces', fontWeight: FontWeight.w900, fontSize: 20, letterSpacing: 3)),
                    const SizedBox(height: 4),
                    const Text('Taste Of Happiness', style: TextStyle(color: AppColors.gold500, fontSize: 12, letterSpacing: 1)),
                  ],
                ),
              ),
              const SizedBox(height: 48),
              if (_error != null) ...[
                Text(_error!, style: const TextStyle(color: Colors.redAccent, fontSize: 13)),
                const SizedBox(height: 12),
              ],
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _loading ? null : () => context.go('/auth/phone'),
                  icon: const Icon(Icons.phone_android_rounded, size: 20),
                  label: const Text('Continue with Phone'),
                ),
              ),
              const SizedBox(height: 14),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: _loading ? null : _signInWithGoogle,
                  icon: const Icon(Icons.g_mobiledata_rounded, color: AppColors.ivory50, size: 24),
                  label: const Text('Continue with Google', style: TextStyle(color: AppColors.ivory50)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.green700),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
              if (Platform.isIOS) ...[
                const SizedBox(height: 14),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: _loading ? null : _signInWithApple,
                    icon: const Icon(Icons.apple_rounded, color: AppColors.ivory50, size: 22),
                    label: const Text('Continue with Apple', style: TextStyle(color: AppColors.ivory50)),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppColors.green700),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 20),
              Center(
                child: TextButton(
                  onPressed: _loading ? null : _continueAsGuest,
                  child: const Text('Continue as Guest', style: TextStyle(color: AppColors.gold500)),
                ),
              ),
              if (_loading) ...[
                const SizedBox(height: 16),
                const Center(child: CircularProgressIndicator(color: AppColors.gold400, strokeWidth: 2)),
              ],
              const Spacer(flex: 2),
            ],
          ),
        ),
      ),
    );
  }
}
