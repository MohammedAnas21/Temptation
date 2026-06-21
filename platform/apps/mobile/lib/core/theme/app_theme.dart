import 'package:flutter/material.dart';

class AppColors {
  static const green950 = Color(0xFF021A0D);
  static const green900 = Color(0xFF052A16);
  static const green800 = Color(0xFF0A4424);
  static const green700 = Color(0xFF135A30);
  static const green600 = Color(0xFF1B6B3A);
  static const gold300  = Color(0xFFF0CC8D);
  static const gold400  = Color(0xFFDDB56C);
  static const gold500  = Color(0xFFC79A4E);
  static const gold600  = Color(0xFFA87B38);
  static const ivory50  = Color(0xFFFAF6EC);
  static const ivory100 = Color(0xFFF4F1E5);
  static const ivory200 = Color(0xFFF3E8D2);
  static const ink900   = Color(0xFF1C1610);
}

class AppTheme {
  static ThemeData get dark => ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: AppColors.green900,
    colorScheme: const ColorScheme.dark(
      primary:   AppColors.gold300,
      secondary: AppColors.gold500,
      surface:   AppColors.green800,
      background: AppColors.green900,
      onPrimary: AppColors.green900,
      onSurface: AppColors.ivory50,
    ),
    fontFamily: 'WorkSans',
    textTheme: const TextTheme(
      displayLarge:  TextStyle(fontFamily: 'Fraunces', fontWeight: FontWeight.w900, color: AppColors.ivory50),
      displayMedium: TextStyle(fontFamily: 'Fraunces', fontWeight: FontWeight.w900, color: AppColors.ivory50),
      headlineLarge: TextStyle(fontFamily: 'Fraunces', fontWeight: FontWeight.w700, color: AppColors.ivory50),
      headlineMedium:TextStyle(fontFamily: 'Fraunces', fontWeight: FontWeight.w700, color: AppColors.ivory50),
      titleLarge:    TextStyle(color: AppColors.ivory50, fontWeight: FontWeight.w600),
      bodyLarge:     TextStyle(color: AppColors.ivory100),
      bodyMedium:    TextStyle(color: AppColors.ivory100),
      labelLarge:    TextStyle(color: AppColors.green900, fontWeight: FontWeight.w700),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.gold300,
        foregroundColor: AppColors.green900,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.green800,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppColors.green700)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.green700)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.gold400)),
      hintStyle: const TextStyle(color: AppColors.gold500, fontSize: 14),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.green900,
      foregroundColor: AppColors.ivory50,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(fontFamily: 'Fraunces', fontWeight: FontWeight.w900, fontSize: 20, color: AppColors.ivory50),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: AppColors.green950,
      selectedItemColor: AppColors.gold300,
      unselectedItemColor: AppColors.gold500,
      showUnselectedLabels: true,
      type: BottomNavigationBarType.fixed,
    ),
    cardTheme: CardTheme(
      color: AppColors.green800,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 0,
    ),
  );

  static ThemeData get light => ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    scaffoldBackgroundColor: AppColors.ivory50,
    colorScheme: const ColorScheme.light(
      primary:   AppColors.green800,
      secondary: AppColors.gold600,
      surface:   Colors.white,
      background: AppColors.ivory50,
      onPrimary: AppColors.ivory50,
      onSurface: AppColors.ink900,
    ),
    fontFamily: 'WorkSans',
    textTheme: const TextTheme(
      displayLarge:  TextStyle(fontFamily: 'Fraunces', fontWeight: FontWeight.w900, color: AppColors.ink900),
      displayMedium: TextStyle(fontFamily: 'Fraunces', fontWeight: FontWeight.w900, color: AppColors.ink900),
      headlineLarge: TextStyle(fontFamily: 'Fraunces', fontWeight: FontWeight.w700, color: AppColors.ink900),
      headlineMedium:TextStyle(fontFamily: 'Fraunces', fontWeight: FontWeight.w700, color: AppColors.ink900),
      titleLarge:    TextStyle(color: AppColors.ink900, fontWeight: FontWeight.w600),
      bodyLarge:     TextStyle(color: AppColors.ink900),
      bodyMedium:    TextStyle(color: AppColors.ink900),
      labelLarge:    TextStyle(color: AppColors.ivory50, fontWeight: FontWeight.w700),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.green800,
        foregroundColor: AppColors.ivory50,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppColors.gold500.withOpacity(0.3))),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppColors.gold500.withOpacity(0.3))),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.green800)),
      hintStyle: TextStyle(color: AppColors.ink900.withOpacity(0.4), fontSize: 14),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.ivory50,
      foregroundColor: AppColors.ink900,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(fontFamily: 'Fraunces', fontWeight: FontWeight.w900, fontSize: 20, color: AppColors.ink900),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: Colors.white,
      selectedItemColor: AppColors.green800,
      unselectedItemColor: AppColors.gold600,
      showUnselectedLabels: true,
      type: BottomNavigationBarType.fixed,
    ),
    cardTheme: CardTheme(
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 0,
    ),
  );
}
