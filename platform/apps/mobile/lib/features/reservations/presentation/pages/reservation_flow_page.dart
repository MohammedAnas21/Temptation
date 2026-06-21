import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/theme/app_theme.dart';

final availableTablesProvider = FutureProvider.family<List, Map<String, String>>((ref, p) async {
  final r = await ref.read(dioProvider).get('/tables/availability', queryParameters: p);
  return r.data as List;
});

class ReservationFlowPage extends ConsumerStatefulWidget {
  const ReservationFlowPage({super.key});
  @override
  ConsumerState<ReservationFlowPage> createState() => _ReservationFlowPageState();
}

class _ReservationFlowPageState extends ConsumerState<ReservationFlowPage> {
  int _step = 0;
  DateTime? _date;
  String? _time;
  int _guests = 2;
  String? _seatingType;
  Map? _selectedTable;
  bool _submitting = false;
  bool _confirmed = false;

  static const _steps = ['Date', 'Time', 'Guests', 'Seating', 'Table', 'Confirm'];
  static const _times = ['11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
  static const _seatings = ['Standard', 'Dining', 'Premium Sofa', 'Private Sofa'];
  static const _seatingValues = ['standard', 'dining', 'premium_sofa', 'private_sofa'];

  String get _dateStr => _date != null ? '${_date!.year}-${_date!.month.toString().padLeft(2, '0')}-${_date!.day.toString().padLeft(2, '0')}' : '';

  Future<void> _submit() async {
    setState(() => _submitting = true);
    try {
      final dio = ref.read(dioProvider);
      await dio.post('/reservations', data: {
        'branch_id': ApiConstants.branchId,
        'table_id': _selectedTable!['id'],
        'reservation_date': _dateStr,
        'reservation_time': '${_time!}:00',
        'guest_count': _guests,
        'seating_type': _seatingValues[_seatings.indexOf(_seatingType!)],
      });
      setState(() => _confirmed = true);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e'), backgroundColor: Colors.red));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_confirmed) return _ConfirmationScreen(date: _dateStr, time: _time!, guests: _guests, table: _selectedTable!, onDone: () { setState(() { _confirmed = false; _step = 0; _date = null; _time = null; _seatingType = null; _selectedTable = null; }); });

    return Scaffold(
      backgroundColor: AppColors.green900,
      appBar: AppBar(
        title: const Text('Reserve a Table'),
        backgroundColor: AppColors.green900,
        leading: _step > 0 ? IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => setState(() => _step--)) : null,
      ),
      body: Column(
        children: [
          // Step indicator
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Row(
              children: List.generate(_steps.length, (i) => Expanded(
                child: Row(children: [
                  _StepDot(index: i, current: _step, label: _steps[i]),
                  if (i < _steps.length - 1) Expanded(child: Container(height: 1, color: i < _step ? AppColors.gold500 : AppColors.green700)),
                ]),
              )),
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: [
                _stepDate(),
                _stepTime(),
                _stepGuests(),
                _stepSeating(),
                _stepTable(),
                _stepConfirm(),
              ][_step],
            ),
          ),
        ],
      ),
    );
  }

  Widget _stepDate() {
    final today = DateTime.now();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const _StepTitle('Select a Date', 'When would you like to visit?'),
        const SizedBox(height: 24),
        CalendarDatePicker(
          initialDate: _date ?? today,
          firstDate: today,
          lastDate: today.add(const Duration(days: 90)),
          onDateChanged: (d) => setState(() => _date = d),
        ),
        const Spacer(),
        _NextBtn(enabled: _date != null, onTap: () => setState(() => _step++)),
      ],
    );
  }

  Widget _stepTime() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const _StepTitle('Select a Time', 'Choose your preferred time slot'),
        const SizedBox(height: 24),
        Expanded(
          child: GridView.count(
            crossAxisCount: 3, mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 2.4,
            children: _times.map((t) => GestureDetector(
              onTap: () => setState(() => _time = t),
              child: Container(
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: _time == t ? AppColors.gold500 : AppColors.green800,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: _time == t ? AppColors.gold500 : AppColors.green700),
                ),
                child: Text(t, style: TextStyle(color: _time == t ? AppColors.green900 : AppColors.ivory100, fontWeight: FontWeight.w600)),
              ),
            )).toList(),
          ),
        ),
        _NextBtn(enabled: _time != null, onTap: () => setState(() => _step++)),
      ],
    );
  }

  Widget _stepGuests() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const _StepTitle('Number of Guests', 'How many will be dining?'),
        const Spacer(),
        Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          _CircleBtn(icon: Icons.remove, onTap: () => setState(() => _guests = (_guests - 1).clamp(1, 8))),
          const SizedBox(width: 32),
          Text('$_guests', style: const TextStyle(color: AppColors.ivory50, fontSize: 56, fontFamily: 'Fraunces', fontWeight: FontWeight.w900)),
          const SizedBox(width: 32),
          _CircleBtn(icon: Icons.add, onTap: () => setState(() => _guests = (_guests + 1).clamp(1, 8))),
        ]),
        const SizedBox(height: 12),
        const Center(child: Text('guests', style: TextStyle(color: AppColors.gold500, fontSize: 16))),
        const Spacer(),
        _NextBtn(enabled: true, onTap: () => setState(() => _step++)),
      ],
    );
  }

  Widget _stepSeating() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const _StepTitle('Seating Preference', 'Select your preferred seating type'),
        const SizedBox(height: 24),
        Expanded(
          child: GridView.count(
            crossAxisCount: 2, mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 1.8,
            children: _seatings.map((s) => GestureDetector(
              onTap: () => setState(() => _seatingType = s),
              child: Container(
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: _seatingType == s ? AppColors.gold500 : AppColors.green800,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: _seatingType == s ? AppColors.gold500 : AppColors.green700),
                ),
                child: Text(s, textAlign: TextAlign.center, style: TextStyle(color: _seatingType == s ? AppColors.green900 : AppColors.ivory100, fontWeight: FontWeight.w600)),
              ),
            )).toList(),
          ),
        ),
        _NextBtn(enabled: _seatingType != null, onTap: () => setState(() => _step++)),
      ],
    );
  }

  Widget _stepTable() {
    final params = {'branch_id': ApiConstants.branchId, 'reservation_date': _dateStr, 'reservation_time': '${_time!}:00', 'guests': '$_guests'};
    final tablesAsync = ref.watch(availableTablesProvider(params));
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const _StepTitle('Select a Table', 'Available tables for your slot'),
        const SizedBox(height: 16),
        Expanded(child: tablesAsync.when(
          loading: () => const Center(child: CircularProgressIndicator(color: AppColors.gold300)),
          error: (e, _) => Center(child: Text('Error: $e', style: const TextStyle(color: Colors.red))),
          data: (tables) => tables.isEmpty
              ? const Center(child: Text('No tables available for this slot.\nTry a different time.', textAlign: TextAlign.center, style: TextStyle(color: AppColors.gold500)))
              : GridView.count(
                  crossAxisCount: 3, mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 1.1,
                  children: tables.map<Widget>((t) => GestureDetector(
                    onTap: () => setState(() => _selectedTable = t),
                    child: Container(
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: _selectedTable?['id'] == t['id'] ? AppColors.gold500 : AppColors.green800,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: _selectedTable?['id'] == t['id'] ? AppColors.gold500 : AppColors.green700),
                      ),
                      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                        Text('T${t["table_number"]}', style: TextStyle(color: _selectedTable?['id'] == t['id'] ? AppColors.green900 : AppColors.ivory50, fontWeight: FontWeight.w700, fontSize: 18)),
                        Text('${t["capacity"]} guests', style: TextStyle(color: _selectedTable?['id'] == t['id'] ? AppColors.green900 : AppColors.gold500, fontSize: 11)),
                      ]),
                    ),
                  )).toList(),
                ),
        )),
        _NextBtn(enabled: _selectedTable != null, onTap: () => setState(() => _step++)),
      ],
    );
  }

  Widget _stepConfirm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const _StepTitle('Confirm Reservation', 'Review your booking details'),
        const SizedBox(height: 24),
        _DetailCard([
          ['Date', _dateStr],
          ['Time', _time ?? ''],
          ['Guests', '$_guests'],
          ['Seating', _seatingType ?? ''],
          ['Table', 'Table ${_selectedTable?["table_number"] ?? ""}'],
          ['Advance Deposit', '₹200'],
        ]),
        const Spacer(),
        ElevatedButton(
          onPressed: _submitting ? null : _submit,
          style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 54)),
          child: _submitting
              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.green900))
              : const Text('Confirm & Pay ₹200'),
        ),
      ],
    );
  }
}

class _ConfirmationScreen extends StatelessWidget {
  final String date, time;
  final int guests;
  final Map table;
  final VoidCallback onDone;
  const _ConfirmationScreen({required this.date, required this.time, required this.guests, required this.table, required this.onDone});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.green900,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 80, height: 80,
                decoration: BoxDecoration(color: Colors.green.withOpacity(0.15), shape: BoxShape.circle, border: Border.all(color: Colors.green, width: 2)),
                child: const Icon(Icons.check_rounded, color: Colors.green, size: 44),
              ),
              const SizedBox(height: 24),
              const Text('Reservation Confirmed!', style: TextStyle(color: AppColors.ivory50, fontFamily: 'Fraunces', fontWeight: FontWeight.w900, fontSize: 28), textAlign: TextAlign.center),
              const SizedBox(height: 12),
              Text('Table for $guests on $date at $time.\nA WhatsApp confirmation has been sent.', style: const TextStyle(color: AppColors.gold500, fontSize: 14, height: 1.6), textAlign: TextAlign.center),
              const SizedBox(height: 32),
              ElevatedButton(onPressed: onDone, style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 50)), child: const Text('Back to Home')),
            ],
          ),
        ),
      ),
    );
  }
}

class _StepTitle extends StatelessWidget {
  final String title, sub;
  const _StepTitle(this.title, this.sub);
  @override
  Widget build(BuildContext context) => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
    Text(title, style: const TextStyle(color: AppColors.ivory50, fontFamily: 'Fraunces', fontWeight: FontWeight.w900, fontSize: 24)),
    const SizedBox(height: 4),
    Text(sub, style: const TextStyle(color: AppColors.gold500, fontSize: 13)),
  ]);
}

class _StepDot extends StatelessWidget {
  final int index, current;
  final String label;
  const _StepDot({required this.index, required this.current, required this.label});
  @override
  Widget build(BuildContext context) {
    final done = index < current;
    final active = index == current;
    return Container(
      width: 22, height: 22,
      decoration: BoxDecoration(
        color: done || active ? AppColors.gold500 : AppColors.green800,
        shape: BoxShape.circle,
        border: Border.all(color: done || active ? AppColors.gold500 : AppColors.green700),
      ),
      child: done ? const Icon(Icons.check, size: 12, color: AppColors.green900) : Center(child: Text('${index + 1}', style: TextStyle(color: active ? AppColors.green900 : AppColors.gold500, fontSize: 10, fontWeight: FontWeight.w700))),
    );
  }
}

class _NextBtn extends StatelessWidget {
  final bool enabled;
  final VoidCallback onTap;
  const _NextBtn({required this.enabled, required this.onTap});
  @override
  Widget build(BuildContext context) => ElevatedButton(
    onPressed: enabled ? onTap : null,
    style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 52)),
    child: const Text('Continue'),
  );
}

class _CircleBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _CircleBtn({required this.icon, required this.onTap});
  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Container(
      width: 52, height: 52,
      decoration: BoxDecoration(color: AppColors.green800, shape: BoxShape.circle, border: Border.all(color: AppColors.green700)),
      child: Icon(icon, color: AppColors.gold400),
    ),
  );
}

class _DetailCard extends StatelessWidget {
  final List<List<String>> rows;
  const _DetailCard(this.rows);
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(20),
    decoration: BoxDecoration(color: AppColors.green800, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.green700)),
    child: Column(children: rows.map((r) => Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text(r[0], style: const TextStyle(color: AppColors.gold500, fontSize: 13)),
        Text(r[1], style: const TextStyle(color: AppColors.ivory50, fontWeight: FontWeight.w600, fontSize: 13)),
      ]),
    )).toList()),
  );
}
