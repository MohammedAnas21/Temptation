import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

/// Simple two-layer cache: in-memory (fast) + SharedPreferences (persistent).
/// Each entry has a TTL; expired entries are treated as misses.
class CacheManager {
  static final CacheManager _instance = CacheManager._();
  factory CacheManager() => _instance;
  CacheManager._();

  final Map<String, _CacheEntry> _memory = {};
  SharedPreferences? _prefs;

  Future<SharedPreferences> get _sp async {
    _prefs ??= await SharedPreferences.getInstance();
    return _prefs!;
  }

  // ── Read ──────────────────────────────────────────────────────────

  /// Returns cached value or `null` if missing / expired.
  Future<T?> get<T>(String key) async {
    // 1. Memory hit
    final mem = _memory[key];
    if (mem != null && !mem.isExpired) {
      return mem.value as T;
    }

    // 2. Disk hit
    final sp = await _sp;
    final raw = sp.getString(key);
    if (raw == null) return null;

    try {
      final entry = _CacheEntry.fromJson(raw);
      if (entry.isExpired) {
        await sp.remove(key);
        return null;
      }
      // Promote to memory
      _memory[key] = entry;
      return entry.value as T;
    } catch (_) {
      await sp.remove(key);
      return null;
    }
  }

  /// Convenience: get cached JSON-decoded Map.
  Future<Map<String, dynamic>?> getMap(String key) async {
    return get<Map<String, dynamic>>(key);
  }

  /// Convenience: get cached JSON-decoded List.
  Future<List?> getList(String key) async {
    return get<List>(key);
  }

  // ── Write ─────────────────────────────────────────────────────────

  /// Stores a value with optional [ttl] (default 5 minutes).
  Future<void> put<T>(String key, T value, {Duration ttl = const Duration(minutes: 5)}) async {
    final entry = _CacheEntry(
      value: value,
      expiresAt: DateTime.now().add(ttl),
    );
    _memory[key] = entry;

    // Persist to disk for primitive + JSON-encodable types
    try {
      final sp = await _sp;
      await sp.setString(key, entry.toJson());
    } catch (_) {
      // Silently fail disk writes — memory cache still works
    }
  }

  // ── Invalidate ────────────────────────────────────────────────────

  Future<void> remove(String key) async {
    _memory.remove(key);
    final sp = await _sp;
    await sp.remove(key);
  }

  Future<void> clearAll() async {
    _memory.clear();
    final sp = await _sp;
    await sp.clear();
  }

  /// Remove all entries matching a prefix (e.g. "menu_").
  Future<void> clearPrefix(String prefix) async {
    _memory.removeWhere((k, _) => k.startsWith(prefix));
    final sp = await _sp;
    final keys = sp.getKeys().where((k) => k.startsWith(prefix));
    for (final k in keys) {
      await sp.remove(k);
    }
  }
}

// ── Internal entry model ──────────────────────────────────────────

class _CacheEntry {
  final dynamic value;
  final DateTime expiresAt;

  _CacheEntry({required this.value, required this.expiresAt});

  bool get isExpired => DateTime.now().isAfter(expiresAt);

  String toJson() => jsonEncode({
        'value': value,
        'expires_at': expiresAt.toIso8601String(),
      });

  factory _CacheEntry.fromJson(String raw) {
    final map = jsonDecode(raw) as Map<String, dynamic>;
    return _CacheEntry(
      value: map['value'],
      expiresAt: DateTime.parse(map['expires_at'] as String),
    );
  }
}
