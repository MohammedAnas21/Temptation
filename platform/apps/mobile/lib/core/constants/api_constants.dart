class ApiConstants {
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:8000/api/v1',
  );

  static const String branchId = String.fromEnvironment(
    'BRANCH_ID',
    defaultValue: '11111111-1111-1111-1111-111111111111',
  );

  // Auth
  static const String authVerify    = '/auth/verify';
  static const String authMe        = '/auth/me';

  // Menu
  static const String menuCategories = '/menu/categories';
  static const String menuItems      = '/menu/items';

  // Orders
  static const String orders = '/orders';

  // Reservations
  static const String reservations = '/reservations';
  static const String tableAvailability = '/tables/availability';
  static const String tables = '/tables';

  // Loyalty
  static const String loyaltyMe = '/loyalty/me';
  static const String loyaltyTransactions = '/loyalty/transactions';
  static const String loyaltyRedeem = '/loyalty/redeem';

  // Offers
  static const String offers  = '/offers';
  static const String coupons = '/offers/coupons/validate';
}
