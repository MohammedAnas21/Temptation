import 'package:flutter_riverpod/flutter_riverpod.dart';

class CartItem {
  final String menuItemId;
  final String name;
  final double price;
  final bool isVeg;
  int quantity;
  Map<String, dynamic>? addons;

  CartItem({
    required this.menuItemId,
    required this.name,
    required this.price,
    required this.isVeg,
    this.quantity = 1,
    this.addons,
  });

  double get lineTotal => price * quantity;
}

class CartNotifier extends StateNotifier<List<CartItem>> {
  CartNotifier() : super([]);

  void addItem(CartItem item) {
    final idx = state.indexWhere((i) => i.menuItemId == item.menuItemId);
    if (idx >= 0) {
      final updated = [...state];
      updated[idx].quantity++;
      state = updated;
    } else {
      state = [...state, item];
    }
  }

  void removeItem(String menuItemId) {
    state = state.where((i) => i.menuItemId != menuItemId).toList();
  }

  void updateQuantity(String menuItemId, int qty) {
    if (qty <= 0) { removeItem(menuItemId); return; }
    state = state.map((i) => i.menuItemId == menuItemId ? (i..quantity = qty) : i).toList();
  }

  void clear() => state = [];

  double get subtotal => state.fold(0, (sum, i) => sum + i.lineTotal);
  int get itemCount   => state.fold(0, (sum, i) => sum + i.quantity);
}

final cartProvider = StateNotifierProvider<CartNotifier, List<CartItem>>(
  (_) => CartNotifier(),
);

final cartSubtotalProvider = Provider<double>((ref) {
  final items = ref.watch(cartProvider);
  return items.fold(0, (s, i) => s + i.lineTotal);
});

final cartCountProvider = Provider<int>((ref) {
  final items = ref.watch(cartProvider);
  return items.fold(0, (s, i) => s + i.quantity);
});
