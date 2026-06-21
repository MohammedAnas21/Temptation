import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';

class OtpPage extends StatefulWidget {
  final String verificationId;
  const OtpPage({super.key, required this.verificationId});

  @override
  State<OtpPage> createState() => _OtpPageState();
}

class _OtpPageState extends State<OtpPage> {
  final _otpCtrl = TextEditingController();
  bool _loading = false;
  String? _error;

  @override
  void dispose() { _otpCtrl.dispose(); super.dispose(); }

  Future<void> _verify() async {
    if (_otpCtrl.text.length != 6) {
      setState(() => _error = 'Enter the 6-digit OTP');
      return;
    }
    setState(() { _loading = true; _error = null; });
    try {
      final cred = PhoneAuthProvider.credential(
        verificationId: widget.verificationId,
        smsCode: _otpCtrl.text.trim(),
      );
      await FirebaseAuth.instance.signInWithCredential(cred);
      if (mounted) context.go('/home');
    } on FirebaseAuthException catch (e) {
      setState(() { _loading = false; _error = e.message; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.green900,
      appBar: AppBar(title: const Text('Verify OTP'), backgroundColor: AppColors.green900, elevation: 0),
      body: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Enter OTP', style: TextStyle(fontFamily: 'Fraunces', fontWeight: FontWeight.w900, fontSize: 30, color: AppColors.ivory50)),
            const SizedBox(height: 8),
            const Text('We sent a 6-digit code to your mobile number.', style: TextStyle(color: AppColors.gold500, fontSize: 14)),
            const SizedBox(height: 32),
            TextField(
              controller: _otpCtrl,
              keyboardType: TextInputType.number,
              maxLength: 6,
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppColors.ivory50, fontSize: 24, letterSpacing: 8, fontWeight: FontWeight.bold),
              decoration: InputDecoration(hintText: '• • • • • •', errorText: _error),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _loading ? null : _verify,
                child: _loading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.green900))
                    : const Text('Verify & Continue'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
