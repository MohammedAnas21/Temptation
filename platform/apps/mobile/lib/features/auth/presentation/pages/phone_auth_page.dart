import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';

class PhoneAuthPage extends ConsumerStatefulWidget {
  const PhoneAuthPage({super.key});

  @override
  ConsumerState<PhoneAuthPage> createState() => _PhoneAuthPageState();
}

class _PhoneAuthPageState extends ConsumerState<PhoneAuthPage> {
  final _phoneCtrl = TextEditingController();
  bool _loading = false;
  String? _error;

  @override
  void dispose() { _phoneCtrl.dispose(); super.dispose(); }

  Future<void> _sendOtp() async {
    final phone = '+91${_phoneCtrl.text.trim()}';
    if (_phoneCtrl.text.length < 10) {
      setState(() => _error = 'Enter a valid 10-digit mobile number');
      return;
    }
    setState(() { _loading = true; _error = null; });

    await FirebaseAuth.instance.verifyPhoneNumber(
      phoneNumber: phone,
      verificationCompleted: (PhoneAuthCredential cred) async {
        await FirebaseAuth.instance.signInWithCredential(cred);
        if (mounted) context.go('/home');
      },
      verificationFailed: (FirebaseAuthException e) {
        setState(() { _loading = false; _error = e.message; });
      },
      codeSent: (String vid, int? resendToken) {
        setState(() => _loading = false);
        context.go('/auth/otp?vid=$vid&phone=${Uri.encodeComponent(phone)}');
      },
      codeAutoRetrievalTimeout: (_) => setState(() => _loading = false),
      timeout: const Duration(seconds: 60),
    );
  }

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
              // Logo
              Row(children: [
                Container(
                  width: 48, height: 48,
                  decoration: BoxDecoration(color: AppColors.green800, borderRadius: BorderRadius.circular(12)),
                  child: const Icon(Icons.restaurant, color: AppColors.gold400, size: 26),
                ),
                const SizedBox(width: 12),
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [
                  Text('TEMPTATIONS', style: TextStyle(color: AppColors.gold300, fontFamily: 'Fraunces', fontWeight: FontWeight.w900, fontSize: 16, letterSpacing: 3)),
                  Text('Taste Of Happiness', style: TextStyle(color: AppColors.gold500, fontSize: 11, letterSpacing: 1)),
                ]),
              ]),
              const SizedBox(height: 40),
              const Text('Welcome Back', style: TextStyle(fontFamily: 'Fraunces', fontWeight: FontWeight.w900, fontSize: 34, color: AppColors.ivory50)),
              const SizedBox(height: 8),
              const Text('Enter your mobile number to get started.', style: TextStyle(color: AppColors.gold500, fontSize: 15)),
              const SizedBox(height: 32),

              // Phone input
              TextField(
                controller: _phoneCtrl,
                keyboardType: TextInputType.phone,
                style: const TextStyle(color: AppColors.ivory50, fontSize: 18, letterSpacing: 1),
                decoration: InputDecoration(
                  prefixText: '+91 ',
                  prefixStyle: const TextStyle(color: AppColors.gold400, fontWeight: FontWeight.w600),
                  hintText: '98765 43210',
                  errorText: _error,
                  errorStyle: const TextStyle(color: Colors.redAccent),
                ),
                maxLength: 10,
              ),
              const SizedBox(height: 24),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _loading ? null : _sendOtp,
                  child: _loading
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.green900))
                      : const Text('Send OTP'),
                ),
              ),
              const Spacer(flex: 2),
            ],
          ),
        ),
      ),
    );
  }
}
