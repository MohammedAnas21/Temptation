import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeModeNotifier extends StateNotifier<ThemeMode> {
  ThemeModeNotifier() : super(ThemeMode.dark) {
    _load();
  }

  static const _prefKey = 'theme_mode';

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(_prefKey);
    if (saved == 'light') state = ThemeMode.light;
    if (saved == 'dark') state = ThemeMode.dark;
  }

  Future<void> toggle(bool isDark) async {
    state = isDark ? ThemeMode.dark : ThemeMode.light;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_prefKey, isDark ? 'dark' : 'light');
  }
}

final themeModeProvider = StateNotifierProvider<ThemeModeNotifier, ThemeMode>((ref) => ThemeModeNotifier());

class LocaleNotifier extends StateNotifier<String> {
  LocaleNotifier() : super('en') {
    _load();
  }

  static const _prefKey = 'app_language';

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    state = prefs.getString(_prefKey) ?? 'en';
  }

  Future<void> setLanguage(String code) async {
    state = code;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_prefKey, code);
  }
}

final localeProvider = StateNotifierProvider<LocaleNotifier, String>((ref) => LocaleNotifier());
